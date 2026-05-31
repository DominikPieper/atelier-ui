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

- Versions stay at 0.0.x to signal "not for production".
- CI uses an npm Automation token because classic Publish tokens require OTP in CI.
- A workflow_dispatch publish-only mode recovers a tagged-but-unpublished version after a failed run.
