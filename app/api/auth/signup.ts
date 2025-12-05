// app/api/auth/signup.ts
import Cookies from "js-cookie";
import { apiLogin } from "./login";
import { getApiUrl } from "../../../constant/apiendpoints";

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

export async function signup(credentials: SignupRequest): Promise<SignupResponse> {
  const url = getApiUrl("signup/");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const resultBody = await (async () => {
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  })();

  if (!response.ok) {
    const errorMsg = (resultBody && (resultBody?.email?.[0] || resultBody?.username?.[0] || resultBody?.detail || resultBody?.message)) || `Signup failed (status ${response.status})`;
    throw new Error(errorMsg);
  }

  // Auto-login after successful signup using the robust apiLogin helper
  const tokens = await apiLogin({ email: credentials.email, username: credentials.username, password: credentials.password });

  // Store tokens using the cookie names expected by AuthContext
  Cookies.set("access_token", tokens.access, { expires: 7, sameSite: "lax" });
  Cookies.set("refresh_token", tokens.refresh, { expires: 7, sameSite: "lax" });

  return resultBody;
}