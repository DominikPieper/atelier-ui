---
status: accepted
date: 2026-09-07
sources:
  - "plan/adr/0032-claude-design-as-parallel-track.md (step 5 was blocked on an untested per-seat write; this session tested it)"
  - "plan/adr/0035-typography-instrument-pair.md (the Instrument Sans / Instrument Serif / JetBrains Mono choice that the Claude Design project never received)"
  - "plan/adr/0038-tonal-ramps-with-checked-annotations.md (the primitive ramp tier the Claude Design sheet has no equivalent of)"
  - "Claude Design project 019de217-489c-7441-8275-2efe020086b5 (read live: SKILL.md, colors_and_type.css, libs/react/src/styles/tokens.css, _ds_manifest.json, preview/*.html, ui_kits/docs-site/index.html)"
  - "this session"
---

# ADR-0106: One name, one layer

## Status

Accepted.

## Context

The user's question was whether the repo and the Claude Design redesign had drifted
apart, and the assumption behind it — mine, stated to them before it was checked —
was that Figma was the laggard. It was not. Measured across the three surfaces:

| | typography | colour |
|---|---|---|
| Figma `QMnDD8uZQPldPrlCwZZ58T` | Instrument Sans (1675 uses), Instrument Serif, JetBrains Mono | 78 semantic variables |
| repo `libs/{fw}/src/styles/tokens.css` | Instrument Sans / Serif / JetBrains Mono | 180 `--ui-*` over three tiers |
| Claude Design project | **Inter, Fira Code** | literal hex, no ramp tier |

Claude Design was the outlier. Had we run the alignment in the direction first
proposed — redesign to Figma — we would have imported `Inter` over `Instrument
Sans` and turned Figma *back*.

Refreshing the token file was approved and done (see Decision). What the refresh
exposed is the actual finding, and it is not a stale-copy problem:

**Four files in that one project declare `--ui-*`.** `colors_and_type.css`,
`docs/src/styles/docs-theme.css`, `libs/react/src/styles/tokens.css` and
`ui_kits/docs-site/landing.css` are all listed in `_ds_manifest.json`'s
`globalCssPaths`. Two of them declared the *same names with different values*:

| token | `colors_and_type.css` | repo `tokens.css` |
|---|---|---|
| `--ui-font-family` | `'Inter'` | `'Instrument Sans'` |
| `--ui-font-mono` | `'Fira Code'` | `'JetBrains Mono'` |
| `--ui-letter-spacing-tight` | `-0.04em` | `-0.01em` |
| `--ui-line-height-tight` | `1.2` | `1.25` |
| `--ui-line-height-normal` | `1.6` | `1.5` |
| `--ui-font-size-3xl` | `2rem` | `2.25rem` |
| dark `--ui-color-surface` / `-raised` / `-sunken` | `#141d26` / `#1c2733` / `#0f1721` | `#0a1116` / `#131c24` / `#060c10` |

`_ds_manifest.json` resolves a collision by which file it scanned last, so **which
value an agent is told is a function of scan order, not of intent.** The manifest
in the project bore that out directly: it credited `--ui-font-family` to
`tokens.css` and `--ui-font-mono` to `colors_and_type.css`, because the old
`tokens.css` had no `--ui-font-mono` at all. Refreshing `tokens.css` silently
changes the answer to seven tokens, in a file nothing renderable links.

Two things sharpened the decision beyond bookkeeping:

**The divergent values are not all mistakes.** `-0.04em` tracking and `1.6` body
leading are marketing-page values; `-0.01em` and `1.5` are component-library
values. They collided only because both files reused one name for two jobs. The
CD sheet also carries seven tokens the repo genuinely lacks
(`--ui-font-size-4xl`/`-5xl`, `--ui-font-weight-extrabold`/`-black`,
`--ui-line-height-snug`/`-loose`, `--ui-letter-spacing-snug`) that its `.ui-display`
/ `.ui-h1` / `.ui-h2` classes actually consume. And its theming pattern is the
*better* one: it guards with `:root:not([data-theme="light"])`, where the repo
relies on declaration order. Claude Design is not uniformly the laggard either.

**`SKILL.md` is the surface that actually misleads**, not the stylesheet. It is
what an agent reads and obeys, and it said three untrue things:

- "Set type in **Inter** (UI) and **Fira Code**" — reversed by ADR-0035.
- "Component names are PascalCase with the **`Llm`** prefix (`LlmButton`,
  `LlmCard`)" — the prefix is `Atl`. Measured: 9944 `Atl*` references in `libs/`
  source, **zero** `Llm*`; `Llm` survives only in `CHANGELOG.md` and old task
  records. An agent following that line writes code that does not compile. This
  is the most damaging line in the project and it had nothing to do with tokens.
- "The token names line up 1:1 with the upstream `@atelier-ui/spec`" — they do
  not. `tokens.manifest.ts` records which tokens a component may touch; it is a
  subset with a different job.

## Decision

**1. The per-seat write access works.** `write_files` to the project succeeded
(`libs/react/src/styles/tokens.css`, 27203 bytes on both sides, `if_match` on the
etag I already held so a concurrent edit would have been caught rather than
overwritten). This was the untested capability ADR-0032 step 5 and two
`tasks/todo.md` items had been waiting on for weeks. The flow is
`finalize_plan` → `write_files` with the returned `plan_token`; an
undeclared-path write is refused.

**2. One name belongs to one layer.** `colors_and_type.css` now `@import`s the
foundation from `libs/react/src/styles/tokens.css` and restates nothing from it.
The seven page-level values move to a `--ds-*` prefix and keep the value they
rendered with, so the rename alone changes no pixel:

```
--ds-font-size-h2 / -h1 / -display        --ds-line-height-display / -body
--ds-letter-spacing-display / -snug
```

Rejected: *repo wins everywhere* — it would delete the redesign's display
typography, which is the redesign's actual contribution. Rejected: *document the
divergence and leave it* — the manifest would go on resolving by scan order.

**3. The token file is now load-bearing, not a reference dump.** Before this,
nothing in the project linked it: every `preview/*.html` links
`../colors_and_type.css` and the UI kit links `../../colors_and_type.css`. The
refresh on its own was inert for rendering. The `@import` is what makes it the
single source, and the import path was verified to resolve against the project's
serve origin (fetched `…/serve/libs/react/src/styles/tokens.css`: real CSS,
`Instrument Sans` and `--ui-color-teal-700` both present) — not assumed.

**4. `SKILL.md` states the layering rule and the corrected facts**, including that
Instrument Sans is a 400–700 family. The old sheet asked for 800 and 900; there is
no cut to render them, so the display classes take `--ui-font-weight-bold` and
lean on size and tracking rather than on a synthesised bold.

## Consequences

- Every preview card and the docs-site kit re-render in Instrument Sans / JetBrains
  Mono on the repo's deeper dark slate. That is the alignment, and it is a visible
  change, not a no-op.
- Display weights drop from 900/800 to 700. Deliberate: the family has nothing
  heavier, so the previous values were rendering as a faux-bold or clamped anyway.
- `_ds_manifest.json`, `_ds_bundle.js` and `_adherence.oxlintrc.json` are
  app-generated (`"source":"spa"`) and are now stale — they still name Inter and
  Fira Code. They refresh when the project's design system is rebuilt; there is no
  MCP tool to trigger it.
- **Not verified: the render.** This session has no browser tooling — no
  `mcp__playwright__*`, and `WebFetch` converts to markdown. The `@import`
  resolution was checked mechanically, the appearance was not. Someone has to look
  at the preview cards.
- The workshop can now be run from Figma, from Claude Design, or from both,
  against one foundation — which was the point. Their *compositions* still differ,
  and should: that is the page layer.
- A follow-on defect this surfaced in the repo: `docs/src/styles/docs-theme.css`
  and `docs/src/styles/global.css` name `'Inter'` and `'Fira Code'` as the
  fallbacks behind Astro's `var(--font-sans)`/`var(--font-mono)`, so any context
  where those are undefined falls back to the pre-ADR-0035 families rather than to
  `var(--ui-font-family)`. Copying that file into another project is exactly such
  a context, and the Claude Design project holds a 4805-byte half-copy of the
  repo's 9275-byte original.
- No gate covers any of this. The four-way `--ui-*` collision was found by
  reading, and would not have been found by `check:all` — the drift gates compare
  the three framework token sheets to each other, and know nothing about a copy
  living in a Claude Design project.
