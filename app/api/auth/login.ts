import { getApiUrl } from '../../../constant/apiendpoints';

// ============ Types ============
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: unknown;
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
): Promise<LoginResponse> {
  const url = getApiUrl('login/');

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

  if (!res.ok) {
    throw new Error(body?.message || JSON.stringify(body));
  }

  return {
    access: body.access,
    refresh: body.refresh,
    user: body.user,
  };
}
