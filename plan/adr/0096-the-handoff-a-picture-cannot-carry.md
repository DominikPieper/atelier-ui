---
status: accepted
date: 2026-09-05
sources:
  - docs/src/pages/schulung.astro (Tag 2, Block 01 → Block 02 — the joint this ADR fills)
  - workshop/briefs/toast.md (timer pause/resume, Escape, live-region politeness — none of it visible in a component set)
  - workshop/briefs/README.md (the shared brief: structural variants vs. interaction states)
  - tasks/schulung-review-2026-09-05.md (the review that found the joint; M1)
  - skills/figma-workspace-architect/references/code-sync.md (the `codeSpec` input — fields not supplied are not compared)
  - plan/adr/0032-claude-design-as-parallel-track.md (the other handoff, step 5, and why it stays unbuilt)
  - plan/adr/0024-design-parity-persistence-gate.md (parity scores move when the declared fields move)
---

# ADR-0096: The handoff a picture cannot carry

## Status

Accepted. Day 2 of the two-day training now ends its Figma block with a written
handoff document, and the prompt block that follows is written *from* that
document rather than from the canvas.

## Context

The training's Day 2 runs Figma → spec → code in one sitting. Block 01 ends with
a component set in the participant's own draft; Block 02 opened with "API in
Worten beschreiben". Nothing sat between them.

That gap is invisible while the trainer is in the room and expensive afterwards.
Three things a component set does not carry, all of them named in the briefs the
participants are handed:

- **Behaviour.** `workshop/briefs/toast.md` requires the dismiss timer to pause
  on hover and resume on leave, Escape to close, and a specific live-region
  politeness. A variant matrix shows none of it.
- **Scope.** Which variants and states are in, which are deliberately out, and
  whether this is a new component or a composition of existing ones. A picture
  of four frames does not say which of them were a decision.
- **Provenance.** Which draft, which node id. Without it the closing
  `figma_check_design_parity` has nothing stable to compare against, and
  ADR-0024 already records what happens when the sampled node moves: the score
  changes on unchanged code.

A participant who prompts from the canvas alone tends to reproduce appearance
and leave behaviour implicit. The agent cannot ask for what it was never told
was missing, and the verification step at the end of the day cannot catch it
either — `skills/figma-workspace-architect/references/code-sync.md` documents
that a `codeSpec` compares only the fields it is given, so a thin handoff
produces a thin comparison that comes back clean.

This is the same shaped hole as the *other* handoff in this material. ADR-0032
places Claude Design at step 0 and step 5, and step 5 — the shareable canvas
that shows a finished component to someone with no Figma account — is specified
and unbuilt, blocked on per-seat access. The training was asserting both
handoffs and practising neither.

## Decision

**A written handoff document is the deliverable that closes Day 2 Block 01, and
Block 02's prompt is written from it.**

It is a checklist, not a template: draft URL and node id, chosen variants and
states, token bindings, the reuse-vs-new decision, the behaviour taken from the
brief, explicit exclusions, target files, acceptance checks.

Deliberately *not* chosen:

- **A machine-readable format.** Tempting, and wrong here. The value is that the
  participant has to decide what is in scope and write the behaviour down in
  their own words; a schema would let them fill fields without making the
  decisions. There are also two occurrences at most in this material, which is
  not a pattern.
- **Deriving it from Figma automatically.** The behaviour it must carry is
  precisely the part Figma does not hold. An extractor would produce a confident
  document missing the same things the canvas misses.
- **Waiting for Claude Design's step 5 to become available.** That artefact
  solves the *outbound* handoff — showing a finished component to a viewer. This
  one is inbound, to the agent. They are different joints, and this one is
  unblocked today.

The step-5 asymmetry is recorded rather than papered over: the curriculum now
says step 5 is specified but unbuilt, instead of presenting it as the settled
counterpart to step 0.

## Consequences

- The prompt block starts from something reviewable. A trainer can read a
  participant's handoff document in thirty seconds and see the missing behaviour
  before an agent has written a line of code — the cheapest point at which to
  catch it.
- The closing parity check gets a stable node id and a declared field set, so
  ADR-0024's "same code, different score" failure mode stops being available by
  accident.
- Day 2 Block 01 gains a deliverable it must fit into its existing 90 minutes.
  No block time was added; if the room runs long, this is the step that gets
  compressed, and compressing it costs exactly the behaviour coverage it exists
  to protect. That tradeoff is real and is not resolved here.
- Nothing enforces it. There is no gate that can read a participant's prose, and
  inventing one would mean the machine-readable format rejected above. It is a
  curriculum convention held up by the trainer, which is the same standing as
  every other instruction on that page.
- The two handoffs now read as one idea with two directions — inbound to the
  agent, outbound to a viewer — with the second honestly marked as not yet
  deliverable. When the per-seat question in ADR-0032 resolves, step 5 slots in
  beside this one rather than replacing it.

**Corrected 2026-09-07.** The Decision above rejects "deriving it from Figma
automatically" because an extractor would produce a confident document missing what the
canvas misses. That reasoning holds for the behaviour half and is kept. It was applied too
broadly to the other half: the draft URL, node id, variant axes, token bindings and
snapshot stamps are mechanical lookups the master *does* carry, and a participant typing
them by hand gains nothing but transcription errors. Decided in
`plan/design-skills-blueprint.md` § 8 (decision 6): the `design-to-code` skill may
prefill **provenance and scope** from the master; **behaviour, explicit exclusions and
the reuse-vs-new decision stay author-written blanks** the skill must not fill and must
not proceed without. The deliverable is unchanged — a checklist, not a schema, reviewed
by a trainer before code — and "no gate can read a participant's prose" still stands.
The skill is pending; until it lands, this paragraph records the intent.
