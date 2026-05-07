# Getting Started

The [`@swfte/chat-widget`](https://www.npmjs.com/package/@swfte/chat-widget) package is the official embeddable AI chat widget from [Swfte](https://www.swfte.com). In a few lines of code you can drop a floating chat bubble, an embedded chat panel, a command-palette search box, or a full-page chat layout into any website or web app and have it talk to a [Swfte agent](https://www.swfte.com/products/agents) or [chatflow](https://www.swfte.com/products/chatflows).

This guide gets you from zero to a working widget in five minutes.

## 1. Create a Swfte workspace

Sign up at [swfte.com](https://www.swfte.com) (free tier, no credit card). When the dashboard loads:

1. Note your **workspace ID** (top-right of the dashboard).
2. Open **Settings → API keys** and create a key with the `chat:read`, `chat:write`, and `agents:read` scopes. Keys start with `sk-swfte-...`.
3. Open **Agents** and either pick a built-in template (Support, Sales, Docs Search) or build your own with the [Agent Wizard](https://www.swfte.com/products/agents). Note the **agent ID**.

> **Heads-up.** A browser-side `apiKey` is fine for prototyping, but production deployments should proxy chat traffic through your backend so the key never reaches the browser. See [docs/security.md](security.md).

## 2. Install the package

```bash
npm install @swfte/chat-widget
# or
yarn add @swfte/chat-widget
# or
pnpm add @swfte/chat-widget
```

## 3. Mount your first widget

### Vanilla JavaScript / TypeScript

```ts
import { createSwfteChatClient } from '@swfte/chat-widget';

const client = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'agent-123',         // your agent ID
  apiKey: 'sk-swfte-...',         // (prefer proxy in production)
});

const widget = client.createWidget({
  position: 'bottom-right',
  greeting: 'Hi! How can I help you today?',
});

widget.mount(document.body);
```

### React

```tsx
import { ChatProvider, ChatWidget } from '@swfte/chat-widget/react';

export function App() {
  return (
    <ChatProvider config={{
      baseUrl: 'https://api.swfte.com/agents',
      widgetId: 'agent-123',
    }}>
      <ChatWidget position="bottom-right" />
    </ChatProvider>
  );
}
```

### CDN script tag (no build step)

```html
<script src="https://unpkg.com/@swfte/chat-widget@latest/dist/swfte-chat.umd.js"></script>
<script>
  const widget = SwfteChat.createSwfteChatClient({
    baseUrl: 'https://api.swfte.com/agents',
    widgetId: 'agent-123',
  }).createWidget({ position: 'bottom-right' });
  widget.mount(document.body);
</script>
```

## 4. Test the conversation

Open your page, click the floating bubble, and send a message. The widget speaks to the [`/v2/conversations/initiate`](https://www.swfte.com/developers) endpoint to start a session, then streams agent responses over WebSocket / SSE.

## 5. Pick the next stop

| Want to … | Read |
|---|---|
| Customize colors and typography | [docs/theming.md](theming.md) |
| Use a search modal instead of a bubble | [docs/widget-types.md](widget-types.md) |
| Embed inside React, Next.js, Vue, Svelte, Angular | [docs/integrations/](integrations/) |
| Use voice input/output | [docs/voice.md](voice.md) |
| Hide the API key from the browser | [docs/security.md](security.md) |
| See every prop and event | [docs/api-reference.md](api-reference.md) |

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
