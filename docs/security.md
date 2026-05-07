# Security

This page covers how to deploy the [Swfte](https://www.swfte.com) chat widget without leaking credentials, what the widget sends over the wire, and how to integrate it with strict Content-Security-Policy and SOC 2 environments.

## Threat model

The widget runs **in the visitor's browser**. Anything the browser can read, the visitor can read. Treat the widget exactly like you'd treat any other piece of public-facing JavaScript:

- **OK in the browser:** an `agentId`, a `chatFlowId`, your `baseUrl`, public theming config.
- **NOT OK in the browser:** an `sk-swfte-...` API key, a workspace admin token, a customer's identity token.

## Pattern 1 — Public agent (no key in browser)

The simplest deploy. You configure your agent for public traffic in the Swfte dashboard (`Agents → settings → Public access: ON`) and the widget calls Swfte directly. No secrets ship to the browser.

```ts
const client = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'agent-123',
});
```

Public agents are subject to:
- A per-IP rate limit (configurable per agent).
- An optional [Cost Control](https://www.swfte.com/products/cost-control) cap, so a brigade of bots can't drain your monthly budget.
- Optional CAPTCHA / reCAPTCHA challenge before the first message.

## Pattern 2 — Server-side proxy (recommended for authenticated apps)

When the agent is private, or when you want per-user rate limits, identity, or audit, route widget traffic through your own backend.

```
Browser  ─►  Your proxy  ─►  https://api.swfte.com/agents
            (adds Authorization, x-workspace-id)
```

The widget is configured against your proxy URL, not Swfte directly:

```ts
createSwfteChatClient({
  baseUrl: 'https://app.example.com/api/chat-proxy',
  widgetId: 'agent-123',
});
```

Sample proxy implementations live in:

- [`docs/integrations/nextjs.md`](integrations/nextjs.md) — Next.js App Router resource route.
- [`docs/integrations/remix.md`](integrations/remix.md) — Remix `*.tsx` resource route.
- [`docs/integrations/vue.md`](integrations/vue.md) — Nuxt `server/api` route.
- [`docs/integrations/svelte.md`](integrations/svelte.md) — SvelteKit `+server.ts`.
- [`examples/09-nextjs-rsc-proxy/`](../examples/09-nextjs-rsc-proxy) — runnable end-to-end example.

The proxy holds `SWFTE_API_KEY` and `SWFTE_WORKSPACE_ID` in environment variables, attaches them to every upstream request, and (optionally) enforces:

- Per-user rate limits
- Auth gate (only logged-in users may chat)
- Per-tenant routing (different `x-workspace-id` per customer)
- Request logging / observability

## Pattern 3 — Short-lived signed tokens

For pure SPAs without a backend, mint short-lived tokens server-side and hand them to the widget. Token endpoint:

```
POST /v2/auth/widget-tokens
Authorization: Bearer sk-swfte-...
{ "agentId": "agent-123", "userId": "u_42", "ttlSeconds": 900 }
```

Returns:

```json
{ "token": "eyJ...", "expiresAt": "2026-05-07T12:00:00Z" }
```

The widget accepts a `token` instead of an `apiKey`:

```ts
createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'agent-123',
  token,  // expires in 15 minutes
});
```

Refresh tokens are emitted automatically as `Set-Cookie` on subsequent requests. Implement a `getToken()` callback to mint a new one when the existing token expires:

```ts
createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'agent-123',
  getToken: async () => (await fetch('/api/widget-token')).json().then((j) => j.token),
});
```

## Content-Security-Policy

If your site uses a strict CSP, allow:

```
script-src  'self' https://unpkg.com 'sha256-...';
style-src   'self' 'unsafe-inline';
connect-src 'self' https://api.swfte.com wss://api.swfte.com;
media-src   'self' blob:;
img-src     'self' data: https:;
worker-src  'self' blob:;
```

If you self-host the bundle, drop `https://unpkg.com` and replace it with `'self'`.

The `'unsafe-inline'` style allowance is needed only if you use the default theme; if you ship a fully custom stylesheet, set `theme.unstyled: true` and remove it.

## Data the widget sends

| Direction | Data |
|---|---|
| Browser → Swfte | Visitor messages, identify metadata you pass, an anonymised visitor ID, page URL, user agent, timezone. |
| Swfte → Browser | Agent messages, citations, tool-call results, voice audio frames (if voice is enabled). |

The widget does **not** capture form fields, keystrokes outside its own input, or page DOM content. It does **not** auto-track navigation. Page URL is sent only when you call `client.setContext({ url: ... })`.

See [swfte.com/security](https://www.swfte.com/security) for Swfte's full security posture, data residency options, and SOC 2 status.

## Reporting a vulnerability

See [SECURITY.md](../SECURITY.md). Report to `security@swfte.com`. We respond within 48 hours.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
