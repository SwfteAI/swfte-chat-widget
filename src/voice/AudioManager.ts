/**
 * AudioManager - Browser audio handling for Voice SDK
 *
 * Handles:
 * - Audio playback with Web Audio API
 * - Microphone access and audio level monitoring
 * - Voice Activity Detection (VAD)
 * - Speech Recognition integration
 */

import type {
    AudioChunk,
    AudioPlaybackState,
    VADConfig,
    VADState,
    SpeechRecognitionResult,
} from './types';

export interface AudioManagerConfig {
    /** VAD configuration */
    vadConfig?: VADConfig;

    /** Enable speech recognition */
    enableSpeechRecognition?: boolean;

    /** Speech recognition language */
    language?: string;

    /** Callback when speech starts */
    onSpeechStart?: () => void;

    /** Callback when speech ends with transcript */
    onSpeechEnd?: (result: SpeechRecognitionResult) => void;

    /** Callback on interim transcript */
    onInterimTranscript?: (transcript: string) => void;

    /** Callback on audio level change */
    onAudioLevel?: (level: number) => void;

    /** Callback when interruption detected during playback */
    onInterruption?: (transcript: string) => void;

    /** Debug logging */
    debug?: boolean;
}

export class AudioManager {
    private config: Required<AudioManagerConfig>;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private mediaStream: MediaStream | null = null;
    private recognition: SpeechRecognition | null = null;

    // Playback state
    private audioQueue: AudioChunk[] = [];
    private isPlaying = false;
    private currentSource: AudioBufferSourceNode | null = null;
    private currentUtteranceId: string | null = null;
    private playbackProgress = 0;

    // VAD state
    private vadState: VADState = {
        isActive: false,
        isSpeaking: false,
        speechStartTime: null,
        currentLevel: 0,
    };
    private silenceTimeout: ReturnType<typeof setTimeout> | null = null;
    private vadMonitorFrame: number | null = null;

    constructor(config: AudioManagerConfig = {}) {
        this.config = {
            vadConfig: {
                speechThreshold: 0.02,
                silenceDurationMs: 1500,
                minSpeechDurationMs: 200,
                enableInterruptionDetection: true,
                ...config.vadConfig,
            },
            enableSpeechRecognition: config.enableSpeechRecognition ?? true,
            language: config.language ?? 'en-US',
            onSpeechStart: config.onSpeechStart ?? (() => {}),
            onSpeechEnd: config.onSpeechEnd ?? (() => {}),
            onInterimTranscript: config.onInterimTranscript ?? (() => {}),
            onAudioLevel: config.onAudioLevel ?? (() => {}),
            onInterruption: config.onInterruption ?? (() => {}),
            debug: config.debug ?? false,
        };
    }

    // ============================================
    // Initialization
    // ============================================

    /**
     * Initialize audio context and request microphone access.
     */
    async initialize(): Promise<void> {
        this.log('Initializing AudioManager');

        // Create audio context
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Resume if suspended (autoplay policy)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Request microphone access
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            // Set up analyser for VAD
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            this.analyser.smoothingTimeConstant = 0.8;
            source.connect(this.analyser);

            // Start VAD monitoring
            this.startVADMonitoring();

            this.log('Microphone access granted');
        } catch (error) {
            this.log('Microphone access denied:', error);
            throw new Error('Microphone access denied. Please allow microphone access.');
        }

        // Initialize speech recognition
        if (this.config.enableSpeechRecognition) {
            this.initializeSpeechRecognition();
        }
    }

    /**
     * Clean up resources.
     */
    destroy(): void {
        this.log('Destroying AudioManager');

        this.stopVADMonitoring();
        this.stopPlayback();
        this.stopRecognition();

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
    }

    // ============================================
    // Audio Playback
    // ============================================

    /**
     * Queue an audio chunk for playback.
     */
    queueAudioChunk(chunk: AudioChunk): void {
        this.audioQueue.push(chunk);
        this.log(`Queued audio chunk ${chunk.chunkIndex} (queue size: ${this.audioQueue.length})`);

        // Start playback if we have enough buffer
        if (!this.isPlaying && this.audioQueue.length >= 2) {
            this.startPlayback();
        }
    }

    /**
     * Start audio playback.
     */
    async startPlayback(): Promise<void> {
        if (this.isPlaying || this.audioQueue.length === 0) return;

        this.isPlaying = true;
        this.log('Starting audio playback');
        await this.playNextChunk();
    }

    /**
     * Stop audio playback and clear queue.
     */
    stopPlayback(): void {
        this.isPlaying = false;
        this.audioQueue = [];
        this.playbackProgress = 0;

        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {}
            this.currentSource = null;
        }

        this.currentUtteranceId = null;
        this.log('Stopped audio playback');
    }

    /**
     * Get current playback state.
     */
    getPlaybackState(): AudioPlaybackState {
        return {
            isPlaying: this.isPlaying,
            currentUtteranceId: this.currentUtteranceId,
            progress: this.playbackProgress,
            bufferedChunks: this.audioQueue.length,
        };
    }

    private async playNextChunk(): Promise<void> {
        if (!this.isPlaying || this.audioQueue.length === 0 || !this.audioContext) {
            this.isPlaying = false;
            this.log('Playback complete');
            return;
        }

        const chunk = this.audioQueue.shift()!;
        this.currentUtteranceId = chunk.utteranceId;
        this.playbackProgress = chunk.progress;

        try {
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(chunk.data.slice(0));

            // Create source and play
            this.currentSource = this.audioContext.createBufferSource();
            this.currentSource.buffer = audioBuffer;
            this.currentSource.connect(this.audioContext.destination);

            this.currentSource.onended = () => {
                this.playNextChunk();
            };

            this.currentSource.start(0);
            this.log(`Playing chunk ${chunk.chunkIndex}`);
        } catch (error) {
            this.log('Audio decode error:', error);
            // Try next chunk
            this.playNextChunk();
        }
    }

    // ============================================
    // Voice Activity Detection
    // ============================================

    private startVADMonitoring(): void {
        if (!this.analyser) return;

        this.vadState.isActive = true;
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const checkAudioLevel = () => {
            if (!this.vadState.isActive || !this.analyser) return;

            this.analyser.getByteFrequencyData(dataArray);

            // Calculate RMS
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / dataArray.length) / 255;
            this.vadState.currentLevel = rms;

            // Emit audio level
            this.config.onAudioLevel(rms);

            // VAD logic
            if (rms > this.config.vadConfig.speechThreshold!) {
                if (!this.vadState.isSpeaking) {
                    // Speech started
                    this.vadState.isSpeaking = true;
                    this.vadState.speechStartTime = Date.now();

                    // Clear any pending silence timeout
                    if (this.silenceTimeout) {
                        clearTimeout(this.silenceTimeout);
                        this.silenceTimeout = null;
                    }

                    this.log('Speech started');
                    this.config.onSpeechStart();

                    // Check for interruption during playback
                    if (this.isPlaying && this.config.vadConfig.enableInterruptionDetection) {
                        // Will get transcript from speech recognition
                    }
                }
            } else if (this.vadState.isSpeaking) {
                // Potential end of speech
                if (!this.silenceTimeout) {
                    this.silenceTimeout = setTimeout(() => {
                        this.vadState.isSpeaking = false;
                        this.silenceTimeout = null;
                        this.log('Speech ended (silence detected)');
                    }, this.config.vadConfig.silenceDurationMs!);
                }
            }

            this.vadMonitorFrame = requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
    }

    private stopVADMonitoring(): void {
        this.vadState.isActive = false;

        if (this.vadMonitorFrame) {
            cancelAnimationFrame(this.vadMonitorFrame);
            this.vadMonitorFrame = null;
        }

        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }

    /**
     * Get current VAD state.
     */
    getVADState(): VADState {
        return { ...this.vadState };
    }

    // ============================================
    // Speech Recognition
    // ============================================

    private initializeSpeechRecognition(): void {
        const SpeechRecognition = (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.log('Speech Recognition not supported');
            return;
        }

        const rec: SpeechRecognition = new SpeechRecognition();
        this.recognition = rec;
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = this.config.language;

        rec.onstart = () => {
            this.log('Speech recognition started');
        };

        rec.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;

                    // Emit speech end with final transcript
                    this.config.onSpeechEnd({
                        transcript: transcript.trim(),
                        confidence,
                        isFinal: true,
                    });

                    // Check for interruption during playback
                    if (this.isPlaying && this.config.vadConfig.enableInterruptionDetection) {
                        this.config.onInterruption(transcript.trim());
                    }
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                this.config.onInterimTranscript(interimTranscript);
            }
        };

        rec.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                this.log('Speech recognition error:', event.error);
            }
        };

        rec.onend = () => {
            this.log('Speech recognition ended');
            // Auto-restart if still active
            if (this.vadState.isActive) {
                setTimeout(() => {
                    try {
                        this.recognition?.start();
                    } catch (e) {
                        this.log('Failed to restart recognition:', e);
                    }
                }, 100);
            }
        };

        try {
            rec.start();
        } catch (e) {
            this.log('Failed to start recognition:', e);
        }
    }

    private stopRecognition(): void {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
            this.recognition = null;
        }
    }

    // ============================================
    // Utility
    // ============================================

    /**
     * Convert base64 string to ArrayBuffer.
     */
    static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log('[AudioManager]', ...args);
        }
    }
}
