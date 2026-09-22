import { config } from '../config.js';
import { PrimaryWeatherProvider } from './primaryWeatherProvider.js';
import { BackupWeatherProvider } from './backupWeatherProvider.js';
import { geocodingService } from './geocodingService.js';
import { timeService } from './timeService.js';
import { weatherCache } from '../utils/cache.js';
import { validateWeatherData } from '../utils/weatherSchema.js';

export class WeatherService {
  constructor() {
    // Primary: OpenWeatherMap, Backup: WeatherAPI.com
    this.primary = new PrimaryWeatherProvider(config.openWeatherMapKey, config.weatherApiTimeoutMs);
    this.backup = new BackupWeatherProvider(config.weatherApiKey, config.weatherApiTimeoutMs);
    this.lastActiveSource = 'OpenWeatherMap (Primary)';
    this.lastFailoverReason = null;
  }

  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];

    // 1. Try multi-tier natural geocoding first (handles countries, mountain ranges, landmarks)
    try {
      const naturalResults = await geocodingService.search(query);
      if (naturalResults && naturalResults.length > 0) {
        return naturalResults;
      }
    } catch (geoErr) {
      console.warn(`[WeatherService] Natural geocoder failed (${geoErr.message}). Falling back...`);
    }

    // 2. Try primary (OpenWeatherMap) geocoding
    try {
      const results = await this.primary.searchCities(query);
      if (results && results.length > 0) return results;
    } catch (err) {
      console.warn(`[WeatherService] Primary city search failed (${err.message}). Trying backup...`);
    }

    // 3. Try backup (WeatherAPI.com) geocoding
    try {
      return await this.backup.searchCities(query);
    } catch (backupErr) {
      console.error(`[WeatherService] Backup city search also failed: ${backupErr.message}`);
      return [];
    }
  }

  async getWeather(locationQuery, { forceRefresh = false } = {}) {
    let queryToFetch = locationQuery;
    let preferredLocationName = null;
    let preferredCountry = null;

    // If auto:ip or empty query, default to user's real location Guntur
    if (locationQuery === 'auto:ip' || !locationQuery) {
      queryToFetch = { lat: 16.3067, lon: 80.4365 };
      preferredLocationName = 'Guntur';
      preferredCountry = 'India';
    } else if (typeof locationQuery === 'string') {
      // If query is a string (e.g. "himalayas", "finland"), resolve coordinates via intelligent geocoder
      try {
        const resolved = await geocodingService.resolveQueryToCoordinates(locationQuery);
        if (resolved && typeof resolved.lat === 'number' && typeof resolved.lon === 'number') {
          queryToFetch = { lat: resolved.lat, lon: resolved.lon };
          preferredLocationName = resolved.name;
          preferredCountry = resolved.country;
        }
      } catch (resErr) {
        // Fall back to raw string query
      }
    } else if (typeof locationQuery === 'object' && locationQuery !== null && locationQuery.name) {
      preferredLocationName = locationQuery.name;
      if (locationQuery.country) preferredCountry = locationQuery.country;
    }

    const cacheKey = typeof queryToFetch === 'object' && queryToFetch !== null
      ? `${queryToFetch.lat},${queryToFetch.lon}`
      : String(queryToFetch).toLowerCase();

    // Check fresh cache unless forceRefresh is true
    if (!forceRefresh) {
      const cached = weatherCache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true
        };
      }
    }

    let weatherData = null;
    let usedBackup = false;
    let failoverReason = null;

    // 1. Attempt Primary Provider (OpenWeatherMap)
    try {
      weatherData = await this.primary.getWeather(queryToFetch);
      if (!validateWeatherData(weatherData)) {
        throw new Error('Primary weather provider returned invalid data format');
      }
      this.lastActiveSource = 'OpenWeatherMap (Primary)';
      this.lastFailoverReason = null;
    } catch (primaryErr) {
      console.warn(`[WeatherService] Primary provider (OpenWeatherMap) failed: ${primaryErr.message}. Activating backup provider (WeatherAPI.com)...`);
      failoverReason = primaryErr.message;
      usedBackup = true;

      // 2. Failover to Backup Provider (WeatherAPI.com)
      try {
        weatherData = await this.backup.getWeather(queryToFetch);
        if (!validateWeatherData(weatherData)) {
          throw new Error('Backup weather provider also returned invalid data format');
        }
        this.lastActiveSource = 'WeatherAPI.com (Backup)';
        this.lastFailoverReason = failoverReason;
      } catch (backupErr) {
        console.error(`[WeatherService] Both weather providers failed. Primary: ${failoverReason}, Backup: ${backupErr.message}`);
        throw new Error(`Unable to retrieve weather data from primary or backup provider. (${backupErr.message})`);
      }
    }

    // Apply preferred name if resolved from natural landmark/country query
    if (preferredLocationName) {
      weatherData.location.name = preferredLocationName;
      if (preferredCountry) weatherData.location.country = preferredCountry;
    }

    // Enrich location with local time & timezone abbreviation
    const timeInfo = timeService.getLocalTimeInfo({
      timezoneOffset: weatherData.location.timezoneOffset,
      country: weatherData.location.country || weatherData.location.countryCode,
      region: weatherData.location.region,
      lat: weatherData.location.lat,
      lon: weatherData.location.lon,
      tz_id: weatherData.location.tz_id
    });

    weatherData.location = {
      ...weatherData.location,
      localTime: timeInfo.time,
      timezone: timeInfo.timezone,
      timeDisplay: timeInfo.formatted
    };

    // Cache valid result for 5 minutes
    weatherCache.set(cacheKey, weatherData, config.cacheTtlSeconds);

    return {
      ...weatherData,
      fromCache: false,
      failoverActive: usedBackup,
      failoverReason: failoverReason
    };
  }

  getStatus() {
    return {
      lastActiveSource: this.lastActiveSource,
      lastFailoverReason: this.lastFailoverReason,
      primaryAvailable: Boolean(config.openWeatherMapKey),
      backupAvailable: Boolean(config.weatherApiKey)
    };
  }
}

export const weatherService = new WeatherService();
