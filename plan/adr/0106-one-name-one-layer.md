---
status: accepted
date: 2026-09-07
sources:
  - 'plan/adr/0032-claude-design-as-parallel-track.md (step 5 was blocked on an untested per-seat write; this session tested it)'
  - 'plan/adr/0035-typography-instrument-pair.md (the Instrument Sans / Instrument Serif / JetBrains Mono choice that the Claude Design project never received)'
  - 'plan/adr/0038-tonal-ramps-with-checked-annotations.md (the primitive ramp tier the Claude Design sheet has no equivalent of)'
  - 'Claude Design project 019de217-489c-7441-8275-2efe020086b5 (read live: SKILL.md, colors_and_type.css, libs/react/src/styles/tokens.css, _ds_manifest.json, preview/*.html, ui_kits/docs-site/index.html)'
  - 'this session'
---

# ADR-0106: One name, one layer

## Status

Accepted.

## Context

The user's question was whether the repo and the Claude Design redesign had drifted
apart, and the assumption behind it — mine, stated to them before it was checked —
was that Figma was the laggard. It was not. Measured across the three surfaces:

|                                        | typography                                                    | colour                        |
| -------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| Figma `QMnDD8uZQPldPrlCwZZ58T`         | Instrument Sans (1675 uses), Instrument Serif, JetBrains Mono | 78 semantic variables         |
| repo `libs/{fw}/src/styles/tokens.css` | Instrument Sans / Serif / JetBrains Mono                      | 180 `--ui-*` over three tiers |
| Claude Design project                  | **Inter, Fira Code**                                          | literal hex, no ramp tier     |

Claude Design was the outlier. Had we run the alignment in the direction first
proposed — redesign to Figma — we would have imported `Inter` over `Instrument
Sans` and turned Figma _back_.

**Corrected 2026-09-07 (same day, after the user pointed at the timeline).** The
paragraph above audits the wrong project and gets the direction backwards.

There are **two** Atelier projects in Claude Design. I read
`019de217-489c-7441-8275-2efe020086b5` _"Atelier Design System"_ and generalised
from it. The redesign lives in `7a6a2f19-9a3c-4dd9-9828-65c7cc67766c`
_"Atelier"_ — 29 `Atl*.dc.html` component sheets plus `Foundations.dc.html`,
`Index.dc.html` and `_sheet.css`, written 2026-08-26 09:31 → 2026-08-28 12:10
UTC. Ten days old, not four months. `Index.dc.html` describes them as canonical:
"Zustände, Anatomie-Maße und Findings, im Browser gemessen."

Three specific claims above are wrong as a result:

- **"Claude Design was the outlier."** It was the _origin_. ADR-0035's own
  `sources` field names "Claude Design project _Atelier_ —
  `Typography Directions.dc.html`, turns 1 and 2" as where Instrument Sans was
  chosen. The CD batch at 09:24 UTC (11:24 CEST) precedes this repo's
  `69c76f5 feat(tokens): Instrument Sans … (ADR-0035)` at 12:16 local by roughly
  fifty minutes. The decision flowed CD → repo, and the repo received it.
- **"Refreshing the token file was the alignment."** The redesign project does
  not read that file. It reads `_sheet.css`, whose `:root` block is **generated**
  from `tokens.css` by `tools/scripts/gen-artboard-palette.mjs` under a different
  namespace (`--text`, `--primary`, `--bw`, `--r-lg`, `--serif`) precisely
  because an artboard renders standalone. Verified 2026-09-07: that block is
  identical to the repo's committed `tools/design/artboard-palette.css`, and
  `check:artboard-palette` is exit 0 at 48 values. **The foundation between the
  repo and the actual redesign was already in sync, and already gated.**
- **The Inter/Fira Code sheet was never the redesign's foundation.** It is the
  _Design System_ project's May-01 sheet, which that project's own
  `preview/*.html` cards link. Those cards were rebuilt 2026-08-26 09:24 from the
  stale sheet — the same morning the repo moved to Instrument Sans. Two passes,
  one day, no contact.

What stands from this ADR: the four-way `--ui-*` collision in `019de217` was
real and the `--ds-*` split is the right fix for it; `SKILL.md`'s `Llm` prefix
was real and damaging; the per-seat write access is proven. What does not stand
is the framing that the repo was ahead and Claude Design behind.

Measured the same day, for the record — three-way inventory, 42 components in
the union: all three surfaces agree on 24. Genuine gaps are `AtlBreadcrumbs`
(Figma has `AtlBreadcrumbItem` but no container set) and `AtlPagination` (absent
from Figma) on the Figma side, and `AtlAvatarGroup` on the Claude Design side.
`AtlIcon` is a judgement call, not a gap: Figma carries 25 individual icon
components rather than one variant set. Eleven further Figma/repo entries with
no CD sheet are compositional sub-parts the sheets compose inline, which is not
drift. `AtlCodeBlock` and `AtlToast` exist in Figma, in CD and in `libs/`, but
are absent from the keyed spec map the drift gates iterate — a gate-coverage
question, not a design one.

**Corrected 2026-09-07, second note — the `--ds-*` rename broke a consumer, and
"changes no pixel" below is false.** Verified in a browser once Chrome
reconnected (this ADR's Consequences said nobody had looked; now someone has):

- `ui_kits/docs-site/landing.css` — a 103-rule file from 2026-05-01 that I never
  opened — read `var(--ui-font-size-5xl)` for `.hero-title`. Renaming that value
  to `--ds-font-size-display` left the name undefined, so the `<h1>` "Atelier"
  fell from `clamp(3.5rem, 10vw, 6rem)` to the inherited **16px** while keeping
  `font-weight: 900`, rendering as a small bold teal label where the gradient
  hero belongs. One undefined custom property across every loaded stylesheet,
  and it was mine.
- The opposite error in the same file: `.section-title`, `.mcp-text h2` and
  `.cta-title` read `var(--ui-font-size-3xl)`, which I did _not_ rename. It still
  resolves — but from the repo at `2.25rem` instead of this page's `2rem`, so
  three headings had silently grown **32px → 36px**. A name that keeps resolving
  is the more dangerous half: nothing looks broken.

Both now read `--ds-*`; measured after the fix as 96px / 32px / 32px with zero
undefined properties. The decision in §2 stands — the error was in executing it.

**The check I actually ran was the wrong one.** Before writing, I verified that
the repo's `tokens.css` _declared_ every one of the 98 names the old
`colors_and_type.css` declared. That is a statement about declarations. I then
_removed_ seven declarations by renaming them, and updated only the `.ui-*`
classes inside the file I was editing. A superset check over declarations says
nothing about consumers in other files. The question was "who reads this name",
and the answer was one `grep` away in a sibling stylesheet.

Refreshing the token file was approved and done (see Decision). What the refresh
exposed is the actual finding, and it is not a stale-copy problem:

**Four files in that one project declare `--ui-*`.** `colors_and_type.css`,
`docs/src/styles/docs-theme.css`, `libs/react/src/styles/tokens.css` and
`ui_kits/docs-site/landing.css` are all listed in `_ds_manifest.json`'s
`globalCssPaths`. Two of them declared the _same names with different values_:

| token                                             | `colors_and_type.css`             | repo `tokens.css`                 |
| ------------------------------------------------- | --------------------------------- | --------------------------------- |
| `--ui-font-family`                                | `'Inter'`                         | `'Instrument Sans'`               |
| `--ui-font-mono`                                  | `'Fira Code'`                     | `'JetBrains Mono'`                |
| `--ui-letter-spacing-tight`                       | `-0.04em`                         | `-0.01em`                         |
| `--ui-line-height-tight`                          | `1.2`                             | `1.25`                            |
| `--ui-line-height-normal`                         | `1.6`                             | `1.5`                             |
| `--ui-font-size-3xl`                              | `2rem`                            | `2.25rem`                         |
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
_better_ one: it guards with `:root:not([data-theme="light"])`, where the repo
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

Rejected: _repo wins everywhere_ — it would delete the redesign's display
typography, which is the redesign's actual contribution. Rejected: _document the
divergence and leave it_ — the manifest would go on resolving by scan order.

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
  against one foundation — which was the point. Their _compositions_ still differ,
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
