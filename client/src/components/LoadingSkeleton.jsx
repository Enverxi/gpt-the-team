import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Current weather skeleton */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: '180px', height: '32px' }} />
          <div className="skeleton" style={{ width: '120px', height: '20px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="skeleton" style={{ width: '140px', height: '70px', borderRadius: '14px' }} />
          <div className="skeleton" style={{ width: '180px', height: '40px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />
        </div>
      </div>

      {/* Forecast skeleton */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ width: '160px', height: '24px' }} />
        <div style={{ display: 'flex', gap: '1rem', overflow: 'hidden' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '80px', height: '110px', flexShrink: 0, borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
