/**
 * State Store for Swfte Chat SDK
 * Lightweight state management with subscriptions
 */

import type { ChatState, ChatAction, Message, Conversation, WidgetConfig, Visitor, ApiError } from '../types';

type Listener = () => void;

const initialState: ChatState = {
  config: null,
  visitor: null,
  sessionToken: null,
  conversations: new Map(),
  messages: new Map(),
  activeConversationId: null,
  isConnected: false,
  isTyping: false,
  agentTyping: false,
  unreadCount: 0,
  error: null,
};

export class ChatStore {
  private state: ChatState;
  private listeners: Set<Listener> = new Set();
  private debug: boolean;

  constructor(debug = false) {
    this.state = { ...initialState };
    this.debug = debug;
  }

  /**
   * Get current state
   */
  getState(): ChatState {
    return this.state;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Dispatch action to update state
   */
  dispatch(action: ChatAction): void {
    if (this.debug) {
      console.log('[SwfteChat Store] Dispatch:', action.type, 'payload' in action ? action.payload : '');
    }

    this.state = this.reducer(this.state, action);
    this.notifyListeners();
  }

  /**
   * Reset store to initial state
   */
  reset(): void {
    this.state = { ...initialState, conversations: new Map(), messages: new Map() };
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        console.error('[SwfteChat Store] Listener error:', error);
      }
    }
  }

  /**
   * State reducer
   */
  private reducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
      case 'SET_CONFIG':
        return { ...state, config: action.payload };

      case 'SET_VISITOR':
        return { ...state, visitor: action.payload };

      case 'SET_SESSION_TOKEN':
        return { ...state, sessionToken: action.payload };

      case 'ADD_CONVERSATION': {
        const conversations = new Map(state.conversations);
        conversations.set(action.payload.id, action.payload);
        return { ...state, conversations };
      }

      case 'UPDATE_CONVERSATION': {
        const conversations = new Map(state.conversations);
        conversations.set(action.payload.id, action.payload);
        return { ...state, conversations };
      }

      case 'SET_ACTIVE_CONVERSATION':
        return { ...state, activeConversationId: action.payload };

      case 'ADD_MESSAGE': {
        const { conversationId, message } = action.payload;
        const messages = new Map(state.messages);
        const conversationMessages = messages.get(conversationId) || [];
        messages.set(conversationId, [...conversationMessages, message]);
        return { ...state, messages };
      }

      case 'UPDATE_MESSAGE': {
        const { conversationId, message } = action.payload;
        const messages = new Map(state.messages);
        const conversationMessages = messages.get(conversationId) || [];
        const index = conversationMessages.findIndex(m => m.id === message.id);
        if (index >= 0) {
          conversationMessages[index] = message;
          messages.set(conversationId, [...conversationMessages]);
        }
        return { ...state, messages };
      }

      case 'SET_CONNECTED':
        return { ...state, isConnected: action.payload };

      case 'SET_TYPING':
        return { ...state, isTyping: action.payload };

      case 'SET_AGENT_TYPING':
        return { ...state, agentTyping: action.payload };

      case 'SET_UNREAD_COUNT':
        return { ...state, unreadCount: action.payload };

      case 'INCREMENT_UNREAD':
        return { ...state, unreadCount: state.unreadCount + 1 };

      case 'CLEAR_UNREAD':
        return { ...state, unreadCount: 0 };

      case 'SET_ERROR':
        return { ...state, error: action.payload };

      case 'RESET':
        return { ...initialState, conversations: new Map(), messages: new Map() };

      default:
        return state;
    }
  }

  // ==================== Selectors ====================

  /**
   * Get config
   */
  getConfig(): WidgetConfig | null {
    return this.state.config;
  }

  /**
   * Get visitor
   */
  getVisitor(): Visitor | null {
    return this.state.visitor;
  }

  /**
   * Get session token
   */
  getSessionToken(): string | null {
    return this.state.sessionToken;
  }

  /**
   * Get conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.state.conversations.get(id);
  }

  /**
   * Get all conversations
   */
  getConversations(): Conversation[] {
    return Array.from(this.state.conversations.values());
  }

  /**
   * Get active conversation
   */
  getActiveConversation(): Conversation | undefined {
    if (!this.state.activeConversationId) return undefined;
    return this.state.conversations.get(this.state.activeConversationId);
  }

  /**
   * Get messages for conversation
   */
  getMessages(conversationId: string): Message[] {
    return this.state.messages.get(conversationId) || [];
  }

  /**
   * Get active conversation messages
   */
  getActiveMessages(): Message[] {
    if (!this.state.activeConversationId) return [];
    return this.getMessages(this.state.activeConversationId);
  }

  /**
   * Is connected
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Is typing (user)
   */
  isTyping(): boolean {
    return this.state.isTyping;
  }

  /**
   * Is agent typing
   */
  isAgentTyping(): boolean {
    return this.state.agentTyping;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.state.unreadCount;
  }

  /**
   * Get error
   */
  getError(): ApiError | null {
    return this.state.error;
  }
}

// Singleton store instance
let storeInstance: ChatStore | null = null;

export function getStore(debug = false): ChatStore {
  if (!storeInstance) {
    storeInstance = new ChatStore(debug);
  }
  return storeInstance;
}

export function resetStore(): void {
  storeInstance?.reset();
  storeInstance = null;
}
