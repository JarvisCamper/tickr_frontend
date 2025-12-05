// constant/apiendpoints.ts
// Central API configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Build full endpoint URL safely
export const getApiUrl = (endpoint: string): string => {
  // remove starting slash to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint.slice(1)
    : endpoint;

  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${baseUrl}/${cleanEndpoint}`;
};