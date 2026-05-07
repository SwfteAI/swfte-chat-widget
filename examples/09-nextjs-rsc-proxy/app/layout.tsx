import type { ReactNode } from 'react';
import { ChatProviders } from './components/chat-providers';

export const metadata = {
  title: 'Swfte Chat — Next.js RSC Proxy Example',
  description: 'Demonstrates the server-side proxy pattern: API key never reaches the browser.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <ChatProviders>{children}</ChatProviders>
      </body>
    </html>
  );
}
