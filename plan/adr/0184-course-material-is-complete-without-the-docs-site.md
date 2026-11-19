---
status: accepted
date: 2026-11-19
sources:
  - owner, 2026-11-19 (this session): the docs site is password-protected and participants cannot open it; slides must carry every needed fact; go for the package below
  - read-only audit of decks, handouts, seat files and course plan docs, 2026-11-19 (this session)
  - curl 2026-11-19 — atelier.pieper.io/briefs answers 401 without login; atelier.pieper.io/storybook-react/mcp answers 200
---

# ADR-0184: Course material is complete without the docs site

## Status

Accepted. Owner go 2026-11-19, before the rehearsal of 2026-11-23.

## Context

The course was built on the assumption that participants have the docs site open: slides and speaker
notes say "im Brief", "im Kursmaterial", "aus dem Tutorial"; the plan docs give every block a `pages:`
line; the golden-prompt sheet says "point participants at the page"; the seat's `CLAUDE.md`, `README` and
`preflight` output link pages of `atelier.pieper.io`. The site is behind a password and participants
cannot open it. An audit found the content a participant needs that exists only there: the Day 1 Block 05
brief with its start, checks and receipts prompts; the parity prompt; the Day 2 generation and
accessibility prompts; the four component briefs a participant chooses from on Day 1 evening; a filled
handoff document; the rescue steps for a red seat; the ladder card promised as a take-home. The hosted
Storybook MCP endpoints are not behind the password and are not affected.

## Decision

1. **Participant material names no docs-site page.** No URL and no `/route` on slide visible text,
   handouts, the customer agenda or files the scaffold puts on the seat. Speaker notes may name a page
   as the trainer's source.
2. **What must be pasted lives on the seat.** The scaffold writes a `course/` folder into the workspace:
   the Day 1 Block 05 brief and its prompts, the parity prompt, the Day 2 generation and accessibility
   prompts with the four things to paste back when stuck, the four component briefs, a filled handoff
   document and the rescue steps. A projector cannot be copied from and paper cannot be pasted; a file
   in the workspace can, and the agent can read it too.
3. **What is read once lives on the slide; what is kept lives on paper.** Short facts move onto the
   slides (the four things to paste back on the self-healing slide). The ladder card and the rescue steps
   join the printed handouts.
4. **Seat files say it inline.** Links to the docs site in the generated `CLAUDE.md`, `README` and the
   `preflight` messages are replaced by the steps themselves or by a pointer into `course/`.

## Consequences

- Ships only through a `@atelier-ui/create-workspace` release and reprovisioning, which the rehearsal
  needs anyway (ADR-0183).
- The golden-prompt sheet stays the trainer's rescue sheet; the prompts participants paste now have a
  second home in `course/`. The two can drift; the sheet names the seat file it mirrors.
- The docs site stays the trainer's and the repo's reference. Its pages are no longer on the participant
  path.
- The optional kata (`/first-component`) leaves participant material instead of being shipped.
- Rejected: giving participants the site password (the owner ruled the site out for participants);
  printing prompts (paper cannot be pasted); putting the long prompts on slides (a projector cannot be
  copied from).
