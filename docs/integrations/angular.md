# Angular

This guide targets modern Angular (16+) with **standalone components** and the new control-flow syntax. Older NgModule-based apps work the same — wrap the component in your existing module.

## Install

```bash
npm install @swfte/chat-widget
```

## Standalone component

```ts
// src/app/swfte-chat.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createSwfteChatClient } from '@swfte/chat-widget';

@Component({
  selector: 'swfte-chat',
  standalone: true,
  template: '<div #root></div>',
})
export class SwfteChatComponent implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) root!: ElementRef<HTMLDivElement>;
  @Input() agentId!: string;
  @Input() baseUrl: string = 'https://api.swfte.com/agents';
  @Input() position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';

  private widget: any;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const client = createSwfteChatClient({
      baseUrl: this.baseUrl,
      widgetId: this.agentId,
    });
    this.widget = client.createWidget({ position: this.position });
    this.widget.mount(this.root.nativeElement);
  }

  ngOnDestroy() {
    this.widget?.unmount();
  }
}
```

Use it anywhere in your standalone app:

```ts
// src/app/app.component.ts
import { Component } from '@angular/core';
import { SwfteChatComponent } from './swfte-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SwfteChatComponent],
  template: `
    <main>
      <h1>My app</h1>
    </main>
    <swfte-chat agentId="agent-123" position="bottom-right" />
  `,
})
export class AppComponent {}
```

## Service for imperative control

```ts
// src/app/swfte-chat.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createSwfteChatClient, SwfteChatClient } from '@swfte/chat-widget';

@Injectable({ providedIn: 'root' })
export class SwfteChatService {
  private client?: SwfteChatClient;
  private widget?: any;
  private platformId = inject(PLATFORM_ID);

  init(agentId: string, baseUrl: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.client = createSwfteChatClient({ baseUrl, widgetId: agentId });
    this.widget = this.client.createWidget({ position: 'bottom-right' });
    this.widget.mount(document.body);
  }

  open()    { this.widget?.open(); }
  close()   { this.widget?.close(); }
  send(t: string) { return this.widget?.sendMessage(t); }

  identify(user: { id: string; email?: string; name?: string }) {
    this.client?.identify(user);
  }
}
```

## SSR (Angular Universal)

The widget hits browser APIs (WebSocket, `localStorage`, `window`), so guard the mount with `isPlatformBrowser(PLATFORM_ID)` as shown above. Without that guard, `ng build && node dist/server.mjs` will throw `window is not defined`.

## Server-side proxy

For production, do **not** put the API key in the browser. Stand up a small server route in your Angular app's express/fastify backend and have the widget point at it:

```ts
// server.ts (Angular Universal express server, simplified)
import express from 'express';

const app = express();

app.all('/api/chat-proxy/*', async (req, res) => {
  const path = req.url.replace('/api/chat-proxy', '');
  const upstream = await fetch(`https://api.swfte.com/agents${path}`, {
    method: req.method,
    headers: {
      ...req.headers,
      Authorization: `Bearer ${process.env['SWFTE_API_KEY']!}`,
      'x-workspace-id': process.env['SWFTE_WORKSPACE_ID']!,
    } as any,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
    // @ts-expect-error duplex flag
    duplex: 'half',
  });
  res.status(upstream.status);
  upstream.headers.forEach((v, k) => res.setHeader(k, v));
  if (upstream.body) {
    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
});
```

Then point the component at it:

```html
<swfte-chat agentId="agent-123" baseUrl="/api/chat-proxy" />
```

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
