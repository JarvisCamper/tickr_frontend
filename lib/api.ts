import Cookies from 'js-cookie';
import { getApiUrl } from '@/constant/apiendpoints';
import { cachedFetch, apiCache } from './cache';

// ============ Types ============
export type APIOptions = {
  useAuth?: boolean;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  parseJson?: boolean;
  useCache?: boolean;
  cacheKey?: string;
  cacheExpiresIn?: number;
} & RequestInit;

// ============ Utilities ============
/**
 * Get authentication headers with bearer token
 */
function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('access_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Centralized fetch wrapper with authentication support
 * @param endpoint - API endpoint or full URL
 * @param options - Fetch options and custom API options
 * @returns Parsed JSON response or raw response object
 */
async function apiFetch(endpoint: string, options: APIOptions = {}) {
  const {
    useAuth = true,
    credentials = 'same-origin',
    headers = {},
    parseJson = true,
    useCache = false,
    cacheKey,
    cacheExpiresIn,
    ...rest
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
  
  // Use cache for GET requests if enabled
  if (useCache && rest.method === 'GET') {
    const key = cacheKey || url;
    return cachedFetch(
      key,
      async () => {
        const response = await fetchWithAuth(url, {
          credentials,
          headers,
          useAuth,
          parseJson,
          ...rest,
        });
        return response;
      },
      { expiresIn: cacheExpiresIn }
    );
  }
  
  return fetchWithAuth(url, {
    credentials,
    headers,
    useAuth,
    parseJson,
    ...rest,
  });
}

async function fetchWithAuth(
  url: string,
  options: {
    credentials: RequestCredentials;
    headers: HeadersInit;
    useAuth: boolean;
    parseJson: boolean;
  } & RequestInit
) {
  const { credentials, headers, useAuth, parseJson, ...rest } = options;

  const mergedHeaders: HeadersInit = {
    ...(useAuth
      ? getAuthHeaders()
      : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  const resp = await fetch(url, {
    credentials,
    headers: mergedHeaders,
    ...rest,
  });

  if (!resp.ok) {
    if (resp.status === 401) {
      try {
        window.dispatchEvent(new CustomEvent('auth-changed'));
      } catch (error) {
        console.error('Failed to dispatch auth event:', error);
      }
    }

    const text = await resp.text();
    let body: unknown = text;

    try {
      body = JSON.parse(text);
    } catch (error) {
      // Keep body as text if not valid JSON
    }

    const err = new Error(resp.statusText || 'API error') as any;
    err.status = resp.status;
    err.body = body;
    throw err;
  }

  return parseJson ? resp.json() : resp;
}

// ============ API Methods ============
/**
 * GET request helper with optional caching
 */
export const apiGet = (endpoint: string, opts?: APIOptions) =>
  apiFetch(endpoint, { method: 'GET', ...opts });

/**
 * POST request helper (clears relevant cache)
 */
export const apiPost = (endpoint: string, body?: unknown, opts?: APIOptions) => {
  // Clear cache for related endpoints after mutation
  if (typeof window !== 'undefined') {
    apiCache.clearAll();
  }
  return apiFetch(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });
};

/**
 * PUT request helper (clears relevant cache)
 */
export const apiPut = (endpoint: string, body?: unknown, opts?: APIOptions) => {
  // Clear cache for related endpoints after mutation
  if (typeof window !== 'undefined') {
    apiCache.clearAll();
  }
  return apiFetch(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });
};

/**
 * DELETE request helper (clears relevant cache)
 */
export const apiDelete = (endpoint: string, opts?: APIOptions) => {
  // Clear cache for related endpoints after mutation
  if (typeof window !== 'undefined') {
    apiCache.clearAll();
  }
  return apiFetch(endpoint, { method: 'DELETE', ...opts });
};

export { apiCache };
export default apiFetch;
