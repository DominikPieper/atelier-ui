---
status: accepted
date: 2026-06-17
sources:
  - "approach audit 2026-06-17 (findings `no-render-equivalence-gate`, `no-shared-conformance-suite`, `id-binding-not-behavioral-equivalence`, `keyboard-activation-model-diverges`)"
  - "plan/adr/0011-typed-covers-behavior-gate.md (covers() is binding parity, not behavioral)"
  - "plan/adr/0009-drift-gate-system.md, plan/adr/0019 (committed-artifact + offline --check idiom)"
  - "this session"
---

# ADR-0025: Cross-framework accessibility conformance gate (`check:a11y-parity`)

## Status

Accepted. Recorded at decision time. **Complements ADR-0011** (typed `covers()`):
where `covers()` proves the same behaviour *id* is bound in each framework, this
proves the three adapters actually *expose the same accessibility tree* at runtime.

## Context

The repo's reason to exist is "one spec, three faithful adapters", but the audit
found every existing parity gate compares **strings**: `check-sync` (dirs),
`check-variants` (CSS class names), `check-defaults` (default literals),
`behavior-coverage` (covers() id bindings), `check-exports`/`check-metadata`
(structure). None renders a component in all three frameworks and compares what
they expose to assistive technology. So "faithful adapters" was asserted at the
type/string level and unverified at runtime — and the adapters already diverge:
`covers()` counts the same id while the Vue accordion test only asserts the
disabled *attribute* where React/Angular click and assert no-toggle; Vue tabs use
automatic activation where React/Angular use manual.

The structural difficulty: the three render genuinely different DOM. React/Vue
emit a native `<button>`; Angular emits `<llm-button role="button" aria-disabled>`.
A DOM diff would be all-noise. The meaningful invariant is the **accessibility
tree** — role + accessible name + ARIA states — which must match even though the
DOM does not.

## Decision

Add **`check:a11y-parity`**: a committed-artifact + offline-`--check` gate
(ADR-0009 idiom) over a *normalized accessibility tree* captured from real renders.

1. **A shared normalizer, captured per framework, diffed offline.**
   - `libs/<fw>/src/testing/a11y-tree.ts` — a framework-agnostic
     `a11yTree(root): {role, name, states}[]`. It walks the rendered DOM and
     **normalizes to semantic equivalence**, which is the crux: native `disabled`
     and `aria-disabled="true"` collapse to one `disabled:true` state (so a
     native-button adapter equals a role+aria-host adapter); `aria-X="false"`/absent
     are dropped; `aria-hidden` subtrees (e.g. the loading spinner) are excluded
     from both the tree and the accessible name; role-less wrapper elements are
     skipped. Without this normalization React and Angular would *never* compare
     equal despite being equivalent to a screen reader.
   - Each adapter's `llm-button.a11y.spec.*` renders the canonical scenarios
     (default / disabled / loading) in its existing jsdom + Testing-Library setup
     and, under `UPDATE_A11Y=1` (`npm run gen:a11y`), writes
     `tools/parity/a11y/llm-button.<fw>.json`. Without the flag it asserts the live
     render still equals its committed snapshot — the **per-framework drift guard**,
     run by `nx test` in CI.
   - `tools/scripts/check-a11y-parity.js` reads the committed snapshots, groups by
     component, and asserts the three frameworks are deep-equal. A divergence is a
     **BLOCKER**; a missing framework snapshot is a WARNING.

2. **jsdom, not a browser; capture-and-diff, not a hand-authored contract.**
   - **Why jsdom:** all three adapters already have working jsdom Testing-Library
     suites; the browser `storybook-test` path is unavailable on Angular (its target
     is broken per the 2026-04-28 triage). jsdom + a normalized tree gets the
     cross-framework signal today without that blocker.
   - **Why diff actual renders rather than assert against one authored contract:**
     a hand-authored expected tree could itself be wrong; diffing three real renders
     means the adapters must agree with *each other*, with no privileged reference.

3. **In `check:all`/CI — unlike `check:figma`.** This gate is fully offline and
   deterministic (reads committed JSON), and the snapshots only change via the
   explicit `gen:a11y` step, so it is safe to enforce on every run. The per-fw drift
   guard rides the existing `nx test` job. (`check:figma`/`check:parity` stay out of
   CI because *their* refresh needs the Figma bridge; this one does not.)

4. **Proof scope: LlmButton.** Button is the adapter whose DOM diverges most
   (native button vs role-host), so it exercises the normalizer's hardest case.
   Extending to more components is adding scenarios to a `*.a11y.spec.*` per
   component + `gen:a11y`; no gate change.

## Consequences

- **Runtime a11y equivalence is now enforced, not assumed.** A divergence — one
  adapter dropping an ARIA state, exposing a different role, or computing a
  different accessible name — fails the build. Verified: corrupting one
  framework's snapshot makes the gate report the exact divergence and exit 1; all
  three currently produce a byte-identical tree.
- **The normalizer is byte-identical across `libs/{angular,react,vue}/src/testing/`**
  — the same triplication trade-off as `behavior.ts`, chosen because a relative
  import from a spec into shared `tools/` tooling violates `@nx/enforce-module-boundaries`.
  The clean single-source fix is a shared `type:testing` lib (the audit's
  3-framework-maintenance blind spot); deferred to keep this gate self-contained.
  The file is dependency-free so it ships nothing and lints under all three
  adapters' configs (incl. Angular's type-aware rules).
- **New files:** `libs/<fw>/src/testing/a11y-tree.ts` (×3),
  `libs/<fw>/src/lib/button/llm-button.a11y.spec.*` (×3),
  `tools/parity/a11y/llm-button.<fw>.json` (×3), `tools/scripts/check-a11y-parity.js`;
  `package.json` gains `check:a11y-parity` (in `check:all`) + `gen:a11y`.
- **Not behavioural parity in full.** This covers the *static* a11y surface of
  canonical renders. Interaction-model divergence (Vue automatic vs React/Angular
  manual tab activation) and dynamic ARIA need play-function/browser coverage —
  the next step beyond this gate, tracked from the audit's cross-fw findings.
