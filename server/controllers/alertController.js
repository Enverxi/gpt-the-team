import { alertService } from '../services/alertService.js';

export async function evaluateAlerts(req, res) {
  try {
    const { weatherData, preferences, alertHistory } = req.body;

    if (!weatherData) {
      return res.status(400).json({ error: 'weatherData is required' });
    }

    const result = alertService.evaluateAlerts(weatherData, preferences, alertHistory);
    res.json(result);
  } catch (err) {
    console.error('[AlertController] Error:', err.message);
    res.status(500).json({ error: 'Failed to evaluate alerts', message: err.message });
  }
}
