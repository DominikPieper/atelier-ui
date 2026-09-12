---
status: accepted
date: 2026-09-12
sources:
  - tools/stylelint-rules/{index,utils,no-raw-color-literal,no-undeclared-token,no-primitive-token,no-token-bypass}.js and stylelint.config.mjs (what the port built)
  - tools/scripts/check-variants.js, check-typeface.js, check-dead-selectors.js, gen-box-sizing.mjs (what it did not)
  - plan/adr/0126-the-linter-is-a-gate-where-the-invariant-fits-in-one-file.md (the line this refines, and where the refinement is written)
  - plan/adr/0034-what-a-green-check-all-asserts.md (`kind: design|gap` exemptions, and the staleness rule a rule option would have lost)
  - plan/adr/0009-drift-gate-system.md (one source -> projection -> `--check`, why gen-box-sizing was never a candidate)
  - plan/adr/0127-prettier-owns-the-file-the-generator-owns-its-block.md (gen-box-sizing's Prettier dependency, and why stylelint 17 needs no compatibility shim)
  - plan/adr/0080-a-guard-that-skips-is-not-a-check.md (the ratchet baseline check:typeface carries and stylelint has no model for)
  - measured 2026-09-11/12: 110 CSS files, five parity mutations per stage, two cache-invalidation proofs
---

# ADR-0130: A rule needs somewhere to put the finding

## Status

Accepted 2026-09-12. Closes the CSS-discipline port ADR-0126 opened and refines its line;
the refinement is written into ADR-0126 in the same commit.

## Context

ADR-0126 drew a line — an invariant one file can decide is a lint rule, an invariant joining
two sources of truth is a gate — and listed the CSS-scanning family as the obvious next
candidates, pending a decision on stylelint. That decision was taken on 2026-09-11 and the
port ran in three stages.

Two facts had to be established before any of it.

**stylelint needs no Prettier compatibility shim.** The usual answer — install
`stylelint-config-prettier` — is out of date. Listing the installed stylelint 17's own rules
directory shows **zero** formatting rules; they were removed in 16 and split into an opt-in
`@stylistic` plugin this repo does not install, and that config's last publish predates the
split. There is nothing left in core stylelint that could fight Prettier, so the answer is
to install nothing.

**A rule reading a file outside the one it lints is the cache trap ADR-0126's Consequences
named**, and here it is not hypothetical: the token source lives outside every consuming
project's root. Proven rather than argued, twice — renaming a live 24-use token and running
_without_ `--skip-nx-cache` produced a real cache miss and 13 `[UNDECLARED]` failures across
all four projects, and removing an exemption entry produced a miss and three fresh
`[PRIMITIVE]` failures. Declared inputs, doing their job.

**And the exemptions were the substantive decision, not the rules.** Unlike the two maps the
ESLint ports retired — one empty, one three entries — `PRIMITIVE_EXEMPTIONS` and
`TOKEN_BYPASS_EXEMPT` carry ADR-0034's full structure: `kind: 'design' | 'gap'` plus a `why`,
where a gap nags every run, a design stays silent, and a stale entry blocks. A stylelint rule
option taking a list of strings loses all three. It would have been a regression dressed as a
port.

## Decision

**Three gates became four stylelint rules. Three stayed gates, and the reason they stayed
sharpens ADR-0126's line: a rule earns it only when every occurrence it could flag has one
specific file and location that is the place the finding belongs.**

1. **Ported.** `check:css-tokens` splits into `atelier/no-raw-color-literal` and
   `atelier/no-undeclared-token`; `check:token-tiers` becomes `atelier/no-primitive-token`;
   `check:token-bypass` becomes `atelier/no-token-bypass`. `tools/stylelint-rules/` mirrors
   `tools/eslint-rules/` rather than inventing a second plugin shape. `check:all` goes 45 →
   43 steps: stage 1 is a swap (`check:css-tokens` out, `check:stylelint` in), stage 2 deletes
   two scripts outright. Read the chain in `package.json` for today's number — it moves.
2. **The exemption maps stay in `tools/scripts/lib/allowlists.js` and the rules `require()`
   it** — both sides are already CommonJS. That file's header calls itself the single source
   of truth for hand-maintained exceptions; a stylelint rule enforcing a CSS invariant is the
   same kind of consumer a script gate was, and splitting two maps out would cost an auditor
   a second place to look for nothing.
3. **Wired as a sibling `stylelint` target, not folded into `lint`.** `lint` for the three
   libraries is _inferred_ by `@nx/eslint/plugin` from each project's own config; overriding
   it to also shell out would re-implement what inference gives for free, and `docs` has no
   `lint` target at all. The repo already runs cacheable siblings this way
   (`storybook-test` beside `test`).
4. **`check:variants` stays a gate, and it is the case that defines the line.** Its
   `cssClasses()` reads _every_ `.css` file in a component directory and unions the class
   names — load-bearing, because `libs/angular/src/lib/toast/` splits `.variant-*` and
   `.position-*` across two stylesheets while `AtlToastVariant` and
   `AtlToastContainerPosition` both map to the component key `"toast"`. So its primary verdict
   is "does `.variant-danger` exist anywhere in this directory", a property of a directory and
   not of a file; and the defect it reports is an **absence**, which has no line to anchor to.
   A linter's whole advantage — the finding appears where you are typing — is the one thing
   such a rule cannot give. It also compiles `libs/spec/src/index.ts` through
   `ts.createProgram`, which puts it on the gate side of the original line as well.
5. **`check:typeface` stays**, for two independent reasons: its grouping is directory-scoped
   _by design_ (a `rootKey` per component, so `[DESCENDANT]` means "the root did not declare
   it", again an absence), and `[NO-SIZE]` is ratcheted against
   `tools/parity/typeface-baseline.json`, a shape stylelint has no model for. **`check:dead-
selectors` stays** for the reason its own header gives: every other CSS check asks whether
   a class exists in the CSS, and this one asks whether a template can ever emit it — a join,
   and one whose resolution runs the TypeScript checker. **`check:box-sizing` was never a
   candidate**: it is a generator in `--check` mode (ADR-0009's idiom) that must call
   Prettier's async API (ADR-0127 §3), not a linter of authored input.

Alternatives considered:

- **`stylelint-config-standard` as a base.** Rejected: this repo's CSS discipline is the
  four rules above, and a base config would import opinions nobody here decided on and
  nothing here enforces. The config carries a comment saying so, because "why is there no
  base config" is the obvious question a reader asks.
- **Exemptions as rule options.** Rejected as above — `kind`, `why` and staleness are the
  content, and a string list is none of them.
- **Port `check:variants` anyway, one rule per stylesheet.** Rejected: with the Angular toast
  split it would either report every file's missing half or need per-file metadata that does
  not exist, and either way the finding has nowhere to go.
- **Scan all three framework trees from each `stylelint` target** to keep the retired
  scripts' cross-framework staleness. Rejected, with the trade recorded: cache independence
  won, see the Consequences.

## Consequences

- **Four invariants now fail in the editor and are cached per project.** Baseline clean: 0
  violations over 110 files at stage 1, and one `[GAP]` warning and nothing else at stage 2 —
  matching the retired scripts exactly, which is the acceptance bar, not a green run.
- **Staleness narrowed from cross-framework to per-framework**, and this is a trade rather
  than an oversight. Nx wires one target per project, so an exemption legitimately asymmetric
  across frameworks would now be reported stale by the two that do not reference it. Every
  current exemption is referenced identically in all three (verified by grep before building
  on it), so today's behaviour is unchanged. Documented in both rule headers and in
  `tasks/todo.md`.
- **One thing the port improved rather than copied:** the original hand-rolled a regex
  extractor for `.astro` `<style>` blocks. `postcss-html` does it with byte-exact line
  numbers, verified against a real file, so that extractor is gone.
- **The near-miss is worth more than the successes.** An explanatory `//` comment was placed
  in `nx.json`'s new target-default block. Nx, its own jsonc parser and Prettier all tolerate
  it — but `check-release-drift.mjs` does a strict `JSON.parse` on `nx.json` and would have
  thrown, and that gate is deliberately not in `check:all` (it asks the npm registry), so no
  proof run here would ever have caught it. Found by its author looking for the weakest point
  rather than by a gate. The comment lives in `stylelint.config.mjs` now.
- **Verified as of this record:** the stylelint target exits 0 over 110 files; ten parity
  mutations, five per stage, each failing the old script and the new rule at matching line
  numbers before the script was deleted — a raw hex in library CSS, a raw `rgba` in the docs
  stylesheet, a raw hex inside an `.astro` `<style>` block, an undeclared token on each side,
  a primitive token reaching past the semantic tier, a stale exemption, a literal duplicating
  a token's value, a raw border-width, a `gap`-kind entry demoting to a warning, and a stale
  bypass exemption; both cache-invalidation proofs; `check:format` and `nx run-many -t lint`
  clean. **Assumed:** that `postcss-html`'s line numbers stay byte-exact for `.astro` shapes
  beyond the ones tested — one real file was checked, not the family.
