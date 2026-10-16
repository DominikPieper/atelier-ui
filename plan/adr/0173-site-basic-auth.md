---
status: accepted
date: 2026-10-16
sources:
  - worker/index.ts
  - worker/basic-auth.ts
  - worker/basic-auth.spec.ts
  - wrangler.jsonc
---

# ADR-0173: The site sits behind one shared Basic Auth password; the MCP endpoints stay public

## Status

Accepted. Recorded at decision time.

## Context

`atelier.pieper.io` (docs app plus the three hosted Storybooks) was publicly reachable. The owner
wants it reachable only by people who hold a password, e.g. one cohort of workshop participants.
The site is served by a Cloudflare Worker deployed with `run_worker_first: true`, so every request
already passes through `worker/index.ts`. The same worker also serves the hosted Storybook MCP
endpoints `/storybook-{react,angular,vue}/mcp`, which `.mcp.json` and participant agent setups
call without any credentials.

## Decision

- HTTP Basic Auth inside the worker (`worker/basic-auth.ts`), checked against the Wrangler secret
  `SITE_PASSWORD`. The username is ignored; one password is shared.
- The check runs **after** the MCP route, so the MCP endpoints stay public. The MCP handler reads
  manifests through the `ASSETS` binding, not over HTTP, so the gate does not touch it.
- **Fail closed:** with the secret unset or empty the worker answers 503, never the site.
- Constant-time comparison: both sides are SHA-256 hashed, then compared with an XOR loop.

Alternatives rejected:

- **Cloudflare Access** (per-person e-mail OTP/SSO): stronger and revocable per person, but it
  lives in the dashboard rather than the repo and needs every participant's address up front.
- **Custom login page plus signed cookie**: nicer UX, but more code and session handling for no
  extra protection.
- **Gating the MCP endpoints too**: MCP clients would need an `Authorization` header in
  `.mcp.json`, the docs and the `create-workspace` templates. Rejected for now, at the cost that
  component docs remain publicly readable through MCP.

## Consequences

- Deploy order matters: set `npx wrangler secret put SITE_PASSWORD` before the worker that
  contains this check goes live, or the site answers 503 until you do.
- Local `wrangler dev` needs `SITE_PASSWORD` in the gitignored `.dev.vars`.
- Rotating the password means setting the secret again. Browsers cache Basic credentials for the
  session, so an old password stays usable in an open browser until it restarts.
- No per-user revocation and no rate limiting. Brute-force resistance rests on password strength
  and on Cloudflare-side rules.
- Worker tests run through `npm run test:worker`, which is outside `check:all` and CI.
