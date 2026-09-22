import { OpenWeatherMapProvider } from './openWeatherMapProvider.js';

/**
 * Primary Weather Provider: OpenWeatherMap
 */
export class PrimaryWeatherProvider extends OpenWeatherMapProvider {
  constructor(apiKey, timeoutMs = 5000) {
    super(apiKey, timeoutMs, { isBackup: false });
  }
}
