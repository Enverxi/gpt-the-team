const PREFIX = 'weathergpt_';

export function getStoredItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return defaultValue;
  }
}

export function setStoredItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to write ${key}:`, err);
  }
}

export function removeStoredItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove ${key}:`, err);
  }
}
