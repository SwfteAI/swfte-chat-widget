/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget, createSwfteChatClient } from '../../src';
import { ChatProvider, ChatWidget as ReactChatWidget } from '../../react';

const config = { baseUrl: 'https://api.swfte.com/agents', widgetId: 'your-published-widget-id' };

function mockVisitorApi() {
  const respond = (data: unknown) => ({
    ok: true,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => data,
  });
  return jest.fn()
    .mockResolvedValueOnce(respond({ id: config.widgetId, agentId: 'published-agent' }))
    .mockResolvedValueOnce(respond({ sessionToken: 'fixture-visitor-token', visitorId: 'visitor-1' }))
    .mockResolvedValueOnce(respond({ id: 'visitor-1' }));
}

beforeEach(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    fetch: mockVisitorApi(),
  });
});

afterEach(() => jest.restoreAllMocks());

test.each(['sk-fixture', 'sk_fixture', 'sk-swfte-fixture'])(
  'warns when a browser configuration contains a secret-shaped key',
  apiKey => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const legacyConfig = { ...config, apiKey };
    createSwfteChatClient(legacyConfig);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/server-side/);
    expect(warn.mock.calls[0][0]).not.toContain(apiKey);
  }
);

test('vanilla quickstart starts a visitor session with only public config', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const client = createSwfteChatClient(config);
  await client.initialize();
  const widget = new ChatWidget(client, { position: 'bottom-right' });
  const host = document.createElement('div');
  widget.mount(host);
  try {
    expect(host.querySelector('.swfte-launcher')).not.toBeNull();
    expect(globalThis.fetch).toHaveBeenNthCalledWith(2, `${config.baseUrl}/v1/widgets/${config.widgetId}/visitors`,
      expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } }));
    expect(warn).not.toHaveBeenCalled();
  } finally {
    widget.unmount();
    client.destroy();
  }
});

test('React quickstart starts a visitor session with only public config', async () => {
  const host = document.createElement('div');
  const root = createRoot(host);
  const ready = jest.fn();
  try {
    await act(async () => root.render(
      <ChatProvider config={config} onReady={ready}>
        <ReactChatWidget position="bottom-right" />
      </ChatProvider>
    ));
    expect(host.querySelector('.swfte-launcher')).not.toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    expect(ready).toHaveBeenCalledTimes(1);
  } finally {
    act(() => root.unmount());
  }
});
