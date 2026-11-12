# CM Kerala Public Grievance Redressal Portal

React, TypeScript, and Vite frontend for the grievance redressal API.

## Run locally

1. Install frontend dependencies with `npm install`.
2. Copy `.env.example` to `.env`. The default API URL is `http://localhost:8080/api`.
3. Start the backend on port `8080`, then run `npm run dev`.

The backend must allow the frontend origin (`http://localhost:5173`) in `CLIENT_ORIGIN` and allow credentialed CORS requests. Authentication uses the API's role-specific HttpOnly access-token cookie; the frontend does not store access tokens in browser storage.

To use a different backend, set `VITE_API_BASE_URL` in `.env` to either the backend root (for example, `http://localhost:8080`) or its `/api` URL.

## Available commands

- `npm run dev` — start the Vite development server.
- `npm run build` — type-check and create a production build.
- `npm run lint` — run Oxlint.
- `npm run preview` — preview the production build.
