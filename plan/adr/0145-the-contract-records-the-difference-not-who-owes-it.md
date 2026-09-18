---
status: accepted
date: 2026-09-18
sources:
  - https://www.pavingways.com/en/blog/design-systems-ai-context-tj-pitre-smashingconf (conference note on TJ Pitre's "Context-Based Design Systems in Practice", SmashingConf Freiburg 2026 — the outside prompt for this record; its promotion-rule paragraph is the question, not the answer)
  - libs/spec/src/contracts/types.ts (`figmaOnly` / `codeOnly` / `axisMap`, each "with the reason" — the field this record gives a reading rule)
  - libs/spec/src/contracts/{input,select,textarea,combobox,table}.contract.ts (7 entries reading `UNEXPLAINED — … decide in tasks/todo.md`, all `figmaOnly`, all dated 2026-09-10)
  - libs/spec/src/contracts/avatar.contract.ts (`status` — "Figma-side axis owed, tracked in tasks/todo.md", the one entry that already names a direction)
  - libs/spec/src/contracts/radio-group.contract.ts (`orientation` — "promote to AtlRadioGroupSpec, or drop it from React. Unresolved")
  - libs/spec/src/contracts/{accordion-item,accordion-group,breadcrumb-item,button,chat-message}.contract.ts (the settled kind, in their own words: "changes nothing drawn", "behaviour only", "is data, not state", "native HTML passthrough")
  - tasks/todo.md:1508 (the owed axis item — design half open and blocked on the Desktop Bridge, gate half closed)
  - plan/adr/0121-the-stories-are-the-spec.md (the micro-contract and its forbidden list)
  - plan/adr/0056-a-master-models-one-thing.md ("a part gets its own master when it has a visual state a designer sets" — the same drawn-test, already decided for masters; the record `accordion-group.multi` cites)
  - plan/adr/0078-a-count-you-can-only-ratchet-down.md (the ratchet shape this record declines to build today)
  - tools/scripts/check-paint.mjs:163-176 (a baseline whose entries carry `kind`/`why` — the mechanism a future gate would copy)
---

# ADR-0145: The contract records the difference, not who owes the change

## Status

Accepted 2026-09-18. Prose only: this record and two documentation surfaces. No schema
change, no gate — see Decision 4, which is the part most likely to be revisited.

## Context

A conference note on TJ Pitre's CBDS talk asks a governance question this repo has
never written down: when implementation discovers a need the design system does not
have, what earns a place in the shared library and what stays a local exception? The
blog's own answer is a promotion rule — more than one real use case, clear semantic
meaning, accessibility met, a named owner — with the warning that promoting every
one-off into a global library is the failure mode, and burying every decision in
product code is the other one.

Atelier has no product code, so half that framing does not apply. But the other half
lands precisely, because the repo already has the artefact where such decisions get
parked, and it has been parking them without distinguishing their kind.

`ComponentContract` (ADR-0121 Decision 3) records Figma ↔ code differences that exist
**on purpose**: `figmaOnly` for a Figma property with no code prop, `codeOnly` for a
code prop with no Figma property, `axisMap` for the ones that match under another name.
Each entry carries `name` and `reason`, and nothing else. The field documentation says
"each with the reason" — and that is the whole contract between the author and the
reader.

Reading the 43 contracts, those reasons fall into two kinds that no gate and no schema
can tell apart:

**Settled.** The two sides differ permanently, and correctly, because the thing they
differ about is not drawn:

- `AtlAccordionItem.headingLevel` — "Not visual: it chooses h2..h6 for the trigger's
  wrapper and changes nothing drawn."
- `AtlAccordionGroup.multi` — "behaviour only… No CSS rule and no render condition
  reference it." (ADR-0056)
- `AtlBreadcrumbItem.href` — "it swaps the element from `<span>` to `<a>` and changes
  nothing drawn."
- `AtlChatMessage.id` — "Is data, not state."
- `AtlButton.type` — "a form-semantics attribute… not a Figma-drawn visual axis."

These need no owner and no follow-up. Figma has no business owning them, and a master
that grew a `headingLevel` axis would be worse, not better.

**Owed.** Nine entries, across seven contracts, are not settled at all. They are
deferred decisions wearing the same clothes:

| Entry                                                                 | Direction                                  | What the reason actually says                                                                                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AtlAvatar.status` (`codeOnly`)                                       | Figma owes an axis                         | "a real CSS-backed paint axis — `check:variants` enforces its class across all three adapters — but the master has no matching `status` Variant axis yet. Figma-side axis owed." |
| `AtlRadioGroup.orientation` (`codeOnly`)                              | Undecided which side                       | "promote to `AtlRadioGroupSpec`, or drop it from React. Unresolved."                                                                                                             |
| `AtlInput` / `AtlSelect` / `AtlTextarea` `state=filled` (`figmaOnly`) | Code owes a rule, or Figma owes a deletion | "UNEXPLAINED — grep-verified 2026-09-10: no CSS rule or component logic implements an `.is-filled`/`:placeholder-shown` visual state; decide in `tasks/todo.md`"                 |
| `AtlCombobox` `state=filtered`, `state=selected` (`figmaOnly`)        | same                                       | "UNEXPLAINED — … no root-level class or distinguishable state exists"                                                                                                            |
| `AtlSelect` `state=open` (`figmaOnly`)                                | same, with a native-vs-CDK split           | "AtlSelect renders a native `<select>`, whose open popover is browser-drawn"                                                                                                     |
| `AtlTable.error` (`figmaOnly`)                                        | Unknown                                    | "UNEXPLAINED — surfaced by the S2 contract pass 2026-09-10"                                                                                                                      |

Every one of those is a promotion question in the blog's sense, asked and not answered.
They have sat since 2026-09-10 in the same list as `headingLevel`, indistinguishable to
any reader who has not read all 43 files, and invisible to `check:contracts`, which
validates that a divergence is _recorded_ and never asks whether it should still exist.

The cost is not that the nine are unresolved — `tasks/todo.md:1508` tracks the avatar
axis honestly, including that its design half is blocked on a Desktop Bridge this
environment does not have. The cost is that **the contract does not say which of its
entries are debts**, so the backlog can only be rediscovered by grepping for the word
`UNEXPLAINED`, which is a convention nobody agreed to and nothing enforces.

## Decision

**1. The promotion test is "is it drawn?".** A divergence between the master and the
code is _settled_ when the thing the two sides disagree about changes nothing the
master draws — behaviour, element semantics, form semantics, data, keys. It is _owed_
when it changes something drawn, in either direction:

- a CSS-backed paint axis with no Figma axis → **Figma owes an axis** (`AtlAvatar.status`);
- a Figma axis with no CSS rule or render condition → **either the code owes an
  implementation, or the master owes a deletion**, and the entry must say which is being
  asked (`state=filled`).

This is not a new criterion. ADR-0056 already decided it one level up — "a part gets
its own master when it has a **visual state a designer sets**", and "a variant axis
names a prop, or it does not exist" — and the settled entries restate it in their own
words, "changes nothing drawn". What is new here is only its scope: the same test that
decides whether a part earns a master now decides whether a divergence is finished or
owed. A phrase five contracts happen to share becomes the rule all 43 are read by.

**2. An owed entry names a direction, and where it is tracked.** `reason` on an owed
entry is not free prose: it states which side is expected to change, and points at the
`tasks/todo.md` item that carries it. `AtlAvatar.status` is the model — it names the
direction, the enforcing gate, and the tracker. The seven `UNEXPLAINED` entries are not;
each needs the direction added when its question is answered.

**3. Promotion into the shared master requires more than being drawn.** Drawn makes a
divergence _owed_; it does not decide the answer. An owed code-side axis earns a Figma
axis when it is drawn **and** a gate already enforces it across all three adapters (the
repo-native form of the blog's "more than one real use case" — three adapters agreeing
is the evidence here), **and** it carries no accessibility regression, **and** the
`tasks/todo.md` item has someone attached to it. Otherwise the honest outcome is the
opposite promotion: delete the axis from the master and let the state be a CSS
pseudo-class, which is already this repo's convention for interaction states (ADR-0114).
The failure mode the blog names — every one-off becoming a canonical variant — reaches
Atelier as a master growing variant combinations no story renders and no gate measures.

**4. No `kind` field and no gate today.** The enforceable shape is obvious and this repo
has already built it twice: a `kind` discriminator per entry, plus a baseline of owed
entries that can only ratchet down (ADR-0078; `check-paint.mjs`'s baseline already
carries `kind`/`why` per finding). It is not built here, deliberately. All nine owed
entries are blocked on things a gate cannot move — a Desktop Bridge that is not
connected, and design questions nobody has answered — so a ratchet introduced today
would convert a known, dated, listed backlog into a red build while advancing none of
it. The rule is worth writing before the mechanism, because the mechanism is cheap once
the backlog is small and the rule is what makes the backlog shrink.

## Consequences

The rule lives in three places and only three: this record, the contracts README (which
is byte-identical in the scaffold, so a workshop workspace inherits it), and the
design-to-code docs page, where it is workshop content rather than repo policy.

A contract author now has a test to apply instead of a blank `reason` field, and a
reader has a vocabulary — _settled_ vs. _owed_ — for a distinction that previously
existed only as the accident that some reasons begin with `UNEXPLAINED`.

Nothing enforces it. That is the weakest point of this record, and it is a known
failure mode here rather than a hypothetical one: prose statements of current state in
this repo have gone stale silently before — `AGENTS.md`'s `check:all` gate count did it
four times before the sentence was replaced by a pointer at the live source. A
promotion rule that is only prose will drift the same way, and the specific drift to
expect is a tenth owed entry written as settled, by an author who never read this file.
Two things make that survivable: the nine existing entries are enumerated above with
dates, so the baseline for a future gate is already written down, and the word
`UNEXPLAINED` remains greppable in the meantime.

The gate stays available. When the owed count is small enough that a ratchet would start
green — or when a cohort demonstrates that the prose alone does not hold — Decision 4 is
the one to reopen, and the mechanism is a copy of `check-paint.mjs`'s baseline, not a
design problem.
