import { describe, it, expect } from 'vitest';
import { AlertService } from '../server/services/alertService.js';
import { createNormalizedWeather } from '../server/utils/weatherSchema.js';

describe('AlertService: Thresholds & Anti-Spam Frequency Logic', () => {
  const alertService = new AlertService();

  const baseWeather = createNormalizedWeather({
    temperature: 36, // Heat trigger (>35)
    windSpeed: 45,   // Wind trigger (>40)
    rainProbability: 75, // Rain trigger (>50)
    next3Hours: [
      { rainProbability: 75 }
    ]
  });

  it('triggers alerts when conditions exceed default thresholds', () => {
    const result = alertService.evaluateAlerts(baseWeather, {
      rainEnabled: true,
      heatEnabled: true,
      windEnabled: true
    });

    const alertTypes = result.alerts.map(a => a.type);
    expect(alertTypes).toContain('rain');
    expect(alertTypes).toContain('heat');
    expect(alertTypes).toContain('wind');
    expect(result.alerts.every(a => a.shouldNotify)).toBe(true);
  });

  it('suppresses alerts when a category is disabled by user', () => {
    const result = alertService.evaluateAlerts(baseWeather, {
      rainEnabled: false,
      heatEnabled: true,
      windEnabled: false
    });

    const alertTypes = result.alerts.map(a => a.type);
    expect(alertTypes).not.toContain('rain');
    expect(alertTypes).toContain('heat');
    expect(alertTypes).not.toContain('wind');
  });

  it('suppresses repeated alerts for persistent conditions (Anti-Spam, Section 28)', () => {
    const prefs = { rainEnabled: true, heatEnabled: false, windEnabled: false, rainThreshold: 50 };

    // Initial alert evaluation
    const firstResult = alertService.evaluateAlerts(baseWeather, prefs);
    expect(firstResult.alerts.length).toBe(1);
    expect(firstResult.alerts[0].shouldNotify).toBe(true);

    // Second evaluation with identical conditions within short window
    const secondResult = alertService.evaluateAlerts(
      baseWeather,
      prefs,
      firstResult.updatedHistory
    );

    expect(secondResult.alerts.length).toBe(1);
    expect(secondResult.alerts[0].shouldNotify).toBe(false);
    expect(secondResult.alerts[0].suppressed).toBe(true);
  });

  it('re-alerts when condition worsens significantly (e.g. rain probability jumps >= 25%)', () => {
    const history = {
      rain: { probability: 55, timestamp: Date.now() }
    };

    const worsenedWeather = createNormalizedWeather({
      rainProbability: 85, // 85 - 55 = +30% jump
      next3Hours: [{ rainProbability: 85 }]
    });

    const result = alertService.evaluateAlerts(
      worsenedWeather,
      { rainEnabled: true, rainThreshold: 50 },
      history
    );

    const rainAlert = result.alerts.find(a => a.type === 'rain');
    expect(rainAlert).toBeDefined();
    expect(rainAlert.shouldNotify).toBe(true);
  });
});
