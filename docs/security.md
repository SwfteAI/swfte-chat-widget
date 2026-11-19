# Security

This page covers how to deploy the [Swfte](https://www.swfte.com) chat widget without leaking credentials, what the widget sends over the wire, and how to integrate it with strict Content-Security-Policy and SOC 2 environments.

## Threat model

The widget runs **in the visitor's browser**. Anything the browser can read, the visitor can read. Treat the widget exactly like you'd treat any other piece of public-facing JavaScript:

- **OK in the browser:** a published `widgetId`, the widget API `baseUrl`, public theming config, and the SDK-managed visitor token.
- **NOT OK in the browser:** an `sk-swfte-...` API key, a workspace admin token, a customer's identity token.

## Public widget and visitor session

Publish a widget for your agent and use its public widget ID.

```ts
import { createSwfteChatClient } from '@swfte/chat-widget';

const client = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'your-published-widget-id',
});
await client.initialize();
```

The SDK creates the visitor session with `POST /v1/widgets/{widgetId}/visitors`. Subsequent authenticated requests use `X-Widget-Token`. Treat that token as a visitor credential and keep it out of logs. The general `SSEClient.connect` helper also uses the token header. Custom SSE endpoints need to accept that header and allow it in CORS when embedded cross-origin.

## Authenticated host proxy

For private deployments, configure `baseUrl` to your own authenticated backend. The proxy should verify the visitor's authorization and enforce per-user limits before forwarding requests to the configured Swfte upstream. Store any workspace API key in server configuration. Forward the SDK's visitor token in the `X-Widget-Token` header and keep credentials out of proxy logs.

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

The widget does **not** capture form fields, keystrokes outside its own input, or page DOM content. It does **not** auto-track navigation. The initial visitor-session request includes the current page URL.

See [swfte.com/security](https://www.swfte.com/security) for Swfte's full security posture, data residency options, and SOC 2 status.

## Reporting a vulnerability

See [SECURITY.md](../SECURITY.md). Report to `security@swfte.com`. We respond within 48 hours.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
