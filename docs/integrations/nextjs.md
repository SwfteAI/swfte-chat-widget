# Next.js

This guide covers both the **App Router** (Next.js 13+, including Next.js 16) and the legacy **Pages Router**, with the recommended pattern: a server-side proxy route so the [Swfte](https://www.swfte.com) API key never reaches the browser.

## Install

```bash
npm install @swfte/chat-widget
```

## App Router (recommended)

### 1. Wrap the app in a client provider

```tsx
// app/providers/chat-provider.tsx
'use client';

import { ChatProvider } from '@swfte/chat-widget/react';
import { ReactNode } from 'react';

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  return (
    <ChatProvider config={{
      baseUrl: '/api/chat-proxy',                       // proxy through Next
      widgetId: process.env.NEXT_PUBLIC_AGENT_ID!,
    }}>
      {children}
    </ChatProvider>
  );
}
```

```tsx
// app/layout.tsx
import { ChatWidgetProvider } from './providers/chat-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChatWidgetProvider>{children}</ChatWidgetProvider>
      </body>
    </html>
  );
}
```

### 2. Mount the widget on a client page

```tsx
// app/page.tsx
import { ChatBubble } from './chat-bubble';

export default function HomePage() {
  return (
    <main>
      <h1>Welcome</h1>
      <ChatBubble />
    </main>
  );
}
```

```tsx
// app/chat-bubble.tsx
'use client';

import dynamic from 'next/dynamic';

// Avoid SSR hydration mismatch — the widget reaches into window/localStorage
const ChatWidget = dynamic(
  () => import('@swfte/chat-widget/react').then((m) => m.ChatWidget),
  { ssr: false },
);

export function ChatBubble() {
  return <ChatWidget position="bottom-right" />;
}
```

### 3. Add a server-side proxy route

The proxy keeps your `SWFTE_API_KEY` on the server and forwards traffic to the [Swfte API](https://www.swfte.com/developers). It also lets you enforce per-user rate-limits and auth.

```ts
// app/api/chat-proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TARGET = 'https://api.swfte.com/agents';

async function forward(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const url = `${TARGET}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${process.env.SWFTE_API_KEY!}`);
  headers.set('x-workspace-id', process.env.SWFTE_WORKSPACE_ID!);
  headers.delete('host');

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    // @ts-expect-error duplex required for streaming bodies in Node 18+
    duplex: 'half',
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}

export {
  forward as GET,
  forward as POST,
  forward as PATCH,
  forward as PUT,
  forward as DELETE,
};
```

`.env.local`:

```env
NEXT_PUBLIC_AGENT_ID=agent-123
SWFTE_API_KEY=sk-swfte-...
SWFTE_WORKSPACE_ID=ws_abc
```

> A complete runnable scaffold is in [examples/09-nextjs-rsc-proxy](../../examples/09-nextjs-rsc-proxy).

## Pages Router

```tsx
// pages/_app.tsx
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';

const ChatProvider = dynamic(
  () => import('@swfte/chat-widget/react').then((m) => m.ChatProvider),
  { ssr: false },
);
const ChatWidget = dynamic(
  () => import('@swfte/chat-widget/react').then((m) => m.ChatWidget),
  { ssr: false },
);

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider config={{ baseUrl: '/api/chat-proxy', widgetId: process.env.NEXT_PUBLIC_AGENT_ID! }}>
      <Component {...pageProps} />
      <ChatWidget position="bottom-right" />
    </ChatProvider>
  );
}
```

The same proxy pattern works in `pages/api/chat-proxy/[...path].ts` — replace `NextRequest`/`NextResponse` with the `NextApiRequest`/`NextApiResponse` types.

## Server Components → Client Components

Don't import anything from `@swfte/chat-widget/react` inside a Server Component. The package uses browser APIs (WebSocket, `localStorage`, `window`), so any component touching it must declare `'use client'` or be loaded via `next/dynamic({ ssr: false })`.

## Middleware (optional)

If you use Next.js middleware to gate access, allow the proxy route through and rate-limit it per visitor:

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/chat-proxy')) {
    // attach a per-IP rate-limit header, log analytics, etc.
  }
  return NextResponse.next();
}
```

## Cache Components (Next.js 16)

The widget is a runtime client component — there is nothing to cache. Use `cache: 'no-store'` for any custom server fetches you make from the proxy route to keep streaming responses snappy.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
