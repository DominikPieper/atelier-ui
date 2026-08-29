---
status: accepted
date: 2026-08-29
sources:
  - plan/adr/0036-type-roles-not-axes.md (the role layer this extends)
  - plan/adr/0074-two-roles-the-eight-did-not-span.md (the precedent whose rule this replaces)
  - plan/adr/0073-a-role-is-for-prose-not-for-a-derived-box.md (the value-text carve-out)
  - plan/adr/0052-the-row-is-the-second-ladder.md (the ladder these two roles are named for)
  - tasks/type-roles-evidence-2026-08-28.md (the census, and its own warning about §0)
---

# ADR-0085: The counting rule, before the count

## Status

Accepted. Adopts an explicit rule-of-three counting rule, then applies it to mint
`--ui-type-row` and `--ui-type-row-sm` with their `ty/*` Figma styles.

## Context

ADR-0074 minted `--ui-type-control` and `--ui-type-action` on a rule of three:
six CSS rules × 75 Figma nodes, and three × 15. It never wrote the rule down. Read
back from its numbers, it counted **CSS rules on one side and Figma nodes on the
other, independently**, matched on family + weight + size with the leading ignored
— its own text gives that away ("of the 30 nodes in these two combinations that
state a leading at all, all 30 state 125%", i.e. 60 of 90 stated none and were
counted anyway).

`tasks/type-roles-evidence-2026-08-28.md` re-derived the whole population against
`tools/figma/text-nodes.json` and tightened that rule. It also named the tightening
as its own weakest point: the rule is the load-bearing thing in the document and no
decision authorises it. **Under ADR-0074's rule all three candidates pass. Under the
tightened rule, two do.** A rule invented in the same document that reports its
results is a rule that can be shaped, however honestly, by the results it produces.

So the rule is decided here, first, and the count follows from it.

## Decision

**1. The counting rule.** A combination earns a role when it clears three on both
sides, counted as follows.

*CSS side* — count distinct rendered elements whose fully resolved cascade IS the
combination, once per logical rule rather than once per framework. Exclude:

- a **pass-through** element that declares `font: inherit; font-weight: inherit`
  and therefore cannot differ from its parent;
- an **aria-hidden glyph**, because §6 of the evidence already excludes these on
  the Figma side and two sides must count the same population;
- a declaration that **loses the cascade**;
- a **defect already scheduled for correction**.

Report ADR-0073 carve-outs separately but do not exclude them: that ADR governs
what a CSS *rule* may write, not whether the combination exists.

*Figma side* — count nodes drawn at the combination **whose own resolved CSS
cascade is that combination**. "Drawn at X" and "faithful to X" are different
measures and ADR-0074 used them interchangeably. Exclude:

- nodes **inside an INSTANCE** whose master already contributes the same artwork;
- **invisible** nodes;
- nodes carrying a **`letterSpacing` or `textCase` no `ty/*` style can express** —
  `tokens.css` states outright that the roles do not touch letter-spacing, and all
  twelve styles are verified `ls PERCENT:0 / case ORIGINAL / deco NONE`.

Report both the raw and the strict number every time.

**Why tighten rather than keep the precedent.** Each exclusion removes a node that
*cannot* be bound to the role being counted — an instance descendant would fight
its master, an invisible node renders nothing, and a node with `UPPER` casing
loses its casing the moment a role is applied. Counting them inflates the evidence
for a decision they cannot participate in. The precedent's looser rule was not
wrong so much as unstated; re-run under this rule, ADR-0074's own two roles still
score 75 and 15 and survive — checked, because a successor rule that retroactively
fails its predecessor would be a reason to reject the successor.

**2. Two roles, under that rule.**

| role | value | CSS sites | faithful Figma nodes / masters |
|---|---|---:|---|
| `--ui-type-row` | regular `md` / tight | 7 | 11 / 3 |
| `--ui-type-row-sm` | regular `sm` / tight | 3 | 10 / 3 |

`row` is the text **in** a row — a menu item, an option, a checkbox or radio
label, a table cell — where `control` is the label **on** a control and `action`
is the text of a control that **acts**. Named for the `--ui-row-height-*` ladder
of ADR-0052, and tight for the same reason that ladder exists: a row's height is
stated, so its leading must not grow with the text.

`row-sm` lands **on** the threshold, not above it. Recorded as such rather than
rounded up.

**3. The third candidate gets no role.** Instrument Sans SemiBold 14 / 125% has
eight CSS sites and nine drawn nodes — more evidence than the analysis credited it
with, and it still fails: three of its eight sites and all three AtlTh nodes carry
a `letter-spacing` or `text-transform` no role can express. Under ADR-0074's rule
it would have passed, and the resulting role would have silently dropped the
uppercase from every table header bound to it. This is the exclusion that decides
a verdict, and it is the one a reader most likely disagrees with — §7 of the
evidence says so, and this record repeats it rather than burying it.

## Consequences

- Twelve `ty/*` styles now mirror twelve `--ui-type-*` roles; `[TEXT-STYLE]`
  compares them in both directions to three decimals and is green.
- The canonical token source is the create-workspace preset copy — the only one
  every gate reads — synced to the three framework copies by `npm run sync:tokens`.
  Both roles carry `intent` and `constraints` in `tokens.manifest.ts`
  (180/180 annotated) because `check:css-tokens` fails an unannotated token, and
  `llms-full.txt` is regenerated because it enumerates the role set.
- **Nothing is bound yet.** Minting the roles and binding the ~119 off-scale nodes
  are separate steps, and the second is where a wrong role becomes visible. The
  binding pass also has to correct the 14→16 drift on 37 nodes first, which is why
  it did not ride along here.
- **A Figma style may exist where the CSS keeps longhand.** ADR-0073's carve-out
  says a control's own value text keeps its longhands because its padding `calc()`
  names the leading as an operand. That governs the CSS rule, not the Figma node,
  and this record makes the split explicit so the next reader does not resolve it
  by guessing.
- The rule now has a citation. The next combination is measured against ADR-0085
  rather than against whichever document is arguing for it.
