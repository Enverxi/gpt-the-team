import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { formatTemp } from '../utils/unitConverter';
import RevolvingGlobeIcon from './RevolvingGlobeIcon';

export default function Next3Hours() {
  const { weatherData, units } = useWeather();

  if (!weatherData || !weatherData.next3Hours || weatherData.next3Hours.length === 0) {
    return null;
  }

  const hours = weatherData.next3Hours;

  const formatHourLabel = (timeStr) => {
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
    <div className="next-3-hours-dock glass-card">
      <div className="dock-header">
        <div className="dock-title-group">
          <RevolvingGlobeIcon size={16} revolve={true} />
          <span className="dock-title">Immediate Outlook</span>
          <span className="dock-subtitle">• Next 3 Hours</span>
        </div>
      </div>

      <div className="next-hours-row">
        {hours.map((h, idx) => (
          <div key={idx} className="next-hour-capsule">
            <span className="capsule-time">{formatHourLabel(h.time)}</span>
            <div className="capsule-icon-wrap">
              {h.conditionIcon && (
                <img src={h.conditionIcon} alt={h.condition} className="capsule-icon" />
              )}
            </div>
            <span className="capsule-temp">{formatTemp(h.temp, units.temp)}</span>
            <span className="capsule-condition">{h.condition}</span>
            <span className="capsule-rain-badge">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true" style={{ opacity: 0.85 }}>
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              {h.rainProbability}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
