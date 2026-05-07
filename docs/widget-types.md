# Widget Types

The [`@swfte/chat-widget`](https://www.npmjs.com/package/@swfte/chat-widget) package ships four widget shapes. Pick whichever matches your use case — they all share the same configuration, theming, and event surface.

| Type | Use case | Config |
|---|---|---|
| **Bubble** (default) | Floating chat launcher, opens a panel on click. Customer support, onboarding nudges. | `type: 'bubble'` |
| **Embedded** | Inline chat panel pinned inside a page container. Help-center pages, dashboards. | `type: 'embedded'` |
| **Search** | Command-palette modal triggered by a hotkey. Documentation sites, in-app search. | `type: 'search'` |
| **Fullpage** | Chat is the page. Standalone chat apps, support portals. | `type: 'fullpage'` |

## Bubble

```ts
client.createWidget({
  type: 'bubble',
  position: 'bottom-right',
  bubbleIcon: 'chat',                      // 'chat' | 'message' | custom SVG string
  greeting: 'Hi! How can I help?',
  badgeCount: 1,                           // unread badge
  openByDefault: false,
});
```

A 60×60 px circular launcher pinned to a screen corner. Click it to open a 380×600 panel. Drag-to-resize on the desktop, full-screen on mobile.

## Embedded

```html
<div id="chat" style="height: 600px;"></div>
```

```ts
client.createWidget({
  type: 'embedded',
  height: '600px',                         // any CSS length
  width: '100%',
}).mount(document.getElementById('chat'));
```

The widget fills its container — no floating chrome, no launcher button. Resize the parent and the widget tracks it. Best for help pages and dashboards where the chat is part of the layout.

## Search

```ts
client.createWidget({
  type: 'search',
  hotkey: 'cmd+k',                          // also 'ctrl+k', 'mod+k'
  placeholder: 'Search documentation...',
  showCitations: true,
  maxResults: 8,
});
```

A command-palette modal (top of the viewport, fixed width). The hotkey opens it; `Esc` or click-outside closes it. Each result shows the source citation; clicking a citation navigates to the source URL.

To open programmatically:

```ts
const search = client.createWidget({ type: 'search', hotkey: 'cmd+k' });
search.mount(document.body);

document.getElementById('search-button').addEventListener('click', () => search.open());
```

## Fullpage

```ts
client.createWidget({
  type: 'fullpage',
  container: '#app',
  showSidebar: true,                        // conversation list sidebar
  showHeader: true,
}).mount(document.getElementById('app'));
```

Renders the chat as the entire page: sidebar with past conversations on the left, message thread + composer on the right. Best for standalone chat apps and support portals.

## Mixing types on one page

You can mount multiple widget types against the same client. They share state — open a search modal, send a message, close the modal, and the same conversation continues in the bubble.

```ts
const client = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'agent-123',
});

const bubble = client.createWidget({ type: 'bubble', position: 'bottom-right' });
const search = client.createWidget({ type: 'search', hotkey: 'cmd+k' });

bubble.mount(document.body);
search.mount(document.body);
```

## Switching at runtime

```ts
const widget = client.createWidget({ type: 'bubble' });
widget.mount(document.body);

// Later — promote the floating bubble into a fullpage layout
widget.updateConfig({ type: 'fullpage', container: '#app' });
```

`updateConfig` re-renders without disconnecting the WebSocket / SSE stream — the conversation stays alive.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
