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
    const backendUrl = process.env.NEXT_PUBLIC_Backend_URL;
    
    // Debug: Check if environment variable is loaded
    if (!backendUrl) {
      throw new Error("Backend URL is not configured. Check your .env.local file.");
    }

    console.log("Attempting login to:", `${backendUrl}/api/login/`);

    const response = await fetch(
      `${backendUrl}/api/login/`,
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