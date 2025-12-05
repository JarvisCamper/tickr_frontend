import { getApiUrl } from "../../../constant/apiendpoints";

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

// Attempt to obtain JWT tokens from the backend. This helper tries common
// endpoints and payload shapes and returns normalized `{ access, refresh }`.
export async function apiLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const tryEndpoints = async (url: string, payload: object) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let body: any = null;
    try {
      body = await res.json();
    } catch (e) {
      try {
        body = await res.text();
      } catch (ee) {
        body = null;
      }
    }

    return { ok: res.ok, status: res.status, body } as const;
  };

  // 1) Try SimpleJWT token endpoint with email
  const baseTokenUrl = getApiUrl("token/");
  const loginUrl = getApiUrl("login/");

  const attempts = [
    { url: baseTokenUrl, payload: { email: credentials.email, password: credentials.password } },
    { url: baseTokenUrl, payload: { username: credentials.username, password: credentials.password } },
    { url: loginUrl, payload: { email: credentials.email, password: credentials.password } },
    { url: loginUrl, payload: { username: credentials.username, password: credentials.password } },
  ];

  let lastError: any = null;
  for (const attempt of attempts) {
    try {
      const { ok, body, status } = await tryEndpoints(attempt.url, attempt.payload);
      if (!ok) {
        lastError = { status, body };
        continue;
      }

      // body might be object or string
      if (!body) {
        throw new Error("Empty response from auth endpoint");
      }

      // Accept both shapes: { access, refresh } and { access_token, refresh_token }
      const access = body.access || body.access_token;
      const refresh = body.refresh || body.refresh_token;
      if (access && refresh) {
        return { access, refresh };
      }

      // Some APIs return nested shapes or different names - try common aliases
      if (body.token && typeof body.token === 'string') {
        return { access: body.token, refresh: '' };
      }

      lastError = { status, body };
    } catch (err) {
      lastError = err;
    }
  }

  // If we reach here, all attempts failed
  const errMsg = lastError?.body ? (typeof lastError.body === 'string' ? lastError.body : JSON.stringify(lastError.body)) : (lastError?.message || 'Login failed');
  throw new Error(errMsg);
}