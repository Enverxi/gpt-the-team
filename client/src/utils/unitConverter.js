export function convertTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius * 10) / 10;
}

export function formatTemp(celsius, unit = 'C') {
  const val = convertTemp(celsius, unit);
  return `${val}°${unit}`;
}

export function convertSpeed(kmh, unit = 'kmh') {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (unit === 'mph') {
    return Math.round(kmh * 0.621371 * 10) / 10;
  }
  return Math.round(kmh * 10) / 10;
}

export function formatSpeed(kmh, unit = 'kmh') {
  const val = convertSpeed(kmh, unit);
  return `${val} ${unit === 'mph' ? 'mph' : 'km/h'}`;
}

export function convertPrecip(mm, unit = 'mm') {
  if (mm === null || mm === undefined || isNaN(mm)) return '--';
  if (unit === 'in') {
    return Math.round(mm * 0.0393701 * 100) / 100;
  }
  return Math.round(mm * 10) / 10;
}

export function formatPrecip(mm, unit = 'mm') {
  const val = convertPrecip(mm, unit);
  return `${val} ${unit === 'in' ? 'in' : 'mm'}`;
}
