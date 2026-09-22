import { describe, it, expect } from 'vitest';
import { findLocalities, detectMentionedLocality, TARGET_CITIES } from '../server/data/localities.js';
import { geocodingService } from '../server/services/geocodingService.js';
import { aiService } from '../server/services/aiService.js';

describe('Localities & Neighborhood Directory', () => {
  it('covers all 6 required target cities', () => {
    const keys = Object.keys(TARGET_CITIES);
    expect(keys).toContain('guntur');
    expect(keys).toContain('hyderabad');
    expect(keys).toContain('mangalore');
    expect(keys).toContain('srinagar');
    expect(keys).toContain('andaman');
    expect(keys).toContain('gandhinagar');
  });

  it('contains specific requested areas in Guntur', () => {
    const gunturLocs = TARGET_CITIES.guntur.localities.map(l => l.name.toLowerCase());
    expect(gunturLocs).toContain('nehru nagar');
    expect(gunturLocs).toContain('vidhyanagar');
    expect(gunturLocs).toContain('lakshmipuram');
    expect(gunturLocs).toContain('amaravati road');
  });

  it('detects mentioned localities in natural conversation strings', () => {
    const d1 = detectMentionedLocality('How is the weather in NehruNagar?');
    expect(d1).not.toBeNull();
    expect(d1.name).toBe('Nehru Nagar');
    expect(d1.parentCity).toBe('Guntur');

    const d2 = detectMentionedLocality('Will it rain around Vidhyanagar in Guntur?');
    expect(d2).not.toBeNull();
    expect(d2.name).toBe('Vidhyanagar');

    const d3 = detectMentionedLocality('What should I wear in lakshmipuram?');
    expect(d3).not.toBeNull();
    expect(d3.name).toBe('Lakshmipuram');

    const d4 = detectMentionedLocality('Can I drive on Amaravati Road?');
    expect(d4).not.toBeNull();
    expect(d4.name).toBe('Amaravati Road');

    const d5 = detectMentionedLocality('Is Banjara Hills traffic bad right now?');
    expect(d5).not.toBeNull();
    expect(d5.parentCity).toBe('Hyderabad');

    const d6 = detectMentionedLocality('Can I swim at Panambur beach?');
    expect(d6).not.toBeNull();
    expect(d6.parentCity).toBe('Mangalore');

    const d7 = detectMentionedLocality('Is it snowing at Dal Gate?');
    expect(d7).not.toBeNull();
    expect(d7.parentCity).toBe('Srinagar');

    const d8 = detectMentionedLocality('Ferry timing to Havelock Island?');
    expect(d8).not.toBeNull();
    expect(d8.parentCity).toBe('Andaman and Nicobar');

    const d9 = detectMentionedLocality('Weather in GIFT City?');
    expect(d9).not.toBeNull();
    expect(d9.parentCity).toBe('Gandhinagar');
  });

  it('resolves localities directly in geocodingService', async () => {
    const res = await geocodingService.search('NehruNagar');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].displayName).toContain('Nehru Nagar');
    expect(res[0].displayName).toContain('Guntur');
    expect(res[0].lat).toBeCloseTo(16.312, 2);
    expect(res[0].lon).toBeCloseTo(80.443, 2);
  });

  it('processes queries with locality context grounded in weather telemetry', async () => {
    const mockWeather = {
      temperature: 28,
      feelsLike: 31,
      condition: 'Clear',
      rainProbability: 5,
      precipitation: 0,
      humidity: 60,
      windSpeed: 10,
      uvIndex: 6,
      isDay: 1,
      location: { name: 'Guntur', country: 'India', localtime: '14:30' },
      hourlyForecast: [
        { temp: 28, rainProbability: 5, condition: 'Clear', windSpeed: 10, timeEpoch: Math.floor(Date.now() / 1000) }
      ]
    };

    const locality = {
      name: 'Nehru Nagar',
      parentCity: 'Guntur',
      state: 'Andhra Pradesh',
      country: 'India',
      lat: 16.312,
      lon: 80.443,
      note: 'Central residential and commercial area in Guntur'
    };

    const result = await aiService.processQuery('Can I go jogging in Nehru Nagar?', mockWeather, locality);
    expect(result).toBeDefined();
    expect(result.answer).toBeDefined();
    expect(typeof result.answer).toBe('string');
    expect(result.factors.length).toBeGreaterThan(0);
  }, 20000);
});
