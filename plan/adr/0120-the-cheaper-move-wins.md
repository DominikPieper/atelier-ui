---
status: accepted
date: 2026-09-10
sources:
  - AGENTS.md (the Figma Components page as the structural source of truth)
  - plan/adr/0118-two-agreeing-sources-outrank-one.md (the tie-break rule this collided with; not corrected, not superseded — narrowed)
  - docs/src/data/components.ts (`COMPONENT_CATEGORIES.Inputs`, the agreeing code side)
  - libs/{angular,react,vue}/.storybook/preview.*'s `storySort.order` (`Inputs` first) and every affected component's story `title:`
  - tools/figma/snapshot.json (`Inputs/AtlButton`, `Inputs/AtlInput`, `Inputs/AtlTextarea`, `Inputs/AtlSelect`, `Inputs/AtlCombobox`, `Inputs/AtlCheckbox`, `Inputs/AtlRadio`, `Inputs/AtlRadioGroup`, `Inputs/AtlToggle` — before/after node ids)
  - tools/scripts/lib/allowlists.js (`CATEGORY_ALIGNMENT_EXEMPT`, now empty)
  - tools/scripts/check-category-alignment.js (the gate this closes clean)
  - plan/figma.md (the passage updated to record the closure)
---

# ADR-0120: The cheaper move wins

## Status

Accepted. Figma's `Action` and `Form` Sections on the Components page are
merged into one `Inputs` Section, matching `docs/src/data/components.ts` and
every Storybook `title:`. `CATEGORY_ALIGNMENT_EXEMPT`'s eight `gap` entries
for this split are deleted; `check-category-alignment.js` passes with none in
use.

## Context

ADR-0118 recorded, as deliberately unresolved, a three-way split: Figma filed
`AtlButton` under its own `Action` Section and the other seven Inputs
controls under `Form`, while `docs/src/data/components.ts` and every
Storybook `title:` agreed on one flat `Inputs` category. ADR-0118's own
tie-break rule — two agreeing sources outrank one — says the outlier moves.
Here the outlier is Figma, so the rule's mechanical reading is "split
`components.ts`'s `Inputs` into two categories and rename eight Storybook
story titles to match."

But `AGENTS.md` states a second, independent rule for this same file: the
Figma Components page is the structural source of truth, which points the
other way — fix Figma to match code. This is the first time the two rules
have actually collided (ADR-0118 was itself built for a case, Feedback vs.
Layout, where Figma and Storybook were the agreeing pair and the outlier was
a hand-maintained docs file — the direction both rules already agreed on).
It will recur on every future Figma-vs-code category divergence, so it needs
a standing answer, not a one-off judgment call.

The two rules disagree here because they are answering different questions.
ADR-0118's tie-break counts votes among three record-keepers with no stated
opinion on which one is *expensive* to change. AGENTS.md's structural-source-
of-truth claim is about where a designer looks to find the current shape of
the library, not about which side is cheaper to edit. Neither rule, as
written, accounts for cost — and cost is exactly where this case is
lopsided.

## Decision

**When ADR-0118's tie-break and AGENTS.md's Figma-source-of-truth clause
would send a fix in opposite directions, the side that is cheaper to move
wins — and "cheaper" is decided by whether anything downstream keys on the
thing being renamed, not by counting sources.**

Applied here: a Storybook story `title:` is an identity. Renaming
`Components/Inputs/AtlButton` changes the story's id, which breaks saved
Storybook links, `docs-show-story` calls made against the old id, and every
`figmaNode()` / `parameters.design` reference keyed off it — eight of those,
one per affected component. A Figma Section's name is not an identity
anything downstream keys on: no gate, no MCP call, no persisted link
resolves a component by which Section contains it. `addon-designs` and the
parity records resolve by `COMPONENT_SET` node id, and reparenting a node
into a different Section, or renaming that Section, never changes the
node's id (verified: all nine masters' ids are byte-identical before and
after — see the task record this ADR accompanies). So the fix that costs
nothing downstream (merge two Figma Sections, rename nine masters' slash
prefix) was chosen over the fix that costs eight broken identities
(split a docs.ts category, rename eight story titles).

This is a narrowing of ADR-0118, not a reversal of it. ADR-0118's tie-break
still governs the ordinary case — two record-keepers against one, no
competing structural-source-of-truth claim, no asymmetric rename cost. It
remains correctly decided for the Feedback/Layout case it was built for:
Figma and Storybook were the agreeing pair there too, and the outlier
(`components.ts`) was the cheap side to move regardless of which rule you
asked. The rule this ADR adds only fires when ADR-0118's vote count and
AGENTS.md's structural-source-of-truth claim would send the fix in opposite
directions — which is exactly when "count the votes" stops being sufficient
by itself.

## Consequences

- The next Figma-vs-code category (or naming) disagreement doesn't require
  re-litigating ADR-0118 from scratch: check whether the two rules actually
  disagree on direction, and if they do, ask which side something downstream
  keys on by identity (a story title, a URL slug, a published package name)
  versus which side is purely organisational (a Figma Section, a folder
  grouping with no external reference). The organisational side moves.
- This does not create a general license to always prefer moving Figma. A
  future case where the *Figma* side carries the identity cost — e.g. a
  published component-library key, or a Figma Variable name other files
  alias — would apply the same asymmetry rule and get the opposite answer:
  code moves.
- ADR-0118's exemption mechanism (`CATEGORY_ALIGNMENT_EXEMPT`, `kind: 'gap'`)
  did its job: it kept the unresolved split visible on every gate run for one
  day rather than letting it go quiet, which is exactly what surfaced this
  collision for a human decision instead of an agent silently picking a
  side inside the allowlist.
- Nine Figma masters (`AtlButton`, `AtlInput`, `AtlTextarea`, `AtlSelect`,
  `AtlCombobox`, `AtlCheckbox`, `AtlRadio`, `AtlRadioGroup`, `AtlToggle`) now
  carry an `Inputs/` prefix instead of their historical `Action/` / `Form/`
  one. Older ADRs (0107, 0114) and `plan/figma-component-checklist.md` still
  cite `Action/AtlButton` / `Form/AtlInput` as illustrative examples of the
  section-prefix mechanism or as historical fact at the time they were
  written; neither is now wrong (the mechanism they describe — the gate
  strips the prefix before comparing — is unaffected by what the prefix
  currently says), so neither needs a dated correction under the ADR
  discipline: they recorded true statements about a then-current name, not a
  claim about what the name would always be.
