/**
 * Jest test setup for Swfte Chat Widget SDK
 *
 * This file configures the test environment with mocks for browser APIs
 * and provides global test utilities.
 */

import { jest } from '@jest/globals';

// Mock window and document for Node.js environment
const mockLocalStorage: Record<string, string> = {};
const mockSessionStorage: Record<string, string> = {};

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockLocalStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockLocalStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    }),
    key: jest.fn((index: number) => Object.keys(mockLocalStorage)[index] || null),
    get length() {
      return Object.keys(mockLocalStorage).length;
    },
  },
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockSessionStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
    }),
    key: jest.fn((index: number) => Object.keys(mockSessionStorage)[index] || null),
    get length() {
      return Object.keys(mockSessionStorage).length;
    },
  },
  writable: true,
});

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'https://example.com/page',
      search: '',
      origin: 'https://example.com',
      pathname: '/page',
    },
    screen: {
      width: 1920,
      height: 1080,
      colorDepth: 24,
    },
    localStorage: global.localStorage,
    sessionStorage: global.sessionStorage,
  },
  writable: true,
});

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    title: 'Test Page',
    referrer: 'https://google.com',
    createElement: jest.fn(),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
  },
  writable: true,
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'en-US',
  },
  writable: true,
});

// Mock Intl
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: jest.fn(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    })),
  },
  writable: true,
});

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock URLSearchParams
Object.defineProperty(global, 'URLSearchParams', {
  value: class MockURLSearchParams {
    private params: Map<string, string>;

    constructor(search?: string) {
      this.params = new Map();
      if (search) {
        search.replace(/^\?/, '').split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) {
            this.params.set(key, decodeURIComponent(value || ''));
          }
        });
      }
    }

    get(key: string): string | null {
      return this.params.get(key) || null;
    }

    set(key: string, value: string): void {
      this.params.set(key, value);
    }

    has(key: string): boolean {
      return this.params.has(key);
    }
  },
  writable: true,
});

// Mock Headers
Object.defineProperty(global, 'Headers', {
  value: class MockHeaders {
    private headers: Map<string, string>;

    constructor(init?: Record<string, string>) {
      this.headers = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value);
        });
      }
    }

    get(key: string): string | null {
      return this.headers.get(key.toLowerCase()) || null;
    }

    set(key: string, value: string): void {
      this.headers.set(key.toLowerCase(), value);
    }

    has(key: string): boolean {
      return this.headers.has(key.toLowerCase());
    }
  },
  writable: true,
});

// Mock data factories
export const mockData = {
  widgetId: 'widget-test-123',
  baseUrl: 'https://api.test.swfte.com',
  sessionToken: 'session-token-123',

  widgetConfig: {
    id: 'widget-test-123',
    agentId: 'agent-123',
    name: 'Test Widget',
    theme: {
      primaryColor: '#007bff',
      fontFamily: 'Inter, sans-serif',
    },
    position: 'bottom-right',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholder: 'Type your message...',
  },

  visitor: {
    id: 'visitor-123',
    name: 'Test User',
    email: 'test@example.com',
    fingerprint: 'fp-123456',
    createdAt: '2024-01-01T00:00:00Z',
  },

  visitorSession: {
    sessionToken: 'session-token-123',
    visitorId: 'visitor-123',
    expiresAt: '2024-01-02T00:00:00Z',
  },

  conversation: {
    id: 'conv-123',
    agentId: 'agent-123',
    visitorId: 'visitor-123',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  message: {
    id: 'msg-123',
    conversationId: 'conv-123',
    role: 'assistant' as const,
    content: 'Hello! How can I help you today?',
    timestamp: '2024-01-01T00:00:00Z',
  },

  streamingChunk: {
    id: 'chunk-123',
    object: 'chat.completion.chunk',
    choices: [
      {
        index: 0,
        delta: { content: 'Hello' },
        finish_reason: null,
      },
    ],
  },
};

// Helper to create mock responses
export function createMockResponse<T>(
  data: T,
  options: { status?: number; ok?: boolean } = {}
): Response {
  const { status = 200, ok = true } = options;

  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    body: null,
    bodyUsed: false,
    clone: () => createMockResponse(data, options),
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response;
}

// Helper to clear all mocks
export function clearAllMocks(): void {
  jest.clearAllMocks();
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
}

// Export mock fetch for test access
export { mockFetch };

// Clear mocks before each test
beforeEach(() => {
  clearAllMocks();
});
