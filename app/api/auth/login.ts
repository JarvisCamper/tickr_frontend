import Cookies from "js-cookie";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_Backend_URL}/api/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );


    const result: LoginResponse = await response.json();

    // Store tokens and user data in cookies
    Cookies.set("access_token", result.access_token, { expires: 7 });
    Cookies.set("refresh_token", result.refresh_token, { expires: 7 });



    return result;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}