/**
 * In-Memory Freshness Cache for Weather Responses
 */

class WeatherCache {
  constructor(defaultTtlSeconds = 300) {
    this.cache = new Map();
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  generateKey(query) {
    if (typeof query === 'string') {
      return query.trim().toLowerCase();
    }
    if (query && typeof query === 'object' && query.lat && query.lon) {
      // Round to 2 decimal places (~1.1 km precision)
      const lat = parseFloat(query.lat).toFixed(2);
      const lon = parseFloat(query.lon).toFixed(2);
      return `coords:${lat},${lon}`;
    }
    return String(query);
  }

  get(query) {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(query, data, ttlSeconds) {
    const key = this.generateKey(query);
    const ttl = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl);
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const weatherCache = new WeatherCache(300);
