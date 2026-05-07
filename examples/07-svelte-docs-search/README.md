# 07 — SvelteKit Docs Search

A minimal [SvelteKit](https://kit.svelte.dev) example with two [Swfte](https://www.swfte.com) widgets mounted at the same time:

1. A floating **bubble** in the bottom-right.
2. A command-palette **search modal** triggered by <kbd>⌘K</kbd>.

Both widgets share state — open the modal, send a message, close it, and the conversation continues in the bubble.

## Run

```bash
cd examples/07-svelte-docs-search
npm install
SWFTE_AGENT_ID=agent-123 npm run dev
```

Open http://localhost:5173.

## Configure

```env
# .env.local
VITE_SWFTE_BASE_URL=https://api.swfte.com/agents
VITE_SWFTE_AGENT_ID=agent-123
```

For production, route through the SvelteKit `+server.ts` proxy pattern documented at [docs/integrations/svelte.md](../../docs/integrations/svelte.md) so your API key never reaches the browser.

## What this shows

- Mounting multiple widget instances against a single client.
- Wiring a hotkey (<kbd>⌘K</kbd>) to a search modal alongside a bubble.
- Using SvelteKit's `+layout.svelte` to mount widgets globally without re-instantiating on navigation.

Read more recipes on [swfte.com/resources](https://www.swfte.com/resources).
