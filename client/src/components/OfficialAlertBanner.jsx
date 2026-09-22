import React from 'react';

export default function OfficialAlertBanner({ alerts = [] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="official-alerts-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {alerts.map((alert, idx) => (
        <div key={idx} className="official-alert-banner" role="alert">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span className="alert-badge-official">Official Weather Warning</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {alert.headline || alert.event || 'Severe Weather Alert'}
              </strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {alert.desc || alert.instruction || alert.event}
            </p>
            {alert.effective && (
              <span style={{ display: 'block', marginTop: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Effective: {alert.effective} {alert.expires ? `• Expires: ${alert.expires}` : ''}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
