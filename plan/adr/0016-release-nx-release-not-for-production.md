---
status: accepted
confidence: reconstructed
date: reconstructed
sources:
  - "this session, publish.yml"
---

# ADR-0016: Release: nx release, 0.0.x not-for-production, automation-token publish + publish-only recovery

## Status

Accepted. Confidence: **reconstructed** (inferred from commits/code/session).

## Context

The library needs a versioning/publish pipeline. `nx release --yes` skips publish when there's no version bump, so a tag left unpublished by a failed run has no automatic path to recovery; CI publishing also has to work without interactive OTP.

## Decision

nx release for versioning/publish; packages are 0.0.x ("not for production"); CI publish requires an npm Automation token; a workflow_dispatch publish-only mode republishes a tagged-but-unpublished version. Why: nx release --yes skips publish without a bump, so a tag left unpublished by a failed run needs an explicit path; classic Publish tokens still demand OTP in CI.

## Consequences

- Versions stay at 0.0.x to signal "not for production". *(Revised by [ADR-0023](0023-version-band-0-1-x.md): the band moved to `0.1.x`; the not-for-production signal is now carried by being pre-1.0, not by the second zero.)*
- CI uses an npm Automation token because classic Publish tokens require OTP in CI.
- A workflow_dispatch publish-only mode recovers a tagged-but-unpublished version after a failed run.
- **Corrected 2026-09-06** — "nx release for versioning/publish" understated what that single invocation did: `nx release --yes` also pushed the version-bump commit and tag to `origin`, *before* publishing, because Nx's own git-push step is gated on `changelog.workspaceChangelog.createRelease`, not on any git-push setting a workflow could turn off — a publish failure therefore left git ahead of npm by construction. **ADR-0102** turns `createRelease` off (it had been dead since 2026-04-25 regardless) and moves the push into `publish.yml` itself, as an explicit step that runs only after publish and its post-publish registry check both succeed.
