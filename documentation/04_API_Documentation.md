# API Documentation

This guide describes the HTTP API implemented by the backend. Examples use `http://localhost:8080` as the backend origin. In production, replace it with the deployed API origin.

## Before you start

- API routes are under `/api`, except the health routes, which are available under both `/health` and `/api/health`.
- JSON endpoints expect `Content-Type: application/json`. Grievance and attachment uploads use `multipart/form-data`.
- Protected endpoints require a signed-in account with the role shown below. The API sets an HttpOnly role-specific cookie at sign-in: `citizenAccessToken`, `cmoAccessToken`, or `departmentAccessToken`.
- Browser clients should send requests with credentials enabled. The frontend also sends `X-Portal-Role: citizen`, `X-Portal-Role: cmo`, or `X-Portal-Role: department_officer` to select the matching cookie. API clients may instead send `Authorization: Bearer <token>`.
- Object ID parameters must be 24-character MongoDB ObjectId strings.
- Unless an endpoint says otherwise, a successful response uses `{ "success": true, "data": ... }`. Errors use `{ "success": false, "message": "..." }`. Invalid inputs return HTTP 400 and include field-specific `errors`.
- Dates are ISO 8601 strings in JSON responses. Do not send passwords in any request other than registration or sign-in.

### Example error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email" }
  ]
}
```

## Endpoint directory

### Health

| Method and path | Access | Parameters / request |
|---|---|---|
| `GET /health`, `GET /health/live`, `GET /api/health`, `GET /api/health/live` | Public | None. Liveness check. |
| `GET /health/ready`, `GET /api/health/ready` | Public | None. Checks MongoDB readiness. |

Liveness example:

```json
{ "success": true, "status": "alive" }
```

Readiness success:

```json
{
  "success": true,
  "status": "ready",
  "dependencies": { "database": "connected" }
}
```

If the database is unavailable, readiness returns HTTP 503 with `success: false` and `status: "not_ready"`.

### Authentication and accounts

| Method and path | Access | Parameters / request |
|---|---|---|
| `POST /api/auth/register` | Public; creates a citizen | JSON: `fullName` (2–120 chars), `email`, `mobile`, `password` (8–128 chars). |
| `POST /api/auth/login` | Public | JSON: `email`, `password`. |
| `POST /api/auth/logout` | Signed in | No body. Clears the signed-in role's cookie. |
| `GET /api/auth/me` | Signed in | No parameters. |
| `POST /api/auth/officers` | CMO | JSON: `fullName`, `email`, `mobile`, `password` (12–128 chars), optional `department` (department ObjectId). Creates an officer. |
| `POST /api/departments/officers` | CMO | Same request as above; creates an officer, optionally assigned to an active department. |

Registration and sign-in set the role-specific HttpOnly cookie. Do not expect the access token in the JSON response.

Registration request:

```json
{
  "fullName": "Anu Nair",
  "email": "anu@example.com",
  "mobile": "+91 9876543210",
  "password": "secure-password"
}
```

Registration, sign-in, and current-account response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6650a1b2c3d4e5f678901234",
      "fullName": "Anu Nair",
      "email": "anu@example.com",
      "mobile": "+91 9876543210",
      "role": "citizen",
      "department": null
    }
  }
}
```

Logout response:

```json
{ "success": true, "message": "Signed out successfully." }
```

### Departments and department officers

| Method and path | Access | Parameters / request |
|---|---|---|
| `GET /api/departments` | Public | None. Lists active departments. |
| `GET /api/departments/officers/unassigned` | CMO | None. Lists active department officers not yet assigned to a department. |
| `GET /api/departments/:id/officers` | CMO | Path: `id` is a department ObjectId. |
| `POST /api/departments/officers` | CMO | JSON officer fields described under Authentication and accounts. |
| `POST /api/departments` | CMO | JSON: `name` (2–120 chars), `description` (10–500 chars), optional `officerId` (unassigned active officer ObjectId). |
| `PATCH /api/departments/:id/officers` | CMO | Path: `id` is a department ObjectId. JSON: `officerId` (unassigned active officer ObjectId). |

Create department request:

```json
{
  "name": "Public Works Department",
  "description": "Responsible for public infrastructure and works.",
  "officerId": "6650a1b2c3d4e5f678901234"
}
```

The `officerId` is optional. A successful create response contains `data.department` and `data.officer` (which is `null` if no officer was supplied). Officer listing responses contain `data.officers`; department listing responses contain `data.departments`. These resources include Mongoose timestamps.

### Grievances

| Method and path | Access | Parameters / request |
|---|---|---|
| `POST /api/grievances` | Citizen | Multipart form fields: `district`, `category`, `subject` (5–200 chars), `description` (20–10,000 chars); optional file parts named `attachments` (up to 5). |
| `GET /api/grievances` | Signed in; results scoped to the user's role | Optional query parameters: `district`, `category`, `status`, `priority`, `page` (integer, minimum 1; default 1), `limit` (integer 1–100; default 20). |
| `GET /api/grievances/track/:referenceNumber` | Citizen, own grievance only | Path: `referenceNumber`, format `GRV-YYYYMMDD-16_HEX_CHARACTERS`. |
| `GET /api/grievances/:id` | Signed in; owner, CMO, or assigned department | Path: `id` is a grievance ObjectId. |
| `POST /api/grievances/:id/escalate` | CMO | Path: `id` is a grievance ObjectId. No body. Closed grievances cannot be escalated. |
| `PATCH /api/grievances/:id/review` | CMO | Path: `id` is a grievance ObjectId. JSON: `decision` must be `"resolve"` and `resolution` must be 3–5,000 characters. |
| `POST /api/ai-grievance/analyze` | Citizen | JSON: `district` and `description` (20–5,000 characters). Returns advisory summary, department/category/priority suggestions, confidence, reasoning, and possible duplicate complaints. Requires `GOOGLE_GEMINI_API_KEY`. |
| `PATCH /api/ai-grievance/:analysisId/review` | Citizen analysis owner | Path: `analysisId` is an AI analysis ObjectId. JSON decision: `ACCEPTED`, `MODIFIED`, or `REJECTED`; `MODIFIED` also requires a valid department, AI category, and priority. |
| `GET /api/ai-grievance/grievances/:grievanceId` | CMO | Path: `grievanceId` is a grievance ObjectId. Returns the latest matching AI analysis, or `data.analysis: null` if none is available. |

Allowed grievance districts are the 14 Kerala districts. Allowed categories are `Infrastructure`, `Health`, `Education`, `Public Services`, `Water & Sanitation`, `Transport`, and `Other`. Status values are `SUBMITTED`, `UNDER_REVIEW`, `IN_PROGRESS`, `RESOLVED`, and `REJECTED`; priorities are `Low`, `Medium`, and `High`.

Example submission using `curl`:

```bash
curl -X POST http://localhost:8080/api/grievances \
  -b cookies.txt \
  -F "district=Ernakulam" \
  -F "category=Infrastructure" \
  -F "subject=Damaged road near the school" \
  -F "description=The road surface is damaged and needs inspection and repair." \
  -F "attachments=@road-photo.jpg"
```

The API also accepts a submission without any attachments. Uploads allow JPEG, PNG, WebP, PDF, and Word documents; each file is limited to 10 MB.

Successful submission, detail, and tracking responses return a grievance in `data`. A grievance view includes its `id`, `referenceNumber`, `district`, `category`, `subject`, `description`, `status`, `submittedAt`, `priority`, `assignedDepartment`, `resolution`, `remarks`, `statusHistory`, `attachments`, and `actionReports`. Citizen views also include `feedbackSubmitted`. Depending on the viewer's role, additional fields may include `citizen`, `assignedOfficer`, `assignmentHistory`, `dueAt`, and `escalatedAt`. Internal remarks are only included for CMO users.

Example grievance response (abbreviated):

```json
{
  "success": true,
  "data": {
    "id": "6650a1b2c3d4e5f678901234",
    "referenceNumber": "GRV-20260520-0123456789ABCDEF",
    "district": "Ernakulam",
    "category": "Infrastructure",
    "subject": "Damaged road near the school",
    "description": "The road surface is damaged and needs inspection and repair.",
    "status": "SUBMITTED",
    "submittedAt": "2026-05-20T10:30:00.000Z",
    "priority": "Medium",
    "assignedDepartment": "CMO Review",
    "resolution": "",
    "remarks": [],
    "statusHistory": [
      { "status": "SUBMITTED", "date": "2026-05-20T10:30:00.000Z", "assignedBy": null }
    ],
    "attachments": [
      {
        "id": "6650a1b2c3d4e5f678901235",
        "filename": "stored-file-id.jpg",
        "originalName": "road-photo.jpg",
        "mimeType": "image/jpeg",
        "size": 123456
      }
    ],
    "actionReports": [],
    "feedbackSubmitted": false
  }
}
```

The grievance list returns `data.items`, `data.page`, `data.limit`, and `data.total`.

Resolve request:

```json
{
  "decision": "resolve",
  "resolution": "The damaged section was inspected and repaired."
}
```

A grievance can be resolved only while `IN_PROGRESS` and after a public CMO remark has been recorded. The API adds the `RESOLVED` status-history entry.

### Assignment, history, remarks, and action reports

| Method and path | Access | Parameters / request |
|---|---|---|
| `POST /api/department-assignments/:grievanceId` | CMO | Path: grievance ObjectId. JSON: `department` and `officer` ObjectIds (both required; officer must be active in the department), optional `priority` (`Low`, `Medium`, `High`; defaults to `Medium`), optional future `dueAt` date. |
| `GET /api/department-assignments/:grievanceId` | CMO | Path: grievance ObjectId. Returns assignment history. |
| `GET /api/grievance-history/:grievanceId` | Signed in; grievance access rules apply | Path: grievance ObjectId. |
| `POST /api/grievance-remarks/:grievanceId` | CMO | Path: grievance ObjectId. JSON: `content` (3–2,000 chars), optional `visibility` (`public` or `internal`; defaults to `public`). |
| `POST /api/action-taken-reports/:grievanceId` | Department officer assigned to the grievance's department | Multipart fields: `details` (10–5,000 chars); optional file parts named `attachments` (up to 5). |

Assignment request:

```json
{
  "department": "6650a1b2c3d4e5f678901240",
  "officer": "6650a1b2c3d4e5f678901241",
  "priority": "High",
  "dueAt": "2026-06-05T00:00:00.000Z"
}
```

Only a `SUBMITTED` grievance can be assigned. Assignment moves it to `UNDER_REVIEW`. The response contains `data.grievance` and an `data.assignment` object with the assignment `id`, `department`, `officer`, and `dueAt`. Assignment history is returned as `data.assignments`; grievance status history is returned as `data.history`.

Remark request:

```json
{
  "content": "The department has begun its investigation.",
  "visibility": "public"
}
```

Remark creation returns `data` with the new remark's `id`, `content`, `authorRole`, `visibility`, and `createdAt`. Remarks can be added while the grievance is `IN_PROGRESS`.

Action report example:

```bash
curl -X POST http://localhost:8080/api/action-taken-reports/6650a1b2c3d4e5f678901234 \
  -b cookies.txt \
  -F "details=The site was inspected and the damaged road surface was repaired." \
  -F "attachments=@repair-report.pdf"
```

Action report creation returns `data.reportId` and the updated `data.grievance`. The first report moves the grievance from `UNDER_REVIEW` to `IN_PROGRESS`; further reports may be submitted while it remains `IN_PROGRESS`.

### Attachments

| Method and path | Access | Parameters / request |
|---|---|---|
| `POST /api/attachments/:grievanceId` | Grievance owner, CMO, or assigned department | Multipart file parts named `attachments` (1–5 files). Uploads supplemental attachments. |
| `GET /api/attachments/:grievanceId/:filename` | Grievance owner, CMO, or assigned department | Path: grievance ObjectId and stored `filename` (1–255 characters; letters, numbers, `.`, `_`, `-`). Returns the file stream, not JSON. |

Supplemental upload returns `data.attachments`, an array containing each file's `id`, `filename`, `originalName`, `mimeType`, and `size`. The file type and 10 MB per-file limit are the same as grievance uploads.

### Citizen feedback

| Method and path | Access | Parameters / request |
|---|---|---|
| `POST /api/citizen-feedback/:grievanceId` | Citizen who owns the grievance | Path: grievance ObjectId. JSON: `rating` integer 1–5, optional `comment` (up to 2,000 chars; defaults to empty). |

Feedback is accepted once per grievance, after resolution and after a public CMO remark exists.

```json
{
  "rating": 5,
  "comment": "The issue was addressed. Thank you."
}
```

The response contains `data.id`, `data.grievanceId`, `data.rating`, `data.comment`, and `data.submittedAt`.

### Dashboards

| Method and path | Access | Parameters / request |
|---|---|---|
| `GET /api/dashboard/cmo` | CMO | No parameters. |
| `GET /api/dashboard/department` | Department officer | No parameters. |

The CMO dashboard returns `totalGrievances`, `pendingGrievances`, `resolvedGrievances`, `overdueGrievances`, `districtStats`, `departmentStats`, and `statusDistribution`. The department dashboard returns `assignedGrievances`, `underReview`, `inProgress`, and `resolvedGrievances`.

### Contact enquiries

| Method and path | Access | Parameters / request |
|---|---|---|
| `POST /api/contact-enquiries` | Public | JSON: `name` (2–120 chars), `email`, `subject` (3–200 chars), `message` (10–5,000 chars). |
| `GET /api/contact-enquiries` | CMO | Optional query: `page` (integer ≥1; default 1), `limit` (integer 1–100; default 20). |
| `PATCH /api/contact-enquiries/:id` | CMO | Path: enquiry ObjectId. JSON: `status` is `reviewed` or `closed`. |

Create request:

```json
{
  "name": "Anu Nair",
  "email": "anu@example.com",
  "subject": "Question about a grievance",
  "message": "Where can I find the status of a grievance I submitted?"
}
```

Creation returns `data.enquiryId`. Listing returns `data.enquiries`, `data.page`, `data.limit`, and `data.total`. Updating returns `data.enquiry`.

### AI grievance assistant

The citizen can request advisory analysis while drafting a grievance. This endpoint requires `GOOGLE_GEMINI_API_KEY` on the backend. The AI does not submit a grievance or make an administrative decision.

```json
{
  "district": "Ernakulam",
  "description": "A damaged road near the local school has caused difficulty for residents and requires inspection."
}
```

`POST /api/ai-grievance/analyze` returns an `analysisId`, a concise `summary`, `suggestedDepartment`, `suggestedCategory`, `suggestedPriority`, `confidence` (0–1), `reasoning`, and duplicate warning/candidate fields. The citizen may record a review decision with `PATCH /api/ai-grievance/:analysisId/review`.

The CMO-only endpoint `GET /api/ai-grievance/grievances/:grievanceId` returns a `data.analysis` object containing those recommendations and the review decision. If no analysis matches the grievance's citizen, district, and trimmed-description hash, the response is successful with `data.analysis: null`.

```json
{
  "success": true,
  "data": {
    "analysis": {
      "analysisId": "6650a1b2c3d4e5f678901234",
      "summary": "Residents report a damaged road near a school.",
      "suggestedDepartment": {
        "id": "6650a1b2c3d4e5f678901240",
        "name": "Public Works Department",
        "code": "public-works"
      },
      "suggestedCategory": "ROADS",
      "suggestedPriority": "MEDIUM",
      "confidence": 0.84,
      "reasoning": "The report concerns road damage and community access.",
      "duplicateConcern": false,
      "duplicateReason": "",
      "duplicateCandidates": [],
      "reviewDecision": "ACCEPTED",
      "reviewedValues": null,
      "modelProvider": "GOOGLE_GEMINI",
      "modelName": "gemini-2.0-flash",
      "generatedAt": "2026-05-20T10:30:00.000Z",
      "reviewedAt": "2026-05-20T10:32:00.000Z"
    }
  }
}
```

## Grievance workflow at a glance

1. A citizen submits a grievance; its status is `SUBMITTED`.
2. CMO assigns it to a department (and optionally an officer); it becomes `UNDER_REVIEW`.
3. A department officer submits an action-taken report; the grievance moves to `IN_PROGRESS`.
4. CMO adds a public remark and records the resolution; status becomes `RESOLVED`.
5. The citizen may submit one feedback rating. A grievance may instead be rejected during review.

All grievance and attachment access is role-checked. A citizen can only access their own grievances, and department officers are limited to grievances assigned to their department.