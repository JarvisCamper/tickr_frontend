import Cookies from "js-cookie";
import { getApiUrl } from "@/constant/apiendpoints";

export const getAuthHeaders = () => {
  const token = Cookies.get("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 Safe fetch for admin API endpoints
 Handles JSON parsing errors gracefully
 */
export const safeFetch = async (
  endpoint: string,
  options?: {
    timeoutMs?: number;
  }
) => {
  try {
    const url = getApiUrl(endpoint);
    const headers = getAuthHeaders();
    const timeoutMs = options?.timeoutMs ?? 8000;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      headers,
      credentials: "include",
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => {
      window.clearTimeout(timeoutId);
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(`API error (${response.status}): ${endpoint}`, body.slice(0, 200));
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const body = await response.text();
      console.warn(`API returned non-JSON response: ${endpoint}`, contentType, body.slice(0, 200));
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn(`API timeout after request waited too long: ${endpoint}`);
      return null;
    }
    console.error("Error fetching from API:", endpoint, err);
    return null;
  }
};
