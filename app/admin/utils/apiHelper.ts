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
 * Safe fetch for admin API endpoints
 * Handles JSON parsing errors gracefully
 */
export const safeFetch = async (endpoint: string) => {
  try {
    const url = getApiUrl(endpoint);
    const headers = getAuthHeaders();
    console.debug('[safeFetch] Request', { url, hasAuth: !!headers['Authorization'] });

    const response = await fetch(url, {
      headers,
      credentials: "include",
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
    console.error("Error fetching from API:", endpoint, err);
    return null;
  }
};
