/**
 * Chat Widget Component
 * Floating chat bubble with expandable chat window
 */

import type { SwfteChatClient } from '../core/client';
import type { ChatWidgetOptions, ChatTheme, Message } from '../types';
import { defaultTheme, createThemeFromConfig, mergeThemes } from '../theming/theme';
import { generateCSSVariables, injectBaseStyles, CSS_VARS } from '../theming/css-variables';
import { getPresenceManager } from '../realtime/presence';

// SVG Icons
const CHAT_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;
const CLOSE_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`;
const SEND_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

export class ChatWidget {
  private client: SwfteChatClient;
  private options: ChatWidgetOptions;
  private theme: ChatTheme;
  private container: HTMLElement | null = null;
  private isOpen = false;
  private unsubscribe: (() => void) | null = null;
  private analyticsQueue: Array<{ event: string; properties: Record<string, unknown>; timestamp: string }> = [];

  constructor(client: SwfteChatClient, options: ChatWidgetOptions = {}) {
    this.client = client;
    this.options = options;

    // Build theme
    const config = client.getStore().getConfig();
    const baseTheme = config ? createThemeFromConfig(config) : defaultTheme;
    this.theme = options.theme ? mergeThemes(baseTheme, options.theme) : baseTheme;
  }

  /**
   * Mount widget to DOM
   */
  mount(target?: HTMLElement | string): void {
    // Inject base styles
    injectBaseStyles();

    // Get or create container
    if (target) {
      this.container = typeof target === 'string'
        ? document.querySelector(target)
        : target;
    }

    if (!this.container) {
      this.container = document.createElement('div');
      document.body.appendChild(this.container);
    }

    // Render widget
    this.render();

    // Subscribe to store changes
    this.unsubscribe = this.client.subscribe(() => this.updateMessages());

    // Auto-open if configured
    const config = this.client.getStore().getConfig();
    if (config?.autoOpen) {
      setTimeout(() => this.open(), config.autoOpenDelayMs || 3000);
    }
  }

  /**
   * Unmount widget from DOM
   */
  unmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Open chat window
   */
  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();
    this.options.onOpen?.();
    this.client.getStore().dispatch({ type: 'CLEAR_UNREAD' });
    this.trackAnalytics('widget.opened', {});
  }

  /**
   * Close chat window
   */
  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.render();
    this.options.onClose?.();
    this.trackAnalytics('widget.closed', {});
  }

  /**
   * Toggle chat window
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Render widget
   */
  private render(): void {
    if (!this.container) return;

    const config = this.client.getStore().getConfig();
    const position = this.options.position || config?.position || 'bottom-right';

    // Apply theme CSS variables
    const cssVars = generateCSSVariables(this.theme);

    this.container.innerHTML = `
      <div class="swfte-widget swfte-widget-container ${position}" style="${cssVars}">
        ${this.isOpen ? this.renderChatWindow() : ''}
        ${this.renderLauncher()}
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Render launcher button
   */
  private renderLauncher(): string {
    const store = this.client.getStore();
    const unreadCount = store.getUnreadCount();
    const config = store.getConfig();

    const icon = this.isOpen ? CLOSE_ICON : (config?.launcherIcon || CHAT_ICON);

    return `
      <button class="swfte-launcher" aria-label="${this.isOpen ? 'Close chat' : 'Open chat'}">
        ${icon}
        ${unreadCount > 0 && !this.isOpen ? `<span class="swfte-launcher-badge">${unreadCount}</span>` : ''}
      </button>
    `;
  }

  /**
   * Render chat window
   */
  private renderChatWindow(): string {
    const config = this.client.getStore().getConfig();

    return `
      <div class="swfte-chat-window">
        ${this.renderHeader()}
        <div class="swfte-messages" id="swfte-messages">
          ${this.renderMessages()}
          ${this.renderTypingIndicator()}
        </div>
        ${this.renderInput()}
        ${config?.showPoweredBy !== false ? this.renderPoweredBy() : ''}
      </div>
    `;
  }

  /**
   * Render header
   */
  private renderHeader(): string {
    const config = this.client.getStore().getConfig();

    return `
      <div class="swfte-header">
        <div class="swfte-header-avatar">
          ${config?.avatarUrl
            ? `<img src="${config.avatarUrl}" alt="Agent">`
            : `<svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`
          }
        </div>
        <div class="swfte-header-info">
          <div class="swfte-header-name">${config?.companyName || config?.name || 'Chat Assistant'}</div>
          <div class="swfte-header-status">Online</div>
        </div>
        <button class="swfte-header-close" aria-label="Close">
          ${CLOSE_ICON}
        </button>
      </div>
    `;
  }

  /**
   * Render messages
   */
  private renderMessages(): string {
    const messages = this.client.getStore().getActiveMessages();
    const config = this.client.getStore().getConfig();

    if (messages.length === 0) {
      // Show greeting message
      const greeting = config?.greetingMessage || 'Hi! How can I help you today?';
      return `
        <div class="swfte-message agent">
          ${greeting}
        </div>
      `;
    }

    return messages.map(msg => `
      <div class="swfte-message ${msg.role === 'user' ? 'user' : 'agent'}">
        ${this.formatMessage(msg.content)}
        <div class="swfte-message-time">${this.formatTime(msg.timestamp)}</div>
      </div>
    `).join('');
  }

  /**
   * Render typing indicator
   */
  private renderTypingIndicator(): string {
    const isTyping = this.client.getStore().isAgentTyping();
    if (!isTyping) return '';

    return `
      <div class="swfte-typing">
        <div class="swfte-typing-dot"></div>
        <div class="swfte-typing-dot"></div>
        <div class="swfte-typing-dot"></div>
      </div>
    `;
  }

  /**
   * Render input area
   */
  private renderInput(): string {
    const config = this.client.getStore().getConfig();
    const placeholder = config?.placeholderText || 'Type a message...';

    return `
      <div class="swfte-input-container">
        <input
          type="text"
          class="swfte-input"
          id="swfte-input"
          placeholder="${placeholder}"
          autocomplete="off"
        >
        <button class="swfte-send-btn" id="swfte-send-btn" aria-label="Send message">
          ${SEND_ICON}
        </button>
      </div>
    `;
  }

  /**
   * Render powered by footer
   */
  private renderPoweredBy(): string {
    return `
      <div class="swfte-powered-by">
        Powered by <a href="https://swfte.com" target="_blank" rel="noopener">Swfte</a>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (!this.container) return;

    // Launcher click
    const launcher = this.container.querySelector('.swfte-launcher');
    launcher?.addEventListener('click', () => this.toggle());

    // Close button click
    const closeBtn = this.container.querySelector('.swfte-header-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Send button click
    const sendBtn = this.container.querySelector('#swfte-send-btn');
    sendBtn?.addEventListener('click', () => this.handleSend());

    // Input enter key
    const input = this.container.querySelector('#swfte-input') as HTMLInputElement;
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Typing indicator
    const presence = getPresenceManager();
    input?.addEventListener('input', () => {
      presence.startTyping();
    });

    input?.addEventListener('blur', () => {
      presence.stopTyping();
    });
  }

  /**
   * Handle send message
   */
  private async handleSend(): Promise<void> {
    const input = this.container?.querySelector('#swfte-input') as HTMLInputElement;
    if (!input) return;

    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    try {
      const startTime = Date.now();
      const message = await this.client.sendMessage(content);
      this.options.onMessageSent?.(message);
      this.scrollToBottom();
      this.trackAnalytics('message.sent', { latencyMs: Date.now() - startTime, contentLength: content.length });
    } catch (error) {
      console.error('[ChatWidget] Failed to send message:', error);
      this.options.onError?.(error instanceof Error ? error : new Error('Failed to send message'));
      this.trackAnalytics('message.error', { error: error instanceof Error ? error.message : 'Unknown' });
    }
  }

  /**
   * Update messages (called on store change)
   */
  private updateMessages(): void {
    if (!this.isOpen) {
      // Update unread badge
      this.render();
      return;
    }

    const messagesContainer = this.container?.querySelector('#swfte-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = this.renderMessages() + this.renderTypingIndicator();
      this.scrollToBottom();
    }
  }

  /**
   * Scroll messages to bottom
   */
  private scrollToBottom(): void {
    const messagesContainer = this.container?.querySelector('#swfte-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * Format message content
   */
  private formatMessage(content: string): string {
    // Basic markdown support
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Format timestamp
   */
  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Set theme
   */
  setTheme(theme: Partial<ChatTheme>): void {
    this.theme = mergeThemes(this.theme, theme);
    this.render();
  }

  /**
   * Track an analytics event if enableAnalytics is true in widget config.
   * Events are batched and sent to the analytics endpoint.
   */
  private trackAnalytics(event: string, properties: Record<string, unknown>): void {
    try {
      const widgetConfig = this.client.getStore().getConfig();
      if (!widgetConfig?.enableAnalytics) return;

      this.analyticsQueue.push({
        event,
        properties: {
          ...properties,
          widgetId: widgetConfig.id || 'unknown',
          agentId: widgetConfig.agentId || 'unknown',
        },
        timestamp: new Date().toISOString(),
      });

      // Flush when queue reaches 10 events
      if (this.analyticsQueue.length >= 10) {
        this.flushAnalytics();
      }
    } catch {
      // Analytics should never break widget functionality
    }
  }

  /**
   * Flush queued analytics events.
   */
  private async flushAnalytics(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;

    const events = [...this.analyticsQueue];
    this.analyticsQueue = [];

    try {
      // Use navigator.sendBeacon for reliable delivery on page unload,
      // fall back to fetch for normal flushes
      const payload = JSON.stringify({ events, sdk: 'swfte-chat-widget', version: '1.0.0' });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/v1/analytics/widget/events', new Blob([payload], { type: 'application/json' }));
      }
    } catch {
      // Silent failure — analytics should never impact UX
    }
  }
}
