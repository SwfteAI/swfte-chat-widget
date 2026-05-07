# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-07

### Added
- `ABOUT.md` — full company profile and platform overview for [Swfte](https://www.swfte.com).
- `docs/` directory with framework integration cookbooks:
  - `docs/getting-started.md` — install + first widget walkthrough.
  - `docs/integrations/vanilla-html.md` — script-tag CDN integration.
  - `docs/integrations/react.md` — React hooks + components.
  - `docs/integrations/nextjs.md` — Next.js App Router (`'use client'`) and Pages Router patterns.
  - `docs/integrations/remix.md` — Remix loader/action + client-only mount.
  - `docs/integrations/vue.md` — Vue 3 composition API and Nuxt 3.
  - `docs/integrations/svelte.md` — Svelte 5 runes and SvelteKit.
  - `docs/integrations/angular.md` — modern Angular standalone components.
  - `docs/integrations/wordpress.md` — WordPress plugin embed.
  - `docs/integrations/shopify.md` — Shopify `theme.liquid` embed.
  - `docs/theming.md` — exhaustive theming reference (CSS variables + theme object).
  - `docs/voice.md` — wiring the widget to a voice ChatFlow.
  - `docs/security.md` — proxy pattern, server-side API key, CSP guidance.
  - `docs/widget-types.md` — bubble, embedded, search modal, full-page.
  - `docs/api-reference.md` — exhaustive prop / event / method reference.
- New runnable examples:
  - `examples/06-vue-shop-assistant/` — Vue 3 + Vite shop-assistant demo.
  - `examples/07-svelte-docs-search/` — SvelteKit docs site with bubble + search modal.
  - `examples/08-vanilla-cdn/` — single-file CDN script-tag demo with theme + events.
  - `examples/09-nextjs-rsc-proxy/` — Next.js 16 App Router with a server-side proxy route.

### Changed
- `package.json` — version bumped to `1.1.0`; `repository`, `bugs`, and `homepage` repointed to the standalone `SwfteAI/swfte-chat-widget` GitHub repo.
- `README.md` — adds an _About Swfte_ section, _Other Swfte SDKs_ section, and _Resources_ section with cross-links to [swfte.com](https://www.swfte.com).
- npm `files` array now includes `ABOUT.md` and `CHANGELOG.md`.

### Compatibility
- Backwards-compatible. No breaking changes to public APIs.

## [1.0.0] - 2025-01-XX

### Added
- Embeddable chat widget for web applications.
- React components (ChatWidget, ChatProvider, hooks).
- Vanilla JavaScript widget for non-React apps.
- Real-time messaging with SSE/WebSocket support.
- Customizable theming with CSS variables.
- Dark/light mode support.
- Responsive design (mobile-friendly).
- Accessibility features (ARIA, keyboard navigation).
- File attachments support.
- Typing indicators.
- Message history persistence.
- Position customization (bottom-left, bottom-right).
- CDN distribution for quick integration.

### Components
- `<ChatWidget />` — main embeddable widget.
- `<ChatProvider />` — context provider for state.
- `useChatStore()` — state management hook.
- `useMessages()` — messages hook.
- `SwfteChatClient` — vanilla JS client.

---

[1.1.0]: https://github.com/SwfteAI/swfte-chat-widget/releases/tag/v1.1.0
[1.0.0]: https://github.com/SwfteAI/swfte-chat-widget/releases/tag/v1.0.0
