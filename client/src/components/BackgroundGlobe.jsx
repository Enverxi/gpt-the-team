import React, { useEffect, useRef } from 'react';
import { useWeather } from '../context/WeatherContext';

/**
 * World continent polygon contours (lat/lon in degrees)
 * representing true continental landmasses including Antarctica.
 */
const CONTINENTS = [
  // North America
  {
    name: 'North America',
    type: 'land',
    coords: [
      { lat: 72, lon: -156 }, { lat: 70, lon: -130 }, { lat: 60, lon: -135 }, { lat: 58, lon: -95 },
      { lat: 62, lon: -75 }, { lat: 55, lon: -58 }, { lat: 45, lon: -63 }, { lat: 42, lon: -71 },
      { lat: 30, lon: -81 }, { lat: 25, lon: -80 }, { lat: 28, lon: -97 }, { lat: 20, lon: -97 },
      { lat: 15, lon: -93 }, { lat: 8, lon: -77 }, { lat: 14, lon: -88 }, { lat: 20, lon: -105 },
      { lat: 32, lon: -117 }, { lat: 38, lon: -123 }, { lat: 48, lon: -125 }, { lat: 55, lon: -132 },
      { lat: 60, lon: -145 }, { lat: 65, lon: -168 }, { lat: 71, lon: -156 }
    ]
  },
  // South America
  {
    name: 'South America',
    type: 'land',
    coords: [
      { lat: 12, lon: -72 }, { lat: 8, lon: -58 }, { lat: 4, lon: -51 }, { lat: -2, lon: -44 },
      { lat: -7, lon: -35 }, { lat: -15, lon: -39 }, { lat: -23, lon: -43 }, { lat: -32, lon: -51 },
      { lat: -39, lon: -62 }, { lat: -54, lon: -68 }, { lat: -55, lon: -73 }, { lat: -45, lon: -75 },
      { lat: -30, lon: -72 }, { lat: -18, lon: -71 }, { lat: -5, lon: -81 }, { lat: 2, lon: -78 },
      { lat: 9, lon: -76 }
    ]
  },
  // Europe
  {
    name: 'Europe',
    type: 'land',
    coords: [
      { lat: 71, lon: 26 }, { lat: 68, lon: 40 }, { lat: 60, lon: 30 }, { lat: 55, lon: 38 },
      { lat: 46, lon: 35 }, { lat: 42, lon: 28 }, { lat: 38, lon: 24 }, { lat: 36, lon: 22 },
      { lat: 38, lon: 15 }, { lat: 44, lon: 12 }, { lat: 42, lon: 3 }, { lat: 36, lon: -5 },
      { lat: 37, lon: -9 }, { lat: 43, lon: -9 }, { lat: 47, lon: -3 }, { lat: 50, lon: 1 },
      { lat: 54, lon: 8 }, { lat: 57, lon: 10 }, { lat: 64, lon: 12 }, { lat: 71, lon: 26 }
    ]
  },
  // British Isles
  {
    name: 'British Isles',
    type: 'land',
    coords: [
      { lat: 58, lon: -5 }, { lat: 57, lon: -2 }, { lat: 51, lon: 1 }, { lat: 50, lon: -5 },
      { lat: 53, lon: -4 }, { lat: 55, lon: -6 }, { lat: 58, lon: -5 }
    ]
  },
  // Africa
  {
    name: 'Africa',
    type: 'land',
    coords: [
      { lat: 37, lon: 10 }, { lat: 32, lon: 25 }, { lat: 31, lon: 32 }, { lat: 22, lon: 37 },
      { lat: 12, lon: 43 }, { lat: 11, lon: 51 }, { lat: 2, lon: 45 }, { lat: -10, lon: 40 },
      { lat: -25, lon: 33 }, { lat: -34, lon: 26 }, { lat: -34, lon: 18 }, { lat: -22, lon: 14 },
      { lat: -10, lon: 13 }, { lat: 4, lon: 9 }, { lat: 5, lon: 0 }, { lat: 4, lon: -7 },
      { lat: 11, lon: -15 }, { lat: 15, lon: -17 }, { lat: 22, lon: -16 }, { lat: 31, lon: -10 },
      { lat: 36, lon: -5 }, { lat: 37, lon: 3 }
    ]
  },
  // Asia
  {
    name: 'Asia',
    type: 'land',
    coords: [
      { lat: 77, lon: 104 }, { lat: 72, lon: 130 }, { lat: 66, lon: 170 }, { lat: 60, lon: 165 },
      { lat: 52, lon: 142 }, { lat: 43, lon: 132 }, { lat: 38, lon: 128 }, { lat: 35, lon: 119 },
      { lat: 22, lon: 114 }, { lat: 21, lon: 108 }, { lat: 10, lon: 104 }, { lat: 1, lon: 104 },
      { lat: 15, lon: 96 }, { lat: 22, lon: 90 }, { lat: 13, lon: 80 }, { lat: 8, lon: 77 },
      { lat: 20, lon: 73 }, { lat: 25, lon: 62 }, { lat: 24, lon: 57 }, { lat: 15, lon: 53 },
      { lat: 12, lon: 44 }, { lat: 28, lon: 34 }, { lat: 37, lon: 36 }, { lat: 41, lon: 44 },
      { lat: 50, lon: 55 }, { lat: 60, lon: 60 }, { lat: 70, lon: 70 }, { lat: 77, lon: 104 }
    ]
  },
  // Japan
  {
    name: 'Japan',
    type: 'land',
    coords: [
      { lat: 45, lon: 142 }, { lat: 43, lon: 145 }, { lat: 35, lon: 140 }, { lat: 31, lon: 131 },
      { lat: 34, lon: 132 }, { lat: 40, lon: 139 }, { lat: 45, lon: 142 }
    ]
  },
  // Australia
  {
    name: 'Australia',
    type: 'land',
    coords: [
      { lat: -12, lon: 132 }, { lat: -12, lon: 137 }, { lat: -15, lon: 145 }, { lat: -25, lon: 153 },
      { lat: -33, lon: 151 }, { lat: -38, lon: 147 }, { lat: -38, lon: 140 }, { lat: -32, lon: 132 },
      { lat: -34, lon: 123 }, { lat: -34, lon: 115 }, { lat: -25, lon: 113 }, { lat: -20, lon: 118 },
      { lat: -15, lon: 124 }, { lat: -12, lon: 132 }
    ]
  },
  // Greenland (Polar Ice)
  {
    name: 'Greenland',
    type: 'ice',
    coords: [
      { lat: 83, lon: -30 }, { lat: 76, lon: -18 }, { lat: 70, lon: -22 }, { lat: 60, lon: -44 },
      { lat: 64, lon: -52 }, { lat: 73, lon: -56 }, { lat: 78, lon: -70 }, { lat: 83, lon: -30 }
    ]
  },
  // Antarctica (South Polar Ice Continent)
  {
    name: 'Antarctica',
    type: 'ice',
    coords: [
      { lat: -64, lon: -60 }, { lat: -68, lon: -40 }, { lat: -72, lon: 0 }, { lat: -68, lon: 40 },
      { lat: -66, lon: 70 }, { lat: -66, lon: 100 }, { lat: -67, lon: 130 }, { lat: -67, lon: 160 },
      { lat: -75, lon: 180 }, { lat: -78, lon: -170 }, { lat: -73, lon: -140 }, { lat: -72, lon: -100 },
      { lat: -70, lon: -80 }, { lat: -64, lon: -60 }
    ]
  }
];

export default function BackgroundGlobe() {
  const { weatherData } = useWeather();
  const canvasRef = useRef(null);
  const rotYRef = useRef(0);
  const animFrameRef = useRef(null);

  const loc = weatherData?.location;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulseTime = 0;
    const tilt = 0.38; // ~22° Earth axial tilt

    const render = () => {
      pulseTime += 0.03;
      rotYRef.current += 0.003; // Smooth continuous background rotation

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.44;
      const rotY = rotYRef.current;

      // 1. Atmosphere Halo (Soft luminous celestial glow behind Earth)
      const haloGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.4);
      haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
      haloGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.15)');
      haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Earth Oceanic Sphere Body (Realistic oceanic depth gradient)
      const oceanGrad = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.15, cx, cy, R);
      oceanGrad.addColorStop(0, '#1e3a5f');
      oceanGrad.addColorStop(0.65, '#0f223a');
      oceanGrad.addColorStop(1, '#07111e');

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Clip everything to the spherical disk
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Helper to project lat/lon to 3D Cartesian coordinates
      const projectPoint = (lat, lon) => {
        const phi = (lat * Math.PI) / 180;
        const theta = (lon * Math.PI) / 180 - rotY;

        const x = R * Math.cos(phi) * Math.sin(theta);
        const y = -R * Math.sin(phi);
        const z = R * Math.cos(phi) * Math.cos(theta);

        // Rotate around X-axis for Earth axial tilt
        const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
        const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);

        return { sx: cx + x, sy: cy + y2, z: z2 };
      };

      // 3. Latitude parallels & longitude meridians
      ctx.lineWidth = 0.7;
      const parallels = [-60, -30, 0, 30, 60];
      parallels.forEach((lat) => {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 6) {
          const pt = projectPoint(lat, lon);
          if (pt.z > 0) {
            if (first) {
              ctx.moveTo(pt.sx, pt.sy);
              first = false;
            } else {
              ctx.lineTo(pt.sx, pt.sy);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = lat === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
      });

      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 6) {
          const pt = projectPoint(lat, lon);
          if (pt.z > 0) {
            if (first) {
              ctx.moveTo(pt.sx, pt.sy);
              first = false;
            } else {
              ctx.lineTo(pt.sx, pt.sy);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.stroke();
      }

      // 4. Render True Continental Polygons with Terrain & Ice Fills
      CONTINENTS.forEach((cont) => {
        // Interpolate along polygon edges to curve smoothly along sphere
        const projectedPoints = [];
        for (let i = 0; i < cont.coords.length; i++) {
          const p1 = cont.coords[i];
          const p2 = cont.coords[(i + 1) % cont.coords.length];

          // Subdivide edges for smooth spherical curvature
          const steps = 4;
          for (let s = 0; s < steps; s++) {
            const t = s / steps;
            const lat = p1.lat + (p2.lat - p1.lat) * t;
            const lon = p1.lon + (p2.lon - p1.lon) * t;
            projectedPoints.push(projectPoint(lat, lon));
          }
        }

        // Draw polygon on visible hemisphere
        ctx.beginPath();
        let anyVisible = false;
        projectedPoints.forEach((pt, idx) => {
          if (pt.z > -R * 0.15) {
            anyVisible = true;
            if (idx === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
        });

        if (anyVisible) {
          ctx.closePath();
          if (cont.type === 'ice') {
            // White glacial ice for Antarctica & Greenland
            ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          } else {
            // Lush natural green/earth continents
            ctx.fillStyle = 'rgba(34, 85, 58, 0.82)';
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
          }
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();
        }
      });

      // 5. Active Location Radar Pinpoint
      if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
        const pin = projectPoint(loc.lat, loc.lon);
        if (pin.z > 0) {
          // Radar pulse ring
          const ringProgress = (pulseTime % 1.6) / 1.6;
          const ringRadius = 5 + ringProgress * 22;
          const ringAlpha = (1 - ringProgress) * 0.9;

          ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pin.sx, pin.sy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Core beacon dot
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(pin.sx, pin.sy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Sleek pin badge
          const label = `${loc.name}`;
          ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
          const textW = ctx.measureText(label).width;

          const bx = pin.sx + 10;
          const by = pin.sy - 16;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bx, by, textW + 10, 18, 5) : ctx.rect(bx, by, textW + 10, 18);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, bx + 5, by + 13);
        }
      }

      // 6. Realistic 3D Day/Night Diffuse Shading
      const nightShadow = ctx.createRadialGradient(cx + R * 0.35, cy + R * 0.25, R * 0.4, cx, cy, R);
      nightShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      nightShadow.addColorStop(0.7, 'rgba(4, 8, 16, 0.45)');
      nightShadow.addColorStop(1, 'rgba(2, 5, 10, 0.85)');
      ctx.fillStyle = nightShadow;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Undo sphere clip

      // Outer rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loc?.lat, loc?.lon, loc?.name]);

  return (
    <div className="background-globe-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="background-globe-canvas" />
    </div>
  );
}
