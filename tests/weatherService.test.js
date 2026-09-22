import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherService } from '../server/services/weatherService.js';
import { createNormalizedWeather, validateWeatherData } from '../server/utils/weatherSchema.js';

describe('WeatherService & Failover Mechanism', () => {
  let weatherService;

  beforeEach(() => {
    weatherService = new WeatherService();
  });

  it('validates normalized weather data structure accurately', () => {
    const valid = createNormalizedWeather({
      location: { name: 'TestCity', region: 'TestRegion', country: 'TestCountry', lat: 10, lon: 20 },
      temperature: 24.5,
      condition: 'Sunny',
      hourlyForecast: [{ time: '2026-09-21 12:00', temp: 24 }]
    });

    expect(validateWeatherData(valid)).toBe(true);
    expect(validateWeatherData(null)).toBe(false);
    expect(validateWeatherData({})).toBe(false);
    expect(validateWeatherData({ location: { name: 'City' }, temperature: NaN })).toBe(false);
  });

  it('uses primary provider (OpenWeatherMap) when primary API succeeds', async () => {
    const mockData = createNormalizedWeather({
      location: { name: 'PrimaryCity' },
      temperature: 22,
      source: 'OpenWeatherMap (Primary)',
      isBackup: false
    });

    vi.spyOn(weatherService.primary, 'getWeather').mockResolvedValue(mockData);
    const backupSpy = vi.spyOn(weatherService.backup, 'getWeather');

    const result = await weatherService.getWeather({ lat: 10, lon: 20 }, { forceRefresh: true });

    expect(result.location.name).toBe('PrimaryCity');
    expect(result.source).toBe('OpenWeatherMap (Primary)');
    expect(result.isBackup).toBe(false);
    expect(backupSpy).not.toHaveBeenCalled();
  }, 15000);

  it('activates backup provider (WeatherAPI.com) when primary API fails (failover requirement)', async () => {
    vi.spyOn(weatherService.primary, 'getWeather').mockRejectedValue(new Error('OpenWeatherMap timeout'));

    const mockBackupData = createNormalizedWeather({
      location: { name: 'BackupCity' },
      temperature: 20,
      source: 'WeatherAPI.com (Backup)',
      isBackup: true
    });

    const backupSpy = vi.spyOn(weatherService.backup, 'getWeather').mockResolvedValue(mockBackupData);

    const result = await weatherService.getWeather('BackupCity', { forceRefresh: true });

    expect(result.location.name).toBe('BackupCity');
    expect(result.failoverActive).toBe(true);
    expect(result.source).toBe('WeatherAPI.com (Backup)');
    expect(backupSpy).toHaveBeenCalledWith('BackupCity');
  });

  it('throws a descriptive error when both primary and backup providers fail', async () => {
    vi.spyOn(weatherService.primary, 'getWeather').mockRejectedValue(new Error('OpenWeatherMap error'));
    vi.spyOn(weatherService.backup, 'getWeather').mockRejectedValue(new Error('WeatherAPI error'));

    await expect(weatherService.getWeather('UnknownCity', { forceRefresh: true }))
      .rejects
      .toThrow(/Unable to retrieve weather data from primary or backup provider/);
  });
});
