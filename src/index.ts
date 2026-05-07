/**
 * Swfte Chat Widget SDK
 *
 * A TypeScript/JavaScript SDK for embeddable AI chat interfaces.
 *
 * @example
 * ```typescript
 * import { createSwfteChatClient } from '@swfte/chat-widget';
 *
 * const client = createSwfteChatClient({
 *   baseUrl: 'https://api.swfte.com',
 *   widgetId: 'your-widget-id',
 * });
 *
 * await client.initialize();
 * const response = await client.sendMessage('Hello!');
 * ```
 */

// Core
export { SwfteChatClient, createSwfteChatClient } from './core/client';
export { ChatStore, getStore, resetStore } from './core/store';

// API
export { HttpClient, HttpError } from './api/http';
export { ConversationsApi } from './api/conversations';
export { AgentsApi } from './api/agents';

// Components
export { ChatWidget } from './components/ChatWidget';
export { EmbeddedChat } from './components/EmbeddedChat';
export { AISearch } from './components/AISearch';

// Real-time
export { StompClient } from './realtime/stomp-client';
export { SSEClient } from './realtime/sse-client';
export { PresenceManager, getPresenceManager, resetPresenceManager } from './realtime/presence';

// Voice
export { VoiceClient } from './voice/VoiceClient';
export { AudioManager } from './voice/AudioManager';

// Theming
export { defaultTheme, darkTheme, minimalTheme, themePresets, createThemeFromConfig, mergeThemes } from './theming/theme';
export { generateCSSVariables, applyThemeToElement, injectBaseStyles, CSS_VARS } from './theming/css-variables';

// Types
export type {
  // Config
  SwfteChatConfig,
  UserInfo,
  WidgetConfig,

  // Visitor
  Visitor,
  VisitorSession,
  VisitorContext,

  // Conversations & Messages
  Conversation,
  Message,
  MessageMetadata,
  Attachment,
  Citation,
  ToolCall,

  // Streaming
  StreamingChunk,
  StreamingChoice,

  // Events
  ChatEvent,
  ChatEventHandler,

  // Theme
  ChatTheme,
  ThemeColors,
  ThemeTypography,
  ThemeRadius,
  ThemeShadows,
  ThemeDimensions,

  // Widget Options
  ChatWidgetOptions,
  EmbeddedChatOptions,
  AISearchOptions,

  // API
  ApiResponse,
  ApiError,

  // State
  ChatState,
  ChatAction,
} from './types';

export type {
  VoiceClientConfig,
  VoiceConfig,
  VoiceSession,
  VoiceSessionState,
  VoiceEventMap,
  VoiceEventHandler,
  VADConfig,
  VADState,
  AudioChunkMessage,
  AgentResponseMessage,
} from './voice/types';

// Version
export const VERSION = '1.0.0';
