# AI Grievance Assistant

## Purpose and scope

The AI grievance assistant provides decision-support suggestions while a citizen is drafting a grievance. It can summarize the description, recommend an active department, suggest a category and priority, explain its recommendations, and flag a possible duplicate. The CMO can view a matching analysis on the grievance detail page when one is available.

AI output is advisory only. It does not submit a grievance, make an official decision, assign a department, change priority, resolve a case, or replace CMO review. Users and administrators must verify suggestions against the original grievance and supporting evidence.

## Configuration

The feature uses Google's Gemini API through the backend `@google/genai` SDK. Configure these variables in `backend/.env`:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_GEMINI_API_KEY` | To generate analyses | API key used by the backend to call Gemini. Keep it private; never place it in frontend variables or commit it to source control. |
| `GEMINI_MODEL` | No | Gemini model name. If omitted, the analysis service uses `gemini-2.0-flash`. |

If `GOOGLE_GEMINI_API_KEY` is not set, the analyze endpoint returns HTTP 503 with an AI-not-configured message. No key is required for the CMO page to display an analysis already stored in MongoDB.

## Citizen analysis workflow

1. **Enter grievance details.** In the citizen submission form, the user selects a district and enters a description of at least 20 characters.
2. **Request analysis.** The citizen chooses **Analyze description**. The frontend sends the district and trimmed description to `POST /api/ai-grievance/analyze` using the signed-in citizen session.
3. **Validate and prepare context.** The backend verifies the request, checks for configured Gemini credentials, and loads active departments. If no active departments exist, analysis cannot proceed.
4. **Generate structured recommendations.** Gemini receives the district, available department list, and grievance description. The prompt requires a factual summary, an existing department code, a category, a priority, confidence, reasoning, and duplicate-warning information. The prompt treats complaint text as untrusted input and prohibits following instructions embedded in it or inventing facts.
5. **Validate the model response.** The backend parses the JSON response against a Zod schema and verifies the suggested department code against active departments. Invalid or empty model responses fail rather than being accepted as valid recommendations.
6. **Check possible duplicates.** The backend retrieves up to 100 newest non-resolved grievances in the same district and returns up to five candidates. This is a preliminary candidate list, not semantic similarity ranking. The `duplicateConcern` and `duplicateReason` are model-generated signals; candidates are not proof that a complaint is a duplicate.
7. **Persist the analysis.** The backend saves the requester, district, SHA-256 hash of the trimmed input description, provider/model, recommendations, duplicate information, and review state in the `aigrievanceanalyses` collection.
8. **Show and optionally accept suggestions.** The citizen can inspect the summary, suggested department/category/priority, confidence, reasoning, and duplicate warning. Choosing **Accept suggestions** records an `ACCEPTED` review decision and applies the suggested category to the form. It can fill an empty subject from the summary. The citizen can still edit all form values and submit the grievance independently.
9. **Submit the grievance.** The citizen reviews the form and explicitly submits it. The analysis is not the grievance and accepting the analysis does not submit the form.
10. **Show the matching analysis to CMO.** On the CMO grievance detail page, the frontend requests the CMO-only analysis lookup. The backend matches by the grievance's citizen, district, and exact SHA-256 hash of the trimmed description (or by an explicit `grievanceId` reference if present), then returns the newest matching analysis. If no match exists, the CMO page shows that no matching analysis is available.

```mermaid
sequenceDiagram
    actor Citizen
    participant Form as Citizen submission form
    participant API as Express API
    participant Gemini as Gemini API
    participant DB as MongoDB
    actor CMO
    participant Detail as CMO grievance detail

    Citizen->>Form: Enter district and description
    Form->>API: POST /api/ai-grievance/analyze
    API->>DB: Load active departments
    API->>Gemini: Request structured decision-support analysis
    Gemini-->>API: JSON recommendations
    API->>API: Validate response and department
    API->>DB: Find same-district open duplicate candidates
    API->>DB: Save analysis and input hash
    API-->>Form: Return summary, recommendations, warnings
    Citizen->>Form: Review/accept optional suggestions; edit form
    Citizen->>Form: Submit grievance
    CMO->>Detail: Open grievance details
    Detail->>API: GET /api/ai-grievance/grievances/:grievanceId
    API->>DB: Match citizen, district, and description hash
    DB-->>API: Latest matching AI analysis, if any
    API-->>Detail: Analysis or null
```

## Analysis output

The analysis response contains:

| Field | Description |
|---|---|
| `summary` | Short factual summary for review. |
| `suggestedDepartment` | ID and code of a validated active department. The CMO view also shows its name when the department record is available. |
| `suggestedCategory` | One of `ROADS`, `WATER`, `ELECTRICITY`, `HEALTH`, `EDUCATION`, `SANITATION`, `PUBLIC_SERVICES`, or `OTHER`. |
| `suggestedPriority` | `LOW`, `MEDIUM`, or `HIGH`; a high priority should be associated with an urgent safety concern, serious hazard, or significant public impact. |
| `confidence` | Model-provided numeric confidence between 0 and 1, displayed as a percentage. It is not a guarantee of accuracy. |
| `reasoning` | Concise explanation for the recommendations. |
| `duplicateConcern` / `duplicateReason` | Model-generated potential-duplicate warning and explanation. |
| `duplicateCandidates` | Up to five recent, non-resolved grievances from the same district, returned for manual comparison. |
| `reviewDecision` | `PENDING`, `ACCEPTED`, `MODIFIED`, or `REJECTED`. |
| `reviewedValues` | Values recorded when an analysis review was accepted or modified, if available. |

The CMO panel displays the summary, suggested department/category/priority, confidence, reasoning, duplicate warning and candidate references, review decision, model name, and generation time. The panel is informational; department assignment and grievance resolution remain separate CMO actions.

For local development, sign in to a CMO account and open [the requested grievance detail page](http://localhost:5173/cmo/grievances/6af6132db203909f081439e7). The route is protected and redirects signed-out users to CMO login. The AI panel displays the matching analysis when the grievance exists and a matching analysis was previously generated; otherwise it explains that no matching analysis is available.

## API endpoints

| Method and path | Access | Purpose |
|---|---|---|
| `POST /api/ai-grievance/analyze` | Authenticated citizen | Generate and persist recommendations for a district and grievance description. |
| `PATCH /api/ai-grievance/:analysisId/review` | Authenticated citizen | Record `ACCEPTED`, `MODIFIED`, or `REJECTED` for an analysis owned by that citizen. A modified review must include department, category, and priority. |
| `GET /api/ai-grievance/grievances/:grievanceId` | CMO administrator | Retrieve the latest analysis matching the grievance, or `{ "analysis": null }` when none is available. |

See the [API Documentation](04_API_Documentation.md) for request and response examples.

## Data, privacy, and limitations

- The Gemini API key is used by the backend only. The frontend never receives the key.
- Analysis records store the requester ID, district, description hash, generated output, model/provider, review decision, and optional duplicate-candidate references. The raw prompt description is not stored in the AI analysis document; the grievance itself stores its description separately.
- The CMO lookup is role-protected and matches by citizen, district, and exact hash of the trimmed description. A text or district change results in no exact match unless the analysis is explicitly linked by `grievanceId`.
- Analysis may be unavailable because it was never requested, the request failed, no active departments exist, or Gemini is not configured. The CMO can still review and process the grievance normally.
- Recommendations can be incomplete or incorrect. Confidence is not calibrated proof. Duplicate candidates are selected by recency and district, not by an implemented semantic similarity score.
- Do not use AI output as the sole basis for a decision that affects a citizen. Review the original text, evidence, and applicable government process.