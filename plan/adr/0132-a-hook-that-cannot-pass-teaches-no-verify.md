---
status: accepted
date: 2026-09-12
sources:
  - tools/git-hooks/pre-push and tools/scripts/install-hooks.sh (the hook, and how it reaches .git/hooks)
  - a `GIT_SSH_COMMAND="ssh -v" git push` trace, 2026-09-12 — 5,404 bytes sent in 360.7s, then "Connection to github.com closed by remote host", exit 141
  - .github/workflows/ci.yml and publish.yml (both already run `npm run check:all`)
  - plan/adr/0082-a-blocker-the-chain-cannot-clear.md (a check whose remedy path the runner cannot reach)
  - measured 2026-09-12: the new hook at 4.4s, `check:paint` alone at 366s in the same session
---

# ADR-0132: A hook that cannot pass teaches `--no-verify`

## Status

Accepted 2026-09-12, after a push of 25 commits failed twice and landed only with
`--no-verify`.

## Context

The `pre-push` hook did two things: regenerate the derived artifacts and abort if they
drifted, then run `npm run check:all` — the whole gate chain — and abort if it failed. The
second half made every push fail.

**The mechanism is a property of git and the socket, not of the chain's length.** Git opens
the SSH connection and sends `git-receive-pack` to the remote _before_ it runs `pre-push`,
and transfers the pack only once the hook exits. Everything the hook does therefore happens
while that connection sits idle, and GitHub closes an idle connection at roughly 360
seconds. The trace is unambiguous: 5,404 bytes sent, 14,056 received, **360.7 seconds**,
then `Connection to github.com closed by remote host` and exit 141 — SIGPIPE, with the pack
never sent. `check:paint` alone measured 366s the same afternoon, and the chain also builds
three Storybooks, so it cannot fit in the budget under any circumstances.

**What the failure actually costs is the other half.** `--no-verify` is not selective: it
skips the whole hook, including the cheap regeneration guard that takes seconds and exists
for a specific recurring failure — a `chore(release)` version bump rebased in, leaving
`llms.txt` and the spec mirrors stale until a CI run notices. A hook that always fails does
not merely fail to check; it trains the bypass that turns off the check that worked.

And the expensive half was never load-bearing: `check:all` already runs in CI, in both
`ci.yml` and `publish.yml`. The hook bought earliness, not correctness.

## Decision

**The hook keeps the regeneration and drift guard. `check:all` is removed outright, with no
opt-in flag.**

1. **No env-var opt-in**, and the reason is the interesting part: the 360-second limit is a
   fact about an idle socket, not about consent. A flag would not make the slow path safe to
   enable — it would make it _optional to guarantee the same failure_, while looking like a
   capability. A switch that cannot work when flipped is worse than no switch.
2. **The hook says what it does not do**, in its own pass message and in its header, and
   points at `npm run check:all` for anyone who wants the earlier signal. That is a checklist
   item, not a gate, and this record says so plainly rather than dressing it up.
3. **CI is now the first line for the chain**, which is what it was already doing on every
   push and every publish.

Alternatives considered:

- **Keep `check:all` behind `ATELIER_PREPUSH_FULL=1`.** Rejected per 1.
- **Run a fast subset in the hook.** Rejected on measurement rather than taste: nothing in
  the chain is both quick and self-contained — `check:paint` needs a built Storybook per
  framework and alone exceeds the entire budget. A partial re-check moments before CI runs
  the full one is the ADR-0082 shape: a local blocker whose remedy the runner cannot reach.
- **Move the chain to a `prepare-push` script the developer runs.** Not rejected so much as
  what already exists — `npm run check:all` is that script, and the hook now names it.

## Consequences

- **A push works again**, and the guard that survives is the one that was catching a real
  recurring defect. The new hook measures **4.4 seconds**.
- **The loss is real and is not a gate any more.** Nothing now distinguishes "ran `check:all`
  and it passed" from "never ran it"; the only enforcement is CI, which costs a push-and-wait
  cycle instead of local feedback. That is a weaker compensating control, named here so it is
  not mistaken for a free win.
- **The bypass instruction in the hook now means something narrower.** `--no-verify` used to
  read as "skip the slow check"; it now reads as "skip the drift guard", which is the thing
  nobody should routinely skip. The header says so.
- **The session that found this pushed with `--no-verify` first and verified afterwards**:
  `sync:generated` produced no drift, and the full chain had been run green in three parts
  beforehand (the chain had to be split because running all 43 gates at once was killed for
  memory pressure). Nothing was lost, but that was luck plus a habit, not a control.
- **Verified as of this record:** the SSH trace above; the new hook at 4.4s, timed twice;
  the drift guard still aborting and naming the file, then passing once restored; the
  installed `.git/hooks/pre-push` byte-identical to the source after reinstall, which the
  hook's own staleness self-check requires; and a real push exercising the hook end to end.
  **Assumed:** that GitHub's idle-connection limit is stable at ~360s — one observation,
  twice, on one day.
