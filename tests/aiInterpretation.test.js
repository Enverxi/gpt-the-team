import { describe, it, expect } from 'vitest';
import { AIService } from '../server/services/aiService.js';
import { createNormalizedWeather } from '../server/utils/weatherSchema.js';

describe('AIService: Natural Language Interpretation & Grounding', () => {
  const aiService = new AIService();
  // Ensure unit test evaluates grounded logic deterministically without external network latency
  aiService.geminiApiKey = '';

  const mockWeather = createNormalizedWeather({
    location: { name: 'MetroCity', country: 'Testland' },
    temperature: 28,
    feelsLike: 31,
    condition: 'Partly Cloudy',
    rainProbability: 15,
    precipitation: 0,
    windSpeed: 14,
    uvIndex: 6,
    hourlyForecast: [
      { time: '2026-09-21 14:00', timeEpoch: 1789995600, temp: 28, rainProbability: 20, precip: 0, windSpeed: 12, condition: 'Partly Cloudy' },
      { time: '2026-09-21 15:00', timeEpoch: 1789999200, temp: 29, rainProbability: 65, precip: 2.1, windSpeed: 15, condition: 'Light Rain' },
      { time: '2026-09-21 16:00', timeEpoch: 1790002800, temp: 27, rainProbability: 80, precip: 4.5, windSpeed: 18, condition: 'Moderate Rain' },
      { time: '2026-09-21 18:00', timeEpoch: 1790010000, temp: 25, rainProbability: 10, precip: 0, windSpeed: 8, condition: 'Clear' },
      { time: '2026-09-22 10:00', timeEpoch: 1790067600, temp: 24, rainProbability: 5, precip: 0, windSpeed: 10, condition: 'Sunny' }
    ],
    next3Hours: [
      { time: '2026-09-21 14:00', timeEpoch: 1789995600, temp: 28, rainProbability: 20, precip: 0, windSpeed: 12, condition: 'Partly Cloudy' },
      { time: '2026-09-21 15:00', timeEpoch: 1789999200, temp: 29, rainProbability: 65, precip: 2.1, windSpeed: 15, condition: 'Light Rain' },
      { time: '2026-09-21 16:00', timeEpoch: 1790002800, temp: 27, rainProbability: 80, precip: 4.5, windSpeed: 18, condition: 'Moderate Rain' }
    ]
  });

  it('triggers clarification for ambiguous queries (Section 18)', async () => {
    const result = await aiService.processQuery('Will it rain later?', mockWeather);
    expect(result.isClarification).toBe(true);
    expect(result.answer).toContain('What time are you planning to go out?');
  });

  it('correctly analyzes 3-hour rain trend with recommendations (Section 47)', async () => {
    const result = await aiService.processQuery('Will it rain in the next 3 hours?', mockWeather);
    expect(result.isClarification).toBe(false);
    expect(result.answer.toLowerCase()).toContain('rain is likely');
    expect(result.answer.toLowerCase()).toContain('umbrella');
    expect(result.factors.length).toBeGreaterThan(0);
    // Strict requirement: No emojis in response
    expect(/\p{Extended_Pictographic}/u.test(result.answer)).toBe(false);
  });

  it('answers umbrella queries based strictly on rain probability', async () => {
    const result = await aiService.processQuery('Do I need an umbrella?', mockWeather);
    expect(result.answer.toLowerCase()).toContain('umbrella');
    expect(result.factors).toEqual(expect.arrayContaining([expect.stringContaining('Rain Probability')]));
    // No emojis
    expect(/\p{Extended_Pictographic}/u.test(result.answer)).toBe(false);
  });

  it('provides weather-based risk context for travel queries without absolute safety guarantees (Section 24)', async () => {
    const result = await aiService.processQuery('Is it safe to travel now?', mockWeather);
    expect(result.answer.toLowerCase()).not.toContain('completely safe');
    expect(result.answer.toLowerCase()).toContain('guidance');
    expect(result.answer.toLowerCase()).toContain('guarantee of personal safety');
    expect(/\p{Extended_Pictographic}/u.test(result.answer)).toBe(false);
  });

  it('interprets specific time queries e.g. "at 6 PM" (Section 17)', async () => {
    const result = await aiService.processQuery('What will the weather be at 6 PM?', mockWeather);
    expect(result.timeScope).toBe('specific_time');
    expect(result.answer.toLowerCase()).toContain('6 pm');
    expect(/\p{Extended_Pictographic}/u.test(result.answer)).toBe(false);
  });

  it('interprets "tomorrow" queries', async () => {
    const result = await aiService.processQuery('What will the weather be tomorrow?', mockWeather);
    expect(result.timeScope).toBe('tomorrow');
    expect(result.answer.toLowerCase()).toContain('tomorrow');
    expect(/\p{Extended_Pictographic}/u.test(result.answer)).toBe(false);
  });
});
