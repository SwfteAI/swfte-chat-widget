/**
 * useConversation Hook - Hook for conversation management
 */

import { useCallback, useMemo } from 'react';
import { useChatClient, useChatStore } from '../ChatProvider';
import type { Conversation, Message } from '../../src/types';

export interface UseConversationReturn {
  /** Active conversation */
  activeConversation: Conversation | null;
  /** All conversations */
  conversations: Conversation[];
  /** Messages in active conversation */
  messages: Message[];
  /** Set active conversation */
  setActiveConversation: (conversationId: string) => void;
  /** Create new conversation */
  createConversation: (metadata?: Record<string, unknown>) => Promise<Conversation>;
  /** Load messages for conversation */
  loadMessages: (conversationId: string, options?: { limit?: number; before?: string }) => Promise<Message[]>;
  /** Close/archive conversation */
  closeConversation: (conversationId: string) => Promise<void>;
}

export function useConversation(): UseConversationReturn {
  const client = useChatClient();
  const { state, store } = useChatStore();

  const activeConversation = useMemo(() => {
    if (!state?.activeConversationId) return null;
    return state.conversations.get(state.activeConversationId) || null;
  }, [state?.activeConversationId, state?.conversations]);

  const conversations = useMemo(() => {
    if (!state?.conversations) return [];
    return Array.from(state.conversations.values());
  }, [state?.conversations]);

  const messages = useMemo(() => {
    if (!state?.activeConversationId) return [];
    return state.messages.get(state.activeConversationId) || [];
  }, [state?.activeConversationId, state?.messages]);

  const setActiveConversation = useCallback((conversationId: string) => {
    store?.dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
  }, [store]);

  const createConversation = useCallback(async (metadata?: Record<string, unknown>): Promise<Conversation> => {
    return client.startConversation(metadata);
  }, [client]);

  const loadMessages = useCallback(async (
    conversationId: string,
    options?: { limit?: number; before?: string }
  ): Promise<Message[]> => {
    return client.loadMessages(conversationId, options);
  }, [client]);

  const closeConversation = useCallback(async (conversationId: string): Promise<void> => {
    await client.conversations.close(conversationId);
    store?.dispatch({
      type: 'UPDATE_CONVERSATION',
      payload: {
        ...state?.conversations.get(conversationId)!,
        status: 'closed',
      },
    });
  }, [client, store, state?.conversations]);

  return {
    activeConversation,
    conversations,
    messages,
    setActiveConversation,
    createConversation,
    loadMessages,
    closeConversation,
  };
}
