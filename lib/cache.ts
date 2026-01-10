/**
 * Simple in-memory cache for API responses
 * Helps reduce redundant API calls and improve performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  /**
   * Get cached data if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set cache data with expiration time
   * @param key Cache key
   * @param data Data to cache
   * @param expiresIn Expiration time in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Clear specific cache key
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

/**
 * Cached fetch wrapper
 * @param key Cache key
 * @param fetcher Function that returns a promise
 * @param options Cache options
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    expiresIn?: number;
    forceRefresh?: boolean;
  }
): Promise<T> {
  const { expiresIn = 5 * 60 * 1000, forceRefresh = false } = options || {};

  if (!forceRefresh) {
    const cached = apiCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  const data = await fetcher();
  apiCache.set(key, data, expiresIn);
  return data;
}
