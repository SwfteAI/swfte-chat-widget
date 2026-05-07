/**
 * Swfte Chat Widget SDK - Type Definitions
 */

// ==================== Configuration ====================

export interface SwfteChatConfig {
  /** API base URL */
  baseUrl: string;
  /** Widget ID */
  widgetId: string;
  /** Optional user info for pre-identification */
  userInfo?: UserInfo;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

export interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
  customAttributes?: Record<string, string>;
}

// ==================== Widget Configuration ====================

export interface WidgetConfig {
  id: string;
  agentId: string;
  name?: string;
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  userBubbleColor: string;
  userBubbleTextColor: string;
  agentBubbleColor: string;
  agentBubbleTextColor: string;
  headerBackground: string;
  headerTextColor: string;
  fontFamily: string;
  borderRadius: string;
  position: 'bottom-right' | 'bottom-left';
  offsetX: number;
  offsetY: number;
  widgetWidth: string;
  widgetHeight: string;
  launcherSize: string;
  launcherIcon?: string;
  avatarUrl?: string;
  // Branding
  companyName?: string;
  logoUrl?: string;
  showPoweredBy: boolean;
  customCss?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  // Behavior
  greetingMessage?: string;
  placeholderText?: string;
  autoOpen: boolean;
  autoOpenDelayMs: number;
  enableSoundNotifications: boolean;
  enableFileUpload: boolean;
  enableMarkdown: boolean;
  enablePreChatForm: boolean;
  preChatFormConfig?: string;
  // Analytics
  enableAnalytics: boolean;
}

// ==================== Visitor & Session ====================

export interface Visitor {
  id: string;
  widgetId: string;
  workspaceId: string;
  fingerprint?: string;
  email?: string;
  name?: string;
  phone?: string;
  isAnonymous: boolean;
  customAttributes?: Record<string, string>;
  tags?: string[];
  totalConversations: number;
  totalMessages: number;
  leadScore: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface VisitorSession {
  visitorId: string;
  sessionToken: string;
  isNewVisitor: boolean;
  expiresAt: string;
  agentId: string;
  greetingMessage?: string;
}

export interface VisitorContext {
  fingerprint?: string;
  browser?: string;
  browserVersion?: string;
  device?: string;
  os?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  referrerUrl?: string;
  pageUrl?: string;
  pageTitle?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// ==================== Conversations & Messages ====================

export interface Conversation {
  id: string;
  agentId: string;
  visitorId: string;
  status: 'active' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  attachments?: Attachment[];
  citations?: Citation[];
  thinking?: string;
  toolCalls?: ToolCall[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface Citation {
  text: string;
  source: string;
  url?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

// ==================== Streaming ====================

export interface StreamingChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: StreamingChoice[];
}

export interface StreamingChoice {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
  };
  finish_reason: 'stop' | 'length' | 'tool_calls' | null;
}

// ==================== Events ====================

export type ChatEvent =
  | { type: 'connection:open' }
  | { type: 'connection:close'; reason?: string }
  | { type: 'connection:error'; error: Error }
  | { type: 'message:received'; message: Message }
  | { type: 'message:sent'; message: Message }
  | { type: 'message:streaming'; chunk: StreamingChunk }
  | { type: 'typing:start'; userId?: string }
  | { type: 'typing:stop'; userId?: string }
  | { type: 'conversation:created'; conversation: Conversation }
  | { type: 'conversation:updated'; conversation: Conversation }
  | { type: 'presence:join'; userId: string }
  | { type: 'presence:leave'; userId: string };

export type ChatEventHandler = (event: ChatEvent) => void;

// ==================== Theme ====================

export interface ChatTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  dimensions: ThemeDimensions;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  textMuted: string;
  userBubble: string;
  userBubbleText: string;
  agentBubble: string;
  agentBubbleText: string;
  launcherBackground: string;
  headerBackground: string;
  headerText: string;
  border: string;
  error: string;
  success: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: string;
  fontSizeSmall: string;
  fontSizeLarge: string;
  lineHeight: string;
}

export interface ThemeRadius {
  bubble: string;
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeShadows {
  widget: string;
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeDimensions {
  widgetWidth: string;
  widgetHeight: string;
  launcherSize: string;
  headerHeight: string;
  inputHeight: string;
}

// ==================== Widget Options ====================

export interface ChatWidgetOptions {
  /** Container element or selector */
  container?: HTMLElement | string;
  /** Widget position */
  position?: 'bottom-right' | 'bottom-left';
  /** Custom theme overrides */
  theme?: Partial<ChatTheme>;
  /** Z-index for widget */
  zIndex?: number;
  /** Callbacks */
  onOpen?: () => void;
  onClose?: () => void;
  onMessageSent?: (message: Message) => void;
  onMessageReceived?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface EmbeddedChatOptions {
  /** Container element or selector */
  container: HTMLElement | string;
  /** Custom theme overrides */
  theme?: Partial<ChatTheme>;
  /** Show header */
  showHeader?: boolean;
  /** Conversation ID to resume */
  conversationId?: string;
}

export interface AISearchOptions {
  /** Container element or selector */
  container?: HTMLElement | string;
  /** Placeholder text */
  placeholder?: string;
  /** Custom theme overrides */
  theme?: Partial<ChatTheme>;
  /** Max results */
  maxResults?: number;
  /** Show citations */
  showCitations?: boolean;
  /** Show suggestions */
  showSuggestions?: boolean;
  /** Search filters */
  filters?: Record<string, unknown>;
  /** Show powered by badge */
  showPoweredBy?: boolean;
  /** Callback when search is performed */
  onSearch?: (query: string, response: SearchResponse) => void;
  /** Callback when a result is clicked */
  onResultClick?: (result: SearchResult) => void;
}

// ==================== Search Types ====================

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  suggestions?: string[];
  totalCount: number;
  hasMore: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  source?: string;
  url?: string;
  citations?: SearchCitation[];
  metadata?: Record<string, unknown>;
}

export interface SearchCitation {
  text: string;
  source: string;
  url?: string;
  page?: number;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// ==================== Store Types ====================

export interface ChatState {
  config: WidgetConfig | null;
  visitor: Visitor | null;
  sessionToken: string | null;
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
  activeConversationId: string | null;
  isConnected: boolean;
  isTyping: boolean;
  agentTyping: boolean;
  unreadCount: number;
  error: ApiError | null;
}

export type ChatAction =
  | { type: 'SET_CONFIG'; payload: WidgetConfig }
  | { type: 'SET_VISITOR'; payload: Visitor }
  | { type: 'SET_SESSION_TOKEN'; payload: string }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_AGENT_TYPING'; payload: boolean }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'INCREMENT_UNREAD' }
  | { type: 'CLEAR_UNREAD' }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'RESET' };
