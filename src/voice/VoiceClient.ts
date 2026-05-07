/**
 * VoiceClient - WebSocket client for Swfte Voice Sessions
 *
 * Handles WebSocket connection, session lifecycle, and message routing.
 *
 * @example
 * ```typescript
 * const client = new VoiceClient({
 *     baseUrl: 'ws://localhost:9999',
 *     chatFlowId: 'my-chatflow-id',
 *     workspaceId: 'my-workspace',
 *     voiceConfig: {
 *         voiceId: '21m00Tcm4TlvDq8ikWAM',
 *         voiceName: 'Rachel',
 *         speakingSpeed: 1.0
 *     }
 * });
 *
 * client.on('session_start', (session) => {
 *     console.log('Session started:', session.voiceSessionId);
 * });
 *
 * await client.connect();
 * ```
 */

import type {
    VoiceClientConfig,
    VoiceConfig,
    VoiceSession,
    VoiceSessionState,
    VoiceEventMap,
    VoiceEventHandler,
    ClientMessage,
    ServerMessage,
    AudioChunkMessage,
    AgentResponseMessage,
} from './types';

export class VoiceClient {
    private config: Required<VoiceClientConfig>;
    private ws: WebSocket | null = null;
    private session: VoiceSession | null = null;
    private state: VoiceSessionState = 'disconnected';
    private reconnectAttempts = 0;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private pingInterval: ReturnType<typeof setInterval> | null = null;
    private lastPingTime = 0;
    private eventHandlers: Map<keyof VoiceEventMap, Set<VoiceEventHandler<any>>> = new Map();

    constructor(config: VoiceClientConfig) {
        this.config = {
            baseUrl: config.baseUrl,
            chatFlowId: config.chatFlowId,
            workspaceId: config.workspaceId,
            voiceConfig: config.voiceConfig || {},
            autoReconnect: config.autoReconnect ?? true,
            maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
            reconnectDelayMs: config.reconnectDelayMs ?? 2000,
            debug: config.debug ?? false,
        };
    }

    // ============================================
    // Public API
    // ============================================

    /**
     * Connect to the Voice WebSocket server.
     * Returns a promise that resolves when the session is started.
     */
    async connect(): Promise<VoiceSession> {
        return new Promise((resolve, reject) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                if (this.session) {
                    resolve(this.session);
                    return;
                }
            }

            this.updateState('connecting');
            const wsUrl = `${this.config.baseUrl}/ws/voice`;
            this.log('Connecting to', wsUrl);

            try {
                this.ws = new WebSocket(wsUrl);

                const connectionTimeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                    this.ws?.close();
                }, 10000);

                this.ws.onopen = () => {
                    clearTimeout(connectionTimeout);
                    this.log('WebSocket connected');
                    this.emit('connected', undefined);
                    this.startPingPong();

                    // Send session_start to create voice session
                    this.sendSessionStart();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data, resolve, reject);
                };

                this.ws.onerror = (error) => {
                    this.log('WebSocket error:', error);
                    clearTimeout(connectionTimeout);
                };

                this.ws.onclose = (event) => {
                    this.log('WebSocket closed:', event.code, event.reason);
                    this.stopPingPong();
                    this.updateState('disconnected');

                    const willReconnect = this.config.autoReconnect &&
                        this.reconnectAttempts < this.config.maxReconnectAttempts;

                    this.emit('disconnected', {
                        reason: event.reason || 'Connection closed',
                        willReconnect
                    });

                    if (willReconnect && !this.session) {
                        this.scheduleReconnect();
                    }

                    if (!this.session) {
                        reject(new Error(event.reason || 'Connection closed'));
                    }
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from the server.
     */
    disconnect(reason = 'user_requested'): void {
        this.log('Disconnecting:', reason);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({
                type: 'session_end',
                timestamp: Date.now(),
                reason
            });
        }

        this.cleanup();
    }

    /**
     * Send speech_start when user begins speaking.
     */
    speechStart(): void {
        this.send({
            type: 'speech_start',
            timestamp: Date.now()
        });
        this.emit('speech_start', undefined);
    }

    /**
     * Send speech_end with transcript when user finishes speaking.
     */
    speechEnd(transcript: string, confidence = 0.9): void {
        this.send({
            type: 'speech_end',
            timestamp: Date.now(),
            transcript,
            confidence,
            isFinal: true
        });
        this.emit('speech_end', { transcript, confidence });
    }

    /**
     * Send interrupt when user interrupts agent speech.
     */
    interrupt(transcript?: string, playbackProgress?: number): void {
        this.send({
            type: 'interrupt',
            timestamp: Date.now(),
            transcript,
            playbackProgress,
            reason: 'user_initiated'
        });
    }

    /**
     * Send playback progress update.
     */
    playbackProgress(utteranceId: string, progress: number, chunkIndex: number): void {
        this.send({
            type: 'playback_progress',
            timestamp: Date.now(),
            utteranceId,
            progress,
            chunkIndex
        });
    }

    /**
     * Send playback complete notification.
     */
    playbackComplete(utteranceId: string): void {
        this.send({
            type: 'playback_complete',
            timestamp: Date.now(),
            utteranceId
        });
    }

    /**
     * Get current session.
     */
    getSession(): VoiceSession | null {
        return this.session;
    }

    /**
     * Get current state.
     */
    getState(): VoiceSessionState {
        return this.state;
    }

    /**
     * Check if connected.
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // ============================================
    // Event Handling
    // ============================================

    /**
     * Subscribe to an event.
     */
    on<K extends keyof VoiceEventMap>(event: K, handler: VoiceEventHandler<K>): () => void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);

        // Return unsubscribe function
        return () => {
            this.eventHandlers.get(event)?.delete(handler);
        };
    }

    /**
     * Unsubscribe from an event.
     */
    off<K extends keyof VoiceEventMap>(event: K, handler: VoiceEventHandler<K>): void {
        this.eventHandlers.get(event)?.delete(handler);
    }

    private emit<K extends keyof VoiceEventMap>(event: K, data: VoiceEventMap[K]): void {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // ============================================
    // Private Methods
    // ============================================

    private sendSessionStart(): void {
        this.send({
            type: 'session_start',
            timestamp: Date.now(),
            chatFlowId: this.config.chatFlowId,
            workspaceId: this.config.workspaceId,
            voiceConfig: this.config.voiceConfig
        });
    }

    private send(message: ClientMessage): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.log('Cannot send: WebSocket not connected');
            return;
        }

        const payload = JSON.stringify(message);
        this.log('Sending:', message.type);
        this.ws.send(payload);
    }

    private handleMessage(
        data: string,
        connectResolve?: (session: VoiceSession) => void,
        connectReject?: (error: Error) => void
    ): void {
        try {
            const message = JSON.parse(data) as ServerMessage;
            this.log('Received:', message.type);

            switch (message.type) {
                case 'session_start':
                    this.handleSessionStart(message, connectResolve);
                    break;

                case 'session_end':
                    this.handleSessionEnd(message);
                    break;

                case 'pong':
                    this.handlePong(message);
                    break;

                case 'audio_chunk':
                    this.emit('audio_chunk', message as AudioChunkMessage);
                    break;

                case 'agent_response':
                    this.emit('agent_response', message as AgentResponseMessage);
                    break;

                case 'state_change':
                    this.updateState(message.state);
                    this.emit('state_change', {
                        state: message.state,
                        reason: message.reason
                    });
                    break;

                case 'interrupt_ack':
                    this.emit('interrupt_ack', message);
                    break;

                case 'interrupt_response':
                    this.emit('interrupt_response', message);
                    break;

                case 'error':
                    this.handleError(message, connectReject);
                    break;

                default:
                    this.log('Unknown message type:', (message as any).type);
            }
        } catch (error) {
            this.log('Failed to parse message:', error);
        }
    }

    private handleSessionStart(
        message: ServerMessage & { type: 'session_start' },
        resolve?: (session: VoiceSession) => void
    ): void {
        this.session = {
            voiceSessionId: message.voiceSessionId,
            chatFlowSessionId: message.chatFlowSessionId,
            chatFlowId: message.chatFlowId,
            workspaceId: message.workspaceId,
            state: 'connected',
            voiceConfig: message.voiceConfig,
            createdAt: new Date(),
            greetingMessage: message.greetingMessage
        };

        this.updateState('connected');
        this.reconnectAttempts = 0;

        this.emit('session_start', this.session);
        resolve?.(this.session);
    }

    private handleSessionEnd(message: ServerMessage & { type: 'session_end' }): void {
        this.emit('session_end', {
            reason: message.reason,
            summary: message.summary
        });
        this.cleanup();
    }

    private handlePong(message: ServerMessage & { type: 'pong' }): void {
        const latencyMs = Date.now() - this.lastPingTime;
        this.emit('pong', { latencyMs });
    }

    private handleError(
        message: ServerMessage & { type: 'error' },
        reject?: (error: Error) => void
    ): void {
        this.log('Server error:', message.code, message.message);
        this.updateState('error');
        this.emit('error', {
            code: message.code,
            message: message.message
        });

        reject?.(new Error(`${message.code}: ${message.message}`));
    }

    private updateState(state: VoiceSessionState): void {
        if (this.state !== state) {
            this.log('State change:', this.state, '->', state);
            this.state = state;
            if (this.session) {
                this.session.state = state;
            }
        }
    }

    private startPingPong(): void {
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.lastPingTime = Date.now();
                this.send({
                    type: 'ping',
                    timestamp: this.lastPingTime
                });
            }
        }, 30000);
    }

    private stopPingPong(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectAttempts++;
        const delay = this.config.reconnectDelayMs * this.reconnectAttempts;

        this.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        this.reconnectTimeout = setTimeout(() => {
            this.connect().catch(error => {
                this.log('Reconnect failed:', error);
            });
        }, delay);
    }

    private cleanup(): void {
        this.stopPingPong();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.session = null;
        this.updateState('disconnected');
    }

    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log('[VoiceClient]', ...args);
        }
    }
}
