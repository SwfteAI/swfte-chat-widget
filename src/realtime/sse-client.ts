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
  private activeConnections = new Set<() => void>();

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

    this.log('Starting SSE stream');

    const response = await fetch(url, {
      method: 'POST',
      redirect: 'error',
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
              this.log('Failed to parse SSE data');
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
    const base = new URL(this.config.baseUrl);
    const url = new URL(endpoint, base);
    if (url.origin !== base.origin || !['https:', 'http:'].includes(url.protocol)
      || url.username || url.password) {
      throw new Error('SSE endpoint must use the configured HTTP(S) origin');
    }
    for (const name of ['token', 'widgetToken']) url.searchParams.delete(name);
    url.hash = '';

    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 3000;
    let lastEventId = '';

    const close = () => {
      controller.abort();
      clearTimeout(retryTimer);
      this.activeConnections.delete(close);
      this.log('SSE disconnected');
    };

    const connect = async () => {
      if (controller.signal.aborted) return;

      try {
        this.log('Connecting to SSE');
        const headers = new Headers({
          Accept: 'text/event-stream',
          'X-Widget-Token': this.config.sessionToken,
        });
        if (lastEventId) headers.set('Last-Event-ID', lastEventId);

        const response = await fetch(url.toString(), {
          headers,
          redirect: 'error',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (response.status === 204) {
          close();
          return;
        }
        const contentType = response.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
        if (!response.ok || !response.body || contentType !== 'text/event-stream') {
          await response.body?.cancel();
          if (response.status < 500 && response.status !== 429) {
            this.emit({ type: 'connection:error', error: new Error('Invalid SSE response') });
            close();
            return;
          }
          throw new Error('Invalid SSE response');
        }

        if (controller.signal.aborted) {
          await response.body.cancel();
          return;
        }
        this.log('SSE connected');
        this.emit({ type: 'connection:open' });

        await readEventStream(response.body, controller.signal, (field, value) => {
          if (field === 'id') lastEventId = value;
          if (field === 'retry') retryDelay = Number(value);
          if (field === 'message') {
            try {
              onMessage(JSON.parse(value));
            } catch {
              this.log('Failed to handle SSE message');
            }
          }
        });
      } catch {
        this.log('SSE request failed');
      }

      if (!controller.signal.aborted) {
        this.emit({ type: 'connection:error', error: new Error('SSE connection error') });
        if (!controller.signal.aborted) retryTimer = setTimeout(connect, retryDelay);
      }
    };

    this.activeConnections.add(close);
    void connect();
    return close;
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
      } catch {
        console.error('[SSEClient] Event handler failed');
      }
    }
  }

  /**
   * Close all connections
   */
  disconnect(): void {
    for (const close of this.activeConnections) close();
    this.log('All SSE connections closed');
  }

  /**
   * Log message if debug enabled
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[SSEClient] ${message}`);
    }
  }
}

async function readEventStream(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  emit: (field: 'id' | 'retry' | 'message', value: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let skipLeadingLf = false;
  let eventType = '';
  let data: string[] = [];

  try {
    while (!signal.aborted) {
      const chunk = await reader.read();
      if (chunk.done) break;
      const decoded = decoder.decode(chunk.value, { stream: true });
      if (!decoded) continue;
      buffer += skipLeadingLf && decoded.startsWith('\n') ? decoded.slice(1) : decoded;
      skipLeadingLf = false;

      let end = buffer.search(/[\r\n]/);
      while (end !== -1 && !signal.aborted) {
        skipLeadingLf = buffer[end] === '\r' && end === buffer.length - 1;
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + (buffer.slice(end, end + 2) === '\r\n' ? 2 : 1));
        end = buffer.search(/[\r\n]/);

        if (line === '') {
          if (data.length && (!eventType || eventType === 'message')) emit('message', data.join('\n'));
          eventType = '';
          data = [];
          continue;
        }

        const separator = line.indexOf(':');
        const field = separator === -1 ? line : line.slice(0, separator);
        const value = separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '');
        if (field === 'data') data.push(value);
        if (field === 'event') eventType = value;
        if (field === 'id' && !value.includes('\0')) emit('id', value);
        if (field === 'retry' && /^\d{1,9}$/.test(value)) emit('retry', value);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
