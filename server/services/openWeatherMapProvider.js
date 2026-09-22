import { createNormalizedWeather } from '../utils/weatherSchema.js';

export class OpenWeatherMapProvider {
  constructor(apiKey, timeoutMs = 5000, { isBackup = false } = {}) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.isBackup = isBackup;
    this.name = isBackup ? 'OpenWeatherMap (Backup)' : 'OpenWeatherMap (Primary)';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geoUrl = 'https://api.openweathermap.org/geo/1.0';
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeout);
      return response;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const url = `${this.geoUrl}/direct?q=${encodeURIComponent(query.trim())}&limit=5&appid=${this.apiKey}`;
    const res = await this.fetchWithTimeout(url);
    if (!res.ok) {
      throw new Error(`OpenWeatherMap geocoding failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No locations found for "${query}" on OpenWeatherMap`);
    }
    return data.map(item => ({
      name: item.name,
      region: item.state || '',
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      displayName: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`
    }));
  }

  async getWeather(locationQuery) {
    let currentUrl = '';
    let forecastUrl = '';

    if (typeof locationQuery === 'object' && typeof locationQuery.lat === 'number' && typeof locationQuery.lon === 'number') {
      const { lat, lon } = locationQuery;
      currentUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    } else {
      const city = encodeURIComponent(locationQuery);
      currentUrl = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
      forecastUrl = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    }

    const [currentRes, forecastRes] = await Promise.all([
      this.fetchWithTimeout(currentUrl),
      this.fetchWithTimeout(forecastUrl).catch(() => null)
    ]);

    if (!currentRes.ok) {
      const err = await currentRes.text().catch(() => '');
      throw new Error(`OpenWeatherMap failed (${currentRes.status}): ${err}`);
    }

    const currentData = await currentRes.json();
    const forecastData = forecastRes && forecastRes.ok ? await forecastRes.json() : null;

    return this.normalize(currentData, forecastData);
  }

  normalize(cur, forecast) {
    if (!cur || !cur.main) {
      throw new Error('Invalid OpenWeatherMap response format');
    }

    const weatherCond = cur.weather?.[0] || {};
    const iconCode = weatherCond.icon || '01d';
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const isDay = iconCode.endsWith('d');

    // Hourly interpolation from 3-hour list
    const rawList = forecast?.list || [];
    const hourlyForecast = [];

    if (rawList.length > 0) {
      // Build 24 hours of data by expanding 3h intervals smoothly
      const nowEpoch = Math.floor(Date.now() / 1000);
      let currentHourEpoch = Math.floor(nowEpoch / 3600) * 3600;

      for (let i = 0; i < 24; i++) {
        const targetEpoch = currentHourEpoch + i * 3600;
        let closest = rawList[0];
        let minDiff = Math.abs(rawList[0].dt - targetEpoch);
        for (const item of rawList) {
          const diff = Math.abs(item.dt - targetEpoch);
          if (diff < minDiff) {
            minDiff = diff;
            closest = item;
          }
        }

        const dateObj = new Date(targetEpoch * 1000);
        const timeStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:00`;
        const itemIcon = closest.weather?.[0]?.icon || '01d';
        const itemIsDay = itemIcon.endsWith('d');

        hourlyForecast.push({
          time: timeStr,
          timeEpoch: targetEpoch,
          temp: Math.round((closest.main?.temp || cur.main.temp) * 10) / 10,
          feelsLike: Math.round((closest.main?.feels_like || cur.main.feels_like) * 10) / 10,
          condition: closest.weather?.[0]?.main || 'Clear',
          conditionIcon: `https://openweathermap.org/img/wn/${itemIcon}@2x.png`,
          rainProbability: Math.round((closest.pop || 0) * 100),
          precipitation: closest.rain?.['3h'] ? Math.round((closest.rain['3h'] / 3) * 10) / 10 : 0,
          windSpeed: Math.round(((closest.wind?.speed || 0) * 3.6) * 10) / 10, // m/s to km/h
          humidity: closest.main?.humidity || cur.main.humidity || 0,
          uvIndex: itemIsDay ? 5 : 0
        });
      }
    } else {
      // Generate synthetic 24h baseline if 5d/3h was unavailable
      const nowEpoch = Math.floor(Date.now() / 1000);
      for (let i = 0; i < 24; i++) {
        const targetEpoch = nowEpoch + i * 3600;
        const dateObj = new Date(targetEpoch * 1000);
        const hour = dateObj.getHours();
        const hourIsDay = hour >= 6 && hour < 19;
        hourlyForecast.push({
          time: dateObj.toISOString().replace('T', ' ').substring(0, 16),
          timeEpoch: targetEpoch,
          temp: Math.round(cur.main.temp * 10) / 10,
          feelsLike: Math.round(cur.main.feels_like * 10) / 10,
          condition: weatherCond.main || 'Clear',
          conditionIcon: iconUrl,
          rainProbability: cur.rain ? 80 : 10,
          precipitation: cur.rain?.['1h'] || 0,
          windSpeed: Math.round((cur.wind?.speed || 0) * 3.6 * 10) / 10,
          humidity: cur.main.humidity || 0,
          uvIndex: hourIsDay ? 5 : 0
        });
      }
    }

    const next3Hours = hourlyForecast.slice(0, 3);
    const rainProb = next3Hours[0]?.rainProbability || (cur.rain ? 85 : 5);

    const isAntarctica = typeof cur.coord?.lat === 'number' && cur.coord.lat < -60;
    const fallbackName = isAntarctica
      ? 'Antarctica'
      : (cur.coord ? `${Math.abs(cur.coord.lat).toFixed(2)}° ${cur.coord.lat >= 0 ? 'N' : 'S'}, ${Math.abs(cur.coord.lon).toFixed(2)}° ${cur.coord.lon >= 0 ? 'E' : 'W'}` : 'Location');

    // UV Index estimation for daylight
    const uvEstimate = isDay ? (cur.clouds?.all > 70 ? 3 : 6) : 0;

    return createNormalizedWeather({
      location: {
        name: cur.name || fallbackName,
        region: isAntarctica ? 'Antarctic' : '',
        country: cur.sys?.country || (isAntarctica ? 'AQ' : ''),
        countryCode: cur.sys?.country || (isAntarctica ? 'AQ' : ''),
        lat: cur.coord?.lat || 0,
        lon: cur.coord?.lon || 0,
        localtime: new Date().toISOString(),
        timezoneOffset: cur.timezone || 0
      },
      temperature: cur.main.temp,
      feelsLike: cur.main.feels_like,
      condition: weatherCond.main || 'Clear',
      conditionCode: weatherCond.id || 800,
      conditionIcon: iconUrl,
      isDay,
      rainProbability: rainProb,
      precipitation: cur.rain?.['1h'] || 0,
      humidity: cur.main.humidity || 0,
      windSpeed: (cur.wind?.speed || 0) * 3.6, // m/s to km/h
      windDirection: 'N',
      uvIndex: uvEstimate,
      visibility: (cur.visibility || 10000) / 1000,
      pressure: cur.main.pressure || 1013,
      hourlyForecast,
      next3Hours,
      alerts: [],
      source: this.isBackup ? 'OpenWeatherMap (Backup)' : 'OpenWeatherMap (Primary)',
      isBackup: this.isBackup,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }
}
