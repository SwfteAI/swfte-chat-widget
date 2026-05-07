# Contributing to Swfte Chat Widget

Thank you for your interest in contributing to the [Swfte Chat Widget](https://github.com/SwfteAI/swfte-chat-widget)! This document provides guidelines and instructions for contributing.

## Contributor License Agreement

Before your first pull request can be merged, please sign the [Swfte Contributor License Agreement (CLA)](https://cla.swfte.com). The CLA bot will comment on your PR with a one-click signing link the first time you contribute. The CLA is required so that [Swfte](https://www.swfte.com) can ship your contribution under the project's MIT license without legal ambiguity.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Create a branch for your changes

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/swfte-chat-widget.git
cd swfte-chat-widget

# Install dependencies
npm install

# Build the project
npm run build
```

### Running Examples

```bash
# Start development server for examples
cd examples/02-react-support-widget
npm install
npm run dev
```

### Environment Variables

```bash
export SWFTE_WIDGET_ID="your-widget-id"
export SWFTE_BASE_URL="https://api.swfte.com"
```

## Project Structure

```
chat-widget/
├── src/                    # Core widget source (vanilla JS)
│   ├── core/               # Client and store
│   ├── api/                # API layer
│   ├── components/         # UI components
│   ├── realtime/           # WebSocket/SSE clients
│   └── theming/            # Theme system
├── react/                  # React wrapper components
│   ├── components/
│   └── hooks/
├── examples/               # Example implementations
│   ├── 01-vanilla-html/
│   ├── 02-react-support-widget/
│   ├── 03-react-ai-search/
│   ├── 04-react-full-chat/
│   └── 05-nextjs-integration/
└── dist/                   # Built output
```

## Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test in multiple environments (vanilla JS + React)

4. Update TypeScript types

5. Commit your changes

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Structure

- `tests/unit/` - Unit tests for core functionality
- `tests/react/` - Tests for React components and hooks
- `tests/integration/` - End-to-end tests

### Writing Tests

We use Jest and React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from '../react/ChatWidget';

describe('ChatWidget', () => {
  it('should open when launcher is clicked', async () => {
    render(<ChatWidget />);

    const launcher = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(launcher);

    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });
});
```

## Code Style

### Formatting and Linting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Type check
npm run typecheck
```

### Style Guidelines

- Use TypeScript for all source files
- Follow React best practices for component design
- Use CSS variables for theming
- Keep components small and focused
- Support both controlled and uncontrolled usage
- Ensure accessibility (ARIA labels, keyboard navigation)

### Component Guidelines

```typescript
// Good: Props interface with defaults
interface ChatWidgetProps {
  position?: 'bottom-left' | 'bottom-right';
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

// Good: Sensible defaults
export function ChatWidget({
  position = 'bottom-right',
  defaultOpen = false,
  onOpen,
  onClose,
}: ChatWidgetProps) {
  // implementation
}
```

### Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Provide ARIA labels for screen readers
- Ensure sufficient color contrast
- Support reduced motion preferences

## Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   npm test
   ```

3. **Test examples**: Verify changes work in example projects

4. **Push and create PR**

5. **PR Requirements**:
   - Clear description
   - Screenshots for UI changes
   - All CI checks passing
   - Code review approval

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add dark mode support
fix: resolve focus trap issue in modal
docs: update React integration guide
test: add tests for ChatProvider
chore: upgrade React to 18.3
refactor: simplify theme CSS variable generation
style: improve button hover states
```

## Building

```bash
# Build all formats
npm run build

# Output:
# - dist/index.js (CommonJS)
# - dist/index.mjs (ESM)
# - dist/index.umd.js (UMD for browsers)
# - dist/index.d.ts (TypeScript definitions)
```

## Theming

When adding theme options:

1. Add CSS variable in `src/theming/css-variables.ts`
2. Update theme type in `src/theming/theme.ts`
3. Document in README

```typescript
// Example theme extension
interface Theme {
  colors: {
    primary: string;
    // Add new color
    accent: string;
  };
}
```

## Reporting Issues

### Bug Reports

Please include:

- Browser and version
- Framework (React version, Next.js version, etc.)
- SDK version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests

Please describe:

- Use case / problem to solve
- Proposed solution
- Mockups if UI-related

## Questions?

- Open a [GitHub Discussion](https://github.com/SwfteAI/swfte-chat-widget/discussions)
- Read the [Swfte docs](https://www.swfte.com/resources)
- Email us at developers@swfte.com

Thank you for contributing!
