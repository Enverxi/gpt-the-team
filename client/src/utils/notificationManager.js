/**
 * Notification Manager for Browser Push & In-App Alerts
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return {
      supported: false,
      granted: false,
      status: 'unsupported',
      message: 'Browser notifications are not supported on this device.'
    };
  }

  if (Notification.permission === 'granted') {
    return {
      supported: true,
      granted: true,
      status: 'granted',
      message: 'Notifications are already enabled.'
    };
  }

  if (Notification.permission === 'denied') {
    return {
      supported: true,
      granted: false,
      status: 'denied',
      message: 'Notification permission is blocked in browser settings. WeatherGPT will use in-app alerts instead.'
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return {
        supported: true,
        granted: true,
        status: 'granted',
        message: 'Notification permission granted successfully.'
      };
    } else {
      return {
        supported: true,
        granted: false,
        status: 'denied',
        message: 'Notification permission denied. WeatherGPT will deliver alerts via in-app banners.'
      };
    }
  } catch (err) {
    return {
      supported: true,
      granted: false,
      status: 'error',
      message: err.message
    };
  }
}

export function showBrowserNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.id || 'weathergpt-alert',
      renotify: false
    };

    new Notification(title, { ...defaultOptions, ...options });
    return true;
  } catch (err) {
    console.warn('[NotificationManager] Notification error:', err);
    return false;
  }
}
