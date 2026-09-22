import React, { useMemo } from 'react';

/**
 * WeatherAnimation:
 * Dynamic Mount Fuji Background system.
 * Reacts dynamically to real-time weather & time of day:
 * - Sunny: Golden sunlit snow-capped Mount Fuji with solar radiance & cherry blossom lake.
 * - Night: Dark Mount Fuji under starry night sky & crescent moon.
 * - Rain: Atmospheric blurry rain view of Mount Fuji with falling rain streaks.
 * - Snow: Winter wonderland Mount Fuji with gentle drifting snowflakes.
 */
export default function WeatherAnimation({
  temperature = 20,
  condition = 'Clear',
  isDay = true,
  localtime = null,
  theme = 'sunny'
}) {
  const condLower = (condition || '').toLowerCase();

  // 1. Weather state determinations
  const isSnow =
    (typeof temperature === 'number' && temperature <= 0) ||
    condLower.includes('snow') ||
    condLower.includes('blizzard') ||
    condLower.includes('sleet') ||
    condLower.includes('ice') ||
    condLower.includes('flurr') ||
    condLower.includes('freezing');

  const isThunder =
    !isSnow &&
    (condLower.includes('thunder') ||
      condLower.includes('storm') ||
      condLower.includes('lightning'));

  const isRain =
    !isSnow &&
    (isThunder ||
      condLower.includes('rain') ||
      condLower.includes('drizzle') ||
      condLower.includes('shower'));

  // 2. Day vs Night determination
  const isNight = useMemo(() => {
    // If API explicitly provides isDay flag
    if (typeof isDay === 'boolean') {
      return !isDay;
    }
    // Parse localtime string if available ("2026-09-21 21:30")
    if (localtime && typeof localtime === 'string') {
      const parts = localtime.split(' ');
      if (parts[1]) {
        const hour = parseInt(parts[1].split(':')[0], 10);
        if (!isNaN(hour)) {
          return hour < 6 || hour >= 19;
        }
      }
    }
    // Fallback to local clock
    const currentHour = new Date().getHours();
    return currentHour < 6 || currentHour >= 19;
  }, [isDay, localtime]);

  const isSunny =
    !isNight &&
    !isSnow &&
    !isRain &&
    (condLower.includes('sun') || condLower.includes('clear'));

  // Determine active background scene
  let activeScene = 'sunny';
  if (isSnow) {
    activeScene = 'snow';
  } else if (isRain || isThunder) {
    activeScene = 'rain';
  } else if (isNight) {
    activeScene = 'night';
  } else {
    activeScene = 'sunny';
  }

  // Generate rain drops
  const rainDrops = useMemo(() => {
    if (!isRain && !isThunder) return [];
    const count = isThunder ? 40 : 26;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * (100 / count) + (Math.sin(i * 99) * 1.5 + 1.5)).toFixed(1)}%`,
      delay: `${((i * 0.13) % 2).toFixed(2)}s`,
      duration: `${(0.75 + ((i % 5) * 0.1)).toFixed(2)}s`,
      opacity: (0.35 + ((i % 4) * 0.15)).toFixed(2)
    }));
  }, [isRain, isThunder]);

  // Generate snow particles
  const snowflakes = useMemo(() => {
    if (!isSnow) return [];
    const count = 35;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * (100 / count) + (Math.cos(i * 33) * 2 + 2)).toFixed(1)}%`,
      delay: `${((i * 0.22) % 4).toFixed(2)}s`,
      duration: `${(3.5 + ((i % 6) * 0.8)).toFixed(2)}s`,
      size: `${(4 + (i % 5) * 2)}px`,
      opacity: (0.4 + ((i % 4) * 0.18)).toFixed(2)
    }));
  }, [isSnow]);

  // Generate night stars
  const stars = useMemo(() => {
    if (!isNight) return [];
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${(i * 4.2 + (Math.sin(i * 12) * 2)).toFixed(1)}%`,
      top: `${(4 + (i % 6) * 7).toFixed(1)}%`,
      delay: `${((i * 0.3) % 3).toFixed(2)}s`,
      duration: `${(2 + (i % 4) * 0.8).toFixed(2)}s`,
      size: `${(1.5 + (i % 3) * 0.8)}px`
    }));
  }, [isNight]);

  return (
    <div className={`fuji-background-wrapper scene-${activeScene} theme-${theme}`} aria-hidden="true">
      {/* 1. Preloaded Mount Fuji Base Background Layers with smooth crossfade */}
      <div
        className={`fuji-bg-layer fuji-sunny ${activeScene === 'sunny' ? 'active' : ''} ${theme === 'warm' ? 'warm-tint' : ''}`}
        style={{ backgroundImage: "url('/backgrounds/fuji_sunny.jpg')" }}
      />
      <div
        className={`fuji-bg-layer fuji-night ${activeScene === 'night' ? 'active' : ''}`}
        style={{ backgroundImage: "url('/backgrounds/fuji_night.jpg')" }}
      />
      <div
        className={`fuji-bg-layer fuji-rain ${activeScene === 'rain' ? 'active' : ''}`}
        style={{ backgroundImage: "url('/backgrounds/fuji_rain.jpg')" }}
      />
      <div
        className={`fuji-bg-layer fuji-snow ${activeScene === 'snow' ? 'active' : ''}`}
        style={{ backgroundImage: "url('/backgrounds/fuji_snow.jpg')" }}
      />

      {/* 2. Rainy Blur & Glass Moisture Layer */}
      {(isRain || isThunder) && (
        <div className="fuji-rain-blur-overlay">
          <div className="rain-streaks-container">
            {rainDrops.map((drop) => (
              <div
                key={drop.id}
                className="raindrop-streak"
                style={{
                  left: drop.left,
                  animationDelay: drop.delay,
                  animationDuration: drop.duration,
                  opacity: drop.opacity
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Thunderstorm Lightning Flash */}
      {isThunder && <div className="fuji-lightning-flash" />}

      {/* 4. Snowy Wonderland Particles */}
      {isSnow && (
        <div className="fuji-snowfall-container">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="snowflake-particle"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
                opacity: flake.opacity
              }}
            />
          ))}
        </div>
      )}

      {/* 5. Sunny Solar Radiance & Golden/Warm Ambient Glow */}
      {(isSunny || theme === 'warm') && (
        <div className={`fuji-sunny-radiance ${theme === 'warm' ? 'radiance-warm' : ''}`}>
          <div className="fuji-solar-corona" />
          <div className="fuji-warm-bloom" />
        </div>
      )}

      {/* 6. Night Sky Twinkling Stars & Darkness Overlay */}
      {isNight && (
        <div className="fuji-night-atmosphere">
          <div className="fuji-dark-vignette" />
          {stars.map((star) => (
            <div
              key={star.id}
              className="fuji-twinkle-star"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration
              }}
            />
          ))}
        </div>
      )}

      {/* 7. Readability & Contrast Gradient Overlay */}
      <div className="fuji-contrast-overlay" />
    </div>
  );
}
