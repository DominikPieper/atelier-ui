---
status: accepted
date: 2026-10-01
sources:
  - tasks/todo.md ("No gate has ever formatted an `.astro` file", found 2026-09-13)
  - .prettierrc (the `*.astro` override)
  - docs/eslint.config.mjs (the docs app's first lint config)
  - .git-blame-ignore-revs (the format-only commit)
  - tools/scripts/lib/allowlists.js (the exemptions the reflow re-keyed)
---

# ADR-0147: Prettier and ESLint read `.astro`, and the reformat had to leave rendered text alone

## Status

Accepted 2026-10-01.

## Context

The docs site is most of what this repo publishes, and no gate had ever looked at its 50
`.astro` files. `check:format` is `prettier --check .`, and Prettier without
`prettier-plugin-astro` cannot parse `.astro`: across the tree it skips them silently.
ESLint was absent one level further up: `docs/` had no `eslint.config.*`, so
`@nx/eslint/plugin` inferred no `lint` target for the project, and CI's
`nx affected -t lint` passed over the docs app's `.ts`/`.mjs` files as well as its templates.

Turning a formatter loose on HTML-like templates is not a pure whitespace change. Astro 6
defaults to `compressHTML: true`, which collapses whitespace runs to one space but keeps
them, so a line break the formatter inserts between `</a>` and `.` reaches the reader as
"Setup ." Prettier's own guarantee (idempotent, AST-preserving) does not cover this.

## Decision

1. **Prettier** gets `prettier-plugin-astro`, exact-pinned at 1.1.0, with an `*.astro`
   override setting `astroCompressHTML: "html"`. Measured on the built site (61 pages):
   plugin defaults changed visible text on 27 pages and link text on all 61 — spaces before
   punctuation and inside links. `htmlWhitespaceSensitivity: "strict"` produced
   byte-identical output to the default, so the plugin ignores it for `.astro`.
   `astroCompressHTML: "html"` tells the plugin which whitespace the Astro compiler
   collapses, and brings the diff to zero. Cross-checked independently with Chromium's
   `innerText` of every page and every `<a>`: 0 differences, while the same comparison
   against the default-options build reports 61.
2. **The reformat is one commit containing nothing else**, listed in `.git-blame-ignore-revs`
   (owner decision 2026-10-01), so `git blame` keeps pointing at the authored lines.
3. **ESLint**: `docs/eslint.config.mjs` spreads the root config and adds
   `eslint-plugin-astro`'s `recommended` and `jsx-a11y-recommended`. That makes `nx lint docs`
   an inferred target, and CI lints the docs app from now on. The plugin is pinned at
   **1.7.0** on ESLint 9: its 2.x/3.x lines require ESLint ≥ 10, and the ESLint bump is a
   separate decision (owner, 2026-10-01). One rule is narrowed rather than disabled:
   `no-noninteractive-tabindex` allows `<pre>`, because `tabindex="0"` on a horizontally
   scrollable code block is how keyboard users reach it (WCAG 2.1.1).

Rejected: installing the Prettier plugin with defaults and reviewing the 13k-line diff by
eye (the defects are single spaces, invisible in a diff of that size); `prettier-ignore` on
every affected paragraph (27 pages' worth, and it would leave the next paragraph unprotected);
bumping ESLint to 10 in the same change (two unrelated risks in one review).

## Consequences

- `check:format` and `nx lint docs` now cover the templates. The first lint run found 54
  errors, fixed in source (49 `no-var` in `BaseLayout.astro`'s inline scripts, verified in a
  browser across ClientRouter navigations; the inline script that re-runs on every swap
  declares only functions at top level, so `const` cannot be redeclared there).
- **No gate protects the rendered text.** The zero-diff measurement was a one-off script.
  A later plugin upgrade, or an option change, can reintroduce "Setup ." and every gate
  stays green. Re-run a built-text comparison when touching the plugin version or the
  override — this is the weakest point of the decision.
- The reflow broke `check:component-count` and `check:docs` exemptions in
  `tools/scripts/lib/allowlists.js`, which key on exact adjacent source lines; they were
  re-keyed. Any future reflow of those paragraphs breaks them again (tracked in
  `tasks/todo.md`).
- One `<!-- prettier-ignore -->` guards `skills/figma-workspace-architect.astro`, whose
  quoted `style` attribute contains a `{…}` expression Astro never evaluates — a latent
  rendering bug, left for the owner (`tasks/todo.md`). The comment is emitted into the HTML.
- In `.astro` templates, only `{/* eslint-disable … */}` comments are honoured, not HTML
  comments, and `disable-next-line` misses findings reported on an attribute's own line.
