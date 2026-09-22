import { config } from '../config.js';

export class TimeService {
  constructor() {
    this.apiKey = config.worldTimeApiKey;
    this.apiHost = config.worldTimeApiHost || 'world-clock.p.rapidapi.com';
    this.apiCache = new Map(); // short in-memory cache for API calls
  }

  /**
   * Fetch from RapidAPI World Clock API for standard timezone endpoints
   * Supported: 'pst', 'cst', 'mst', 'est', 'gmt', 'cet', 'utc'
   */
  async fetchWorldClock(zone = 'utc') {
    const zoneKey = zone.toLowerCase();
    const cacheEntry = this.apiCache.get(zoneKey);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < 60000) { // 1 min cache
      return cacheEntry.data;
    }

    try {
      const url = `https://${this.apiHost}/json/${zoneKey}/now`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && data.currentDateTime) {
          this.apiCache.set(zoneKey, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (err) {
      // Gracefully continue to internal deterministic timezone calculator
    }
    return null;
  }

  /**
   * Determine timezone abbreviation and formatted local time
   * @param {Object} params
   * @param {number} [params.timezoneOffset] Offset from UTC in seconds (e.g. 19800 for +5:30)
   * @param {string} [params.country] Country code or country name
   * @param {string} [params.region] State or region name
   * @param {number} [params.lat] Latitude
   * @param {number} [params.lon] Longitude
   * @param {string} [params.tz_id] IANA timezone ID (e.g. 'Asia/Kolkata')
   */
  getLocalTimeInfo({ timezoneOffset, country = '', region = '', lat = 0, lon = 0, tz_id = '' } = {}) {
    const cUpper = String(country || '').trim().toUpperCase();
    const rUpper = String(region || '').trim().toUpperCase();

    // 1. Resolve offset in seconds if not provided
    let offsetSec = typeof timezoneOffset === 'number' ? timezoneOffset : null;

    // Check specific known countries/regions
    const isIndia = cUpper === 'IN' || cUpper.includes('INDIA');
    const isCalifornia = rUpper.includes('CALIFORNIA') || rUpper === 'CA';
    const isUS = cUpper === 'US' || cUpper === 'USA' || cUpper.includes('UNITED STATES');
    const isFinland = cUpper === 'FI' || cUpper.includes('FINLAND');
    const isNepal = cUpper === 'NP' || cUpper.includes('NEPAL');
    const isUK = cUpper === 'GB' || cUpper === 'UK' || cUpper.includes('UNITED KINGDOM');
    const isJapan = cUpper === 'JP' || cUpper.includes('JAPAN');

    if (offsetSec === null) {
      if (isIndia) offsetSec = 19800;
      else if (isCalifornia) offsetSec = -25200; // PDT/PST
      else if (isFinland) offsetSec = 10800; // EEST/EET
      else if (isNepal) offsetSec = 20700; // NPT
      else if (isUK) offsetSec = 3600; // BST/GMT
      else if (isJapan) offsetSec = 32400; // JST
      else if (typeof lon === 'number' && lon !== 0) {
        offsetSec = Math.round(lon / 15) * 3600;
      } else {
        offsetSec = 0;
      }
    }

    // 2. Calculate local date using UTC offset
    const now = new Date();
    const utcEpoch = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetDate = new Date(utcEpoch + (offsetSec * 1000));

    let hours = targetDate.getHours();
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    // 3. Determine official timezone abbreviation
    let tzAbbr = 'UTC';

    if (isIndia) {
      tzAbbr = 'IST'; // Indian Standard Time
    } else if (isCalifornia) {
      tzAbbr = 'PST'; // Pacific Standard / Daylight Time
    } else if (isUS) {
      const words = rUpper.split(/[\s,]+/);
      const matchesState = (list) => list.some(s => rUpper === s || words.includes(s) || (s.length > 2 && rUpper.includes(s)));

      const usPacificStates = ['CALIFORNIA', 'CA', 'WASHINGTON', 'WA', 'OREGON', 'NEVADA', 'NV'];
      const usMountainStates = ['COLORADO', 'CO', 'ARIZONA', 'AZ', 'UTAH', 'UT', 'NEW MEXICO', 'NM', 'WYOMING', 'WY', 'IDAHO', 'ID', 'MONTANA', 'MT'];
      const usCentralStates = ['TEXAS', 'TX', 'ILLINOIS', 'IL', 'MISSOURI', 'MO', 'MINNESOTA', 'MN', 'WISCONSIN', 'WI', 'LOUISIANA', 'LA', 'ALABAMA', 'AL', 'TENNESSEE', 'TN'];
      const usEasternStates = ['NEW YORK', 'NY', 'FLORIDA', 'FL', 'PENNSYLVANIA', 'PA', 'MASSACHUSETTS', 'MA', 'GEORGIA', 'GA', 'NORTH CAROLINA', 'NC', 'VIRGINIA', 'VA', 'OHIO', 'OH', 'DISTRICT OF COLUMBIA', 'DC'];

      if (matchesState(usPacificStates) || offsetSec === -25200 || offsetSec === -28800) {
        tzAbbr = 'PST';
      } else if (matchesState(usMountainStates) || offsetSec === -21600) {
        tzAbbr = 'MST';
      } else if (matchesState(usCentralStates) || offsetSec === -18000) {
        tzAbbr = 'CST';
      } else if (matchesState(usEasternStates) || offsetSec === -14400) {
        tzAbbr = 'EST';
      } else if (rUpper.includes('ALASKA') || offsetSec === -32400) {
        tzAbbr = 'AKST';
      } else if (rUpper.includes('HAWAII') || offsetSec === -36000) {
        tzAbbr = 'HST';
      } else {
        tzAbbr = offsetSec <= -25200 ? 'PST' : (offsetSec <= -21600 ? 'MST' : (offsetSec <= -18000 ? 'CST' : 'EST'));
      }
    } else if (isFinland) {
      tzAbbr = offsetSec === 10800 ? 'EEST' : 'EET';
    } else if (isNepal || offsetSec === 20700) {
      tzAbbr = 'NPT';
    } else if (isUK) {
      tzAbbr = offsetSec === 3600 ? 'BST' : 'GMT';
    } else if (isJapan) {
      tzAbbr = 'JST';
    } else if (cUpper === 'AU' || cUpper.includes('AUSTRALIA')) {
      tzAbbr = 'AEST';
    } else if (cUpper === 'DE' || cUpper === 'FR' || cUpper === 'IT' || cUpper === 'ES') {
      tzAbbr = offsetSec === 7200 ? 'CEST' : 'CET';
    } else if (cUpper === 'CN' || cUpper.includes('CHINA')) {
      tzAbbr = 'CST';
    } else if (cUpper === 'BR' || cUpper.includes('BRAZIL')) {
      tzAbbr = 'BRT';
    } else {
      // Offset-based fallback abbreviation
      const sign = offsetSec >= 0 ? '+' : '-';
      const absOffsetHours = Math.floor(Math.abs(offsetSec) / 3600);
      const absOffsetMins = Math.floor((Math.abs(offsetSec) % 3600) / 60);
      tzAbbr = absOffsetMins > 0 
        ? `GMT${sign}${absOffsetHours}:${String(absOffsetMins).padStart(2, '0')}`
        : (absOffsetHours === 0 ? 'UTC' : `GMT${sign}${absOffsetHours}`);
    }

    return {
      time: timeStr,
      timezone: tzAbbr,
      formatted: `${timeStr} ${tzAbbr}`
    };
  }
}

export const timeService = new TimeService();
