/**
 * Conversations API Client
 */

import type { HttpClient } from './http';
import type { Conversation, Message, StreamingChunk } from '../types';

export interface CreateConversationRequest {
  agentId: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageRequest {
  content: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

export interface GetMessagesOptions {
  limit?: number;
  before?: string;
  after?: string;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

export class ConversationsApi {
  constructor(
    private http: HttpClient,
    private widgetId: string
  ) {}

  /**
   * Create a new conversation via the widget endpoint.
   * The backend resolves the agent from the widget config — no agent ID needed in the path.
   */
  async create(request: CreateConversationRequest): Promise<Conversation> {
    const response = await this.http.post<Conversation>(
      `/v1/widgets/${this.widgetId}/conversations/new`,
      {
        widgetId: this.widgetId,
        metadata: request.metadata,
      }
    );
    return response.data;
  }

  /**
   * Get conversation by ID
   */
  async get(conversationId: string): Promise<Conversation> {
    const response = await this.http.get<Conversation>(
      `/v1/conversations/${conversationId}`
    );
    return response.data;
  }

  /**
   * List conversations for current visitor
   */
  async list(): Promise<Conversation[]> {
    const response = await this.http.get<Conversation[]>(
      `/v1/widgets/${this.widgetId}/conversations`
    );
    return response.data;
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    options: GetMessagesOptions = {}
  ): Promise<MessagesResponse> {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.before) params.set('before', options.before);
    if (options.after) params.set('after', options.after);

    const queryString = params.toString();
    const path = `/v1/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;

    const response = await this.http.get<MessagesResponse>(path);
    return response.data;
  }

  /**
   * Send a message to conversation (non-streaming)
   */
  async sendMessage(
    agentId: string,
    conversationId: string,
    request: SendMessageRequest
  ): Promise<Message> {
    const response = await this.http.post<Message>(
      `/v1/agents/${agentId}/conversation/${conversationId}`,
      {
        message: request.content,
        attachments: request.attachments,
      }
    );
    return response.data;
  }

  /**
   * Send a message with streaming response
   */
  async *sendMessageStream(
    conversationId: string,
    request: SendMessageRequest,
    options?: { signal?: AbortSignal }
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const body = {
      model: 'default',
      messages: [
        {
          role: 'user' as const,
          content: request.content,
        },
      ],
      stream: true,
      conversation_id: conversationId,
      widget_id: this.widgetId,
    };

    yield* this.http.stream<StreamingChunk>(
      '/v2/gateway/chat/completions/stream',
      body,
      options
    );
  }

  /**
   * Close/archive a conversation
   */
  async close(conversationId: string): Promise<void> {
    await this.http.patch(`/v1/conversations/${conversationId}`, {
      status: 'closed',
    });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await this.http.post(`/v1/conversations/${conversationId}/read`);
  }
}
