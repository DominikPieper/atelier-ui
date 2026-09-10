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
| **AI + MCP** | Claude reads both sources, writes design-accurate code. | `@storybook/mcp` + `@storybook/addon-mcp`, hosted via a Cloudflare Worker (`worker/mcp.ts`) |

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

New here? Read the end-to-end design→code path at [atelier.pieper.io/design-to-code](https://atelier.pieper.io/design-to-code), then run the hands-on kata at [atelier.pieper.io/first-component](https://atelier.pieper.io/first-component).

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
| `docs-list` | Every documented component, grouped by category | All frameworks |
| `docs-show` | Prop table, types, defaults, usage examples | All frameworks |
| `docs-show-story` | Story-level detail beyond `docs-show` | All frameworks |

The hosted endpoints answer natively per framework: Angular's manifest comes from `angular-component-meta`, Vue's from `vue-component-meta`, React's from `react-docgen`. Props, defaults and usage examples already come back shaped for the framework you asked about — two-way `[(checked)]` bindings and split Inputs/Outputs for Angular, `v-model`/`update:*` events and typed slots for Vue, JSX/`children` for React.

### Local dev MCP (all three frameworks)

Run `nx storybook <angular|react|vue>` and point Claude Code at the printed port (`http://localhost:<port>/mcp` — Angular `4400`, React `4401`, Vue `4402`) to get the full local toolset. A local endpoint serves the same three `docs-*` tools listed above, plus `dev`/`test`; measured via `tools/list`, it is eight tools, identical across frameworks:

| Tool | Returns | Availability |
|---|---|---|
| `docs-list` | Every documented component, grouped by category | All frameworks |
| `docs-show` | Prop table, types, defaults, usage examples | All frameworks |
| `docs-show-story` | Story-level detail beyond `docs-show` | All frameworks |
| `stories-preview` | Live preview URLs for component variants | All frameworks |
| `get-storybook-story-instructions` | Prompt patterns for generating new stories | All frameworks |
| `stories-changed` | New/modified/affected stories from the Change Review sidebar | All frameworks |
| `stories-find-by-component` | Locate the story/stories backing a given component | All frameworks |
| `test-run` | Vitest/Storybook interaction results | All frameworks |

Hosted vs. local dev is a surface split, not a per-framework one: a hosted endpoint serves only the three `docs-*` tools; a local endpoint serves those same three plus the `dev`/`test` toolset above — for any of the three frameworks.

---

## Packages

| Package | Purpose |
|---|---|
| `create-atelier-ui-workspace` | `npx` scaffolder — bootstraps a workshop workspace with framework choice |
| `@atelier-ui/create-workspace` | Nx preset used by the scaffolder |
| `@atelier-ui/angular` | Angular 22 component library (teaching artifact) |
| `@atelier-ui/react` | React 19 component library (teaching artifact) |
| `@atelier-ui/vue` | Vue 3 component library (teaching artifact) |
| `@atelier-ui/spec` | Framework-agnostic TypeScript interfaces — the naming contract the three libraries are drift-gated against (internal, not published) |

---

## Components

28 components are catalogued in the docs site — one entry per composite API, per `COMPONENT_CATEGORIES` in [`docs/src/data/components.ts`](docs/src/data/components.ts) — and ship in all three libraries with identical prop names, identical variant unions, and the same `--ui-*` CSS token system.

**Inputs** — Button · Input · Textarea · Checkbox · Toggle · Radio / RadioGroup · Select · Combobox
**Display** — Badge · Icon · Card · Avatar · Skeleton · Progress · Table · CodeBlock
**Navigation** — Breadcrumbs · Tabs · Pagination · Menu · Stepper
**Overlay** — Dialog · Drawer · Tooltip · Toast
**Feedback** — Accordion · Alert
**AI** — Chat

Authoritative list: [`libs/angular/src/index.ts`](libs/angular/src/index.ts), [`libs/react/src/index.ts`](libs/react/src/index.ts), [`libs/vue/src/index.ts`](libs/vue/src/index.ts).

---

## The spec layer

`@atelier-ui/spec` contains one TypeScript interface per component. It carries prop names and string-literal unions — not defaults, descriptions, events, slots or behaviour. The three libraries are held to it by offline gates (`check:props`, `check:variants`, `check:defaults`, `check:figma`), not by the compiler: only the React adapter extends the spec interfaces at the type level; Angular's signal inputs and Vue's props objects are compared against it by `check:props`, with every known divergence recorded as an exemption (ADR-0093). The review that measured this, and the open decision about the format: `tasks/spec-format-review-2026-09-10.md`.

```typescript
export interface AtlButtonSpec {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  /** Accessible name — required when the button has no visible text. */
  'aria-label'?: string;
}
```

- React: each props interface `extends` its spec interface — compiler-checked.
- Angular: a few components import the axis unions for `input<T>()`; most re-declare them; no class implements a spec interface.
- Vue: `defineProps` points at a hand-written local interface; five components import an axis union.

`npm run check:docs` validates that every prop in the spec is documented in `docs/src/data/components.ts`. CI fails on drift.

---

## Design principles

**Predictable APIs.** Same prop names for the same concepts (`variant`, `size`, `disabled`). String literal unions — no enums, no numeric codes.

**Composition over configuration.** Sub-components follow a naming pattern (`AtlCard` + `AtlCardHeader` + `AtlCardContent` + `AtlCardFooter`). No config objects.

**Design tokens, not utility classes.** Everything visual is a `--ui-*` CSS custom property. Theming = token override. Dark mode ships via `prefers-color-scheme` with `data-theme="dark"` escape hatch.

**ARIA-first behavior.** Every interactive component implements the matching WAI-ARIA pattern. Keyboard interactions are standards-aligned.

Full design guide: [`plan/big-picture.md`](plan/big-picture.md).

---

## Tech stack

- **Monorepo**: Nx 23
- **Angular library**: Angular 22, Signals, Signal Forms, Angular CDK
- **React library**: React 19
- **Vue library**: Vue 3 + `<script setup>`
- **Spec**: `@atelier-ui/spec` — shared TypeScript interfaces
- **Docs site**: Astro 5 (`@astrojs/mdx`, `@astrojs/react`, `astro-expressive-code`)
- **Storybook**: Storybook 10 (Angular + React + Vue)
- **Testing**: Vitest + Angular/React/Vue Testing Library
- **CI**: GitHub Actions — parallel lint / test / build / sync checks
- **Deploy**: Cloudflare Workers (docs + three Storybooks + three MCP endpoints)

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
├── worker/            # Cloudflare Worker (MCP endpoints, markdown content negotiation)
├── talk/              # Conference talk materials (Storybook MCPs: Die Zukunft des Frontend Engineerings)
├── plan/              # Design guide, roadmap, Figma notes
├── tools/
│   ├── generators/    # Nx generators (e.g. atl-component, atl-component-react)
│   └── scripts/       # check-sync.js, check-docs-sync.js, preflight.mjs
├── .github/workflows/ # ci.yml, publish.yml
└── wrangler.jsonc     # Deploy config — docs + 3 Storybooks + MCP endpoints (Cloudflare Worker)
```

---

## Conference talk

The repo underpins the talk **"Storybook MCPs: Die Zukunft des Frontend Engineerings"** — see [`talk/storybook-mcp-talk.md`](talk/storybook-mcp-talk.md).
