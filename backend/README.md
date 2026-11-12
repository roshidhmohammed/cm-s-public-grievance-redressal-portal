# Public Grievance Redressal Portal API

Express 5, MongoDB/Mongoose, and native ES modules. Start with `npm run dev`; the API listens on port 8080 by default.

## Configuration and first CMO account

Copy `.env.example` to `.env`, configure MongoDB and a unique JWT secret of at least 32 characters, then configure `CMO_ADMIN_EMAIL` and a strong `CMO_ADMIN_PASSWORD` (at least 12 characters). Run `npm run seed` to create the initial CMO account and seed the sample departments. Public registration always creates citizen accounts; it cannot assign privileged roles.

After deploying the split grievance schema to a database that contains existing records, back up the database and run `npm run migrate:grievance-relations` once to move embedded histories, assignments, attachments, and action reports into their dedicated collections.

Access tokens are HttpOnly cookies named `citizenAccessToken`, `cmoAccessToken`, and `departmentAccessToken` for citizens, CMO users, and department officers, respectively. Each portal keeps its own session cookie; signing in or out of one portal does not affect the others. Authenticated requests from the frontend include the `X-Portal-Role` header so the API selects the matching cookie. Requests must use credentials. For a cross-site production deployment, set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`, and set `CLIENT_ORIGIN` to the exact frontend origin. CORS is applied globally by the Express app to control browser access.

On Vercel, configure `MONGODB_URI` in the project's environment variables for every deployment environment. Database-backed API routes establish or reuse a cached Mongoose connection before querying. Check `/api/health/ready` after deployment; if it reports `not_ready`, verify the URI, database credentials, and that your MongoDB provider permits connections from the Vercel deployment.

Attachments are limited to 10 MB per file and five files per submission/report and are only downloadable through an authenticated grievance attachment endpoint. Local development stores them under `uploads/`; Vercel uses its writable temporary directory, which is ephemeral and not shared across serverless instances. Configure `UPLOAD_DIRECTORY` only for a writable persistent disk. For reliable production uploads and downloads on Vercel, use persistent object storage rather than the temporary filesystem.

## API

All JSON responses use `{ "success": true, "data": ... }` on success.

Request bodies, query filters, route parameters, and uploaded-file lists are validated with Zod before reaching controllers. Invalid input returns HTTP 400 with a `Validation failed` response and field-specific issues.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` or `/api/health` | Public | Liveness check |
| GET | `/health/live` or `/api/health/live` | Public | Liveness check |
| GET | `/health/ready` or `/api/health/ready` | Public | Readiness check, including MongoDB connection state |
| POST | `/api/auth/register` | Public | Register a citizen |
| POST | `/api/auth/login` | Public | Login and set access cookie |
| POST | `/api/auth/logout` | Authenticated | Clear the selected portal's access cookie |
| GET | `/api/auth/me` | Authenticated | Current account |
| POST | `/api/auth/officers` | CMO | Create a department officer, optionally unassigned |
| POST | `/api/departments/officers` | CMO | Create a department officer, optionally assign an active department |
| GET | `/api/departments` | Public | Active departments |
| GET | `/api/departments/:id/officers` | CMO | Officers eligible for assignment |
| GET | `/api/departments/officers/unassigned` | CMO | List active officers not assigned to a department |
| POST | `/api/departments` | CMO | Create a department and optionally assign an unassigned `officerId` |
| PATCH | `/api/departments/:id/officers` | CMO | Assign an unassigned officer to a department |
| POST | `/api/grievances` | Citizen | Submit multipart grievance and optional `attachments` |
| GET | `/api/grievances/track/:referenceNumber` | Citizen owner | Track a grievance submitted from the signed-in account |
| GET | `/api/grievances` | Authenticated | Own, department, or all grievances (role-scoped); supports status, district, category, priority, page, limit |
| GET | `/api/grievances/:id` | Authorized | Grievance details |
| POST | `/api/department-assignments/:grievanceId` | CMO | Assign department/officer, priority, and optional due date |
| GET | `/api/department-assignments/:grievanceId` | CMO | View assignment history |
| POST | `/api/grievances/:id/escalate` | CMO | Escalate an open grievance |
| PATCH | `/api/grievances/:id/review` | CMO | Resolve an in-progress grievance after adding a public CMO remark |
| POST | `/api/grievance-remarks/:grievanceId` | CMO | Add a public or internal remark to an in-progress grievance |
| GET | `/api/grievance-history/:grievanceId` | Authorized | View status history and the `assignedBy` user |
| POST | `/api/action-taken-reports/:grievanceId` | Department officer | Submit an action report and optional `attachments`; submission moves `UNDER_REVIEW` to `IN_PROGRESS` |
| POST | `/api/citizen-feedback/:grievanceId` | Grievance owner | Submit one 1-5 rating after CMO resolution and a public CMO remark |
| POST | `/api/attachments/:grievanceId` | Grievance owner/CMO/assigned department | Upload supplemental multipart `attachments` |
| GET | `/api/attachments/:grievanceId/:filename` | Grievance owner/CMO/assigned department | Download a grievance or action-report attachment |
| GET | `/api/dashboard/cmo` | CMO | Counts and district/department/status statistics |
| GET | `/api/dashboard/department` | Department officer | Department workload counts |
| POST | `/api/contact-enquiries` | Public | Save a contact enquiry |
| GET | `/api/contact-enquiries` | CMO | List enquiries |
| PATCH | `/api/contact-enquiries/:id` | CMO | Mark an enquiry reviewed or closed |

Grievance states follow `SUBMITTED` → `UNDER_REVIEW` → `IN_PROGRESS` → `RESOLVED` (or `REJECTED`). The CMO assigns only submitted grievances. Department officers submit an action-taken report to move an `UNDER_REVIEW` grievance to `IN_PROGRESS`; further reports may be submitted while it remains `IN_PROGRESS`. The CMO then adds a public remark and resolution to mark it `RESOLVED`. Citizens can track only grievances they own, and can submit feedback only after resolution and a public CMO remark.

Status history records contain the status and the user who assigned it (`assignedBy`). Department assignment records, uploaded attachment metadata, and action-taken reports are stored in their own module collections instead of embedded grievance arrays. Each action-taken report records its `departmentId`. Department officers can only access cases assigned to their department's current assignment.
