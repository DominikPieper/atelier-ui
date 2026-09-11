---
status: accepted
date: 2026-09-09
sources:
  - tasks/review-plausibility-2026-09-08.md (finding C10 — the silence flagged, not yet an editorial decision)
  - tasks/schulung-content-review-2026-09-08.md (§ B1, § B5 — the teaching-surface consequences of the same gap)
  - tools/scripts/lib/allowlists.js (UNDISTRIBUTED_SKILLS — the repo-bound reasons this ADR cites, not restates)
  - tools/scripts/check-skill-discovery.mjs (the gate that already treats UNDISTRIBUTED_SKILLS as correct, not a defect)
  - docs/src/pages/agent-skills.astro
  - docs/src/pages/claude-design.astro
  - docs/src/pages/schulung.astro
  - schulung-2tage-agenda.md
  - skills/design-to-code/SKILL.md
  - skills/artboard-bridge/SKILL.md
---

# ADR-0117: The silence was not the decision

## Status

Accepted. `agent-skills.astro`, `claude-design.astro`, `schulung.astro` and
`schulung-2tage-agenda.md` now name `design-to-code` and `artboard-bridge`, say
plainly that both are repo-bound and undistributed, and give the reason — rather
than staying silent about them or, worse, telling the room their tooling does not
exist.

## Context

`design-to-code` and `artboard-bridge` shipped 2026-09-07/08 and are correctly
**not** mirrored to `docs/public/.well-known/agent-skills/`: both are named in
`UNDISTRIBUTED_SKILLS` (`tools/scripts/lib/allowlists.js`) with repo-bound
reasons — `design-to-code` names `libs/spec`, `parity:record`, `check:figma` and
the Atelier Figma file key; `artboard-bridge` names the two Atelier Claude Design
project ids, the artboard registry, the palette generator and carries ADR-0032's
organisation-specific governance — and `check:skill-discovery` exits 0 confirming
the allowlist is current. That non-distribution is a recorded, correct decision.
Nothing in this ADR revisits it.

What was never decided is what the _participant-facing_ material does with that
fact. `tasks/review-plausibility-2026-09-08.md`'s finding C10 named the gap without
closing it: _"the human-facing silence [...] is not a recorded decision."_ Two
things had already happened by the time that finding was written, and both are
worse than silence:

- `agent-skills.astro` named only the two pre-existing skills
  (`figma-workspace-architect`, `atelier-design`) and the Storybook MCP triad —
  the two new skills, and the third-party `uianatomy-mcp` skill this repo's own
  training demos on Day 2, appeared nowhere.
- `claude-design.astro:249` and `schulung.astro:101` went further than silence:
  each told the reader outright that step 5's tooling _does not exist_, at the
  same time `artboard-bridge` Publish existed, had run once, and had correctly
  refused to publish a `DRIFT` component (`tasks/schulung-content-review-2026-09-08.md`
  § B1). A reader trusting either page left with a false belief about the current
  state of the tooling, not merely an incomplete one.

The two failure modes are different and both had to be ruled out: understating
(silence, letting a stale absolute stand) and overstating (a card implying a
working `.well-known` URL for a skill deliberately kept off it, which 404s).

## Decision

**Name both repo-bound skills in participant-facing material, and say plainly
that they are undistributed and why — the allowlist's own reason, not a
paraphrase that could drift from it — rather than either staying silent or
implying a public URL.**

Concretely:

- `agent-skills.astro` gains cards for `design-to-code`, `artboard-bridge`, and
  `uianatomy-mcp`. The two repo-bound cards carry no `.well-known` link and say
  so in the card itself (`repo-bound, not distributed — <reason>`); a card that
  cannot be clicked through is acceptable precisely because it states why,
  rather than pretending a link exists. `uianatomy-mcp` links to its own
  external discovery URL (`uianatomy.dev`) — it is not one of this repo's
  skills and was never a candidate for this site's endpoint.
- **No new detail page** (`docs/src/pages/skills/design-to-code.astro`,
  `.../artboard-bridge.astro`) ships in this pass, deliberately deferred rather
  than declined. The two existing detail pages (`atelier-design.astro`,
  `figma-workspace-architect.astro`) carry build-time drift gates against their
  skill's `references/` directory (`docs/src/lib/skill-meta.ts`); matching that
  fidelity for two more skills is its own scoped piece of work, not a
  by-product of closing a silence gap. A card without a working link is the
  acceptable interim state named above — it is honest about what it links to,
  which is what this ADR requires, not that everything be clickable.
- The false absolutes this silence produced (`claude-design.astro:106-113,
188, 194, 249, 431`; `schulung.astro:101`) are corrected in the same pass, to
  what the skills' own eval record supports: `artboard-bridge` Publish has run
  once, against a scratch project, and correctly refused a `DRIFT` component;
  its write path is unexercised because every parity record in the repo is
  currently `DRIFT` (blocked repo-wide, not for one component); per-seat
  (non-owner) access is a separate, still-open question (ADR-0106).

## Consequences

- A reader of `/agent-skills`, `/claude-design`, or `/schulung` now gets an
  accurate roster: five skills exist, two are repo-bound and undistributed with
  a stated reason, and step 5's tooling is built and has run once, not
  nonexistent.
- The pattern generalises: a future repo-bound skill can be named in
  participant-facing material as soon as it ships, without waiting on a
  distribution decision — as long as its card states plainly that it is
  undistributed and cites the reason, the same way `UNDISTRIBUTED_SKILLS`
  requires a reason rather than a bare name.
- **Nothing here changes distribution.** `check:skill-discovery` still passes
  by _excluding_ these two skills from the endpoint comparison; a reader who
  follows a repo-bound card's `skills/<name>/SKILL.md` pointer needs the repo
  checked out, not a public URL. If that changes, this ADR's "no detail page
  yet" clause goes stale and needs a dated correction here, not a silent edit.
- The corrected absolutes on `claude-design.astro` and `schulung.astro` describe
  `artboard-bridge` Publish's state as of one eval run (2026-09-08, iteration
  2). Like the sync-defect table elsewhere on that page, this is a dated
  observation, not a claim this ADR re-verifies going forward — a later
  iteration's result (`tasks/todo.md`'s open "iteration 3" item) can move past
  what is written here without falsifying it.
