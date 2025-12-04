import Cookies from "js-cookie";
import { getApiUrl } from "@/constant/apiendpoints";

export type APIOptions = {
  useAuth?: boolean;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  parseJson?: boolean;
} & RequestInit;

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function apiFetch(endpoint: string, options: APIOptions = {}) {
  const {
    useAuth = true,
    credentials = "same-origin",
    headers = {},
    parseJson = true,
    ...rest
  } = options;

  const url =
    endpoint.startsWith("http") ? endpoint : getApiUrl(endpoint);

  const mergedHeaders: HeadersInit = {
    ...(useAuth
      ? getAuthHeaders()
      : { "Content-Type": "application/json" }),
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
        window.dispatchEvent(new CustomEvent("auth-changed"));
      } catch {}
    }

    const text = await resp.text();
    let body: any = text;

    try {
      body = JSON.parse(text);
    } catch {}

    const err: any = new Error(resp.statusText || "API error");
    err.status = resp.status;
    err.body = body;
    throw err;
  }

  return parseJson ? resp.json() : resp;
}

export const apiGet = (endpoint: string, opts?: APIOptions) =>
  apiFetch(endpoint, { method: "GET", ...opts });

export const apiPost = (
  endpoint: string,
  body?: any,
  opts?: APIOptions
) =>
  apiFetch(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiPut = (
  endpoint: string,
  body?: any,
  opts?: APIOptions
) =>
  apiFetch(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiDelete = (endpoint: string, opts?: APIOptions) =>
  apiFetch(endpoint, { method: "DELETE", ...opts });

export default apiFetch;
