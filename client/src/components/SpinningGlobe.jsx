import React, { useEffect, useRef, useState } from 'react';
import { useWeather } from '../context/WeatherContext';

/**
 * Generates an array of land coordinates (lat, lon in degrees)
 * representing major continental landmasses with recognizable shapes.
 */
function generateContinentPoints() {
  const points = [];
  const addBlock = (minLat, maxLat, minLon, maxLon, step = 4, filterFn = null) => {
    for (let lat = minLat; lat <= maxLat; lat += step) {
      for (let lon = minLon; lon <= maxLon; lon += step) {
        if (!filterFn || filterFn(lat, lon)) {
          points.push({ lat, lon });
        }
      }
    }
  };

  // North America
  addBlock(15, 70, -165, -55, 3.5, (lat, lon) => {
    if (lat < 30 && lon < -115) return false;
    if (lat < 25 && lon > -80) return false;
    if (lat > 50 && lon > -50) return false;
    return true;
  });

  // South America
  addBlock(-55, 12, -82, -35, 3.5, (lat, lon) => {
    if (lat < -20 && lon > -40) return false;
    if (lat < -40 && lon > -60) return false;
    if (lat > 0 && lon < -78) return false;
    return true;
  });

  // Europe
  addBlock(36, 70, -10, 42, 3.5, (lat, lon) => {
    if (lat < 42 && lon < -5) return true; // Iberia
    if (lat > 55 && lon < 5 && lon > -5) return true; // UK
    return true;
  });

  // Africa
  addBlock(-35, 37, -18, 52, 3.5, (lat, lon) => {
    if (lat < 5 && lon > 42) return false; // Horn of Africa carve
    if (lat < -15 && lon > 38) return false;
    return true;
  });

  // Asia
  addBlock(10, 75, 42, 175, 3.5, (lat, lon) => {
    if (lat < 25 && lon < 65 && lon > 55) return false; // Arabian sea carve
    if (lat < 20 && lon > 125) return false;
    return true;
  });

  // Australia
  addBlock(-40, -11, 112, 154, 3.5);

  // Antarctica
  addBlock(-88, -68, -180, 180, 5);

  return points;
}

const LAND_POINTS = generateContinentPoints();

export default function SpinningGlobe() {
  const { weatherData } = useWeather();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotY: 0, rotX: 0.35 });
  const rotYRef = useRef(0);
  const rotXRef = useRef(0.35); // ~20 deg Earth axial tilt
  const targetRotYRef = useRef(null);

  const loc = weatherData?.location;
  const targetLat = loc ? loc.lat : 20;
  const targetLon = loc ? loc.lon : 0;
  const cityName = loc ? loc.name : 'Earth';

  // Smoothly orient globe to target city when requested
  const focusOnCity = () => {
    const targetDeg = targetLon;
    const currentDeg = (rotYRef.current * 180) / Math.PI;
    let diff = ((targetDeg - currentDeg) % 360 + 540) % 360 - 180;
    targetRotYRef.current = ((currentDeg + diff) * Math.PI) / 180;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulseTime = 0;

    const render = () => {
      pulseTime += 0.03;

      // Handle smooth transition to targeted city or auto-spin
      if (targetRotYRef.current !== null) {
        const diff = targetRotYRef.current - rotYRef.current;
        if (Math.abs(diff) > 0.005) {
          rotYRef.current += diff * 0.08;
        } else {
          rotYRef.current = targetRotYRef.current;
          targetRotYRef.current = null;
        }
      } else if (!isDragging) {
        rotYRef.current += 0.004; // Smooth continuous spin
      }

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
      const R = Math.min(width, height) * 0.40;

      const tilt = rotXRef.current;
      const rotY = rotYRef.current;

      // 1. Atmosphere Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.35);
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      glowGrad.addColorStop(0.5, 'rgba(155, 114, 203, 0.12)');
      glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Earth Sphere Body (Deep space ocean gradient)
      const oceanGrad = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.1, cx, cy, R);
      oceanGrad.addColorStop(0, '#13233c');
      oceanGrad.addColorStop(0.7, '#0c1524');
      oceanGrad.addColorStop(1, '#060a12');

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Clip rendering to the sphere disk
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 3. Coordinate Graticule Lines (Parallels & Meridians)
      ctx.lineWidth = 0.75;

      // Parallels (Latitude lines at -60, -30, 0, 30, 60)
      const parallels = [-60, -30, 0, 30, 60];
      parallels.forEach((lat) => {
        const phi = (lat * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 5) {
          const theta = (lon * Math.PI) / 180 - rotY;
          const x = R * Math.cos(phi) * Math.sin(theta);
          const y = -R * Math.sin(phi);
          const z = R * Math.cos(phi) * Math.cos(theta);

          const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
          const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);

          if (z2 > 0) {
            const sx = cx + x;
            const sy = cy + y2;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = lat === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
      });

      // Meridians (Longitude lines every 30 deg)
      for (let lon = -180; lon < 180; lon += 30) {
        const theta = (lon * Math.PI) / 180 - rotY;
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const phi = (lat * Math.PI) / 180;
          const x = R * Math.cos(phi) * Math.sin(theta);
          const y = -R * Math.sin(phi);
          const z = R * Math.cos(phi) * Math.cos(theta);

          const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
          const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);

          if (z2 > 0) {
            const sx = cx + x;
            const sy = cy + y2;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.stroke();
      }

      // 4. Continent Land Points (3D projected with depth illumination)
      for (let i = 0; i < LAND_POINTS.length; i++) {
        const p = LAND_POINTS[i];
        const phi = (p.lat * Math.PI) / 180;
        const theta = (p.lon * Math.PI) / 180 - rotY;

        const x = R * Math.cos(phi) * Math.sin(theta);
        const y = -R * Math.sin(phi);
        const z = R * Math.cos(phi) * Math.cos(theta);

        const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
        const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);

        if (z2 > 0) {
          const depth = z2 / R; // 0 (edge) to 1 (center)
          const dotRadius = 1.0 + depth * 0.9;
          const alpha = 0.2 + depth * 0.65;

          ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx + x, cy + y2, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Active Location Pin & Pulsing Radar Beacon
      if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
        const pinPhi = (loc.lat * Math.PI) / 180;
        const pinTheta = (loc.lon * Math.PI) / 180 - rotY;

        const px = R * Math.cos(pinPhi) * Math.sin(pinTheta);
        const py = -R * Math.sin(pinPhi);
        const pz = R * Math.cos(pinPhi) * Math.cos(pinTheta);

        const py2 = py * Math.cos(tilt) - pz * Math.sin(tilt);
        const pz2 = py * Math.sin(tilt) + pz * Math.cos(tilt);

        if (pz2 > 0) {
          const pinX = cx + px;
          const pinY = cy + py2;

          // Pulsing radar rings
          const ringProgress = (pulseTime % 1.5) / 1.5;
          const ringRadius = 4 + ringProgress * 16;
          const ringAlpha = (1 - ringProgress) * 0.8;

          ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pinX, pinY, ringRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Second offset pulse ring
          const ringProgress2 = ((pulseTime + 0.75) % 1.5) / 1.5;
          const ringRadius2 = 4 + ringProgress2 * 16;
          const ringAlpha2 = (1 - ringProgress2) * 0.8;

          ctx.strokeStyle = `rgba(155, 114, 203, ${ringAlpha2})`;
          ctx.beginPath();
          ctx.arc(pinX, pinY, ringRadius2, 0, Math.PI * 2);
          ctx.stroke();

          // Core pinpoint dot
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pinX, pinY, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // Reset shadow

          // Pinpoint mini flag / label
          const labelText = cityName;
          ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1;
          const lx = pinX + 8;
          const ly = pinY - 14;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(lx, ly, textWidth + 8, 16, 4) : ctx.rect(lx, ly, textWidth + 8, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, lx + 4, ly + 12);
        }
      }

      // Inner horizon shading to give realistic 3D sphere curvature
      const innerShadow = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R);
      innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      innerShadow.addColorStop(1, 'rgba(4, 7, 13, 0.75)');
      ctx.fillStyle = innerShadow;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Undo sphere clip

      // Outer rim edge highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetLat, targetLon, cityName, isDragging]);

  // Drag listeners
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotYRef.current,
      rotX: rotXRef.current
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    rotYRef.current = dragStartRef.current.rotY - dx * 0.008;
    const newTilt = dragStartRef.current.rotX + dy * 0.005;
    rotXRef.current = Math.max(-0.6, Math.min(0.8, newTilt));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      rotY: rotYRef.current,
      rotX: rotXRef.current
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    rotYRef.current = dragStartRef.current.rotY - dx * 0.008;
    const newTilt = dragStartRef.current.rotX + dy * 0.005;
    rotXRef.current = Math.max(-0.6, Math.min(0.8, newTilt));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="spinning-globe-card glass-card">
      <div className="globe-card-header">
        <div>
          <span className="globe-tag">Earth Tracking</span>
          <h4 className="globe-title">{cityName}</h4>
        </div>
        {loc && (
          <button
            className="globe-focus-btn"
            onClick={focusOnCity}
            title="Focus globe on current city"
            type="button"
          >
            Center Pin
          </button>
        )}
      </div>

      <div
        className="globe-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        title="Click and drag to rotate Earth"
      >
        <canvas ref={canvasRef} className="globe-canvas" />
      </div>

      <div className="globe-footer">
        {loc ? (
          <span className="coords-text">
            {Math.abs(loc.lat).toFixed(2)}° {loc.lat >= 0 ? 'N' : 'S'}, {Math.abs(loc.lon).toFixed(2)}° {loc.lon >= 0 ? 'E' : 'W'}
          </span>
        ) : (
          <span className="coords-text">Live Global Forecast</span>
        )}
        <span className="globe-hint">Drag to spin</span>
      </div>
    </div>
  );
}
