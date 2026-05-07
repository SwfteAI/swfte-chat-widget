/**
 * Agents API Client
 */

import type { HttpClient } from './http';

export interface Agent {
  id: string;
  agentName: string;
  description?: string;
  systemPrompt?: string;
  greetingMessages?: string;
  model?: string;
  provider?: string;
  avatarType?: string;
  avatarConfig?: string;
  color?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentCapabilities {
  supportsStreaming: boolean;
  supportsFileUpload: boolean;
  supportsVoice: boolean;
  supportsImages: boolean;
  supportedModels: string[];
}

export class AgentsApi {
  constructor(private http: HttpClient) {}

  /**
   * Get agent by ID
   */
  async get(agentId: string): Promise<Agent> {
    const response = await this.http.get<Agent>(`/v1/agents/${agentId}`);
    return response.data;
  }

  /**
   * Get agent capabilities
   */
  async getCapabilities(agentId: string): Promise<AgentCapabilities> {
    const response = await this.http.get<AgentCapabilities>(
      `/v1/agents/${agentId}/capabilities`
    );
    return response.data;
  }

  /**
   * List available models for agent
   */
  async getModels(): Promise<{ models: string[] }> {
    const response = await this.http.get<{ models: string[] }>(
      '/v1/gateway/models'
    );
    return response.data;
  }
}
