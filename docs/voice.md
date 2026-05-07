# Voice

The widget can connect to a [Swfte](https://www.swfte.com) [voice ChatFlow](https://www.swfte.com/products/voice) so visitors can talk to your agent in real time — push-to-talk or always-on, low latency, sub-500 ms time-to-first-byte.

> Voice is opt-in. The default widget is text-only.

## Prerequisites

1. A deployed voice [ChatFlow](https://www.swfte.com/products/chatflows) in your workspace. Build one in `Dashboard → ChatFlows → New → Voice` or via the [`POST /v2/chatflows`](https://www.swfte.com/developers) endpoint.
2. The widget needs `getUserMedia` access — that requires HTTPS (or `localhost`) and a user gesture before the first `start()` call.
3. Your Content-Security-Policy must allow `media-src` and `connect-src` to `wss://api.swfte.com`.

## Wiring

```ts
import { createSwfteChatClient, VoiceClient } from '@swfte/chat-widget';

const client = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'chatflow-456',                  // a voice chatflow ID
});

const widget = client.createWidget({
  position: 'bottom-right',
  voice: {
    enabled: true,
    chatFlowId: 'chatflow-456',
    mode: 'push-to-talk',                    // 'push-to-talk' | 'always-on'
    showTranscripts: true,
    consent: {
      required: true,
      message: 'This call may be recorded for quality. Continue?',
    },
  },
});

widget.mount(document.body);
```

The widget renders a microphone button next to the text input. Click-and-hold (or click-toggle in `always-on` mode) to start streaming audio.

## React

```tsx
import { ChatWidget } from '@swfte/chat-widget/react';

<ChatWidget
  position="bottom-right"
  voice={{
    enabled: true,
    chatFlowId: 'chatflow-456',
    mode: 'always-on',
  }}
  onVoiceStart={() => console.log('voice session started')}
  onVoiceStop={(durationMs) => console.log('voice session ended', durationMs)}
  onTranscript={(t) => console.log('transcript', t)}
/>
```

## Standalone `VoiceClient`

If you want the voice pipeline without the chat UI (e.g. as a button in your existing UI), use the `VoiceClient` directly:

```ts
import { VoiceClient } from '@swfte/chat-widget';

const voice = new VoiceClient({
  baseUrl: 'https://api.swfte.com/agents',
  chatFlowId: 'chatflow-456',
  apiKey: 'sk-swfte-...',           // proxy in production
});

await voice.connect();

document.getElementById('mic').addEventListener('mousedown', () => voice.start());
document.getElementById('mic').addEventListener('mouseup',   () => voice.stop());

voice.on('transcript', (t) => console.log(t));
voice.on('audio',      (frame) => console.log('agent audio frame', frame.byteLength));
voice.on('error',      (err) => console.error(err));
```

## Events

| Event | Payload | When |
|---|---|---|
| `voice:connect`     | `{ sessionId }` | WebRTC peer connection established |
| `voice:start`       | `{ sessionId }` | User mic capture started |
| `voice:stop`        | `{ durationMs }` | User mic capture stopped |
| `voice:transcript`  | `{ role, text, isFinal }` | STT result (per-utterance) |
| `voice:agent-speak` | `{ text }` | Agent began TTS playback |
| `voice:disconnect`  | `{ reason }` | Session ended |
| `voice:error`       | `Error`         | Any error during the session |

## Consent disclosure

Voice ChatFlows automatically prepend a recording-consent disclosure when the channel is `VOICE`. Continuing past the disclosure counts as consent. You can override the disclosure text per-chatflow in the dashboard, or per-mount via `voice.consent.message`.

## Recording & transcripts

When `recording: true` is set on the chatflow (default for voice flows), every session is persisted with:

- **Recording** (mp3) — fetch via [`GET /v2/conversations/{id}/recording`](https://www.swfte.com/developers).
- **Transcript** (JSON) — fetch via [`GET /v2/conversations/{id}/transcript`](https://www.swfte.com/developers).
- **Audit events** — every action queryable via [`/v2/audit`](https://www.swfte.com/developers).

## Mute, hold, end

```ts
widget.voice.mute();      // local mic mute
widget.voice.unmute();
widget.voice.hold();      // pause audio in both directions
widget.voice.resume();
widget.voice.end();       // gracefully tear down the session
```

## Browser support

Voice requires WebRTC. All modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+) work. Safari on iOS requires the user to interact with the page before `getUserMedia` will resolve.

## Cost

Voice traffic is billed per-second of streaming audio, plus the underlying LLM tokens. See [swfte.com/pricing](https://www.swfte.com/pricing).

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
