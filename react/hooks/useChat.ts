/**
 * useChat Hook - Main hook for chat functionality
 */

import { useCallback, useMemo } from 'react';
import { useChatClient, useChatStore } from '../ChatProvider';
import type { Message, UserInfo } from '../../src/types';

export interface UseChatReturn {
  /** Send a message */
  sendMessage: (content: string) => Promise<Message>;
  /** Start a new conversation */
  startConversation: () => Promise<void>;
  /** Identify visitor */
  identify: (userInfo: UserInfo) => Promise<void>;
  /** All messages in active conversation */
  messages: Message[];
  /** Is the client connected */
  isConnected: boolean;
  /** Is the agent typing */
  isAgentTyping: boolean;
  /** Unread message count */
  unreadCount: number;
  /** Load messages for a conversation */
  loadMessages: (conversationId: string) => Promise<Message[]>;
  /** Clear unread count */
  clearUnread: () => void;
}

export function useChat(): UseChatReturn {
  const client = useChatClient();
  const { state, store } = useChatStore();

  const messages = useMemo(() => {
    if (!state?.activeConversationId) return [];
    return state.messages.get(state.activeConversationId) || [];
  }, [state?.activeConversationId, state?.messages]);

  const sendMessage = useCallback(async (content: string): Promise<Message> => {
    return client.sendMessage(content);
  }, [client]);

  const startConversation = useCallback(async (): Promise<void> => {
    await client.startConversation();
  }, [client]);

  const identify = useCallback(async (userInfo: UserInfo): Promise<void> => {
    await client.identify(userInfo);
  }, [client]);

  const loadMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    return client.loadMessages(conversationId);
  }, [client]);

  const clearUnread = useCallback(() => {
    store?.dispatch({ type: 'CLEAR_UNREAD' });
  }, [store]);

  return {
    sendMessage,
    startConversation,
    identify,
    messages,
    isConnected: state?.isConnected ?? false,
    isAgentTyping: state?.agentTyping ?? false,
    unreadCount: state?.unreadCount ?? 0,
    loadMessages,
    clearUnread,
  };
}
