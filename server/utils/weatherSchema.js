/**
 * Normalized Weather Data Schema for WeatherGPT
 * Primary source of truth for both UI and AI Agent context
 */

export function createNormalizedWeather({
  location = {
    name: 'Unknown',
    region: '',
    country: '',
    countryCode: '',
    lat: 0,
    lon: 0,
    localtime: new Date().toISOString(),
    localTime: '',
    timezone: '',
    timeDisplay: ''
  },
  temperature = 0, // Celsius
  feelsLike = 0,   // Celsius
  condition = 'Clear',
  conditionCode = 1000,
  conditionIcon = '',
  isDay = true,
  rainProbability = 0, // Percentage 0 - 100
  precipitation = 0,   // mm
  humidity = 0,        // Percentage 0 - 100
  windSpeed = 0,       // km/h
  windDirection = 'N',
  uvIndex = 0,
  visibility = 10,     // km
  pressure = 1013,     // hPa
  hourlyForecast = [], // Array of 24 hourly entries
  next3Hours = [],     // Immediate 3 hours slice
  alerts = [],         // Official weather alerts
  source = 'OpenWeatherMap (Primary)',
  isBackup = false,
  lastUpdated = new Date().toISOString()
} = {}) {
  return {
    location,
    temperature: Math.round(temperature * 10) / 10,
    feelsLike: Math.round(feelsLike * 10) / 10,
    condition,
    conditionCode,
    conditionIcon,
    isDay: Boolean(isDay),
    rainProbability: Math.min(100, Math.max(0, Math.round(rainProbability))),
    precipitation: Math.max(0, Math.round(precipitation * 10) / 10),
    humidity: Math.min(100, Math.max(0, Math.round(humidity))),
    windSpeed: Math.max(0, Math.round(windSpeed * 10) / 10),
    windDirection,
    uvIndex: Math.max(0, Math.round(uvIndex * 10) / 10),
    visibility: Math.max(0, Math.round(visibility * 10) / 10),
    pressure: Math.round(pressure),
    hourlyForecast,
    next3Hours,
    alerts,
    source,
    isBackup,
    lastUpdated
  };
}

export function validateWeatherData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!data.location || typeof data.location.name !== 'string') return false;
  if (typeof data.temperature !== 'number' || isNaN(data.temperature)) return false;
  if (typeof data.condition !== 'string' || !data.condition) return false;
  if (!Array.isArray(data.hourlyForecast)) return false;
  return true;
}
