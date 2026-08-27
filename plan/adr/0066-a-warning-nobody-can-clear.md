---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0031-single-source-component-maps.md (the registry this reads correctly at last)
  - plan/adr/0065-the-table-gives-its-children-back-their-states.md (the four masters that made it six)
  - plan/adr/0062-a-part-promoted-to-a-master-becomes-checkable.md (the masters whose specs do not exist by design)
---

# ADR-0066: A warning nobody can clear

## Status

Accepted. `check:parity` now distinguishes a deliberate exclusion from a forgotten
registry entry, and a recorded to-do is reframed rather than executed.

## Context

Two things pointed at the same place.

`check:parity` emitted six identical `[MAP]` warnings — AtlToast, AtlCodeBlock,
AtlMenuSeparator, AtlChatMessage, AtlChatSuggestion, AtlChatTyping — each saying *"no
spec/registry mapping, parity inputs cannot be located. Add it to
COMPONENT_METADATA_REGISTRY or allowlist it."* There is no allowlist for that check, and
adding a registry entry is exactly what the project has decided against for all six. A
warning whose only two remedies are both refused is not advice; it is noise, and noise in
a warning channel teaches a reader to skim the channel.

And `tasks/todo.md` carried an item asserting that a child spec sharing its parent's
metadata module *"inherits false claims"* and that the children should get their own
modules. Executing it would have meant writing up to fourteen metadata files.

Reading the metadata index before writing any of them showed the premise was wrong.
Sharing is **deliberate and documented**: `select.metadata.ts` declares
`specNames: ['AtlSelectSpec', 'AtlOptionSpec']`, the index's own comment on
`DOCS_PRIMARY_SPECS` states that *"one docs entry documents one primary interface"* and
that child interfaces are *"intentionally absent"*, and nine modules cover several specs
that way. `NON_COMPONENT_SPECS` lists `AtlChatMessageSpec` and `AtlChatSuggestionSpec`
explicitly as *"shape[s] rendered by AtlChatSpec"*. The `radio` module even lists the
item before the group, so "the first name is the primary" is not a rule the data supports
either.

## Decision

**1. `[MAP]` classifies three situations, and only the third is a warning:**

- **No such spec interface at all** — AtlToast and AtlCodeBlock have no contract by
  design (`check:figma` allowlists them the same way), and AtlMenuSeparator and
  AtlChatTyping earn a master by being *placeable* rather than by having state
  (ADR-0062). Reported as a count, with the reason inline.
- **The spec exists and `NON_COMPONENT_SPECS` excludes it** — a shape its parent renders.
  Same treatment.
- **The spec is exported, is not excluded, and has no registry entry** — that is a
  forgotten entry, and it warns, naming both facts so the reader knows why this one is
  different.

The summary line now reads `37/43 master(s) have a parity record; 6 intentionally
untracked (AtlToast (no AtlToastSpec), …)`. The information is kept; the demand is
dropped. Verified by removing `AtlTdSpec` from the registry: the third branch fires with
the precise message, and restoring it clears.

**2. The to-do is reframed, not executed.** What remains after refuting its premise is
narrower and worth stating exactly: **`ComponentMetadata` has no field saying which spec a
`variantMatrix` describes**, so the gate applies a module's matrix to every spec sharing
it. Today that costs exactly one allowlist entry — `AtlOption:variant:state=filled`, where
the matrix pictures the select *trigger*. The fix is a field on the type
(`variantMatrixFor`, or per-spec sections), which reaches `check-metadata` and
`gen-llms-txt`; worth doing when a second collision appears, not for one entry.

**3. That allowlist entry's reason was corrected.** It said *"a child spec needs its own
metadata module; tracked in tasks/todo.md"* — repeating the wrong premise. An exemption's
comment is the only place a later reader learns why, so a comment that misstates the
reason is worse than none.

## Consequences

- `check:all` exits 0 with **12** advisory warnings, down from 18. Every one is either a
  recorded item or a stated exclusion; none of them asks for something the project has
  decided against.
- **A warning has to be clearable.** Three situations shared one message, and only one of
  them was actionable — which made the other two permanent, and permanent warnings are how
  a reader learns that warnings do not mean anything. When a check cannot tell "decided
  against" from "forgotten", it has to be taught the difference rather than have its
  volume tolerated.
- **The fix for a recorded item can be to refute it.** Reading the design took one file;
  building against it would have taken fourteen. A to-do written from a symptom carries the
  diagnosis its author had at the time, and re-reading the thing before acting is what
  keeps a stale diagnosis from becoming a stale implementation.
