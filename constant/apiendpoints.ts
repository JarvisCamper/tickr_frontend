// ============ Configuration ============
/**
 * Base API URL for all backend requests
 * Falls back to local backend in development and production backend otherwise
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000'
    : 'https://tickr-backend.vercel.app');

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
 
  normalizedEndpoint = normalizedEndpoint.replace(/^\/api(?:\/api)+\//, '/api/');

  // Normalize base URL:
  // - remove trailing slash
  // - remove trailing repeated /api (if env var already includes it)
  //   e.g. https://host/api or https://host/api/api -> https://host
  const baseUrl = API_BASE_URL.replace(/\/+$/, '').replace(/(?:\/api)+$/i, '');

  return `${baseUrl}${normalizedEndpoint}`;
};
