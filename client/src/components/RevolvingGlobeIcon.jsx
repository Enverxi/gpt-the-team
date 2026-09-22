import React, { useId } from 'react';

/**
 * Authentic Terrestrial Desktop Globe Component
 * Features an authentic desktop globe with:
 * - Weighted pedestal base & central spindle neck
 * - Semi-circular meridian mounting bracket with polar axis pins
 * - Natural 23.5° axial tilt
 * - Spherical Earth with continental landmasses, equator & latitude/longitude meridians
 * - 3D spherical specular depth
 * - Smooth continuous axial rotation when revolve=true (stand stays firmly upright)
 */
export default function RevolvingGlobeIcon({
  size = 22,
  className = '',
  revolve = true,
  style = {}
}) {
  const uid = useId().replace(/:/g, '');
  const clipId = `globe-clip-${uid}`;
  const gradId = `globe-grad-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      style={style}
      className={`revolving-globe-svg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="16" cy="13" r="8" />
        </clipPath>
        <radialGradient id={gradId} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Desktop Globe Stand & Meridian Bracket */}
      {/* 1. Pedestal Base */}
      <path
        d="M10.5 29h11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12.5 29v-2.2c0-.5.4-.8.9-.8h5.2c.5 0 .9.3.9.8V29"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M16 26v-3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 2. Semi-Circular Meridian Mounting Bracket (tilted poles at 23.5°) */}
      <path
        d="M 19.2 4.6 A 10.4 10.4 0 0 0 12.8 21.4 L 16 22.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top and Bottom Polar Axis Pins */}
      <circle cx="19.2" cy="4.6" r="1.1" fill="currentColor" />
      <circle cx="12.8" cy="21.4" r="1.1" fill="currentColor" />

      {/* 3. The Terrestrial Sphere */}
      <circle
        cx="16"
        cy="13"
        r="8"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      {/* 4. Inside the Sphere: Coordinate Grids, Continents & 3D Specular */}
      <g clipPath={`url(#${clipId})`}>
        {/* Tilted Lat/Long grid */}
        <g transform="rotate(23.5, 16, 13)">
          {/* Equator */}
          <ellipse
            cx="16"
            cy="13"
            rx="8"
            ry="2.3"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="2 1.5"
            opacity="0.6"
            fill="none"
          />
          {/* Tropics */}
          <ellipse
            cx="16"
            cy="9.4"
            rx="6.9"
            ry="1.6"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.5"
            opacity="0.4"
            fill="none"
          />
          <ellipse
            cx="16"
            cy="16.6"
            rx="6.9"
            ry="1.6"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1.5 1.5"
            opacity="0.4"
            fill="none"
          />
          {/* Central Meridian */}
          <ellipse
            cx="16"
            cy="13"
            rx="3.6"
            ry="8"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="2 1.5"
            opacity="0.55"
            fill="none"
          />
        </g>

        {/* Continental Landmasses */}
        <g className={revolve ? 'globe-earth-surface' : ''} style={{ transformOrigin: '16px 13px' }}>
          <g transform="translate(-20, 0)">
            <path
              d="M20 7c1 0 2 1 3 2s1 2 2 2 1-1 2 0 1 2 0 3-2 1-2 2 1 2 0 3-2 1-3 0-1-2-2-2-2 1-2-1 1-2 0-3-1-1 0-2 1-2 1-2z M15 15c1 0 2 1 1 2s-1 2-2 1-1-2 0-3z M27 15c1 0 1.5 1 1 2s-1 1.5-1.5 1-1-1 0-2 1-1 1.5-1z"
              fill="currentColor"
              fillOpacity="0.45"
            />
          </g>
          <g transform="translate(0, 0)">
            <path
              d="M20 7c1 0 2 1 3 2s1 2 2 2 1-1 2 0 1 2 0 3-2 1-2 2 1 2 0 3-2 1-3 0-1-2-2-2-2 1-2-1 1-2 0-3-1-1 0-2 1-2 1-2z M15 15c1 0 2 1 1 2s-1 2-2 1-1-2 0-3z M27 15c1 0 1.5 1 1 2s-1 1.5-1.5 1-1-1 0-2 1-1 1.5-1z"
              fill="currentColor"
              fillOpacity="0.45"
            />
          </g>
          <g transform="translate(20, 0)">
            <path
              d="M20 7c1 0 2 1 3 2s1 2 2 2 1-1 2 0 1 2 0 3-2 1-2 2 1 2 0 3-2 1-3 0-1-2-2-2-2 1-2-1 1-2 0-3-1-1 0-2 1-2 1-2z M15 15c1 0 2 1 1 2s-1 2-2 1-1-2 0-3z M27 15c1 0 1.5 1 1 2s-1 1.5-1.5 1-1-1 0-2 1-1 1.5-1z"
              fill="currentColor"
              fillOpacity="0.45"
            />
          </g>
        </g>

        {/* 3D Specular Highlight */}
        <circle cx="16" cy="13" r="8" fill={`url(#${gradId})`} pointerEvents="none" />
      </g>
    </svg>
  );
}
