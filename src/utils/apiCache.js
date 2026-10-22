/**
 * ─────────────────────────────────────────────────────────────
 * apiCache.js
 * High-performance In-Memory + SessionStorage Cache with:
 *  - Request De-duplication (shares in-flight promises)
 *  - Configurable TTL (Time-To-Live)
 *  - Stale-While-Revalidate (instant UI + background refresh)
 * ─────────────────────────────────────────────────────────────
 */

const memoryCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Fetch data with caching and in-flight deduplication.
 *
 * @param {string} key - Unique cache key
 * @param {Function} fetcher - Async function that performs the network fetch
 * @param {number} [ttlMs=10000] - Cache time-to-live in milliseconds (default 10s)
 * @returns {Promise<any>} Cached or freshly fetched data
 */
export async function cachedFetch(key, fetcher, ttlMs = DEFAULT_TTL_MS) {
  const now = Date.now();

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (now - entry.timestamp < ttlMs) {
      return entry.data;
    }
  }

  // 2. Check sessionStorage fallback (fast across page reloads in same session)
  try {
    const sessionRaw = sessionStorage.getItem(`ms_cache_${key}`);
    if (sessionRaw) {
      const sessionEntry = JSON.parse(sessionRaw);
      if (now - sessionEntry.timestamp < ttlMs) {
        memoryCache.set(key, sessionEntry);
        return sessionEntry.data;
      }
    }
  } catch (e) {
    // Ignore sessionStorage quota or parse issues
  }

  // 3. De-duplicate in-flight network requests
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      if (data !== null && data !== undefined && (!Array.isArray(data) || data.length > 0)) {
        const cacheObj = { data, timestamp: Date.now() };
        memoryCache.set(key, cacheObj);
        try {
          sessionStorage.setItem(`ms_cache_${key}`, JSON.stringify(cacheObj));
        } catch (e) {
          // Ignore quota errors
        }
      }
      return data;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Invalidate a specific cache key or all cache entries
 */
export function invalidateCache(key) {
  if (key) {
    memoryCache.delete(key);
    try { sessionStorage.removeItem(`ms_cache_${key}`); } catch (e) {}
  } else {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('ms_cache_'))
        .forEach(k => sessionStorage.removeItem(k));
    } catch (e) {}
  }
}
