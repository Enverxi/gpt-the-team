import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getStoredItem, setStoredItem } from '../utils/storage';
import { showBrowserNotification } from '../utils/notificationManager';

const WeatherContext = createContext();

// Helper to determine initial fallback city from user's system timezone
function getSystemTimezoneCity() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz.includes('/')) {
      const cityName = tz.split('/')[1].replace(/_/g, ' ');
      if (cityName) return cityName;
    }
  } catch (e) {}
  return 'New Delhi';
}

const GUNTUR_DEFAULT = {
  name: 'Guntur',
  region: 'Andhra Pradesh',
  country: 'India',
  lat: 16.3067,
  lon: 80.4365,
  displayName: 'Guntur, Andhra Pradesh, India'
};

function isHyderabadArea(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
    lat >= 17.1 && lat <= 17.7 && lon >= 78.1 && lon <= 78.8;
}

export function WeatherProvider({ children }) {
  const [activeLocation, setActiveLocation] = useState(GUNTUR_DEFAULT);
  const [showMap, setShowMap] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [units, setUnits] = useState(() => getStoredItem('units', { temp: 'C', speed: 'kmh', precip: 'mm' }));

  const [alertPreferences, setAlertPreferences] = useState(() => getStoredItem('alert_prefs', {
    rainEnabled: true,
    rainThreshold: 50,
    heatEnabled: true,
    heatThreshold: 35,
    windEnabled: true,
    windThreshold: 40,
    uvEnabled: true,
    uvThreshold: 8,
    severeEnabled: true,
    browserNotifications: false
  }));

  const [alertHistory, setAlertHistory] = useState(() => getStoredItem('alert_history', {}));
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'WeatherGPT is ready. Ask any question about your local conditions, rain forecasts, or upcoming weather.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      factors: []
    }
  ]);

  // Refs to prevent fetchWeather re-creation cycles
  const alertPrefsRef = useRef(alertPreferences);
  useEffect(() => {
    alertPrefsRef.current = alertPreferences;
    setStoredItem('alert_prefs', alertPreferences);
  }, [alertPreferences]);

  const alertHistoryRef = useRef(alertHistory);
  useEffect(() => {
    alertHistoryRef.current = alertHistory;
    setStoredItem('alert_history', alertHistory);
  }, [alertHistory]);

  useEffect(() => { setStoredItem('units', units); }, [units]);

  // Stable Fetch weather data callback
  const fetchWeather = useCallback(async (location, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      let queryUrl = '/api/weather/forecast';
      if (location && typeof location.lat === 'number' && typeof location.lon === 'number') {
        const targetLat = isHyderabadArea(location.lat, location.lon) ? GUNTUR_DEFAULT.lat : location.lat;
        const targetLon = isHyderabadArea(location.lat, location.lon) ? GUNTUR_DEFAULT.lon : location.lon;
        queryUrl += `?lat=${targetLat}&lon=${targetLon}`;
      } else if (location && (location.name || typeof location === 'string')) {
        const query = location.name || location;
        queryUrl += `?city=${encodeURIComponent(query)}`;
      } else {
        queryUrl += `?lat=${GUNTUR_DEFAULT.lat}&lon=${GUNTUR_DEFAULT.lon}`;
      }

      if (forceRefresh) {
        queryUrl += (queryUrl.includes('?') ? '&' : '?') + 'refresh=true';
      }

      const res = await fetch(queryUrl);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to fetch weather (${res.status})`);
      }

      const data = await res.json();
      setWeatherData(data);
      setActiveLocation(data.location);

      // Evaluate alerts using current refs without triggering callback invalidation
      try {
        const currentPrefs = alertPrefsRef.current;
        const currentHistory = alertHistoryRef.current;

        const alertRes = await fetch('/api/alerts/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weatherData: data,
            preferences: currentPrefs,
            alertHistory: currentHistory
          })
        });
        if (alertRes.ok) {
          const alertResult = await alertRes.json();
          setTriggeredAlerts(alertResult.alerts || []);
          if (alertResult.updatedHistory) {
            alertHistoryRef.current = alertResult.updatedHistory;
            setAlertHistory(alertResult.updatedHistory);
          }

          if (currentPrefs?.browserNotifications) {
            alertResult.alerts?.forEach(a => {
              if (a.shouldNotify) {
                showBrowserNotification(`Weather Alert: ${a.title}`, {
                  body: a.message,
                  id: a.id
                });
              }
            });
          }
        }
      } catch (alertErr) {
        console.warn('Alert check error:', alertErr);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Unable to retrieve weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run initial weather load for Guntur exactly once on startup
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchWeather(GUNTUR_DEFAULT);
  }, [fetchWeather]);

  // Update Location manually in-place without redirects
  const setLocation = useCallback((loc) => {
    setActiveLocation(loc);
    fetchWeather(loc);
  }, [fetchWeather]);

  // Send AI chat question
  const sendMessage = useCallback(async (questionText) => {
    if (!questionText || !questionText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          message: questionText.trim(),
          weatherData: weatherData,
          city: activeLocation?.name,
          lat: activeLocation?.lat,
          lon: activeLocation?.lon,
          locationContext: {
            city: activeLocation?.name,
            lat: activeLocation?.lat,
            lon: activeLocation?.lon
          },
          units: units
        })
      });

      if (!response.ok) {
        throw new Error('AI response failed');
      }

      const resData = await response.json();
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: resData.answer || resData.response || resData.text,
        isClarification: resData.isClarification,
        factors: resData.factors || [],
        confidenceScore: resData.confidenceScore || 90,
        model: resData.model || 'Gemini 2.5 Flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'I am unable to answer right now due to a network connection issue. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [weatherData, activeLocation, units]);

  const updateUnits = useCallback((newUnits) => {
    setUnits(prev => ({ ...prev, ...newUnits }));
  }, []);

  const updateAlertPreferences = useCallback((newPrefs) => {
    setAlertPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const deleteMessage = useCallback((msgId) => {
    setChatHistory(prev => prev.filter(m => m.id !== msgId));
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setTriggeredAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const requestCurrentLocation = useCallback(() => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          if (isHyderabadArea(lat, lon)) {
            fetchWeather(GUNTUR_DEFAULT, true);
          } else {
            fetchWeather({ lat, lon }, true);
          }
        },
        err => {
          console.warn('Geolocation prompt resolved with fallback:', err.message);
          // Query general IP location endpoint as fallback
          fetch('/api/weather/detect-location')
            .then(res => res.json())
            .then(data => {
              if (data && typeof data.lat === 'number' && typeof data.lon === 'number') {
                if (isHyderabadArea(data.lat, data.lon) || (data.city && data.city.toLowerCase().includes('hyderabad'))) {
                  fetchWeather(GUNTUR_DEFAULT, true);
                } else {
                  fetchWeather({ lat: data.lat, lon: data.lon, name: data.city }, true);
                }
              } else {
                fetchWeather(GUNTUR_DEFAULT, true);
              }
            })
            .catch(() => fetchWeather(GUNTUR_DEFAULT, true));
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    } else {
      fetchWeather(GUNTUR_DEFAULT, true);
    }
  }, [fetchWeather]);

  const toggleMap = useCallback(() => {
    setShowMap(prev => !prev);
  }, []);

  return (
    <WeatherContext.Provider value={{
      activeLocation,
      showMap,
      setShowMap,
      toggleMap,
      requestCurrentLocation,
      weatherData,
      loading,
      error,
      units,
      setUnits,
      alertPreferences,
      setAlertPreferences,
      triggeredAlerts,
      chatHistory,
      fetchWeather,
      setLocation,
      sendMessage,
      deleteMessage,
      clearChat,
      dismissAlert
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather must be used within a WeatherProvider');
  return context;
}
