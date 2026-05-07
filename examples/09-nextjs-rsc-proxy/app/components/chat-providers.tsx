'use client';

import { ChatProvider } from '@swfte/chat-widget/react';
import type { ReactNode } from 'react';

export function ChatProviders({ children }: { children: ReactNode }) {
  return (
    <ChatProvider
      config={{
        // Note: baseUrl points at our own server-side proxy route, not directly at api.swfte.com.
        baseUrl: '/api/chat-proxy',
        widgetId: process.env.NEXT_PUBLIC_AGENT_ID ?? 'agent-123',
      }}
    >
      {children}
    </ChatProvider>
  );
}
