const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, character => HTML_ENTITIES[character]);
}

/** Escape input before inserting the fixed tags supported by the chat renderers. */
export function formatMessageHtml(content: string): string {
  return escapeHtml(content)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\r?\n/g, '<br>');
}

/** Citation URLs must be absolute HTTP(S) links. Return the canonical URL. */
export function safeCitationUrl(value?: string): string | undefined {
  if (typeof value !== 'string') return undefined;

  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    return undefined;
  }

  return undefined;
}
