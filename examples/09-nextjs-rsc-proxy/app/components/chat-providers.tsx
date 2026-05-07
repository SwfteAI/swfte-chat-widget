'use client';

import { ChatProvider } from '@swfte/chat-widget/react';
import type { ReactNode } from 'react';

export function ChatProviders({ children }: { children: ReactNode }) {
  return (
    <ChatProvider
      config={{
        // Note: baseUrl points at our own server-side proxy route, not directly at api.swfte.com.
        baseUrl: '/api/chat-proxy',
        // The widget SDK expects a Swfte WIDGET id (a published configuration
        // wrapping an agent + appearance), NOT a raw agent id. Create one
        // following the curl snippet in README.md.
        widgetId: process.env.NEXT_PUBLIC_WIDGET_ID ?? 'replace-with-your-widget-id',
      }}
    >
      {children}
    </ChatProvider>
  );
}
