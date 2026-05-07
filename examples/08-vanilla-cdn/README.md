# 08 — Vanilla CDN

Single-file [Swfte](https://www.swfte.com) chat widget integration — no build step, no package manager. Just `index.html`.

## Run

```bash
cd examples/08-vanilla-cdn
npx serve .
# or: python3 -m http.server 8080
```

Open http://localhost:3000.

## What this shows

- Loading the widget from [unpkg](https://unpkg.com) with a pinned version.
- Theming the widget with a custom indigo primary color and radius.
- Identifying the visitor via `client.identify()`.
- Subscribing to widget events (`ready`, `open`, `close`, `message:sent`, `message:recv`, `error`) and rendering them to a live log on the page.
- Driving the widget imperatively via DOM buttons (`widget.open()`, `widget.sendMessage()`, `widget.clearHistory()`).

## Configure

Replace the placeholder `agent-123` widget ID inside `index.html` with one from your [Swfte](https://www.swfte.com) workspace.

For production, do **not** put a long-lived API key inline — proxy via your backend. See [docs/security.md](../../docs/security.md).

Read more recipes on [swfte.com/resources](https://www.swfte.com/resources).
