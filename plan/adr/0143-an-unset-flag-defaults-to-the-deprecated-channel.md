---
status: accepted
date: 2026-09-13
sources:
  - node_modules/@storybook/addon-mcp/dist/preset.js (10.6.0, read directly — `review.create` tool registration, `wrapEnabled`, `isReviewEnabledForRequest`, `STORYBOOK_MCP_PROXY_HEADER`)
  - node_modules/storybook/dist/core-server/presets/common-preset.js (10.6.0, read directly — `isReviewFeatureEnabled`, `isReviewExplicitlyEnabled`, the `features` preset's deliberate non-default for `experimentalReview`)
  - AGENTS.md, "Storybook MCP Workflows" (the pre-existing documented claim this ADR re-verifies and then acts on)
  - libs/{angular,react,vue}/.storybook/main.ts (pre-change: `features` blocks without `experimentalReview`)
---

# ADR-0143: An unset flag defaults to the deprecated channel

## Status

Accepted.

## Context

`AGENTS.md` already documented, from an earlier reading of the installed
`@storybook/addon-mcp@10.6.0`, that `review-create` (the MCP tool wired to the
addon's `review.create` method) is reachable by the deprecated `storybook ai`
CLI proxy channel by default, but not by a direct MCP client, unless
`features.experimentalReview` is set to `true` explicitly. This repo's own
workshop material tells participants to configure exactly a direct MCP client
(`claude mcp add --transport http storybook-local
http://localhost:<port>/mcp`), and none of the three libs' `main.ts` set the
flag — so, as shipped, the workshop's own recommended setup could never reach
`review-create`.

Re-reading the installed `10.6.0` dist directly (not trusting the earlier
claim on its word) confirms it, precisely:

- `storybook/dist/core-server/presets/common-preset.js` defines
  `isReviewFeatureEnabled = (features) => features?.experimentalReview !== false
&& !!features?.changeDetection` and `isReviewExplicitlyEnabled = (features) =>
!!features?.experimentalReview && !!features?.changeDetection`. Its `features`
  preset default comments that `experimentalReview` is "deliberately NOT
  defaulted" because it is tri-state: unset must stay distinguishable from an
  explicit `false`.
- The stories-toolset registration (`services` in the same file) passes
  `reviewEnabled: isReviewExplicitlyEnabled(features)` — the strict, explicit
  form — into `createStoriesToolset`, while the review service/toolset itself
  registers whenever `isReviewFeatureEnabled(features)` is true (`changeDetection`
  on and `experimentalReview` not explicitly `false`).
- `@storybook/addon-mcp/dist/preset.js`'s `review.create` tool definition is
  `available` whenever `availability.reviewEnabledForCli` is true (the loose
  form — true by default), but its `wrapEnabled` gate is
  `server.ctx.custom?.reviewEnabled ?? availability.reviewEnabled` — the
  **strict** form, `isReviewExplicitlyEnabled`. Per-request, `reviewEnabled` is
  computed as `gates.reviewEnabled || (gates.reviewEnabledForCli &&
request.headers.get('X-Storybook-MCP-Proxy') === 'true')` — so a request
  carrying the CLI proxy header passes on the loose gate alone, but a direct
  MCP client (no proxy header) passes only on the strict gate, which requires
  `experimentalReview: true` set explicitly.

`changeDetection` already defaults to `true` and none of this repo's three
`main.ts` overrides it, so it was never the blocking condition — the tri-state
`experimentalReview` was.

The claim holds, unchanged from what `AGENTS.md` already said. This ADR is the
record of re-verifying it against the currently installed dist rather than
carrying it forward on the strength of the earlier reading, and then acting on
it.

## Decision

Set `features.experimentalReview: true` explicitly in
`libs/{angular,react,vue}/.storybook/main.ts` and in the `create-workspace`
scaffold's three `main.ts.template`s (`storybook/{angular,react,vue}/`),
each already carrying its own `features` block. Update `AGENTS.md`'s
sentence describing the gate so it states the current fact (a direct MCP
client now reaches `review-create` too) rather than only the old caveat.

Rejected: leaving the flag unset and relying on the CLI-proxy-channel default.
That default exists for `storybook ai`, which `AGENTS.md` already records as
deprecated in `10.6.0` in favour of `npx storybook skills setup` — relying on
it would mean depending on a channel this repo does not use and that
Storybook itself is moving away from, while the channel this repo's workshop
material actually configures (a direct `.mcp.json` / `claude mcp add` entry)
stayed locked out. Also rejected: proxying every MCP request through a local
`storybook ai`-compatible shim purely to pick up the CLI-channel default —
strictly more moving parts than setting one boolean, for a channel already on
its way out.

## Consequences

- `review-create` is now reachable by any direct MCP client connecting to
  `http://localhost:<port>/mcp` (angular 4400 / react 4401 / vue 4402 in this
  repo; whatever port a scaffolded workshop's Storybook binds), matching what
  the workshop material already tells participants to configure — not only
  the deprecated CLI-proxy channel.
- No other toolset gating changes: `changeDetection` was already on and
  remains the co-requirement for the review toolset to register at all;
  `docs`, `dev`, and `test` toolset availability are untouched.
- `nx lint` and `nx build create-workspace` (+ a dist check) were re-run,
  since both the repo's own `main.ts` files and the scaffold's templates
  changed.
