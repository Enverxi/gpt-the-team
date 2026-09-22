import { describe, it, expect } from 'vitest';
import { geocodingService } from '../server/services/geocodingService.js';
import { timeService } from '../server/services/timeService.js';

describe('GeocodingService: Natural Landmarks & Countries', () => {
  it('resolves Himalayas to the mountain range', async () => {
    const results = await geocodingService.search('himalayas');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Himalayas');
    expect(results[0].displayName).toContain('Mountain Range');
    expect(results[0].lat).toBeCloseTo(28.0, 0);
  });

  it('resolves Finland to the country rather than US towns', async () => {
    const results = await geocodingService.search('finland');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Finland');
    expect(results[0].countryCode).toBe('FI');
    expect(results[0].displayName).toContain('Country');
  });

  it('resolves Guntur to India accurately', async () => {
    const results = await geocodingService.search('guntur');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Guntur');
    expect(results[0].country).toBe('India');
    expect(results[0].countryCode).toBe('IN');
  });
});

describe('TimeService: Location Time & Timezone Abbreviations', () => {
  it('assigns IST to Indian locations (e.g. Guntur)', () => {
    const info = timeService.getLocalTimeInfo({
      timezoneOffset: 19800,
      country: 'IN',
      region: 'Andhra Pradesh'
    });
    expect(info.timezone).toBe('IST');
    expect(info.formatted).toContain('IST');
    expect(info.time).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
  });

  it('assigns PST to California locations', () => {
    const info = timeService.getLocalTimeInfo({
      timezoneOffset: -25200,
      country: 'US',
      region: 'California'
    });
    expect(info.timezone).toBe('PST');
    expect(info.formatted).toContain('PST');
    expect(info.time).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
  });

  it('assigns EST to US Eastern locations', () => {
    const info = timeService.getLocalTimeInfo({
      timezoneOffset: -14400,
      country: 'US',
      region: 'New York'
    });
    expect(info.timezone).toBe('EST');
    expect(info.formatted).toContain('EST');
  });

  it('assigns EEST/EET to Finland', () => {
    const info = timeService.getLocalTimeInfo({
      timezoneOffset: 10800,
      country: 'FI',
      region: ''
    });
    expect(['EEST', 'EET']).toContain(info.timezone);
    expect(info.formatted).toMatch(/EE(S)?T/);
  });
});
