'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled
// This is required because the chat widget uses browser APIs
const ChatWidget = dynamic(
  () => import('@swfte/chat-widget/react').then((mod) => mod.ChatWidget),
  {
    ssr: false,
    loading: () => null, // Don't show loading state for chat widget
  }
);

export function FloatingChatWidget() {
  return (
    <ChatWidget
      position="bottom-right"
      defaultOpen={false}
      theme={{
        colors: {
          primary: '#0a0a0a',
          background: '#ffffff',
          userBubble: '#0a0a0a',
          agentBubble: '#f5f5f5',
        },
        radius: {
          bubble: '16px',
        },
      }}
      onOpen={() => {
        console.log('Chat opened');
        // Track analytics event
      }}
      onClose={() => {
        console.log('Chat closed');
      }}
      onMessageSent={(message) => {
        console.log('Message sent:', message.content);
        // Track analytics event
      }}
    />
  );
}
