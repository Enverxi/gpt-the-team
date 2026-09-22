/**
 * Intelligent Multi-Tier Geocoding Service
 * Resolves natural landmarks (e.g. Himalayas, Alps), countries (e.g. Finland),
 * regions, and municipalities worldwide.
 */

import { findLocalities } from '../data/localities.js';

// Curated dictionary for world-famous natural landmarks, mountain ranges, and countries
const CURATED_LOCATIONS = {
  'himalayas': {
    name: 'Himalayas',
    lat: 28.00,
    lon: 84.00,
    country: 'Asia',
    countryCode: '',
    region: 'Mountain Range',
    displayName: 'Himalayas (Mountain Range)'
  },
  'himalaya': {
    name: 'Himalayas',
    lat: 28.00,
    lon: 84.00,
    country: 'Asia',
    countryCode: '',
    region: 'Mountain Range',
    displayName: 'Himalayas (Mountain Range)'
  },
  'finland': {
    name: 'Finland',
    lat: 64.00,
    lon: 26.00,
    country: 'Finland',
    countryCode: 'FI',
    region: 'Europe',
    displayName: 'Finland (Country)'
  },
  'alps': {
    name: 'The Alps',
    lat: 46.42,
    lon: 10.00,
    country: 'Europe',
    countryCode: '',
    region: 'Mountain Range',
    displayName: 'The Alps (Mountain Range)'
  },
  'the alps': {
    name: 'The Alps',
    lat: 46.42,
    lon: 10.00,
    country: 'Europe',
    countryCode: '',
    region: 'Mountain Range',
    displayName: 'The Alps (Mountain Range)'
  },
  'mount everest': {
    name: 'Mount Everest',
    lat: 27.988,
    lon: 86.925,
    country: 'Nepal',
    countryCode: 'NP',
    region: 'Himalayas',
    displayName: 'Mount Everest, Nepal (Mountain)'
  },
  'everest': {
    name: 'Mount Everest',
    lat: 27.988,
    lon: 86.925,
    country: 'Nepal',
    countryCode: 'NP',
    region: 'Himalayas',
    displayName: 'Mount Everest, Nepal (Mountain)'
  },
  'rockies': {
    name: 'Rocky Mountains',
    lat: 39.73,
    lon: -104.99,
    country: 'United States',
    countryCode: 'US',
    region: 'Mountain Range',
    displayName: 'Rocky Mountains (Mountain Range)'
  },
  'rocky mountains': {
    name: 'Rocky Mountains',
    lat: 39.73,
    lon: -104.99,
    country: 'United States',
    countryCode: 'US',
    region: 'Mountain Range',
    displayName: 'Rocky Mountains (Mountain Range)'
  },
  'andes': {
    name: 'Andes',
    lat: -32.65,
    lon: -70.01,
    country: 'South America',
    countryCode: '',
    region: 'Mountain Range',
    displayName: 'Andes (Mountain Range)'
  },
  'california': {
    name: 'California',
    lat: 36.778,
    lon: -119.417,
    country: 'United States',
    countryCode: 'US',
    region: 'California',
    displayName: 'California, United States'
  },
  'sahara': {
    name: 'Sahara Desert',
    lat: 23.416,
    lon: 25.663,
    country: 'Africa',
    countryCode: '',
    region: 'Desert',
    displayName: 'Sahara Desert (Africa)'
  },
  'sahara desert': {
    name: 'Sahara Desert',
    lat: 23.416,
    lon: 25.663,
    country: 'Africa',
    countryCode: '',
    region: 'Desert',
    displayName: 'Sahara Desert (Africa)'
  },
  'grand canyon': {
    name: 'Grand Canyon',
    lat: 36.054,
    lon: -112.14,
    country: 'United States',
    countryCode: 'US',
    region: 'Arizona',
    displayName: 'Grand Canyon, Arizona, US'
  },
  'antarctica': {
    name: 'Antarctica',
    lat: -82.86,
    lon: 135.00,
    country: 'Antarctica',
    countryCode: 'AQ',
    region: 'Polar Region',
    displayName: 'Antarctica'
  }
};

export class GeocodingService {
  /**
   * Search locations using Open-Meteo Geocoding API + Curated Knowledge
   */
  async search(query) {
    if (!query || query.trim().length < 2) return [];
    const qLower = query.trim().toLowerCase();
    const results = [];

    // 0. Check target localities (Guntur, Hyderabad, Mangalore, Srinagar, Andaman, Gandhinagar)
    const localityMatches = findLocalities(query);
    for (const loc of localityMatches) {
      results.push({
        name: loc.name,
        region: loc.region,
        country: loc.country,
        countryCode: loc.countryCode,
        lat: loc.lat,
        lon: loc.lon,
        displayName: loc.displayName,
        isLocality: true
      });
    }

    // 1. Check curated exact matches first
    if (CURATED_LOCATIONS[qLower]) {
      results.push({ ...CURATED_LOCATIONS[qLower] });
    }

    // 2. Query Open-Meteo Geocoding API (supports global natural features, countries, cities)
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const items = data.results || [];

        // Sort items: Put countries (PCLI) and mountain ranges (MTS/MT) first if query matches name
        items.sort((a, b) => {
          const aNameLower = (a.name || '').toLowerCase();
          const bNameLower = (b.name || '').toLowerCase();
          const aExact = aNameLower === qLower;
          const bExact = bNameLower === qLower;

          const aIsCountryOrMtn = a.feature_code === 'PCLI' || a.feature_code === 'MTS' || a.feature_code === 'MT';
          const bIsCountryOrMtn = b.feature_code === 'PCLI' || b.feature_code === 'MTS' || b.feature_code === 'MT';

          if (aExact && aIsCountryOrMtn && !(bExact && bIsCountryOrMtn)) return -1;
          if (bExact && bIsCountryOrMtn && !(aExact && aIsCountryOrMtn)) return 1;
          if (aExact && !bExact) return -1;
          if (bExact && !aExact) return 1;
          return 0;
        });

        for (const item of items) {
          // Avoid duplicate with curated item
          const isDup = results.some(r => Math.abs(r.lat - item.latitude) < 0.1 && Math.abs(r.lon - item.longitude) < 0.1);
          if (isDup) continue;

          let displayName = item.name;
          const countryName = item.country || item.country_code || '';
          const admin1 = item.admin1 || '';

          if (item.feature_code === 'PCLI') {
            displayName = `${item.name} (Country)`;
          } else if (item.feature_code === 'MTS') {
            displayName = `${item.name} (Mountain Range)`;
          } else if (item.feature_code === 'MT') {
            displayName = `${item.name}${countryName ? `, ${countryName}` : ''} (Mountain)`;
          } else {
            displayName = `${item.name}${admin1 ? `, ${admin1}` : ''}${countryName ? `, ${countryName}` : ''}`;
          }

          results.push({
            name: item.name,
            region: admin1,
            country: countryName,
            countryCode: item.country_code || '',
            lat: Math.round(item.latitude * 10000) / 10000,
            lon: Math.round(item.longitude * 10000) / 10000,
            displayName,
            featureCode: item.feature_code
          });
        }
      }
    } catch (err) {
      // Graceful degradation
    }

    return results;
  }

  /**
   * Resolve a string location query to explicit coordinates
   */
  async resolveQueryToCoordinates(query) {
    if (!query || typeof query !== 'string') return null;
    const qLower = query.trim().toLowerCase();

    // 0. Check target localities first
    const localityMatches = findLocalities(query);
    if (localityMatches.length > 0) {
      const best = localityMatches[0];
      return {
        name: best.name,
        region: best.region,
        country: best.country,
        countryCode: best.countryCode,
        lat: best.lat,
        lon: best.lon,
        displayName: best.displayName
      };
    }

    // 1. Direct curated match
    if (CURATED_LOCATIONS[qLower]) {
      return { ...CURATED_LOCATIONS[qLower] };
    }

    // 2. Check for curated substring matches (e.g. "himalayas mountain", "finland country")
    for (const [key, val] of Object.entries(CURATED_LOCATIONS)) {
      if (qLower.includes(key) || key.includes(qLower)) {
        return { ...val };
      }
    }

    // 3. Search via multi-tier geocoding
    try {
      const searchResults = await this.search(query);
      if (searchResults && searchResults.length > 0) {
        return searchResults[0];
      }
    } catch (err) {
      // ignore
    }

    return null;
  }
}

export const geocodingService = new GeocodingService();
