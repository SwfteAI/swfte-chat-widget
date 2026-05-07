'use client';

import dynamic from 'next/dynamic';

// The widget needs window/localStorage — skip SSR.
const ChatWidget = dynamic(
  () => import('@swfte/chat-widget/react').then((m) => m.ChatWidget),
  { ssr: false },
);

export function ChatBubble() {
  return <ChatWidget position="bottom-right" greeting="Hi! Ask me anything." />;
}
