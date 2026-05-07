/**
 * Embedded Chat Component
 * Full-page or inline chat interface
 */

import type { SwfteChatClient } from '../core/client';
import type { EmbeddedChatOptions, ChatTheme, Message } from '../types';
import { defaultTheme, createThemeFromConfig, mergeThemes } from '../theming/theme';
import { generateCSSVariables, injectBaseStyles, CSS_VARS } from '../theming/css-variables';
import { getPresenceManager } from '../realtime/presence';

const SEND_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

export class EmbeddedChat {
  private client: SwfteChatClient;
  private options: EmbeddedChatOptions;
  private theme: ChatTheme;
  private container: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(client: SwfteChatClient, options: EmbeddedChatOptions) {
    this.client = client;
    this.options = options;

    // Build theme
    const config = client.getStore().getConfig();
    const baseTheme = config ? createThemeFromConfig(config) : defaultTheme;
    this.theme = options.theme ? mergeThemes(baseTheme, options.theme) : baseTheme;
  }

  /**
   * Mount embedded chat to container
   */
  mount(): void {
    injectBaseStyles();

    // Get container
    this.container = typeof this.options.container === 'string'
      ? document.querySelector(this.options.container)
      : this.options.container;

    if (!this.container) {
      throw new Error('Container not found');
    }

    // Add embedded-specific styles
    this.injectEmbeddedStyles();

    // Render
    this.render();

    // Subscribe to store changes
    this.unsubscribe = this.client.subscribe(() => this.updateMessages());

    // Load existing messages if resuming
    if (this.options.conversationId) {
      this.client.loadMessages(this.options.conversationId).catch(console.error);
    }
  }

  /**
   * Unmount embedded chat
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
   * Inject embedded-specific styles
   */
  private injectEmbeddedStyles(): void {
    const styleId = 'swfte-embedded-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .swfte-embedded {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(${CSS_VARS.colorBackground});
        border-radius: var(${CSS_VARS.radiusMd});
        overflow: hidden;
      }

      .swfte-embedded .swfte-header {
        flex-shrink: 0;
      }

      .swfte-embedded .swfte-messages {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }

      .swfte-embedded .swfte-input-container {
        padding: 16px 24px;
        border-top: 1px solid var(${CSS_VARS.colorBorder});
      }

      .swfte-embedded .swfte-input {
        padding: 12px 16px;
        border: 1px solid var(${CSS_VARS.colorBorder});
        border-radius: var(${CSS_VARS.radiusMd});
        background: var(${CSS_VARS.colorBackground});
      }

      .swfte-embedded .swfte-input:focus {
        outline: none;
        border-color: var(${CSS_VARS.colorPrimary});
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Render embedded chat
   */
  private render(): void {
    if (!this.container) return;

    const config = this.client.getStore().getConfig();
    const cssVars = generateCSSVariables(this.theme);

    this.container.innerHTML = `
      <div class="swfte-widget swfte-embedded" style="${cssVars}">
        ${this.options.showHeader !== false ? this.renderHeader() : ''}
        <div class="swfte-messages" id="swfte-embedded-messages">
          ${this.renderMessages()}
          ${this.renderTypingIndicator()}
        </div>
        ${this.renderInput()}
      </div>
    `;

    this.attachEventListeners();
    this.scrollToBottom();
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
          <div class="swfte-header-name">${config?.companyName || config?.name || 'Chat'}</div>
          <div class="swfte-header-status">Online</div>
        </div>
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
      const greeting = config?.greetingMessage || 'Hi! How can I help you today?';
      return `<div class="swfte-message agent">${greeting}</div>`;
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
   * Render input
   */
  private renderInput(): string {
    const config = this.client.getStore().getConfig();
    const placeholder = config?.placeholderText || 'Type a message...';

    return `
      <div class="swfte-input-container">
        <input
          type="text"
          class="swfte-input"
          id="swfte-embedded-input"
          placeholder="${placeholder}"
          autocomplete="off"
        >
        <button class="swfte-send-btn" id="swfte-embedded-send" aria-label="Send">
          ${SEND_ICON}
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    if (!this.container) return;

    const sendBtn = this.container.querySelector('#swfte-embedded-send');
    sendBtn?.addEventListener('click', () => this.handleSend());

    const input = this.container.querySelector('#swfte-embedded-input') as HTMLInputElement;
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    const presence = getPresenceManager();
    input?.addEventListener('input', () => presence.startTyping());
    input?.addEventListener('blur', () => presence.stopTyping());
  }

  /**
   * Handle send message
   */
  private async handleSend(): Promise<void> {
    const input = this.container?.querySelector('#swfte-embedded-input') as HTMLInputElement;
    if (!input) return;

    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    try {
      await this.client.sendMessage(content);
      this.scrollToBottom();
    } catch (error) {
      console.error('[EmbeddedChat] Failed to send message:', error);
    }
  }

  /**
   * Update messages on store change
   */
  private updateMessages(): void {
    const messagesContainer = this.container?.querySelector('#swfte-embedded-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = this.renderMessages() + this.renderTypingIndicator();
      this.scrollToBottom();
    }
  }

  /**
   * Scroll to bottom
   */
  private scrollToBottom(): void {
    const messagesContainer = this.container?.querySelector('#swfte-embedded-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * Format message content
   */
  private formatMessage(content: string): string {
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
}
