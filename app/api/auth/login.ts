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

// Clean + fully compatible login helper
export async function apiLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const tokenUrl = getApiUrl("token/");
  const loginUrl = getApiUrl("login/");

  const payloadEmail = {
    email: credentials.email,
    password: credentials.password,
  };

  const payloadUsername = {
    username: credentials.username,
    password: credentials.password,
  };

  // Shared request function
  const send = async (url: string, payload: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let body: any = null;
    try {
      body = await res.json();
    } catch (_) {
      body = {};
    }

    return { ok: res.ok, status: res.status, body };
  };

  const attempts = [
    { url: tokenUrl, payload: payloadEmail },
    { url: tokenUrl, payload: payloadUsername },
    { url: loginUrl, payload: payloadEmail },
    { url: loginUrl, payload: payloadUsername },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    const { ok, status, body } = await send(attempt.url, attempt.payload);

    if (!ok) {
      lastError = { status, body };
      continue;
    }

    if (!body) continue;

    const access = body.access || body.access_token;
    const refresh = body.refresh || body.refresh_token;

    if (access && refresh) {
      return { access, refresh };
    }

    // If some API returns a single token (fallback)
    if (body.token) {
      return { access: body.token, refresh: "" };
    }

    lastError = { status, body };
  }

  const msg =
    typeof lastError?.body === "string"
      ? lastError.body
      : JSON.stringify(lastError?.body || "Login failed");

  const err = new Error(msg);
  (err as any).details = lastError;
  throw err;
}
