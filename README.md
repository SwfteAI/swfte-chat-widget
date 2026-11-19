# Swfte Chat Widget SDK

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/SwfteAI/swfte-chat-widget/ci.yml?branch=main)](https://github.com/SwfteAI/swfte-chat-widget/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-17%2B-61dafb.svg)](https://reactjs.org/)

The official embeddable AI chat widget SDK from [**Swfte**](https://www.swfte.com) — a floating chat bubble, a command-palette AI search box, an embedded chat panel, and a full-page chat layout, all wired into the [Swfte](https://www.swfte.com) AI infrastructure platform.

## Table of Contents

- [About Swfte](#about-swfte)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Widget Types](#widget-types)
- [React Components](#react-components)
- [Configuration](#configuration)
- [Theming](#theming)
- [Events](#events)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Documentation](#documentation)
- [Other Swfte SDKs](#other-swfte-sdks)
- [Resources](#resources)
- [Contributing](#contributing)
- [License](#license)

## About Swfte

[**Swfte**](https://www.swfte.com) is the unified AI infrastructure platform — one API for **200+ models** from OpenAI, Anthropic, Google, Mistral, Meta and self-hosted GPU deployments, plus production-grade [agents](https://www.swfte.com/products/agents), [workflows](https://www.swfte.com/products/workflows), [chatflows](https://www.swfte.com/products/chatflows), [RAG](https://www.swfte.com/products/rag), [voice](https://www.swfte.com/products/voice), and [MCP servers](https://www.swfte.com/products/mcp).

Read the full company profile in [ABOUT.md](ABOUT.md), or visit [swfte.com](https://www.swfte.com) to get started for free.

| Resource | Link |
|---|---|
| Product home | [https://www.swfte.com](https://www.swfte.com) |
| Documentation | [swfte.com/resources](https://www.swfte.com/resources) |
| API reference | [swfte.com/developers](https://www.swfte.com/developers) |
| Pricing | [swfte.com/pricing](https://www.swfte.com/pricing) |
| Security | [swfte.com/security](https://www.swfte.com/security) |
| Status | [status.swfte.com](https://status.swfte.com) |
| GitHub org | [github.com/SwfteAI](https://github.com/SwfteAI) |

## Installation

`@swfte/chat-widget` is not yet published on public npm. Install from [the source repository](https://github.com/SwfteAI/swfte-chat-widget) with repository access and Node.js 18 or newer.

```bash
git clone https://github.com/SwfteAI/swfte-chat-widget.git
cd swfte-chat-widget
npm ci
npm run build
npm pack
```

In your application, run `npm install /absolute/path/to/swfte-chat-widget/swfte-chat-widget-1.2.0.tgz`. Use the tarball filename printed by `npm pack` if building a different revision.

## Quick Start

Create and publish a widget for your agent in Swfte, then copy its public widget ID. The SDK opens a visitor session and sends its scoped token in the `X-Widget-Token` header. Keep workspace credentials on your server. For private deployments, use an authenticated host proxy. [Security guide](docs/security.md)

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

## Features

| Feature | Description |
|---------|-------------|
| **Multiple Widget Types** | Floating bubble, embedded panel, search modal, and full-page layouts |
| **AI-Powered** | Connect to any AI agent for intelligent conversations |
| **Real-time Streaming** | Live typing indicators and streaming responses |
| **Fully Customizable** | Extensive theming and styling options |
| **React Support** | First-class React components with hooks |
| **TypeScript** | Full TypeScript support with comprehensive types |
| **Lightweight** | Small bundle size with tree-shaking support |
| **Responsive** | Works on desktop, tablet, and mobile devices |
| **WebSocket** | Real-time bidirectional communication via STOMP/WebSocket |
| **White-Label** | Fully customizable branding |

## Widget Types

Use the initialized client and public configuration from the quickstart.

```ts
import { AISearch, ChatWidget, EmbeddedChat } from '@swfte/chat-widget';

new ChatWidget(client, { position: 'bottom-right' }).mount();
new EmbeddedChat(client, { container: '#chat-container' }).mount();

const search = new AISearch({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'your-published-widget-id',
}, { placeholder: 'Search documentation...' });
search.mount('#search-container');
```

## React Components

Place `ChatWidget`, `EmbeddedChat`, or `AISearch` inside the `ChatProvider` from the quickstart.

## Configuration

`SwfteChatConfig` requires `baseUrl` and a public `widgetId`. Optional settings include `userInfo`, `debug`, and a custom `fetch`. See the [API reference](docs/api-reference.md) for component options.

## Theming

### CSS Variables

```css
:root {
  /* Colors */
  --swfte-primary: #6366f1;
  --swfte-primary-hover: #4f46e5;
  --swfte-background: #ffffff;
  --swfte-surface: #f9fafb;
  --swfte-text: #111827;
  --swfte-text-secondary: #6b7280;
  --swfte-border: #e5e7eb;

  /* Typography */
  --swfte-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --swfte-font-size: 14px;

  /* Sizing */
  --swfte-border-radius: 12px;
  --swfte-widget-width: 380px;
  --swfte-widget-height: 600px;

  /* Shadows */
  --swfte-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Custom Theme Object

```ts
const widget = new ChatWidget(client, {
  theme: { colors: { ...defaultTheme.colors, primary: '#6366f1' } },
});
widget.mount();
```

Import `defaultTheme` and `ChatWidget` from `@swfte/chat-widget`.

## Events

```ts
const unsubscribe = client.on(event => {
  if (event.type === 'message:received') {
    console.log('Message received');
  }
});
```

Call `unsubscribe()` when you no longer need the listener.

## API Reference

Use `client.sendMessage(content)` to send a message from code. The vanilla `ChatWidget` exposes `mount`, `unmount`, `open`, `close`, and `toggle`. See the [API reference](docs/api-reference.md) for details.

## Examples

See [vanilla chat](examples/01-vanilla-html/), [React support chat](examples/02-react-support-widget/), and [React AI search](examples/03-react-ai-search/).

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| Mobile Safari | iOS 13+ |
| Mobile Chrome | Android 80+ |

## Documentation

- [Getting started](docs/getting-started.md)
- [Vanilla HTML / CDN](docs/integrations/vanilla-html.md)
- [React](docs/integrations/react.md) · [Next.js](docs/integrations/nextjs.md) · [Remix](docs/integrations/remix.md)
- [Vue](docs/integrations/vue.md) · [Svelte](docs/integrations/svelte.md) · [Angular](docs/integrations/angular.md)
- [WordPress](docs/integrations/wordpress.md) · [Shopify](docs/integrations/shopify.md)
- [Theming reference](docs/theming.md) · [Widget types](docs/widget-types.md) · [Voice](docs/voice.md) · [Security](docs/security.md)
- [Full API reference](docs/api-reference.md)
- [Swfte product docs](https://www.swfte.com/resources) · [Swfte API](https://www.swfte.com/developers)
- [Changelog](CHANGELOG.md)

## Other Swfte SDKs

The chat widget is one piece of the [Swfte](https://www.swfte.com) developer surface. The other official SDKs:

- [**swfte-python**](https://github.com/SwfteAI/swfte-python) — Python SDK ([PyPI](https://pypi.org/project/swfte/))
- [**swfte-node**](https://github.com/SwfteAI/swfte-node) — Node.js / TypeScript SDK ([npm](https://www.npmjs.com/package/@swfte/sdk))
- [**swfte-java**](https://github.com/SwfteAI/swfte-java) — Java SDK (source install)
- [**swfte-chatflow-widget**](https://github.com/SwfteAI/swfte-chatflow-widget) — embeddable conversational form widget (source install)

All SDKs are MIT-licensed and maintained under the [SwfteAI](https://github.com/SwfteAI) GitHub organisation.

## Resources

- [Swfte](https://www.swfte.com) — product home
- [Documentation](https://www.swfte.com/resources) — guides, cookbooks, recipes
- [Developer reference](https://www.swfte.com/developers) — every endpoint, every model
- [Pricing](https://www.swfte.com/pricing) — pay-as-you-go, transparent per-token + per-second compute
- [Security](https://www.swfte.com/security) — security posture, data handling, compliance
- [Status & uptime](https://status.swfte.com) — live system status

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details, and sign the [Swfte CLA](https://cla.swfte.com) before your first pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built and maintained by the [Swfte](https://www.swfte.com) team. Visit [swfte.com](https://www.swfte.com) to get started for free.
