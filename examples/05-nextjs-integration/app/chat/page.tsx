'use client';

import { EmbeddedChat } from '@swfte/chat-widget/react';

export default function ChatPage() {
  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <h1>Live Chat Demo</h1>
        <p>Chat with our AI assistant to see the SDK in action</p>
      </div>

      <div className="chat-page-content">
        <EmbeddedChat
          showHeader={true}
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
          style={{
            height: '600px',
            border: '1px solid #eaeaea',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        />

        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Integration Code</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Here's how to add the chat widget to your Next.js application:
          </p>

          <div className="code-example">
            <div className="code-header">
              <span>components/ChatWidgetProvider.tsx</span>
            </div>
            <div className="code-content">
              <pre>{`'use client';

import { ChatProvider } from '@swfte/chat-widget/react';

export function ChatWidgetProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_CHAT_API_URL,
        widgetId: process.env.NEXT_PUBLIC_WIDGET_ID,
      }}
    >
      {children}
    </ChatProvider>
  );
}`}</pre>
            </div>
          </div>

          <div className="code-example">
            <div className="code-header">
              <span>components/FloatingChatWidget.tsx</span>
            </div>
            <div className="code-content">
              <pre>{`'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled for client-only widget
const ChatWidget = dynamic(
  () => import('@swfte/chat-widget/react').then(m => m.ChatWidget),
  { ssr: false }
);

export function FloatingChatWidget() {
  return (
    <ChatWidget
      position="bottom-right"
      theme={{
        colors: { primary: '#0a0a0a' }
      }}
    />
  );
}`}</pre>
            </div>
          </div>

          <div className="code-example">
            <div className="code-header">
              <span>app/layout.tsx</span>
            </div>
            <div className="code-content">
              <pre>{`import { ChatWidgetProvider } from '@/components/ChatWidgetProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChatWidgetProvider>
          {children}
        </ChatWidgetProvider>
      </body>
    </html>
  );
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Acme Inc. Powered by Swfte Chat Widget.</p>
      </footer>
    </div>
  );
}
