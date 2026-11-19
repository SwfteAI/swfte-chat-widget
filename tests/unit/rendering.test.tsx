/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AISearch, ChatWidget, EmbeddedChat, SwfteChatClient } from '../../src';
import { AISearch as ReactSearch } from '../../react/AISearch';
import { ChatWidget as ReactWidget } from '../../react/ChatWidget';
import { EmbeddedChat as ReactEmbedded } from '../../react/EmbeddedChat';
import type { Message } from '../../src/types';

const config = { baseUrl: 'https://api.example.test', widgetId: 'test-widget' };
let mockClient: SwfteChatClient;

jest.mock('../../react/ChatProvider', () => ({
  useChatClient: () => mockClient,
  useChatStore: () => ({ store: mockClient.getStore(), state: mockClient.getStore().getState() }),
}));

const messageHtml = '<img onerror="fixture()"> <a href="javascript:fixture()">link</a>';
const messageMarkdown = '**<img onerror="fixture()">** **bold** *italic* `code`\nnext line';

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true, fetch: jest.fn() });
  mockClient = new SwfteChatClient(config);
});

const renderers: Array<[string, (host: HTMLElement) => (() => void)]> = [
  ['vanilla ChatWidget', host => {
    const widget = new ChatWidget(mockClient);
    widget.mount(host);
    widget.open();
    return () => widget.unmount();
  }],
  ['vanilla EmbeddedChat', host => {
    const widget = new EmbeddedChat(mockClient, { container: host });
    widget.mount();
    return () => widget.unmount();
  }],
  ['React ChatWidget', host => {
    const root = createRoot(host);
    act(() => root.render(<ReactWidget defaultOpen />));
    return () => act(() => root.unmount());
  }],
  ['React EmbeddedChat', host => {
    const root = createRoot(host);
    act(() => root.render(<ReactEmbedded />));
    return () => act(() => root.unmount());
  }],
];

test.each(renderers)('%s formats markdown and displays untrusted markup as text', (_name, mount) => {
  const store = mockClient.getStore();
  const conversationId = 'test-conversation';
  store.dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
  const roles: Message['role'][] = ['user', 'assistant'];
  for (const role of roles) {
    store.dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        conversationId,
        message: {
          id: role, conversationId, role,
          content: `${messageHtml} ${messageMarkdown}`,
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    });
  }

  const host = document.createElement('div');
  const unmount = mount(host);

  try {
    const messages = host.querySelectorAll('.swfte-message');
    expect(messages).toHaveLength(2);
    for (const message of messages) {
      expect(message.querySelector('img, a, [onerror]')).toBeNull();
      expect(message.textContent).toContain(messageHtml);
      expect(message.querySelector('strong')?.textContent).toBe('<img onerror="fixture()">');
      expect(Array.from(message.querySelectorAll('strong'), element => element.textContent)).toContain('bold');
      expect(message.querySelector('em')?.textContent).toBe('italic');
      expect(message.querySelector('code')?.textContent).toBe('code');
      expect(message.querySelector('br')).not.toBeNull();
    }
  } finally {
    unmount();
  }
});

const searchResponse = {
  query: 'test',
  results: [{
    id: 'result', title: 'Result', content: 'Result content', score: 1,
    citations: [
      { text: 'Unsafe', source: 'Blocked JavaScript', url: 'javascript:fixture()' },
      { text: 'Unsafe', source: 'Blocked data', url: 'data:text/plain,fixture' },
      { text: 'Safe', source: 'Allowed HTTPS', url: 'https://example.test/citation' },
    ],
  }],
  totalCount: 1,
  hasMore: false,
};

function expectSafeCitations(host: ParentNode) {
  const links = host.querySelectorAll('.swfte-search-citation a');
  expect(links).toHaveLength(1);
  expect(links[0].getAttribute('href')).toBe('https://example.test/citation');
  expect(host.querySelector('.swfte-search-citations')?.textContent).toContain('Blocked JavaScript');
  expect(host.querySelector('.swfte-search-citations')?.textContent).toContain('Blocked data');
}

test('vanilla AI Search allows only HTTP(S) citation links', async () => {
  (globalThis.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => searchResponse,
  });
  const host = document.createElement('div');
  const search = new AISearch(config);
  search.mount(host);
  try {
    await search.search('test');
    expectSafeCitations(host.shadowRoot!);
  } finally {
    search.unmount();
  }
});

test('React AI Search allows only HTTP(S) citation links', async () => {
  jest.useFakeTimers();
  jest.spyOn(mockClient, 'search').mockResolvedValue(searchResponse);
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    act(() => root.render(<ReactSearch />));
    const input = host.querySelector('input')!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    act(() => {
      setValue.call(input, 'test');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => { jest.advanceTimersByTime(300); });
    expectSafeCitations(host);
  } finally {
    act(() => root.unmount());
    host.remove();
    jest.useRealTimers();
  }
});
