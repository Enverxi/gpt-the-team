import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { requestNotificationPermission } from '../utils/notificationManager';

export default function AlertSettingsModal({ isOpen, onClose }) {
  const { alertPreferences, setAlertPreferences, triggeredAlerts, dismissAlert } = useWeather();
  const [notificationMsg, setNotificationMsg] = useState(null);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setAlertPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleThresholdChange = (key, value) => {
    setAlertPreferences(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  const handleNotificationToggle = async () => {
    if (!alertPreferences.browserNotifications) {
      // User is enabling notifications -> Request permission (Section 30)
      const res = await requestNotificationPermission();
      setNotificationMsg(res.message);
      if (res.granted) {
        setAlertPreferences(prev => ({ ...prev, browserNotifications: true }));
      } else {
        setAlertPreferences(prev => ({ ...prev, browserNotifications: false }));
      }
    } else {
      setAlertPreferences(prev => ({ ...prev, browserNotifications: false }));
      setNotificationMsg('Browser push notifications disabled. In-app alerts remain active.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            🔔 Weather Alerts & Thresholds
          </h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Active Triggered Alerts List */}
        {triggeredAlerts.length > 0 && (
          <div style={{ background: 'var(--surface-card-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Triggered Alerts ({triggeredAlerts.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {triggeredAlerts.map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: a.severity === 'high' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                      {a.title}:
                    </strong>{' '}
                    <span>{a.message}</span>
                  </div>
                  <button
                    onClick={() => dismissAlert(a.id)}
                    style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}
                    title="Dismiss"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Browser Push Permission (Section 30) */}
        <div style={{ background: 'var(--accent-blue-light)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--accent-blue)' }}>Browser Push Notifications</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Receive instant device notifications when alert conditions are met.
              </p>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
              checked={alertPreferences.browserNotifications}
              onChange={handleNotificationToggle}
              aria-label="Toggle browser notifications"
            />
          </div>
          {notificationMsg && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontStyle: 'italic', marginTop: '0.25rem' }}>
              {notificationMsg}
            </p>
          )}
        </div>

        {/* Threshold Sliders (Section 27) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Rain Alert */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={alertPreferences.rainEnabled}
                  onChange={() => handleToggle('rainEnabled')}
                  style={{ accentColor: 'var(--accent-blue)' }}
                />
                Rain Alert
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                &gt; {alertPreferences.rainThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={alertPreferences.rainThreshold}
              onChange={(e) => handleThresholdChange('rainThreshold', e.target.value)}
              disabled={!alertPreferences.rainEnabled}
              style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
            />
          </div>

          {/* Heat Alert */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={alertPreferences.heatEnabled}
                  onChange={() => handleToggle('heatEnabled')}
                  style={{ accentColor: 'var(--accent-amber)' }}
                />
                Heat Advisory
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
                &gt; {alertPreferences.heatThreshold}°C
              </span>
            </div>
            <input
              type="range"
              min="28"
              max="48"
              step="1"
              value={alertPreferences.heatThreshold}
              onChange={(e) => handleThresholdChange('heatThreshold', e.target.value)}
              disabled={!alertPreferences.heatEnabled}
              style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
            />
          </div>

          {/* Wind Alert */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={alertPreferences.windEnabled}
                  onChange={() => handleToggle('windEnabled')}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                Strong Wind Alert
              </label>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                &gt; {alertPreferences.windThreshold} km/h
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="80"
              step="5"
              value={alertPreferences.windThreshold}
              onChange={(e) => handleThresholdChange('windThreshold', e.target.value)}
              disabled={!alertPreferences.windEnabled}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          {/* Severe Weather */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={alertPreferences.severeEnabled}
                onChange={() => handleToggle('severeEnabled')}
                style={{ accentColor: 'var(--accent-red)' }}
              />
              Official Severe Weather Warnings
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Always Active</span>
          </div>
        </div>

        {/* Anti-Spam Notice (Section 28) */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem' }}>
          🛡️ <strong>Anti-Spam Frequency Protection Active:</strong> Persistent alerts are suppressed unless condition severity worsens significantly (+3°C temp rise, +25% rain chance jump, or new warning).
        </div>
      </div>
    </div>
  );
}
