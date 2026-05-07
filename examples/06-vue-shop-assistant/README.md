# 06 — Vue 3 Shop Assistant

A minimal [Vite](https://vitejs.dev) + [Vue 3](https://vuejs.org) example that mounts the [Swfte](https://www.swfte.com) chat widget on a fictional product page. The widget is told about the current product via `client.setContext()`, so the agent can answer "is this in stock?" and "what's the return policy?" with precise data.

## Run

```bash
cd examples/06-vue-shop-assistant
npm install
SWFTE_AGENT_ID=agent-123 npm run dev
```

Open http://localhost:5173 and click the floating bubble in the bottom-right.

## Configure

```env
# .env.local
VITE_SWFTE_BASE_URL=https://api.swfte.com/agents
VITE_SWFTE_AGENT_ID=agent-123
```

For production, route traffic through a server-side proxy so the API key never reaches the browser. See [docs/security.md](../../docs/security.md).

## What this shows

- Bringing the widget into Vue's `onMounted`/`onBeforeUnmount` lifecycle.
- Passing page-specific context (`client.setContext({ page: 'product', product })`) so the agent has the right knowledge to draw on.
- Theming the widget to match a black-and-white storefront brand.

Read more recipes on [swfte.com/resources](https://www.swfte.com/resources).
