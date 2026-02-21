import { getApiUrl } from '../../../constant/apiendpoints';

// ============ Types ============
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  access?: string;
  refresh?: string;
  user?: unknown;
  role?: string;
  detail?: string;
  redirect_url?: string;
}

export interface LoginApiResult {
  ok: boolean;
  status: number;
  data: LoginResponse;
}

// ============ API ============
/**
 * Authenticate user and return access/refresh tokens
 * @param credentials - User login credentials
 * @returns Access token, refresh token, and user data
 * @throws {Error} If login fails
 */
export async function apiLogin(
  credentials: LoginRequest
): Promise<LoginApiResult> {
  const url = getApiUrl('/api/login/');

  const payload = {
    username: credentials.username,
    email: credentials.email,
    password: credentials.password,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  return {
    ok: res.ok,
    status: res.status,
    data: {
      ...body,
      redirect_url: body.redirect_url || '/employee',
    },
  };
}
