---
status: accepted
date: 2026-09-05
sources:
  - tools/scripts/preflight.mjs (the file that changed)
  - libs/create-workspace/src/generators/preset/files/tools/scripts/preflight.mjs (its byte-identical copy)
  - tools/scripts/check-sync.js (the gate the fix must keep green)
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (why two environments exist at all)
---

# ADR-0090: One preflight, branched inside, not forked outside

## Status

Accepted. `preflight.mjs` detects which of the two environments from
ADR-0084 it is running in and checks that environment's ports from inside
the single shared file. The two copies of the file stay byte-identical.
Recorded at decision time.

## Context

`preflight.mjs` hardcoded the scaffold's ports (`4200`, `6006`) in its port
check. Run inside the cloned atelier monorepo — which ADR-0084 makes
canonical for the two-day cohort — those ports are wrong: the clone's docs
app serves on `4300`, and each framework's Storybook serves on its own port
(`4400` Angular, `4401` React, `4402` Vue; see `libs/{angular,react,vue}
/project.json` and `docs/project.json:21`). A cohort participant running
`npm run preflight` got a check for ports nothing in their environment uses,
and no signal for the ports that mattered.

The file exists in exactly two places, kept byte-identical by
`npm run check:sync`: `tools/scripts/preflight.mjs` (the canonical copy) and
`libs/create-workspace/src/generators/preset/files/tools/scripts/preflight.mjs`
(the copy `create-workspace` writes into every scaffolded workspace,
unmodified — see `preset.ts`'s `readTemplate('tools/scripts/preflight.mjs')`).
Both copies land at the same relative path (`tools/scripts/preflight.mjs`),
two directories below the workspace root, in whichever tree they end up in.

## Decision

Detect the environment at runtime, inside the one shared file, and branch
the port list on the result — rather than letting the two copies diverge
into environment-specific variants.

The discriminator is `existsSync(resolve(ROOT, 'libs/spec'))`. `libs/spec`
is the framework-agnostic spec contract (`libs/spec/src/index.ts`) that the
three framework libs and the drift gates depend on; `create-workspace`'s
preset generator never writes it into a scaffolded workspace (it writes a
`workshop-<fw>` app instead — see ADR-0084's context). That makes it a
single, cheap `fs.existsSync` check: no shelling out, no project-graph
parse, no risk of the signal being present-but-ambiguous. If it is absent —
including on a tree that fails to match either shape for some other
reason — the script falls back to the scaffold's ports, matching prior
behavior, on the reasoning that the generated workspace is the copy that
ships to strangers and must keep working even when the detection assumption
stops holding.

The detected environment is also printed as its own report line ("atelier
monorepo clone" / "scaffolded workspace") ahead of the port checks, so a
participant who is not in the environment they expected sees it immediately
rather than having to infer it from which ports were checked.

**Rejected alternative: let the two copies diverge.** Hardcode the clone's
ports into the canonical copy and leave the scaffold's copy as-is. This is
what `check:sync` exists to forbid — the two files are supposed to be one
artifact with two delivery locations, not two artifacts that happen to
start alike. Diverging them trades a one-time branch for a permanent
maintenance seam: every future preflight change would need to be written
twice and kept in sync by hand, with no gate catching drift (the sync gate
would have to be weakened or removed first). Branching on a runtime signal
inside the single file keeps the "one artifact" invariant intact and costs
one `existsSync` call.

## Consequences

- `preflight.mjs` now reports the ports that are actually relevant to the
  tree it is running in, in both environments, instead of a fixed pair
  tuned for only one of them.
- The two file copies remain byte-identical; `npm run check:sync` needed no
  changes and stays green.
- The environment line is new, permanent output — a participant training
  material or troubleshooting doc that quotes preflight's exact console
  output verbatim will need a one-line update, but none currently does.
- The fallback-to-scaffold path is not separately exercised by the existing
  `create-workspace` test suite (`preset.spec.ts` only asserts the file is
  written and contains the banner string); it was verified manually against
  a scratch tree that mimics a scaffolded workspace's shape instead. A
  future regression there would only surface as a wrong port list at
  workshop time, not as a failing test.
