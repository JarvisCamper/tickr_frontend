import Cookies from "js-cookie";
import { getApiUrl } from "../../../constant/apiendpoints";

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
    // Build URL using central API helper. Set `NEXT_PUBLIC_API_URL` in environment.
    const url = getApiUrl("/login/");

    console.log("Attempting login to:", url);

    const response = await fetch(url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        errorData.detail || 
        `Login failed with status: ${response.status}`
      );
    }

    const result: LoginResponse = await response.json();

    // Validate response has required fields
    if (!result.access_token || !result.refresh_token) {
      throw new Error("Invalid response from server: missing tokens");
    }

    // Store tokens and user data in cookies
    Cookies.set("access_token", result.access_token, { expires: 7 });
    Cookies.set("refresh_token", result.refresh_token, { expires: 7 });

    console.log("Login successful");
    return result;

  } catch (error) {
    console.error("Login error:", error);
    
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to server. Please check:\n" +
        "1. Backend server is running\n" +
        "2. Backend URL is correct in .env.local\n" +
        "3. No CORS issues"
      );
    }
    
    throw error;
  }
}