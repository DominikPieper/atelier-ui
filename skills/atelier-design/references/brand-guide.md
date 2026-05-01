# Atelier Design System

> **AI Workshop for Component-Driven UIs.**
> Design in Figma. Explore in Storybook. Ship with AI.

This folder is the design-system extract for **Atelier** — a hands-on workshop hosted at [atelier.pieper.io](https://atelier.pieper.io) that teaches working frontend engineers and designers how to use Claude + MCP seriously (not toy demos) by connecting three tools:

1. **Figma** — single source of truth for tokens and component frames
2. **Storybook 10** — per-framework live explorer, each Storybook exposes a hosted MCP endpoint
3. **AI + MCP** — Claude reads both via Model Context Protocol and writes the code

The repo ships an Astro 5 docs site + three parallel component libraries (`@atelier-ui/{angular,react,vue}`) of ~27 components each with identical APIs, all enforced by a framework-agnostic `@atelier-ui/spec` TypeScript layer.

> **Atelier is not a production UI library.** It's a teaching artifact — no semver guarantees, not maintained for third-party use. For real work the project explicitly points seekers at shadcn/ui, Angular Material, or PrimeNG.

---

## Sources

| Source | Where | Notes |
|---|---|---|
| Codebase | `github.com/DominikPieper/atelier-ui` (branch `main`) | Pulled `tokens.css`, `docs-theme.css`, spec, README, CLAUDE.md |
| Hosted site | [atelier.pieper.io](https://atelier.pieper.io) | Astro docs site — workshop content |
| Figma | File key `QMnDD8uZQPldPrlCwZZ58T` | Components page = master `COMPONENT_SET`s; Inventory = condensed catalog |
| Logo | `assets/logo.png` (user-supplied) | Pen + brush + capital A on transparent ground |

> Reader does not necessarily have access to private Figma or org repos — links stored for traceability.

---

## Index

> Paths below are relative to the **skill root** (`skills/atelier-design/`).

- `assets/colors_and_type.css` — full token sheet (`--ui-*` custom properties), light + dark + the editorial type scale
- `assets/logo.png` — Atelier mark (pen + brush + A)
- `preview/` — design-system preview cards (auxiliary; not bundled in the distribution zip)
- `ui_kits/docs-site/` — high-fidelity recreation of the Astro docs site landing (auxiliary; not bundled in the distribution zip)
- `SKILL.md` — Agent Skill manifest (cross-compatible with Claude Code)
- `references/brand-guide.md` — this file

---

## Voice & Content Fundamentals

**Honest about scope.** Every doorway repeats: not a production library, teaching artifact. When something is unfinished, the docs say so plainly: *"Angular MCP currently focuses on documentation and prop discovery; previews and testing are React/Vue only."* No marketing softeners.

**Pronouns.** Imperative second person — *"Add these to your Claude Code MCP config."* Never "we believe" / "we built." The reader is the actor.

**Tone.** Engineering handbook, not SaaS marketing. Sentences are short and load-bearing. Examples carry the explanation; adjectives don't.

**Casing.**
- `Atelier` — proper noun, always capitalised in prose
- `atelier-ui` — package/repo, always lower-kebab
- `@atelier-ui/{spec,angular,react,vue}` — scoped npm packages, lowercased
- `MCP`, `ARIA`, `WCAG` — uppercased acronyms
- Component names: `LlmButton`, `LlmCard`, `LlmCardHeader` — PascalCase with the `Llm` prefix (the prefix is a relic of "LLM components" — kept consistent across all three frameworks)
- Headings: sentence case (`The three pillars`), never title case

**Tagline.** Three sentences, em-dash separated:
> Design in Figma. Explore in Storybook. Ship with AI.

This is the rhythm to copy across the brand: three actions, three tools, one verb each.

**No emoji.** None. The codebase is clean of them. Decoration comes from icons (Lucide-style line glyphs) and color, never emoji.

**No exclamation marks.** Voice is calm, declarative.

**Code samples are first-class.** A snippet with no surrounding paragraph is a complete answer. The docs site has a "framework switcher" pattern (Angular / React / Vue tabs) so the same idea appears three ways.

**Recurring phrases (use exactly):**
- *"Tokens, not utilities."*
- *"Composition over configuration."*
- *"Predictable APIs across frameworks."*
- *"ARIA-first."*
- *"inspect → prompt → ship → iterate"* (the four-step loop)
- *"single source of truth"*
- *"teaching artifact"*

---

## Visual Foundations

**Anchor color: Conciso deep teal `#006470`.** This is the entire identity. Light mode = deep teal on white; dark mode = bright teal `#34d8d8` on a softer mid-slate `#141d26` (deliberately *not* near-black — it keeps the chrome readable next to white code blocks elsewhere on the page). No gradients sweeping across hero blocks (one subtle radial glow behind the wordmark, that's it). No purple-blue marketing gradient. The Conciso brand palette (`--ui-color-brand-*`) is opt-in for diagrams that need a third or fourth category — not for chrome.

**Type.** Inter for everything UI. Fira Code for everything monospace (tokens, code samples, prop names, terminal mocks, kbd chips, the version pill). Hero wordmark goes to `weight 900` and `letter-spacing -0.04em`. Body sets at 16px / 1.6. The combination of *very tight letter-spacing on big type* + *generous line-height on body* is the type signature.

**Backgrounds.** Three tiers, all flat: `surface` (chrome — topbar, sidebar, cards), `surface-raised` (slightly off canvas in light, slightly lifted in dark — for code blocks and hovered tiles), `surface-sunken` (the page body in dark / a faintly-tinted sub-region in light). No images. No textures. No noise grain. The single decorative motif is a **crosshair grid** behind the hero — 40×40px, drawn with two `linear-gradient` 1px lines tinted at 8% of primary.

**Spacing.** Generous. The docs shell has a 256px sidebar, 200px right-rail TOC, and a 800px max-width content column with 3rem column gap. Stat ribbon: `2rem` interior padding. Hero: `5rem` top, `4rem` bottom on desktop. Whitespace is the layout primitive.

**Borders.** Always `1px solid var(--ui-color-border)`. Hover-emphasis comes from changing the *top border* to 2px in primary teal (component cards on the docs home), or from elevating the box-shadow — never from thickening the perimeter. Functional borders (input outlines that need to meet WCAG 1.4.11) use `--ui-color-border-strong` (`#64748b`).

**Shadows.** Slate-tinted (`rgba(15, 23, 42, …)`), dual-layer (ambient + key light) per Material 3 conventions. Five steps `xs / sm / md / lg / xl`. Cards default to no shadow; they earn one on hover.

**Radii.** Modernised scale: `sm 8px`, `md 10px`, `lg 14px`, `xl 20px`, `full 9999px`. Cards = `lg` (14). Buttons / chips / inputs = `md` (10). Pills (category filters, the search input) = `full`. Tokens / status badges = `sm` (8).

**Animation.** Restrained. `cubic-bezier(0.16, 1, 0.3, 1)` for ease-out, `(0.45, 0, 0.55, 1)` for ease-in-out, `(0.34, 1.56, 0.64, 1)` for the rare spring. Durations: `fast 150ms`, `normal 200ms`, `slow 300ms`. The signature interaction is the **theme-toggle reveal** — the new colour scheme grows out of the click point as a clip-path circle via the View Transitions API. `prefers-reduced-motion` zeros all durations.

**Hover states.** *Buttons:* darken background to `--primary-hover`, add a soft glow (`box-shadow: 0 0 20px <primary at 30%>`), and `translateY(-1px)`. *Cards:* `translateY(-2px)`, primary-tinted shadow, top border switches to primary. *Nav links:* `--primary-light` background fill + a 2px primary left-border accent. *Pills / chips:* border colour shifts to primary, text shifts to primary, fill goes to `--primary-light`.

**Press states.** Buttons return to baseline `transform`. Primary buttons go to `--primary-active` (a darker step, e.g. `#003a42` light / `#87efef` dark). No shrink, no inset shadow.

**Transparency & blur.** Used sparingly. The mobile sidebar backdrop is `rgba(0,0,0,0.55)` + `backdrop-filter: blur(2px)`. The hero center glow is a radial gradient at 14% opacity. Sticky topbar/sidebar are *opaque* — no glassmorphism.

**Focus.** Double-ring (`0 0 0 2px surface, 0 0 0 4px primary`) so the same ring works on any background. `:focus-visible` only — pointer focus stays clean.

**Imagery.** None, by default. The brand makes a deliberate choice not to lean on illustrations or stock photography. The hero shows a wordmark, a 1-line subtitle, a 1-line uppercase disclaimer (*"Workshop / teaching artifact / not a production library"*), and two buttons.

**Color vibe of imagery (when used).** Cool. Conciso teal + slate. Never warm.

**Layout.** Three-column docs shell on ≥768px (256px sidebar / fluid content / 200px TOC), single column below. Topbar is sticky at 68px. Sidebar is sticky to topbar bottom. Content column max-width 800px. Stat ribbons are 4-up, breaking to 2-up under 640px. Component grids use `repeat(auto-fill, minmax(210px, 1fr))`.

**Cards.**
- Background: `surface`
- Border: `1px solid border` + 2px transparent top border
- Radius: `lg` (14px)
- Padding: `1.25rem` to `1.5rem`
- Hover: top border → primary, `translateY(-2px)`, primary-tinted box-shadow

**Code style.** Code blocks have a header strip on `surface-sunken` with an uppercase mono language tag in primary teal and a "Copy" button on the right; body uses the syntax theme tokens (`--docs-code-keyword`, `--docs-code-name`, `--docs-code-string`, `--docs-code-muted`). Inline code styles `monospace` and tints to primary.

---

## Iconography

The repo's component library defines a small, *strict* icon set as a string-literal union in `@atelier-ui/spec` — so the API is the icon catalog. The 20 names:

```
success · warning · danger · info · error
chevron-up · chevron-down · chevron-left · chevron-right
sort-asc · sort-desc · arrow-right · arrow-left
copy · paste · add · edit · delete · close · more · default-toast
```

**Style.** Line glyphs, 1.5–2px stroke, 24px nominal box, `currentColor` so they inherit text colour. Closest CDN match is **Lucide** (same outlined geometry, same stroke weight) — used here as substitute since the original SVG sources weren't extracted.

**Decorative vs. labelled.** Every `LlmIcon` accepts a `label` prop. When provided, the icon is announced as an image with that name. When omitted, it's marked decorative (`aria-hidden`). This is enforced by spec.

**Emoji.** Never. The codebase is emoji-free.

**Unicode-as-icon.** Used for one specific pattern only — the mono `›` chevron in breadcrumbs, and `✓` checkmarks in feature lists (rendered via `::before { content: '✓' }` in `.docs-checklist`).

**Logo.** `assets/logo.png` — pen nib + paint brush meeting at the top of a black capital **A**. The brush fills with the brand teal `#34d8d8`. The mark is decoration, not a wordmark — paired in chrome with the uppercase ATELIER text label and a tiny `BY DOMINIK PIEPER` attribution line below.

**Framework dots.** Three filled circles indicate framework support: `#dd0031` (Angular), `#61dafb` (React), `#42b883` (Vue). Used at 7px on component cards.

---

## UI Kits

- **`ui_kits/docs-site/`** — Astro docs site landing recreation. React + JSX, `--ui-*` tokens. Sections: topbar, hero, three-pillar diagram, MCP config card, 27-component grid with category pills + framework switcher, scaffolder CTA, footer.

---

## Caveats / substitutions

- **Fonts.** `assets/colors_and_type.css` is a 1:1 mirror of the upstream `libs/react/src/styles/tokens.css` and intentionally does **not** load any web font — the Astro docs site supplies Inter + Fira Code through its own pipeline. When using this file standalone (slides, throwaway artifacts), prepend `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500;600&display=swap');` and add `--ui-font-mono: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace;` to `:root`. To vendor fonts, drop `.woff2` files into a `fonts/` folder and swap the import.
- **Icons.** The actual SVG sources live in `libs/{framework}/src/lib/icon/`. They were not pulled here to keep the asset surface small. The `LlmIcon` name list is canonical; substitute Lucide at the same names for high-fidelity recreations.
- **Logo.** User-supplied PNG. No SVG version available.
