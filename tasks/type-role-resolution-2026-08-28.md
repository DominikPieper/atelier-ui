# The 311 Unbound Text Nodes — Decision Document

**Date:** 2026-08-28 · **Inputs:** six mapping agents + six skeptics over 26 of the 43 masters on `🧩 Components` · **Status:** read-only analysis; nothing in Figma was mutated. Where a skeptic refuted a mapper, the refutation is taken as the finding unless marked *(override)*.

---

## 0. The finding that reframes everything else

Before the split: I re-ran the CSS side myself rather than trusting the dossier, and found something none of the twelve agents states plainly.

```
grep -rn "ui-type-" libs/react/src/lib --include='*.css'
→ alert/atl-alert.css        --ui-type-body-sm
→ code-block/atl-code-block.css --ui-type-code
→ textarea/atl-textarea.css  --ui-type-body-md
→ toast/atl-toast.css        --ui-type-body-sm
```

**Four hits. Three distinct roles.** `--ui-type-title`, `--ui-type-display`, `--ui-type-headline`, `--ui-type-body-lg`, `--ui-type-label`, `--ui-type-control` and `--ui-type-action` are referenced by **zero component stylesheets** in any of the three frameworks (`grep -rn "ui-type-title" libs --include='*.css'` returns only the four `tokens.css` definitions).

ADR-0074 minted `ty/control` and `ty/action`, justified them with "6 CSS rules" and "3 CSS rules" (tokens.css:127-131), bound 231 Figma nodes to them — and never wrote `font: var(--ui-type-control)` into a single rule. The roles exist as *resolved longhand combinations* that a human counted, not as declarations a gate can read.

Everything below inherits this. When this document says "the CSS says ty/control", it means "three longhand declarations resolve to the same four values ty/control happens to name". That is a weaker fact than it sounds, and it is why `check:typeface`'s `font:`-shorthand branch (check-figma.js:1518-1527) almost never fires.

---

## 1. The split

The six groups covered **26 masters and 250 unbound nodes**. The live scan counts **311**. The 61-node remainder sits in the **17 masters nobody was assigned** — including `Action/AtlButton` (size=md and size=lg Button texts, unbound and Medium where `.atl-button` is SemiBold at every size), `Display/AtlCodeBlock` (2 header labels), `Display/AtlAvatar`, `AtlAlert`, `AtlBadge`, `AtlProgress`, `AtlSkeleton`. **The denominator does not close. No percentage in this document is exact.**

Classification rule used (the dossier's agents each used a different one): a node is **off-scale** if its resolved combination matches no ty/* role; otherwise **prose** (CSS resolves normal leading + a body role) or **control** (CSS resolves tight leading + a tight role); **unknown** if no selector renders it or the selector states no size.

| Group | prose (role match) | prose, **no size stated by the library** | control (role match) | off-scale | unknown / no counterpart | total |
|---|---:|---:|---:|---:|---:|---:|
| form-fields | 0 | 0 | 1 | 24 | 0 | 25 |
| form-controls | 0 | 0 | 0 | 20 | 0 | 20 |
| table | 0 | 0 | 4 | 60 | 2 | 66 |
| nav | 0 | 0 | 6 | 37 | 5 | 48 |
| overlay | 8 | 12 | 0 | 11 | 7 | 38 |
| content | 8 | 15 | 0 | 14 | 16 | ~53 |
| **covered** | **16** | **27** | **11** | **166** | **30** | **250** |
| unaudited (17 masters) | ? | ? | ? | ? | ? | ~61 |

**Two thirds of the population (166/250) is off-scale.** That is not noise — §5 shows two combinations inside it that clear the rule of three on both sides and account for 119 of those 166.

### Bindable today, with no rendered change: **zero**

I checked every node's current Figma values against the ten styles. **Not one node matches a ty/* style exactly**, so every binding changes at least the leading. The reason is uniform: the nodes either sit on `lineHeight: AUTO` (which is the face's own metric, never 125% or 150%) or state 125% against a 150% role. AUTO alone accounts for well over 150 of the 250.

The useful split is therefore a different one:

| | nodes | what moves |
|---|---:|---|
| **Bind now — Figma is the only side that moves** | **26** | Figma artwork changes (weight and/or leading), CSS untouched |
| Bind now, contested | 1 | combobox `selected option/Cherry` — exact `ty/action` value, wrong semantics |
| **Bind only after a CSS change** | **69** | the code is the diverging side; see §4 |
| **Must not be bound** | **154** | see §3 |
| covered total | 250 | |

---

## 2. The bind table

One row per master. `→` = bind. Layer paths are as the mappers read them live; **the master names are section-prefixed** (`Form/AtlInput`, `Navigation/AtlStepper`, `Overlay/AtlDialog`, `Display/AtlTable`, `AI/AtlChat`, `Feedback/AtlAccordionGroup`) — a bare-name filter on `findAllWithCriteria` returns nothing, which cost three of the six agents a round trip.

### 2a. Bind now (26 nodes, no CSS change)

| Master | Layer path | → style | Nodes | Figma today | Evidence |
|---|---|---|---:|---|---|
| `Navigation/AtlPagination` | `page-btn/{1,4,6,10}` | **ty/control** | 4 | Regular 14 / AUTO | atl-pagination.css:33 `all:unset`, :48 size-sm, :49 medium; family/leading inherit from :13/:18 |
| `Navigation/AtlTabGroup` | `tablist/tab/*` — the **unselected** labels only (default sel=0: Notifications, Billing; default sel=1: Account, Billing; pills sel=0: Notifications, Billing) | **ty/control** | 6 | Regular 14 / AUTO | atl-tabs.css:37 `all:unset`, :46 tight, :51 sm, :52 medium; `.is-active` :75-77 sets colour only. The selected tab in each variant is already on ty/control — this removes a weight distinction the CSS does not have. |
| `Overlay/AtlToast` | `<variant>/Frame/Action completed.` | **ty/body-sm** | 8 | Regular 14 / AUTO | atl-toast.css:68 `font: var(--ui-type-body-sm)`; `.message` :105-107 adds only `flex:1`. The single safest binding in the whole population, and ADR-0074's own text named it as prose and then left it. |
| `AI/AtlChat` | `msg-asst-2-text` (drawer); `m1t…m4t` (popup); `m1t…m3t` (inline) | **ty/body-sm** | 8 | Regular 13 / 12 / 14, AUTO | atl-chat.css:239 size-sm, :240 line-height normal — both stated on `.atl-chat-message`. Sibling `AtlChatMessage` instances in the same variant already carry ty/body-sm. |

### 2b. Bind now, contested (1 node)

| Master | Layer | → style | Nodes | The disagreement |
|---|---|---|---:|---|
| `Form/AtlCombobox` | `panel/selected option/Cherry` | ty/action? | 1 | atl-combobox.css:187-189 semibold over :170 tight + :174 md = **byte-for-byte `--ui-type-action`**. But tokens.css:132-134 names action "the primary affordance"; a selected list row is not one. **Recommendation: do not bind. Fold it into `ty/row` (§5A) with its eight sibling rows and let `.is-selected` be a weight override the style does not carry** — otherwise one row in a list is bound to a different role than the eight around it. |

### 2c. Bind after the CSS change named in §4 (69 nodes)

| Master | Layer path | → style | Nodes | Blocking CSS change |
|---|---|---|---:|---|
| `Navigation/AtlStepper` | `header/step-{1,2,3}/circle-*/{1,2,3}` (8 variants) | ty/control | 21 | C6 — drop `.step-circle` semibold to medium |
| `Navigation/AtlBreadcrumbItem` | `breadcrumb-current/Current` | ty/control | 1 | C6 — drop `.breadcrumb-current` semibold to medium |
| `Navigation/AtlTabGroup` | `tabpanel/*` | ty/body-sm | 3 | C4 — panel must state a size and normal leading |
| `Navigation/AtlPagination` | `ellipsis/*` | ty/control | 2 | C7 — `.ellipsis` must state medium |
| `Overlay/AtlTooltip` | `<pos>/Helpful tip text` | ty/label | 4 | C5 — resolve nowrap-vs-wrap first; see §5E |
| `Overlay/AtlDrawer` | `dialog/header/<title>` | ty/title | 7 | C1 — adopt `font: var(--ui-type-title)` |
| `Overlay/AtlDialog` | `<size>/Frame/Are you sure…` | ty/body-md | 5 | C3 — state the size on `.atl-dialog` |
| `Overlay/AtlDrawer` | `dialog/content/Drawer content.…` | ty/body-md | 7 | C3 |
| `Display/AtlCard` | `card-content/Card body text.…` | ty/body-md | 12 | C3 |
| `Feedback/AtlAccordionGroup` | `atl-accordion-item/accordion-panel/*` | ty/body-sm | 3 | C3 (this is the master the brief named) |
| `AI/AtlChat` | `drawer-title` / `pop-title` / `chat-title` | ty/action | 3 | C2 — `.title-block` must state tight |
| `AI/AtlChat` | `fab-glyph` | ty/title | 1 | C8 — `.fab-bubble` must state family + tight |

*Note on the already-bound `Overlay/AtlDialog` header ×5 (ty/title):* it is bound and stays bound — but only C1 makes the binding true. Today it is 2px **and 25 leading points** away from what the CSS renders.

### 2d. Masters with nothing to bind

`Form/AtlInput`, `Form/AtlSelect`, `Form/AtlCheckbox`, `Form/AtlRadio`, `Form/AtlRadioGroup`, `Form/AtlToggle`, `Form/AtlOption`, `Navigation/AtlMenu`, `Navigation/AtlMenuItem`, `Display/AtlTd`, `Display/AtlTable`, `Display/AtlTbody`, `AI/AtlChatMessage` — all pending §5A/§5B, or excluded by §3. `Form/AtlTextarea` is **already fully bound** (5/5 on ty/body-md, matching `font: var(--ui-type-body-md)` at atl-textarea.css:18); ADR-0074 §3's fix holds and there is nothing to do.

---

## 3. The nodes that must NOT be bound

### R1 — A control's own value text: carved out by ADR-0073 (16 nodes, never)

`tokens.css:136-139` states it: *"A control's own VALUE text (an input's content) is not one of these — that stays a longhand, because its padding formula names the leading as an operand (ADR-0073)."*

`Form/AtlInput` ×5, `Form/AtlSelect` ×5, `Form/AtlCombobox input/*` ×6. All resolve Instrument Sans Regular 16 / 1.25 (atl-input.css:29 `font-size:inherit` → :18 md, :33 tight; atl-select.css:57-58 → :14/:19, :47 tight; atl-combobox.css:73-74 → :40/:45, :65 tight).

**Caveat the carve-out does not cover:** the carve-out is a rule about the *CSS* keeping longhand where a `calc()` needs the leading. It is not a rule about the Figma node. If `ty/row` is minted (§5A), these 16 nodes could carry it while the CSS keeps its longhand — exactly as `.atl-select label` writes longhand today for a combination ty/control names. **Decide this explicitly rather than inheriting it.**

### R2 — No code counterpart (≈20 nodes, never)

| Node | Why | Evidence |
|---|---|---|
| `AI/AtlChat` scenery: `nav-link-1..4`, `breadcrumb`, `page-h1`, `side-1-title`, `side-2-title`, `side-1-i1..i4`, `side-2-l1..l3` (15) | app chrome drawn to show the chat in context; no library CSS renders a nav, breadcrumb, h1 or sidebar | atl-chat.tsx renders only surface/header/messages/message/typing/suggestion/input; full 484-line atl-chat.css has no matching rule |
| `AI/AtlChat/min-icon` (1) | the component has no minimize affordance | atl-chat.tsx:198-214 = `.title-block` + one `.close-btn`; grep for minimize returns nothing |
| `Navigation/AtlStepper` `!` glyph (1) | React renders `<AtlIcon name="close" size="sm" />`, not a character | atl-stepper.tsx:172-173 |
| `Navigation/AtlBreadcrumbItem/_separator/separator-glyph` (1) | `::after` pseudo-element — there is no DOM text node to bind | atl-breadcrumbs.css:47-53; and the character is wrong too: tsx:19 defaults `separator='/'`, so the `'›'` at :48 is a dead fallback |
| `Display/AtlTbody/…/AtlCheckbox/Accept terms` (2) | **`visible: false`, inside a `visible: false` frame**, and atl-table.tsx:123-127 renders `<AtlCheckbox />` with no children, so no label text exists in the DOM | *(skeptic override of a mapper who classified these as control at 16px — the refutation is right; the mapper was describing a checkbox that is not the one in the table)* |

These should be **removed from the 311 denominator**, not carried as classified nodes.

### R3 — Nested INSTANCE descendants whose master owns the type (≥8 nodes, never bind at the instance)

`Display/AtlTbody/tr/td/Cell value` ×6 (instances of `Display/AtlTd`); `AI/AtlChat`'s `code-block-instance/header/*` ×2 (instances of `Display/AtlCodeBlock`); the send-button / new-chat-button / user-avatar instances. Binding here is an override that fights the master.

**Related Figma defect, and it inflates the 311:** `AI/AtlChat`'s popup send-button and inline new-chat-button are instances of `Action/AtlButton size=sm`, whose master text **is** bound to ty/control — yet both instances report `textStyleId === ''`. The skeptic proved this is a genuine per-instance detach by reading `instance.overrides`, which lists `textStyleId` as overridden on all four button instances (and confirmed the mechanism works normally elsewhere: the code-block instances inherit `ty/code` from their master). **Clearing an override is a different operation from binding a style**, and at least two of the 311 are this.

### R4 — Italic (1 node, never with the current ten styles)

`AI/AtlChatMessage role=system` — Instrument Sans **Italic** 14/150%, from atl-chat.css:257-260 `font-style: italic` over :239/:240. The only italic among the ten styles is ty/display (Instrument Serif 36), wrong on family, size and weight. Binding ty/body-sm would kill the italic. *(Figma hygiene, separate ticket: the layer is named "Conversation cleared." but its characters read "How do I theme AtlButton?" — the variant no longer demonstrates a system message.)*

### R5 — Unknown: no selector renders it (7 nodes)

`Overlay/AtlDrawer/dialog/footer/Frame/Save` ×7. `.atl-drawer-footer` (atl-drawer.css:225-233) declares layout only; the footer is a slot; the story puts a **bare `<button>`** there (atl-drawer.stories.tsx:62-63), which the UA styles at ~13.33px Arial and which inherits no font at all. The mapper called this `control` and offered ty/action citing `.atl-button.size-md` while pointing at a **32px** frame — the skeptic is right that at the drawn geometry the relevant rule is `.atl-button.size-sm` (atl-button.css:116-117), which resolves **SemiBold 14 / tight**, a fourth combination matching neither ty/control (Medium 14) nor ty/action (SemiBold 16). Classify `unknown`, decide the composition question first (see C9).

### R6 — Pending a role decision (≈119 nodes, not *yet*)

The `ty/row` and `ty/row-sm` populations of §5A and §5B. These are not "must never" — they are "must not until someone writes the decision down". They are the bulk of the 154.

---

## 4. The CSS-side changes

Nine, ordered by how much they unblock. Each names a direction and its cost.

### C1 — The dialog/drawer headers: SemiBold 20/1.5 vs ty/title 18/1.25 *(the brief's first question)*

**What is true.** Neither header states a line-height, so both inherit `1.5` from their roots — dialog: atl-dialog.css:153-154 header vs :36 root; drawer: atl-drawer.css:210-211 vs :32 (through `all: unset` at :38). Resolved: **SemiBold 20 / 1.5**. ADR-0074 recorded a 2px gap; it is 2px **and 25 leading points**. `--ui-font-size-xl` is used by exactly these two rules in the whole React library.

**Rule of three:** CSS side 2 (fails). Figma side: 5 dialog nodes bound to ty/title at 18/125%, 7 drawer nodes at Regular 16/AUTO — **zero faithful nodes** (fails). Neither side can earn a role. **The CSS is the diverging side.**

**Recommendation:** replace the two longhands with `font: var(--ui-type-title);` (keeping the `letter-spacing` line *after* it — `font:` is a shorthand and resets what precedes it) in `.atl-dialog-header` and `.atl-drawer-header`, all three frameworks. Then bind the 7 drawer nodes to ty/title.

**Cost, and it is not small.** This would be `--ui-type-title`'s **first use in any stylesheet** (verified: zero hits). It shrinks both headers 20→18 and tightens 1.5→1.25, which changes the header band's height. Both bands have derived padding (`--ui-spacing-5`/`-6` at drawer:208, dialog:151) that `check:geometry` measures, and tokens.css:68-70 explicitly exempts "the card/dialog/drawer/chat headers" from the row recipe as "one-off bands with their own padding". **Re-measure both bands under `check:geometry` before and after.** This is an ADR (0078), not a patch.

*Alternative rejected:* keep 20px and mint SemiBold-20/tight. Two CSS rules and zero faithful Figma nodes — it fails the rule of three worse than C1 does, and it would force the 5 already-bound dialog nodes to be **un**bound.

### C2 — `.atl-chat-header .title-block` is 25% off a role it was already counted for

atl-chat.css:180 size-md, :181 semibold, **no line-height** → inherits 1.5 from `.atl-chat`:38. tokens.css:129-130 already counts "chat header title" as one of the three rules that justified minting `action`, and tokens.css:132-134 records that action is tight. The rule is 25% off the role its own token comment cites it as evidence for.

**Direction:** `font: var(--ui-type-action)` on `.atl-chat-header .title-block` (react :176-186, angular :163-172, vue). **Cost:** near zero — it supplies the missing leading and changes nothing else. Then bind the 3 chat titles (which also move 15px → 16px; 15 is off-scale and drawn by no CSS).

### C3 — Four slots state a family and a leading but no size *(the brief's `.atl-accordion-group` question, and it is not alone)*

| Selector | States | Missing | Nodes |
|---|---|---|---:|
| `.accordion-panel` (atl-accordion.css:141-143) | overflow only; family :20 + leading :25 from the group root | **font-size** — the file's only `font-size` is `.accordion-trigger`:94 | 3 |
| `.atl-card-content` (atl-card.css:89-93) | colour, `line-height: normal` | **font-size** — `.atl-card` states none; only `.atl-card-header`:82 does | 12 |
| `.atl-dialog-content` (atl-dialog.css:160-166) | nothing typographic; `all: unset` at :23 makes size **and weight** inherits | **font-size, font-weight** | 5 |
| `.atl-drawer-content` (atl-drawer.css:217-223) | nothing typographic; `all: unset` at :38 | **font-size, font-weight** | 7 |

There is no base to inherit from: `grep -rnE '(^|\})\s*(html|body)\s*[,{]' libs --include='*.css'` returns nothing, and the only shell rule in the repo (`libs/react/.storybook/preview-head.html:24-29`) sets family only. **So these 27 nodes render at the consuming page's size — 16px in a default browser.**

**Here the mappers and skeptics disagree head-on, and the skeptics are right.** Three mappers recommended `font: var(--ui-type-body-sm)` on the slot wrappers *because Figma draws 14*. That inverts the task's own rule. What the CSS as shipped renders is **Instrument Sans / 400 / 16 / 1.5 = `--ui-type-body-md`, a role that already exists** — and one mapper's own `resolved` block said "16px in a default browser, i.e. body-md today" before recommending the opposite.

**Direction:** state the size **on the component root**, next to the leading each root already states (the ADR-0049/0052 "state it once on the root" pattern these files' own comments cite) — `.atl-dialog`, `.atl-drawer-host dialog`, `.atl-card`, `.atl-accordion-group`. Then bind: dialog 5 + drawer 7 + card 12 → **ty/body-md**; accordion 3 → **ty/body-sm** only if the accordion is deliberately the one 14px prose surface, otherwise body-md with the rest.

**Do not put a `font:` shorthand on the slot wrapper.** `.atl-dialog-content` renders only `{children}` (atl-dialog.tsx:176-183); a shorthand there silently resizes every slotted `<h3>`, `<code>` and `<small>` a consumer passes in. And `check:typeface` gives no protection — `isRootSelector('.atl-dialog-content')` returns **true** (check-typeface.js:68-73: one compound selector, no combinator), so the gate would treat a slot wrapper as a root.

**Cost:** the Figma side moves 14 → 16 on 27 nodes, which is a visible redraw of four masters. If the team genuinely wants a 14px dialog body, that is a deliberate change to the component's prose size and needs its own ADR — but it must be argued, not smuggled in as "make the CSS say what Figma draws".

### C4 — `[role="tabpanel"]` inherits chrome leading for prose

atl-tabs.css:103-105 declares **padding only**. Panel copy therefore inherits `line-height: tight` from :18 — whose own comment (:14-17) says it is for "single-line chrome" — and takes its size from the host page, because `.atl-tab-group` states no `font-size` anywhere. Identical in all three frameworks (vue :103-105, angular atl-tabs.ts:162-164), so it is a shared design defect, not drift.

**Direction:** add `font-size: var(--ui-font-size-sm)` and `line-height: var(--ui-line-height-normal)` to the panel rule in all three. **Cost:** low; panels get taller. Then bind 3 nodes to ty/body-sm.

### C5 — `.atl-tooltip` contradicts itself

atl-tooltip.css:36-38 sets `font-size: xs` + `line-height: normal`, then :43-44 sets `max-width: 20rem; word-wrap: break-word;` **and `white-space: nowrap`** — nowrap defeats both. React and Vue have the nowrap; **Angular does not** (its rule is :12-28, no `white-space`), so the same tooltip wraps in one framework and cannot in the other two. *(The mapper asserted "Angular parity"; it does not hold.)*

**Direction:** decide what a tooltip is before deciding its type. If it wraps (which `max-width` + `word-wrap` say the author intended), **drop `white-space: nowrap` from React and Vue**, keep Regular 12 / 1.5 — and see §5E, where that combination is one CSS rule short of a role. If it is single-line chrome, lead it tight and adopt `font: var(--ui-type-label)`, then bind the 4 nodes to ty/label. **Cost of the label route:** it changes the rendered weight Regular → Medium in all three frameworks and on 4 Figma nodes. **Recommendation: fix the nowrap contradiction as its own bug first; it is a three-framework divergence independent of type.**

### C6 — SemiBold-14-tight on chrome: the CSS is the side that moves

Three sites lead a *chrome* element SemiBold 14/tight: `.step-circle` (atl-stepper.css:68), `.breadcrumb-current` (atl-breadcrumbs.css:82), `.step-item.is-active .step-label` (atl-stepper.css:129-132).

The third is **not an open question** — ADR-0074 already decided it against the CSS. A read-only resolution of every bound `textStyleId` in `Navigation/AtlStepper` returns `header/step-{1,2,3}/text/{Account,Profile,Review} → ty/control` in **all 8 variants, including the active step's**. Figma distinguishes the active step by colour only. *(This refutes a mapper who counted it as a third undecided site and deferred the whole cluster to a cross-group tally — a tally that could never reach three on the Figma side, where this combination has exactly one faithful node.)*

**Direction:** change `semibold` → `medium` at atl-stepper.css:68, atl-stepper.css:131 and atl-breadcrumbs.css:82 (plus the byte-identical Vue lines and Angular's `:host(.atl-breadcrumb-item.is-current) a` at :74-77 and its stepper equivalents). Then bind 21 stepper numerals + 1 breadcrumb current to ty/control. **Cost:** loses the semibold "you are here" emphasis — but that is not a new design call, it is the call Figma already made and ADR-0074 already recorded. If the emphasis is wanted, it needs its own ADR *and* reopens the active step label.

### C7 — `.ellipsis` should match the buttons it sits between

atl-pagination.css:90-98 sets `font-size: sm` but no weight, so it renders 400 between two 500 siblings. **Direction:** add `font-weight: var(--ui-font-weight-medium)`. **Cost:** trivial. Then bind 2 nodes to ty/control.

### C8 — Five chat controls render in the UA font

`.action-btn` (atl-chat.css:430), `.fab-bubble` (:118), `.close-btn` (:188), `.chip` (:345) and `.field` (:397, which states a leading but no family) are `<button>`/`<textarea>` elements that state **no `font-family`**. The UA `font` shorthand supplies family and `line-height: normal` and is not overridden by inheritance, so these render in the UA control font — not Instrument Sans. `.atl-button` states its family (atl-button.css:18); `libs/react/src/styles/` contains only `tokens.css`, so no reset rescues them. Every other component in the repo that puts text in a form control compensates explicitly (`font: inherit` / `font-family: inherit` at input:30, textarea:26, select, combobox, code-block:73, menu:90) — atl-chat.css simply omits it.

This is an ADR-0035/ADR-0049 violation in five selectors, and the chat root's own comment (atl-chat.css:29-33) says it exists to prevent exactly this. **Direction:** state `font-family: var(--ui-font-family)` and the intended leading on all five. **Cost:** trivial; unblocks `fab-glyph` → ty/title.

### C9 — Hand-drawn buttons: AtlCard, AtlDialog **and AtlDrawer** *(the brief's second question)*

ADR-0074 recorded AtlCard and AtlDialog drawing buttons by hand at Medium 14. **AtlDrawer does it too, and worse:** the footer is a `FRAME` (fill #006470, r8, pad 8/16, h32), not an INSTANCE, and `Cancel` got ty/control while `Save` was left at Regular 14 — the two halves of one button pair now disagree.

`.atl-button` is **semibold at every size** (atl-button.css:20). So no hand-drawn Medium or Regular label can ever match it, and `ty/control` (Medium 14) is a weight `.atl-button` produces at no size. `.atl-card-footer` (atl-card.css:95-101) states no typography at all, so there is nothing in the card CSS to change: **the fix is a Figma instance swap, not CSS.**

**But the swap cannot be done yet.** The `Action/AtlButton` master's own `size=md` and `size=lg` Button texts are **unbound and Medium** where the CSS is SemiBold. Swapping in an instance today reproduces the same error one level down. And at the drawn 32px geometry the relevant rule is `.atl-button.size-sm`, which resolves SemiBold **14**/tight — a combination matching neither role.

**Direction, in order:** (1) repair the `Action/AtlButton` master's size axis against `.atl-button` (SemiBold at md/lg; and decide whether `size-sm`'s SemiBold 14 is a fourth control combination the button legitimately owns or a bug in the button's size ladder); (2) swap the hand-drawn footer frames in AtlCard, AtlDialog and AtlDrawer for `Action/AtlButton` instances; (3) the text nodes then disappear into the instances and the question is settled by the button master. **Cost:** re-draws three masters' footers and re-measures button geometry (the Figma frames pad 16px inline; atl-button.css:115 pads 14px). This is ADR-0068 work, and `Action/AtlButton` was in none of the six groups.

### Additional CSS defects found in passing (fix independently of typography)

| Defect | Evidence |
|---|---|
| **`.atl-tbody-empty-cell`'s `font-size` is dead.** Specificity (0,1,0) vs `.atl-table.size-md tbody td` (0,2,2) at :103-108. The empty message renders 14px, never the 16px written. The same rule's `padding` (:248) and `background-color` (:251) carry `!important` for exactly this reason — `font-size` was missed. Reproduced identically in Angular (:230-236 vs :85-90) and Vue: a shared defect, not drift. | verified by reading atl-table.css |
| **Angular's combobox readonly rule is dead.** atl-combobox.css:206 targets `.atl-combobox-input`; the template emits `class="combobox-input"` (atl-combobox.ts:45) and every other rule was renamed (:35,:65,:69,:73-74,:79,:83,:93). A readonly Angular combobox keeps its interactive border and text cursor. ADR-0045 violation in one framework. | |
| **`.radio-text` is styled nowhere.** Emitted by React (atl-radio.tsx:56) and Vue (atl-radio.vue:64), no CSS rule anywhere; Angular projects `<ng-content/>` bare and emits no such span. No effect today, but any future rule on `.radio-text` silently skips Angular. | |
| **Angular's stepper omits `--step-circle` and `--step-connector-width`** (`:host` at :11), which React and Vue declare (:15-16), then references them at :38, :56-57, :186. The Angular step circle has no explicit size. Same class as the `<atl-option>`-had-no-styles defect. | |
| **`.atl-select label` writes ty/control longhand.** atl-select.css:25,27 (React and Vue). Migrating it to `font: var(--ui-type-control)` would make it measurable by ROOT-PAINT's `font:` branch — and Angular has no `label` rule and no `label` input at all, so one of the six witnesses ADR-0074 cited for minting `control` exists in only two of three frameworks. | |
| **Angular's drawer shares one `styleUrl` across four components** (atl-drawer.ts:69/:146/:164/:177), so the unqualified `:host` at :15-22 lands directly on each sub-component host. Same resolved values as React, **different mechanism** — two mappers reported "identical" without checking. | |
| **Angular's toast container states no font-family** (atl-toast-container.css:3-12) where React and Vue do (:23). Harmless (the toast host restates the shorthand) but ADR-0049 asks each root to state it. | |
| **Angular `AtlTable` is `ViewEncapsulation.None`** (atl-table.ts:80) while its five siblings are emulated, all loading the same sheet. Cascade outcome unchanged today; latent trap if `None` is ever removed. | |

---

## 5. The off-scale combinations

Rule of three applied on **both** sides. "Faithful Figma nodes" = nodes that already state the resolved value; "total" includes nodes that state a wrong value for the same rendered element.

### A. Instrument Sans **Regular 400 / 16px / 1.25** — the row / control text at default size

**CSS sites (10):** `.atl-checkbox label` (:14+:33) · `.atl-radio` (:20+:18) · `.atl-toggle label` (:14+:33) · `atl-option [role='option']` (:48+:45) · `.atl-combobox-option` (:174+:170) · `.atl-menu-item` via `.atl-menu`:36 (+:94) · `.atl-table.size-lg tbody td` (:114+:87) · `.atl-input input` (:29→:18, :33) · `.atl-select select` (:58→:19, :47) · `.atl-combobox-input` (:74→:45, :65). Three of those (the last three) are the ADR-0073 value-text carve-out; **seven remain even after excluding them.**

**Figma nodes: 64 total, 27 already faithful** — AtlRadio 4 (16/AUTO), AtlOption 3 (16/**125%**, an exact match on every axis), AtlMenu default 6 (16/125%), AtlMenuItem 2 (16/125%), AtlTable lg 12 (16/AUTO). Plus 37 that state 14 against a CSS that resolves 16.

**Verdict: EARNS A ROLE. 10 CSS sites (7 excluding the carve-out) × 27 faithful nodes — the threshold is met on both sides today, several times over.** Three separate agents each hit this combination in their own group, concluded "the rule of three cannot be judged from here", and handed it up. Tallied across all six, it is not close.

**Recommendation:** mint `--ui-type-row` = `var(--ui-font-weight-normal) var(--ui-font-size-md) / var(--ui-line-height-tight) var(--ui-font-family)` and the matching `ty/row` Figma style, then bind all 64 nodes (correcting 37 of them 14 → 16 first, subject to §6's variable-collection blocker). The value-text sites keep their CSS longhand — the carve-out is about the `font:` shorthand and the padding `calc()`, not about the Figma style.

**The 14-vs-16 drift this exposes is the largest single Figma-side defect in the population.** Figma contradicts *itself* 3–2 on it inside form-controls alone (Checkbox/Toggle/RadioGroup at 14; Radio/Option at 16) — most sharply between `AtlRadioGroup` and `AtlRadio`, which draw the same rendered element. The CSS is unanimous across 5 components × 3 frameworks. AtlTextarea is the precedent: ADR-0074 fixed exactly this there and the fix held.

### B. Instrument Sans **Regular 400 / 14px / 1.25** — the compact row / table cell

**CSS sites (5):** `.atl-table.size-md tbody td` (:107+:87) · `.atl-tbody-empty-cell` as *rendered* (:250 loses to :107) · `.ellipsis` (atl-pagination.css:97) · `.atl-menu.variant-compact .atl-menu-item` (:46+:55) · `.atl-breadcrumb-item .breadcrumb-link` (`.breadcrumbs-list`:36 + `.atl-breadcrumbs`:25).

**Figma nodes: 55 total, 16 already faithful at 14/125%** — AtlTd 3, AtlTbody td 6, AtlMenu compact 6, breadcrumb link 1. Plus AtlTable md 36 (14/**AUTO**) and ellipsis 2 (14/AUTO).

**Verdict: EARNS A ROLE. 5 CSS sites × 16 faithful nodes.** Mint `--ui-type-row-sm` = `normal / sm / tight / family` and `ty/row-sm`.

**This settles the table-ladder objection a skeptic raised and the mapper could not answer.** `.atl-table.size-{sm,md,lg} tbody td` (:96-115) is one construct on one size ladder over the same tight leading at :87. Treating the md rung as "decide" and the lg rung as "leave" would give one rung a role and its neighbours none. With `ty/row` (A) and `ty/row-sm` (B) minted, the ladder resolves in one stroke: **sm → ty/label is wrong and must be re-decided** (the 12 already-bound `size=sm` cells carry ty/label = Medium 12, where `.atl-table.size-sm tbody td` resolves **Regular** 12 — a weight divergence ADR-0074 *introduced*), **md → ty/row-sm**, **lg → ty/row**. That leaves Regular-12-tight as a third rung with 1 CSS site — below threshold; either give the sm table a Regular-12 role once other evidence accumulates, or accept that the smallest rung stays raw.

### C. Instrument Sans **SemiBold 600 / 14px / 1.25**

**CSS sites: 4** — `.step-circle`, `.breadcrumb-current`, `.step-item.is-active .step-label`, `.atl-button.size-sm`. **Faithful Figma nodes: 1** (`breadcrumb-current/Current`).

**Verdict: fails on the Figma side, and unreachably so** — even a whole-file tally cannot produce two more faithful nodes, because ADR-0074 already bound every candidate to ty/control. **Snap to ty/control; the CSS moves (C6)** for the three chrome sites. `.atl-button.size-sm` is *not* covered by that: a button is an action, and `.atl-button`'s deliberate semibold-at-every-size means its size axis crosses the role scale. That is a fourth combination the button genuinely produces, and it needs its own decision (C9), not a snap.

### D. **SemiBold 20 / 1.5** — 2 CSS rules, 0 faithful Figma nodes → **fix the source** (C1). See §4.

### E. **Regular 12 / 1.5** — the tooltip

**CSS sites: 2** — `.atl-tooltip` (:37-38) and `.atl-chat-suggestion .chip-hint` (atl-chat.css:379-381). *(A mapper surveyed all `--ui-font-size-xs` rules and reported the tooltip as the only one at normal leading; the skeptic caught the error and I re-verified it: `.atl-chat-suggestion` at :341-343 declares **only `display: block`** — no leading — so `.chip-hint` inherits `1.5` from `.atl-chat`:38, whose comment reads "This one carries prose, so normal". Two rules, not one. The mapper's dismissals of stepper:102/:108 and table:61/:100 are correct — both roots are tight.)*

**Faithful Figma nodes: 4** (tooltip, at exactly Regular 12/150%).

**Verdict: one CSS rule short. Do not mint.** And do not "leave" either — the task's rule allows only snap-or-fix. **Fix the source first (C5):** resolve the nowrap contradiction, and give `.atl-chat-suggestion` a leading, since stating none on a component root is itself an ADR-0049 defect. Re-count after. If tooltips stay single-line chrome, snap to `ty/label` and move the CSS.

### F. **JetBrains Mono SemiBold 12 / 1.25** — `.code-block-label` (atl-code-block.css:51-53 + :43). 1 CSS site; 2 Figma nodes, both at Mono **Bold** 12/AUTO (wrong weight as well). `ty/code` is Mono Regular 14/165%. **No role. Fix the Figma weight Bold → SemiBold; leave unbound.** Owned by `Display/AtlCodeBlock`, one of the 17 unaudited masters.

### G. **SemiBold 12 / line-height 1** — avatar initials (`.atl-avatar.size-sm .initials`, atl-avatar.css:32/:40/:58-60). `line-height: 1` is glyph centring, not a type role. **Never bind.** And the existing binding is wrong: the one `Display/AtlAvatar` instance in AtlChat carries `ty/label` (Medium 12/125%) against a CSS that resolves SemiBold 12/1 — wrong on both weight and leading. Correct or clear it.

### H. The off-scale Figma *sizes* the brief flagged — 10, 13, 15, 20, 26px

| px | Where found in these 26 masters | Written by any CSS? | Verdict |
|---:|---|---|---|
| 13 | `AI/AtlChat` nav-links (scenery), `msg-asst-2-text` | no | drawing error → 14 (or delete as scenery) |
| 15 | `AI/AtlChat` drawer-title / pop-title / chat-title | no | drawing error → 16 (C2) |
| 20 | `AI/AtlChat/fab-glyph` (CSS says 18) | **yes**, twice: the two headers (C1) | Figma glyph → 18; CSS headers → 18 |
| 26 | `AI/AtlChat/page-h1` (scenery) | no | delete as scenery |
| 10 | **not found in these 26 masters** | — | must be in the 17 unaudited masters; unresolved |

**Every off-scale size in these six groups except 20px lives inside `AI/AtlChat`'s hand-drawn mockups.** That master's three variants are flat drawings — every layer a direct child of the variant COMPONENT, with only a handful of real INSTANCEs. It is the single largest contributor to the off-scale count and to the unbound count, and the durable fix is to compose it from existing masters, not to bind 30 layers of a drawing.

---

## 6. New gate work

### `[TEXT-UNSTYLED]` — **warning only today. Not writable as a blocker.**

The arithmetic decides it: 311 unbound, of which 26 are bindable now, 69 after CSS changes, and **154 must not be bound**. A blocker needs an allowlist covering all 154 plus the ~61 unaudited nodes — an allowlist longer than the set it protects, and one that will churn as §5A/§5B land. Ship it as a warning, promote it after (i) `ty/row` and `ty/row-sm` are minted and bound, (ii) the 17 unaudited masters are mapped, (iii) `AI/AtlChat`'s scenery is lifted out.

**What goes in the allowlist — two structural rules and one short named list, not 154 node ids:**

1. **Skip TEXT nodes whose ancestor chain contains an `INSTANCE`.** The master owns the type; a style on an instance descendant is an override fighting its master. This alone removes AtlTbody's 6 cell values, AtlChat's code-block/button/avatar instance texts, and every future nested case. *Corollary:* the gate must then separately flag an instance whose `overrides` array contains `textStyleId` — the detached-style defect at `AI/AtlChat`'s two size=sm buttons, which today reads as "unbound" and inflates the 311.
2. **Skip invisible nodes and nodes inside invisible frames.** Removes AtlTbody's 2 hidden checkbox labels.
3. **Named list (≈20 today):** `AI/AtlChat` scenery ×15 and `min-icon` — with a comment that these are pending removal, not permanently exempt; `Navigation/AtlStepper` `!` (renders as an icon); `Navigation/AtlBreadcrumbItem` `separator-glyph` (`::after`, no DOM node); `AI/AtlChatMessage` role=system (italic, no italic sans role).

Value text (R1) does **not** belong in the allowlist — it belongs in the `ty/row` decision.

### `[NO-SIZE]` — **yes, add it to `check:typeface`, as a warning first**

Five roots/slots state a family and a leading but no size (C3, plus `.atl-tab-group` which states neither size nor a prose leading), and 30 Figma nodes hang off them. `[NO-TYPEFACE]` and `[NO-LEADING]` exist for exactly this failure mode; size is the third axis of the same omission, and it is the one that has silently made four masters' prose render at the consuming page's size.

Two design constraints on the check:
- **It needs a delegation escape.** `.atl-radio-group` (atl-radio-group.css:11-19) legitimately states no size because `.atl-radio`:20 supplies it. So: warn when a root states a family or a leading and neither it nor any descendant rule in the same file states a `font-size`.
- **`isRootSelector` must stop treating slot wrappers as roots.** `.atl-dialog-content`, `.atl-drawer-content`, `.atl-card-content` and `.accordion-panel` all pass check-typeface.js:68-73 (one compound, starts with `.atl-`), so the gate would both miss a missing size on the real root and accept a `font:` shorthand on a slot. Structural detection by combinator is not enough; the check needs a per-component root name.

### Two live defects in `check:figma` that must be fixed **before** any binding pass

1. **ROOT-PAINT's `font-size` comparison is structurally dead for `inherit` leaves.** `lengthOf` returns `null` for `inherit` (check-figma.js:1590), that null flows through `boxFromDeclarations` into `want.fontSize`, and the comparison at :927 is guarded by `want.fontSize !== null` — so it silently never runs. The cascades for AtlInput, AtlTextarea and AtlSelect are single-selector (`['.atl-input input']`, etc., :487-489) and **all three say `font-size: inherit`.** Their type has therefore never been measured. Fix: walk `inherit` up the cascade, or prepend the component root (`['.atl-input', '.atl-input input']`), which the joined-body logic at :1057 already handles.
2. **Eleven masters' type is never compared at all, and the exclusion is for the wrong reason.** `ROOT_PAINT` (30 entries) excludes AtlCombobox, AtlCheckbox, AtlRadio(Group), AtlToggle, AtlProgress, AtlTable, AtlBreadcrumbs, AtlPagination, AtlStepper, AtlAvatarGroup and AtlChat — and the comment at :475-481 gives a *paint* reason ("the paint sits on an inner box while the Figma root is a transparent container"). **Type does not need the root box to be the painted box.** The type comparison should be split out of `ROOT_PAINT` into its own per-layer map so those eleven masters get measured. AtlCombobox alone accounts for 15 nodes whose 14-vs-16 and AUTO-vs-125% divergences no gate has ever seen.

### Two new checks the evidence justifies

3. **`[FIGMA-AUTO-LEADING]`** — a TEXT node on `lineHeight: AUTO` whose CSS states an explicit leading. Well over 150 of the 250 covered nodes are in this state (all 15 combobox, 48 AtlTable body cells, 21 stepper numerals, 8 toast, 21 drawer, 12 card, 17 form-control, 9 tab…). AUTO is never right when the CSS states a leading, and it is the reason zero nodes can be bound without a rendered change. **This is the cheapest, highest-volume win available and it requires no role decisions.**
4. **`[FIGMA-VARIABLE-COLLECTION]`** — and this one is a blocker on §5A's execution. A page-wide read-only count found **216 of 755 TEXT nodes bind `fontSize` to a variable from `Docs Brand Tokens` (VariableCollectionId:3:120)** while binding colour to `Library Tokens` (877:371); 201 use library variables and 338 have no size binding. **None of the "correct the Figma size 14 → 16" recommendations in this document is executable as a plain edit** — the value comes from the wrong collection. This is systemic, not per-node, and deserves ADR-0079 of its own. It is also unresolved whether applying a text style clears an existing `fontSize` variable binding or the binding wins; nobody could determine that without mutating the document.

---

## 7. Verified vs assumed

### Verified

| Claim | How |
|---|---|
| Only 4 component stylesheets reference any `--ui-type-*` role; `--ui-type-title/-control/-action/-label/-display/-headline/-body-lg` are used by **zero** | I ran the grep this session |
| Every resolved cascade in §2–§5, with file:line, in React | each read by a mapper and independently re-derived by a skeptic from the files |
| The ADR-0073 value-text carve-out text at tokens.css:136-139 | I read it this session |
| `.atl-tooltip` carries `max-width: 20rem; word-wrap: break-word` **and** `white-space: nowrap` | I read atl-tooltip.css:29-48 this session |
| `.atl-tbody-empty-cell`'s `font-size` loses (0,1,0) vs (0,2,2) | I read atl-table.css:96-116, 244-254 this session |
| `.atl-chat-suggestion` declares only `display: block`; `.chip-hint` therefore inherits 1.5 | I read atl-chat.css:338-384 this session |
| `check-figma.js:1590` returns null for `inherit`; the guard at :927; `ROOT_PAINT` has 30 entries and excludes 11 masters for a paint reason | I read all three regions this session |
| `check-typeface.js:68-73` `isRootSelector` returns true for `.atl-dialog-content` | I read it this session |
| No `html`/`body` base rule anywhere in `libs`; Storybook's shell sets family only | grepped by two independent skeptics |
| React/Vue/Angular typographic parity for table, pagination, tabs, menu, breadcrumbs, toast, tooltip, and the five form controls | `diff` run by skeptics |
| Every Figma value quoted (family, size, leading, `textStyleId`, `boundVariables`, visibility, frame geometry) | read-only `figma_execute` queries by mappers, re-queried by skeptics; **no writes were made by any agent** |
| The Angular divergences: `<atl-option>`'s ownership, the dead readonly selector, the unstyled `.radio-text`, the missing stepper variables, the shared drawer `styleUrl`, `ViewEncapsulation.None` on AtlTable | each read directly in the Angular files |
| `Navigation/AtlStepper`'s active step label is already bound to ty/control in all 8 variants | `textStyleId` resolved to style names read-only |
| The `textStyleId` override on AtlChat's four button instances | read from `instance.overrides` |

### Assumed

| Assumption | Why it matters | Who could falsify it |
|---|---|---|
| **Nobody ran a browser.** Every resolved value in this document is a hand-derived cascade | if any of them is wrong, the binding it justifies is wrong | one Storybook session with DevTools on `.atl-card-content`, `.fab-bubble`, `.action-btn` |
| The consuming document sets no base `font-size` — so the 27 size-unstated nodes resolve to 16px | C3's entire direction (body-md, not body-sm) rests on it. Verified for Storybook and a default browser; **the `docs` app was never checked** | `nx serve docs` |
| A `<button>`/`<textarea>` UA `font` shorthand blocks inherited family and leading | C8's whole premise, and the "UA font" resolutions for `.fab-bubble` and `.action-btn` | standard behaviour, but no stylesheet in the repo states it; the in-repo evidence (six other components explicitly writing `font: inherit`) is circumstantial |
| Resolved `font-weight: 400` on `<input>`/`<select>` from the UA form-control default | affects §5A's weight axis | no rule in any chain declares it |
| **Whether applying a Figma text style clears an existing `fontSize` variable binding** | determines whether any §2 binding is even safe on the 216 wrong-collection nodes | cannot be determined without mutating the document — forbidden here |
| **The `content` group's seven refutations were referenced by index (`R4`, `R5`) but their text was never transcribed into the dossier** | AtlCard, AtlAccordionGroup, AtlChat and AtlChatMessage — 4 masters, ~53 nodes, 21% of the covered population — rest on **unreviewed mapper claims**. I resolved R4/R5 by analogy to the overlay skeptic's identical finding (body-md not body-sm), which is inference, not evidence | re-run that skeptic |
| The AtlChat node count | the mapper says 35 unbound "collapsing to 13 distinct"; the listed rows enumerate 37 nodes across 17 rows; the skeptic says "13 of ~20 distinct are scenery" but the scenery rows total 15 nodes. **Three mutually inconsistent counts** | a fresh census of that one master |
| `Vue` for the content group | never opened; the mapper was scoped to React + Angular | |
| The Figma masters render in Storybook through the composed React components | assumed by every group; nobody ran Storybook | |
| `check:figma`, `check:typeface`, `check:geometry` were **never run** during this analysis | so we do not know which of these divergences already fail a gate today, or which of the recommended CSS changes would break `check:geometry` | run all three before acting on C1 |

---

## 8. The weakest point

**The denominator does not close, and one sixth of the analysis was never adversarially reviewed.**

The task named 311 nodes. Six groups covered 250 across 26 masters. **Sixty-one nodes in seventeen masters were never looked at by anyone** — and they are not obscure leftovers: they include `Action/AtlButton`, whose size axis is the unresolved variable in C9 and whose Medium-vs-SemiBold master defect blocks the only clean fix for the hand-drawn-button question the brief asked me to resolve. I am recommending an instance swap onto a master nobody audited.

Worse, the 250 is soft. `AI/AtlChat` alone reports 35, 37 and "~20 distinct" in three places in the same dossier. And the `content` group's six refutations exist as index references (`R4`, `R5`) with no text attached — so four masters and 53 nodes rest on mapper claims that were reviewed but whose review I cannot read. I reconstructed the likely refutation for card/accordion content by analogy to the overlay skeptic's identical finding on dialog/drawer content. **That analogy is the least-supported inference in this document, and it drives 15 of the 69 CSS-gated bindings.**

Secondarily: the two roles I am recommending in §5A and §5B are the largest claim here, and they were assembled by *me* from counts spread across four groups. No single agent saw the whole tally; three of them each hit the combination, said "I cannot judge the rule of three from inside my group", and handed it up. The CSS site counts I re-verified myself by grep. The Figma faithful-node counts I did not — I aggregated them from the agents' reports. If those 27 and 16 are inflated, the case for minting `ty/row` and `ty/row-sm` weakens, and 119 nodes fall back to "snap or fix the source", which would point in the opposite direction: shrink the components to 14 rather than grow the Figma nodes to 16.

**Cheapest way to close both gaps before acting:** one read-only census pass over all 43 masters that reports, per TEXT node, `{fontName, fontSize, lineHeight, textStyleId, visible, insideInstance, fontSizeBoundVariableCollection}`. That single query fixes the denominator, confirms or kills §5A/§5B, and produces the `[FIGMA-AUTO-LEADING]` and `[FIGMA-VARIABLE-COLLECTION]` baselines in the same pass.

---

## Recommended order of work

1. **Census** (read-only, all 43 masters) — close the denominator; confirm §5A/§5B.
2. **Gate repairs** — walk `inherit` in ROOT-PAINT; split type out of `ROOT_PAINT`'s paint-based exclusion list; add `[FIGMA-AUTO-LEADING]`. *These turn silent divergences into gate output before anyone edits anything.*
3. **ADR-0078: two more roles the ten did not span** — `ty/row` (Regular 16/125%) and `ty/row-sm` (Regular 14/125%), with the counts from §5A/§5B, plus the explicit statement that a Figma style may exist where the CSS keeps longhand (ADR-0073's carve-out).
4. **ADR-0079: the wrong variable collection** — 216 TEXT nodes source `fontSize` from Docs Brand Tokens. Blocks every size correction.
5. **The 26 free bindings** (§2a) — no CSS change, no decisions.
6. **The cheap CSS fixes** — C2, C7, C8, plus the empty-cell specificity bug and the Angular readonly selector.
7. **ADR-0080: the header band** (C1) — with `check:geometry` measured before and after.
8. **C3, C4, C5, C6**, then the bindings they unblock.
9. **C9 / ADR-0068** — repair `Action/AtlButton`, then swap the three hand-drawn footers.
10. **Compose `AI/AtlChat` from masters** — removes ~30 nodes from the population rather than binding them.
11. Only then promote `[TEXT-UNSTYLED]` from warning to blocker.