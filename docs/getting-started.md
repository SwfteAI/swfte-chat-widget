# Getting Started

The `@swfte/chat-widget` package is the official embeddable AI chat widget from [Swfte](https://www.swfte.com). In a few lines of code you can drop a floating chat bubble, an embedded chat panel, a command-palette search box, or a full-page chat layout into any website or web app and have it talk to a [Swfte agent](https://www.swfte.com/products/agents) or [chatflow](https://www.swfte.com/products/chatflows).

This guide gets you from zero to a working widget in five minutes.

## 1. Publish a widget

Create a Swfte agent, publish a widget for it, and copy the public **widget ID**. The SDK opens a scoped visitor session when it initializes. Use an authenticated server-side proxy for private deployments. [Security guide](security.md)

## 2. Install the package

Follow the [installation instructions](../README.md#installation).

## 3. Mount your first widget

### Vanilla JavaScript

```ts
import { ChatWidget, createSwfteChatClient } from '@swfte/chat-widget';

const client = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'your-published-widget-id',
});

await client.initialize();

const widget = new ChatWidget(client, { position: 'bottom-right' });
widget.mount();
```

### React

```tsx
import { ChatProvider, ChatWidget } from '@swfte/chat-widget/react';

export function App() {
  return (
    <ChatProvider config={{
      baseUrl: 'https://api.swfte.com/agents',
      widgetId: 'your-published-widget-id',
    }}>
      <ChatWidget position="bottom-right" />
    </ChatProvider>
  );
}
```

### Self-hosted script tag

Copy `dist/index.umd.js` from the source build to your site's static assets.

```html
<script src="/assets/index.umd.js"></script>
<script>
  async function mountChat() {
    const client = SwfteChat.createSwfteChatClient({
      baseUrl: 'https://api.swfte.com/agents',
      widgetId: 'your-published-widget-id',
    });
    await client.initialize();
    new SwfteChat.ChatWidget(client).mount();
  }
  mountChat().catch(() => console.error('Unable to initialize chat'));
</script>
```

## 4. Test the conversation

Open your page, click the floating bubble, and send a message. During initialization, the SDK sends `POST /v1/widgets/{widgetId}/visitors` and uses the returned visitor token for chat requests. Responses stream over SSE.

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
