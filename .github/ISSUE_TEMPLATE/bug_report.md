---
name: Bug Report
about: Report a bug to help us improve the Swfte Chat Widget SDK
title: '[BUG] '
labels: bug
assignees: ''
---

## Description

A clear and concise description of what the bug is.

## Environment

- **SDK Version**: (e.g., 1.0.0)
- **Framework**: (Vanilla JS, React, Vue, Angular, etc.)
- **Browser**: (e.g., Chrome 120, Safari 17, Firefox 121)
- **Node.js Version** (if SSR): (e.g., 20.10.0)
- **Operating System**: (e.g., macOS 14.0, Windows 11, iOS 17, Android 14)
- **Package Manager**: (npm, yarn, pnpm)

## Steps to Reproduce

1. Initialize widget with '...'
2. Interact with '...'
3. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Code Sample

```typescript
// For Vanilla JS
import { SwfteChatWidget } from '@swfte/chat-widget';

const widget = new SwfteChatWidget({
  apiKey: 'sk-swfte-...',
  agentId: 'agent-123',
  position: 'bottom-right'
});

widget.mount();

// Or for React
import { ChatWidget } from '@swfte/chat-widget/react';

function App() {
  return (
    <ChatWidget
      apiKey="sk-swfte-..."
      agentId="agent-123"
      position="bottom-right"
    />
  );
}
```

## Stack Trace / Console Output

```
Paste the full error message, stack trace, or console output here
```

## Screenshots

If applicable, add screenshots to help explain your problem.

## Additional Context

Add any other context about the problem here (network requests, related issues, etc.).

## Possible Solution

(Optional) If you have suggestions on how to fix the bug.
