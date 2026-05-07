/**
 * Voice SDK Types
 *
 * Type definitions for the Swfte Voice WebSocket SDK.
 */

// ============================================
// Configuration Types
// ============================================

export interface VoiceClientConfig {
    /** WebSocket base URL (e.g., ws://localhost:9999) */
    baseUrl: string;

    /** ChatFlow ID to execute */
    chatFlowId: string;

    /** Workspace ID */
    workspaceId: string;

    /** Voice configuration */
    voiceConfig?: VoiceConfig;

    /** Auto-reconnect on disconnect */
    autoReconnect?: boolean;

    /** Max reconnect attempts */
    maxReconnectAttempts?: number;

    /** Reconnect delay in ms */
    reconnectDelayMs?: number;

    /** Enable debug logging */
    debug?: boolean;
}

export interface VoiceConfig {
    /** ElevenLabs voice ID */
    voiceId?: string;

    /** Voice name for display */
    voiceName?: string;

    /** Speaking speed (0.5-2.0, default 1.0) */
    speakingSpeed?: number;

    /** Language code (e.g., en-US) */
    language?: string;

    /** Use SSML audio tags */
    useAudioTags?: boolean;

    /** TTS model ID */
    ttsModelId?: string;

    /** Enable interruption detection */
    enableInterruption?: boolean;
}

// ============================================
// Session State Types
// ============================================

export type VoiceSessionState =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'listening'
    | 'processing'
    | 'speaking'
    | 'interrupted'
    | 'error'
    | 'terminated';

export interface VoiceSession {
    voiceSessionId: string;
    chatFlowSessionId: string;
    chatFlowId: string;
    workspaceId: string;
    state: VoiceSessionState;
    voiceConfig?: VoiceConfig;
    createdAt: Date;
    greetingMessage?: string;
}

// ============================================
// Message Types (Client → Server)
// ============================================

export interface BaseMessage {
    type: string;
    timestamp: number;
}

export interface SessionStartMessage extends BaseMessage {
    type: 'session_start';
    chatFlowId: string;
    workspaceId: string;
    voiceConfig?: VoiceConfig;
}

export interface SessionEndMessage extends BaseMessage {
    type: 'session_end';
    reason?: string;
}

export interface PingMessage extends BaseMessage {
    type: 'ping';
}

export interface SpeechStartMessage extends BaseMessage {
    type: 'speech_start';
}

export interface SpeechEndMessage extends BaseMessage {
    type: 'speech_end';
    transcript: string;
    confidence?: number;
    isFinal?: boolean;
    duration?: number;
}

export interface InterruptMessage extends BaseMessage {
    type: 'interrupt';
    transcript?: string;
    playbackProgress?: number;
    reason?: string;
}

export interface PlaybackProgressMessage extends BaseMessage {
    type: 'playback_progress';
    utteranceId: string;
    progress: number;
    chunkIndex: number;
}

export interface PlaybackCompleteMessage extends BaseMessage {
    type: 'playback_complete';
    utteranceId: string;
}

export type ClientMessage =
    | SessionStartMessage
    | SessionEndMessage
    | PingMessage
    | SpeechStartMessage
    | SpeechEndMessage
    | InterruptMessage
    | PlaybackProgressMessage
    | PlaybackCompleteMessage;

// ============================================
// Message Types (Server → Client)
// ============================================

export interface ServerSessionStartMessage {
    type: 'session_start';
    voiceSessionId: string;
    chatFlowSessionId: string;
    chatFlowId: string;
    workspaceId: string;
    voiceConfig?: VoiceConfig;
    greetingMessage?: string;
    timeoutSeconds?: number;
}

export interface ServerSessionEndMessage {
    type: 'session_end';
    reason: string;
    summary?: Record<string, any>;
}

export interface PongMessage {
    type: 'pong';
    timestamp: number;
}

export interface AudioChunkMessage {
    type: 'audio_chunk';
    utteranceId: string;
    chunkIndex: number;
    data: string; // base64 encoded audio
    format: 'mp3' | 'pcm' | 'wav';
    progress: number;
    isLast: boolean;
}

export interface AgentResponseMessage {
    type: 'agent_response';
    text: string;
    ttsText?: string;
    currentFieldId?: string;
    isComplete?: boolean;
    collectedData?: Record<string, any>;
}

export interface StateChangeMessage {
    type: 'state_change';
    state: VoiceSessionState;
    reason?: string;
}

export interface InterruptAckMessage {
    type: 'interrupt_ack';
    timestamp: number;
}

export interface InterruptResponseMessage {
    type: 'interrupt_response';
    interruptionType: string;
    text: string;
    ttsText?: string;
    shouldYieldFloor: boolean;
}

export interface ErrorMessage {
    type: 'error';
    code: string;
    message: string;
    details?: Record<string, any>;
}

export type ServerMessage =
    | ServerSessionStartMessage
    | ServerSessionEndMessage
    | PongMessage
    | AudioChunkMessage
    | AgentResponseMessage
    | StateChangeMessage
    | InterruptAckMessage
    | InterruptResponseMessage
    | ErrorMessage;

// ============================================
// Event Types
// ============================================

export interface VoiceEventMap {
    'connected': void;
    'disconnected': { reason: string; willReconnect: boolean };
    'session_start': VoiceSession;
    'session_end': { reason: string; summary?: Record<string, any> };
    'state_change': { state: VoiceSessionState; reason?: string };
    'audio_chunk': AudioChunkMessage;
    'agent_response': AgentResponseMessage;
    'interrupt_ack': InterruptAckMessage;
    'interrupt_response': InterruptResponseMessage;
    'error': { code: string; message: string };
    'speech_start': void;
    'speech_end': { transcript: string; confidence?: number };
    'pong': { latencyMs: number };
}

export type VoiceEventHandler<K extends keyof VoiceEventMap> = (data: VoiceEventMap[K]) => void;

// ============================================
// Audio Types
// ============================================

export interface AudioChunk {
    utteranceId: string;
    chunkIndex: number;
    data: ArrayBuffer;
    format: 'mp3' | 'pcm' | 'wav';
    progress: number;
    isLast: boolean;
}

export interface AudioPlaybackState {
    isPlaying: boolean;
    currentUtteranceId: string | null;
    progress: number;
    bufferedChunks: number;
}

export interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

// ============================================
// VAD (Voice Activity Detection) Types
// ============================================

export interface VADConfig {
    /** Speech detection threshold (0.0-1.0) */
    speechThreshold?: number;

    /** Silence duration to end speech (ms) */
    silenceDurationMs?: number;

    /** Minimum speech duration to register (ms) */
    minSpeechDurationMs?: number;

    /** Enable interruption detection during playback */
    enableInterruptionDetection?: boolean;
}

export interface VADState {
    isActive: boolean;
    isSpeaking: boolean;
    speechStartTime: number | null;
    currentLevel: number;
}
