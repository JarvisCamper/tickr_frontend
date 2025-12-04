**Connecting Next.js frontend (this repo) to a deployed Django backend on Vercel**

Summary
- **Env var**: `NEXT_PUBLIC_API_URL` — point this to your backend base URL (example: `https://your-backend.vercel.app/api` or `https://api.example.com`).
- **Auth**: JWT recommended for SPAs; session cookies possible but require CSRF and cookie settings.
- **Helper**: use the provided `lib/api.ts` which centralizes headers/credentials.
- **Deploy**: after updating env vars in Vercel, trigger a redeploy.

1) Set environment variable in Vercel

- Go to your project on Vercel → Settings → Environment Variables.
- Add a variable named `NEXT_PUBLIC_API_URL` and set its value to your backend base URL (include `https://`).
- Set the Environment (Preview/Production) as needed and save.
- After changing or adding the variable, redeploy your frontend so the value is available at build time.

Why `NEXT_PUBLIC_API_URL`?
- Variables prefixed with `NEXT_PUBLIC_` are exposed to client-side code. The constant `API_BASE_URL` in `constant/apiendpoints.ts` reads this env var at build time.

2) Choose an auth flow

- JWT in Authorization header (recommended):
  - Backend returns JWT access (and refresh) tokens.
  - Frontend stores tokens either in memory/localStorage or cookies (this repo currently uses non-HttpOnly cookies via `js-cookie`).
  - Use the Authorization header: `Authorization: Bearer <access_token>`.
  - Advantages: easy to use in SPAs, straightforward to attach header from central helper.

- Session cookies (Django session auth):
  - More secure when using HttpOnly cookies from the backend, but requires CSRF protection.
  - When using cross-site cookies, you must set `SameSite=None; Secure` and configure Django CORS + CSRF accordingly.
  - Fetch must use `credentials: 'include'` and backend must allow credentials.

3) CORS and cookies on the Django backend

- If you use cookies or want to allow credentialed requests, make sure Django's CORS settings allow the frontend origin and credentials. Example settings (django-cors-headers):

  CORS_ALLOWED_ORIGINS = [
    'https://your-frontend.vercel.app',
  ]
  CORS_ALLOW_CREDENTIALS = True

- If using session cookies, ensure CSRF tokens are handled (send and validate CSRF token headers).

4) Using the provided fetch helper

- A centralized helper lives at `lib/api.ts`. It reads the base URL from `constant/apiendpoints.ts` (which in turn uses `NEXT_PUBLIC_API_URL`) and automatically attaches an `Authorization` header when an `access_token` cookie exists.

Examples:

```ts
import apiFetch, { apiGet, apiPost } from '@/lib/api';

// GET list
const projects = await apiGet('projects/');

// POST JSON body
const created = await apiPost('projects/', { name: 'My project' });

// If you need to include cross-site cookies (session auth):
const resp = await apiFetch('some/endpoint/', { credentials: 'include' });
```

Notes on auth integration
- This repo's `AuthProvider` uses `js-cookie` to store `access_token` and `refresh_token` (non-HttpOnly). The helper reads the cookie and attaches `Authorization: Bearer <token>` automatically.
- If you switch to HttpOnly cookies (set by backend), the cookie will still be sent by the browser on requests if you use `credentials: 'include'`. In that case, do not rely on `Authorization` header; use `credentials: 'include'` and configure Django to read the session.

5) Redeploy

- After setting `NEXT_PUBLIC_API_URL` in Vercel, redeploy the frontend (trigger from Vercel dashboard or push a commit). The value is read at build time.

6) Troubleshooting

- 401 responses: check token validity and backend logs. The helper dispatches an `auth-changed` event on 401, which `AuthProvider` listens for and will clear auth state.
- CORS errors: ensure origin and credentials are allowed on the backend.
- Wrong URL: verify `NEXT_PUBLIC_API_URL` has no trailing `/` or that `constant/apiendpoints.ts` handles slashes (it does).

If you'd like, I can:
- Add an example login function that stores tokens and calls the `AuthProvider.login` flow.
- Update any pages/components to use the new helper (e.g., timer, profile) — tell me which ones.
