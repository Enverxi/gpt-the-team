import { WeatherApiProvider } from './weatherApiProvider.js';

/**
 * Backup Weather Provider: WeatherAPI.com
 */
export class BackupWeatherProvider extends WeatherApiProvider {
  constructor(apiKey, timeoutMs = 5000) {
    super(apiKey, timeoutMs, { isBackup: true });
  }
}
