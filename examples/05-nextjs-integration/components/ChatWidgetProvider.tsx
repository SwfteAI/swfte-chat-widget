'use client';

import { ChatProvider } from '@swfte/chat-widget/react';

interface ChatWidgetProviderProps {
  children: React.ReactNode;
}

export function ChatWidgetProvider({ children }: ChatWidgetProviderProps) {
  return (
    <ChatProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8307',
        widgetId: process.env.NEXT_PUBLIC_WIDGET_ID || 'nextjs-demo',
        agentId: process.env.NEXT_PUBLIC_AGENT_ID || '77a3b62c-c137-44ff-b7ee-5ffc497f7949', // SDK Test Agent
      }}
      autoInit={true}
      onReady={(client) => {
        console.log('Swfte Chat initialized');

        // Example: Identify user if logged in
        // This could come from your auth provider (NextAuth, Clerk, etc.)
        const user = typeof window !== 'undefined'
          ? localStorage.getItem('user')
          : null;

        if (user) {
          const userData = JSON.parse(user);
          client.identify({
            email: userData.email,
            name: userData.name,
          });
        }
      }}
      onError={(error) => {
        console.error('Chat initialization error:', error);
      }}
    >
      {children}
    </ChatProvider>
  );
}
