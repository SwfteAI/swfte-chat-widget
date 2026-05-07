/**
 * STOMP WebSocket Client for Swfte Chat SDK
 * Handles real-time messaging using STOMP over WebSocket/SockJS
 */

import type { Message, ChatEvent } from '../types';

export interface StompClientConfig {
  /** WebSocket URL */
  url: string;
  /** Widget ID */
  widgetId: string;
  /** Session token for authentication */
  sessionToken: string;
  /** Visitor ID */
  visitorId: string;
  /** Reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnect delay in ms */
  reconnectDelay?: number;
  /** Debug logging */
  debug?: boolean;
  /** Heartbeat interval in ms */
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
}

export type StompEventHandler = (event: ChatEvent) => void;

type StompSubscription = {
  id: string;
  unsubscribe: () => void;
};

export class StompClient {
  private config: StompClientConfig;
  private client: any; // STOMP client instance
  private connected = false;
  private reconnecting = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private eventHandlers: Set<StompEventHandler> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(config: StompClientConfig) {
    this.config = {
      autoReconnect: true,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.connected) return;

    return new Promise((resolve, reject) => {
      this.initializeClient()
        .then(() => {
          this.client.onConnect = () => {
            this.connected = true;
            this.reconnecting = false;
            this.log('Connected to STOMP server');
            this.emit({ type: 'connection:open' });
            this.setupSubscriptions();
            resolve();
          };

          this.client.onStompError = (frame: any) => {
            this.log('STOMP error:', frame.headers?.message);
            this.emit({
              type: 'connection:error',
              error: new Error(frame.headers?.message || 'STOMP error'),
            });
            reject(new Error(frame.headers?.message || 'STOMP connection error'));
          };

          this.client.onDisconnect = () => {
            this.connected = false;
            this.log('Disconnected from STOMP server');
            this.emit({ type: 'connection:close' });
            this.handleDisconnect();
          };

          this.client.onWebSocketClose = () => {
            if (this.connected) {
              this.connected = false;
              this.emit({ type: 'connection:close', reason: 'WebSocket closed' });
              this.handleDisconnect();
            }
          };

          this.client.activate();
        })
        .catch(reject);
    });
  }

  /**
   * Initialize STOMP client with SockJS
   */
  private async initializeClient(): Promise<void> {
    // Dynamic import for browser compatibility
    const { Client } = await import('@stomp/stompjs');
    const SockJS = (await import('sockjs-client')).default;

    const wsUrl = this.buildWebSocketUrl();
    this.log('Connecting to:', wsUrl);

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        'X-Widget-Token': this.config.sessionToken,
        'X-Widget-ID': this.config.widgetId,
        'X-Visitor-ID': this.config.visitorId,
      },
      debug: this.config.debug ? (str) => console.log('[STOMP]', str) : () => {},
      heartbeatIncoming: this.config.heartbeatIncoming,
      heartbeatOutgoing: this.config.heartbeatOutgoing,
      reconnectDelay: this.config.reconnectDelay,
    });
  }

  /**
   * Build WebSocket URL with query parameters
   */
  private buildWebSocketUrl(): string {
    const url = new URL(this.config.url);
    url.searchParams.set('widgetToken', this.config.sessionToken);
    url.searchParams.set('widgetId', this.config.widgetId);
    url.searchParams.set('visitorId', this.config.visitorId);
    return url.toString();
  }

  /**
   * Setup STOMP subscriptions
   */
  private setupSubscriptions(): void {
    // Subscribe to widget conversation messages
    this.subscribe(
      `/topic/widget/${this.config.widgetId}/visitor/${this.config.visitorId}/messages`,
      (body) => {
        const message = JSON.parse(body) as Message;
        this.emit({ type: 'message:received', message });
      }
    );

    // Subscribe to typing indicators
    this.subscribe(
      `/topic/widget/${this.config.widgetId}/visitor/${this.config.visitorId}/typing`,
      (body) => {
        const data = JSON.parse(body);
        if (data.isTyping) {
          this.emit({ type: 'typing:start', userId: data.userId });
        } else {
          this.emit({ type: 'typing:stop', userId: data.userId });
        }
      }
    );

    // Subscribe to presence updates
    this.subscribe(
      `/topic/widget/${this.config.widgetId}/presence`,
      (body) => {
        const data = JSON.parse(body);
        if (data.action === 'join') {
          this.emit({ type: 'presence:join', userId: data.userId });
        } else if (data.action === 'leave') {
          this.emit({ type: 'presence:leave', userId: data.userId });
        }
      }
    );
  }

  /**
   * Subscribe to a STOMP destination
   */
  private subscribe(destination: string, callback: (body: string) => void): void {
    if (!this.client || !this.connected) {
      this.log('Cannot subscribe: not connected');
      return;
    }

    const subscription = this.client.subscribe(destination, (message: any) => {
      try {
        callback(message.body);
      } catch (error) {
        console.error('[StompClient] Subscription callback error:', error);
      }
    });

    this.subscriptions.set(destination, {
      id: subscription.id,
      unsubscribe: () => subscription.unsubscribe(),
    });

    this.log('Subscribed to:', destination);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.connected) return;

    this.client.publish({
      destination: `/app/widget/${this.config.widgetId}/typing`,
      body: JSON.stringify({
        conversationId,
        visitorId: this.config.visitorId,
        isTyping,
      }),
    });
  }

  /**
   * Send message via STOMP
   */
  sendMessage(conversationId: string, content: string): void {
    if (!this.connected) {
      throw new Error('Not connected to WebSocket');
    }

    this.client.publish({
      destination: `/app/widget/${this.config.widgetId}/message`,
      body: JSON.stringify({
        conversationId,
        visitorId: this.config.visitorId,
        content,
      }),
    });
  }

  /**
   * Subscribe to events
   */
  on(handler: StompEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  /**
   * Emit event to handlers
   */
  private emit(event: ChatEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('[StompClient] Event handler error:', error);
      }
    }
  }

  /**
   * Handle disconnect and reconnection
   */
  private handleDisconnect(): void {
    // Clear subscriptions
    for (const sub of this.subscriptions.values()) {
      try {
        sub.unsubscribe();
      } catch {
        // Ignore errors during cleanup
      }
    }
    this.subscriptions.clear();

    // Auto-reconnect if enabled
    if (this.config.autoReconnect && !this.reconnecting) {
      this.reconnecting = true;
      this.log(`Reconnecting in ${this.config.reconnectDelay}ms...`);

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch((error) => {
          this.log('Reconnection failed:', error.message);
          this.handleDisconnect();
        });
      }, this.config.reconnectDelay);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnecting = false;

    if (this.client) {
      this.client.deactivate();
    }

    this.connected = false;
    this.subscriptions.clear();
    this.log('Disconnected');
  }

  /**
   * Log message if debug enabled
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[StompClient] ${message}`, ...args);
    }
  }
}
