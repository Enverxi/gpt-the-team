import { config } from '../config.js';

export class AIService {
  constructor() {
    this.geminiApiKey = config.geminiApiKey;
    this.provider = config.aiProvider;
  }

  /**
   * Main entry point to process a natural-language query
   */
  async processQuery(question, weatherData, localityContext = null) {
    if (!question || typeof question !== 'string' || !question.trim()) {
      return {
        answer: 'Please provide a weather-related question.',
        isClarification: false,
        factors: [],
        timeScope: 'none'
      };
    }

    const trimmedQuestion = question.trim();

    // 1. Detect if the question is ambiguous and requires clarification
    const ambiguityCheck = this.checkAmbiguity(trimmedQuestion);
    if (ambiguityCheck.isAmbiguous) {
      return {
        answer: ambiguityCheck.clarificationQuestion,
        isClarification: true,
        factors: [],
        timeScope: 'ambiguous'
      };
    }

    // 2. Identify time scope and topic
    const intent = this.extractIntent(trimmedQuestion, weatherData);

    // 3. Extract relevant structured weather slice
    const contextSlice = this.buildStructuredContext(intent, weatherData);

    // 4. If Gemini API is configured, try calling it; otherwise use Grounded Engine
    if (this.geminiApiKey && (this.provider === 'gemini' || this.provider === 'auto')) {
      try {
        const geminiResult = await this.callGemini(trimmedQuestion, contextSlice, weatherData, localityContext);
        if (geminiResult && geminiResult.answer) {
          return geminiResult;
        }
      } catch (err) {
        console.warn(`[AIService] Gemini API call failed (${err.message}). Falling back to Grounded Engine.`);
      }
    }

    // 5. Execute Grounded Built-in Engine
    return this.generateGroundedResponse(trimmedQuestion, intent, contextSlice, weatherData, localityContext);
  }

  /**
   * Section 18: Check for ambiguous questions that require clarification
   */
  checkAmbiguity(question) {
    const q = question.toLowerCase();

    // Explicit vague timing with no target time
    if (
      /^(will it rain|is it going to rain|is it raining|weather)\s+later(\?)?$/i.test(q) ||
      /^what (about|is the weather) later(\?)?$/i.test(q) ||
      /^will it rain later today(\?)?$/i.test(q)
    ) {
      return {
        isAmbiguous: true,
        clarificationQuestion: 'What time are you planning to go out?'
      };
    }

    if (/^is it safe(\?)?$/i.test(q) || /^can i travel(\?)?$/i.test(q)) {
      return {
        isAmbiguous: true,
        clarificationQuestion: 'Where or when are you planning to travel?'
      };
    }

    return { isAmbiguous: false };
  }

  /**
   * Section 17: Natural language time and topic understanding
   */
  extractIntent(question, weatherData) {
    const q = question.toLowerCase();

    let timeScope = 'current'; // default
    let targetHour = null;

    // Check specific time patterns like "6 pm", "18:00", "5:30 am"
    const timeMatch = q.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const isPm = timeMatch[3].toLowerCase() === 'pm';
      if (isPm && hour < 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
      targetHour = hour;
      timeScope = 'specific_time';
    } else if (q.includes('next 3 hours') || q.includes('next three hours') || q.includes('in 3 hours')) {
      timeScope = 'next_3_hours';
    } else if (q.includes('next few hours') || q.includes('coming hours')) {
      timeScope = 'next_3_hours';
    } else if (q.includes('tonight')) {
      timeScope = 'tonight';
    } else if (q.includes('this afternoon') || q.includes('afternoon')) {
      timeScope = 'afternoon';
    } else if (q.includes('this morning') || q.includes('morning')) {
      timeScope = 'morning';
    } else if (q.includes('this evening') || q.includes('evening')) {
      timeScope = 'evening';
    } else if (q.includes('tomorrow')) {
      timeScope = 'tomorrow';
    } else if (q.includes('today') || q.includes('rest of the day')) {
      timeScope = 'today';
    }

    // Identify topic and greeting
    const isGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(q.trim());

    let topic = 'general';
    if (isGreeting) {
      topic = 'greeting';
    } else if (q.includes('wear') || q.includes('clothing') || q.includes('clothes') || q.includes('outfit') || q.includes('dress') || q.includes('jacket') || q.includes('coat')) {
      topic = 'clothing';
    } else if (q.includes('umbrella') || q.includes('parasol')) {
      topic = 'umbrella';
    } else if (q.includes('travel') || q.includes('commute') || q.includes('drive') || q.includes('driving') || q.includes('safe to go') || q.includes('road')) {
      topic = 'travel';
    } else if (q.includes('rain') || q.includes('shower') || q.includes('drizzle')) {
      topic = 'rain';
    } else if (q.includes('hot') || q.includes('heat') || q.includes('temperature') || q.includes('cold') || q.includes('warm')) {
      topic = 'temperature';
    } else if (q.includes('wind') || q.includes('breeze') || q.includes('gust')) {
      topic = 'wind';
    } else if (q.includes('uv') || q.includes('sunscreen') || q.includes('sun protection')) {
      topic = 'uv';
    } else if (
      q.includes('exercise') || q.includes('cycling') || q.includes('cycle') ||
      q.includes('bike') || q.includes('biking') || q.includes('running') ||
      q.includes('jog') || q.includes('jogging') || q.includes('workout') ||
      q.includes('outdoor') || q.includes('outside') || q.includes('walk') ||
      q.includes('sports')
    ) {
      topic = 'outdoor_exercise';
    }

    return { timeScope, targetHour, topic, isGreeting };
  }

  /**
   * Extract relevant slice of weather data corresponding to the intent
   */
  buildStructuredContext(intent, weather) {
    const hourly = weather.hourlyForecast || [];
    const { timeScope, targetHour } = intent;

    let relevantHours = [];

    if (timeScope === 'next_3_hours') {
      relevantHours = hourly.slice(0, 3);
    } else if (timeScope === 'specific_time' && targetHour !== null) {
      relevantHours = hourly.filter(h => {
        const hourNum = new Date(h.timeEpoch * 1000).getHours();
        return hourNum === targetHour;
      });
      if (relevantHours.length === 0) relevantHours = hourly.slice(0, 3);
    } else if (timeScope === 'tonight') {
      relevantHours = hourly.filter(h => {
        const hourNum = new Date(h.timeEpoch * 1000).getHours();
        return hourNum >= 19 && hourNum <= 23;
      });
      if (relevantHours.length === 0) relevantHours = hourly.slice(0, 4);
    } else if (timeScope === 'morning') {
      relevantHours = hourly.filter(h => {
        const hourNum = new Date(h.timeEpoch * 1000).getHours();
        return hourNum >= 6 && hourNum <= 11;
      });
      if (relevantHours.length === 0) relevantHours = hourly.slice(0, 4);
    } else if (timeScope === 'afternoon') {
      relevantHours = hourly.filter(h => {
        const hourNum = new Date(h.timeEpoch * 1000).getHours();
        return hourNum >= 12 && hourNum <= 16;
      });
      if (relevantHours.length === 0) relevantHours = hourly.slice(0, 4);
    } else if (timeScope === 'evening') {
      relevantHours = hourly.filter(h => {
        const hourNum = new Date(h.timeEpoch * 1000).getHours();
        return hourNum >= 17 && hourNum <= 20;
      });
      if (relevantHours.length === 0) relevantHours = hourly.slice(0, 4);
    } else if (timeScope === 'tomorrow') {
      // Find entries that belong to tomorrow
      const todayDate = new Date().getDate();
      relevantHours = hourly.filter(h => new Date(h.timeEpoch * 1000).getDate() !== todayDate);
      if (relevantHours.length === 0) relevantHours = hourly.slice(12, 24);
    } else {
      // Today or current
      relevantHours = hourly.slice(0, 6);
    }

    return {
      current: {
        temp: weather.temperature,
        feelsLike: weather.feelsLike,
        condition: weather.condition,
        rainProbability: weather.rainProbability,
        precipitation: weather.precipitation,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        uvIndex: weather.uvIndex
      },
      relevantHours,
      alerts: weather.alerts || []
    };
  }

  /**
   * Deterministic Grounded Engine (100% weather-grounded, zero hallucinations, no emojis)
   */
  generateGroundedResponse(question, intent, context, weather, localityContext = null) {
    const { timeScope, targetHour, topic } = intent;
    const { current, relevantHours, alerts } = context;

    const locationName = localityContext
      ? `${localityContext.name} in ${localityContext.parentCity}`
      : weather.location.name;

    const factors = [];
    let answer = '';

    // Calculate canonical rain probability across current and immediate forecast hours
    const canonicalRainProb = relevantHours.length > 0
      ? Math.max(...relevantHours.map(h => h.rainProbability || 0), current.rainProbability || 0)
      : (current.rainProbability || 0);

    const maxRainProb = canonicalRainProb;

    const totalPrecip = relevantHours.length > 0
      ? relevantHours.reduce((acc, h) => acc + (h.precipitation || 0), 0)
      : current.precipitation;

    const maxWind = relevantHours.length > 0
      ? Math.max(...relevantHours.map(h => h.windSpeed))
      : current.windSpeed;

    const maxTemp = relevantHours.length > 0
      ? Math.max(...relevantHours.map(h => h.temp))
      : current.temperature;

    const minTemp = relevantHours.length > 0
      ? Math.min(...relevantHours.map(h => h.temp))
      : current.temperature;

    // Determine conditions and gear eligibility
    const conditions = relevantHours.map(h => h.condition);
    const hasRainCondition = conditions.some(c => /rain|shower|drizzle|thunder/i.test(c)) || /rain|shower|drizzle|thunder/i.test(current.condition);
    const isDaytime = Boolean(weather.isDay);
    const isSunnyOrClear = /sunny|clear|partly cloudy/i.test(weather.condition);
    const isOvercastOrDark = /overcast|fog|mist|smoke|haze/i.test(weather.condition);
    const canRecommendSunglasses = isDaytime && isSunnyOrClear && !hasRainCondition && !isOvercastOrDark && (weather.uvIndex >= 3);

    // Add transparency factors
    if (topic === 'rain' || topic === 'umbrella') {
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      factors.push(`Precipitation: ${Math.round(totalPrecip * 10) / 10} mm`);
      factors.push(`Condition: ${weather.condition}`);
    } else if (topic === 'travel') {
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Wind: ${maxWind} km/h`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      if (alerts.length > 0) factors.push(`Active Alert: ${alerts[0].event}`);
    } else if (topic === 'temperature') {
      factors.push(`Temperature: ${weather.temperature}°C`);
      factors.push(`Feels Like: ${weather.feelsLike}°C`);
      factors.push(`Forecast Range: ${minTemp}°C to ${maxTemp}°C`);
    } else if (topic === 'wind') {
      factors.push(`Current Wind: ${weather.windSpeed} km/h`);
      factors.push(`Peak Forecast Wind: ${maxWind} km/h`);
    } else if (topic === 'uv') {
      factors.push(`UV Index: ${weather.uvIndex}`);
    } else {
      factors.push(`Temperature: ${weather.temperature}°C`);
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
    }

    // Official alert check
    let alertNotice = '';
    if (alerts.length > 0) {
      alertNotice = ` Note that an official weather advisory (${alerts[0].event}) is active for this area.`;
    }

    // TOPIC 0: GREETINGS (Warm greeting, local conditions, how to help)
    if (intent.isGreeting || topic === 'greeting') {
      factors.length = 0;
      factors.push(`Temperature: ${weather.temperature}°C`);
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      answer = `Hello! Welcome to WeatherGPT Assistant. Currently in ${locationName}, it is ${weather.temperature}°C (feels like ${weather.feelsLike}°C) with ${weather.condition.toLowerCase()} skies. Rain probability is ${canonicalRainProb}%, humidity is ${current.humidity}%, and winds are ${weather.windSpeed} km/h.${alertNotice} How can I help you with your weather plans or recommendations today?`;
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 1: OUTDOOR EXERCISE & CYCLING ADVISORY (First-sentence verdict, physical feasibility)
    if (topic === 'outdoor_exercise') {
      factors.length = 0;
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      factors.push(`Temperature: ${weather.temperature}°C`);
      factors.push(`Wind: ${maxWind} km/h`);
      if (weather.uvIndex >= 6 && isDaytime) factors.push(`UV Index: ${weather.uvIndex}`);

      let verdict = '';
      let reason = '';

      if (alerts.length > 0) {
        verdict = 'Outdoor cycling and exercise are not recommended right now';
        reason = `an official weather alert (${alerts[0].event}) is active in ${locationName}`;
      } else if (canonicalRainProb >= 50 || hasRainCondition || totalPrecip > 0.5) {
        verdict = 'Outdoor cycling and exercise are not recommended right now';
        reason = `wet, slippery roads and an ${canonicalRainProb}% rain probability with ${weather.condition.toLowerCase()}`;
      } else if (maxWind >= 35) {
        verdict = 'Caution or postponement is advised for outdoor cycling';
        reason = `gusty winds up to ${maxWind} km/h creating hazardous conditions on the road`;
      } else if (weather.temperature >= 35 || weather.feelsLike >= 38) {
        verdict = 'Outdoor workouts are not recommended during peak heat';
        reason = `extreme temperatures of ${weather.temperature}°C (feels like ${weather.feelsLike}°C), posing a risk of heat exhaustion`;
      } else if (weather.temperature <= 5) {
        verdict = 'Caution is advised if exercising outdoors';
        reason = `cold temperatures of ${weather.temperature}°C with potential icy surfaces; dress in thermal layers`;
      } else {
        verdict = 'Yes, conditions are suitable for outdoor exercise and cycling right now';
        reason = `clear conditions, manageable winds (${weather.windSpeed} km/h), and a low rain probability (${canonicalRainProb}%)`;
      }

      answer = `${verdict} due to ${reason}. Currently in ${locationName}, it is ${weather.temperature}°C (feels like ${weather.feelsLike}°C) with ${weather.condition.toLowerCase()} skies, humidity is ${current.humidity}%, and winds are ${weather.windSpeed} km/h.${alertNotice}`;
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 2: CLOTHING & WHAT TO WEAR (First-sentence verdict, common-sense gear, no sunglasses at night/rain)
    if (topic === 'clothing') {
      factors.length = 0;
      factors.push(`Temperature: ${weather.temperature}°C`);
      factors.push(`Feels Like: ${weather.feelsLike}°C`);
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      if (canRecommendSunglasses) factors.push(`UV Index: ${weather.uvIndex}`);
      if (maxWind >= 35) factors.push(`Wind: ${maxWind} km/h`);

      const effectiveTemp = weather.feelsLike ?? weather.temperature;
      let gearRecommendations = [];

      // Fabric / Clothing based on Feels Like and Humidity
      if (effectiveTemp >= 30) {
        gearRecommendations.push('wear lightweight, breathable cotton or linen fabrics to stay cool in the heat');
      } else if (effectiveTemp >= 22) {
        gearRecommendations.push(current.humidity >= 70
          ? 'wear light, breathable cotton clothing to manage high humidity'
          : 'wear comfortable light clothing such as a t-shirt and breathable trousers or shorts');
      } else if (effectiveTemp >= 15) {
        gearRecommendations.push('wear comfortable light layers such as a long-sleeve shirt or a light jacket over a t-shirt');
      } else if (effectiveTemp >= 8) {
        gearRecommendations.push('dress in warm layers like a sweater, fleece, or medium jacket with long trousers');
      } else {
        gearRecommendations.push('wear a heavy winter coat, thermal base layers, gloves, and a scarf');
      }

      // Rain gear rule
      if (canonicalRainProb >= 40 || hasRainCondition) {
        gearRecommendations.push('carry an umbrella or wear a waterproof jacket');
      }

      // Sunglasses rule: ONLY if UV >= 3 AND sunny/clear/partly cloudy AND daytime. NEVER if rain, overcast, or night.
      if (canRecommendSunglasses) {
        gearRecommendations.push('bring UV-protective sunglasses');
      }

      if (isDaytime && isSunnyOrClear && weather.uvIndex >= 6) {
        gearRecommendations.push('apply SPF 30+ sunscreen');
      }

      if (maxWind >= 38) {
        gearRecommendations.push('a windbreaker against gusty winds');
      }

      const verdictSentence = `For today's weather, I recommend ${gearRecommendations.join(', and ')}.`;
      const telemetrySentence = `Currently in ${locationName}, it is ${weather.temperature}°C (feels like ${weather.feelsLike}°C) with ${weather.condition.toLowerCase()} skies, ${current.humidity}% humidity, and a ${canonicalRainProb}% chance of rain.${alertNotice}`;

      answer = `${verdictSentence} ${telemetrySentence}`;
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 3: NEXT 3 HOURS RAIN ANALYSIS
    if (timeScope === 'next_3_hours' && (topic === 'rain' || topic === 'umbrella' || topic === 'general')) {
      const h1 = relevantHours[0]?.rainProbability ?? current.rainProbability;
      const h2 = relevantHours[1]?.rainProbability ?? h1;
      const h3 = relevantHours[2]?.rainProbability ?? h2;

      if (canonicalRainProb >= 50 || totalPrecip > 0.5 || hasRainCondition) {
        answer = `Rain is likely within the next 3 hours (hourly chances: ${h1}%, ${h2}%, and ${h3}%). Carry an umbrella or wear a rain jacket if you plan to go outside.${alertNotice}`;
      } else if (canonicalRainProb >= 25) {
        answer = `There is a slight chance of light rain over the next 3 hours, peaking around ${canonicalRainProb}%. You may want to carry a compact umbrella just in case.${alertNotice}`;
      } else {
        answer = `Rain is unlikely in the next 3 hours, with rain probabilities remaining low between ${Math.min(h1, h2, h3)}% and ${canonicalRainProb}%. Conditions appear predominantly ${relevantHours[0]?.condition || current.condition}.${alertNotice}`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 4: UMBRELLA QUESTION (First-sentence direct resolution)
    if (topic === 'umbrella') {
      factors.length = 0;
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      factors.push(`Precipitation: ${Math.round(totalPrecip * 10) / 10} mm`);

      if (canonicalRainProb >= 40 || totalPrecip > 0.2 || hasRainCondition) {
        answer = `Yes, you should carry an umbrella or waterproof jacket—current rain probability is ${canonicalRainProb}% with ${weather.condition.toLowerCase()} conditions. Expected precipitation is ${Math.round(totalPrecip * 10) / 10} mm and humidity is ${current.humidity}%.${alertNotice}`;
      } else if (canonicalRainProb >= 20) {
        answer = `An umbrella is not strictly necessary, but carrying a compact one is a sensible precaution with a ${canonicalRainProb}% chance of rain. Current conditions in ${locationName} are ${weather.condition.toLowerCase()} at ${weather.temperature}°C.${alertNotice}`;
      } else {
        answer = `No, you do not need an umbrella right now—the rain probability is only ${canonicalRainProb}% with ${weather.condition.toLowerCase()} skies. Currently in ${locationName}, it is ${weather.temperature}°C with ${weather.windSpeed} km/h winds.${alertNotice}`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 5: TRAVEL & COMMUTE (First-sentence direct resolution)
    if (topic === 'travel') {
      factors.length = 0;
      factors.push(`Condition: ${weather.condition}`);
      factors.push(`Wind: ${maxWind} km/h`);
      factors.push(`Rain Probability: ${canonicalRainProb}%`);
      if (alerts.length > 0) factors.push(`Active Alert: ${alerts[0].event}`);

      if (alerts.length > 0) {
        answer = `Travel is not recommended and non-essential commute should be delayed due to an active weather advisory (${alerts[0].event}) with winds at ${weather.windSpeed} km/h and an ${canonicalRainProb}% rain probability. If you must travel, allow extra time and reduce speed. Note that this provides meteorological risk guidance, not a personal safety guarantee.`;
      } else if (maxWind >= 45 || canonicalRainProb >= 70 || totalPrecip > 5) {
        answer = `Exercise caution and allow extra commute time—weather conditions indicate elevated risk with an ${canonicalRainProb}% rain probability and winds up to ${maxWind} km/h. Roads may be slick and visibility reduced. This represents weather-based guidance, not a guarantee of personal safety.`;
      } else {
        answer = `Commute conditions are clear and manageable with mild winds at ${weather.windSpeed} km/h and only an ${canonicalRainProb}% rain probability. Current conditions in ${locationName} are ${weather.condition.toLowerCase()} at ${weather.temperature}°C. Standard travel awareness is advised.`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 6: TEMPERATURE & HEAT
    if (topic === 'temperature') {
      factors.length = 0;
      factors.push(`Temperature: ${weather.temperature}°C`);
      factors.push(`Feels Like: ${weather.feelsLike}°C`);
      factors.push(`Forecast Range: ${minTemp}°C to ${maxTemp}°C`);

      if (weather.temperature >= 35 || weather.feelsLike >= 38) {
        answer = `Temperatures are elevated at ${weather.temperature}°C (feeling like ${weather.feelsLike}°C). Wear lightweight breathable cottons, limit prolonged outdoor sun exposure, and stay well hydrated.${alertNotice}`;
      } else if (weather.temperature <= 10) {
        answer = `It is cold with current temperatures around ${weather.temperature}°C (feels like ${weather.feelsLike}°C). Warm layering such as a thermal fleece or coat is recommended if heading outdoors.${alertNotice}`;
      } else {
        answer = `The current temperature is ${weather.temperature}°C, feeling like ${weather.feelsLike}°C, with an expected range of ${minTemp}°C to ${maxTemp}°C.${alertNotice}`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 7: WIND
    if (topic === 'wind') {
      factors.length = 0;
      factors.push(`Current Wind: ${weather.windSpeed} km/h`);
      factors.push(`Peak Forecast Wind: ${maxWind} km/h`);

      if (maxWind >= 40) {
        answer = `Strong winds of up to ${maxWind} km/h are expected ${timeScope === 'tonight' ? 'tonight' : 'in the area'}. Secure loose outdoor items and wear a windbreaker outdoors.${alertNotice}`;
      } else {
        answer = `Winds are expected to remain gentle to moderate around ${maxWind} km/h.${alertNotice}`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 8: UV
    if (topic === 'uv') {
      factors.length = 0;
      factors.push(`UV Index: ${weather.uvIndex}`);

      if (weather.uvIndex >= 8 && isDaytime) {
        answer = `The UV index is very high at ${weather.uvIndex}. Consider reducing direct sun exposure during midday hours, wearing UV-blocking sunglasses, and applying SPF 30+ sunscreen.${alertNotice}`;
      } else if (weather.uvIndex >= 3 && isDaytime && isSunnyOrClear && !hasRainCondition) {
        answer = `The UV index is moderate at ${weather.uvIndex}. Standard sun protection like UV sunglasses or sunscreen is advisable if spending extended time in direct sunlight.${alertNotice}`;
      } else {
        answer = `The UV index is ${weather.uvIndex}, indicating minimal sun exposure hazard${!isDaytime ? ' during nighttime' : ''}.${alertNotice}`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 9: SPECIFIC TIME QUERY
    if (timeScope === 'specific_time' && targetHour !== null) {
      const targetHourData = relevantHours[0];
      if (targetHourData) {
        const timeLabel = `${targetHour % 12 || 12} ${targetHour >= 12 ? 'PM' : 'AM'}`;
        answer = `Around ${timeLabel}, conditions are forecast to be ${targetHourData.condition.toLowerCase()} with a temperature of ${targetHourData.temp}°C and a ${targetHourData.rainProbability}% probability of rain.${targetHourData.rainProbability >= 40 ? ' Carrying an umbrella is recommended.' : ''}${alertNotice}`;
      } else {
        answer = `Forecast data for the requested time indicates temperatures around ${weather.temperature}°C with ${weather.condition.toLowerCase()} skies.${alertNotice}`;
      }
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // TOPIC 10: TOMORROW'S FORECAST
    if (timeScope === 'tomorrow') {
      answer = `Tomorrow's forecast indicates temperatures ranging between ${minTemp}°C and ${maxTemp}°C with generally ${relevantHours[0]?.condition || weather.condition} conditions. Rain probability peaks around ${canonicalRainProb}%.${canonicalRainProb >= 50 ? ' Keep an umbrella handy.' : ''}${alertNotice}`;
      return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
    }

    // DEFAULT SUMMARY
    factors.length = 0;
    factors.push(`Temperature: ${weather.temperature}°C`);
    factors.push(`Condition: ${weather.condition}`);
    factors.push(`Rain Probability: ${canonicalRainProb}%`);
    answer = `Currently in ${locationName}, it is ${weather.temperature}°C (feels like ${weather.feelsLike}°C) with ${weather.condition.toLowerCase()} skies. Rain probability is ${canonicalRainProb}%, humidity is ${current.humidity}%, and winds are ${weather.windSpeed} km/h.${alertNotice}`;
    return { answer, factors: [...new Set(factors)], isClarification: false, timeScope };
  }

  /**
   * Gemini API call with strict grounding instructions and multi-model fallback
   */
  async callGemini(question, contextSlice, weather, localityContext = null) {
    const hourly = contextSlice.relevantHours || [];
    const canonicalRainProb = hourly.length > 0
      ? Math.max(...hourly.map(h => h.rainProbability || 0), contextSlice.current.rainProbability || 0)
      : (contextSlice.current.rainProbability || 0);

    const isDaytime = Boolean(weather.isDay);
    const localTimeStr = weather.location?.localtime || new Date().toLocaleTimeString();

    const localityInfo = localityContext ? `
SPECIFIC TARGET LOCALITY / NEIGHBORHOOD CONTEXT:
- Locality / Area: ${localityContext.name}
- Parent City / Region: ${localityContext.parentCity}, ${localityContext.state}, ${localityContext.country}
- Locality Coordinates: Lat ${localityContext.lat}, Lon ${localityContext.lon}
- Locality Characteristics: ${localityContext.note}
- Instruction: The user is inquiring specifically about ${localityContext.name}. Explicitly address conditions and actionable lifestyle/gear/travel advice for ${localityContext.name} in ${localityContext.parentCity}, combining its local geography with the verified telemetry below.
` : `
TARGET FOCUS REGIONS & NEIGHBORHOODS:
You possess rich, granular geographical and lifestyle knowledge of neighborhoods in 6 target regions:
1. Guntur (e.g., Nehru Nagar, Vidhyanagar, Lakshmipuram, Amaravati Road, Brodipet, Arundelpet, Pattabhipuram, Koretipadu, Gujjanagundla, Old Guntur, Brindavan Gardens, Gorantla, Perecherla, Mangalagiri).
2. Hyderabad (e.g., Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Hitech City, Kondapur, Kukatpally, Begumpet, Secunderabad, Charminar, Ameerpet, Dilsukhnagar, LB Nagar, Miyapur, Manikonda, Financial District).
3. Mangalore (e.g., Hampankatta, Kadri, Bejai, Urwa, Pandeshwar, Bunder, Kankanady, Falnir, Surathkal, Panambur, Ullal).
4. Srinagar (K&J) (e.g., Lal Chowk, Dal Gate, Rajbagh, Hazratbal, Nishat, Shalimar, Batamaloo, Soura, Nowhatta, Karan Nagar, Boulevard Road).
5. Andaman and Nicobar (e.g., Port Blair, Aberdeen Bazaar, Dollygunj, Garacharma, Havelock Island / Swaraj Dweep, Neil Island, Ross Island, Chatham Island, Phoenix Bay, Diglipur).
6. Gandhinagar (e.g., Infocity, Kudasan, Raysan, Sargasan, GIFT City, Sectors 1-30 including Sector 21 & Sector 11, Koba, Vavol, Pethapur).
Whenever questions mention or relate to these areas, provide accurate localized context.
`;

    const prompt = `You are WeatherGPT Assistant, an expert meteorological and lifestyle advisor. 
You are provided with current real-time verified weather conditions: temperature, feels-like temperature, condition description, rain probability, humidity, wind, UV index, and local time.
${localityInfo}
Core Directives:
1. Activity & Question-First Resolution:
   - When the user asks a question (e.g., "What should I wear in Nehru Nagar?", "Can I cycle on Amaravati Road?", "Is it raining in Vidhyanagar?"), answer their specific question in the FIRST sentence with a clear, direct verdict.
   - Do NOT just spit out raw weather telemetry. Contextualize the numbers into actionable advice.

2. Physical Feasibility & Common-Sense Gear Selection:
   - Sunglasses / Sun Protection: Recommend ONLY if UV Index >= 3 AND condition is sunny/clear/partly cloudy AND local time is daytime. NEVER recommend sunglasses if it is raining, overcast, or nighttime.
   - Rain Gear: Recommend an umbrella or waterproof jacket if rain probability >= 40% or if conditions describe drizzle, showers, or storms.
   - Fabric/Clothing: Base fabric advice on "Feels Like" temperature and humidity (e.g., light breathable cotton/linen for high heat/humidity; thermal layers or windbreakers for cold/high wind).
   - Outdoor Sports / Cycling: Explicitly advise caution or postponement if roads are wet/slippery, rain probability is high (>50%), or high winds are present.

3. Metric Consistency:
   - Always quote the exact numbers provided in the payload (e.g., if rain probability is 87%, cite 87%). Never invent or hallucinate contradictory percentages.

WEATHER DATA PAYLOAD:
Location: ${weather.location.name}, ${weather.location.country}
${localityContext ? `Target Neighborhood: ${localityContext.name}, ${localityContext.parentCity}` : ''}
Temperature: ${weather.temperature}°C
Feels-like temperature: ${weather.feelsLike}°C
Condition description: ${weather.condition}
Rain probability: ${canonicalRainProb}%
Humidity: ${weather.humidity}%
Wind: ${weather.windSpeed} km/h
UV index: ${weather.uvIndex}
Local time: ${localTimeStr}
Is Daytime: ${isDaytime ? 'Yes (Daytime)' : 'No (Nighttime)'}
Precipitation: ${weather.precipitation} mm
Relevant Forecast Hours: ${JSON.stringify(contextSlice.relevantHours)}
Active Alerts: ${JSON.stringify(contextSlice.alerts)}

USER QUESTION: "${question}"

Respond strictly in clean JSON format:
{
  "answer": "Your concise, actionable response here strictly following the Core Directives. Never use emojis.",
  "factors": ["Condition: ${weather.condition}", "Rain Probability: ${canonicalRainProb}%", "Temperature: ${weather.temperature}°C"]
}`;

    const models = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite'
    ];

    let lastError = null;

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          throw new Error(`Model ${model} returned ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) throw new Error(`Model ${model} returned empty candidate`);

        const parsed = JSON.parse(candidateText);
        return {
          answer: parsed.answer || '',
          factors: Array.isArray(parsed.factors) ? parsed.factors : [],
          isClarification: false,
          timeScope: 'gemini_grounded',
          modelUsed: model
        };
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;
        console.warn(`[AIService] ${model} attempt failed (${err.message.substring(0, 100)}). Trying next model...`);
      }
    }

    throw lastError || new Error('All Gemini models exhausted');
  }
}

export const aiService = new AIService();
