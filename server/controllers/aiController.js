import { aiService } from '../services/aiService.js';
import { weatherService } from '../services/weatherService.js';
import { detectMentionedLocality } from '../data/localities.js';

export async function askAI(req, res) {
  try {
    const { question, weatherData, city, lat, lon } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Detect if the user question references a specific locality in our target cities
    const mentionedLocality = detectMentionedLocality(question);
    let weather = weatherData;
    let localityContext = mentionedLocality || null;

    if (mentionedLocality) {
      const currentLocName = (weather?.location?.name || '').toLowerCase();
      const parentCityName = mentionedLocality.parentCity.toLowerCase();

      // If no weather was passed or current weather is for a different city, fetch live weather for the locality
      if (!weather || (!currentLocName.includes(parentCityName) && !parentCityName.includes(currentLocName))) {
        try {
          weather = await weatherService.getWeather({ lat: mentionedLocality.lat, lon: mentionedLocality.lon });
          if (weather?.location) {
            weather.location.locality = mentionedLocality.name;
            weather.location.name = `${mentionedLocality.name}, ${mentionedLocality.parentCity}`;
          }
        } catch (fetchErr) {
          console.warn('[AIController] Failed to fetch weather for mentioned locality, using fallback:', fetchErr.message);
        }
      }
    }

    // If client did not provide weatherData, fetch it from lat/lon or city
    if (!weather) {
      if (lat && lon) {
        weather = await weatherService.getWeather({ lat, lon });
      } else if (city) {
        weather = await weatherService.getWeather(city);
      } else {
        return res.status(400).json({ error: 'Weather context or location is required for AI interpretation' });
      }
    }

    const result = await aiService.processQuery(question, weather, localityContext);
    res.json(result);
  } catch (err) {
    console.error('[AIController] Error:', err.message);
    res.status(500).json({
      error: 'AI service temporarily unavailable',
      message: 'AI assistance is temporarily unavailable. Current weather data is still available.',
      details: err.message
    });
  }
}
