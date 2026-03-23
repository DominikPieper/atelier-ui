# Atelier UI

> **Not for production. This is a showcase only.**
>
> This repository demonstrates how to build a UI component library optimized for LLM-assisted development — using MCP servers, Storybook, and a shared spec layer to give AI accurate, structured component knowledge at generation time.

---

## What is this?

**Atelier UI** is a multi-framework UI component library for **Angular**, **React**, and **Vue** designed around one idea: structure and document components so that an LLM can use them correctly without guessing.

The same 22 components ship across all three frameworks with identical prop names, identical variant unions, and the same CSS design token system. A shared `@atelier-ui/spec` package enforces API parity at the TypeScript level — if a prop exists in the spec, it exists in every framework implementation.

An MCP server exposes the full component library to AI assistants. Instead of relying on training data that may be outdated or hallucinated, the model calls the MCP server to get exact prop names, types, defaults, and usage examples for the component it needs — then generates code from that.

---

## Packages

| Package | Description |
|---|---|
| `@atelier-ui/angular` | Angular 21 component library |
| `@atelier-ui/react` | React 19 component library |
| `@atelier-ui/vue` | Vue 3 component library |
| `@atelier-ui/spec` | Shared TypeScript spec interfaces (framework-agnostic) |

---

## Components

22 components across all three libraries:

**Inputs**
`Button` · `Input` · `Textarea` · `Checkbox` · `Toggle` · `Radio Group` · `Select`

**Display**
`Badge` · `Card` · `Avatar` · `Skeleton` · `Progress`

**Navigation**
`Breadcrumbs` · `Tabs` · `Pagination` · `Menu`

**Overlay**
`Dialog` · `Drawer` · `Tooltip` · `Toast`

**Layout**
`Accordion` · `Alert`

---

## The MCP Server

The primary integration point for AI tooling is the MCP server. When configured in Claude Code or another MCP-capable client, it exposes five tools:

| Tool | What it returns |
|---|---|
| `list_components` | All 22 components organized by category |
| `get_component_docs` | Full prop table with types, defaults, and examples for one component |
| `search_components` | Components matching a keyword or use case |
| `get_stories` | Storybook usage examples for a component |
| `get_theming_guide` | CSS token system, dark mode setup, and override patterns |

The MCP Playground in the docs site lets you call each tool interactively and see exactly what the model receives.

---

## The Spec Layer

`@atelier-ui/spec` contains a TypeScript interface for every component:

```typescript
export interface LlmButtonSpec {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}
```

Angular uses the union types as `input<T>()` type parameters. React extends the spec interface from the framework-specific props type. Vue uses `defineProps<T>()`. The TypeScript compiler enforces that all three match — drift between frameworks is caught at build time, not in production.

A sync validator (`check:docs`) also verifies that everything in the spec is documented in `component-data.ts`. If a prop exists in the spec but is missing from the docs, CI fails.

---

## Design Principles

**Predictable APIs.** Every component uses the same prop names for the same concepts (`variant`, `size`, `disabled`). String literal union types everywhere — no enums, no numeric codes.

**Composition over configuration.** Sub-components follow an explicit naming pattern (`llm-card` + `llm-card-header` + `llm-card-content` + `llm-card-footer`). No complex config objects.

**Design tokens, not utility classes.** All visual decisions are driven by `--ui-*` CSS custom properties. Theming is a token override, not a class swap.

**ARIA-first behavior.** Every interactive component follows the corresponding WAI-ARIA design pattern. Keyboard interactions are standards-aligned so the LLM can infer them without additional documentation.

---

## Tech Stack

- **Monorepo**: Nx
- **Angular library**: Angular 21, Signals, Signal Forms, Angular CDK
- **React library**: React 19, TypeScript
- **Vue library**: Vue 3, `<script setup>` + `defineProps`
- **Spec**: `@atelier-ui/spec` — shared TypeScript interfaces
- **Documentation**: Storybook 10 (Angular + React), TanStack Router docs app
- **Testing**: Vitest + Angular Testing Library
- **CI**: GitHub Actions (lint, test, build, docs sync check)
- **Deploy**: Netlify (docs app)

---

## Local Development

```bash
# Install dependencies
npm install

# Start Storybook (Angular)
npx nx run angular:storybook

# Start Storybook (React)
npx nx run react:storybook

# Start docs app
npx nx run docs:serve

# Run tests
npx nx run-many -t test

# Build everything
npx nx run-many -t build

# Validate spec ↔ docs parity
npm run check:docs
```

---

## Project Structure

```
├── libs/
│   ├── angular/   # @atelier-ui/angular — Angular 21 components
│   ├── react/     # @atelier-ui/react — React 19 components
│   ├── vue/       # @atelier-ui/vue — Vue 3 components
│   └── spec/      # @atelier-ui/spec — shared TypeScript spec interfaces
├── docs/          # Docs app (TanStack Router + React) — MCP Playground, component reference
├── tools/
│   └── scripts/
│       ├── check-sync.js       # Validates spec ↔ framework implementation parity
│       └── check-docs-sync.js  # Validates spec ↔ component-data.ts parity
├── .github/workflows/
│   ├── ci.yml      # Lint, test, build, sync checks on every push
│   └── publish.yml # npm publish on GitHub Release
└── netlify.toml    # Docs deploy configuration
```

---

## Design Tokens

```css
@import '@atelier-ui/angular/styles/tokens.css';
/* or */
@import '@atelier-ui/react/styles/tokens.css';
/* or */
@import '@atelier-ui/vue/styles/tokens.css';
```

Key tokens: `--ui-color-primary` · `--ui-color-surface` · `--ui-color-border` · `--ui-color-text` · `--ui-color-text-muted` · `--ui-radius-sm/md/lg` · `--ui-spacing-1..16` · `--ui-shadow-xs/sm/md/lg`

Dark mode is built in via `prefers-color-scheme`. Override explicitly with `data-theme="dark"` on `<html>`.

---

## A Note on Usage

This is a **learning and demonstration project** — no stability guarantees, no semver support, no production maintenance. If you need a real UI library: [shadcn/ui](https://ui.shadcn.com), [Angular Material](https://material.angular.io), or [PrimeNG](https://primeng.org).
