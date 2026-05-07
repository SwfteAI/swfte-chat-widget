import { useState, useEffect, useCallback } from 'react';
import { ChatProvider, AISearch } from '@swfte/chat-widget/react';
import type { SearchResult, SearchResponse } from '@swfte/chat-widget/react';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback((query: string, response: SearchResponse) => {
    console.log('Search performed:', query, response);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log('Result clicked:', result);
    setIsSearchOpen(false);
    // Navigate to the result URL
    if (result.url) {
      window.location.href = result.url;
    }
  }, []);

  return (
    <ChatProvider
      config={{
        baseUrl: 'http://localhost:8307',
        widgetId: 'docs-search',
        agentId: '77a3b62c-c137-44ff-b7ee-5ffc497f7949', // SDK Test Agent
      }}
    >
      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span>Acme</span> Docs
          </div>

          <div className="sidebar-section">
            <h3>Getting Started</h3>
            <ul>
              <li><a href="#" className="active">Introduction</a></li>
              <li><a href="#">Installation</a></li>
              <li><a href="#">Quick Start</a></li>
              <li><a href="#">Configuration</a></li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>Core Concepts</h3>
            <ul>
              <li><a href="#">Authentication</a></li>
              <li><a href="#">Authorization</a></li>
              <li><a href="#">Data Models</a></li>
              <li><a href="#">Webhooks</a></li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>API Reference</h3>
            <ul>
              <li><a href="#">Users</a></li>
              <li><a href="#">Organizations</a></li>
              <li><a href="#">Projects</a></li>
              <li><a href="#">Workflows</a></li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>SDKs</h3>
            <ul>
              <li><a href="#">JavaScript</a></li>
              <li><a href="#">Python</a></li>
              <li><a href="#">Go</a></li>
              <li><a href="#">Ruby</a></li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Header */}
          <header className="docs-header">
            <div className="search-container">
              <button
                onClick={() => setIsSearchOpen(true)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Search documentation...</span>
                <span className="kbd">⌘K</span>
              </button>
            </div>
            <div className="header-actions">
              <a href="#">GitHub</a>
              <a href="#">Discord</a>
              <button className="btn btn-primary">Dashboard</button>
            </div>
          </header>

          {/* Content */}
          <div className="content-area">
            <h1>Introduction</h1>
            <p className="subtitle">
              Welcome to the Acme API documentation. Learn how to integrate
              our powerful platform into your applications.
            </p>

            <div className="quick-links">
              <a href="#" className="quick-link">
                <h4>Quick Start →</h4>
                <p>Get up and running in 5 minutes</p>
              </a>
              <a href="#" className="quick-link">
                <h4>API Reference →</h4>
                <p>Explore all API endpoints</p>
              </a>
              <a href="#" className="quick-link">
                <h4>Examples →</h4>
                <p>Browse example projects</p>
              </a>
            </div>

            <h2>What is Acme?</h2>
            <p>
              Acme is a comprehensive API platform that helps developers build
              powerful integrations. With our suite of APIs, you can automate
              workflows, manage users, and scale your applications effortlessly.
            </p>

            <div className="callout">
              <p>
                <strong>Tip:</strong> Use the AI-powered search above to find
                exactly what you're looking for. Try pressing <code>⌘K</code> to
                open the search modal.
              </p>
            </div>

            <h2>Installation</h2>
            <p>
              Install the Acme SDK using your preferred package manager:
            </p>

            <div className="code-block">
              <span className="comment"># Using npm</span><br />
              npm install @acme/sdk<br /><br />
              <span className="comment"># Using yarn</span><br />
              yarn add @acme/sdk<br /><br />
              <span className="comment"># Using pnpm</span><br />
              pnpm add @acme/sdk
            </div>

            <h2>Basic Usage</h2>
            <p>
              Initialize the client with your API key and start making requests:
            </p>

            <div className="code-block">
              <span className="keyword">import</span> {'{'} Acme {'}'} <span className="keyword">from</span> <span className="string">'@acme/sdk'</span>;<br /><br />
              <span className="keyword">const</span> <span className="variable">client</span> = <span className="keyword">new</span> <span className="function">Acme</span>({'{'}<br />
              &nbsp;&nbsp;apiKey: process.env.<span className="variable">ACME_API_KEY</span>,<br />
              {'}'});<br /><br />
              <span className="comment">// List all users</span><br />
              <span className="keyword">const</span> <span className="variable">users</span> = <span className="keyword">await</span> client.users.<span className="function">list</span>();<br />
              console.<span className="function">log</span>(users);
            </div>

            <h2>Authentication</h2>
            <p>
              All API requests require authentication. You can authenticate using
              API keys or OAuth 2.0 tokens.
            </p>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Use Case</th>
                    <th>Security Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>API Key</code></td>
                    <td>Server-to-server communication</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td><code>OAuth 2.0</code></td>
                    <td>User-facing applications</td>
                    <td>High</td>
                  </tr>
                  <tr>
                    <td><code>JWT Token</code></td>
                    <td>Short-lived access</td>
                    <td>Medium</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="callout warning">
              <p>
                <strong>Security Notice:</strong> Never expose your API keys in
                client-side code. Always use environment variables and keep your
                keys secure.
              </p>
            </div>

            <h2>Rate Limits</h2>
            <p>
              To ensure fair usage, our API implements rate limiting. The default
              limits are:
            </p>
            <ul style={{ marginLeft: '24px', marginBottom: '16px', color: '#475569' }}>
              <li>1,000 requests per minute for standard plans</li>
              <li>10,000 requests per minute for pro plans</li>
              <li>Unlimited requests for enterprise plans</li>
            </ul>

            <div className="callout success">
              <p>
                <strong>Next Steps:</strong> Now that you understand the basics,
                check out our <a href="#">Quick Start guide</a> to build your
                first integration.
              </p>
            </div>
          </div>
        </main>

        {/* Search Modal */}
        {isSearchOpen && (
          <div
            className="search-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSearchOpen(false);
              }
            }}
          >
            <div className="search-modal">
              <AISearch
                placeholder="Search documentation..."
                showSuggestions={true}
                maxResults={8}
                showCitations={true}
                showPoweredBy={true}
                onSearch={handleSearch}
                onResultClick={handleResultClick}
                theme={{
                  colors: {
                    primary: '#6366f1',
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </ChatProvider>
  );
}

export default App;
