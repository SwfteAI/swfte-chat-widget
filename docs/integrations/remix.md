# Remix

This guide covers Remix v2+ (also Remix on Vite, and React Router v7 in framework mode). The pattern is identical: a server-side resource route proxies the [Swfte](https://www.swfte.com) API, and a client-only component mounts the widget.

## Install

```bash
npm install @swfte/chat-widget
```

## Resource route — server-side proxy

```ts
// app/routes/api.chat-proxy.$.tsx
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

const TARGET = 'https://api.swfte.com/agents';

async function forward({ request, params }: LoaderFunctionArgs | ActionFunctionArgs) {
  const path = params['*'] ?? '';
  const url = new URL(request.url);
  const target = `${TARGET}/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${process.env.SWFTE_API_KEY!}`);
  headers.set('x-workspace-id', process.env.SWFTE_WORKSPACE_ID!);
  headers.delete('host');

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    // @ts-expect-error duplex flag for streaming
    duplex: 'half',
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export const loader = forward;
export const action = forward;
```

## Client-only widget mount

Remix runs components on the server by default. Since the widget needs `window`, gate it behind a `useEffect` mount or use [`remix-utils`](https://github.com/sergiodxa/remix-utils) `<ClientOnly>`.

```tsx
// app/components/chat-mount.tsx
import { useEffect, useState } from 'react';

export function ChatMount() {
  const [Mod, setMod] = useState<typeof import('@swfte/chat-widget/react') | null>(null);

  useEffect(() => {
    import('@swfte/chat-widget/react').then(setMod);
  }, []);

  if (!Mod) return null;
  const { ChatProvider, ChatWidget } = Mod;

  return (
    <ChatProvider config={{
      baseUrl: '/api/chat-proxy',
      widgetId: 'agent-123',
    }}>
      <ChatWidget position="bottom-right" />
    </ChatProvider>
  );
}
```

## Mount it in `root.tsx`

```tsx
// app/root.tsx
import { ChatMount } from './components/chat-mount';

export default function App() {
  return (
    <html lang="en">
      <head><Meta /><Links /></head>
      <body>
        <Outlet />
        <ChatMount />
        <Scripts />
      </body>
    </html>
  );
}
```

## Streaming responses

Remix resource routes pass through `ReadableStream` bodies natively. The proxy above already streams agent responses chunk-by-chunk to the widget — no extra config needed.

## Environment variables

Use Remix's `process.env` on the server, and a typed `loader` to expose only public config to the browser:

```ts
// app/routes/_index.tsx
export async function loader() {
  return { agentId: process.env.NEXT_PUBLIC_AGENT_ID! };
}
```

Then read it via `useLoaderData()` and pass to `ChatProvider`.

## Edge / Cloudflare runtime

The proxy route works on the edge as well — replace `process.env` with the platform's binding system (`context.cloudflare.env.SWFTE_API_KEY`) and the streaming `Response` works the same.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
