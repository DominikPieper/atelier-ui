# @atelier-ui/react

LLM-optimized component library for React 19.

## Features

- **Modern React**: Built for React 18/19 with standard prop/callback patterns.
- **Accessible**: ARIA-compliant components with full keyboard support.
- **LLM-Ready**: Explicit prop names and exhaustive documentation for AI generation.
- **Themed**: Token-driven design system with built-in dark mode.

## Installation

```bash
npm install @atelier-ui/react
```

Add the design tokens to your global `index.css`:

```css
@import '@atelier-ui/react/styles/tokens.css';
```

## Usage

```tsx
import { LlmButton } from '@atelier-ui/react';

export const MyComponent = () => (
  <LlmButton variant="primary" onClick={() => console.log('save')}>
    Save
  </LlmButton>
);
```
