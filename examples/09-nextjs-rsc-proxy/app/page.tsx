import { ChatBubble } from './components/chat-bubble';

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '48px auto', padding: '0 24px', lineHeight: 1.7 }}>
      <h1>Swfte Chat — Next.js RSC Proxy</h1>
      <p>
        This is a Server-Component page. The chat widget is mounted as a Client Component below,
        and every request it makes goes to <code>/api/chat-proxy</code>, which runs on the server
        and attaches the <code>SWFTE_API_KEY</code> from environment variables. The API key never
        reaches the browser.
      </p>

      <h2>Try it</h2>
      <ol>
        <li>Copy <code>.env.example</code> to <code>.env.local</code> and fill in your Swfte credentials.</li>
        <li>
          Run <code>npm install &amp;&amp; npm run dev</code>.
        </li>
        <li>Open <a href="http://localhost:3000">http://localhost:3000</a> and click the bubble.</li>
        <li>
          Open the network tab — every chat request goes to <code>/api/chat-proxy/...</code>, never
          to <code>api.swfte.com</code> directly.
        </li>
      </ol>

      <p>
        Read the full guide at <a href="https://www.swfte.com/resources">swfte.com/resources</a>.
      </p>

      <ChatBubble />
    </main>
  );
}
