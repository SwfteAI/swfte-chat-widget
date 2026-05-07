# Theming

The [Swfte](https://www.swfte.com) chat widget exposes two complementary theming surfaces:

1. **CSS variables** — change colors and sizing globally in your stylesheet.
2. **`theme` config** — pass a structured object at widget creation time for per-instance overrides.

You can use both. The `theme` object writes its values into CSS variables under the hood, so any variable you define in your stylesheet wins unless overridden by a more specific rule.

## CSS variables

```css
:root {
  /* Colors */
  --swfte-primary:           #6366f1;
  --swfte-primary-hover:     #4f46e5;
  --swfte-primary-foreground:#ffffff;

  --swfte-background:        #ffffff;
  --swfte-surface:           #f9fafb;
  --swfte-surface-hover:     #f3f4f6;

  --swfte-text:              #111827;
  --swfte-text-secondary:    #6b7280;
  --swfte-text-muted:        #9ca3af;

  --swfte-border:            #e5e7eb;
  --swfte-border-strong:     #d1d5db;

  --swfte-success:           #10b981;
  --swfte-warning:           #f59e0b;
  --swfte-error:             #ef4444;

  /* Bubble (user / agent message) */
  --swfte-bubble-user:       var(--swfte-primary);
  --swfte-bubble-user-fg:    var(--swfte-primary-foreground);
  --swfte-bubble-agent:      var(--swfte-surface);
  --swfte-bubble-agent-fg:   var(--swfte-text);

  /* Typography */
  --swfte-font-family:       -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --swfte-font-size:         14px;
  --swfte-font-size-sm:      12px;
  --swfte-font-size-lg:      16px;
  --swfte-line-height:       1.5;

  /* Sizing */
  --swfte-widget-width:      380px;
  --swfte-widget-height:     600px;
  --swfte-widget-max-height: 80vh;

  --swfte-bubble-size:       60px;
  --swfte-header-height:     64px;
  --swfte-input-height:      52px;

  --swfte-radius-sm:         8px;
  --swfte-radius-md:         12px;
  --swfte-radius-lg:         16px;
  --swfte-radius-full:       9999px;

  /* Shadows */
  --swfte-shadow-sm:         0 1px 2px rgba(0, 0, 0, 0.05);
  --swfte-shadow:            0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --swfte-shadow-lg:         0 10px 25px -3px rgba(0, 0, 0, 0.1);

  /* Spacing */
  --swfte-spacing-xs:        4px;
  --swfte-spacing-sm:        8px;
  --swfte-spacing-md:        12px;
  --swfte-spacing-lg:        16px;
  --swfte-spacing-xl:        24px;

  /* Z-index */
  --swfte-z-bubble:          2147483640;
  --swfte-z-panel:           2147483641;
  --swfte-z-modal:           2147483642;
}
```

### Dark mode

The widget respects `prefers-color-scheme` automatically when `theme: 'auto'`. To force a dark palette, set the variables under a parent selector:

```css
:root[data-theme='dark'] {
  --swfte-background: #0f172a;
  --swfte-surface:    #1e293b;
  --swfte-text:       #f1f5f9;
  --swfte-text-secondary: #94a3b8;
  --swfte-border:     #334155;
  --swfte-bubble-agent:    #1e293b;
  --swfte-bubble-agent-fg: #f1f5f9;
}
```

## `theme` config object

```ts
import { createSwfteChatClient } from '@swfte/chat-widget';

const widget = createSwfteChatClient({
  baseUrl: 'https://api.swfte.com/agents',
  widgetId: 'agent-123',
}).createWidget({
  position: 'bottom-right',
  theme: {
    mode: 'auto',                    // 'light' | 'dark' | 'auto'

    colors: {
      primary:        '#6366f1',
      primaryHover:   '#4f46e5',
      background:     '#ffffff',
      surface:        '#f9fafb',
      text:           '#111827',
      textSecondary:  '#6b7280',
      border:         '#e5e7eb',
      success:        '#10b981',
      warning:        '#f59e0b',
      error:          '#ef4444',
    },

    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize:   14,
      lineHeight: 1.5,
    },

    radius: {
      sm:  '8px',
      md:  '12px',
      lg:  '16px',
      full:'9999px',
    },

    shadows: {
      sm:  '0 1px 2px rgba(0, 0, 0, 0.05)',
      md:  '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg:  '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    },

    dimensions: {
      widgetWidth:    '380px',
      widgetHeight:   '600px',
      bubbleSize:     '60px',
      headerHeight:   '64px',
      inputHeight:    '52px',
    },
  },
});
```

## Built-in presets

```ts
import { themePresets } from '@swfte/chat-widget';

const widget = client.createWidget({
  theme: themePresets.minimal,   // or themePresets.dark, themePresets.default
});
```

Available presets:

| Preset | Description |
|---|---|
| `default` | Indigo primary, light surface, drop shadow. The Swfte default look. |
| `dark`    | Slate background, indigo primary, neutral foreground. |
| `minimal` | Black-and-white, square corners, no shadow. Pairs well with editorial sites. |

## Bring-your-own CSS

For complete visual control, set `theme.unstyled: true` and target the widget's stable class names:

```css
.swfte-widget__panel    { /* ... */ }
.swfte-widget__header   { /* ... */ }
.swfte-widget__messages { /* ... */ }
.swfte-widget__message--user  { /* ... */ }
.swfte-widget__message--agent { /* ... */ }
.swfte-widget__input    { /* ... */ }
```

## Brand color picker (live preview)

```ts
const widget = client.createWidget({ theme: { colors: { primary: '#3b82f6' } } });

document.getElementById('color-picker').addEventListener('input', (e) => {
  widget.updateConfig({ theme: { colors: { primary: e.target.value } } });
});
```

`updateConfig` re-applies the theme without remounting the widget.

Full reference at [swfte.com/developers](https://www.swfte.com/developers).
