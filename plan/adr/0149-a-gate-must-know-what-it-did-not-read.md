---
status: accepted
date: 2026-10-03
sources:
  - plan/adr/0148-one-css-file-per-component-in-a-published-styles-package.md (the migration that exposed all three)
  - tasks/todo.md ("Structure lessons from the DB UX Design System", P1.1b–P1.4)
  - tools/scripts/storybook-build.mjs, tools/scripts/lib/parity-inputs.js (the input stamp)
  - tools/stylelint-rules/rooted-selector.js (+ its node:test cases)
  - tools/figma/type-baseline.json (`LAYER-UNRESOLVED`)
---

# ADR-0149: A gate must know what it did not read

## Status

Accepted 2026-10-03. This extends ADR-0080 ("a guard that skips is not a check") from guards to coverage. It applies ADR-0126/0130's gate-versus-rule line to one new rule, and ADR-0078's ratchet to one new count.

## Context

Moving every component stylesheet into `libs/styles` (ADR-0148) changed where the CSS lives. Five gates kept passing throughout, and three of them were found to be checking less than they appeared to:

- **`check:box-sizing` and `check:dead-selectors` passed on partial coverage.** Before the path change they read 78 of 87 and 80 of 89 stylesheets. Nothing in their output said so, and the missing files were simply never opened.
- **`check:figma` skipped every layer it could not resolve to a CSS rule**
  (`if (body === undefined) continue`). Child-combinator selectors, which ADR-0148 requires, stopped resolving, so toggle's track and thumb, and later the stepper's parts, quietly left the check. A temporary counter showed 31 layers resolved before a fix and 77 after.
- **`check:paint` measures the built `dist/storybook/<fw>`, not the source.** During the migration it reported on a build older than the CSS it was supposed to check, for stepper and toast. That was a green result about code that no longer existed.

A fourth exposure points the other way. ADR-0148's "every selector is rooted in its component's `.atl-*` class" was enforced only by a throwaway script I ran by hand after each batch. That is a property of one file at a time, so by ADR-0126/0130 it is a lint rule, not a gate.

## Decision

1. **A gate that reads a set of files compares the set it read with the set that exists, and fails with `[PARTIAL-COVERAGE]` naming what it skipped.** The set that exists comes from walking the tree, not from the gate's own discovery helper; otherwise the two could share a blind spot. Applied to `check:box-sizing` and `check:dead-selectors`.
2. **A gate that skips items it cannot resolve records them as a ratchet baseline (ADR-0078) instead of `continue`.** `check:figma` now records `LAYER-UNRESOLVED` per master in `tools/figma/type-baseline.json`, 80 layers across 11 masters. A layer that stops resolving fails the gate. A layer that starts resolving also fails until it is re-recorded, which is how coverage moves up and never silently down.
3. **A gate that reads a build artefact proves the artefact is current.**
   - `tools/scripts/storybook-build.mjs` backs every `build-storybook` target. It hashes the build's inputs and writes `dist/storybook/<fw>/.atelier-inputs.json`. The inputs are the framework's `src` and `.storybook`, `libs/styles/src` and `libs/spec/src`, hashed with the same helpers as `parity-inputs.js`.
   - `check:paint` re-hashes before measuring. It fails with `[STALE]`, naming the newest changed input, and also fails when the build carries no stamp.
   - It compares a content hash, not an mtime: a bare `touch` is not stale, a real edit is.
4. **`atelier/rooted-selector` is a stylelint rule.** It applies to `libs/styles/**` and the `libs/<fw>` override sheets, and requires two things:
   - every selector starts with an `.atl-*` class, an `:is(` list of them, or `[data-theme…]` followed by one;
   - every `@keyframes` name starts with `atl-`.
     It accepts any `.atl-*`, not only the directory's own name, because `atl-option`, `atl-step` and `atl-tab-group` are legitimate roots in other directories. It ships with 31 `node:test` cases run by `check:stylelint`. Following ADR-0130's byte-identical `index.js`, it is vendored into the create-workspace preset but not wired there: the scaffold's own CSS has no `.atl-` root to require.

## Why

- **Why it was not caught earlier:** all three gates went silent the same way. A gate that does not know what it skipped reports a narrower question as if it had answered the broad one. Every individual skip had a local reason: a file the discovery helper did not know, a layer name that spelled no class, a build nobody had re-run. That is why reviewing the gates one at a time never surfaced it.
- **Hash rather than mtime for the build stamp:** an mtime fails on checkout and touch, so the warning gets ignored. A hash is only stale when something changed.
- **A ratchet rather than a hard fail for unresolved layers:** some layers legitimately resolve to no rule, such as wrappers and auto-layout frames. A hard fail would need an exemption per layer before the gate could run at all, and the ratchet gets the same protection against silent narrowing without that.
- **Rejected: a `check:rooted-selectors` gate.** It would read one file at a time, with every finding attributable to one line, which is exactly the shape ADR-0130 assigns to stylelint.

## Consequences

- **The three gates now fail on coverage drops**, which they did not before. Each was demonstrated with a deliberate break and then restored:
  - a stray stylesheet trips `[PARTIAL-COVERAGE]` in both file gates;
  - renaming toggle's `.track` trips a `LAYER-UNRESOLVED` blocker;
  - editing a CSS file after the build trips `[STALE]`.
- **Run order matters.** `check:paint` needs a fresh `build-storybook` first, and `check:all` already runs `check:storybook-manifests` before it. Running `check:paint` alone after editing CSS now fails loudly instead of passing quietly.
- **The baseline is coarse.** All 80 unresolved layers are recorded under one `design` kind. Some are true wrappers; others are parts whose layer name does not spell their class, which is a naming gap. Splitting them into `design` and `gap` is open work, tracked in `tasks/todo.md`.
- **The deployed hosted Storybook now carries `.atelier-inputs.json`.** It is a list of path hashes, which I judged harmless but did not review further.
- **The `:host` handling left in `check-typeface` and `check-geometry` is dead code** since ADR-0148. It is left in place for now.
