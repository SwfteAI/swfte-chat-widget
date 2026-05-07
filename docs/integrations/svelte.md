# Svelte 5 / SvelteKit

The widget uses no framework code, so it drops cleanly into Svelte 5 (with runes) and SvelteKit. The only thing to remember is that the widget needs the DOM, so mount it inside `onMount()` (or the `mount` rune lifecycle).

## Install

```bash
npm install @swfte/chat-widget
```

## Svelte 5 component

```svelte
<!-- src/lib/SwfteChat.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { createSwfteChatClient } from '@swfte/chat-widget';

  let { agentId, baseUrl = 'https://api.swfte.com/agents', position = 'bottom-right' } = $props<{
    agentId: string;
    baseUrl?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  }>();

  let root: HTMLDivElement;
  let widget: any;

  onMount(() => {
    const client = createSwfteChatClient({ baseUrl, widgetId: agentId });
    widget = client.createWidget({ position });
    widget.mount(root);
    return () => widget?.unmount();
  });
</script>

<div bind:this={root}></div>
```

Use it in any page:

```svelte
<script lang="ts">
  import SwfteChat from '$lib/SwfteChat.svelte';
</script>

<SwfteChat agentId="agent-123" />
```

## Bubble + search modal together

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createSwfteChatClient } from '@swfte/chat-widget';

  let bubbleRoot: HTMLDivElement;
  let searchRoot: HTMLDivElement;
  let bubble: any, search: any;

  onMount(() => {
    const client = createSwfteChatClient({
      baseUrl: '/api/chat-proxy',
      widgetId: 'agent-docs',
    });

    bubble = client.createWidget({ type: 'bubble', position: 'bottom-right' });
    bubble.mount(bubbleRoot);

    search = client.createWidget({ type: 'search', hotkey: 'cmd+k' });
    search.mount(searchRoot);

    return () => { bubble?.unmount(); search?.unmount(); };
  });
</script>

<div bind:this={bubbleRoot}></div>
<div bind:this={searchRoot}></div>
```

## SvelteKit — server-side proxy

```ts
// src/routes/api/chat-proxy/[...path]/+server.ts
import type { RequestHandler } from './$types';

const TARGET = 'https://api.swfte.com/agents';

const forward: RequestHandler = async ({ params, request, url, fetch }) => {
  const target = `${TARGET}/${params.path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${process.env.SWFTE_API_KEY!}`);
  headers.set('x-workspace-id', process.env.SWFTE_WORKSPACE_ID!);
  headers.delete('host');

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    // @ts-expect-error duplex flag
    duplex: 'half',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
};

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
```

`.env`:

```env
SWFTE_API_KEY=sk-swfte-...
SWFTE_WORKSPACE_ID=ws_abc
```

## Layout-level mount

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import SwfteChat from '$lib/SwfteChat.svelte';
  let { children } = $props();
</script>

{@render children?.()}
<SwfteChat agentId="agent-123" baseUrl="/api/chat-proxy" />
```

A complete runnable example is in [examples/07-svelte-docs-search](../../examples/07-svelte-docs-search).

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
