# Shopify

Drop the [Swfte](https://www.swfte.com) chat widget into any Shopify storefront in under five minutes by editing `theme.liquid`. Works on Online Store 2.0, vintage themes, and Hydrogen.

## 1. Edit `theme.liquid`

`Online Store → Themes → Customize → ⋯ → Edit code → layout/theme.liquid`

Just before the closing `</body>` tag, paste:

```liquid
<script src="https://unpkg.com/@swfte/chat-widget@1.1.0/dist/swfte-chat.umd.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    var client = SwfteChat.createSwfteChatClient({
      baseUrl: 'https://api.swfte.com/agents',
      widgetId: '{{ shop.metafields.swfte.agent_id | default: "agent-123" }}',
    });

    var widget = client.createWidget({
      position: 'bottom-right',
      greeting: 'Hi! Need help finding something?',
      theme: {
        colors: {
          primary: '{{ settings.color_button | default: "#111111" }}',
        },
      },
    });

    widget.mount(document.body);

    {% if customer %}
      client.identify({
        id:    '{{ customer.id }}',
        email: '{{ customer.email }}',
        name:  '{{ customer.name }}',
        metadata: {
          orders_count: {{ customer.orders_count | default: 0 }},
          total_spent:  '{{ customer.total_spent | money_without_currency }}',
          tags:         {{ customer.tags | json }},
        },
      });
    {% endif %}
  });
</script>
```

## 2. Add a metafield for the Agent ID

`Settings → Custom data → Shop → Add definition`

- Namespace + key: `swfte.agent_id`
- Type: Single line text

Set the value once per store, and the snippet above will use it everywhere. To override per page, set a metafield on a page or a product and reference it.

## 3. Product-aware greetings

When the widget is on a product page, pass the product context so the agent can answer "is this in stock?" or "what's the return policy?" with precise data:

```liquid
{% if template contains 'product' %}
<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.swfteChatClient) return;
    window.swfteChatClient.setContext({
      page: 'product',
      product: {
        id:           '{{ product.id }}',
        title:        {{ product.title | json }},
        price:        '{{ product.price | money }}',
        url:          '{{ shop.url }}{{ product.url }}',
        in_stock:     {{ product.available }},
        vendor:       {{ product.vendor | json }},
      },
    });
  });
</script>
{% endif %}
```

## 4. Don't expose the API key

The snippet above uses an `agentId` (safe, public) — the widget calls Swfte directly without an API key on the client. For workflows that **need** authenticated traffic, deploy a tiny proxy (a Cloudflare Worker, Vercel Function, or a Shopify App Proxy) that holds `SWFTE_API_KEY` server-side and forwards `/api/chat-proxy/*` to `https://api.swfte.com/agents/*`. See [docs/security.md](../security.md).

## 5. Hydrogen / Oxygen storefronts

Hydrogen is React-based — follow the [React integration guide](react.md) instead. The same proxy pattern applies; route through Hydrogen's `loader` resource routes.

## 6. Hide the widget on checkout

Shopify checkout pages are fully managed and cannot include third-party widgets. The snippet above only loads on storefront templates — checkout pages won't see it. Nothing to do.

## CSP

If you've turned on a custom Content-Security-Policy via a Shopify Plus checkout extension or via a reverse proxy, add:

```
script-src  'self' https://unpkg.com;
connect-src 'self' https://api.swfte.com wss://api.swfte.com;
```

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
