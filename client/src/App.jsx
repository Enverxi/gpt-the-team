import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from './context/WeatherContext';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import Next3Hours from './components/Next3Hours';
import HourlyForecast from './components/HourlyForecast';
import LocationSelector from './components/LocationSelector';
import WeatherMap from './components/WeatherMap';
import WeatherChat from './components/WeatherChat';
import AlertSettingsModal from './components/AlertSettingsModal';
import WeatherAnimation from './components/WeatherAnimation';
import LoadingSkeleton from './components/LoadingSkeleton';
import LoadingScreen from './components/LoadingScreen';
import ErrorDisplay from './components/ErrorDisplay';
import { getDetailedWeatherTheme } from './utils/weatherTheme';

export default function App() {
  const {
    weatherData,
    loading,
    error,
    fetchWeather,
    activeLocation,
    showMap,
    setShowMap
  } = useWeather();

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const weatherTheme = getDetailedWeatherTheme(weatherData);

  // Keep user at top on initial load only
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (!loading && weatherData && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [loading, weatherData]);

  return (
    <div className={`app-container theme-${weatherTheme}`}>
      {/* 0. Animated Globe Loading Screen (initial load only) */}
      <LoadingScreen
        loading={loading && !weatherData}
        locationName={activeLocation?.displayName || activeLocation?.name || weatherData?.location?.name}
      />
      {/* 1. Dynamic Mount Fuji Weather Background (Day, Night, Rainy blur, Snow, Sunny radiance, Warm) */}
      <WeatherAnimation
        temperature={weatherData?.temperature ?? 20}
        condition={weatherData?.condition || 'Clear'}
        isDay={weatherData?.isDay}
        localtime={weatherData?.location?.localtime}
        theme={weatherTheme}
      />

      {/* 2. Top-left WeatherGPT header */}
      <Header onOpenAlerts={() => setAlertModalOpen(true)} />

      <main className="single-flow-layout">
        {/* 3. Forecast of current location */}
        <section className="forecast-section" aria-label="Current Location Forecast">
          {loading && !weatherData ? (
            <LoadingSkeleton />
          ) : error && !weatherData ? (
            <ErrorDisplay error={error} onRetry={() => fetchWeather(activeLocation, true)} />
          ) : (
            <>
              <CurrentWeather />
              <Next3Hours />
              <HourlyForecast />
            </>
          )}
        </section>

        {/* 4. Interactive Google Map (Toggleable from Header or Quick Action) */}
        {showMap && (
          <section className="middle-selector-section" aria-label="Interactive Map">
            <div style={{ width: '100%' }}>
              <WeatherMap onClose={() => setShowMap(false)} />
            </div>
          </section>
        )}

        {/* 5. Below that: Follow-up chat */}
        <section className="follow-up-chat-section" aria-label="WeatherGPT Follow-up Chat">
          <WeatherChat />
        </section>
      </main>

      {/* Alert Configuration Modal */}
      <AlertSettingsModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
}
