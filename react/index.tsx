/**
 * Swfte Chat Widget - React Components
 */

export { ChatProvider, useChatClient, useChatStore, useChatStatus } from './ChatProvider';
export { ChatWidget } from './ChatWidget';
export { EmbeddedChat } from './EmbeddedChat';
export { AISearch } from './AISearch';
export { useChat } from './hooks/useChat';
export { useConversation } from './hooks/useConversation';
export { useVoiceChat } from './hooks/useVoiceChat';

// Re-export types
export type { ChatProviderProps } from './ChatProvider';
export type { ChatWidgetProps } from './ChatWidget';
export type { EmbeddedChatProps } from './EmbeddedChat';
export type { AISearchProps, SearchResult, Citation, SearchResponse } from './AISearch';
export type { UseChatReturn } from './hooks/useChat';
export type { UseConversationReturn } from './hooks/useConversation';
export type { UseVoiceChatConfig, UseVoiceChatReturn, VoiceChatMessage } from './hooks/useVoiceChat';
