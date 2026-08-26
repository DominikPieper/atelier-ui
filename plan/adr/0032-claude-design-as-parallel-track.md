---
status: accepted
date: 2026-08-26
sources:
  - tasks/review-state-2026-08-26.md (state review — Claude Design section)
  - https://www.anthropic.com/news/claude-design-anthropic-labs (2026-04-17)
  - https://code.claude.com/docs/en/whats-new/2026-w34 (research preview, 2026-08-17)
  - https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans (2026-07-23)
---

# Claude Design as a parallel track, not a replacement for Figma

## Status

Accepted.

## Context

Anthropic ships two different things under the name `/design`, and conflating
them is the first mistake to avoid:

- **The bundled `design` canvas skill in Claude Code.** Not a native canvas: a
  precompiled React editor (`payload.template.html`, ~2.4 MB) that Claude
  copies, seeds with `.dc.html` artboards plus a `canvas.json` manifest, and
  publishes as an ordinary Artifact. In Claude Code the page *is* the
  document — one state block holds every artboard, the manifest, and every
  image; Save is a whole-document compare-and-set publish. Editing requires
  the skill enabled, the artifact-publish capability in that user's roster,
  and runtime write access plus viewer consent; any miss degrades to a
  view-and-export page.
- **`/design-sync`.** The reverse direction: pushes the repo's real component
  library into a claude.ai/design design-system project. **React only** —
  discovery is ts-morph over `.tsx`/`.jsx`.

Atelier's loop is Figma → spec → code → verify (`CLAUDE.md` § Design-to-Code
Workflow). Every gate in `check:all` is keyed on one of exactly four
identities: a Figma `COMPONENT_SET` name and its variant axes, a
`libs/spec` string-literal union, a `--ui-*` token, or a Figma node id. A
Claude Design artboard has **none of the four**.

The public record is also thin, and that matters for a teaching repo. Verified
present: one announcement (2026-04-17), a product page, three Help Center
articles, one designer blog post, and exactly one Claude Code page — the Week
34 digest, tagged *research preview*. Verified absent: no `/design` entry in
any Claude Code CHANGELOG (5,894 lines searched), no row in the commands
reference (which documents `/design-sync` and `/design-login` but not
`/design`), and **no first-party spec for the `.dc.html` format anywhere**.
Third-party write-ups contradict each other on whether Figma import/export
exists.

At the same time, the workshop has a real problem this tool addresses: Tag 2
Block 1 asks a Figma-naive room for 90 minutes of hands-on Figma. A developer
can produce four credible visual directions in a canvas in ten minutes
without knowing Figma at all.

## Decision

Claude Design enters the workshop as a **parallel track occupying step 0 and
step 5** — divergence before *Inspect*, and handoff after *Verify* — plus one
trainer-led `/design-sync` demo showing the reverse direction. It never
touches steps 1–4. Figma remains the single source of truth, because it is
the only surface the gates can address.

**Teach the fence itself as content.** The lesson is "the source of truth is
the thing a gate can check", and Claude Design is the counter-example that
makes it concrete rather than a slogan.

Documentation placement: a new Explanation-category chapter `/claude-design`,
beside `/design-principles` — and deliberately **not** an eighth step in
`docs/src/data/workshop-track.ts`. Adding it to the numbered spine would
itself assert it is part of the loop, which is the exact misread this ADR
exists to prevent (same framing correction as ADR-0014).

Alternatives considered:

- **Replace Figma with Claude Design** — rejected: it deletes the gate stack.
  ADR-0019's variant-matrix-completeness blocker and token-link-coverage
  critical read `tools/figma/snapshot.json`; ADR-0024's parity record stores a
  Figma node id and a score. An artboard has no node id, no variables, no
  component sets, no modes. ADR-0018's three-tier collections have zero
  counterpart, and the canvas editor's own limits text says design-system
  colour tokens are unavailable in it.
- **Post-code presentation surface only** — rejected as too small. It forfeits
  the one thing the canvas beats Figma at for this audience, and leaves the
  agenda's highest-risk block untouched.
- **Pre-Figma ideation only** — rejected as incomplete. It drops the cheap win
  at the far end (one shareable link that needs no Figma account and no
  running Storybook) and leaves `/design-sync`, which genuinely belongs after
  the code exists, unplaced.
- **A full second track with its own gate** — rejected *for now*: there is
  nothing legitimate to gate. The design skill's own contract instructs
  literal inline style values, and prefers inline `style="…"` over classes
  because that is what the properties panel edits. A `check:artboards` that
  grepped participant `.dc.html` for raw hex would be gating against the
  tool's documented behaviour. The one deterministic projection available is
  generating an artboard `:root{--ui-*}` starter block **from**
  `libs/create-workspace/src/generators/preset/files/styles/tokens.css`, the
  token source of truth per `tools/scripts/sync-tokens.mjs`.

## Consequences

- **Two design surfaces across two days is real cognitive load**, and the
  canvas dead-ends: no Figma import, no Figma export, `/design import|export|
  status` refused in the Claude Code preview, the editor frozen at publish
  time, and saving conditional on a capability in the viewer's roster. We
  accept that to buy a Figma-free on-ramp and one honest lesson about gated
  truth.
- **Not workshop-ready as of this date.** Three blockers, all tracked in
  `tasks/review-state-2026-08-26.md`: per-seat save availability is
  unverified and cannot be guaranteed across a room; the `--ui-*` artboard
  starter kit does not exist, without which the token katas teach "Claude
  invents colours" instead of "the canvas cannot hold a token architecture";
  and the katas' timeboxes collide in Tag 2 Block 1 and need reconciling
  before they reach the agenda. Until save is confirmed on at least two
  accounts that are not the author's, **no exercise may use "you edited it in
  the canvas" as a done-condition** — the five katas are written so their
  done-conditions survive a read-only canvas.
- **`/design-sync` is React-only**, so for an Angular or Vue cohort it is a
  trainer-machine demo or it is cut. Per ADR-0014 each cohort runs one
  framework; this track must not silently re-import the three-framework
  problem that ADR-0014 closed.
- **Governance is a precondition, not a footnote.** `/design-sync` uploads
  component source and rendered previews. Anthropic's own admin guide states
  uploaded assets are stored persistently under enterprise retention, with no
  data-residency support, and Claude Design is default-off on Enterprise.
  Rehearsing on Atelier's own OSS library is the safe case. Any scenario in
  which a participant pushes their **employer's** design system is a
  data-processing decision that goes to the DSB first, and org enablement to
  the ISB, before it appears on an agenda a client sees.
- **Teach the concepts, never the keystrokes.** `/design` appears in no
  CHANGELOG and in no commands reference, there is no first-party spec for
  `.dc.html`, and the skill's own text says the preview is not at parity with
  claude.ai/design. A Claude Code bump can move all of it; anything written
  against a flag set or a key sequence will rot.
- A companion decision is still unrecorded and should follow: `check:figma`
  and `check:parity` were promoted into `check:all` while ADR-0019 §5 and
  ADR-0024 §4 still read as "standalone". Recording it turns "a
  Claude-Design-first component can never pass `check:parity`" from a manual
  observation into a hard CI fact — which is what makes this ADR's fence real
  rather than rhetorical.
