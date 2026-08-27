---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0024-design-parity-persistence-gate.md (the record this redefines the basis of)
  - plan/adr/0044-parity-drift-during-the-redesign-phase.md (the phase this closes)
  - plan/adr/0063-the-layer-name-is-the-selector.md (the last of the gates the stamp now rests on)
---

# ADR-0064: What the parity stamp rests on

## Status

Accepted. Closes the redesign phase (`tools/design/artboards.json`,
`meta.redesignPhase.active: false`), re-records parity for all 33 locatable masters, and
states what the stamp does and does not assert.

## Context

`parity:record` writes one thing per component: the Figma node, the verifying git sha and
timestamp, and an `inputsHash` over that component's files across all three frameworks.
Its own header calls it *"the ONE part of the parity loop that depends on a human/agent
having run the (bridge-connected) verify"*. `check:parity` later compares the hash and
asks for a re-verify when the files have moved.

So the record is a **claim**: *someone verified this component against Figma at this
commit.* What it does not say is what verifying meant. And the obvious candidate is weak
evidence: `figma_check_design_parity` needs a hand-authored `codeSpec` per run, and ADR-0024's
2026-08-26 amendment already established that its score is not comparable across runs —
three runs on one commit for AtlStepper returned 70, 52 and 83 — which is why the score is
deliberately not stored.

Meanwhile ADR-0059 through ADR-0063 built something the manual check cannot be: a
systematic, offline, per-variant comparison of the committed Figma snapshot against the
CSS, which runs in CI on every push.

ADR-0044 opened the redesign phase with a written exit criterion: *"rebuild the Figma
masters from the redesign, then re-verify + parity:record every component."* The first
half is done and gated. This ADR decides what the second half means.

## Decision

**1. The stamp rests on the gates, not on a score.** `parity:record` is run when
`check:figma` is green for that master. What that asserts, precisely — the committed
snapshot of the master agrees with the component's CSS on:

| Gate | What it compares |
|---|---|
| `[FONT-FAMILY]`, `[TEXT-STYLE]` | every text node's family against the three `tokens.css` declares; the local text styles against the eight `--ui-type-*` roles |
| `[ROOT-PAINT]` | the root's fill, stroke (four-side and per-side), radius and shadow — the bound variable's NAME, in both directions, for every variant |
| `[LAYER-PAINT]` | the same for every layer named after a CSS class, plus `min-height`, `height`, padding per edge, `gap`, `font-size` and `line-height`, resolved through the cascade |
| `[OVERLAY]` | the layers a Boolean switches on: raw paints, cover overlays off 0,0, layers outside their parent, hidden layers bound to nothing |
| `[NAME]`, `[AXIS-NAME]`, `[AXIS-NOT-A-PROP]`, `[VARIANT]` | axis names and values against the spec unions and the metadata matrix |
| `[BOOL-MISSING]`, `[BOOL-INERT]`, `[BOOL-UNSPECED]`, `[BOOL-CLAIM]` | Booleans in all three directions, and the truth of each stated mapping |
| `[MASTER-GLYPH]`, `[TOKEN]`, `[AUTOLAYOUT]`, `[DESC]` | pictograms drawn as characters, unbound values, reflow, the spec reference |

That is repeatable, offline, and fails in CI. A hand-filled `codeSpec` is none of those.

**2. What the stamp does NOT assert**, written down so it cannot be read as more than it
is:

- **Non-default state variants.** `state=hover|focus|active|invalid|open` take their paint
  from `:hover`, `:focus-visible`, `:active`, `.is-invalid`, `.is-open` — rules a static
  selector table cannot resolve. 18 of the ~120 checked variants are excluded, and every
  run names them.
- **Root typography.** 100 master-variant roots carry their own text; `[ROOT-PAINT]` has no
  typography, and that is where AtlAvatar's `xs` initials sat at 9px against 10px and its
  `xl` at 16px against 18px. Both fixed here by hand; the leading on most of those roots
  is still `AUTO` where the CSS states a `line-height`.
- **`color-mix()` paints.** Four components compute a colour (AtlAvatar's root, AtlBadge's
  and AtlAlert's variant borders, AtlToast's variant fills). No Figma Variable can express
  a mix, so those are unverifiable by construction.
- **Wrapper layers**, content, icon choice, illustration frames beside a master, and
  motion. Five pictograms sit in such frames, invisible to a probe that walks components.
- **Six masters have no record at all** — AtlToast, AtlCodeBlock, AtlMenuSeparator,
  AtlChatMessage, AtlChatSuggestion, AtlChatTyping — because `parity:record` locates a
  component's files through `COMPONENT_METADATA_REGISTRY` and these have no entry. 33 of
  39 are stamped; the six stay advisory `[MAP]` warnings until the child specs get their
  own metadata modules.

**3. The redesign phase is closed.** `active: false`, so `check:parity` blocks on drift
again rather than warning. The `note` was rewritten in the past tense: a field that said
"the library is being redesigned" would have been false the moment the phase ended, which
is the same rot ADR-0059 found in the Typography page's captions.

**4. The plan documents were reconciled against the file**, because three of them were
being read as current and were not:

- `plan/roadmap.md` still described an Angular-only library named `Llm*` with tokens at
  `libs/llm-components/`, listed "Inter font" as the visual refresh, and marked Phase 5
  as in progress — while the cookbook is gated, `llms.txt` is generated, releases publish
  from CI and the Astro docs app exists. Its four "open" items were all done, as was the
  last CDK backlog row (`cdkTextareaAutosize`, imported via `TextFieldModule`), as was the
  dark-mode architectural question. It now opens with a status block, including the trap
  that **its phase numbers are not the design-system plan's** — "Phase 3" is Dark Mode +
  Select there and the Figma transfer here.
- `plan/figma.md`'s backlog listed `LlmBadge`/`LlmToast`, "~50 pictogram text nodes" that
  ADR-0057 replaced, and "No Cover / Icons page: add when the file grows" for two pages
  that exist. Rewritten with counts measured from the file today.
- Four `tasks/todo.md` items were done but open: the eleven child masters, Booleans as
  snapshot data (twice), and recording the font.

**5. `check:adr-refs` gates the ADR log's own cross-references.** Repairing the plan
documents turned up **six broken `plan/adr/` references across 65 ADRs** — and the same
wrong filename twice, independently: a reader guesses the path from the TITLE
(`0035-instrument-sans-and-serif.md`) while the file is named
`0035-typography-instrument-pair.md`. I made that exact guess again today. It is a mistake
the author cannot catch by re-reading, so it is a gate: `[REF]` for a reference whose file
does not exist (naming the likely intended file), `[INDEX]` for an ADR with no README row,
`[ORPHAN]` for a README row pointing nowhere, `[SELF]` for an ADR citing itself. It scans
the 64 ADRs plus the six documents that link into them, runs offline in milliseconds, and
sits second in `check:all`, right after `check:sync`.

The first version of it was wrong in a way worth recording: the reference pattern
`\d{4}-[a-z0-9-]+\.md` matched the date tail of `tasks/design-findings-2026-07-22.md` and
reported thirteen ADRs as citing "ADR 2026". A reference has to be a whole path segment.

## Consequences

- `check:all` exits 0 with 18 advisory warnings, every one of them a recorded item. Drift
  in any component's files now blocks until re-verified — the discipline ADR-0044
  suspended is back on.
- **A record is only as good as the sentence that says what it means.** The old stamp said
  "verified" and the honest answer to "verified how?" was a score the tooling refuses to
  store. Naming the evidence is what makes the record auditable later.
- **Reconciling the plan was not bookkeeping.** Checking each stale item against the file
  found two real defects — the avatar font sizes — and two gate holes: root typography, and
  a glyph probe that cannot see an illustration frame. A stale record hides current
  defects, because a reader who trusts it stops looking.
- The next verification gap is written down rather than implied: extend the `ROOT_PAINT`
  cascades with the `size` and `shape` axes so root typography can be compared, then the
  `AUTO` leadings become visible.
- **The decision log now checks its own integrity.** Six dead links had accumulated in the
  one place this project keeps its reasoning, and each was invisible until someone
  followed it — by which time the reason it was written is what they were looking for.
