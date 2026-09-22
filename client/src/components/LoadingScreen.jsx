import React, { useEffect, useState, useRef } from 'react';
import RevolvingGlobeIcon from './RevolvingGlobeIcon';

/**
 * Premium WeatherGPT Loading Screen
 * Displays an illuminated spinning globe with an atmospheric glow
 * and "Weather GPT" branding below as data initializes.
 */
export default function LoadingScreen({ loading, locationName = '' }) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const mountTimeRef = useRef(Date.now());
  const MIN_DISPLAY_MS = 600;
  const FADE_DURATION_MS = 400;

  useEffect(() => {
    if (!loading && shouldRender && !isFadingOut) {
      const elapsed = Date.now() - mountTimeRef.current;
      const waitTime = Math.max(0, MIN_DISPLAY_MS - elapsed);

      const timerId = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setShouldRender(false);
        }, FADE_DURATION_MS);
      }, waitTime);

      return () => clearTimeout(timerId);
    }
  }, [loading, shouldRender, isFadingOut]);

  if (!shouldRender) return null;

  return (
    <div
      className={`weather-loading-screen ${isFadingOut ? 'fade-out' : 'fade-in'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Weather GPT"
    >
      <div className="loading-content-box">
        {/* Soft Ambient Radial Glow behind the Globe */}
        <div className="globe-aura-glow" aria-hidden="true" />

        {/* Majestic Spinning Globe */}
        <div className="spinning-globe-wrapper">
          <RevolvingGlobeIcon size={84} revolve={true} className="loading-globe-icon" />
        </div>

        {/* Branding & Status text below */}
        <div className="loading-brand-group">
          <h1 className="loading-brand-title">Weather GPT</h1>
          <div className="loading-indicator-track" aria-hidden="true">
            <div className="loading-indicator-bar" />
          </div>
          <p className="loading-status-text">
            {locationName ? `Loading forecast for ${locationName}...` : 'Gathering meteorological telemetry...'}
          </p>
        </div>
      </div>
    </div>
  );
}
