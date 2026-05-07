# 09 — Next.js RSC + Server Proxy

A minimal [Next.js 16](https://nextjs.org) App Router example that demonstrates the **don't expose your API key** pattern: the widget is mounted as a Client Component, and every request it makes is funnelled through a server-side proxy route that holds the [Swfte](https://www.swfte.com) API key in environment variables.

## Run

```bash
cd examples/09-nextjs-rsc-proxy
npm install
cp .env.example .env.local
# Edit .env.local and fill in your Swfte credentials.
npm run dev
```

Open http://localhost:3000 and click the floating bubble. Open the network tab — every request goes to `/api/chat-proxy/*`, never directly to `api.swfte.com`.

## Provisioning a widget

The chat-widget SDK expects a **widget id** — a published configuration that wraps an agent, appearance, and behaviour. It is **not** a raw agent id. Create one once per environment:

```bash
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SWFTE_API_KEY" \
  -H "X-Workspace-ID: $SWFTE_WORKSPACE_ID" \
  -d '{
    "name": "Marketing Site Chat",
    "agentId": "<your-agent-id>",
    "appearance": { "primaryColor": "#3b82f6", "position": "bottom-right" },
    "behavior":   { "greeting": "Hi! How can I help?" }
  }' \
  https://api.swfte.com/agents/v1/widgets
```

Use the returned `id` as `NEXT_PUBLIC_WIDGET_ID` in `.env.local`. You can also create one in the dashboard at [swfte.com/products/chat](https://www.swfte.com/products/chat).

## Files

```
app/
  layout.tsx                          ← Server Component, wraps app in ChatProviders
  page.tsx                            ← Server Component
  components/
    chat-providers.tsx                ← 'use client' — wraps ChatProvider
    chat-bubble.tsx                   ← 'use client' + dynamic({ ssr: false })
  api/chat-proxy/[...path]/route.ts   ← Server-side proxy. Holds the API key.
.env.example                          ← Copy to .env.local
```

## What this shows

- Splitting the App Router cleanly into Server Components and Client Components.
- `next/dynamic({ ssr: false })` for browser-only widgets that touch `window` / `localStorage`.
- A streaming-aware proxy route (`duplex: 'half'`) so agent responses arrive token-by-token in the browser.
- Reading `SWFTE_API_KEY` and `SWFTE_WORKSPACE_ID` only on the server.

## Production

- Add a per-user rate limit middleware in front of `/api/chat-proxy`.
- Pin a specific `@swfte/chat-widget` version in `package.json` (no `^`).
- Set a strict Content-Security-Policy. See [docs/security.md](../../docs/security.md).

Read more recipes on [swfte.com/resources](https://www.swfte.com/resources).
