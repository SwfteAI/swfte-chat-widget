/** Warn about old quickstart config and accidental substitution of a workspace secret. */
export function warnIfBrowserSecret(config: { widgetId: string }): void {
  if (typeof window === 'undefined') return;

  const values = [
    config.widgetId,
    'apiKey' in config ? config.apiKey : undefined,
    'token' in config ? config.token : undefined,
  ];
  if (values.some(value => typeof value === 'string' && /^sk[-_]/i.test(value.trim()))) {
    console.warn('[SwfteChat] A workspace secret was supplied in browser configuration. Keep it server-side and configure the widget with its public widget ID.');
  }
}
