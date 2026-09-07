---
status: accepted
date: 2026-09-07
sources:
  - "tools/scripts/figma-snapshot.mjs (the fixed read)"
  - "plan/adr/0019-figma-conformance-gate.md (introduced meta.figmaLastModified, never populated it)"
  - "plan/adr/0034-what-a-green-check-all-asserts.md (recorded the null as an open gap at check:figma's promotion into check:all)"
  - "plan/adr/0104-two-directions-one-file-selection-rule.md (added figmaLastModified to parity records as a pass-through, explicitly inert until this closed)"
  - "this session — verified live against the connected Figma Desktop Bridge (figma_get_status, figma_get_file_versions)"
---

# ADR-0105: The version history knows what status does not

## Status

Accepted. Closes a gap three prior ADRs named and left open: `tools/figma/snapshot.json`'s
`meta.figmaLastModified` had been `null` since the field was introduced (ADR-0019),
flagged as unmet precondition when `check:figma` was promoted into `check:all`
(ADR-0034), and copied through into every parity record as a field ADR-0104 called
"inert until the separate, already-open gap... closes." This is that closure.

## Context

`figma-snapshot.mjs` read:

```js
const figmaLastModified = status?.details?.lastModified ?? status?.lastModified ?? null;
```

from `figma_get_status`. Called live against the connected file ("Atelier UI",
`QMnDD8uZQPldPrlCwZZ58T`): the response carries `transport.websocket.connectedFile
.connectedAt`, `lastPongAt`, `pluginVersion`, and similar connection facts — no
`lastModified` field anywhere, at any depth, and the tool's own schema documents
only connection/transport state. The lookup was searching a place that never held
the value. That is the entire cause of the `null` — not a transient bridge issue,
not a stale plugin version, a wrong read target from day one.

`figma_get_file_versions` returns the file's real version history and was verified,
not assumed, on three points before being adopted as the primary source:

1. **Ordering.** Two independent calls — one returning 10 versions spanning
   2026-08-27→2026-08-29, one (labelled-only) returning versions spanning
   2026-04→2026-07-12 — both came back strictly descending by `created_at`. The
   first element of an unpaged call is reliably the newest version.
2. **Pagination direction.** `pagination.next_cursor` is the id of the *last* item
   on the current page, and paging with it walks further back in time (older
   versions), never forward toward newer ones. So the newest state is always the
   first element of the *first* page — no cursor needed, no paging required for
   this use.
3. **`include_autosaves` matters, concretely.** The default (`include_autosaves:
   false`) query's newest entry was a labelled `"Ready for dev"` version from
   `2026-07-12T05:54:55Z`. The true newest state of the file, at the same moment,
   was an *unlabeled autosave* — by a synthetic `"Figma"` user, not a person — from
   `2026-08-29T17:21:06Z`. A labelled-only query would have understated the file's
   last-modified time by 48 days. This is not a hypothetical edge case; it was the
   actual newest entry on the file this ADR was written against.

## Decision

- **Primary source:** `figma_get_file_versions({ include_autosaves: true,
  max_versions: 1 })`, reading `versions[0].created_at`. One round trip, one row.
- **Fallback chain's shape is kept, its content is not trusted.** On a failed call
  (network hiccup, missing `file_versions:read` scope, rate limit), fall back to
  the old `status?.details?.lastModified ?? status?.lastModified` lookup — harmless
  since `status` is already fetched, and forward-compatible if a future MCP version
  ever adds the field there — before finally falling back to `null`, and warn on
  the console when that happens rather than silently keep `null`. The refresh does
  not abort over this one field failing: it is informational, not gated
  (ADR-0104), so a failure here should not turn a healthy bridge read into a
  failed `npm run figma:snapshot`.

## Consequences

- `tools/figma/snapshot.json`'s `meta.figmaLastModified` now carries a real
  timestamp (`2026-08-29T17:21:06Z` as of this refresh) instead of `null`.
  `parity-record.mjs`'s pass-through field (ADR-0104) stops being permanently inert
  on every future `parity:record` run.
- Regenerating the snapshot on 2026-09-07 changed only the three `meta` fields
  expected to change (`figmaLastModified`, `generatedAt`, `gitSha`) — every other
  byte, across all 43 masters and both `snapshot.json` and its companion
  `text-nodes.json`, is identical to the 2026-08-29 snapshot. `check:figma` run
  directly against both snapshots produces the identical 14-warning/0-blocker/
  0-critical finding set; only the header's timestamp line differs. Nothing moved
  in Figma in the intervening 9 days.
- **The mechanism gap this closes was real even though it did not bite this time.**
  The snapshot committed on 2026-08-29 was generated at `15:36:52Z`; the file's
  actual last edit that same day was `17:21:06Z` — the committed snapshot was
  already validating a state 1h44m stale at the moment it was committed, and
  nothing in `check:figma` or `check:all` could have detected that, because the one
  field that could carry the comparison was always `null`. Populating it makes the
  comparison *possible*; it does not by itself make anything *compare* it — see the
  open question below.
- `check:figma`'s existing (unchanged) header line —
  `` `Snapshot: ${generatedAt}${figmaLastModified ? ` · Figma edited ${figmaLastModified}` : ''} · N master(s)` ``
  — now actually prints the second half instead of silently omitting it. Still
  informational only; no gate logic reads the field.

## Open question — proposed here, not built

`check:figma` could compare its own snapshot's `generatedAt` against
`figmaLastModified` and warn (not block — this gate's existing non-blocking
category fits: the fact has no fix-in-code action) when the file's last edit is
newer than the snapshot that validated it. Both values already live in the
committed snapshot, so this closes the loop with a check that stays fully offline
— no live Figma call at gate time, consistent with why `check:figma` reads a
snapshot at all (ADR-0019). This is a proposal only: it was not implemented as
part of this change, and needs its own decision on severity and on which
direction actually matters (staleness relative to `generatedAt`, or relative to
the last commit that touched `snapshot.json` — they can diverge, as this ADR's own
1h44m example shows).
