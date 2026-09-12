---
status: accepted
date: 2026-09-12
sources:
  - .github/workflows/publish.yml (the three steps, and the mode this record adds)
  - run 34702586156, 2026-09-12 — five packages published at 0.2.43, verify failed after 3 attempts, push discarded
  - run 34023488530, 2026-09-06 — the earlier read-after-write lag that motivated the retry loop
  - plan/adr/0102-publish-before-push.md (the invariant this record keeps)
  - tools/scripts/check-release-drift.mjs (its [SKIP]-vs-[DRIFT] distinction, which the loop must not blur)
  - nx 23.2.0 source, read 2026-09-12 — `releasePublishCLIHandler`'s exit-code aggregation, and `--skip-publish`'s mutual exclusivity with `--yes`
---

# ADR-0133: The read-back is detection, except for the mode that has nothing else

## Status

Accepted 2026-09-12, after a successful release was thrown away by its own verification.

## Context

ADR-0102 established that origin may not advance past what npm is confirmed to have, after
six releases in a row left git ahead of the registry: `nx release` pushed _itself_, between
tagging and publishing, so a publish that failed on a token error still moved git. The fix
removed that push and made it a separate step, gated on a read-back of the registry.

Today produced the mirror case. `nx release --yes` published all five packages at 0.2.43.
The verify step then queried npm three times, 15 seconds apart, got the pre-publish version
each time, and failed the job — so the push never ran, and the `chore(release): publish`
commit and the `v0.2.43` tag existed only on the runner. **npm ended a version ahead of
git**, with nothing in the repo recording that 0.2.43 shipped. npm served 0.2.43 correctly
minutes later: read-after-write lag that outlasted a 30-second budget, not a failed publish.

Recovery was a hand reconstruction — `nx release --skip-publish` locally, then pushing the
commit and tags. It worked, and it is not a procedure anyone should have to rediscover from
a red build.

**The obvious fix was to stop gating the push on the read-back**, and it was wrong for a
reason worth recording. `nx release`'s exit code aggregates each project's
`nx-release-publish` task, whose code is `npm publish`'s own result against the registry's
**write** path; `check-release-drift.mjs` queries `npm view`, a **read replica**, which is
the eventually-consistent path both incidents came from. For a mode that actually publishes,
the exit code is therefore the _stronger_ signal, and gating on a lagging second query adds
a proven false-failure mode while closing no gap.

But the push step is shared across modes, and the recovery mode added here never publishes
at all. Its exit code says nothing about npm. For that mode the read-back is the only
confirmation that exists.

## Decision

**Keep the gate. Widen the budget to match observed lag, and make the mirror case a button.**

1. **The retry budget goes from 3 attempts 15s apart (~30s) to 6 attempts with exponential
   backoff — 20s, 40s, 80s, 160s, 300s, capped — about 600s of waiting.** Sized from the two
   incidents' own evidence: the first was "seconds… moments", today's was minutes. Twenty
   times the old budget, against a failure mode whose only symptom is being too impatient.
2. **A third `workflow_dispatch` mode, `recover-git`**, runs `npx nx release --skip-publish`:
   version, changelog, commit, tag, push — no publish. It is the mirror-case recovery, and it
   reaches the existing push gate unchanged.
3. **The step order does not change**, and the reason is the recovery mode, not the history.
   Reordering would be safe for `release` and `publish-only`, where the exit code already
   carries the invariant. It would not be safe for `recover-git`: that mode recomputes its
   version from conventional commits, so if new commits landed on `main` between the failed
   run and the recovery, it would produce a version npm never had — and pushing that tag on
   an exit code alone is exactly the defect ADR-0102 exists to prevent, self-inflicted. Making
   the order conditional on the mode buys little once the budget matches reality, and costs a
   second push step to keep correct.
4. **The `[SKIP]`-versus-`[DRIFT]` distinction stays intact.** A registry hiccup on a later
   attempt must never rescue a real drift finding from an earlier one — a blind spot the loop
   closed deliberately when it was first written, and one easy to reopen while rewriting it.

Alternatives considered:

- **Push immediately after a successful publish, verify afterwards.** Rejected per 3 — right
  for two of three modes, wrong for the one added here, and the push step is shared.
- **Retry longer still, or until success.** Rejected: a genuinely broken publish would then
  sit for many minutes before failing, and the point of the step is to notice.
- **Leave it and document the manual recovery.** Rejected — that is what today cost, and a
  procedure reconstructed under time pressure is where mistakes like flattening an independent
  release group's versions get made.

## Consequences

- **The common case is now covered and the rare one is a button.** If lag ever exceeds ten
  minutes the job still fails and still discards the commit — the same shape, rarer, and now
  with a named recovery instead of an improvised one. This is a probabilistic mitigation, not
  a structural one, and that is worth saying plainly.
- **`recover-git` carries a precondition it does not enforce**: confirm with
  `npm view <pkg> version` that npm already has the version it would produce. If commits
  landed in between, the verify gate catches it — the job fails and nothing is pushed — so the
  failure mode is a wasted run, not a bad tag.
- **Verified as of this record:** the YAML parses and the step graph is unchanged apart from
  the new mode; the retry loop proven against a stub across five scenarios — drift then sync,
  drift throughout, drift then an unreachable registry (which must not rescue it), unreachable
  from the first attempt, and the shipped 20s/40s numbers actually executing at 60s of real
  wall time; the three modes routing to the correct `nx` invocation against a fake `npx`;
  `check:format` clean. **Assumed:** that a client-side `npm publish` timeout cannot report
  failure after the server committed the write — reasoned from HTTP semantics, not verified in
  the executor's source. That assumption is what makes "the exit code is the stronger signal"
  an inference rather than a settled fact, and it is the sentence to revisit if a publish ever
  fails in a way the registry disagrees with.
