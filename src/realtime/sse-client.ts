/**
 * SSE (Server-Sent Events) Client for Swfte Chat SDK
 * Fallback for streaming when WebSocket is not available
 */

import type { StreamingChunk, ChatEvent } from '../types';

export interface SSEClientConfig {
  /** Base URL for SSE endpoint */
  baseUrl: string;
  /** Session token for authentication */
  sessionToken: string;
  /** Debug logging */
  debug?: boolean;
}

export type SSEEventHandler = (event: ChatEvent) => void;

export class SSEClient {
  private config: SSEClientConfig;
  private eventHandlers: Set<SSEEventHandler> = new Set();
  private activeConnections: Map<string, EventSource> = new Map();

  constructor(config: SSEClientConfig) {
    this.config = config;
  }

  /**
   * Stream chat completion response
   */
  async *streamChatCompletion(
    conversationId: string,
    content: string,
    signal?: AbortSignal
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const url = `${this.config.baseUrl}/v1/gateway/chat/completions`;

    this.log('Starting SSE stream:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'X-Widget-Token': this.config.sessionToken,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content }],
        stream: true,
        conversation_id: conversationId,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`SSE request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              this.log('Stream complete');
              return;
            }

            try {
              const chunk = JSON.parse(data) as StreamingChunk;
              this.emit({ type: 'message:streaming', chunk });
              yield chunk;
            } catch (e) {
              this.log('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Connect to a general SSE endpoint
   */
  connect(endpoint: string, onMessage: (data: unknown) => void): () => void {
    const url = new URL(endpoint, this.config.baseUrl);
    url.searchParams.set('token', this.config.sessionToken);

    this.log('Connecting to SSE:', url.toString());

    const eventSource = new EventSource(url.toString());

    eventSource.onopen = () => {
      this.log('SSE connected');
      this.emit({ type: 'connection:open' });
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        this.log('Failed to parse SSE message:', event.data);
      }
    };

    eventSource.onerror = (error) => {
      this.log('SSE error:', error);
      this.emit({
        type: 'connection:error',
        error: new Error('SSE connection error'),
      });
    };

    const connectionId = `${endpoint}_${Date.now()}`;
    this.activeConnections.set(connectionId, eventSource);

    return () => {
      eventSource.close();
      this.activeConnections.delete(connectionId);
      this.log('SSE disconnected');
    };
  }

  /**
   * Subscribe to events
   */
  on(handler: SSEEventHandler): () => void {
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
        console.error('[SSEClient] Event handler error:', error);
      }
    }
  }

  /**
   * Close all connections
   */
  disconnect(): void {
    for (const eventSource of this.activeConnections.values()) {
      eventSource.close();
    }
    this.activeConnections.clear();
    this.log('All SSE connections closed');
  }

  /**
   * Log message if debug enabled
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[SSEClient] ${message}`, ...args);
    }
  }
}
