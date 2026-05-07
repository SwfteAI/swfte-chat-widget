<script lang="ts">
  import { onMount } from 'svelte';
  import { createSwfteChatClient } from '@swfte/chat-widget';

  let bubbleRoot: HTMLDivElement;
  let searchRoot: HTMLDivElement;
  let bubble: any;
  let search: any;

  let { children } = $props();

  onMount(() => {
    const client = createSwfteChatClient({
      baseUrl: import.meta.env.VITE_SWFTE_BASE_URL ?? 'https://api.swfte.com/agents',
      widgetId: import.meta.env.VITE_SWFTE_AGENT_ID ?? 'agent-docs',
    });

    bubble = client.createWidget({
      type: 'bubble',
      position: 'bottom-right',
      greeting: 'Hi! Ask me anything about the docs.',
    });
    bubble.mount(bubbleRoot);

    search = client.createWidget({
      type: 'search',
      hotkey: 'cmd+k',
      placeholder: 'Search documentation…',
      showCitations: true,
    });
    search.mount(searchRoot);

    return () => {
      bubble?.unmount();
      search?.unmount();
    };
  });
</script>

<header>
  <strong>Swfte Docs</strong>
  <button onclick={() => search?.open()}>Search ⌘K</button>
</header>

<main>
  {@render children?.()}
</main>

<div bind:this={bubbleRoot}></div>
<div bind:this={searchRoot}></div>

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; color: #111; }
  header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #eee; }
  button { padding: 8px 16px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 14px; }
  main { max-width: 800px; margin: 0 auto; padding: 32px 24px; line-height: 1.7; }
</style>
