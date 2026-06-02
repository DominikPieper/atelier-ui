---
status: accepted
date: 2026-06-01
sources:
  - "plan/ai-readiness.md § 4 (drift-gate summary + Future work)"
  - "plan/figma-component-checklist.md (the manual checklist this gate automates)"
  - "Figma file QMnDD8uZQPldPrlCwZZ58T (live figma-console-mcp inspection: figma_get_component, figma_analyze_component_set, figma_get_component_for_development_deep, figma_get_variables)"
  - "this session"
---

# ADR-0019: Figma conformance gate (`check:figma`) via committed snapshot + offline check

## Status

Accepted. Recorded at decision time. **Complements ADR-0009** (drift-gate system: one
source → projection → `--check`) — this applies the same gate pattern to the one
AI-readiness layer that had no automatic drift gate, and **complements ADR-0018**
(Figma token tiering) by enforcing that components bind to the semantic `--ui-*` layer.

## Context

`plan/ai-readiness.md` § 4 states plainly that Figma is *"the only AI-readiness layer
without an automatic drift gate"* — its conformance rested entirely on the manual
`plan/figma-component-checklist.md`, enforced by the PR reviewer. Every other layer
(spec, tokens, CSS variants, defaults, metadata, story descriptions, llms.txt, cookbook)
has a `check:*` gate; Figma did not. The checklist's five items — name alignment,
variant-matrix completeness, token-link coverage, auto-layout, description — are exactly
the things that silently break MCP-to-code generation when they drift, and a human ticking
boxes does not catch them reliably.

The structural problem that made this gate non-trivial: **Figma is an external source.**
Every other gate compares two in-repo artifacts and is deterministic. A naive Figma gate
would have to call the Figma Desktop Bridge live on every run — which needs Figma Desktop
open with the bridge plugin connected, and therefore **cannot run in CI**. That live
dependency is why the gate was deferred as "Future work" rather than built.

Live inspection of the file (`QMnDD8uZQPldPrlCwZZ58T`) also surfaced concrete realities the
gate has to model:
- Masters are section-prefixed: the Button COMPONENT_SET is named `Action/LlmButton`, not
  `LlmButton`. Name alignment must compare the **leaf** segment.
- Figma carries an extra `state` interaction axis (default/hover/focus/active) with **no spec
  union**. The gate must check only axes that map to a spec union and ignore the rest.
- Spec unions like `LlmCardRole` are **code-only** props deliberately not modelled as Figma
  variants — a real false-positive that the allowlist must absorb.
- Token binding is uneven: in the captured masters all *colours* are bound to UI Tokens, but
  *corner radii* and *padding/gap* are pervasively unbound raw values. The gate's first run is
  meant to surface that backlog, not hide it.

## Decision

Build **`check:figma`** as a committed-snapshot + offline-check gate, in the existing
`gen-*/--check` idiom (ADR-0009).

1. **Two scripts, one connected.** `tools/scripts/figma-snapshot.mjs` (`npm run figma:snapshot`)
   is the *only* part that touches Figma: it spawns `figma-console-mcp` as a stdio MCP client
   (via `@modelcontextprotocol/sdk`), probes the bridge, reads each master with the named
   read-tools, and writes `tools/figma/snapshot.json`. `tools/scripts/check-figma.js`
   (`npm run check:figma`) runs **fully offline** against that committed snapshot plus
   `libs/spec`.
   - **Why:** isolating the live dependency into a manual refresh keeps the gate itself
     deterministic and CI-safe. The snapshot stores Figma *facts* (names, variant axes,
     descriptions, `layoutMode`, and bound/unbound/raw determinations per node); all rules and
     severities live in the gate, so the rule logic is testable and reviewable in-repo.
   - **Rejected — live at check time:** needs the bridge/Desktop on every run, cannot run in CI,
     and is non-deterministic. **Rejected — Figma REST API directly:** CI-friendly, but variable
     *name* resolution (confirming a bound var is a `--ui-*` token) is Enterprise-gated, and it
     diverges from the figma-console read-tools the rest of the workflow uses. The snapshot
     approach gets the CI-safety of REST without either drawback.

2. **Five checks, three severities, symmetric exit code.** Per master, compared against
   `libs/spec/src/index.ts` (selectors + string-literal unions) and the component's
   `.metadata.ts`:
   - **Name alignment** (selector == leaf name; spec axis unions present as Figma variant
     properties; values match literals exactly, `primary` not `Primary`) → **Blocker**.
   - **Variant-matrix completeness** (every `metadata.variantMatrix` row exists as a Figma
     variant) → **Blocker**.
   - **Token-link coverage** (no raw hex fills/strokes, no raw px radii, no raw spacing) →
     **Critical**; a binding to a non-semantic collection → Warning.
   - **Auto-layout** (every frame *with children* uses Auto Layout; childless dividers exempt)
     → **Critical**.
   - **Description congruence** → **Warning**.
   - **Why these severities:** name and variant mismatches *silently break* the MCP→code mapping
     — generated code references props/values that don't exist — so they must block. Raw values
     and missing auto-layout *degrade* generation quality (the model loses the token vocabulary
     and responsive intent) but don't break the mapping, so they fail the build as Critical
     without being mapping-breakers. Blocker + Critical go to `errors` → `exit 1`; Warning prints
     and exits 0 — the same bucketing the other gates use.

3. **Description congruence is presence + spec-linkage, not byte-equality.** The checklist said
   "description == `metadata.purpose` verbatim", but live descriptions are intentionally rich
   multi-paragraph docs ("Action button. Maps to LlmButtonSpec…") while `purpose` is one
   sentence — strict equality would warn on all 27 masters, which is noise, not signal. The
   gate instead warns only when the description is **missing** or **does not reference the spec
   interface it maps to**. **Rejected — verbatim equality:** all-warn, zero signal.

4. **Reuse the existing allowlist, don't invent a mechanism.** `FIGMA_CONFORMANCE_EXCEPTIONS`
   is added to `tools/scripts/lib/allowlists.js` as a `Set` of `selector:check:detail` triples,
   the same exact-string `.has()` idiom as `VARIANT_AXIS_EXCEPTIONS`. Seeded with exactly one
   entry — `LlmCard:name:role` (the code-only landmark role). It is intentionally otherwise
   empty so the gate surfaces the real unbound-token backlog rather than pre-suppressing it.

5. **Standalone, not in `check:all` or pre-push (for now).** `check:figma` is a top-level npm
   script only. **Why:** the snapshot must stay fresh, and refresh needs the bridge — wiring it
   into `check:all`/CI today would either go stale silently or require the bridge in CI, which
   does not exist. Run it manually before a Figma-touching release.

## Consequences

- **The CI/bridge dependency is now confined to refresh, not the check.** This is the key
  trade-off the gate was designed around. `check:figma` has *no* live dependency, so it *could*
  later join `check:all`/CI — the remaining blocker is a **snapshot-freshness policy**, not
  bridge availability. The snapshot carries `generatedAt`, `gitSha`, and (when refresh captures
  it) Figma's `lastModified`; a future `--verify-fresh` flag could do one cheap REST call to
  compare. Until then, freshness is refresh discipline.
- **First run is red, by design.** Against the current file the gate reports raw corner radii
  (Badge `9999`, Card `12`/`6`) and pervasively unbound padding/gap as Critical. That is a true
  finding — the Figma library is not yet fully token-bound on spacing/radii — and the backlog it
  exposes is the gate doing its job, not a bug. Triage is: bind the value in Figma and re-snapshot,
  or allowlist a justified exception.
- **The committed snapshot currently covers 3 of 27 masters** (LlmButton, LlmBadge, LlmCard),
  captured to prove the gate end-to-end without a full bridge run during implementation. The
  `coverage` field records this explicitly (no silent cap); `npm run figma:snapshot` captures all
  27 when run with the bridge connected.
- **Token/auto-layout checks sample the default variant** of each master (one deep read per
  component), not all variants — recorded in the snapshot `coverage` field. Full per-variant
  coverage would multiply the snapshot size ~20× for marginal extra signal.
- **Masters without a spec interface** (e.g. `LlmCodeBlock`, `LlmToast`) will raise a name
  Blocker on a full snapshot until allowlisted — a deliberate prompt to either add a spec or
  record the exception.
- **New dependency:** `@modelcontextprotocol/sdk` (devDependency) for the refresh client only;
  the offline gate has no new runtime dependency.
- **Code Connect, the `codeSpec` extractor, and atelier-codegen remain out of scope** — this ADR
  is only the conformance gate.
