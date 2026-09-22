import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  weatherApiKey: process.env.WEATHERAPI_KEY || '',
  openWeatherMapKey: process.env.OPENWEATHERMAP_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  googleMapsKey: process.env.GOOGLE_MAPS_KEY || '',
  googleMapsBackupKey: process.env.GOOGLE_MAPS_BACKUP_KEY || '',
  cacheTtlSeconds: 300, // 5 minutes fresh cache
  weatherApiTimeoutMs: 5000, // 5-second failover threshold
  worldTimeApiKey: process.env.WORLD_TIME_API_KEY || '',
  worldTimeApiHost: process.env.WORLD_TIME_API_HOST || 'world-clock.p.rapidapi.com'
};
