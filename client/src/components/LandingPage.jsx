import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';

export default function LandingPage() {
  const { setHasStarted, setLocation, fetchGPSLocation } = useWeather();
  const [cityInput, setCityInput] = useState('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleStartWithGPS = async () => {
    setLoadingGps(true);
    setErrorMsg(null);
    try {
      await fetchGPSLocation();
    } catch (err) {
      setErrorMsg(err.message || 'GPS location permission denied. You can search your city below.');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setLocation({ name: cityInput.trim() });
  };

  const handleQuickCity = (cityName) => {
    setLocation({ name: cityName });
  };

  return (
    <div className="landing-hero">
      <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 6px 20px rgba(2, 132, 199, 0.4))' }}>
        🌦️
      </div>

      <h1 className="landing-title">
        WeatherGPT
      </h1>

      <p className="landing-subtitle">
        AI Weather Alert &amp; Assistance Agent. Meteorologically grounded insights, practical recommendations, and proactive alerts without the raw number overload.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '440px' }}>
        <button
          className="btn-primary"
          onClick={handleStartWithGPS}
          disabled={loadingGps}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <span>🎯</span>
          <span>{loadingGps ? 'Locating via GPS...' : 'Use Current Location (GPS)'}</span>
        </button>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="location-input"
            placeholder="Or type a city name (e.g. New York, Tokyo)..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            style={{ borderRadius: 'var(--radius-md)' }}
          />
          <button
            type="submit"
            className="btn-secondary"
            disabled={!cityInput.trim()}
          >
            Go
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Popular:</span>
          {['London', 'Tokyo', 'Mumbai', 'New York', 'Sydney'].map((c) => (
            <button
              key={c}
              className="action-chip"
              onClick={() => handleQuickCity(c)}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--accent-amber)', borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>✓ Dual-API Failover</span>
        <span>✓ Zero LLM Hallucinations</span>
        <span>✓ No Login Required</span>
      </div>
    </div>
  );
}
