/**
 * Chat Widget - React Component
 * Floating chat bubble with expandable chat window
 */

import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatClient, useChatStore } from './ChatProvider';
import { useChat } from './hooks/useChat';
import type { ChatTheme, Message } from '../src/types';
import { defaultTheme, mergeThemes, createThemeFromConfig } from '../src/theming/theme';
import { generateCSSVariables, injectBaseStyles } from '../src/theming/css-variables';

export interface ChatWidgetProps {
  /** Position of the widget */
  position?: 'bottom-right' | 'bottom-left';
  /** Custom theme overrides */
  theme?: Partial<ChatTheme>;
  /** Z-index for widget */
  zIndex?: number;
  /** Initially open */
  defaultOpen?: boolean;
  /** Callbacks */
  onOpen?: () => void;
  onClose?: () => void;
  onMessageSent?: (message: Message) => void;
  onMessageReceived?: (message: Message) => void;
}

export function ChatWidget({
  position = 'bottom-right',
  theme: themeOverrides,
  zIndex = 9999,
  defaultOpen = false,
  onOpen,
  onClose,
  onMessageSent,
  onMessageReceived,
}: ChatWidgetProps) {
  const client = useChatClient();
  const { state } = useChatStore();
  const { sendMessage, messages, isAgentTyping } = useChat();

  const [isOpen, setIsOpen] = useState(defaultOpen);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isAgentTyping]);

  // Handle open/close
  const handleToggle = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      onClose?.();
    } else {
      setIsOpen(true);
      onOpen?.();
      if (state) {
        client.getStore().dispatch({ type: 'CLEAR_UNREAD' });
      }
    }
  }, [isOpen, onOpen, onClose, client, state]);

  // Handle send message
  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');

    try {
      const message = await sendMessage(content);
      onMessageSent?.(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [inputValue, sendMessage, onMessageSent]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const unreadCount = state?.unreadCount || 0;

  return (
    <div
      className={`swfte-widget swfte-widget-container ${position}`}
      style={{ zIndex, ...parseStyles(cssVars) }}
    >
      {isOpen && (
        <div className="swfte-chat-window">
          {/* Header */}
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
            <button
              className="swfte-header-close"
              onClick={() => handleToggle()}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

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

          {/* Powered By */}
          {config?.showPoweredBy !== false && (
            <div className="swfte-powered-by">
              Powered by{' '}
              <a href="https://swfte.com" target="_blank" rel="noopener noreferrer">
                Swfte
              </a>
            </div>
          )}
        </div>
      )}

      {/* Launcher */}
      <button
        className="swfte-launcher"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
        {unreadCount > 0 && !isOpen && (
          <span className="swfte-launcher-badge">{unreadCount}</span>
        )}
      </button>
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
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white" width="28" height="28">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
}

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
