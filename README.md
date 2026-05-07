# Swfte Chat Widget SDK

[![npm Version](https://img.shields.io/npm/v/@swfte/chat-widget.svg)](https://www.npmjs.com/package/@swfte/chat-widget)
[![npm Downloads](https://img.shields.io/npm/dm/@swfte/chat-widget.svg)](https://www.npmjs.com/package/@swfte/chat-widget)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/SwfteAI/swfte-chat-widget/ci.yml?branch=main)](https://github.com/SwfteAI/swfte-chat-widget/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@swfte/chat-widget)](https://bundlephobia.com/package/@swfte/chat-widget)
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

```bash
npm install @swfte/chat-widget
# or
yarn add @swfte/chat-widget
# or
pnpm add @swfte/chat-widget
```

## Quick Start

### Vanilla JavaScript

```html
<script type="module">
  import { SwfteChatWidget } from '@swfte/chat-widget';

  const widget = new SwfteChatWidget({
    apiKey: 'sk-swfte-...',
    agentId: 'agent-123',
    position: 'bottom-right'
  });

  widget.mount();
</script>
```

### React

```tsx
import { ChatWidget } from '@swfte/chat-widget/react';

function App() {
  return (
    <ChatWidget
      apiKey="sk-swfte-..."
      agentId="agent-123"
      position="bottom-right"
      theme="light"
    />
  );
}
```

### CDN (No Build Required)

```html
<script src="https://unpkg.com/@swfte/chat-widget@latest/dist/swfte-chat.umd.js"></script>
<script>
  const widget = new SwfteChatWidget({
    apiKey: 'sk-swfte-...',
    agentId: 'agent-123'
  });
  widget.mount();
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

### Floating Chat Bubble

```typescript
const widget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'agent-123',
  type: 'bubble',
  position: 'bottom-right',
  bubbleIcon: 'chat', // or custom SVG
  greeting: 'Hi! How can I help you today?'
});
```

### Embedded Panel

```typescript
const widget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'agent-123',
  type: 'embedded',
  container: '#chat-container',
  height: '500px'
});
```

### Search Modal

```typescript
const widget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'agent-123',
  type: 'search',
  placeholder: 'Search documentation...',
  hotkey: 'cmd+k'
});
```

## React Components

### ChatWidget

```tsx
import { ChatWidget } from '@swfte/chat-widget/react';

function App() {
  return (
    <ChatWidget
      apiKey="sk-swfte-..."
      agentId="agent-123"
      position="bottom-right"
      theme="light"
      onMessage={(message) => console.log('New message:', message)}
      onOpen={() => console.log('Widget opened')}
      onClose={() => console.log('Widget closed')}
    />
  );
}
```

### EmbeddedChat

```tsx
import { EmbeddedChat } from '@swfte/chat-widget/react';

function SupportPage() {
  return (
    <div className="support-container">
      <h1>Support</h1>
      <EmbeddedChat
        apiKey="sk-swfte-..."
        agentId="agent-123"
        height="600px"
        welcomeMessage="Welcome to support! How can we help?"
      />
    </div>
  );
}
```

### SearchModal

```tsx
import { SearchModal, useSearchModal } from '@swfte/chat-widget/react';

function App() {
  const { isOpen, open, close } = useSearchModal();

  return (
    <>
      <button onClick={open}>Search (Cmd+K)</button>
      <SearchModal
        isOpen={isOpen}
        onClose={close}
        apiKey="sk-swfte-..."
        agentId="agent-123"
        placeholder="Search anything..."
      />
    </>
  );
}
```

## Configuration

```typescript
interface WidgetConfig {
  // Required
  apiKey: string;           // Your Swfte API key
  agentId: string;          // The AI agent to connect to

  // Widget Type
  type?: 'bubble' | 'embedded' | 'search' | 'fullpage';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  // Appearance
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;    // Brand color (e.g., '#6366f1')
  borderRadius?: string;    // Corner radius (e.g., '12px')

  // Behavior
  greeting?: string;        // Initial greeting message
  placeholder?: string;     // Input placeholder text
  autoOpen?: boolean;       // Open widget automatically
  persistChat?: boolean;    // Save chat history locally

  // Advanced
  baseUrl?: string;         // Custom API endpoint
  wsUrl?: string;           // Custom WebSocket endpoint
  container?: string;       // CSS selector for embedded widget
  zIndex?: number;          // z-index for floating widget
}
```

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

```typescript
const widget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'agent-123',
  theme: {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    bubbleSize: 60,
    headerHeight: 64
  }
});
```

## Events

```typescript
const widget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'agent-123'
});

// Listen to events
widget.on('open', () => console.log('Widget opened'));
widget.on('close', () => console.log('Widget closed'));
widget.on('message', (message) => console.log('Message:', message));
widget.on('error', (error) => console.error('Error:', error));
widget.on('ready', () => console.log('Widget ready'));
widget.on('connect', () => console.log('WebSocket connected'));
widget.on('disconnect', () => console.log('WebSocket disconnected'));
```

## API Reference

### Methods

```typescript
// Mount the widget to DOM
widget.mount(container?: string | HTMLElement): void;

// Unmount the widget
widget.unmount(): void;

// Open/close the widget
widget.open(): void;
widget.close(): void;
widget.toggle(): void;

// Send a message programmatically
widget.sendMessage(content: string): Promise<void>;

// Clear chat history
widget.clearHistory(): void;

// Update configuration
widget.updateConfig(config: Partial<WidgetConfig>): void;

// Get current state
widget.isOpen(): boolean;
widget.getMessages(): Message[];
```

## Examples

### Customer Support Widget

```typescript
const supportWidget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'support-agent',
  position: 'bottom-right',
  greeting: 'Hi there! How can we help you today?',
  theme: {
    primaryColor: '#10b981',
    borderRadius: '16px'
  },
  persistChat: true
});

supportWidget.mount();
```

### Documentation Search

```typescript
const searchWidget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'docs-agent',
  type: 'search',
  placeholder: 'Search documentation...',
  hotkey: 'cmd+k'
});

searchWidget.mount();
```

### Full-Page Chat Application

```typescript
const chatApp = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'assistant',
  type: 'fullpage',
  container: '#app',
  theme: 'dark'
});

chatApp.mount();
```

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
- [**swfte-java**](https://github.com/SwfteAI/swfte-java) — Java SDK ([Maven Central](https://search.maven.org/artifact/com.swfte/swfte-sdk))
- [**swfte-chatflow-widget**](https://github.com/SwfteAI/swfte-chatflow-widget) — embeddable conversational form widget ([npm](https://www.npmjs.com/package/@swfte/chatflow-widget))

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
