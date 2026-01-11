// ============ Configuration ============
/**
 * Base API URL for all backend requests
 * Falls back to localhost:8000 if NEXT_PUBLIC_API_URL is not set
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============ Utilities ============
/**
 * Build full endpoint URL safely
 * @param endpoint - API endpoint path
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove starting slash to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;

  // Remove trailing slash from base URL to avoid double slashes
  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${baseUrl}/${cleanEndpoint}`;
};