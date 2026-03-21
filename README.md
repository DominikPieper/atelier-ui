# Atelier UI

> **Not for production. This is a showcase only.**
>
> This repository demonstrates how LLMs, Storybook, and Figma can work together to build a UI component system. The components are not intended for use in real production systems and are not maintained as a stable library.

---

## What is this?

**Atelier UI** is an LLM-optimized UI component library for **Angular** and **React** — built as a showcase for a modern, AI-assisted design-to-code workflow using [Storybook](https://storybook.js.org), [Figma](https://figma.com), and [Claude](https://claude.ai).

The idea: structure and document components in a way that allows an LLM to use them correctly on its own — with predictable APIs, consistent naming conventions, and well-considered defaults.

---

## Packages

| Package | Description |
|---|---|
| `@atelier-ui/angular` | Angular component library |
| `@atelier-ui/react` | React component library |

Both libraries share the same design tokens (`--ui-*`), the same component names, and the same API philosophy.

---

## Components

22 components available in both libraries:

**Form & Input**
`Button` · `Input` · `Textarea` · `Checkbox` · `Toggle` · `Radio` · `Select`

**Feedback & Status**
`Alert` · `Badge` · `Toast` · `Skeleton` · `Progress`

**Overlay & Navigation**
`Dialog` · `Drawer` · `Menu` · `Tooltip` · `Tabs` · `Accordion`

**Layout & Structure**
`Card` · `Avatar` · `Breadcrumbs` · `Pagination`

---

## Tech Stack

- **Monorepo**: [Nx](https://nx.dev)
- **Angular library**: Angular 21, Signals, Angular CDK, ng-packagr
- **React library**: React 19, TypeScript, Vite
- **Design**: Figma with a custom token system
- **Documentation**: Storybook 10 (Angular + React), TanStack Router docs app
- **Testing**: Vitest + Angular Testing Library
- **CI**: GitHub Actions
- **Deploy**: Netlify (docs app)

---

## Local Development

```bash
# Install dependencies
npm install

# Start Storybook (Angular)
npx nx run llm-components-angular:storybook

# Start Storybook (React)
npx nx run llm-components-react:storybook

# Start docs app
npx nx run docs:serve

# Run tests
npx nx run-many -t test

# Build everything
npx nx run-many -t build
```

---

## Project Structure

```
├── libs/
│   ├── llm-components-angular/   # @atelier-ui/angular
│   └── llm-components-react/     # @atelier-ui/react
├── docs/                         # Docs app (TanStack Router + React)
├── images/                       # Shared assets
├── .github/workflows/
│   ├── ci.yml                    # Lint, test, build on every push
│   └── publish.yml               # npm publish on GitHub Release
└── netlify.toml                  # Docs deploy configuration
```

---

## Design Tokens

All tokens use the `--ui-*` prefix:

```css
@import '@atelier-ui/angular/styles/tokens.css';
/* or */
@import '@atelier-ui/react/styles/tokens.css';
```

Key tokens: `--ui-color-primary`, `--ui-color-danger`, `--ui-color-surface`, `--ui-color-border`, `--ui-color-text`, `--ui-radius-sm/md/lg`, `--ui-spacing-1..8`, `--ui-shadow-sm/md`

---

## Why "LLM-optimized"?

The components are deliberately designed so that an LLM can use them correctly:

- **Consistent API patterns** — same prop names in Angular and React (`variant`, `size`, `disabled`)
- **Self-documenting selectors** — `llm-button`, `llm-dialog`, `llm-accordion-item`
- **Clear composability** — sub-components follow a predictable schema (`llm-card` + `llm-card-header` + `llm-card-content` + `llm-card-footer`)
- **Storybook as a knowledge source** — Autodocs + MCP server allow Claude to query component APIs directly

---

## A Note on Usage

This repository is a **learning and demonstration project**. There are no stability guarantees, no semver support, and no production maintenance cycle. If you need a real UI library, take a look at [shadcn/ui](https://ui.shadcn.com), [Angular Material](https://material.angular.io), or [PrimeNG](https://primeng.org).
