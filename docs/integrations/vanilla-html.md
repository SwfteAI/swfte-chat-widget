# Vanilla HTML / CDN

This is the zero-build integration: drop a `<script>` tag into any HTML page (marketing site, static landing, server-rendered template) and the [Swfte](https://www.swfte.com) widget mounts on page load.

## Minimal example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My site</title>
  </head>
  <body>
    <h1>My site</h1>

    <script src="https://unpkg.com/@swfte/chat-widget@latest/dist/swfte-chat.umd.js"></script>
    <script>
      const client = SwfteChat.createSwfteChatClient({
        baseUrl: 'https://api.swfte.com/agents',
        widgetId: 'agent-123',
      });

      const widget = client.createWidget({
        position: 'bottom-right',
        greeting: 'Hi there! How can we help?',
      });

      widget.mount(document.body);
    </script>
  </body>
</html>
```

## Pinning a version

Don't ship `@latest` to production — pin a specific version so an upstream release can't change your site behaviour without warning.

```html
<script src="https://unpkg.com/@swfte/chat-widget@1.1.0/dist/swfte-chat.umd.js"></script>
```

[unpkg](https://unpkg.com), [jsDelivr](https://www.jsdelivr.com), and [esm.sh](https://esm.sh) all serve the package — pick whichever your security review approves.

## Custom theming

```html
<script>
  const widget = SwfteChat.createSwfteChatClient({
    baseUrl: 'https://api.swfte.com/agents',
    widgetId: 'agent-123',
  }).createWidget({
    position: 'bottom-right',
    theme: {
      colors: {
        primary: '#10b981',
        primaryHover: '#059669',
      },
      radius: { md: '14px' },
    },
  });

  widget.mount(document.body);
</script>
```

See [docs/theming.md](../theming.md) for the full theme schema.

## Listening to events

```html
<script>
  const widget = SwfteChat.createSwfteChatClient({
    baseUrl: 'https://api.swfte.com/agents',
    widgetId: 'agent-123',
  }).createWidget({ position: 'bottom-right' });

  widget.on('open',    () => console.log('widget opened'));
  widget.on('close',   () => console.log('widget closed'));
  widget.on('message', (msg) => console.log('message', msg));
  widget.on('error',   (err) => console.error('error', err));

  widget.mount(document.body);
</script>
```

## Attaching to a specific element

If you want the widget mounted inside a particular container instead of `document.body` (for example, an embedded panel inside a help page):

```html
<div id="help-chat" style="height: 600px;"></div>
<script>
  const widget = SwfteChat.createSwfteChatClient({
    baseUrl: 'https://api.swfte.com/agents',
    widgetId: 'agent-123',
  }).createWidget({ type: 'embedded' });

  widget.mount(document.getElementById('help-chat'));
</script>
```

## Identifying the visitor

```html
<script>
  client.identify({
    id:    'user-42',
    email: 'jane@example.com',
    name:  'Jane Doe',
    metadata: { plan: 'pro', team: 'platform' },
  });
</script>
```

Identification lets the agent personalise replies and threads conversations across page loads. The metadata object is forwarded as conversation context to the [Swfte agents API](https://www.swfte.com/developers).

## Production checklist

- Pin to a specific version (not `@latest`).
- Do **not** put a long-lived `apiKey` directly in the HTML — proxy via your backend (see [docs/security.md](../security.md)).
- Add `https://api.swfte.com` and the unpkg/jsDelivr origin to your Content-Security-Policy `connect-src` and `script-src` directives.
- Set `baseUrl` from a build-time variable, not an inline string, so prod/staging/dev can differ.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
