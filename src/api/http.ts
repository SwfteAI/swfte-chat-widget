/**
 * HTTP Client for Swfte Chat SDK
 */

import type { ApiResponse, ApiError } from '../types';

export interface HttpClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  fetch?: typeof fetch;
  debug?: boolean;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private fetchFn: typeof fetch;
  private debug: boolean;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout ?? 30000;
    this.fetchFn = config.fetch ?? fetch.bind(globalThis);
    this.debug = config.debug ?? false;
  }

  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[SwfteChat HTTP] ${message}`, ...args);
    }
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['X-Widget-Token'] = token;
  }

  /**
   * Clear authorization header
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['X-Widget-Token'];
  }

  /**
   * Set workspace ID header
   */
  setWorkspaceId(workspaceId: string): void {
    this.defaultHeaders['X-Workspace-ID'] = workspaceId;
  }

  /**
   * Make HTTP request
   */
  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      timeout?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...this.defaultHeaders, ...options.headers };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout ?? this.timeout
    );

    // Combine signals if external signal provided
    const signal = options.signal
      ? this.combineSignals(options.signal, controller.signal)
      : controller.signal;

    this.log(`${method} ${url}`, options.body ? { body: options.body } : '');

    try {
      const response = await this.fetchFn(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        let errorData: ApiError;
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = { message: errorBody || response.statusText };
        }
        errorData.status = response.status;
        throw new HttpError(errorData.message, response.status, errorData);
      }

      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      this.log(`Response ${response.status}`, data);

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HttpError('Request timeout', 408);
        }
        throw new HttpError(error.message, 0);
      }

      throw new HttpError('Unknown error', 0);
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: { headers?: Record<string, string>; signal?: AbortSignal }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, options?: { headers?: Record<string, string>; signal?: AbortSignal }): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, options?: { headers?: Record<string, string>; signal?: AbortSignal }): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: { headers?: Record<string, string>; signal?: AbortSignal }): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: { headers?: Record<string, string>; signal?: AbortSignal }): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }

  /**
   * Stream request using Server-Sent Events
   */
  async *stream<T>(
    path: string,
    body: unknown,
    options?: { headers?: Record<string, string>; signal?: AbortSignal }
  ): AsyncGenerator<T, void, unknown> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      ...this.defaultHeaders,
      ...options?.headers,
      Accept: 'text/event-stream',
    };

    this.log(`STREAM ${url}`, body);

    const response = await this.fetchFn(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new HttpError(errorBody || response.statusText, response.status);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new HttpError('No response body', 0);
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
          // Handle both "data: " (OpenAI) and "data:" (Spring SSE) formats
          let data: string | null = null;
          if (line.startsWith('data: ')) {
            data = line.slice(6);
          } else if (line.startsWith('data:')) {
            data = line.slice(5);
          }
          if (data !== null) {
            if (data === '[DONE]') {
              return;
            }
            try {
              yield JSON.parse(data) as T;
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Combine abort signals
   */
  private combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }
    return controller.signal;
  }
}

/**
 * HTTP Error class
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly data?: ApiError;

  constructor(message: string, status: number, data?: ApiError) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}
