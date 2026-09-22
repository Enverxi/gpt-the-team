import { createNormalizedWeather } from '../utils/weatherSchema.js';

export class WeatherApiProvider {
  constructor(apiKey, timeoutMs = 5000, { isBackup = true } = {}) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.isBackup = isBackup;
    this.name = isBackup ? 'WeatherAPI.com (Backup)' : 'WeatherAPI.com (Primary)';
    this.baseUrl = 'https://api.weatherapi.com/v1';
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
    const url = `${this.baseUrl}/search.json?key=${this.apiKey}&q=${encodeURIComponent(query.trim())}`;
    const res = await this.fetchWithTimeout(url);
    if (!res.ok) {
      throw new Error(`WeatherAPI search error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.map(item => ({
      name: item.name,
      region: item.region,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      displayName: `${item.name}${item.region ? `, ${item.region}` : ''}, ${item.country}`
    }));
  }

  async getWeather(locationQuery) {
    const isCoord = typeof locationQuery === 'object' && typeof locationQuery.lat === 'number' && typeof locationQuery.lon === 'number';
    
    // WeatherAPI lacks coverage in Antarctica (< -60 lat) and incorrectly snaps to Tasmania/Australia
    if (isCoord && locationQuery.lat < -60) {
      throw new Error('Antarctica coordinates require global numerical grid provider');
    }

    const q = isCoord
      ? `${locationQuery.lat},${locationQuery.lon}`
      : locationQuery;

    const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(q)}&days=2&aqi=no&alerts=yes`;
    const res = await this.fetchWithTimeout(url);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`WeatherAPI forecast failed with status ${res.status}: ${errorText}`);
    }

    const data = await res.json();

    // Verify coordinates didn't snap to an unrelated continent (e.g. > 4° latitude error)
    if (isCoord && data.location && typeof data.location.lat === 'number') {
      const dLat = Math.abs(data.location.lat - locationQuery.lat);
      if (dLat > 4) {
        throw new Error(`WeatherAPI coordinate mismatch: requested ${locationQuery.lat}, got ${data.location.lat}`);
      }
    }

    return this.normalize(data);
  }

  normalize(raw) {
    if (!raw || !raw.current || !raw.location) {
      throw new Error('Invalid or incomplete response from WeatherAPI');
    }

    const loc = raw.location;
    const cur = raw.current;
    const forecastDays = raw.forecast?.forecastday || [];

    // Flatten hourly forecasts from today and tomorrow
    const allHours = [];
    forecastDays.forEach(day => {
      if (Array.isArray(day.hour)) {
        day.hour.forEach(h => allHours.push(h));
      }
    });

    // Determine current local epoch or filter next 24 hours
    const currentEpoch = cur.last_updated_epoch || Math.floor(Date.now() / 1000);
    // Find hours from current hour onwards
    let upcomingHours = allHours.filter(h => h.time_epoch >= currentEpoch - 1800); // 30 min buffer
    if (upcomingHours.length < 24) {
      upcomingHours = allHours.slice(0, 24);
    } else {
      upcomingHours = upcomingHours.slice(0, 24);
    }

    const normalizedHourly = upcomingHours.map(h => ({
      time: h.time,
      timeEpoch: h.time_epoch,
      temp: Math.round(h.temp_c * 10) / 10,
      feelsLike: Math.round(h.feelslike_c * 10) / 10,
      condition: h.condition?.text || 'Clear',
      conditionIcon: h.condition?.icon ? (h.condition.icon.startsWith('//') ? `https:${h.condition.icon}` : h.condition.icon) : '',
      rainProbability: typeof h.chance_of_rain !== 'undefined' ? parseInt(h.chance_of_rain, 10) : 0,
      precipitation: typeof h.precip_mm !== 'undefined' ? parseFloat(h.precip_mm) : 0,
      windSpeed: typeof h.wind_kph !== 'undefined' ? Math.round(h.wind_kph * 10) / 10 : 0,
      humidity: h.humidity || 0,
      uvIndex: h.uv || 0
    }));

    const next3Hours = normalizedHourly.slice(0, 3);
    const currentRainProb = next3Hours[0]?.rainProbability ?? (cur.precip_mm > 0 ? 80 : 0);

    // Official alerts
    const rawAlerts = raw.alerts?.alert || [];
    const alerts = rawAlerts.map(a => ({
      headline: a.headline || a.event || 'Weather Alert',
      severity: a.severity || 'Moderate',
      urgency: a.urgency || 'Expected',
      areas: a.areas || '',
      category: a.category || 'Meteorological',
      event: a.event || 'Weather Advisory',
      desc: a.desc || a.instruction || '',
      effective: a.effective || '',
      expires: a.expires || ''
    }));

    const iconUrl = cur.condition?.icon
      ? (cur.condition.icon.startsWith('//') ? `https:${cur.condition.icon}` : cur.condition.icon)
      : '';

    return createNormalizedWeather({
      location: {
        name: loc.name,
        region: loc.region,
        country: loc.country,
        lat: loc.lat,
        lon: loc.lon,
        localtime: loc.localtime,
        tz_id: loc.tz_id || ''
      },
      temperature: cur.temp_c,
      feelsLike: cur.feelslike_c,
      condition: cur.condition?.text || 'Clear',
      conditionCode: cur.condition?.code || 1000,
      conditionIcon: iconUrl,
      isDay: typeof cur.is_day !== 'undefined' ? cur.is_day === 1 : true,
      rainProbability: currentRainProb,
      precipitation: cur.precip_mm || 0,
      humidity: cur.humidity || 0,
      windSpeed: cur.wind_kph || 0,
      windDirection: cur.wind_dir || 'N',
      uvIndex: cur.uv || 0,
      visibility: cur.vis_km || 10,
      pressure: cur.pressure_mb || 1013,
      hourlyForecast: normalizedHourly,
      next3Hours,
      alerts,
      source: this.isBackup ? 'WeatherAPI.com (Backup)' : 'WeatherAPI.com (Primary)',
      isBackup: this.isBackup,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }
}
