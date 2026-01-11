import Cookies from 'js-cookie';
import { apiLogin } from './login';
import { getApiUrl } from '../../../constant/apiendpoints';

// ============ Types ============
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success?: string;
  data?: {
    id: number;
    username: string;
    email: string;
  };
}

// ============ API ============
/**
 * Register new user and auto-login with provided credentials
 * @param credentials - User registration details
 * @returns Signup response from server
 * @throws {Error} If signup or auto-login fails
 */
export async function signup(
  credentials: SignupRequest
): Promise<SignupResponse> {
  const url = getApiUrl('/api/signup/');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  // Safely parse response body
  const resultBody = await (() => {
    try {
      return response.json();
    } catch (error) {
      console.error('Failed to parse signup response:', error);
      return null;
    }
  })();

  if (!response.ok) {
    const errorMsg =
      (resultBody &&
        (resultBody?.email?.[0] ||
          resultBody?.username?.[0] ||
          resultBody?.detail ||
          resultBody?.message)) ||
      `Signup failed (status ${response.status})`;
    throw new Error(errorMsg);
  }

  // Auto-login after successful signup
  const tokens = await apiLogin({
    email: credentials.email,
    username: credentials.username,
    password: credentials.password,
  });

  // Store tokens in cookies for AuthContext
  Cookies.set('access_token', tokens.access, { expires: 7, sameSite: 'lax' });
  Cookies.set('refresh_token', tokens.refresh, {
    expires: 7,
    sameSite: 'lax',
  });

  return resultBody;
}