---
status: accepted
date: 2026-08-29
sources:
  - tasks/schulung-review-2026-08-28.md (B2, and the workerd reproduction that found the deeper defect)
  - worker/mcp.ts (the fix and its inline rationale)
  - plan/adr/0080-a-guard-that-skips-is-not-a-check.md (the preflight half of B2 follows its lesson)
  - CLAUDE.md (the hosted-surface table this changes, and the manual fallback this automates)
---

# ADR-0083: The manifest the framework cannot emit

## Status

Accepted. The hosted Angular and Vue Storybook MCP endpoints serve their own MDX
docs manifest plus **React's components manifest** as the cross-framework API
reference. Recorded at decision time.

## Context

The workshop-material audit (B2) found the hosted Storybook MCP failing every
tool call with a Cloudflare 522: `worker/mcp.ts` fetched the static manifests
via its own public URL, and a worker deployed with `run_worker_first`
re-enters itself on a same-zone subrequest. That half of the fix is mechanical
— fetch through the `ASSETS` binding instead — and is not the decision here.

Reproducing the fix in workerd against the real production manifests exposed a
second, deeper defect the 522 had masked: **the Angular and Vue endpoints were
dead by design.** Storybook 10.4/10.5 emits `components.json` for React only,
so those endpoints fell back to an empty components manifest — and
`@storybook/mcp` (0.8.0, and still 10.6.0-beta.0 at `dist/index.js:1260`)
throws on an empty components manifest inside `fetchManifests`, through which
**every** tool routes, including the docs-only tools the endpoints existed to
serve. The MDX foundation docs advertised for Angular/Vue could never have
been served by these endpoints at these versions.

This mattered immediately because B2's other half made preflight honest: it
now speaks real JSON-RPC and would have shown two permanently red rows to
every Angular/Vue workshop participant on a fully healthy deployment.

## Decision

On a 404 for a non-React `components.json`, the worker retries the same
manifest path under `storybook-react`. Each endpoint keeps its own
`docs.json`; Angular and Vue additionally serve React's components manifest as
the cross-framework API reference.

**Why this is legitimate rather than a lie:** the spec contract is identical
across the three adapters by construction — prop and variant names are the
same everywhere, and the drift gates (`check:spec`, `check:variants`,
`check:defaults`, `check:a11y-parity`) exist precisely to keep that true.
CLAUDE.md already prescribed exactly this substitution as a *manual* fallback
("For Angular/Vue prop tables, fall back to the React MCP as cross-framework
API reference"). The worker now performs the substitution the instructions
asked every agent to perform by hand. The consumer is Claude, not a human
reader, and the payload it needs — names, variants, defaults, state props — is
framework-invariant.

**Corrected 2026-08-29 — the scope of "React-flavoured".** This paragraph
originally read "only the story paths are React-flavoured", which understates it
and made the ADR disagree with the docs pages that cite it. Measured against
production: an Angular `get-documentation` on `components-inputs-atltoggle`
returns `checked`, `onCheckedChange`, `errors`, `children?: ReactNode`,
`invalid`, `disabled`, `required`. Three of those seven do not exist on the
Angular component (`onCheckedChange` is a two-way `model()`, i.e.
`[(checked)]`/`(checkedChange)`; `errors` is absent; `children` is content
projection, not a prop) and two real Angular inputs — `name`, `touched` — are
never mentioned. Vue diverges the same way (`update:checked`, `<slot />`, plus
an `id` the manifest omits). Neither `errors` nor `children` appears anywhere in
`libs/spec/src/index.ts`: they are React bindings, not spec contract. The
pattern is systematic, not a Toggle one-off — 18 React files declare
`children?: ReactNode` against 20 Angular `ng-content` and 45 Vue `<slot>`, and
eight React `on*Change` props map one-for-one onto eight Angular `model()`
declarations and eight Vue `update:*` emits. The invariant subset the decision
rests on is real and gated; the reply is React-**shaped** throughout — JSX
snippets, React story paths, `children`, and `on*Change` — and every
participant-facing surface now says so. Read it as an API reference, not as code
to copy.

**Alternatives rejected:**

- **Bump `@storybook/mcp`** — checked, not assumed: 10.6.0-beta.0 still throws
  on an empty components manifest. There is no version to bump to.
- **Drop the hosted Angular/Vue endpoints** from `.mcp.json`, the preset
  template and the docs table. Guts a public surface, invalidates the kata's
  per-framework prompt substitution, and tramples three untouched audit
  findings (M1/M3/M6) that assume the endpoints exist.
- **Teach preflight to tolerate the error string** on Atelier endpoints —
  re-opens the exact blind spot B2 closed (ADR-0080: a probe that excuses a
  failure class is indistinguishable from a passing check).
- **The empty-manifest fallback stays deleted.** It existed to keep the
  handler constructible and made the endpoints answer politely while unable to
  serve anything — a guard that skips, one layer up.

## Consequences

- Verified in workerd against the real production manifests: Angular
  `list-all-documentation` → HTTP 200, full component list;
  `get-documentation` AtlToggle → full doc; the Angular MDX docs section
  intact; React unchanged. **The production `wrangler deploy` is still owed**,
  plus one post-deploy preflight run (tracked in tasks/todo.md).
- CLAUDE.md's hosted-surface table row now states the substitution. The
  audit's n1 findings ("docs only" phrasing on mcp.astro / claude-md.astro)
  are stale in the opposite direction after deploy and remain open.
- An Angular participant reading a served story path sees a React file path.
  Acceptable for the consumer (Claude) and the payload (spec-identical API);
  a human following story links lands in the wrong framework's tree — worth a
  one-line caveat wherever the docs teach the hosted surface (open, with n1).
- If a future Storybook emits `components.json` for Angular/Vue, the 404
  branch stops firing and each endpoint serves its own manifest with no code
  change — the substitution is self-retiring.
