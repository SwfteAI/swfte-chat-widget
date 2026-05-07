<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { createSwfteChatClient } from '@swfte/chat-widget';

const root = ref<HTMLDivElement | null>(null);
let widget: any;

const product = {
  id:    'sku-aurora-wool-coat',
  title: 'Aurora Wool Coat',
  price: '£249',
  inStock: true,
};

onMounted(() => {
  const client = createSwfteChatClient({
    baseUrl: import.meta.env.VITE_SWFTE_BASE_URL ?? 'https://api.swfte.com/agents',
    widgetId: import.meta.env.VITE_SWFTE_AGENT_ID ?? 'agent-shop-assistant',
  });

  client.setContext({
    page: 'product',
    product,
  });

  widget = client.createWidget({
    position: 'bottom-right',
    greeting: `Hi! Ask me anything about the ${product.title} — sizing, materials, returns.`,
    theme: {
      colors: {
        primary: '#111111',
        primaryHover: '#333333',
      },
      radius: { md: '14px' },
    },
  });

  widget.mount(root.value!);
});

onBeforeUnmount(() => widget?.unmount());
</script>

<template>
  <main class="page">
    <header class="header">
      <strong>aurora.shop</strong>
    </header>

    <section class="product">
      <div class="product__image"></div>
      <div class="product__details">
        <h1>{{ product.title }}</h1>
        <p class="price">{{ product.price }}</p>
        <p>Hand-finished merino wool. Cut in Northumberland. Lined with Bemberg cupro.</p>
        <button>Add to bag</button>
      </div>
    </section>

    <div ref="root"></div>
  </main>
</template>

<style>
  body { margin: 0; font-family: system-ui, sans-serif; color: #111; }
  .header { padding: 24px; border-bottom: 1px solid #eee; }
  .page { max-width: 960px; margin: 0 auto; }
  .product { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 48px 24px; }
  .product__image { background: linear-gradient(135deg, #ddd, #aaa); border-radius: 12px; min-height: 420px; }
  .price { font-size: 1.5rem; margin: 8px 0 16px; }
  button { background: #111; color: #fff; border: 0; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
</style>
