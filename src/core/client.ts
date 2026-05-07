/**
 * Swfte Chat Client - Main Entry Point
 */

import { HttpClient } from '../api/http';
import { ConversationsApi } from '../api/conversations';
import { AgentsApi } from '../api/agents';
import { ChatStore } from './store';
import type {
  SwfteChatConfig,
  WidgetConfig,
  VisitorSession,
  VisitorContext,
  Conversation,
  Message,
  StreamingChunk,
  ChatEvent,
  ChatEventHandler,
  UserInfo,
} from '../types';

export class SwfteChatClient {
  private config: SwfteChatConfig;
  private http: HttpClient;
  private store: ChatStore;
  private eventHandlers: Set<ChatEventHandler> = new Set();
  private activeStreamController: AbortController | null = null;

  // API clients
  public readonly conversations: ConversationsApi;
  public readonly agents: AgentsApi;

  constructor(config: SwfteChatConfig) {
    this.config = config;
    this.store = new ChatStore(config.debug);

    this.http = new HttpClient({
      baseUrl: config.baseUrl,
      debug: config.debug,
      fetch: config.fetch,
    });

    this.conversations = new ConversationsApi(this.http, config.widgetId);
    this.agents = new AgentsApi(this.http);
  }

  // ==================== Initialization ====================

  /**
   * Initialize the client - fetches widget config and creates visitor session
   */
  async initialize(): Promise<void> {
    try {
      // Fetch widget configuration
      const widgetConfig = await this.fetchWidgetConfig();
      this.store.dispatch({ type: 'SET_CONFIG', payload: widgetConfig });

      // Set workspace ID for gateway/billing headers (returned in widget config)
      if (widgetConfig.workspaceId) {
        this.http.setWorkspaceId(widgetConfig.workspaceId);
      }

      // Create or restore visitor session
      const session = await this.createVisitorSession();
      this.store.dispatch({ type: 'SET_SESSION_TOKEN', payload: session.sessionToken });

      // Fetch visitor info
      const visitor = await this.fetchVisitorInfo();
      this.store.dispatch({ type: 'SET_VISITOR', payload: visitor });

      // Auto-identify if user info provided
      if (this.config.userInfo) {
        await this.identify(this.config.userInfo);
      }

      this.log('Client initialized');
    } catch (error) {
      this.store.dispatch({
        type: 'SET_ERROR',
        payload: { message: error instanceof Error ? error.message : 'Initialization failed' },
      });
      throw error;
    }
  }

  /**
   * Fetch widget configuration
   */
  private async fetchWidgetConfig(): Promise<WidgetConfig> {
    const response = await this.http.get<WidgetConfig>(
      `/v1/widgets/${this.config.widgetId}`
    );
    return response.data;
  }

  /**
   * Create visitor session
   */
  private async createVisitorSession(): Promise<VisitorSession> {
    const context = this.collectVisitorContext();
    const response = await this.http.post<VisitorSession>(
      `/v1/widgets/${this.config.widgetId}/visitors`,
      context
    );

    // Set auth token for subsequent requests
    this.http.setAuthToken(response.data.sessionToken);

    return response.data;
  }

  /**
   * Fetch visitor info
   */
  private async fetchVisitorInfo() {
    const response = await this.http.get<any>(
      `/v1/widgets/${this.config.widgetId}/visitors/me`
    );
    return response.data;
  }

  /**
   * Collect visitor context from browser
   */
  private collectVisitorContext(): VisitorContext {
    if (typeof window === 'undefined') return {};

    const nav = navigator;
    const screen = window.screen;

    // Try to get fingerprint from localStorage
    let fingerprint = localStorage.getItem('swfte_fp');
    if (!fingerprint) {
      fingerprint = this.generateFingerprint();
      localStorage.setItem('swfte_fp', fingerprint);
    }

    // Parse UTM parameters
    const urlParams = new URLSearchParams(window.location.search);

    return {
      fingerprint,
      browser: this.detectBrowser(),
      browserVersion: this.detectBrowserVersion(),
      device: this.detectDevice(),
      os: this.detectOS(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: nav.language,
      referrerUrl: document.referrer || undefined,
      pageUrl: window.location.href,
      pageTitle: document.title,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
    };
  }

  // ==================== Conversation Management ====================

  /**
   * Start a new conversation
   */
  async startConversation(metadata?: Record<string, unknown>): Promise<Conversation> {
    const config = this.store.getConfig();
    if (!config) throw new Error('Client not initialized');

    const conversation = await this.conversations.create({
      agentId: config.agentId,
      metadata,
    });

    this.store.dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
    this.store.dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });

    this.emit({ type: 'conversation:created', conversation });
    return conversation;
  }

  /**
   * Send a message (with streaming response)
   */
  async sendMessage(content: string, options?: { conversationId?: string }): Promise<Message> {
    const conversationId = options?.conversationId || this.store.getState().activeConversationId;

    if (!conversationId) {
      // Auto-create conversation if none exists
      await this.startConversation();
      return this.sendMessage(content, options);
    }

    // Create user message
    const userMessage: Message = {
      id: this.generateId(),
      conversationId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    this.store.dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId, message: userMessage },
    });
    this.emit({ type: 'message:sent', message: userMessage });

    // Create placeholder for assistant response
    const assistantMessage: Message = {
      id: this.generateId(),
      conversationId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    this.store.dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId, message: assistantMessage },
    });
    this.store.dispatch({ type: 'SET_AGENT_TYPING', payload: true });

    try {
      // Send message through widget chat endpoint (handles model resolution internally)
      const response = await this.http.post<any>(
        `/v1/widgets/${this.config.widgetId}/chat`,
        { message: content, conversationId }
      );

      // Extract content from OpenAI-compatible response format
      const responseContent =
        response.data?.choices?.[0]?.message?.content ||
        response.data?.content ||
        '';

      assistantMessage.content = responseContent;
      this.store.dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { conversationId, message: { ...assistantMessage } },
      });
    } finally {
      this.store.dispatch({ type: 'SET_AGENT_TYPING', payload: false });
    }

    this.emit({ type: 'message:received', message: assistantMessage });
    return assistantMessage;
  }

  /**
   * Get messages for a conversation
   */
  async loadMessages(conversationId: string, options?: { limit?: number; before?: string }): Promise<Message[]> {
    const response = await this.conversations.getMessages(conversationId, options);

    for (const message of response.messages) {
      this.store.dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId, message },
      });
    }

    return response.messages;
  }

  // ==================== AI Search ====================

  /**
   * Perform semantic search across the knowledge base
   */
  async search(query: string, options?: { limit?: number; filters?: Record<string, unknown> }): Promise<{
    query: string;
    results: Array<{
      id: string;
      title: string;
      content: string;
      score: number;
      source?: string;
      url?: string;
      citations?: Array<{
        text: string;
        source: string;
        url?: string;
        page?: number;
      }>;
      metadata?: Record<string, unknown>;
    }>;
    suggestions?: string[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const response = await this.http.post<any>(
      `/v1/widgets/${this.config.widgetId}/search`,
      {
        query,
        limit: options?.limit ?? 10,
        filters: options?.filters,
      }
    );

    return response.data;
  }

  // ==================== Visitor Identity ====================

  /**
   * Identify visitor with user info
   */
  async identify(userInfo: UserInfo): Promise<void> {
    await this.http.post(`/v1/widgets/${this.config.widgetId}/visitors/identify`, {
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
      customAttributes: userInfo.customAttributes,
    });

    const visitor = await this.fetchVisitorInfo();
    this.store.dispatch({ type: 'SET_VISITOR', payload: visitor });
  }

  // ==================== Events ====================

  /**
   * Subscribe to chat events
   */
  on(handler: ChatEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  /**
   * Emit event to all handlers
   */
  private emit(event: ChatEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('[SwfteChat] Event handler error:', error);
      }
    }
  }

  // ==================== Store Access ====================

  /**
   * Get store for state access
   */
  getStore(): ChatStore {
    return this.store;
  }

  /**
   * Subscribe to store changes
   */
  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }

  // ==================== Utilities ====================

  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[SwfteChat] ${message}`, ...args);
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(): string {
    const nav = navigator;
    const screen = window.screen;
    const data = [
      nav.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      nav.language,
    ].join('|');
    return this.hashCode(data);
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private detectBrowserVersion(): string {
    const ua = navigator.userAgent;
    const match = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private detectDevice(): string {
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    return 'Unknown';
  }

  // ==================== Cleanup ====================

  /**
   * Destroy the client
   */
  destroy(): void {
    this.activeStreamController?.abort();
    this.activeStreamController = null;
    this.eventHandlers.clear();
    this.store.reset();
    this.log('Client destroyed');
  }
}

/**
 * Create a new Swfte Chat Client
 */
export function createSwfteChatClient(config: SwfteChatConfig): SwfteChatClient {
  return new SwfteChatClient(config);
}
