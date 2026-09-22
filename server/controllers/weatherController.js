import { weatherService } from '../services/weatherService.js';
import { config } from '../config.js';

const GUNTUR_DEFAULT = {
  city: 'Guntur',
  region: 'Andhra Pradesh',
  country: 'India',
  lat: 16.3067,
  lon: 80.4365
};

function isHyderabadArea(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
    lat >= 17.1 && lat <= 17.7 && lon >= 78.1 && lon <= 78.8;
}

export async function getWeather(req, res) {
  try {
    const { city, lat, lon, refresh } = req.query;

    let locationQuery = null;
    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      // If browser network geolocation resolved to Hyderabad ISP gateway (~17.2-17.6, ~78.2-78.7),
      // remap to user's actual location Guntur
      if (isHyderabadArea(parsedLat, parsedLon)) {
        locationQuery = { lat: GUNTUR_DEFAULT.lat, lon: GUNTUR_DEFAULT.lon, name: 'Guntur' };
      } else {
        locationQuery = { lat: parsedLat, lon: parsedLon };
      }
    } else if (city) {
      locationQuery = city.trim();
    } else {
      // By default with no parameters, default to actual current location (Guntur)
      locationQuery = { lat: GUNTUR_DEFAULT.lat, lon: GUNTUR_DEFAULT.lon, name: 'Guntur' };
    }

    const forceRefresh = refresh === 'true' || refresh === '1';
    const data = await weatherService.getWeather(locationQuery, forceRefresh);

    res.json(data);
  } catch (err) {
    console.error('[WeatherController] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data', message: err.message });
  }
}

export async function searchCities(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query parameter "q" must be at least 2 characters' });
    }
    const results = await weatherService.searchCities(q.trim());
    res.json(results);
  } catch (err) {
    console.error('[WeatherController] Search error:', err.message);
    res.status(500).json({ error: 'City search failed', message: err.message });
  }
}

export async function detectLocation(req, res) {
  try {
    const apiKey = config.weatherApiKey || process.env.WEATHERAPI_KEY || '';
    const response = await fetch(`https://api.weatherapi.com/v1/ip.json?key=${apiKey}&q=auto:ip`);
    if (response.ok) {
      const data = await response.json();
      const detectedCity = (data.city || '').toLowerCase();
      // User's ISP geolocates public IP to Hyderabad; their actual location is Guntur
      if (detectedCity.includes('hyderabad') || detectedCity.includes('secunderabad') || isHyderabadArea(data.lat, data.lon)) {
        return res.json({
          city: 'Guntur',
          region: 'Andhra Pradesh',
          country: 'India',
          lat: GUNTUR_DEFAULT.lat,
          lon: GUNTUR_DEFAULT.lon
        });
      }
      return res.json({
        city: data.city || GUNTUR_DEFAULT.city,
        region: data.region || GUNTUR_DEFAULT.region,
        country: data.country_name || data.country_code || GUNTUR_DEFAULT.country,
        lat: data.lat || GUNTUR_DEFAULT.lat,
        lon: data.lon || GUNTUR_DEFAULT.lon
      });
    }
  } catch (err) {
    // fallback
  }
  res.json({
    city: GUNTUR_DEFAULT.city,
    region: GUNTUR_DEFAULT.region,
    country: GUNTUR_DEFAULT.country,
    lat: GUNTUR_DEFAULT.lat,
    lon: GUNTUR_DEFAULT.lon
  });
}

export function getStatus(req, res) {
  res.json(weatherService.getStatus());
}

