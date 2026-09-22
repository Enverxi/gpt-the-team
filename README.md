# WeatherGPT — AI Weather Alert & Assistance Agent

WeatherGPT is a full-stack, responsive AI weather agent application. It bridges the gap between raw numerical meteorological measurements and everyday human decisions. WeatherGPT retrieves real-time weather and 24-hour hourly forecasts from authoritative meteorological APIs, features automated dual-API failover, interprets natural-language questions through a strictly grounded AI engine, and delivers customizable proactive alerts with anti-spam suppression.

---

## 🌟 Key Features

1. **Dual-API Failover Architecture**
   - **Primary Weather Provider**: OpenWeatherMap (real-time current weather and global numerical forecast grid).
   - **Backup Weather Provider**: WeatherAPI.com (activated automatically if the primary provider times out after 5 seconds, errors, or returns malformed data).
   - **Data Transparency**: The UI prominently displays the active weather data source (`Primary API` or `Backup API`) and local last-updated timestamp.

2. **WeatherGPT AI Interpretation Agent**
   - **Strict Grounding**: The AI agent operates under zero-hallucination guardrails and is strictly grounded in real weather data.
   - **Temporal & Specific Time Understanding**: Interprets queries for "Now", "Next 3 hours", "Today", "Tonight", "Tomorrow", and specific times like "at 6 PM".
   - **Ambiguity Detection**: Detects vague queries (e.g., *"Will it rain later?"*) and proactively asks for clarification (*"What time are you planning to go out?"*).
   - **Actionable Guidance**: Contextual recommendations for umbrellas, hydration, cold layering, wind cautions, and travel safety context (meteorological risk without absolute safety guarantees).
   - **No Emojis**: Follows strict design specifications by maintaining clean, professional responses without emojis.
   - **Transparent Weather Factors**: Discloses the exact factors influencing the answer (*e.g., Rain Probability: 75%, Precipitation: 3.2mm*).

3. **Proactive Alert System & Anti-Spam Logic**
   - Configurable alert categories: **Rain**, **Heat**, **Strong Wind**, and **Official Severe Weather**.
   - Custom threshold sliders (*e.g., Rain > 50%, Temperature > 35°C, Wind > 40 km/h*).
   - **Anti-Spam Frequency Control**: Suppresses persistent condition alerts unless conditions worsen significantly (e.g., $\ge +3^\circ$C jump, $\ge +25\%$ rain probability surge, or new warning issued).
   - **Privacy-First Notifications**: Web Push Notifications requested only upon explicit user opt-in.

4. **Modern Responsive Design**
   - Built with modern vanilla CSS design system and CSS custom properties.
   - Smooth glassmorphism surfaces with ambient weather background animations (sunny, rain streaks, drifting clouds).
   - Full dark and light theme support with anti-FOUC initialization.
   - Unit toggle (°C / °F, km/h / mph, mm / in).
   - Responsive layouts optimized for mobile, tablet, and desktop viewports without horizontal overflow.

5. **Privacy & Zero Login**
   - No login, signup, or passwords required.
   - Instant GPS location resolution or manual city search with autocomplete.
   - All user preferences (theme, units, active location, alert thresholds, chat history) are stored safely on the client device via `localStorage`.

---

## 🏛️ System Architecture

```
WeatherGPT/
├── server/
│   ├── index.js                      # Express server entry point & static hosting
│   ├── config.js                     # Environment variable configuration
│   ├── routes/
│   │   ├── weatherRoutes.js          # /api/weather (forecast, search, status)
│   │   ├── aiRoutes.js               # /api/ai/chat
│   │   └── alertRoutes.js            # /api/alerts/evaluate
│   ├── controllers/
│   │   ├── weatherController.js      # Weather & city search orchestration
│   │   ├── aiController.js           # AI query handling & error degradation
│   │   └── alertController.js        # Alert evaluation controller
│   ├── services/
│   │   ├── weatherService.js         # Failover logic & in-memory freshness cache
│   │   ├── primaryWeatherProvider.js # OpenWeatherMap client & normalizer (Primary)
│   │   ├── backupWeatherProvider.js  # WeatherAPI.com client & normalizer (Backup)
│   │   ├── openWeatherMapProvider.js # OpenWeatherMap base service
│   │   ├── weatherApiProvider.js     # WeatherAPI.com base service
│   │   ├── aiService.js              # Grounded AI engine & Gemini integration
│   │   └── alertService.js           # Threshold checking & anti-spam suppression
│   └── utils/
│       ├── weatherSchema.js          # Normalized internal weather schema
│       └── cache.js                  # 5-minute memory cache
├── client/
│   ├── index.html                    # HTML entry point with anti-FOUC & font stack
│   ├── vite.config.js                # Vite build & /api proxy configuration
│   └── src/
│       ├── main.jsx                  # React DOM root & providers
│       ├── App.jsx                   # Main layout & dashboard orchestrator
│       ├── index.css                 # Glassmorphic CSS design tokens & animations
│       ├── context/
│       │   ├── ThemeContext.jsx      # Dark/Light theme provider
│       │   └── WeatherContext.jsx    # Global weather, alert, and chat state
│       ├── components/
│       │   ├── LandingPage.jsx       # Welcome hero & quick location selection
│       │   ├── Header.jsx            # Brand, units, theme, and source badge
│       │   ├── LocationSelector.jsx  # GPS and autocomplete search bar
│       │   ├── CurrentWeather.jsx    # Hero temp, condition, metrics grid
│       │   ├── Next3Hours.jsx        # Immediate 3-hour trend card
│       │   ├── HourlyForecast.jsx    # 24-hour horizontal forecast timeline
│       │   ├── OfficialAlertBanner.jsx # High-visibility official warnings
│       │   ├── WeatherChat.jsx       # AI conversational assistant
│       │   ├── QuickActions.jsx      # 1-click weather question pills
│       │   ├── AlertSettingsModal.jsx# Threshold sliders & notification opt-in
│       │   ├── WeatherAnimation.jsx  # Ambient atmospheric backdrop
│       │   ├── LoadingSkeleton.jsx   # Pulse skeleton states
│       │   └── ErrorDisplay.jsx      # Resilient error recovery states
│       └── utils/
│           ├── unitConverter.js      # Temperature, speed, precip conversions
│           ├── storage.js            # Safe localStorage abstraction
│           └── notificationManager.js# Browser Push Notification wrapper
├── tests/
│   ├── weatherService.test.js        # Failover and normalization tests
│   ├── aiInterpretation.test.js      # AI grounding, travel, and timing tests
│   └── alertSystem.test.js           # Alert threshold and anti-spam tests
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; developed and tested on Node v22.19.0)
- npm (v9 or higher)

### 1. Installation

Clone the repository and install root dependencies:

```bash
git clone https://github.com/your-username/WeatherGPT.git
cd WeatherGPT
npm install
npm install --prefix client
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Edit `.env` to configure your API keys:

```env
PORT=5000

# Primary Weather Provider (OpenWeatherMap)
OPENWEATHERMAP_KEY=your_openweathermap_key_here

# Fallback Weather Provider (WeatherAPI.com)
WEATHERAPI_KEY=your_weatherapi_key_here

# Optional: Gemini API Key (WeatherGPT includes a built-in Grounded Engine if omitted)
GEMINI_API_KEY=
AI_PROVIDER=grounded-builtin
```

### 3. Running Locally

**Development Mode (Concurrent Frontend & Backend):**
```bash
npm run dev
```
- Backend server runs on `http://localhost:5000`
- Vite frontend runs on `http://localhost:5173` with automated API proxying

**Production Mode:**
```bash
npm run build
npm start
```
The application will be served at `http://localhost:5000`.

---

## 🧪 Automated Testing

WeatherGPT includes a comprehensive Vitest test suite covering critical weather failover logic, AI prompt grounding, and anti-spam rules:

```bash
npm test
```

### Test Coverage Summary
- `tests/weatherService.test.js`: Validates schema normalization, primary API success (OpenWeatherMap), 5-second failover activation to WeatherAPI.com on primary error/timeout, and dual-failure graceful handling.
- `tests/aiInterpretation.test.js`: Verifies time scope resolution ("Next 3 hours", "Tomorrow", "6 PM"), ambiguity clarification prompt handling, travel risk guidance without personal safety guarantees, and strict exclusion of emojis.
- `tests/alertSystem.test.js`: Tests threshold triggering, alert suppression for user-disabled categories, repeat alert suppression for persistent weather, and re-alerting when conditions worsen significantly ($\ge +25\%$ rain probability surge).

---

## 🎬 Hackathon Demonstration Guide

Follow this sequence when demonstrating WeatherGPT:

1. **Landing Screen**: Show the minimal landing page with the core philosophy: *"Weather APIs provide the facts. WeatherGPT provides the interpretation."*
2. **Location Selection**: Click a popular city (*e.g., "London"*) or use the GPS button to load real-time conditions.
3. **Current Weather & Metrics**: Point out the primary temperature, feels-like, rain probability, precipitation, humidity, wind, UV index, and authoritative source badge (`Primary API`).
4. **Next 3-Hour Trend**: Demonstrate the dedicated 3-hour card highlighting the immediate rain trend.
5. **24-Hour Forecast Timeline**: Scroll horizontally through the upcoming 24 hours displaying hourly rain bars and wind speeds.
6. **AI Assistant & Quick Actions**:
   - Click the quick action chip: **"Rain in next 3 hours"** $\rightarrow$ Observe the synthesized trend summary without emojis and transparent weather factors.
   - Click **"Travel conditions"** $\rightarrow$ Notice the weather-based risk guidance avoiding absolute safety guarantees.
   - Type an ambiguous question: *"Will it rain later?"* $\rightarrow$ Observe WeatherGPT asking for clarification (*"What time are you planning to go out?"*).
7. **Proactive Alerts & Thresholds**:
   - Click the bell icon in the header $\rightarrow$ Adjust the Rain Alert or Heat Advisory slider.
   - Toggle browser notifications to view the opt-in permission handling.
8. **UI Flexibility**:
   - Switch units between **°C** and **°F**.
   - Toggle between **Dark Mode** and **Light Mode** using the theme icon.
   - Resize the window to verify responsive layout adaptation between mobile single-column, tablet two-column, and desktop side-by-side dashboard.

---

## 🔮 Future Enhancements

- Nearby shelter and umbrella store discovery integrations.
- Multi-location saved bookmarks for users monitoring family in different cities.
- Native mobile push notification service worker (PWA).
- Historical weather trend comparisons (e.g., "3°C warmer than yesterday").

---

## 📄 License

MIT License. Developed for hackathons and production-ready deployments.
