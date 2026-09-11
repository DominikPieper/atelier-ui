# Claude Design Prompt — Atelier

Paste the block below into Claude (claude.ai design / Artifacts / web-app builder) when you want a design or landing surface for this repo.

---

## Prompt

I'm working on **Atelier** — an open-source AI workshop that teaches component-driven UI development by connecting three tools: **Figma** (design tokens + frames), **Storybook** (live component explorer with MCP servers attached), and **Claude via MCP** (reads both, writes the code). Hosted at `atelier.pieper.io`.

The repo ships:

- An **Astro 6 docs site** (the workshop itself) deployed to the root domain.
- Three parallel component libraries — `@atelier-ui/angular` (Angular 22 + Signals), `@atelier-ui/react` (React 19), `@atelier-ui/vue` (Vue 3 + `<script setup>`) — exposing **29 components** with identical APIs (Button, Input, Dialog, Tabs, Combobox, Toast, Table, Stepper, …).
- A framework-agnostic spec layer `@atelier-ui/spec` — TypeScript interfaces of prop names and variant unions that the three libraries are drift-gated against (`check:props`); only the React adapter binds to them at compile time.
- Three Storybook 10 instances, each with a hosted **MCP endpoint** at `/storybook-{framework}/mcp` (the `docs` toolset only: `docs-list`, `docs-show`, `docs-show-story`; `stories-preview` and `test-run` exist only on a locally running Storybook).
- An `npx create-atelier-ui-workspace` scaffolder that generates a ready-to-run Nx workspace per framework choice.

### Design system constraints (must respect)

- **Tokens, not utilities.** Everything visual is a `--ui-*` CSS custom property. No Tailwind utility soup. Theming = token override.
- **Dark mode** via `prefers-color-scheme` with a `data-theme="dark"` escape hatch.
- **ARIA-first.** Every interactive surface follows the matching WAI-ARIA pattern. Keyboard interactions are standards-aligned.
- **Predictable APIs across frameworks.** Same prop names (`variant`, `size`, `disabled`), string literal unions only — no enums.
- **Composition over configuration.** Sub-components like `LlmCard` + `LlmCardHeader` + `LlmCardContent` + `LlmCardFooter`. No config objects.

### Voice & positioning

- Honest about scope: **not a production UI library.** Teaching artifact. Point seekers of real libs to shadcn/ui, Angular Material, PrimeNG.
- The hook: **"Design in Figma. Explore in Storybook. Ship with AI."**
- Audience: working frontend engineers + designers who want to use Claude Code with MCP seriously, not toy demos.

### What I want from you

[Pick one and replace this line:]

- **A landing page** for `atelier.pieper.io` that explains the three-pillar loop (Figma → Storybook → Claude), shows a live MCP config snippet, and links into the workshop chapters. Hero, three-pillar diagram, MCP config card, components grid, framework switcher (Angular/React/Vue tabs), CTA to `npx create-atelier-ui-workspace`.
- **A component preview surface** — a dense, Storybook-style explorer that renders the 29 components in a grid with variant chips and a token override panel.
- **A workshop chapter template** — sidebar TOC, MDX content area, framework switcher, paired Figma frame embed + Storybook story embed side-by-side, copyable Claude prompt blocks.
- **A diagram** illustrating the inspect → prompt → ship → iterate loop with Figma, Storybook (MCP), Claude Code, and the generated component as the four nodes.

### Constraints on the output

- Use the design-token approach above (`--ui-*` custom properties, no utility framework).
- Keyboard + screen-reader accessible.
- Static HTML/CSS/JS or React — pick whatever the surface I picked needs.
- Match a serious, slightly editorial aesthetic — think "engineering handbook" not "SaaS marketing." Generous whitespace, type-led, restrained color, monospace for code and tokens.
