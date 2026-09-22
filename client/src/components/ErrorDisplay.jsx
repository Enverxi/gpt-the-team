import React from 'react';

export default function ErrorDisplay({ error, onRetry }) {
  return (
    <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Unable to Retrieve Weather Data</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', fontSize: '0.95rem' }}>
        {error || 'Both the primary and backup weather providers encountered an issue. Please check your connection or try searching for another location.'}
      </p>

      {onRetry && (
        <button
          className="btn-primary"
          onClick={onRetry}
          style={{ marginTop: '0.5rem' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
