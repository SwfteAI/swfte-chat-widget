/**
 * useVoiceChat Hook — High-level React hook for voice chat sessions.
 *
 * Combines VoiceClient and AudioManager into a single interface that
 * manages the full voice chat lifecycle: connect, listen, process, speak.
 *
 * @example
 * ```tsx
 * function VoiceUI() {
 *   const voice = useVoiceChat({
 *     chatFlowId: 'my-flow',
 *     workspaceId: 'ws-123',
 *     voiceConfig: { voiceId: '...', language: 'en-US' },
 *   });
 *
 *   return (
 *     <div>
 *       <p>State: {voice.voiceState}</p>
 *       <button onClick={voice.connect}>Connect</button>
 *       <button onClick={voice.disconnect}>Disconnect</button>
 *       {voice.messages.map((m) => <p key={m.id}>{m.text}</p>)}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceClient } from '../../src/voice/VoiceClient';
import { AudioManager } from '../../src/voice/AudioManager';
import type {
  VoiceConfig,
  VoiceSessionState,
  VoiceSession,
} from '../../src/voice/types';

export interface UseVoiceChatConfig {
  /** WebSocket base URL for voice server */
  baseUrl: string;
  /** ChatFlow ID to bind the session to */
  chatFlowId: string;
  /** Workspace ID */
  workspaceId: string;
  /** Optional voice configuration */
  voiceConfig?: Partial<VoiceConfig>;
  /** Enable browser speech recognition. Default: true */
  enableSpeechRecognition?: boolean;
  /** Enable debug logging. Default: false */
  debug?: boolean;
}

export interface VoiceChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface UseVoiceChatReturn {
  /** Connect to the voice server */
  connect: () => Promise<VoiceSession | null>;
  /** Disconnect from the voice server */
  disconnect: () => void;
  /** Whether currently connected */
  isConnected: boolean;
  /** Current voice session state */
  voiceState: VoiceSessionState;
  /** Current session info */
  session: VoiceSession | null;
  /** Conversation messages */
  messages: VoiceChatMessage[];
  /** Current interim transcript (user speaking) */
  transcript: string;
  /** Any error that occurred */
  error: Error | null;
}

export function useVoiceChat(config: UseVoiceChatConfig): UseVoiceChatReturn {
  const {
    baseUrl,
    chatFlowId,
    workspaceId,
    voiceConfig,
    enableSpeechRecognition = true,
    debug = false,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceSessionState>('disconnected');
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const voiceClientRef = useRef<VoiceClient | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const messageIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    if (!mountedRef.current) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${++messageIdRef.current}`,
        role,
        text,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const connect = useCallback(async (): Promise<VoiceSession | null> => {
    try {
      setError(null);

      // Create VoiceClient
      const client = new VoiceClient({
        baseUrl,
        chatFlowId,
        workspaceId,
        voiceConfig: voiceConfig || {},
        debug,
      });

      // Set up event handlers
      client.on('state_change', (data: any) => {
        if (mountedRef.current) setVoiceState(data.state);
      });

      client.on('connected', () => {
        if (mountedRef.current) setIsConnected(true);
      });

      client.on('disconnected', () => {
        if (mountedRef.current) setIsConnected(false);
      });

      client.on('session_start', (sessionData: any) => {
        if (mountedRef.current) setSession(sessionData);
      });

      client.on('agent_response', (msg: any) => {
        addMessage('assistant', msg.text || msg.content || '');
      });

      client.on('audio_chunk', (chunk: any) => {
        if (audioManagerRef.current) {
          const buffer = AudioManager.base64ToArrayBuffer(chunk.data);
          audioManagerRef.current.queueAudioChunk({
            utteranceId: chunk.utteranceId,
            chunkIndex: chunk.chunkIndex,
            data: buffer,
            format: chunk.format || 'mp3',
            progress: chunk.progress || 0,
            isLast: chunk.isLast || false,
          });
        }
      });

      client.on('error', (err: any) => {
        if (mountedRef.current) setError(new Error(err.message || 'Voice error'));
      });

      voiceClientRef.current = client;

      // Create AudioManager
      const audio = new AudioManager({
        enableSpeechRecognition,
        language: voiceConfig?.language || 'en-US',
        onSpeechStart: () => {
          client.speechStart();
        },
        onSpeechEnd: (result: any) => {
          const text = result?.transcript || '';
          if (text) {
            addMessage('user', text);
            client.speechEnd(text, result?.confidence || 0.9);
          }
          if (mountedRef.current) setTranscript('');
        },
        onInterimTranscript: (text: string) => {
          if (mountedRef.current) setTranscript(text);
        },
        onInterruption: (interruptTranscript: string) => {
          client.interrupt(interruptTranscript);
        },
        debug,
      });

      await audio.initialize();
      audioManagerRef.current = audio;

      // Connect voice client
      const voiceSession = await client.connect();
      return voiceSession;
    } catch (err) {
      const connectError = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) setError(connectError);
      return null;
    }
  }, [baseUrl, chatFlowId, workspaceId, voiceConfig, enableSpeechRecognition, debug, addMessage]);

  const disconnect = useCallback(() => {
    if (voiceClientRef.current) {
      voiceClientRef.current.disconnect('user_ended');
      voiceClientRef.current = null;
    }
    if (audioManagerRef.current) {
      audioManagerRef.current.destroy();
      audioManagerRef.current = null;
    }
    if (mountedRef.current) {
      setIsConnected(false);
      setVoiceState('disconnected');
      setSession(null);
    }
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    voiceState,
    session,
    messages,
    transcript,
    error,
  };
}
