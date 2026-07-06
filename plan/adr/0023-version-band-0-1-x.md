---
status: accepted
date: 2026-06-17
sources:
  - "approach audit 2026-06-17 (finding `version-band`)"
  - "plan/adr/0016-release-nx-release-not-for-production.md"
  - "libs/{react,vue,angular}/package.json (version 0.1.9), libs/spec/package.json (0.0.13)"
  - "this session"
---

# ADR-0023: Version band moves to 0.1.x (revises ADR-0016's 0.0.x signal)

## Status

Accepted. Recorded at decision time. **Revises one consequence of ADR-0016**
(the "versions stay at 0.0.x to signal not-for-production" line); the rest of
ADR-0016 — nx release, automation-token publish, publish-only recovery — stands
unchanged. ADR-0016 is not superseded, only this one consequence is updated.

## Context

The approach audit (2026-06-17) found that the three framework packages are at
`0.1.9` while ADR-0016 documents a deliberate `0.0.x` band whose purpose is to
signal "not for production". `libs/spec` is still at `0.0.13`. No ADR or roadmap
entry recorded the move off `0.0.x`.

The most likely mechanism: under `nx release --yes` with Conventional Commits,
a `feat:` commit rolls the **minor** version. At `0.x` semver gives the minor
no special "stable" meaning, so a feature commit silently advanced the band from
`0.0.x` to `0.1.x` with no decision behind it. The drift is a documentation /
intent gap, not a runtime defect.

Two ways to resolve it: re-pin to `0.0.x` (force patch-only bumps), or accept the
`0.1.x` band and record what it now signals. We choose to **accept `0.1.x`**.

## Decision

Treat the current `0.1.x` band as intentional and keep it.

- **Pre-1.0 remains the "not for production" signal.** The whole `0.y.z` range is
  pre-stable under semver: no API-stability promise, breaking changes allowed in
  any release. The not-for-production meaning ADR-0016 attached to `0.0.x` is
  carried by *being pre-1.0*, not specifically by the second zero. Moving from
  `0.0.x` to `0.1.x` does not weaken that signal.
- **Under `0.y.z`, a `feat:` bumps the minor and a `fix:` bumps the patch** — the
  standard Conventional-Commits behaviour `nx release` already applies. We do not
  fight it with a forced patch-only config; letting `feat` roll the minor is
  reasonable signalling within pre-1.0.
- **`libs/spec` trailing at `0.0.x` is allowed.** The packages version
  independently; the spec simply has had no `feat` yet. No attempt is made to
  lockstep the four packages.
- **Why not re-pin to `0.0.x`:** it would mean overriding `nx release`'s default
  bump logic and rewriting already-published version history for a purely cosmetic
  "second zero", with no consumer benefit — the not-for-production signal is
  already intact via pre-1.0.

The promise that the band stays pre-1.0 until a real stability decision is the
hard part: **`1.0.0` is reserved for an explicit decision** (its own future ADR)
that the spec contract is stable, paired with the API-stability / deprecation
policy the audit flagged as currently missing.

## Consequences

- ADR-0016's "Versions stay at 0.0.x" consequence is updated: versions stay
  **pre-1.0 (`0.y.z`)** to signal not-for-production; the `0.0.x` → `0.1.x` move is
  recorded here, not an accident to undo.
- `feat:` commits will continue to roll the minor within `0.x`; reviewers should
  not treat a `0.x` minor bump as a stability milestone.
- Reaching `1.0.0` is now explicitly gated on a separate decision (stable spec
  contract + a deprecation/migration policy), so the band cannot drift to `1.x`
  the way it drifted to `0.1.x`.
- Any consumer-facing copy that states the literal `0.0.x` band (rather than
  "pre-release / not for production") should be reworded to the pre-1.0 framing.
