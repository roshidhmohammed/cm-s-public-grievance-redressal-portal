# Setup and Testing

This guide covers local development of the CM Kerala Public Grievance Redressal Portal. The frontend and backend are separate Node.js projects, each with its own dependencies and environment file.

## Prerequisites

- A supported Node.js release and npm installed.
- MongoDB running locally or a MongoDB connection URI accessible from the backend.
- A terminal opened at the repository root.

## Backend

### Installation

In the repository root, install backend dependencies:

```bash
cd backend
npm ci
```

### Configuration

Create a local environment file from the checked-in template:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Set the values in `backend/.env`:

| Variable | Required | Purpose and local-development value |
|---|---|---|
| `NODE_ENV` | No | Runtime mode; use `development` locally. Defaults to `development`. |
| `PORT` | No | HTTP port; defaults to `8080`. Must be an integer from 1 to 65535. |
| `MONGODB_URI` | Yes | MongoDB connection string. Example: `mongodb://127.0.0.1:27017/grievance_portal`. |
| `JWT_SECRET` | Yes | Private signing secret of at least 32 characters. Replace the template value with a randomly generated secret; do not share or commit it. |
| `JWT_EXPIRES_IN` | No | Access-token lifetime; defaults to `1d`. |
| `CLIENT_ORIGIN` | No | Frontend origin setting in the environment template (typically `http://localhost:5173`). Note: the current CORS configuration in `backend/src/app.js` uses a fixed allowlist instead of this variable. Update that allowlist in the backend when using a different frontend origin. |
| `COOKIE_SAME_SITE` | No | Cookie SameSite policy; defaults to `lax` outside production and `none` in production. Accepted values: `strict`, `lax`, `none`. |
| `COOKIE_SECURE` | No | Set to `true` to require HTTPS cookies. Production mode enables secure cookies. This must be `true` when `COOKIE_SAME_SITE=none`. |
| `CMO_ADMIN_NAME` | For initial seed | Name for the first CMO administrator; defaults to `CMO Administrator`. |
| `CMO_ADMIN_EMAIL` | For initial seed | Email address for the first CMO administrator. |
| `CMO_ADMIN_PASSWORD` | For initial seed | Initial administrator password; required for seeding and must be at least 12 characters. Use a strong private value. |

Keep `.env` out of source control. The backend validates `MONGODB_URI` and `JWT_SECRET` at startup.

### Start the backend

Ensure MongoDB is available and the backend environment file is configured. From `backend/`:

```bash
npm run dev
```

The API listens on `http://localhost:8080` by default. Check liveness at `http://localhost:8080/health/live` and database readiness at `http://localhost:8080/api/health/ready`.

### Seed the initial CMO account and departments

Before using the CMO portal for the first time, set `CMO_ADMIN_EMAIL` and `CMO_ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
npm run seed
```

The script creates the initial CMO account and seeds the sample departments. It will not replace an existing CMO account's credentials. Public registration creates citizen accounts only.

### Backend tests

Run the backend's Node.js test suite from `backend/`:

```bash
npm test
```

## Frontend

### Installation

Open a second terminal at the repository root, then install the frontend dependencies:

```bash
cd frontend
npm ci
```

### Configuration

Create `frontend/.env` from the frontend example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set the frontend API URL:

| Variable | Required | Purpose and local-development value |
|---|---|---|
| `VITE_API_BASE_URL` | No | Backend origin or `/api` URL. Defaults in the frontend code to `http://localhost:8080`; the checked-in example uses `http://localhost:8080/api`. |

For example:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

The frontend adds `/api` when the configured URL does not already end with it. Vite exposes `VITE_` variables to browser code, so do not put secrets in frontend environment variables.

### Start the frontend

With the backend running, start Vite from `frontend/`:

```bash
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`). The backend must allow the frontend origin and credentialed requests for sign-in cookies to work.

### Frontend checks

From `frontend/`, run the available build/type-check and lint commands:

```bash
npm run build
npm run lint
```

To serve the production build locally after building:

```bash
npm run preview
```

## Running both applications

1. Start MongoDB.
2. Configure `backend/.env` and, if required, seed the initial administrator.
3. In one terminal, run `npm run dev` from `backend/`.
4. In another terminal, run `npm run dev` from `frontend/`.
5. Open the Vite URL and verify the backend's readiness endpoint responds with `status: "ready"`.

## Production and deployment notes

- Set backend environment variables through the hosting provider's secret/environment-variable settings; never commit production secrets.
- Set `MONGODB_URI` for each deployment environment and verify `/api/health/ready` after deployment.
- Configure the CORS allowlist in `backend/src/app.js` to include the deployed frontend's exact origin. Although `CLIENT_ORIGIN` appears in the backend environment template and configuration module, the current Express CORS setup uses a hard-coded origin list.
- For frontend and backend hosted on different HTTPS origins, use secure cookies and a compatible cross-site setting (`COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`). Browser cookie policies must allow the cookies.
- Set `VITE_API_BASE_URL` to the deployed backend origin or its `/api` URL before building the frontend.
- Attachments are limited to five files per upload and 10 MB per file. The backend's local upload directory and serverless temporary storage are not durable shared object storage. Configure persistent storage for production uploads if required.
- If deploying to a database that contains legacy embedded grievance relations, back up the database and follow the backend README's one-time `npm run migrate:grievance-relations` instructions before serving traffic with the split schema.