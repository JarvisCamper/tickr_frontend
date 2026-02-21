import { getApiUrl } from '../../../constant/apiendpoints';

// ============ Types ============
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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
 * Register new user with backend signup endpoint
 * @param credentials - User registration details
 * @returns Signup response from server
 * @throws {Error} If signup fails
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

  return resultBody;
}
