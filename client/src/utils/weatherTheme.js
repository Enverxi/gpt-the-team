/**
 * Dynamic Weather Theme Classifier
 * Maps real-time weather conditions & temperatures to theme keys:
 * - rainy: Rain, drizzle, showers (cool petrichor, aqua/cyan glass, water mist)
 * - stormy: Thunder, lightning, storm (electric violet, deep indigo slate)
 * - snowy: Snow, blizzard, sleet, ice, flurries (frost crystal, ice-blue glass)
 * - warm: Hot/warm sunny weather >= 28°C (sunset coral, flame amber)
 * - sunny: Clear/sunny daytime < 28°C (golden solar radiance, warm sun-kissed glass)
 * - night: Clear or overcast nocturnal (midnight obsidian, moonlight celestial indigo)
 * - cloudy: Overcast/cloudy daytime (cool silver mist, slate overcast)
 */
export function getDetailedWeatherTheme(weatherData) {
  if (!weatherData) return 'sunny';

  const cond = (weatherData.condition || '').toLowerCase();
  const temp = typeof weatherData.temperature === 'number' ? weatherData.temperature : 20;

  // 1. Snow / Freezing conditions or sub-zero temperatures (<= 0°C)
  if (
    temp <= 0 ||
    cond.includes('snow') ||
    cond.includes('blizzard') ||
    cond.includes('sleet') ||
    cond.includes('ice') ||
    cond.includes('flurr') ||
    cond.includes('freezing')
  ) {
    return 'snowy';
  }

  // 2. Thunderstorm / Electric conditions
  if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
    return 'stormy';
  }

  // 3. Rain / Drizzle / Showers
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return 'rainy';
  }

  // 4. Night determination
  const isNight = (() => {
    if (typeof weatherData.isDay === 'boolean') {
      return !weatherData.isDay;
    }
    if (weatherData.location?.localtime && typeof weatherData.location.localtime === 'string') {
      const parts = weatherData.location.localtime.split(' ');
      if (parts[1]) {
        const hour = parseInt(parts[1].split(':')[0], 10);
        if (!isNaN(hour)) {
          return hour < 6 || hour >= 19;
        }
      }
    }
    const currentHour = new Date().getHours();
    return currentHour < 6 || currentHour >= 19;
  })();

  if (isNight) {
    return 'night';
  }

  // 5. Warm / Hot weather (>= 28°C / 82.4°F)
  if (temp >= 28) {
    return 'warm';
  }

  // 6. Sunny / Clear daylight
  if (cond.includes('sun') || cond.includes('clear')) {
    return 'sunny';
  }

  // 7. Cloudy / Overcast daylight
  return 'cloudy';
}
