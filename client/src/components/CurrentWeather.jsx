import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { formatTemp, formatSpeed } from '../utils/unitConverter';
import { getDetailedWeatherTheme } from '../utils/weatherTheme';

export default function CurrentWeather() {
  const { weatherData, units } = useWeather();

  if (!weatherData) return null;

  const {
    location,
    temperature,
    feelsLike,
    condition,
    conditionIcon,
    rainProbability,
    humidity,
    windSpeed,
    windDirection,
    uvIndex,
    visibility,
    pressure,
    source,
    lastUpdated
  } = weatherData;

  const themeKey = getDetailedWeatherTheme(weatherData);

  const moodLabels = {
    rainy: 'Rainy Atmosphere',
    stormy: 'Electric Storm',
    snowy: 'Winter Snow',
    warm: 'Warm & Sunlit',
    sunny: 'Clear Daylight',
    night: 'Starry Night',
    cloudy: 'Overcast Sky'
  };

  return (
    <div className="current-card glass-card">
      <div className="current-card-header">
        <div>
          <div className="location-title">
            <span>{location.name}</span>
            {location.country && <span className="country-pill">{location.country}</span>}
            {location.timeDisplay && (
              <span className="location-time-pill" title={`Local Time: ${location.timeDisplay}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-1px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {location.timeDisplay}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="last-updated">Last updated: {lastUpdated}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span className="data-source-attribution" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Source: {source}</span>
          </div>
        </div>

        <div className="weather-mood-pill">
          <span className="mood-glow-dot" />
          <span>{moodLabels[themeKey] || 'Current Weather'}</span>
        </div>
      </div>

      <div className="hero-temp-row">
        <div className="temp-primary">
          {formatTemp(temperature, units.temp)}
        </div>

        <div className="condition-summary">
          {conditionIcon && (
            <img
              src={conditionIcon}
              alt={condition}
              className="condition-icon-big"
            />
          )}
          <div className="condition-text-box">
            <div className="condition-text">{condition}</div>
            <div className="feels-like">
              Feels like {formatTemp(feelsLike, units.temp)}
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Rain Chance</span>
          <span className="metric-value metric-highlight">{rainProbability}%</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Humidity</span>
          <span className="metric-value">{humidity}%</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Wind</span>
          <span className="metric-value">{formatSpeed(windSpeed, units.speed)} {windDirection}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">UV Index</span>
          <span className="metric-value">{uvIndex}</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Visibility</span>
          <span className="metric-value">{visibility} km</span>
        </div>
      </div>
    </div>
  );
}
