# Swfte Chat Widget - Examples

This directory contains example projects demonstrating various ways to integrate the Swfte Chat Widget SDK into your applications.

## Examples Overview

| Example | Description | Stack |
|---------|-------------|-------|
| [01-vanilla-html](./01-vanilla-html) | Basic integration on any website | HTML, JavaScript |
| [02-react-support-widget](./02-react-support-widget) | Floating support chat widget | React, Vite |
| [03-react-ai-search](./03-react-ai-search) | AI-powered documentation search | React, Vite |
| [04-react-full-chat](./04-react-full-chat) | Full chat application with conversations | React, Vite |
| [05-nextjs-integration](./05-nextjs-integration) | Next.js App Router integration | Next.js 14, React |
| [06-vue-shop-assistant](./06-vue-shop-assistant) | Vue 3 product-page shop assistant with page context | Vue 3, Vite |
| [07-svelte-docs-search](./07-svelte-docs-search) | SvelteKit docs site with bubble + ⌘K search modal | SvelteKit, Svelte 5 |
| [08-vanilla-cdn](./08-vanilla-cdn) | Single-file CDN integration with theme + events | HTML, no build |
| [09-nextjs-rsc-proxy](./09-nextjs-rsc-proxy) | Next.js 16 App Router with server-side proxy route | Next.js 16, React 19 |

---

## 01 - Vanilla HTML/JavaScript

**Best for:** Marketing sites, WordPress, any static website

The simplest integration - just include the SDK script and initialize the widget.

```html
<script src="https://cdn.swfte.com/chat-widget.umd.js"></script>
<script>
  const client = SwfteChat.createSwfteChatClient({
    baseUrl: 'https://api.swfte.com',
    widgetId: 'your-widget-id',
  });

  const widget = client.createWidget({
    position: 'bottom-right',
    theme: { colors: { primary: '#3b82f6' } }
  });

  widget.mount(document.body);
</script>
```

**To run:**
```bash
cd 01-vanilla-html
# Open index.html in your browser
# Or use a local server: npx serve .
```

---

## 02 - React Support Widget

**Best for:** SaaS products, web apps needing customer support

Demonstrates the floating `ChatWidget` component with:
- Theme customization with live preview
- Brand color switching
- Event callbacks (onOpen, onClose, onMessageSent)

```tsx
import { ChatProvider, ChatWidget } from '@swfte/chat-widget/react';

function App() {
  return (
    <ChatProvider config={{ baseUrl: '...', widgetId: '...' }}>
      <YourApp />
      <ChatWidget
        position="bottom-right"
        theme={{ colors: { primary: '#3b82f6' } }}
        onMessageSent={(msg) => console.log('Sent:', msg)}
      />
    </ChatProvider>
  );
}
```

**To run:**
```bash
cd 02-react-support-widget
npm install
npm run dev
```

---

## 03 - React AI Search

**Best for:** Documentation sites, knowledge bases, help centers

Demonstrates the `AISearch` component with:
- Command+K keyboard shortcut
- Modal overlay search
- Citation display
- Result click handling

```tsx
import { ChatProvider, AISearch } from '@swfte/chat-widget/react';

function DocsPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <ChatProvider config={{ baseUrl: '...', widgetId: '...' }}>
      <button onClick={() => setIsSearchOpen(true)}>
        Search docs... ⌘K
      </button>

      {isSearchOpen && (
        <AISearch
          placeholder="Search documentation..."
          showCitations={true}
          onResultClick={(result) => {
            window.location.href = result.url;
          }}
        />
      )}
    </ChatProvider>
  );
}
```

**To run:**
```bash
cd 03-react-ai-search
npm install
npm run dev
```

---

## 04 - React Full Chat Application

**Best for:** Customer messaging platforms, team chat, support dashboards

Demonstrates the `EmbeddedChat` component with:
- Multiple conversations
- Conversation list sidebar
- Agent selection
- User identification
- Quick reply buttons
- `useChat` and `useConversation` hooks

```tsx
import {
  ChatProvider,
  EmbeddedChat,
  useChat,
  useConversation,
} from '@swfte/chat-widget/react';

function ChatApp() {
  const { sendMessage, messages } = useChat();
  const { conversations, createConversation } = useConversation();

  return (
    <div className="chat-layout">
      <ConversationList conversations={conversations} />
      <EmbeddedChat conversationId={activeId} />
    </div>
  );
}
```

**To run:**
```bash
cd 04-react-full-chat
npm install
npm run dev
```

---

## 05 - Next.js Integration

**Best for:** Production Next.js applications

Demonstrates proper Next.js 14 App Router integration with:
- Server Components compatibility
- Dynamic imports for client-only components
- Provider setup in layout
- Environment variable configuration
- Embedded and floating widget examples

```tsx
// components/ChatWidgetProvider.tsx
'use client';

import { ChatProvider } from '@swfte/chat-widget/react';

export function ChatWidgetProvider({ children }) {
  return (
    <ChatProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_CHAT_API_URL,
        widgetId: process.env.NEXT_PUBLIC_WIDGET_ID,
      }}
    >
      {children}
    </ChatProvider>
  );
}

// components/FloatingChatWidget.tsx
'use client';

import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('@swfte/chat-widget/react').then(m => m.ChatWidget),
  { ssr: false }
);

export function FloatingChatWidget() {
  return <ChatWidget position="bottom-right" />;
}
```

**To run:**
```bash
cd 05-nextjs-integration
npm install
npm run dev
```

---

## Configuration

All examples connect to `http://localhost:8307` by default (the agents-service backend).

To connect to a production backend, update the configuration:

```typescript
// React examples
<ChatProvider
  config={{
    baseUrl: 'https://api.your-domain.com',
    widgetId: 'your-widget-id',
  }}
>

// Vanilla JS
const client = SwfteChat.createSwfteChatClient({
  baseUrl: 'https://api.your-domain.com',
  widgetId: 'your-widget-id',
});
```

### Environment Variables (Next.js)

Create a `.env.local` file:

```env
NEXT_PUBLIC_CHAT_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WIDGET_ID=your-widget-id
```

---

## SDK Features Demonstrated

| Feature | Example 1 | Example 2 | Example 3 | Example 4 | Example 5 |
|---------|:---------:|:---------:|:---------:|:---------:|:---------:|
| ChatWidget | ✅ | ✅ | | | ✅ |
| EmbeddedChat | | | | ✅ | ✅ |
| AISearch | | | ✅ | | |
| ChatProvider | | ✅ | ✅ | ✅ | ✅ |
| useChat hook | | | | ✅ | |
| useConversation hook | | | | ✅ | |
| Theme customization | ✅ | ✅ | ✅ | ✅ | ✅ |
| User identification | ✅ | | | ✅ | ✅ |
| Event callbacks | ✅ | ✅ | ✅ | ✅ | ✅ |
| SSR handling | | | | | ✅ |

---

## Troubleshooting

### CORS errors
Ensure your backend allows requests from your frontend origin. The agents-service should have the frontend URL in its CORS configuration.

### Widget not appearing
1. Check browser console for errors
2. Verify the baseUrl and widgetId are correct
3. Ensure the ChatProvider wraps your components

### TypeScript errors
Make sure you have the correct React types installed:
```bash
npm install @types/react@19 @types/react-dom@19
```

---

## Need Help?

- [SDK Documentation](../README.md)
- [docs/](../docs) — framework integration cookbooks
- [Swfte resources](https://www.swfte.com/resources)
- [Swfte API reference](https://www.swfte.com/developers)
- [GitHub Issues](https://github.com/SwfteAI/swfte-chat-widget/issues)
