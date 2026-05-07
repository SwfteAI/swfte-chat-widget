/**
 * Unit tests for ChatStore
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ChatStore, getStore, resetStore } from '../../src/core/store';
import { clearAllMocks, mockData } from '../setup';

describe('ChatStore', () => {
  beforeEach(() => {
    clearAllMocks();
    resetStore();
  });

  describe('initialization', () => {
    it('should create store with initial state', () => {
      const store = new ChatStore();
      const state = store.getState();

      expect(state.config).toBeNull();
      expect(state.visitor).toBeNull();
      expect(state.sessionToken).toBeNull();
      expect(state.activeConversationId).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.isTyping).toBe(false);
      expect(state.agentTyping).toBe(false);
      expect(state.unreadCount).toBe(0);
      expect(state.error).toBeNull();
    });

    it('should accept debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const store = new ChatStore(true);

      store.dispatch({ type: 'SET_CONNECTED', payload: true });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getStore singleton', () => {
    it('should return same instance', () => {
      const store1 = getStore();
      const store2 = getStore();

      expect(store1).toBe(store2);
    });

    it('should reset singleton on resetStore', () => {
      const store1 = getStore();
      store1.dispatch({ type: 'SET_CONNECTED', payload: true });

      resetStore();
      const store2 = getStore();

      expect(store2.getState().isConnected).toBe(false);
    });
  });

  describe('dispatch actions', () => {
    let store: ChatStore;

    beforeEach(() => {
      store = new ChatStore();
    });

    describe('SET_CONFIG', () => {
      it('should set widget config', () => {
        store.dispatch({ type: 'SET_CONFIG', payload: mockData.widgetConfig });

        expect(store.getState().config).toEqual(mockData.widgetConfig);
        expect(store.getConfig()).toEqual(mockData.widgetConfig);
      });
    });

    describe('SET_VISITOR', () => {
      it('should set visitor', () => {
        store.dispatch({ type: 'SET_VISITOR', payload: mockData.visitor });

        expect(store.getState().visitor).toEqual(mockData.visitor);
        expect(store.getVisitor()).toEqual(mockData.visitor);
      });
    });

    describe('SET_SESSION_TOKEN', () => {
      it('should set session token', () => {
        store.dispatch({ type: 'SET_SESSION_TOKEN', payload: mockData.sessionToken });

        expect(store.getState().sessionToken).toBe(mockData.sessionToken);
        expect(store.getSessionToken()).toBe(mockData.sessionToken);
      });
    });

    describe('ADD_CONVERSATION', () => {
      it('should add conversation to map', () => {
        store.dispatch({ type: 'ADD_CONVERSATION', payload: mockData.conversation });

        expect(store.getConversation(mockData.conversation.id)).toEqual(mockData.conversation);
        expect(store.getConversations()).toHaveLength(1);
      });
    });

    describe('UPDATE_CONVERSATION', () => {
      it('should update existing conversation', () => {
        store.dispatch({ type: 'ADD_CONVERSATION', payload: mockData.conversation });

        const updatedConversation = {
          ...mockData.conversation,
          status: 'closed'
        };
        store.dispatch({ type: 'UPDATE_CONVERSATION', payload: updatedConversation });

        expect(store.getConversation(mockData.conversation.id).status).toBe('closed');
      });
    });

    describe('SET_ACTIVE_CONVERSATION', () => {
      it('should set active conversation ID', () => {
        store.dispatch({ type: 'ADD_CONVERSATION', payload: mockData.conversation });
        store.dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: mockData.conversation.id });

        expect(store.getState().activeConversationId).toBe(mockData.conversation.id);
        expect(store.getActiveConversation()).toEqual(mockData.conversation);
      });
    });

    describe('ADD_MESSAGE', () => {
      it('should add message to conversation', () => {
        store.dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            conversationId: mockData.conversation.id,
            message: mockData.message,
          },
        });

        expect(store.getMessages(mockData.conversation.id)).toHaveLength(1);
        expect(store.getMessages(mockData.conversation.id)[0]).toEqual(mockData.message);
      });

      it('should add multiple messages', () => {
        const message1 = { ...mockData.message, id: 'msg-1' };
        const message2 = { ...mockData.message, id: 'msg-2' };

        store.dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: mockData.conversation.id, message: message1 },
        });
        store.dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: mockData.conversation.id, message: message2 },
        });

        expect(store.getMessages(mockData.conversation.id)).toHaveLength(2);
      });
    });

    describe('UPDATE_MESSAGE', () => {
      it('should update existing message', () => {
        store.dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            conversationId: mockData.conversation.id,
            message: mockData.message,
          },
        });

        const updatedMessage = { ...mockData.message, content: 'Updated content' };
        store.dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            conversationId: mockData.conversation.id,
            message: updatedMessage,
          },
        });

        expect(store.getMessages(mockData.conversation.id)[0].content).toBe('Updated content');
      });
    });

    describe('SET_CONNECTED', () => {
      it('should set connection status', () => {
        store.dispatch({ type: 'SET_CONNECTED', payload: true });

        expect(store.isConnected()).toBe(true);
      });
    });

    describe('SET_TYPING', () => {
      it('should set user typing status', () => {
        store.dispatch({ type: 'SET_TYPING', payload: true });

        expect(store.isTyping()).toBe(true);
      });
    });

    describe('SET_AGENT_TYPING', () => {
      it('should set agent typing status', () => {
        store.dispatch({ type: 'SET_AGENT_TYPING', payload: true });

        expect(store.isAgentTyping()).toBe(true);
      });
    });

    describe('SET_UNREAD_COUNT', () => {
      it('should set unread count', () => {
        store.dispatch({ type: 'SET_UNREAD_COUNT', payload: 5 });

        expect(store.getUnreadCount()).toBe(5);
      });
    });

    describe('INCREMENT_UNREAD', () => {
      it('should increment unread count', () => {
        store.dispatch({ type: 'SET_UNREAD_COUNT', payload: 2 });
        store.dispatch({ type: 'INCREMENT_UNREAD' });

        expect(store.getUnreadCount()).toBe(3);
      });
    });

    describe('CLEAR_UNREAD', () => {
      it('should clear unread count', () => {
        store.dispatch({ type: 'SET_UNREAD_COUNT', payload: 10 });
        store.dispatch({ type: 'CLEAR_UNREAD' });

        expect(store.getUnreadCount()).toBe(0);
      });
    });

    describe('SET_ERROR', () => {
      it('should set error', () => {
        const error = { message: 'Something went wrong' };
        store.dispatch({ type: 'SET_ERROR', payload: error });

        expect(store.getError()).toEqual(error);
      });
    });

    describe('RESET', () => {
      it('should reset store to initial state', () => {
        store.dispatch({ type: 'SET_CONFIG', payload: mockData.widgetConfig });
        store.dispatch({ type: 'SET_VISITOR', payload: mockData.visitor });
        store.dispatch({ type: 'SET_CONNECTED', payload: true });
        store.dispatch({ type: 'SET_UNREAD_COUNT', payload: 5 });

        store.dispatch({ type: 'RESET' });

        expect(store.getConfig()).toBeNull();
        expect(store.getVisitor()).toBeNull();
        expect(store.isConnected()).toBe(false);
        expect(store.getUnreadCount()).toBe(0);
      });
    });
  });

  describe('subscriptions', () => {
    it('should notify listeners on state change', () => {
      const store = new ChatStore();
      const listener = jest.fn();

      store.subscribe(listener);
      store.dispatch({ type: 'SET_CONNECTED', payload: true });

      expect(listener).toHaveBeenCalled();
    });

    it('should allow unsubscribing', () => {
      const store = new ChatStore();
      const listener = jest.fn();

      const unsubscribe = store.subscribe(listener);
      unsubscribe();

      store.dispatch({ type: 'SET_CONNECTED', payload: true });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should notify multiple listeners', () => {
      const store = new ChatStore();
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);
      store.dispatch({ type: 'SET_CONNECTED', payload: true });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const store = new ChatStore();
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn();

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.subscribe(errorListener);
      store.subscribe(normalListener);

      // Should not throw
      expect(() => {
        store.dispatch({ type: 'SET_CONNECTED', payload: true });
      }).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('selectors', () => {
    let store: ChatStore;

    beforeEach(() => {
      store = new ChatStore();
    });

    describe('getActiveMessages', () => {
      it('should return messages for active conversation', () => {
        store.dispatch({ type: 'ADD_CONVERSATION', payload: mockData.conversation });
        store.dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: mockData.conversation.id });
        store.dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId: mockData.conversation.id, message: mockData.message },
        });

        expect(store.getActiveMessages()).toHaveLength(1);
      });

      it('should return empty array if no active conversation', () => {
        expect(store.getActiveMessages()).toEqual([]);
      });
    });

    describe('getActiveConversation', () => {
      it('should return active conversation', () => {
        store.dispatch({ type: 'ADD_CONVERSATION', payload: mockData.conversation });
        store.dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: mockData.conversation.id });

        expect(store.getActiveConversation()).toEqual(mockData.conversation);
      });

      it('should return undefined if no active conversation', () => {
        expect(store.getActiveConversation()).toBeUndefined();
      });
    });

    describe('getConversations', () => {
      it('should return all conversations as array', () => {
        const conv1 = { ...mockData.conversation, id: 'conv-1' };
        const conv2 = { ...mockData.conversation, id: 'conv-2' };

        store.dispatch({ type: 'ADD_CONVERSATION', payload: conv1 });
        store.dispatch({ type: 'ADD_CONVERSATION', payload: conv2 });

        const conversations = store.getConversations();
        expect(conversations).toHaveLength(2);
      });
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const store = new ChatStore();

      store.dispatch({ type: 'SET_CONFIG', payload: mockData.widgetConfig });
      store.dispatch({ type: 'SET_CONNECTED', payload: true });

      store.reset();

      expect(store.getConfig()).toBeNull();
      expect(store.isConnected()).toBe(false);
    });

    it('should notify listeners on reset', () => {
      const store = new ChatStore();
      const listener = jest.fn();

      store.subscribe(listener);
      store.reset();

      expect(listener).toHaveBeenCalled();
    });
  });
});
