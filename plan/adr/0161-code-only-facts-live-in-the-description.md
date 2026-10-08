---
status: accepted
date: 2026-10-08
sources:
  - plan/research/ai-ds-course-gap-2026-10-08/wave2-a2-code-only-props-spike.md (the spike this record decides on: toolchain impact table, AtlButton walk, options a–d)
  - "AI & Design Systems" course, transcript 102 (the only demo of a hidden "code-only props" layer; it cites an article by Nathan Curtis without title or URL) and transcript 115 L272-288 (advice to use descriptions and annotations)
  - libs/spec/src/contracts/types.ts (`codeOnly`, "with the reason")
  - tools/scripts/check-contracts.mjs (`[UNMIRRORED]`, now a line match; new `[STALE-MIRROR]`)
  - plan/adr/0121-the-stories-are-the-spec.md, plan/adr/0145-the-contract-records-the-difference-not-who-owes-it.md
---

# ADR-0161: Code-only facts live in the master description, not in a hidden layer

## Status

Accepted. Recorded at decision time. Atelier teaches the hidden "code-only props" layer as
one technique a team can use, and does not adopt it in its own masters.

## Context

The "AI & Design Systems" course demonstrates a technique attributed to Nathan Curtis: a
hidden layer inside each Figma component carries what the design cannot show — `aria-label`,
`alt`, a native `type`, behaviour intent — so an agent reading the node finds it. The owner
first chose to introduce it into Atelier's own masters. A read-only spike (sources) then
measured what that would take:

- **One source.** Only transcript 102 shows the technique: one practitioner demo, no test
  that an agent reads the layer, no way to keep copies in sync. The speaker calls it "another
  viable solution" next to the description field. Transcript 115 recommends descriptions and
  annotations.
- **Gate collisions.** The snapshot walks hidden nodes on purpose (ADR-0061). A hidden frame
  trips `[OVERLAY]` (an `_`-prefixed layer bound to nothing is an orphan), `[LAYER-UNRESOLVED]`
  (a named frame with no CSS selector, ratcheted), `[AUTOLAYOUT]` (a non-auto-layout wrapper)
  and the root-type read (a second TEXT child under the variant root). Each needs an
  exemption or a gate change.
- **Copies.** A layer lives per variant: AtlButton alone would carry 24 copies with no sync.
- **No reader.** No gate, skill step or agent instruction reads a layer's text today. The
  design-to-code skill reads the description; `figma_search_components` searches it.
- **Atelier already has the carrier.** Every master description has an "API surface" block
  that `check-figma.js` parses line by line, an A11y paragraph, and the contract's `codeOnly`
  list with a reason per entry. The weak point was the join: `[UNMIRRORED]` checked
  `description.includes(name)`, which `type`, `id` and `open` pass against almost any prose.
  AtlButton's description did not contain `type` at all.

## Decision

1. **No hidden layer in Atelier's masters.** The docs explain the technique, what it is for,
   and how it differs from the contract's `codeOnly`.
2. **A code-only fact is one description line:** `- Code-only \`name\`: <reason>`. The
existing `- Boolean \`name\`: not modelled — <reason>` line (ADR-0056) also counts, so a
   master that already states it is not made to say it twice.
3. **`check:contracts` joins both directions.** Every contract `codeOnly` entry needs one of
   those lines (`[UNMIRRORED]`, a line match instead of a substring). Every `- Code-only` line
   must name a prop or event some framework manifest has (`[STALE-MIRROR]`). Both stay
   warnings, as ADR-0121 set for the mirror checks. This corrects ADR-0121 Refinement item 4,
   where "mention" meant a substring; the correction is written into ADR-0121.
4. The contract keeps the full reason; the description carries a one-line reason a designer
   can read. They are not compared word for word, because that would put prose under a gate.

Rejected:

- **(a) Hidden layer, as in the course.** Above: gate changes, per-variant copies, no reader.
- **(c) Component property or annotations.** A TEXT property must bind to a layer and becomes
  an instance override with no code counterpart. Annotations are not in the snapshot, and
  whether this file's plan can write them was not verified.
- **(d) Hybrid.** Contract, description and layer would be three places for one fact, the
  duplication ADR-0121 and ADR-0145 argue against.

## Consequences

- 14 masters gained a "Code-only props" block on 2026-10-08 (15 lines); 5 already carried the
  fact as `Boolean … not modelled`. The snapshot was re-taken.
- A team that wants Curtis's layer can still add one in its own file. The docs name the gate
  rules it would collide with in Atelier, so the cost is visible before they start.
- Weakest point: the line holds the fact, but nothing checks that an agent _uses_ it. The
  course's open question — does the agent read it? — is unanswered for the description too.
  It is better placed (searched, returned by `figma_get_component_for_development`, read by
  the design-to-code skill) but untested as a read-side A/B.
- The older parentheticals ("(code-only props on AtlInputSpec: …)") stay. They list props that
  need no contract entry (strings, callbacks) and do no harm; a later cleanup can fold them in.
