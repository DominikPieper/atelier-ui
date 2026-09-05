---
status: accepted
date: 2026-09-05
sources:
  - tools/scripts/preflight.mjs (the file that changed)
  - libs/create-workspace/src/generators/preset/files/tools/scripts/preflight.mjs (its byte-identical copy)
  - tools/scripts/sync-preflight.mjs (the gate that actually enforces the byte-identity, added by this ADR)
  - tools/scripts/check-sync.js (checks Angular/React/Vue component drift only — does not touch the preset's files/ tree; an earlier draft of this decision wrongly credited it with enforcing the identity above)
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (why two environments exist at all)
---

# ADR-0090: One preflight, branched inside, not forked outside

## Status

Accepted. `preflight.mjs` detects which of the two environments from
ADR-0084 it is running in and checks that environment's ports from inside
the single shared file. The two copies of the file are kept byte-identical
by a dedicated gate, `tools/scripts/sync-preflight.mjs --check`
(`npm run check:preflight`). Recorded at decision time.

## Context

`preflight.mjs` hardcoded the scaffold's ports (`4200`, `6006`) in its port
check. Run inside the cloned atelier monorepo — which ADR-0084 makes
canonical for the two-day cohort — those ports are wrong: the clone's docs
app serves on `4300`, and each framework's Storybook serves on its own port
(`4400` Angular, `4401` React, `4402` Vue; see `libs/{angular,react,vue}
/project.json` and `docs/project.json:21`). A cohort participant running
`npm run preflight` got a check for ports nothing in their environment uses,
and no signal for the ports that mattered.

The file exists in exactly two places that must stay byte-identical:
`tools/scripts/preflight.mjs` (the canonical copy) and
`libs/create-workspace/src/generators/preset/files/tools/scripts/preflight.mjs`
(the copy `create-workspace` writes into every scaffolded workspace,
unmodified — see `preset.ts`'s `readTemplate('tools/scripts/preflight.mjs')`).
Both copies land at the same relative path (`tools/scripts/preflight.mjs`),
two directories below the workspace root, in whichever tree they end up in.

**Correction to the record:** the branch that introduced environment
detection was written believing `npm run check:sync` already enforced this
identity. It does not — `check-sync.js` compares Angular/React/Vue component
directories and story presence and never looks under
`libs/create-workspace/`, and `preset.spec.ts` only asserts the scaffolded
copy exists and contains a title substring. Nothing was enforcing the
identity this whole decision depends on. An independent review caught it;
this revision of the ADR both states that plainly and closes the gap (see
Decision).

## Decision

Detect the environment at runtime, inside the one shared file, and branch
the port list on the result — rather than letting the two copies diverge
into environment-specific variants — and add a real gate that keeps them
identical, since none existed.

**Discriminator.** `isDir(ROOT/libs/spec) && isDir(ROOT/plan/adr)`. Both are
directories that exist only in the source monorepo — `create-workspace`'s
preset generator provably never writes either one into a scaffolded
workspace (it writes a `workshop-<fw>` app instead — see ADR-0084's
context) — checked with `statSync(...).isDirectory()`, not bare
`existsSync`, so a same-named regular file cannot masquerade as the
directory. Requiring both directories, rather than either alone, is
deliberate: a single directory name is something a team could plausibly
recreate inside a scaffold they extend (most plausibly `libs/spec`, if they
copy Atelier's own package-per-framework-plus-shared-contract shape), and a
false "clone" verdict then goes silent — `checkPorts` skips 4200/6006
entirely and reports an all-clear on ports it never looked at. Two
thematically-linked, distinctively-named directories are a much smaller
false-positive target, at the cost of one extra `statSync` call — still two
stats, not workspace introspection. This shrinks the risk, it does not
eliminate it: a tree that genuinely has both directories for unrelated
reasons is indistinguishable from a real clone without deeper introspection
than this check is willing to pay for. That residual case gets no separate
"ambiguous" warning branch — a message with no actionable next step is not
worth the extra state — and the mitigation is the reported `Environment`
line itself (see below), which lets a misdetected participant notice and
say so. Falling back to `scaffold` when neither directory, or only one, is
present matches the pre-existing behavior: the generated workspace is the
copy that ships to strangers, so an undetectable or partial-match tree
should behave exactly as it did before this change.

The detected environment is printed as its own report line ("atelier
monorepo clone" / "scaffolded workspace") ahead of the port checks, so a
participant who is not in the environment they expected sees it immediately
rather than having to infer it from which ports were checked. The one other
environment-specific piece of advice in the file — the "MCP endpoints: none
configured" fix suggestion, previously a hardcoded "scaffold a workspace
with `npx create-atelier-ui-workspace`" that made no sense for a clone with
a broken or missing `.mcp.json` — now branches on the same detected
environment. A grep of every other `warn`/`fail` advice string in the file
turned up nothing else environment-specific: the Node/npm/git/Claude CLI
and Figma-bridge advice is identical regardless of which tree the script
runs in.

**The gate.** `tools/scripts/sync-preflight.mjs` compares the two files'
content directly (`--check` fails non-zero and names both paths plus the
fix command; a bare invocation overwrites the preset copy with the
canonical one). Wired in as `npm run check:preflight`, folded into
`check:all` next to `check:sync`. It is its own script rather than logic
added to `check-sync.js`, because `check-sync.js`'s contract — and its
`[DRIFT]`/`[NO-STORY]` tags — is specifically the three framework
libraries; a two-file byte-identity check is a different shape of problem
and belongs with the `sync-*.mjs --check` family (`sync-spec.mjs`,
`sync-tokens.mjs`) that already owns exactly this shape: one canonical
source, one generated copy, `--check` to gate CI, a bare run to fix drift.

**Rejected alternative: let the two copies diverge.** Hardcode the clone's
ports into the canonical copy and leave the scaffold's copy as-is. The two
files are supposed to be one artifact with two delivery locations, not two
artifacts that happen to start alike — and now that there is a real gate
saying so, divergence trades a one-time branch for a permanent maintenance
seam that the gate would immediately flag. Branching on a runtime signal
inside the single file keeps the "one artifact" invariant intact and costs
two `statSync` calls.

## Consequences

- `preflight.mjs` now reports the ports that are actually relevant to the
  tree it is running in, in both environments, instead of a fixed pair
  tuned for only one of them, and its one environment-specific advice
  string (missing `.mcp.json`) gives the right fix in both trees.
- The two file copies are verified byte-identical by a real gate for the
  first time — `npm run check:preflight` — closing a gap this ADR
  originally, and wrongly, claimed was already closed by `check:sync`.
  `check:sync` itself is untouched and still means what it always meant
  (Angular/React/Vue component drift).
- The environment line is new, permanent output — a participant training
  material or troubleshooting doc that quotes preflight's exact console
  output verbatim will need a one-line update, but none currently does.
- The fallback-to-scaffold path, and the compound-discriminator path, are
  not exercised by the existing `create-workspace` test suite
  (`preset.spec.ts` only asserts the file is written and contains the
  banner string); both were verified manually against scratch trees that
  mimic a scaffolded workspace's and a clone's shape instead. A future
  regression there would only surface as a wrong port list at workshop
  time, not as a failing test.
- The residual misdetection case (a scaffold independently extended with
  both a `libs/spec/` and a `plan/adr/` directory) has no dedicated
  handling beyond the reported `Environment` line. If that turns out to
  matter in practice, the next step is a stronger signal, not a warning
  branch — this ADR did not find one available at the same cost.
