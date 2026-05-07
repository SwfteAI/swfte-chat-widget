# React

The [`@swfte/chat-widget/react`](https://www.npmjs.com/package/@swfte/chat-widget) entrypoint exports first-class React components and hooks for the [Swfte](https://www.swfte.com) chat widget. They work with React 17, 18, and 19.

## Install

```bash
npm install @swfte/chat-widget
```

The React subpath is exported via the package's `exports` map — there's no separate package to install.

## Provider + widget

Wrap your app (or a subtree) in `<ChatProvider>` and drop a `<ChatWidget>` anywhere inside:

```tsx
import { ChatProvider, ChatWidget } from '@swfte/chat-widget/react';

export function App() {
  return (
    <ChatProvider config={{
      baseUrl: 'https://api.swfte.com/agents',
      widgetId: 'agent-123',
    }}>
      <YourRoutes />
      <ChatWidget position="bottom-right" />
    </ChatProvider>
  );
}
```

`ChatProvider` owns the singleton client, the message store, and the WebSocket / SSE realtime connections. Multiple widgets inside the same provider share state — open the bubble in two tabs and they stay in sync.

## Embedded panel

```tsx
import { EmbeddedChat } from '@swfte/chat-widget/react';

export function SupportPage() {
  return (
    <main>
      <h1>Support</h1>
      <EmbeddedChat
        height="600px"
        welcomeMessage="Welcome — what can we help with?"
      />
    </main>
  );
}
```

## Search modal (command palette)

```tsx
import { useState } from 'react';
import { AISearch } from '@swfte/chat-widget/react';

export function DocsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Search docs… ⌘K</button>
      {open && (
        <AISearch
          placeholder="Search documentation..."
          showCitations
          onClose={() => setOpen(false)}
          onResultClick={(result) => {
            window.location.href = result.url;
          }}
        />
      )}
    </>
  );
}
```

The `AISearch` component also accepts a `hotkey` prop — set `hotkey="cmd+k"` and it registers a global keyboard listener.

## Hooks

### `useChat`

```tsx
import { useChat } from '@swfte/chat-widget/react';

function ChatComposer() {
  const { messages, sendMessage, isStreaming } = useChat();

  return (
    <div>
      {messages.map((m) => <p key={m.id}>{m.role}: {m.content}</p>)}
      <button disabled={isStreaming} onClick={() => sendMessage('Hello')}>
        Send
      </button>
    </div>
  );
}
```

### `useConversation`

```tsx
import { useConversation } from '@swfte/chat-widget/react';

function ConversationSidebar() {
  const { conversations, activeId, setActiveId, createConversation } =
    useConversation();

  return (
    <ul>
      {conversations.map((c) => (
        <li key={c.id} onClick={() => setActiveId(c.id)}>
          {c.title ?? c.id} {c.id === activeId && '(active)'}
        </li>
      ))}
      <button onClick={() => createConversation()}>New chat</button>
    </ul>
  );
}
```

### `useChatStore`

The lower-level store hook that drives `useChat` and `useConversation`. Use it when you need a slice of state the higher-level hooks don't expose.

```tsx
import { useChatStore } from '@swfte/chat-widget/react';

const isConnected = useChatStore((s) => s.realtime.connected);
```

## Typed events

```tsx
<ChatWidget
  position="bottom-right"
  onOpen={() => analytics.track('chat_opened')}
  onClose={() => analytics.track('chat_closed')}
  onMessageSent={(msg) => analytics.track('chat_message', { len: msg.content.length })}
  onError={(err) => Sentry.captureException(err)}
/>
```

## Identifying the user

```tsx
import { useChatClient } from '@swfte/chat-widget/react';

function IdentifyOnLogin({ user }) {
  const client = useChatClient();

  useEffect(() => {
    if (user) {
      client.identify({
        id: user.id,
        email: user.email,
        name: user.name,
        metadata: { plan: user.plan },
      });
    }
  }, [client, user]);

  return null;
}
```

## SSR / hydration

`ChatProvider` is safe to render on the server — it lazily creates the realtime connection on the client. If you're rendering inside a non-window environment (Next.js Server Components, Remix loaders), keep the widget components inside a `'use client'` boundary or load them with `next/dynamic({ ssr: false })`. See [docs/integrations/nextjs.md](nextjs.md) and [docs/integrations/remix.md](remix.md).

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
