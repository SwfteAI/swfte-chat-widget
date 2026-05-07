# Vue 3 / Nuxt

The widget is framework-agnostic — the core `createSwfteChatClient()` factory and the widget instances it returns are pure DOM, so they work natively inside Vue 3 and Nuxt 3 without a Vue-specific package.

## Install

```bash
npm install @swfte/chat-widget
```

## Vue 3 — Composition API

```vue
<!-- src/components/SwfteChat.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { createSwfteChatClient } from '@swfte/chat-widget';

const props = defineProps<{
  agentId: string;
  baseUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}>();

const root = ref<HTMLElement | null>(null);
let widget: ReturnType<ReturnType<typeof createSwfteChatClient>['createWidget']> | null = null;

onMounted(() => {
  const client = createSwfteChatClient({
    baseUrl: props.baseUrl ?? 'https://api.swfte.com/agents',
    widgetId: props.agentId,
  });

  widget = client.createWidget({
    position: props.position ?? 'bottom-right',
  });
  widget.mount(root.value!);
});

onBeforeUnmount(() => {
  widget?.unmount();
});
</script>

<template>
  <div ref="root" />
</template>
```

Use it anywhere in your app:

```vue
<template>
  <SwfteChat agent-id="agent-123" position="bottom-right" />
</template>
```

## Reusable composable

If you want to drive the widget imperatively (open it from a "Chat with us" button, identify the user on login, send a programmatic message), wrap it in a composable:

```ts
// src/composables/useSwfteChat.ts
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createSwfteChatClient } from '@swfte/chat-widget';

export function useSwfteChat(opts: { agentId: string; baseUrl?: string }) {
  const widget = ref<any>(null);
  const root   = ref<HTMLElement | null>(null);
  const client = createSwfteChatClient({
    baseUrl: opts.baseUrl ?? 'https://api.swfte.com/agents',
    widgetId: opts.agentId,
  });

  onMounted(() => {
    widget.value = client.createWidget({ position: 'bottom-right' });
    widget.value.mount(root.value!);
  });
  onBeforeUnmount(() => widget.value?.unmount());

  return {
    root,
    open:    () => widget.value?.open(),
    close:   () => widget.value?.close(),
    send:    (text: string) => widget.value?.sendMessage(text),
    identify: client.identify.bind(client),
  };
}
```

## Nuxt 3

Nuxt 3 SSRs by default, so wrap the mount in a client-only component to skip the server render:

```vue
<!-- components/ChatBubble.client.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { createSwfteChatClient } from '@swfte/chat-widget';

const root = ref<HTMLElement | null>(null);
let widget: any;

onMounted(() => {
  const client = createSwfteChatClient({
    baseUrl: useRuntimeConfig().public.swfteBaseUrl,
    widgetId: useRuntimeConfig().public.swfteAgentId,
  });
  widget = client.createWidget({ position: 'bottom-right' });
  widget.mount(root.value!);
});
onBeforeUnmount(() => widget?.unmount());
</script>

<template>
  <div ref="root" />
</template>
```

Naming the file `*.client.vue` tells Nuxt to render it on the client only. Then drop it in the layout:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
    <ChatBubble />
  </NuxtLayout>
</template>
```

`nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      swfteBaseUrl: process.env.SWFTE_BASE_URL ?? '/api/chat-proxy',
      swfteAgentId: process.env.SWFTE_AGENT_ID,
    },
  },
});
```

## Server-side proxy (Nuxt 3)

```ts
// server/api/chat-proxy/[...path].ts
import { defineEventHandler, getRequestURL, readRawBody } from 'h3';

const TARGET = 'https://api.swfte.com/agents';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname.replace(/^\/api\/chat-proxy/, '');
  const body = ['GET', 'HEAD'].includes(event.method) ? undefined : await readRawBody(event);

  const headers = new Headers(event.headers);
  headers.set('Authorization', `Bearer ${process.env.SWFTE_API_KEY!}`);
  headers.set('x-workspace-id', process.env.SWFTE_WORKSPACE_ID!);
  headers.delete('host');

  const upstream = await fetch(`${TARGET}${path}${url.search}`, {
    method: event.method,
    headers,
    body,
    // @ts-expect-error duplex flag for streaming
    duplex: 'half',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
});
```

A complete runnable example is in [examples/06-vue-shop-assistant](../../examples/06-vue-shop-assistant).

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
