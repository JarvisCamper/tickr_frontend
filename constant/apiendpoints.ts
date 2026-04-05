export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000'
    : 'https://tickr-backend.vercel.app');

export const getApiUrl = (endpoint: string): string => {
  // Normalize to a single leading slash
  let normalizedEndpoint = endpoint.trim().replace(/^\/+/, '/');
  if (!normalizedEndpoint.startsWith('/')) {
    normalizedEndpoint = `/${normalizedEndpoint}`;
  }

  // Collapse accidental duplicate /api prefixes:
 
  normalizedEndpoint = normalizedEndpoint.replace(/^\/api(?:\/api)+\//, '/api/');

  // Normalize base URL: remove trailing slashes and duplicate /api segments
  const baseUrl = API_BASE_URL.replace(/\/+$/, '').replace(/(?:\/api)+$/i, '');

  return `${baseUrl}${normalizedEndpoint}`;
};
