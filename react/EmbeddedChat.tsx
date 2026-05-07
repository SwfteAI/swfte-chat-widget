/**
 * Embedded Chat - React Component
 * Full-page or inline chat interface
 */

import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatClient, useChatStore } from './ChatProvider';
import { useChat } from './hooks/useChat';
import type { ChatTheme } from '../src/types';
import { defaultTheme, mergeThemes, createThemeFromConfig } from '../src/theming/theme';
import { generateCSSVariables, injectBaseStyles } from '../src/theming/css-variables';

export interface EmbeddedChatProps {
  /** Custom theme overrides */
  theme?: Partial<ChatTheme>;
  /** Show header */
  showHeader?: boolean;
  /** Conversation ID to resume */
  conversationId?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function EmbeddedChat({
  theme: themeOverrides,
  showHeader = true,
  conversationId,
  className = '',
  style = {},
}: EmbeddedChatProps) {
  const client = useChatClient();
  const { state } = useChatStore();
  const { sendMessage, messages, isAgentTyping, loadMessages } = useChat();

  const [inputValue, setInputValue] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);

  // Build theme
  const config = state?.config;
  const baseTheme = config ? createThemeFromConfig(config) : defaultTheme;
  const theme = themeOverrides ? mergeThemes(baseTheme, themeOverrides) : baseTheme;
  const cssVars = generateCSSVariables(theme);

  // Inject base styles
  useEffect(() => {
    injectBaseStyles();
  }, []);

  // Load messages if resuming conversation
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isAgentTyping]);

  // Handle send message
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');

    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [inputValue, sendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div
      className={`swfte-widget swfte-embedded ${className}`}
      style={{ ...parseStyles(cssVars), ...style }}
    >
      {/* Header */}
      {showHeader && (
        <div className="swfte-header">
          <div className="swfte-header-avatar">
            {config?.avatarUrl ? (
              <img src={config.avatarUrl} alt="Agent" />
            ) : (
              <DefaultAvatar />
            )}
          </div>
          <div className="swfte-header-info">
            <div className="swfte-header-name">
              {config?.companyName || config?.name || 'Chat'}
            </div>
            <div className="swfte-header-status">Online</div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="swfte-messages" ref={messagesRef}>
        {messages.length === 0 && config?.greetingMessage && (
          <div className="swfte-message agent">
            {config.greetingMessage}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`swfte-message ${msg.role === 'user' ? 'user' : 'agent'}`}
          >
            <MessageContent content={msg.content} />
            <div className="swfte-message-time">
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        {isAgentTyping && (
          <div className="swfte-typing">
            <div className="swfte-typing-dot" />
            <div className="swfte-typing-dot" />
            <div className="swfte-typing-dot" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="swfte-input-container">
        <input
          type="text"
          className="swfte-input"
          placeholder={config?.placeholderText || 'Type a message...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="swfte-send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

// Helper components
function MessageContent({ content }: { content: string }) {
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function parseStyles(cssVars: string): React.CSSProperties {
  const styles: Record<string, string> = {};
  cssVars.split(';').forEach((rule) => {
    const [key, value] = rule.split(':').map((s) => s.trim());
    if (key && value) {
      styles[key] = value;
    }
  });
  return styles as React.CSSProperties;
}

// Icons
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="18" height="18">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function DefaultAvatar() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );
}
