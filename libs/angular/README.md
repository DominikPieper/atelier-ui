# @atelier-ui/angular

LLM-optimized component library for Angular 21.

## Features

- **Signal-first**: Uses Angular Signals for inputs, outputs, and state management.
- **Accessible**: Built on WAI-ARIA standards and Angular CDK.
- **LLM-Ready**: Clean, flat prop APIs and comprehensive metadata for AI assistants.
- **Themed**: Shared CSS design token system with dark mode support.

## Installation

```bash
npm install @atelier-ui/angular
```

Add the design tokens to your global `styles.css`:

```css
@import '@atelier-ui/angular/styles/tokens.css';
```

## Usage

```typescript
import { LlmButton } from '@atelier-ui/angular';

@Component({
  standalone: true,
  imports: [LlmButton],
  template: `
    <llm-button variant="primary" (click)="save()">Save</llm-button>
  `
})
export class MyComponent {}
```
