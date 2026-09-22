import React from 'react';
import { useWeather } from '../context/WeatherContext';
import RevolvingGlobeIcon from './RevolvingGlobeIcon';

const ACTIONS = [
  { label: 'Rain in next 3 hours', query: 'Will it rain in the next 3 hours?' },
  { label: 'Do I need an umbrella?', query: 'Do I need an umbrella?' },
  { label: 'What should I wear?', query: 'What should I wear based on the temperature and weather today?' },
  { label: 'Travel & commute safe?', query: 'Is it safe to travel or commute based on current weather?' },
  { label: "Today's summary", query: 'What is the complete weather outlook for the rest of today?' },
  { label: 'Wind & outdoor exercise', query: 'Is it suitable for outdoor exercise or cycling right now?' }
];

export default function QuickActions({ onSelectAction }) {
  const { sendMessage } = useWeather();

  const handleAction = (item) => {
    if (onSelectAction) {
      onSelectAction(item.query);
    } else {
      sendMessage(item.query);
    }
  };

  return (
    <div className="gemini-prompt-chips" aria-label="Suggested Weather Prompts">
      {ACTIONS.map((item, idx) => (
        <button
          key={idx}
          className="gemini-chip"
          onClick={() => handleAction(item)}
          type="button"
        >
          <RevolvingGlobeIcon size={13} revolve={false} className="chip-globe" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
