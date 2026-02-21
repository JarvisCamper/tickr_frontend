// ============ Configuration ============
/**
 * Base API URL for all backend requests
 * Falls back to production backend if NEXT_PUBLIC_API_URL is not set
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://tickr-backend.vercel.app';

// ============ Utilities ============
/**
 * Build full endpoint URL safely
 * @param endpoint - API endpoint path
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Normalize to a single leading slash
  let normalizedEndpoint = endpoint.trim().replace(/^\/+/, '/');
  if (!normalizedEndpoint.startsWith('/')) {
    normalizedEndpoint = `/${normalizedEndpoint}`;
  }

  // Collapse accidental duplicate /api prefixes:
  // /api/api/login/ -> /api/login/
  normalizedEndpoint = normalizedEndpoint.replace(/^\/api(?:\/api)+\//, '/api/');

  // Remove trailing slash from base URL to avoid double slashes
  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  return `${baseUrl}${normalizedEndpoint}`;
};
