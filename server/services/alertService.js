/**
 * Alert Evaluation & Anti-Spam Service
 */

export class AlertService {
  /**
   * Evaluate whether weather data triggers any alerts based on user-configured thresholds
   * @param {Object} weather - Normalized weather object
   * @param {Object} preferences - User alert settings and thresholds
   * @param {Object} alertHistory - Previous alerts recorded in the user's session
   */
  evaluateAlerts(weather, preferences = {}, alertHistory = {}) {
    const defaultPrefs = {
      rainEnabled: true,
      rainThreshold: 50, // %
      heatEnabled: true,
      heatThreshold: 35, // °C
      windEnabled: true,
      windThreshold: 40, // km/h
      uvEnabled: true,
      uvThreshold: 8,
      severeEnabled: true
    };

    const config = { ...defaultPrefs, ...preferences };
    const triggeredAlerts = [];
    const updatedHistory = { ...alertHistory };

    // 1. Rain Alert Evaluation
    if (config.rainEnabled) {
      const maxNext3HoursRain = weather.next3Hours.length > 0
        ? Math.max(...weather.next3Hours.map(h => h.rainProbability))
        : weather.rainProbability;

      if (maxNext3HoursRain >= config.rainThreshold || weather.precipitation >= 2) {
        const lastRain = alertHistory.rain;
        // Anti-spam: Only re-alert if rain probability jumped by >= 25% or wasn't alerted in the last 2 hours
        const significantIncrease = lastRain && (maxNext3HoursRain - lastRain.probability >= 25);
        const timeExpired = !lastRain || (Date.now() - lastRain.timestamp > 7200000); // 2h

        const shouldNotify = !lastRain || significantIncrease || timeExpired;

        triggeredAlerts.push({
          id: 'rain-alert',
          type: 'rain',
          title: 'Rain Expected',
          message: `Rain probability is ${maxNext3HoursRain}% over the coming hours with precipitation around ${weather.precipitation} mm.`,
          severity: maxNext3HoursRain >= 80 ? 'high' : 'medium',
          shouldNotify,
          suppressed: !shouldNotify,
          timestamp: Date.now()
        });

        if (shouldNotify) {
          updatedHistory.rain = { probability: maxNext3HoursRain, timestamp: Date.now() };
        }
      }
    }

    // 2. Heat Alert Evaluation
    if (config.heatEnabled) {
      if (weather.temperature >= config.heatThreshold || weather.feelsLike >= config.heatThreshold + 2) {
        const lastHeat = alertHistory.heat;
        const significantIncrease = lastHeat && (weather.temperature - lastHeat.temperature >= 3);
        const timeExpired = !lastHeat || (Date.now() - lastHeat.timestamp > 7200000);

        const shouldNotify = !lastHeat || significantIncrease || timeExpired;

        triggeredAlerts.push({
          id: 'heat-alert',
          type: 'heat',
          title: 'High Heat Advisory',
          message: `Current temperature is ${weather.temperature}°C (feels like ${weather.feelsLike}°C). Stay hydrated and limit prolonged outdoor exposure.`,
          severity: weather.temperature >= 40 ? 'high' : 'medium',
          shouldNotify,
          suppressed: !shouldNotify,
          timestamp: Date.now()
        });

        if (shouldNotify) {
          updatedHistory.heat = { temperature: weather.temperature, timestamp: Date.now() };
        }
      }
    }

    // 3. Strong Wind Alert Evaluation
    if (config.windEnabled) {
      if (weather.windSpeed >= config.windThreshold) {
        const lastWind = alertHistory.wind;
        const significantIncrease = lastWind && (weather.windSpeed - lastWind.speed >= 15);
        const timeExpired = !lastWind || (Date.now() - lastWind.timestamp > 7200000);

        const shouldNotify = !lastWind || significantIncrease || timeExpired;

        triggeredAlerts.push({
          id: 'wind-alert',
          type: 'wind',
          title: 'Strong Wind Warning',
          message: `Sustained winds of ${weather.windSpeed} km/h detected. Secure outdoor objects and exercise caution outdoors.`,
          severity: weather.windSpeed >= 60 ? 'high' : 'medium',
          shouldNotify,
          suppressed: !shouldNotify,
          timestamp: Date.now()
        });

        if (shouldNotify) {
          updatedHistory.wind = { speed: weather.windSpeed, timestamp: Date.now() };
        }
      }
    }

    // 4. Official Severe Weather Alert Evaluation
    if (config.severeEnabled && weather.alerts && weather.alerts.length > 0) {
      weather.alerts.forEach((alert, index) => {
        const alertId = `official-${alert.headline || alert.event}-${index}`;
        const lastOfficial = alertHistory[alertId];
        const shouldNotify = !lastOfficial || (Date.now() - lastOfficial.timestamp > 14400000); // 4h

        triggeredAlerts.push({
          id: alertId,
          type: 'severe',
          title: alert.headline || alert.event || 'Severe Weather Warning',
          message: alert.desc || alert.event,
          severity: 'severe',
          isOfficial: true,
          shouldNotify,
          suppressed: !shouldNotify,
          timestamp: Date.now()
        });

        if (shouldNotify) {
          updatedHistory[alertId] = { timestamp: Date.now() };
        }
      });
    }

    return {
      alerts: triggeredAlerts,
      updatedHistory
    };
  }
}

export const alertService = new AlertService();
