import { useState } from 'react';
import { ChatProvider, ChatWidget } from '@swfte/chat-widget/react';
import type { ChatTheme } from '@swfte/chat-widget';

// Theme presets for demo
const themePresets: Record<string, Partial<ChatTheme>> = {
  blue: {
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
      userBubble: '#3b82f6',
      agentBubble: '#f3f4f6',
    },
  },
  purple: {
    colors: {
      primary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937',
      userBubble: '#8b5cf6',
      agentBubble: '#f3f4f6',
    },
  },
  green: {
    colors: {
      primary: '#10b981',
      background: '#ffffff',
      text: '#1f2937',
      userBubble: '#10b981',
      agentBubble: '#f3f4f6',
    },
  },
  orange: {
    colors: {
      primary: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
      userBubble: '#f59e0b',
      agentBubble: '#f3f4f6',
    },
  },
};

const colorMap: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f59e0b',
};

function App() {
  const [activeTheme, setActiveTheme] = useState<string>('blue');

  return (
    <ChatProvider
      config={{
        baseUrl: 'http://localhost:8307',
        widgetId: 'sdk-demo',
        agentId: '77a3b62c-c137-44ff-b7ee-5ffc497f7949', // SDK Test Agent
      }}
      onReady={(client) => {
        console.log('Chat client ready!', client);
      }}
      onError={(error) => {
        console.error('Chat client error:', error);
      }}
    >
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo">SaaSify</div>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <h1>Build Better Products</h1>
          <p>
            The all-in-one platform for modern SaaS companies.
            Ship faster, scale smarter, and delight your customers.
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn btn-primary">Start Free Trial</a>
            <a href="#" className="btn btn-secondary">Watch Demo</a>
          </div>
        </section>

        {/* Features Section */}
        <section className="features" id="features">
          <h2>Everything You Need</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Lightning Fast</h3>
              <p>
                Optimized for speed with global CDN distribution and
                intelligent caching for sub-100ms response times.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>
                SOC 2 Type II certified with end-to-end encryption,
                SSO support, and advanced access controls.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>
                Real-time dashboards, custom reports, and AI-powered
                insights to drive data-informed decisions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔌</div>
              <h3>Powerful Integrations</h3>
              <p>
                Connect with 100+ tools including Slack, Salesforce,
                HubSpot, and custom webhooks.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Support</h3>
              <p>
                Intelligent chatbot that understands context, provides
                instant answers, and escalates when needed.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>
                Native iOS and Android apps with offline support and
                push notifications.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing" id="pricing">
          <h2>Simple, Transparent Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Starter</h3>
              <div className="price">$29<span>/month</span></div>
              <ul className="pricing-features">
                <li>Up to 1,000 users</li>
                <li>5 team members</li>
                <li>Basic analytics</li>
                <li>Email support</li>
              </ul>
              <button className="btn btn-primary">Get Started</button>
            </div>
            <div className="pricing-card featured">
              <h3>Professional</h3>
              <div className="price">$99<span>/month</span></div>
              <ul className="pricing-features">
                <li>Up to 10,000 users</li>
                <li>Unlimited team members</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
              </ul>
              <button className="btn btn-primary">Get Started</button>
            </div>
            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">Custom</div>
              <ul className="pricing-features">
                <li>Unlimited users</li>
                <li>Dedicated support</li>
                <li>Custom SLA</li>
                <li>On-premise option</li>
                <li>White-label ready</li>
              </ul>
              <button className="btn btn-primary">Contact Sales</button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>&copy; 2024 SaaSify. All rights reserved.</p>
        </footer>

        {/* Theme Toggle Panel */}
        <div className="theme-toggle">
          <h4>Widget Theme</h4>
          <div className="color-options">
            {Object.entries(colorMap).map(([name, color]) => (
              <button
                key={name}
                className={`color-option ${activeTheme === name ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveTheme(name)}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* Chat Widget */}
        <ChatWidget
          position="bottom-right"
          theme={themePresets[activeTheme]}
          defaultOpen={false}
          onOpen={() => console.log('Chat opened')}
          onClose={() => console.log('Chat closed')}
          onMessageSent={(msg) => console.log('Message sent:', msg)}
        />
      </div>
    </ChatProvider>
  );
}

export default App;
