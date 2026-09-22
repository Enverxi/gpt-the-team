import React, { useEffect, useRef, useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useTheme } from '../context/ThemeContext';
import { formatTemp } from '../utils/unitConverter';

// Sleek custom map styles (Minimalist & modern)
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#132137' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#080d1a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e2e8f0' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#bae6fd' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }]
  }
];

export default function WeatherMap({ onClose }) {
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markerInstance = useRef(null);
  const infoWindowInstance = useRef(null);

  const { activeLocation, setLocation, weatherData, units, requestCurrentLocation } = useWeather();
  const { theme } = useTheme();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [usingBackup, setUsingBackup] = useState(false);

  // Load Google Maps script with primary key, falling back to backup key
  useEffect(() => {
    let isMounted = true;

    async function loadGoogleMaps() {
      if (window.google && window.google.maps) {
        if (isMounted) setMapLoaded(true);
        return;
      }

      // Fetch keys from server config endpoint or env
      let primaryKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
      let backupKey = import.meta.env.VITE_GOOGLE_MAPS_BACKUP_KEY || '';

      try {
        const configRes = await fetch('/api/config/maps');
        if (configRes.ok) {
          const cfg = await configRes.json();
          if (cfg.key) primaryKey = cfg.key;
          if (cfg.backupKey) backupKey = cfg.backupKey;
        }
      } catch (e) {}

      if (!primaryKey && !backupKey) {
        if (isMounted) setLoadError('Google Maps API key is not configured. Please set GOOGLE_MAPS_KEY in .env');
        return;
      }

      function injectScript(key, isFallback = false) {
        return new Promise((resolve, reject) => {
          const scriptId = 'google-maps-script';
          const existing = document.getElementById(scriptId);
          if (existing) existing.remove();

          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            if (isFallback) setUsingBackup(true);
            resolve();
          };

          script.onerror = () => {
            reject(new Error(isFallback ? 'Both Google Maps keys failed' : 'Primary key failed'));
          };

          document.head.appendChild(script);
        });
      }

      try {
        await injectScript(primaryKey);
        if (isMounted) setMapLoaded(true);
      } catch (err) {
        console.warn('Primary Google Maps key failed, attempting backup key...');
        try {
          await injectScript(backupKey, true);
          if (isMounted) setMapLoaded(true);
        } catch (backupErr) {
          if (isMounted) setLoadError(backupErr.message);
        }
      }
    }

    loadGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    const defaultLat = weatherData?.location?.lat || activeLocation?.lat || 16.3067;
    const defaultLng = weatherData?.location?.lon || activeLocation?.lon || 80.4365;
    const center = { lat: parseFloat(defaultLat), lng: parseFloat(defaultLng) };

    if (!googleMapInstance.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 9,
        styles: theme === 'dark' ? darkMapStyle : lightMapStyle,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
      });

      // Click anywhere to explore weather!
      map.addListener('click', (e) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();

        setLocation({
          lat: clickedLat,
          lon: clickedLng,
          name: clickedLat < -60 ? 'Antarctica' : `${clickedLat.toFixed(2)}°, ${clickedLng.toFixed(2)}°`
        });
      });

      googleMapInstance.current = map;
      infoWindowInstance.current = new window.google.maps.InfoWindow();
    } else {
      // Update styling and pan to center
      googleMapInstance.current.setOptions({
        styles: theme === 'dark' ? darkMapStyle : lightMapStyle
      });
      googleMapInstance.current.panTo(center);
    }

    // Update marker
    if (!markerInstance.current) {
      markerInstance.current = new window.google.maps.Marker({
        position: center,
        map: googleMapInstance.current,
        title: weatherData?.location?.name || 'Selected Location',
        animation: window.google.maps.Animation.DROP
      });
    } else {
      markerInstance.current.setPosition(center);
      markerInstance.current.setTitle(weatherData?.location?.name || 'Selected Location');
    }

    // Update InfoWindow content
    if (infoWindowInstance.current && weatherData) {
      const contentString = `
        <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
          <strong style="font-size: 14px;">${weatherData.location.name}${weatherData.location.timeDisplay ? ` • ${weatherData.location.timeDisplay}` : ''}</strong>
          <div style="margin-top: 4px; font-size: 12px; color: #475569;">
            ${formatTemp(weatherData.temperature, units.temp)} • ${weatherData.condition}
          </div>
          <div style="font-size: 11px; color: #0284c7; margin-top: 2px;">
            Rain: ${weatherData.rainProbability}% | Wind: ${weatherData.windSpeed} km/h
          </div>
        </div>
      `;
      infoWindowInstance.current.setContent(contentString);
      infoWindowInstance.current.open(googleMapInstance.current, markerInstance.current);
    }
  }, [mapLoaded, theme, activeLocation, weatherData, units, setLocation]);

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          <div>
            <h3 className="section-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Interactive Weather Map
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Click anywhere on the map to pin a location and get instant weather
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {usingBackup && (
            <span className="source-badge backup" style={{ fontSize: '0.7rem' }}>
              Backup Key
            </span>
          )}
          {onClose && (
            <button className="icon-btn" onClick={onClose} title="Close map view" aria-label="Close map">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Use My Current Location Button directly above the map */}
      <div className="map-toolbar-above" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          className="use-current-location-btn"
          onClick={() => requestCurrentLocation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1.15rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-blue)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.28)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Detect and use current device location"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="22" y1="12" x2="18" y2="12"></line>
            <line x1="6" y1="12" x2="2" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="2"></line>
            <line x1="12" y1="22" x2="12" y2="18"></line>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Use My Current Location</span>
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Click anywhere to pin, or use your GPS location
        </span>
      </div>

      {loadError ? (
        <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-card-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--accent-amber)', fontSize: '0.9rem', padding: '1rem', textAlign: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Google Maps could not be initialized. Please check API key restrictions.</span>
        </div>
      ) : (
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '380px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-inner, inset 0 2px 8px rgba(0,0,0,0.1))'
          }}
        />
      )}
    </div>
  );
}
