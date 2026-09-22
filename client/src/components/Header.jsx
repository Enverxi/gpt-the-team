import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import LocationSelector from './LocationSelector';
import RevolvingGlobeIcon from './RevolvingGlobeIcon';

export default function Header({ onOpenAlerts }) {
  const {
    weatherData,
    units,
    setUnits,
    triggeredAlerts
  } = useWeather();
  const { theme, toggleTheme } = useTheme();

  const toggleUnit = () => {
    setUnits(prev => ({
      ...prev,
      temp: prev.temp === 'C' ? 'F' : 'C',
      speed: prev.temp === 'C' ? 'mph' : 'kmh',
      precip: prev.temp === 'C' ? 'in' : 'mm'
    }));
  };

  const isBackup = weatherData?.isBackup;
  const activeAlertCount = triggeredAlerts.length;

  return (
    <header className="app-header">
      <div className="header-brand-left">
        <RevolvingGlobeIcon size={22} revolve={true} />
        <span className="brand-text">WeatherGPT</span>
      </div>

      <div className="header-center-location">
        <LocationSelector />
      </div>

      <div className="header-controls">
        {weatherData && (
          <div
            className={`source-badge ${isBackup ? 'backup' : ''}`}
            title={weatherData?.source ? `Active Source: ${weatherData.source}` : (isBackup ? 'Active Source: WeatherAPI.com (Backup)' : 'Active Source: OpenWeatherMap (Primary)')}
          >
            <span className="source-dot" />
            <span>{isBackup ? 'Backup API' : 'Primary API'}</span>
          </div>
        )}

        <button
          className="icon-btn text-btn"
          onClick={toggleUnit}
          title={`Switch to °${units.temp === 'C' ? 'F' : 'C'}`}
          aria-label={`Switch temperature unit, currently °${units.temp}`}
        >
          °{units.temp}
        </button>

        <button
          className="icon-btn"
          onClick={onOpenAlerts}
          title="Weather Alerts"
          aria-label="Open Weather Alert Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {activeAlertCount > 0 && (
            <span className="badge-counter">{activeAlertCount}</span>
          )}
        </button>

        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
