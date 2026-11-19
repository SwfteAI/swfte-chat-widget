import { SwfteChatClient } from '../../src/core/client';
import { SSEClient } from '../../src/realtime/sse-client';

const sessionToken = 'synthetic-session-credential';
const baseUrl = 'https://api.example.test';
const config = { baseUrl, widgetId: 'widget-1', debug: true };

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('initialization and HTTP failures log metadata without request or response data', async () => {
  const debug = jest.spyOn(console, 'log').mockImplementation(() => {});
  const fetch = jest.fn()
    .mockResolvedValueOnce(Response.json({ id: 'widget-1' }))
    .mockResolvedValueOnce(Response.json({ sessionToken, visitorId: 'visitor-1' }))
    .mockResolvedValueOnce(Response.json({ id: 'visitor-1' }))
    .mockResolvedValueOnce(new Response(sessionToken, { status: 500 }));
  const client = new SwfteChatClient({ ...config, fetch });

  await client.initialize();
  await expect(client.search(sessionToken)).rejects.toThrow(sessionToken);

  expect(fetch.mock.calls[2][1].headers['X-Widget-Token']).toBe(sessionToken);
  expect(debug).toHaveBeenCalled();
  expect(JSON.stringify(debug.mock.calls)).not.toContain(sessionToken);
});

test('SSE sends its token only in the header on connect and reconnect and ignores raw events in logs', async () => {
  jest.useFakeTimers();
  const debug = jest.spyOn(console, 'log').mockImplementation(() => {});
  const fetch = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(
    `id: 42\r\ndata: {"ok":\r\ndata: true}\r\n\r\ndata: ${sessionToken}\r\n\r\n`,
    { headers: { 'Content-Type': 'text/event-stream' } }
  ));
  const client = new SSEClient({ baseUrl, sessionToken, debug: true });
  const onMessage = jest.fn();
  const endpoint = '/v1/widgets/widget-1/events?filter=messages';
  const close = client.connect(endpoint, onMessage);
  try {
    await jest.advanceTimersByTimeAsync(3100);
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [url, options] of fetch.mock.calls) {
      expect(String(url)).toBe(baseUrl + endpoint);
      expect(new Headers(options?.headers).get('X-Widget-Token')).toBe(sessionToken);
      expect(options?.redirect).toBe('error');
    }
    expect(new Headers(fetch.mock.calls[1][1]?.headers).get('Last-Event-ID')).toBe('42');
    expect(onMessage).toHaveBeenCalledWith({ ok: true });
    expect(JSON.stringify(debug.mock.calls)).not.toContain(sessionToken);
  } finally {
    close();
  }
  await jest.advanceTimersByTimeAsync(3000);
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('SSE rejects an endpoint outside the configured origin before connecting', () => {
  const fetch = jest.spyOn(globalThis, 'fetch');
  const client = new SSEClient({ baseUrl, sessionToken });
  expect(() => client.connect('https://other.example.test/events', jest.fn())).toThrow(/origin/i);
  expect(fetch).not.toHaveBeenCalled();
});
