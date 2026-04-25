# Atelier

> **AI Workshop for Component-Driven UIs.**
>
> Design in Figma. Explore in Storybook. Ship with AI.

Hosted workshop: **[atelier.pieper.io](https://atelier.pieper.io)**

---

## What this repo is

**Atelier** is a hands-on workshop that teaches how to build production-quality UI components using three connected tools:

1. **Figma** — the single source of truth for design tokens and component frames.
2. **Storybook** — a live explorer for every component, prop, and variant.
3. **AI + MCP** — Claude reads Figma and Storybook through the Model Context Protocol and writes the code.

The repo ships everything needed to run the workshop end-to-end: an Astro-based docs site, three parallel component libraries (Angular, React, Vue) as teaching material, three Storybooks with MCP servers attached, and a one-command scaffolder for participants.

> **Not a production UI library.** The `@atelier-ui/*` component packages exist to make the workshop concrete. They have no semver guarantees and are not maintained for third-party use. If you need a real library: [shadcn/ui](https://ui.shadcn.com), [Angular Material](https://material.angular.io), or [PrimeNG](https://primeng.org).

---

## The three pillars

| Pillar | Role | Where it lives |
|---|---|---|
| **Figma** | Design tokens, component frames, spacing — defined before code. | Figma workspace + token sync (`docs/src/pages/figma.astro`, `figma-token.astro`) |
| **Storybook** | Per-framework component explorer. Each Storybook exposes a hosted MCP endpoint. | `libs/{angular,react,vue}/.storybook/` → deployed to `/storybook-{angular,react,vue}` |
| **AI + MCP** | Claude reads both sources, writes design-accurate code. | `@storybook/mcp` + `@storybook/addon-mcp`, hosted via Netlify functions |

The workshop walks through the full loop: **inspect → prompt → ship → iterate.**

---

## Quick start — scaffold a workshop workspace

```bash
npx create-atelier-ui-workspace
```

Prompts for a workspace name and framework (`angular` / `react` / `vue`), then generates a ready-to-run Nx workspace with the component library installed and MCP wired up.

```bash
cd my-workshop
npx nx serve workshop-<framework>
```

Full setup guide (prerequisites, Claude Code install, Figma access token, MCP config): [atelier.pieper.io/workshop](https://atelier.pieper.io/workshop).

---

## Hosted MCP endpoints

Add these to your Claude Code MCP config to let the model read Storybook directly:

```json
{
  "mcpServers": {
    "storybook-angular": { "type": "http", "url": "https://atelier.pieper.io/storybook-angular/mcp" },
    "storybook-react":   { "type": "http", "url": "https://atelier.pieper.io/storybook-react/mcp"   },
    "storybook-vue":     { "type": "http", "url": "https://atelier.pieper.io/storybook-vue/mcp"     }
  }
}
```

| Tool | Returns | Availability |
|---|---|---|
| `list-all-documentation` | Every documented component, grouped by category | All frameworks |
| `get-documentation` | Prop table, types, defaults, usage examples | All frameworks |
| `preview-stories` | Live preview URLs for component variants | React, Vue |
| `run-story-tests` | Vitest/Storybook interaction results | React, Vue |
| `get-storybook-story-instructions` | Prompt patterns for generating new stories | React, Vue |

Angular MCP currently focuses on documentation and prop discovery; previews and testing are React/Vue only.

---

## Packages

| Package | Purpose |
|---|---|
| `create-atelier-ui-workspace` | `npx` scaffolder — bootstraps a workshop workspace with framework choice |
| `@atelier-ui/create-workspace` | Nx preset used by the scaffolder |
| `@atelier-ui/angular` | Angular 21 component library (teaching artifact) |
| `@atelier-ui/react` | React 19 component library (teaching artifact) |
| `@atelier-ui/vue` | Vue 3 component library (teaching artifact) |
| `@atelier-ui/spec` | Framework-agnostic TypeScript interfaces — enforces API parity across all three libraries |

---

## Components

~27 components ship in all three libraries with identical prop names, identical variant unions, and the same `--ui-*` CSS token system.

**Inputs** — Button · Input · Textarea · Checkbox · Toggle · Radio / RadioGroup · Select · Combobox
**Display** — Badge · Icon · Card · Avatar · Skeleton · Progress · Table · CodeBlock
**Navigation** — Breadcrumbs · Tabs · Pagination · Menu · Stepper
**Overlay** — Dialog · Drawer · Tooltip · Toast
**Feedback** — Accordion · Alert

Authoritative list: [`libs/angular/src/index.ts`](libs/angular/src/index.ts), [`libs/react/src/index.ts`](libs/react/src/index.ts), [`libs/vue/src/index.ts`](libs/vue/src/index.ts).

---

## The spec layer

`@atelier-ui/spec` contains one TypeScript interface per component. All three framework libraries import from it so the compiler enforces parity.

```typescript
export interface LlmButtonSpec {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}
```

- Angular uses the union types as `input<T>()` type parameters.
- React extends the spec from framework-specific props types.
- Vue uses `defineProps<T>()`.

`npm run check:docs` validates that every prop in the spec is documented in `component-data.ts`. CI fails on drift.

---

## Design principles

**Predictable APIs.** Same prop names for the same concepts (`variant`, `size`, `disabled`). String literal unions — no enums, no numeric codes.

**Composition over configuration.** Sub-components follow a naming pattern (`LlmCard` + `LlmCardHeader` + `LlmCardContent` + `LlmCardFooter`). No config objects.

**Design tokens, not utility classes.** Everything visual is a `--ui-*` CSS custom property. Theming = token override. Dark mode ships via `prefers-color-scheme` with `data-theme="dark"` escape hatch.

**ARIA-first behavior.** Every interactive component implements the matching WAI-ARIA pattern. Keyboard interactions are standards-aligned.

Full design guide: [`plan/big-picture.md`](plan/big-picture.md).

---

## Tech stack

- **Monorepo**: Nx 22
- **Angular library**: Angular 21, Signals, Signal Forms, Angular CDK
- **React library**: React 19
- **Vue library**: Vue 3 + `<script setup>`
- **Spec**: `@atelier-ui/spec` — shared TypeScript interfaces
- **Docs site**: Astro 5 (`@astrojs/mdx`, `@astrojs/react`, `astro-expressive-code`)
- **Storybook**: Storybook 10 (Angular + React + Vue)
- **Testing**: Vitest + Angular/React/Vue Testing Library
- **CI**: GitHub Actions — parallel lint / test / build / sync checks
- **Deploy**: Netlify (docs + three Storybooks + three MCP endpoints)

---

## Local development

```bash
# Install
npm install

# One-time after clone — installs the project's git hooks (pre-push regen
# guard for llms.txt / spec drift caused by interleaved release commits)
bash tools/scripts/install-hooks.sh

# Project-local Claude Code skills are auto-loaded from .claude/skills/.
# figma-workspace-architect is symlinked there; no install step needed.
# Edit skill content under skills/figma-workspace-architect/ — changes
# take effect on the next Claude Code session.

# Docs site (Astro, port 4300)
npx nx serve docs

# Storybooks
npx nx storybook angular
npx nx storybook react
npx nx storybook vue

# Tests
npx nx run-many -t test

# Build everything
npx nx run-many -t build

# Validate spec ↔ docs parity
npm run check:docs

# Validate spec ↔ framework implementation parity
npm run check:sync
```

---

## Project structure

```
├── docs/              # Astro docs site — the workshop content, deployed to atelier.pieper.io
├── libs/
│   ├── angular/                    # @atelier-ui/angular — component library
│   ├── react/                      # @atelier-ui/react — component library
│   ├── vue/                        # @atelier-ui/vue — component library
│   ├── spec/                       # @atelier-ui/spec — shared TypeScript interfaces
│   ├── create-atelier-ui-workspace/# npx scaffolder CLI
│   └── create-workspace/           # @atelier-ui/create-workspace — Nx preset used by the scaffolder
├── netlify/           # Netlify functions (MCP endpoints, markdown content negotiation)
├── talk/              # Conference talk materials (Storybook MCPs: Die Zukunft des Frontend Engineerings)
├── plan/              # Design guide, roadmap, Figma notes
├── tools/
│   ├── generators/    # Nx generators (e.g. llm-component, llm-component-react)
│   └── scripts/       # check-sync.js, check-docs-sync.js, preflight.mjs
├── .github/workflows/ # ci.yml, publish.yml
└── netlify.toml       # Deploy config — docs + 3 Storybooks + MCP redirects
```

---

## Conference talk

The repo underpins the talk **"Storybook MCPs: Die Zukunft des Frontend Engineerings"** — see [`talk/storybook-mcp-talk.md`](talk/storybook-mcp-talk.md).
