# API Reference

This page enumerates every public prop, method, and event in [`@swfte/chat-widget`](https://www.npmjs.com/package/@swfte/chat-widget). Use it as a lookup; for narrative guides see [getting-started.md](getting-started.md), [widget-types.md](widget-types.md), and the framework integrations under [docs/integrations/](integrations/).

## Top-level exports

```ts
import {
  // factories
  createSwfteChatClient,
  // classes
  SwfteChatClient,
  VoiceClient,
  // realtime
  StompClient,
  SSEClient,
  PresenceManager,
  // theming
  defaultTheme,
  darkTheme,
  minimalTheme,
  themePresets,
  createThemeFromConfig,
  mergeThemes,
  generateCSSVariables,
  // version
  VERSION,
} from '@swfte/chat-widget';
```

React-only:

```ts
import {
  ChatProvider,
  ChatWidget,
  EmbeddedChat,
  AISearch,
  useChat,
  useConversation,
  useChatStore,
  useChatClient,
} from '@swfte/chat-widget/react';
```

## `createSwfteChatClient(config)`

Returns a `SwfteChatClient` instance. The client is the entry point for everything — widgets, voice sessions, identity, theming.

```ts
const client = createSwfteChatClient({
  baseUrl:   'https://api.swfte.com/agents',
  widgetId:  'agent-123',
  apiKey?:   'sk-swfte-...',                // prefer proxy in production
  token?:    'eyJ...',                      // short-lived signed token
  getToken?: () => Promise<string>,         // refresh callback
  workspaceId?: 'ws_abc',
  visitorId?:   'visitor-uuid',             // override the auto-generated one
  persistSession?: true,                    // persist conversation across reloads
  storage?: 'localStorage' | 'sessionStorage' | 'memory',
});
```

### Methods

```ts
client.identify(user: UserInfo): void;
client.setContext(ctx: VisitorContext): void;
client.createWidget(opts: ChatWidgetOptions): WidgetInstance;
client.connect(): Promise<void>;
client.disconnect(): void;
client.isConnected(): boolean;
```

## `WidgetInstance`

Every call to `client.createWidget()` returns one of these:

```ts
interface WidgetInstance {
  mount(container: HTMLElement | string): void;
  unmount(): void;
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
  sendMessage(content: string): Promise<void>;
  clearHistory(): void;
  updateConfig(config: Partial<ChatWidgetOptions>): void;
  getMessages(): Message[];
  on<K extends keyof ChatEventMap>(event: K, handler: (payload: ChatEventMap[K]) => void): () => void;
  off<K extends keyof ChatEventMap>(event: K, handler: (payload: ChatEventMap[K]) => void): void;
  voice: VoiceController | null;
}
```

## `ChatWidgetOptions`

```ts
interface ChatWidgetOptions {
  // Type
  type?: 'bubble' | 'embedded' | 'search' | 'fullpage';     // default 'bubble'

  // Placement
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  container?: string | HTMLElement;
  zIndex?:    number;

  // Behaviour
  greeting?:        string;
  placeholder?:     string;
  openByDefault?:   boolean;
  autoOpenAfterMs?: number;
  persistChat?:     boolean;
  hotkey?:          string;          // search modal only
  bubbleIcon?:      string;          // bubble only

  // Capabilities
  attachments?: boolean;             // file uploads (default: true)
  voice?:       VoiceConfig;         // see voice.md
  showCitations?:    boolean;
  showAvatar?:       boolean;
  showHeader?:       boolean;
  showSidebar?:      boolean;        // fullpage only
  maxResults?:       number;         // search only

  // Appearance
  theme?: ChatTheme | 'light' | 'dark' | 'auto';

  // Identity
  user?:    UserInfo;
  context?: VisitorContext;

  // Sizing
  width?:  string | number;
  height?: string | number;

  // Callbacks (also exposed via .on())
  onReady?:       () => void;
  onOpen?:        () => void;
  onClose?:       () => void;
  onMessageSent?: (msg: Message) => void;
  onMessageRecv?: (msg: Message) => void;
  onError?:       (err: Error) => void;
  onVoiceStart?:  (s: VoiceSession) => void;
  onVoiceStop?:   (durationMs: number) => void;
  onTranscript?:  (t: { role: 'user' | 'agent'; text: string; isFinal: boolean }) => void;
}
```

## `Message`

```ts
interface Message {
  id:            string;
  role:          'user' | 'agent' | 'system';
  content:       string;
  attachments?:  Attachment[];
  citations?:    Citation[];
  toolCalls?:    ToolCall[];
  metadata?:     MessageMetadata;
  createdAt:     string;             // ISO-8601
  status:        'pending' | 'streaming' | 'complete' | 'error';
}
```

## Events (`widget.on(...)`)

| Event | Payload | When |
|---|---|---|
| `ready`           | `void`            | Client connected, widget mounted |
| `open`            | `void`            | Panel opened |
| `close`           | `void`            | Panel closed |
| `message:sent`    | `Message`         | Outgoing message persisted |
| `message:recv`    | `Message`         | Incoming agent message persisted |
| `message:stream`  | `StreamingChunk`  | Per-token stream chunk |
| `error`           | `Error`           | Any error during the session |
| `connect`         | `void`            | Realtime channel connected |
| `disconnect`      | `void`            | Realtime channel disconnected |
| `voice:connect`   | `{ sessionId }`   | Voice session opened |
| `voice:start`     | `{ sessionId }`   | Mic capture started |
| `voice:stop`      | `{ durationMs }`  | Mic capture stopped |
| `voice:transcript`| `{ role, text, isFinal }` | STT result |
| `voice:agent-speak`| `{ text }`       | Agent began TTS |
| `voice:disconnect`| `{ reason }`      | Voice session ended |

`on()` returns an unsubscribe function:

```ts
const off = widget.on('message:recv', (msg) => console.log(msg));
off();   // remove listener
```

## React component props

### `<ChatProvider>`

```ts
interface ChatProviderProps {
  config: SwfteChatConfig;            // same shape as createSwfteChatClient
  children: ReactNode;
}
```

### `<ChatWidget>`

Accepts every key of `ChatWidgetOptions` as a prop, plus the standard React event-callback props (`onOpen`, `onClose`, `onMessageSent`, `onError`, etc.).

### `<EmbeddedChat>`

```ts
interface EmbeddedChatProps {
  height?:       string;
  width?:        string;
  conversationId?: string;
  welcomeMessage?: string;
  showHeader?:   boolean;
  theme?:        ChatTheme | 'light' | 'dark' | 'auto';
}
```

### `<AISearch>`

```ts
interface AISearchProps {
  placeholder?:    string;
  hotkey?:         string;
  showCitations?:  boolean;
  maxResults?:     number;
  onResultClick?:  (result: { url: string; title: string }) => void;
  onClose?:        () => void;
  theme?:          ChatTheme | 'light' | 'dark' | 'auto';
}
```

## Hooks

### `useChat()`

```ts
const {
  messages,                   // Message[]
  sendMessage,                // (content: string) => Promise<void>
  isStreaming,                // boolean
  clearHistory,               // () => void
} = useChat();
```

### `useConversation()`

```ts
const {
  conversations,              // Conversation[]
  activeId,                   // string | null
  setActiveId,                // (id: string) => void
  createConversation,         // () => Promise<Conversation>
  deleteConversation,         // (id: string) => Promise<void>
} = useConversation();
```

### `useChatClient()`

Returns the underlying `SwfteChatClient` for imperative use.

### `useChatStore(selector)`

Low-level Zustand-style selector hook over the entire chat state tree. Use when you need a slice the higher-level hooks don't expose.

## `VoiceClient`

See [docs/voice.md](voice.md) for the full voice API.

## HTTP layer (`HttpClient`)

```ts
import { HttpClient } from '@swfte/chat-widget';

const http = new HttpClient({
  baseUrl: 'https://api.swfte.com/agents',
  apiKey:  'sk-swfte-...',
});

const conversations = await http.get('/v2/conversations');
```

`HttpError` is thrown with `status`, `body`, and `headers` set.

## Versioning

`VERSION` is exported as a runtime string:

```ts
import { VERSION } from '@swfte/chat-widget';
console.log('chat widget', VERSION);
```

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
