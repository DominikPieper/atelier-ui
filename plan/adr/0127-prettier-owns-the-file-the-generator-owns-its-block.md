---
status: accepted
date: 2026-09-11
sources:
  - .prettierrc, .prettierignore, package.json (Prettier 3.9.6 declared as `~3.9.6`, configured and never enforced)
  - measured 2026-09-11 — 895 files differ at print width 80, 818 at 100; 881 rewritten; per-extension breakdown below
  - tools/scripts/gen-box-sizing.mjs (the one generator that could not agree with Prettier, and how it now does)
  - plan/adr/0009-drift-gate-system.md (one source → projection → `--check`, the idiom every generated artifact follows)
  - plan/adr/0043-the-geometry-contract-ships-with-the-component.md (the block gen-box-sizing writes)
  - plan/adr/0124-a-gate-that-measured-nothing.md (why the acceptance test counts findings, not exit codes)
  - plan/adr/0126-the-linter-is-a-gate-where-the-invariant-fits-in-one-file.md (where eslint-config-prettier came in)
---

# ADR-0127: Prettier owns the file, the generator owns its block

## Status

Accepted 2026-09-11. First repo-wide formatting pass; enforcement follows in the same
series.

## Context

Prettier was configured here and never enforced. `prettier@~3.9.6` is a declared
devDependency, `.prettierrc` says `{ "singleQuote": true }`, `.prettierignore` exists and
lists build outputs — and nothing ran it. There was no `format` script, no CI check, no
hook. The result, measured: **895 of the repo's files did not match Prettier's output**,
across 490 files under `libs/`, 142 under `plan/`, 73 under `tools/`, 70 under `skills/`.

Two things had to be established before touching anything.

**Does ESLint already fight Prettier?** No. Measured on a React component: 180 `@stylistic`
rules present, **0 active**; no `indent`, `quotes`, `semi`, `comma-dangle` or `max-len`
active anywhere. The single exception was `eslint-plugin-vue`'s `flat/recommended`, whose
layout rules produced 231 warnings the moment Vue was linted at all — handled with
`eslint-config-prettier` in ADR-0126, after a first attempt reformatted 43 component files
by ESLint autofix and was reverted. So this pass is Prettier-only; no ESLint rule changes
belong in it.

**Would a wider print width make the diff smaller?** Barely: 895 files at the default 80,
818 at 100. The repo has simply never been formatted, so the width is not what separates it
from Prettier. Default kept.

The real risk was never the diff size. Several gates read source with regular expressions —
`check:defaults` extracts framework-specific default syntax, `check:typeface` checks the
_order_ of CSS declarations, `check:css-tokens` / `check:token-bypass` / `check:variants`
scan CSS, and `check:paint`'s `scanLiteralAttrs` reads a story's text as a blob. A reformat
changes what those see. A gate that sees _less_ afterwards stays green and has lost
coverage — which is exactly the failure class ADR-0124 closed in three gates on the same
day. "`check:all` still exits 0" is therefore not an acceptance test for this change.

## Decision

**Prettier owns the formatting of authored files. A generated artifact's formatter is its
generator. Where a generator writes into an authored file, the generator emits
Prettier-shaped bytes.**

1. **One formatting pass, as its own commit**, carrying the reformat and only the changes
   it forces — the generator fix below and the two gates it broke. Unrelated work commits
   separately, even though it necessarily lands in formatted shape. 881 files rewritten: 278
   `.md`, 271 `.ts`, 106 `.tsx`, 73 `.css`, 42 `.mjs`, 34 `.vue`, 33 `.js`, 22 `.html`, 12
   `.mdx`, 8 `.json`, plus a `.jsx` and a `.jsonc`.
2. **Generated artifacts go in `.prettierignore`**, with the reason written there: each is
   produced by a `gen-*.mjs` and compared byte-for-byte against a fresh regeneration by a
   `--check` gate (ADR-0009's idiom). Prettier reformatting one of them, and the generator
   undoing it, is a fixpoint that does not exist — the gate would be red on every run.
   That covers `llms.txt`, `llms-full.txt`, `cookbook-patterns.json`,
   `artboard-palette.css`, `design-status.md`, the preset's snapshot projection, and the
   captured data under `tools/figma/` and `tools/parity/` that nobody writes by hand.
3. **The inverse case is `gen-box-sizing.mjs`, and it is the interesting one.** It writes
   the ADR-0043 geometry-contract block at the _top of an authored stylesheet_, so Prettier
   owns the file and the generator owns a block inside it. Its `selectorFor()`
   unconditionally wrapped a multi-root `:is(...)` selector across lines; Prettier collapses
   that selector when it fits the print width and wraps it when it does not. 24 stylesheets
   (12 React, 12 Vue — Angular emits the single-selector `:host` form and is unaffected)
   could therefore never satisfy both. The generator now formats its block through
   Prettier's own API, resolving the repo's config against the target file, so the two agree
   by construction at any width and across Prettier versions. Reimplementing Prettier's
   line-breaking was rejected: the measured shapes differ in more than the obvious way — for
   a selector followed by ` *`, Prettier indents the `:is(...)` contents four spaces and
   puts the closing paren on its own line.
4. **The acceptance test is a finding census, not an exit code.** Every gate is run
   individually before and after, recording its exit code, its count of error and warning
   markers, and its own `total: N error(s), M warning(s)` line. A gate whose finding count
   moves is a gate whose view of the source changed, and that has to be explained before the
   change lands.
5. **The formatting commit goes in `.git-blame-ignore-revs`.** 881 files in one commit
   otherwise makes `git blame` useless for the rest of the repo's life.

Alternatives considered:

- **Add the 24 stylesheets to `.prettierignore`.** Rejected, and it was the tempting
  shortcut: those files carry authored CSS that has nothing to do with the generated block —
  `atl-tooltip.css` has a long `animation` shorthand that genuinely wants wrapping — so
  ignoring the file to settle a dispute about its first six lines gives up formatting on all
  of it.
- **Teach the generator Prettier's line-breaking rule.** Rejected: it is reimplementing a
  formatter badly, and it would be wrong again the next time the print width or Prettier's
  CSS printer changes.
- **Format only the files no gate parses with a regex.** Rejected: a permanently
  half-formatted repo is worse than either end state, and it makes the eventual enforcement
  check impossible to write.
- **Widen the print width to shrink the diff.** Rejected on measurement — 895 files becomes
  818, which buys nothing and permanently diverges from the default for no reason.

## Consequences

- **`git blame` needs the ignore file to stay useful**, and a reader who has not run
  `git config blame.ignoreRevsFile .git-blame-ignore-revs` locally will see this commit on
  every line they inspect. GitHub honours the file automatically; a local clone does not.
- **Two gates read source in a shape Prettier changed, and the census caught both.**
  `check:contracts` lost a coverage credit because `arrowParens` rewrote `.map(size =>` to
  `.map((size) =>` and `scanArrayMapCredit`'s regex required a bare identifier;
  `check:contrast` threw outright because `singleQuote` applies to CSS too and its
  `blockFor` did a literal `indexOf` on `[data-theme="dark"]`. Both were fixed in the gates,
  not in the sources: the stories are legitimate, and on the quoting question the repo never
  had a convention to restore — at HEAD it was twelve single-quoted `[data-theme=…]`
  selectors against six double-quoted, with every `content:` and `font-family:` string
  already single-quoted, so Prettier made it consistent rather than changing a decision. The
  acceptance bar for both fixes was the pre-reformat finding count, not a green run: 93
  warnings and 104 contrast pairs, unchanged. Fewer would have meant the gate was fixed by
  being made blinder.
- **Three archive markdown files needed a second `--write` pass to converge** — a compound
  list-and-blank-line reflow that Prettier settles in two steps. Worth knowing before anyone
  concludes from a single dirty run that Prettier is unstable here.
- **Enforcement is not part of this record's change** and is the obvious way for it to rot:
  without a `format:check` in the chain or in CI, the repo drifts back and this commit
  bought one tidy diff and nothing else. That follows immediately, deliberately separated so
  the mechanical diff and the policy change are reviewable apart.
- **One latent gap in the box-sizing fix**, found by its author rather than by a reviewer: a
  stylesheet consisting of _only_ the geometry block would end with a trailing blank line
  that Prettier normalises away, breaking the fixpoint for that file. No current stylesheet
  is that short. Left unfixed rather than guarded speculatively, and recorded here so it is
  recognised rather than re-diagnosed.
