// app/api/auth/signup.ts
import Cookies from "js-cookie";
import { login,LoginResponse } from "./login"; // Reuse login after signup

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: string;
  data: {
    id: number;
    username: string;
    email: string;
  };
}

export async function signup(credentials: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_Backend_URL}/api/users/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const errorMsg = result?.email?.[0] || result?.username?.[0] || "Signup failed";
    throw new Error(errorMsg);
  }

  // Auto-login after successful signup
  const loginResponse = await login({
    email: credentials.email,
    password: credentials.password,
  });

  // Store tokens (same as login)
  Cookies.set("access_token", loginResponse.access_token, { expires: 7 });
  Cookies.set("refresh_token", loginResponse.refresh_token, { expires: 7 });

  return result;
}