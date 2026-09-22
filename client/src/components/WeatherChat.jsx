import React, { useState, useRef, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import QuickActions from './QuickActions';
import RevolvingGlobeIcon from './RevolvingGlobeIcon';

export default function WeatherChat() {
  const { chatHistory, sendMessage, deleteMessage, clearChat } = useWeather();
  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatMessagesRef = useRef(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [chatHistory, isSubmitting]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isSubmitting) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setIsSubmitting(true);
    try {
      await sendMessage(query);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAction = async (queryText) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await sendMessage(queryText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="chat-card glass-card gemini-ui-container">
      {/* Chat Header Bar */}
      <div className="chat-header">
        <div className="chat-title-box">
          <div className="gemini-avatar">
            <RevolvingGlobeIcon size={24} revolve={true} />
          </div>
          <div>
            <div className="gemini-title-row">
              <h3 className="gemini-brand-heading">WeatherGPT Assistant</h3>
            </div>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            className="gemini-clear-btn"
            title="Clear conversation history"
            type="button"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div ref={chatMessagesRef} className="chat-messages" role="log" aria-live="polite">
        {chatHistory.length === 0 && (
          <div className="gemini-empty-state">
            <RevolvingGlobeIcon size={34} revolve={true} style={{ marginBottom: '0.5rem' }} />
            <p className="gemini-empty-prompt">Ask anything about current conditions, forecasts, gear, or travel advice.</p>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`}
          >
            {msg.sender === 'ai' && (
              <div className="ai-bubble-header">
                <RevolvingGlobeIcon size={14} revolve={false} />
                <span className="ai-model-tag">WeatherGPT Assistant • Grounded Reasoning</span>
              </div>
            )}

            <div className="bubble-text-body">{msg.text}</div>

            {/* Weather Factors Grounding Chips */}
            {msg.factors && msg.factors.length > 0 && (
              <div className="factors-box">
                <span className="factors-label">
                  Grounded factors:
                </span>
                {msg.factors.map((f, i) => (
                  <span key={i} className="factor-chip">{f}</span>
                ))}
              </div>
            )}

            <div className="message-meta">
              <span>{msg.timestamp}</span>
              <button
                className="delete-msg-btn"
                onClick={() => deleteMessage(msg.id)}
                title="Delete this message"
                aria-label="Delete message"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {isSubmitting && (
          <div className="message-bubble message-ai gemini-typing-bubble">
            <div className="gemini-typing-indicator">
              <span className="gemini-dot dot-1" />
              <span className="gemini-dot dot-2" />
              <span className="gemini-dot dot-3" />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              WeatherGPT is reasoning through live conditions...
            </span>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <QuickActions onSelectAction={handleQuickAction} />

      {/* Pill Input Bar */}
      <form className="gemini-input-wrapper" onSubmit={handleSubmit}>
        <div className="gemini-input-glow" />
        <div className="gemini-input-inner">
          <input
            type="text"
            className="gemini-text-input"
            placeholder="ASK WeatherGPT Assistant about the weather, commute, or forecast..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isSubmitting}
            aria-label="Ask WeatherGPT a question"
          />
          <button
            type="submit"
            className="gemini-send-btn"
            disabled={!inputQuery.trim() || isSubmitting}
            aria-label="Send query"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
