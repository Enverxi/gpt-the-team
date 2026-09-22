import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import weatherRoutes from './routes/weatherRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertRoutes);

// Public config for Google Maps (safe client key delivery)
app.get('/api/config/maps', (req, res) => {
  res.json({
    key: config.googleMapsKey,
    backupKey: config.googleMapsBackupKey
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'WeatherGPT AI Agent',
    version: '1.0.0',
    uptime: process.uptime(),
    primaryProvider: 'OpenWeatherMap',
    backupProvider: 'WeatherAPI.com',
    aiEngine: config.geminiApiKey ? 'Gemini + Grounded Engine' : 'Grounded Built-in Engine'
  });
});

// Production client static serving
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) {
      // In development mode when client/dist isn't built yet, return helpful json
      res.status(200).json({
        message: 'WeatherGPT Backend is running! In development, run Vite dev server on port 5173.',
        apiRoutes: ['/api/weather/forecast?city=London', '/api/ai/chat', '/api/alerts/evaluate', '/api/health']
      });
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[WeatherGPT Server Error]:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

const server = app.listen(config.port, () => {
  console.log(`=================================================`);
  console.log(`🌦️  WeatherGPT Server running on port ${config.port}`);
  console.log(`   Primary Weather API: OpenWeatherMap`);
  console.log(`   Backup Weather API:  WeatherAPI.com`);
  console.log(`   AI Provider:         ${config.aiProvider}`);
  console.log(`   Health Check:        http://localhost:${config.port}/api/health`);
  console.log(`=================================================`);
});

export default app;
