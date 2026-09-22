import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { formatTemp } from '../utils/unitConverter';

export default function HourlyForecast() {
  const { weatherData, units } = useWeather();

  if (!weatherData || !weatherData.hourlyForecast || weatherData.hourlyForecast.length === 0) {
    return null;
  }

  const hours = weatherData.hourlyForecast.slice(0, 24);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    if (parts.length > 1) {
      const timePart = parts[1];
      const hourNum = parseInt(timePart.split(':')[0], 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formatted = hourNum % 12 || 12;
      return `${formatted} ${ampm}`;
    }
    return timeStr;
  };

  return (
    <div className="forecast-card glass-card">
      <div className="section-title-row">
        <h3 className="section-title">24-Hour Hourly Forecast</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scroll horizontally →</span>
      </div>

      <div className="hourly-scroller">
        {hours.map((h, idx) => (
          <div key={idx} className="hourly-scroller-item">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {formatTime(h.time)}
            </span>

            {h.conditionIcon ? (
              <img src={h.conditionIcon} alt={h.condition} style={{ width: 36, height: 36 }} />
            ) : null}

            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatTemp(h.temp, units.temp)}
            </span>

            <div style={{ width: '100%', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rain</span>
                <span style={{ color: '#38BDF8', fontWeight: 700 }}>{h.rainProbability}%</span>
              </div>
              <div className="rain-chance-bar">
                <div
                  className="rain-chance-fill"
                  style={{ width: `${Math.min(100, Math.max(5, h.rainProbability))}%` }}
                />
              </div>
            </div>

            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 500 }}>
              {h.windSpeed} km/h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
