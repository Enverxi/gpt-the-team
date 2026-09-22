import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '../context/WeatherContext';

export default function LocationSelector() {
  const { setLocation, loading, showMap, toggleMap, activeLocation, requestCurrentLocation } = useWeather();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchInput || searchInput.trim().length < 2) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(searchInput.trim())}`);
        if (res.ok) {
          const results = await res.json();
          setSuggestions(results);
          setDropdownOpen(results.length > 0);
        }
      } catch (err) {
        console.warn('City search failed:', err);
      }
    }, 250);

    return () => clearTimeout(searchTimeout.current);
  }, [searchInput]);

  const handleSelectCity = (cityItem) => {
    setLocation({
      name: cityItem.name,
      region: cityItem.region,
      country: cityItem.country,
      lat: cityItem.lat,
      lon: cityItem.lon
    });
    setSearchInput('');
    setDropdownOpen(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    if (suggestions.length > 0) {
      handleSelectCity(suggestions[0]);
    } else {
      setLocation({ name: searchInput.trim() });
      setSearchInput('');
      setDropdownOpen(false);
    }
  };

  return (
    <div className="center-location-wrapper" ref={dropdownRef}>
      <form className="center-location-form glass-card" onSubmit={handleFormSubmit}>
        <div className="center-input-container">
          <svg className="center-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="center-location-input"
            placeholder={activeLocation?.name ? `Change location (currently ${activeLocation.name})...` : "Search city, country, or mountain (e.g. Himalayas, Finland, Guntur)..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
            aria-label="Change location"
          />
          <button
            type="button"
            className="input-geo-btn"
            onClick={() => requestCurrentLocation()}
            title="Use my general location (geo location)"
            aria-label="Use my general location"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="22" y1="12" x2="18" y2="12"></line>
              <line x1="6" y1="12" x2="2" y2="12"></line>
              <line x1="12" y1="6" x2="12" y2="2"></line>
              <line x1="12" y1="22" x2="12" y2="18"></line>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <button
          type="submit"
          className="center-submit-btn"
          disabled={loading || !searchInput.trim()}
        >
          Select
        </button>

        <button
          type="button"
          className={`center-map-btn ${showMap ? 'active' : ''}`}
          onClick={toggleMap}
          title={showMap ? 'Hide Map' : 'Open Google Map'}
        >
          {showMap ? 'Close Map' : 'Map'}
        </button>
      </form>

      {dropdownOpen && suggestions.length > 0 && (
        <ul className="center-dropdown-list" role="listbox">
          {suggestions.map((item, idx) => {
            const isMtn = item.displayName?.includes('Mountain Range');
            const isCountry = item.displayName?.includes('Country');
            const isPeak = item.displayName?.includes('(Mountain)');
            return (
              <li
                key={idx}
                className="center-dropdown-item"
                onClick={() => handleSelectCity(item)}
                role="option"
                aria-selected={false}
              >
                <div className="city-info">
                  <span className="city-name">{item.name}</span>
                  {item.region ? <span className="city-region">, {item.region}</span> : ''}
                  {item.country && !isCountry ? <span className="city-country"> ({item.country})</span> : ''}
                  {isMtn && <span className="city-tag mountain">Mountain Range</span>}
                  {isCountry && <span className="city-tag country">Country</span>}
                  {isPeak && <span className="city-tag mountain">Mountain</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
