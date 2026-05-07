import Link from 'next/link';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1>Build faster with AI-powered chat</h1>
        <p>
          Integrate intelligent chat capabilities into your Next.js applications
          in minutes. Support customers 24/7 with AI agents that understand context.
        </p>
        <div className="hero-buttons">
          <Link href="/chat" className="btn btn-primary">
            Try Live Demo
          </Link>
          <a href="#features" className="btn btn-secondary">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-container">
          <h2>Everything you need</h2>
          <p className="subtitle">
            Build delightful chat experiences with our comprehensive SDK
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Server Components Ready</h3>
              <p>
                Works seamlessly with Next.js 14 App Router and React Server
                Components. Dynamic imports ensure client-only rendering.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Fully Customizable</h3>
              <p>
                Match your brand with custom themes, colors, and styling.
                White-label ready for enterprise deployments.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Real-time Updates</h3>
              <p>
                WebSocket-powered instant messaging with typing indicators,
                presence detection, and message status updates.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Responses</h3>
              <p>
                Connect to any AI agent for intelligent, context-aware responses.
                Supports streaming for natural conversations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Semantic Search</h3>
              <p>
                Built-in AI search component for documentation sites. Find
                relevant content instantly with vector search.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>
                Looks great on any device. Floating widget, embedded chat,
                and full-page options available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to get started?</h2>
        <p>
          Add AI-powered chat to your Next.js app in under 5 minutes.
        </p>
        <Link href="/chat" className="btn btn-primary">
          View Live Demo →
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 Acme Inc. Powered by Swfte Chat Widget.</p>
      </footer>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </>
  );
}
