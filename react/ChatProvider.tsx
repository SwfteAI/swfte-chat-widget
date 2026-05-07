/**
 * Chat Provider - React Context for Swfte Chat
 */

import * as React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { SwfteChatClient, createSwfteChatClient, ChatStore } from '../src';
import type { SwfteChatConfig, ChatState } from '../src/types';

interface ChatContextValue {
  client: SwfteChatClient | null;
  store: ChatStore | null;
  state: ChatState | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export interface ChatProviderProps {
  config: SwfteChatConfig;
  children: ReactNode;
  /** Auto-initialize on mount */
  autoInit?: boolean;
  /** Callback when initialized */
  onReady?: (client: SwfteChatClient) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export function ChatProvider({
  config,
  children,
  autoInit = true,
  onReady,
  onError,
}: ChatProviderProps) {
  const [client, setClient] = useState<SwfteChatClient | null>(null);
  const [store, setStore] = useState<ChatStore | null>(null);
  const [state, setState] = useState<ChatState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize client
  useEffect(() => {
    const chatClient = createSwfteChatClient(config);
    setClient(chatClient);
    setStore(chatClient.getStore());

    if (autoInit) {
      setIsLoading(true);
      chatClient.initialize()
        .then(() => {
          setIsInitialized(true);
          setIsLoading(false);
          onReady?.(chatClient);
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error('Initialization failed');
          setError(error);
          setIsLoading(false);
          onError?.(error);
        });
    }

    return () => {
      chatClient.destroy();
    };
  }, [config.baseUrl, config.widgetId]);

  // Subscribe to store changes
  useEffect(() => {
    if (!store) return;

    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });

    // Initial state
    setState({ ...store.getState() });

    return unsubscribe;
  }, [store]);

  const value: ChatContextValue = {
    client,
    store,
    state,
    isInitialized,
    isLoading,
    error,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook to access chat client
 */
export function useChatClient(): SwfteChatClient {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatClient must be used within ChatProvider');
  }
  if (!context.client) {
    throw new Error('Chat client not initialized');
  }
  return context.client;
}

/**
 * Hook to access chat store
 */
export function useChatStore(): { store: ChatStore | null; state: ChatState | null } {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatStore must be used within ChatProvider');
  }
  return { store: context.store, state: context.state };
}

/**
 * Hook to check initialization status
 */
export function useChatStatus(): {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatStatus must be used within ChatProvider');
  }
  return {
    isInitialized: context.isInitialized,
    isLoading: context.isLoading,
    error: context.error,
  };
}
