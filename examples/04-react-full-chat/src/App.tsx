import { useState, useCallback } from 'react';
import {
  ChatProvider,
  EmbeddedChat,
  useChat,
  useConversation,
} from '@swfte/chat-widget/react';
import type { Conversation } from '@swfte/chat-widget';

// Mock conversation data for demo
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    agentId: 'support-agent',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    metadata: { title: 'Help with API integration' },
  },
  {
    id: 'conv-2',
    agentId: 'sales-agent',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    metadata: { title: 'Pricing questions' },
  },
  {
    id: 'conv-3',
    agentId: 'support-agent',
    status: 'closed',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    metadata: { title: 'Bug report: Login issues' },
  },
];

const agents = [
  { id: '77a3b62c-c137-44ff-b7ee-5ffc497f7949', name: 'SDK Test Agent', icon: '🛟' },
  { id: '19606693-b3ed-4b91-b53a-99a9d9921670', name: 'Claude Agent', icon: '🤖' },
  { id: 'a460a79b-8b08-4b1d-bfff-7c49371d6154', name: 'OpenAI Agent', icon: '💼' },
];

function ChatApplication() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id);
  const [conversations, setConversations] = useState(mockConversations);

  const { sendMessage } = useChat();
  const { createConversation } = useConversation();

  const handleNewChat = useCallback(async () => {
    try {
      const newConv = await createConversation({
        title: 'New conversation',
        agentId: selectedAgent,
      });
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversation(newConv.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // For demo purposes, create a mock conversation
      const mockNewConv: Conversation = {
        id: `conv-${Date.now()}`,
        agentId: selectedAgent,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: { title: 'New conversation' },
      };
      setConversations((prev) => [mockNewConv, ...prev]);
      setSelectedConversation(mockNewConv.id);
    }
  }, [createConversation, selectedAgent]);

  const handleQuickAction = useCallback((message: string) => {
    sendMessage(message);
  }, [sendMessage]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const currentAgent = agents.find((a) => a.id === selectedAgent);

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h1>Messages</h1>
          <p>Chat with our AI agents</p>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <span>+</span> New Chat
        </button>

        <div className="conversations-list">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv.id)}
            >
              <h3>{conv.metadata?.title || 'Untitled conversation'}</h3>
              <p>
                {conv.status === 'active' ? 'Active conversation' : 'Closed'}
              </p>
              <div className="meta">
                <span className="time">{formatTime(conv.updatedAt)}</span>
                {conv.id === 'conv-1' && <span className="unread">2</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="agent-selector">
          <label>Select Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.icon} {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="user-panel">
          <div className="user-panel-header">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <h3>John Doe</h3>
              <p>john@example.com</p>
            </div>
          </div>
          <div className="user-stats">
            <div className="stat">
              <div className="stat-value">{conversations.length}</div>
              <div className="stat-label">Conversations</div>
            </div>
            <div className="stat">
              <div className="stat-value">12</div>
              <div className="stat-label">Messages Today</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {selectedConversation ? (
          <div className="chat-view">
            <header className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  {currentAgent?.icon || '🤖'}
                </div>
                <div className="chat-header-text">
                  <h2>{currentAgent?.name || 'AI Agent'}</h2>
                  <p>Online • Ready to help</p>
                </div>
              </div>
              <div className="chat-actions">
                <button className="chat-action-btn" title="Search">🔍</button>
                <button className="chat-action-btn" title="Settings">⚙️</button>
                <button
                  className="chat-action-btn"
                  title="Close"
                  onClick={() => setSelectedConversation(null)}
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="embedded-chat-wrapper">
              <EmbeddedChat
                conversationId={selectedConversation}
                showHeader={false}
                theme={{
                  colors: {
                    primary: '#3b82f6',
                    background: '#ffffff',
                    userBubble: '#3b82f6',
                    agentBubble: '#f3f4f6',
                  },
                }}
              />
            </div>

            <div className="quick-actions">
              <p>Quick replies:</p>
              <div className="quick-action-buttons">
                <button
                  className="quick-action"
                  onClick={() => handleQuickAction('How do I get started?')}
                >
                  How do I get started?
                </button>
                <button
                  className="quick-action"
                  onClick={() => handleQuickAction('What are your pricing plans?')}
                >
                  Pricing plans
                </button>
                <button
                  className="quick-action"
                  onClick={() => handleQuickAction('I need help with integration')}
                >
                  Integration help
                </button>
                <button
                  className="quick-action"
                  onClick={() => handleQuickAction('Talk to a human')}
                >
                  Talk to human
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h2>Welcome to Chat</h2>
            <p>
              Select a conversation from the sidebar or start a new chat with
              one of our AI agents. They're here to help you 24/7.
            </p>
            <button className="start-chat-btn" onClick={handleNewChat}>
              Start New Chat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ChatProvider
      config={{
        baseUrl: 'http://localhost:8307',
        widgetId: 'full-chat-app',
        agentId: '77a3b62c-c137-44ff-b7ee-5ffc497f7949', // SDK Test Agent
      }}
      onReady={(client) => {
        console.log('Chat client initialized:', client);
        // Identify the user
        client.identify({
          email: 'john@example.com',
          name: 'John Doe',
          metadata: { plan: 'pro' },
        });
      }}
    >
      <ChatApplication />
    </ChatProvider>
  );
}

export default App;
