/**
 * Swfte Voice SDK
 *
 * Real-time voice interaction with ChatFlows via WebSocket.
 *
 * @example
 * ```typescript
 * import { VoiceClient, AudioManager } from '@swfte/chat-widget/voice';
 *
 * // Create voice client
 * const client = new VoiceClient({
 *     baseUrl: 'ws://localhost:9999',
 *     chatFlowId: 'my-chatflow-id',
 *     workspaceId: 'my-workspace',
 *     voiceConfig: {
 *         voiceId: '21m00Tcm4TlvDq8ikWAM',
 *         voiceName: 'Rachel'
 *     }
 * });
 *
 * // Create audio manager
 * const audio = new AudioManager({
 *     onSpeechStart: () => client.speechStart(),
 *     onSpeechEnd: (result) => client.speechEnd(result.transcript, result.confidence),
 *     onInterruption: (transcript) => client.interrupt(transcript)
 * });
 *
 * // Handle audio chunks
 * client.on('audio_chunk', (chunk) => {
 *     audio.queueAudioChunk({
 *         ...chunk,
 *         data: AudioManager.base64ToArrayBuffer(chunk.data)
 *     });
 * });
 *
 * // Initialize and connect
 * await audio.initialize();
 * const session = await client.connect();
 * console.log('Session started:', session.voiceSessionId);
 * ```
 */

export { VoiceClient } from './VoiceClient';
export { AudioManager } from './AudioManager';
export type {
    // Config
    VoiceClientConfig,
    VoiceConfig,
    VADConfig,

    // Session
    VoiceSession,
    VoiceSessionState,

    // Messages
    ClientMessage,
    ServerMessage,
    AudioChunkMessage,
    AgentResponseMessage,
    StateChangeMessage,
    InterruptAckMessage,
    InterruptResponseMessage,
    ErrorMessage,

    // Events
    VoiceEventMap,
    VoiceEventHandler,

    // Audio
    AudioChunk,
    AudioPlaybackState,
    VADState,
    SpeechRecognitionResult,
} from './types';

