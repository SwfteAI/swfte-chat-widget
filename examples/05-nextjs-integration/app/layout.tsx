import type { Metadata } from 'next';
import './globals.css';
import { ChatWidgetProvider } from '@/components/ChatWidgetProvider';

export const metadata: Metadata = {
  title: 'Next.js + Swfte Chat Widget',
  description: 'Example integration of Swfte Chat Widget with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChatWidgetProvider>
          <nav className="nav">
            <div className="nav-container">
              <a href="/" className="nav-logo">Acme</a>
              <div className="nav-links">
                <a href="#features">Features</a>
                <a href="/chat">Chat</a>
                <a href="#pricing">Pricing</a>
                <a href="#docs">Docs</a>
              </div>
              <a href="#" className="nav-cta">Get Started</a>
            </div>
          </nav>
          {children}
        </ChatWidgetProvider>
      </body>
    </html>
  );
}
