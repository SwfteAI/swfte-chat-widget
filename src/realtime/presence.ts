/**
 * Presence Manager for Swfte Chat SDK
 * Manages typing indicators and online status
 */

import type { StompClient } from './stomp-client';

export interface PresenceConfig {
  /** Typing timeout in ms (stop typing after inactivity) */
  typingTimeout?: number;
  /** Debounce time for typing indicator */
  typingDebounce?: number;
  /** Debug logging */
  debug?: boolean;
}

export interface TypingState {
  isTyping: boolean;
  userId?: string;
  timestamp: number;
}

export class PresenceManager {
  private config: PresenceConfig;
  private stompClient: StompClient | null = null;
  private conversationId: string | null = null;

  // Typing state
  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTypingSent = 0;
  private isCurrentlyTyping = false;

  // Remote typing states
  private remoteTypingStates: Map<string, TypingState> = new Map();
  private remoteTypingTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private typingListeners: Set<(states: TypingState[]) => void> = new Set();

  constructor(config: PresenceConfig = {}) {
    this.config = {
      typingTimeout: 3000,
      typingDebounce: 300,
      ...config,
    };
  }

  /**
   * Set the STOMP client for real-time communication
   */
  setStompClient(client: StompClient): void {
    this.stompClient = client;

    // Listen for typing events
    client.on((event) => {
      if (event.type === 'typing:start' && event.userId) {
        this.handleRemoteTypingStart(event.userId);
      } else if (event.type === 'typing:stop' && event.userId) {
        this.handleRemoteTypingStop(event.userId);
      }
    });
  }

  /**
   * Set active conversation
   */
  setConversation(conversationId: string): void {
    this.conversationId = conversationId;
  }

  /**
   * Start typing indicator
   */
  startTyping(): void {
    if (!this.conversationId) return;

    const now = Date.now();

    // Debounce typing indicator
    if (now - this.lastTypingSent < this.config.typingDebounce!) {
      // Reset timeout but don't send
      this.resetTypingTimeout();
      return;
    }

    if (!this.isCurrentlyTyping) {
      this.isCurrentlyTyping = true;
      this.lastTypingSent = now;
      this.sendTypingIndicator(true);
      this.log('Started typing');
    }

    this.resetTypingTimeout();
  }

  /**
   * Stop typing indicator
   */
  stopTyping(): void {
    if (!this.conversationId) return;

    if (this.isCurrentlyTyping) {
      this.isCurrentlyTyping = false;
      this.sendTypingIndicator(false);
      this.log('Stopped typing');
    }

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  /**
   * Reset typing timeout
   */
  private resetTypingTimeout(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.typingTimer = setTimeout(() => {
      this.stopTyping();
    }, this.config.typingTimeout);
  }

  /**
   * Send typing indicator via STOMP
   */
  private sendTypingIndicator(isTyping: boolean): void {
    if (!this.stompClient || !this.conversationId) return;

    this.stompClient.sendTypingIndicator(this.conversationId, isTyping);
  }

  /**
   * Handle remote typing start
   */
  private handleRemoteTypingStart(userId: string): void {
    this.remoteTypingStates.set(userId, {
      isTyping: true,
      userId,
      timestamp: Date.now(),
    });

    this.notifyTypingListeners();

    // Clear existing timer for this user before creating a new one
    const existingTimer = this.remoteTypingTimers.get(userId);
    if (existingTimer) clearTimeout(existingTimer);

    // Auto-clear after timeout
    const timer = setTimeout(() => {
      this.remoteTypingTimers.delete(userId);
      const state = this.remoteTypingStates.get(userId);
      if (state && Date.now() - state.timestamp > this.config.typingTimeout!) {
        this.handleRemoteTypingStop(userId);
      }
    }, this.config.typingTimeout! + 500);
    this.remoteTypingTimers.set(userId, timer);
  }

  /**
   * Handle remote typing stop
   */
  private handleRemoteTypingStop(userId: string): void {
    const timer = this.remoteTypingTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.remoteTypingTimers.delete(userId);
    }
    this.remoteTypingStates.delete(userId);
    this.notifyTypingListeners();
  }

  /**
   * Subscribe to typing state changes
   */
  onTypingChange(callback: (states: TypingState[]) => void): () => void {
    this.typingListeners.add(callback);
    return () => this.typingListeners.delete(callback);
  }

  /**
   * Get current typing states
   */
  getTypingStates(): TypingState[] {
    return Array.from(this.remoteTypingStates.values());
  }

  /**
   * Check if anyone is typing
   */
  isAnyoneTyping(): boolean {
    return this.remoteTypingStates.size > 0;
  }

  /**
   * Notify typing listeners
   */
  private notifyTypingListeners(): void {
    const states = this.getTypingStates();
    for (const listener of this.typingListeners) {
      try {
        listener(states);
      } catch (error) {
        console.error('[PresenceManager] Listener error:', error);
      }
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopTyping();
    for (const timer of this.remoteTypingTimers.values()) {
      clearTimeout(timer);
    }
    this.remoteTypingTimers.clear();
    this.remoteTypingStates.clear();
    this.typingListeners.clear();
    this.stompClient = null;
    this.conversationId = null;
  }

  /**
   * Log message if debug enabled
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[PresenceManager] ${message}`, ...args);
    }
  }
}

// Singleton instance
let presenceInstance: PresenceManager | null = null;

export function getPresenceManager(config?: PresenceConfig): PresenceManager {
  if (!presenceInstance) {
    presenceInstance = new PresenceManager(config);
  }
  return presenceInstance;
}

export function resetPresenceManager(): void {
  presenceInstance?.destroy();
  presenceInstance = null;
}
