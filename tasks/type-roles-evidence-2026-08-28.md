# The Rule of Three, Measured — Evidence for D1 and D2

**Date:** 2026-08-28 · **Continues:** `tasks/type-role-resolution-2026-08-28.md` (referred to below as *the analysis*) · **Status:** read-only. No Figma write, no source edit. Every number carries the command or query that produced it.

The analysis was written before `tools/figma/text-nodes.json` existed. Its Figma-side counts were hand-aggregated from six partial reports, and §8 named that as its own weakest point. The artifact now holds the whole population, committed at `gitSha 216b228`, and this run re-derived every load-bearing number from it plus five read-only `figma_execute` queries.

**The verdict up front.** The analysis's §5A/§5B conclusion survives — both roles are earned — but almost none of the numbers it rests on do. The inversion §8 feared does not happen. Something else does: **the third combination the analysis wrote off as unreachable turns out to have twice the CSS evidence it recorded, and the reason it still fails is an axis nobody measured.**

---

## 0. Method: the counting rule, and why it is this one

ADR-0074 is the precedent. It counted **CSS rules on one side and Figma nodes on the other, independently** (`plan/adr/0074:36-38`: control 6 × 75, action 3 × 15), and it counted Figma nodes on family + weight + size with leading ignored — its own text gives that away: *"of the 30 nodes in these two combinations that state a leading at all, all 30 state 125%"*, i.e. 60 of the 90 stated no leading and were counted anyway.

I keep ADR-0074's shape and tighten each side with exclusions that both documents already accept somewhere else but neither applied consistently.

**CSS side — count distinct rendered elements whose resolved cascade *is* the combination.** Exclude:

- a **pass-through** element that declares `font: inherit; font-weight: inherit` and therefore cannot differ from its parent (`.atl-th-sort-btn`, atl-table.css:198+:200);
- an **aria-hidden glyph** (`.ellipsis` at atl-pagination.tsx:138, `.select-arrow`, `.atl-breadcrumb-item::after`) — §6 of the analysis already wants Figma to skip these; the CSS side must skip them too or the two sides are counting different populations;
- a **declaration that loses the cascade** (`.atl-tbody-empty-cell`'s font-size);
- a **defect scheduled for correction** (`.atl-select .error-message`).

Report ADR-0073 carve-outs separately but do **not** exclude them: ADR-0073 governs what a *CSS rule* may write, not whether the combination exists.

**Figma side — count nodes drawn at the combination *whose own resolved CSS cascade is that combination*.** This is the split neither document made: "drawn at X" and "faithful to X" are different measures, and the analysis's §5A used them interchangeably in one sentence. Exclude:

- nodes **inside an INSTANCE** whose master already contributes the same artwork;
- **invisible** nodes;
- nodes carrying a **`letterSpacing` or `textCase` no `ty/*` style can express**.

That last exclusion is new and it decides a verdict. `tokens.css:103-105` states outright that the roles do not touch letter-spacing, and I confirmed live that all ten styles are `ls PERCENT:0 / case ORIGINAL / deco NONE`.

**Report both the raw and the strict number every time**, so nobody has to re-derive to disagree.

### The base census (my own, reproducing the artifact and the live file)

```
node -e "const d=require('./tools/figma/text-nodes.json');
 const a=[];for(const m of d.masters)for(const t of m.text)a.push({...t,master:m.name});
 const g=new Map();
 for(const r of a.filter(r=>!r.textStyleName)){const k=[r.family,r.weight,r.size,r.lineHeight].join('|');
  if(!g.has(k))g.set(k,{n:0,rec:0,m:new Set(),dedup:0,vis:0});const e=g.get(k);
  e.n+=r.count;e.rec++;e.m.add(r.master);if(!r.insideInstance)e.dedup+=r.count;if(r.visible)e.vis+=r.count;}
 for(const[k,v]of[...g].sort((x,y)=>y[1].n-x[1].n))console.log(v.n,v.rec,v.m.size,v.dedup,v.vis,k);"
```

→ 277 records · **566 nodes · 311 unbound · 255 bound · 43 masters · 33 with >0 unbound · 24 distinct unbound combinations.**

Live cross-check, read-only, my own query (`page.findAll` for COMPONENT_SET / top-level COMPONENT, then `findAllWithCriteria({types:['TEXT']})`): **43 masters, 566 TEXT, 255 bound, 311 unbound.** The artifact is not stale.

---

## 1. Corrections to the analysis

`tasks/type-role-resolution-2026-08-28.md` is committed and will be read again. This is the section that stops it misleading someone.

| § | The analysis says | Measured | Derivation |
|---|---|---|---|
| §1, §8 | the 61-node remainder "sits in the 17 masters nobody was assigned" | **8 masters hold all 61.** Nine of the seventeen hold zero unbound nodes; four hold no TEXT record at all (AtlSkeleton, AtlProgress, AtlMenuSeparator, AtlChatTyping) | `node -e` summing unbound `count` per master: AtlButton 20, AtlStep 12, AtlTr 8, AtlBreadcrumbs 7, AtlAvatar 6, AtlCodeBlock 4, AtlTh 3, AtlChatSuggestion 1 = 61. The denominator now closes: 26 audited (250) + 8 (61) + 9 empty = 43 |
| §1 | names AtlAlert, AtlBadge, AtlProgress, AtlSkeleton among the unaudited node-holders | **Membership is right; the implicature is wrong.** AtlBadge holds 10 TEXT nodes, all bound; AtlAlert 4, all bound; AtlProgress and AtlSkeleton hold none | same script, grouping by master over all 277 records |
| §0 | quotes ADR-0074's "6 CSS rules" for control and "3" for action at face value | **control 5 (4 in Angular), action 6 (5 in React/Vue).** Two of ADR-0074's named six (`0074:27-29`: *"the chip label … and the chat action"*) sit under `.atl-chat`, which states `line-height: var(--ui-line-height-normal)` at atl-chat.css:38 — so `.chip-label` (:373-375) and `.action-btn` resolve Medium 14 / **1.5**, not tight | read atl-chat.css:28-38 and :373-381 this session; the roles' own values at tokens.css:141-144 |
| §5A | "Figma nodes: 64 total, **27 already faithful**" | **12 drawn at exactly 16/125%, 11 visible, 3 usable masters.** The 27 = those 11 + AtlRadio 4 + AtlTable-lg 12, and the analysis's own text records the last two as "16/**AUTO**". AUTO is not 125%. "64 total" also does not reproduce: the whole Regular-16 field, all leadings, is 51 nodes / 10 masters | census row `12 9 4 12 11 Instrument Sans\|Regular\|16\|125%` and row `35 19 4 35 …\|16\|AUTO` |
| §5A | lists ten CSS sites without qualification | **Ten is right as a total, but `atl-option [role='option']` is Angular-only.** Per framework it is react 9 / vue 9 / angular 10 (6 / 6 / 7 excluding carve-outs) | `libs/angular/src/lib/select/atl-option.css:25-28` states it: *"React and Vue render a native `<select>` … Only Angular has these rows."* No `atl-option.css` exists in react or vue |
| §5B | "CSS sites (5)" | **7 raw.** Two were missed: `.atl-combobox-no-results` (atl-combobox.css:40 + :208 + :44) and `.atl-select .error-message` (:14 + :103 + :18) | read both rules this session |
| §5B | "16 already faithful at 14/125%" | **35 drawn / 25 faithful-shaped / 10 after dedup.** Missed AtlInput 5, AtlSelect 5, AtlTr 6, AtlBreadcrumbs 3, AtlBreadcrumbItem 1 | census row `35 18 8 20 35`; per-master expansion below in §2 |
| §5B | counts `.atl-tbody-empty-cell` as a second B site | **Not a second site.** It renders through the same three declarations as `.atl-table.size-md tbody td`, and at size=lg the same element is an *A* site | atl-table.css:246-252, `font-size` at :250 (0,1,0) loses to :103-108 (0,2,2); padding and background carry `!important`, font-size does not |
| §5B | attributes AtlMenu's six 14/125% nodes to `variant=compact` | **CORRECT** — and I am overriding a census that called this unresolved. `variantScope` settles it in the file it was already reading: the six 16/125% records carry `["variant=default"]`, the six 14/125% records carry `["variant=compact"]` | printed `r.variantScope` per record; CSS agrees — atl-menu.css:36 md, :45-46 compact sm |
| §5B | "Regular-12-tight … 1 CSS site" | **4 raw, 2 strict** (`.step-description` atl-stepper.css:102; `.atl-table.size-sm tbody td` :100). The other two are `.step-optional` (italic — a different combination) and `.select-arrow` (aria-hidden glyph) | atl-stepper.css:102/:108/:110; atl-select.tsx:94 `aria-hidden="true"` |
| §5B | "the ladder resolves in one stroke: sm → ty/label wrong, md → ty/row-sm, lg → ty/row" | **The ladder does not resolve.** See §2.4 — the sm rung has no role available and cannot earn one. The ty/label claim itself is right: 12 `size=sm` tbody cells carry ty/label = Medium 12 where the CSS resolves Regular 12 | per-master dump of AtlTable's 32 bound records |
| §5C | "CSS sites: 4" | **8 raw / 7 distinct rendered elements / 4 letter-spacing-neutral.** Never counted: `.atl-table.size-md thead th`, `.page-btn.is-active`, `.atl-badge.size-md`, `.atl-th-sort-btn` | atl-table.css:62+:107+:74; atl-pagination.css:73+:48+:18; atl-badge.css:17+:31+:18. All present in all three frameworks |
| §5C | "Faithful Figma nodes: 1 … **unreachably so** — even a whole-file tally cannot produce two more faithful nodes" | **9 drawn, 4 usable.** The single most wrong sentence in the analysis. It is wrong because the tally it invokes was never run over the eight masters that hold the evidence | census row `9 5 4 8 9 …\|SemiBold\|14\|125%`: AtlStep 4, AtlTh 3, AtlBreadcrumbItem 1, AtlBreadcrumbs 1 |
| §5C / C6 | proposes moving `.step-circle` and `.breadcrumb-current` semibold → medium because Figma disagrees | **Figma agrees with the CSS on both.** `Navigation/AtlStep` draws the step numeral at SemiBold 14/125% — exactly `.step-circle` — and `Navigation/AtlBreadcrumbItem` draws `breadcrumb-current` at SemiBold 14/125% — exactly `.breadcrumb-current`. C6 read AtlStepper, which draws the same numeral at Regular 14/AUTO across 21 nodes, and AtlStep was never opened | per-master dump of both masters; atl-stepper.css:67-68 + :23; atl-breadcrumbs.css:82 + :36 + :25 |
| §5E | "Faithful Figma nodes: 4" | **Confirmed at 4 — but one record in one master.** Regular 12/150% fails the rule of three on the Figma side for a second, independent reason the analysis never named | census row `4 1 1 4 4 …\|Regular\|12\|150%` — Overlay/AtlTooltip, `Helpful tip text` |
| §5F | "2 Figma nodes, both at Mono Bold 12/AUTO" | **6 file-wide** (AtlCodeBlock 4 — two language labels and two filename labels — plus AtlChat 2 as instance descendants), and all six carry `letterSpacing PERCENT:3` | census row `6 3 2 4 6 JetBrains Mono\|Bold\|12\|AUTO`; live ls sweep. Matches `.code-block-label { letter-spacing: 0.03em }` |
| §5G | "the one Display/AtlAvatar instance in AtlChat carries ty/label" | **The master itself carries two wrong bindings** (size=sm → ty/label, size=md → ty/control) and all ten of its TEXT nodes are wrong on weight and leading: the CSS is SemiBold at every rung (atl-avatar.css:32) with `line-height: 1` on `.initials` (:58-59), Figma draws Bold 10 / Medium 12 / Medium 14 / Medium 16 / Medium 18, all at 125%. The **sizes** are the one ladder in the file where Figma and the CSS agree on every rung | per-master dump; atl-avatar.css:26/:31/:32/:39-43/:58-60 |
| §5H | 10px "not found in these 26 masters … unresolved" | **Display/AtlAvatar size=xs, 2 nodes, Bold 10/125%** — and 10px is a real token, `--ui-font-size-2xs: 0.625rem` (tokens.css:34), referenced by `.atl-avatar.size-xs` at :39. Not a drawing error on the size axis; the weight is still wrong | census row `2 1 1 2 2 …\|Bold\|10\|125%` |
| §6 / C1 | the dialog and drawer headers are the two instances of a header inheriting prose leading | **There is a third, and it is the one that matters.** `.atl-card` states `line-height: var(--ui-line-height-normal)` (atl-card.css:31); `.atl-card-header` states `font-size: lg` (:82) and `font-weight: semibold` (:83) and **no line-height** → SemiBold 18 / **1.5**. Twelve Figma nodes are bound to `ty/title` at 18/125%. Add AtlDialog's 5 at SemiBold 20/1.5 and **`ty/title` has zero faithful nodes in the whole file** | read atl-card.css end to end; bound-node dump shows `12 ty/title :: Display/AtlCard \| SemiBold/18/125%` |
| §6 | "**216 of 755** TEXT nodes bind fontSize to a variable from `Docs Brand Tokens` … 201 use library variables and 338 have no size binding" | **755 ✓ and 338 ✓ are exact.** The split is **394 zombie / 23 live**, not 216 / 201. The 216 is exactly the `font-size/sm` subtotal — one variable's consumers counted as if it were all six. And the phrase "from Docs Brand Tokens" is false; see §3 | my own live per-page query on `🧩 Components`: `{pageTexts:755, noFontSizeBinding:338}`, byVar `font-size/sm 3:166 → 216`, `xs 92`, `md 62`, `2xl 18`, `lg 4`, `xl 2` = 394 zombie; `877:373/374/377` = 14+8+1 = 23 live |
| §6, §7 | "unresolved whether applying a text style clears an existing fontSize variable binding … cannot be determined without mutating the document" | **Determinable read-only, and I determined it.** Across all 9 pages, 1752 TEXT nodes: 336 styled-no-variable, 538 variable-no-style, 878 neither, **0 both**. Causation remains inference; the disjointness is measurement | my own live query walking `figma.root.children` |
| §6 | "None of the 'correct the Figma size 14 → 16' recommendations in this document is executable as a plain edit" | **Overstated, and mis-aimed.** The rebind changes no size, so it is not what blocks a size correction. What the collection problem actually costs is different and sharper — see §3 | §3 |
| §4 C5 | "drop `white-space: nowrap` from React and Vue" | **That edit alone makes the tooltip worse.** Measured in chromium by two independent runs: dropping nowrap collapses React's tooltip to a ~68–82px column 170–281px tall, because `.atl-tooltip` is `position: absolute` inside an inline-block wrapper while Angular's lives in a CDK overlay pane. `width: max-content` is required alongside | atl-tooltip.css:41 max-width, :42 word-wrap, :44 white-space; `grep -c white-space libs/angular/src/lib/tooltip/atl-tooltip.css` → **0** |
| §4 table | "`.radio-text` is styled nowhere … **No effect today**" | **There is an effect today.** `.atl-radio` is `display: inline-flex` with `gap: var(--ui-spacing-3)` (12px) and the three frameworks emit 1 / 2 / 3 children, so the same radio measures **Angular 59.5px · React 71.5px · Vue 83.5px**. Vue also emits two further unstyled classes (`.radio-input`, `.radio-indicator`) the analysis does not name | atl-radio.tsx:56, atl-radio.vue:60/:63/:64, atl-radio.ts:43 (bare `<ng-content />`); browser measurement reproduced twice |
| §2b | AtlCombobox `panel/selected option/Cherry` — "fold it into `ty/row`" | **Bind it to `ty/action`.** `.atl-combobox-option.is-selected` resolves SemiBold 16/tight = ty/action byte for byte, and the file already sets the precedent: `Form/AtlOption`'s selected row **is** bound to ty/action. Folding Cherry into ty/row makes two masters disagree about the same rendered element | atl-combobox.css:40+:174+:188+:170; bound dump `1 ty/action :: Form/AtlOption` |
| §2c | accordion panel → `ty/body-sm` "only if the accordion is deliberately the one 14px prose surface" | **Answered, by a master nobody opened.** `Feedback/AtlAccordionItem` already binds `accordion-panel` to **ty/body-md** at Regular 16/150%, and `.accordion-panel` states no size over a root at `line-height: normal` (atl-accordion.css:25), so it resolves Regular 16/1.5 = body-md. body-md wins | bound dump `1 ty/body-md :: Feedback/AtlAccordionItem \| accordion-panel/…` |
| §3 R5 / C9 | keys the hand-drawn footer buttons on a layer named `footer` | **Only AtlDrawer's are.** AtlCard's is `card-section-4/card-inner-group/Save`; AtlDialog's are `Frame/Frame/Cancel` and `Frame/Frame/Confirm`. A fix script keyed on that name silently skips two of the three masters | bound dump, path column |
| §5H | notes AtlTh draws "Column" against an uppercasing CSS *(dossier claim, not the analysis's)* | **Not a defect.** The three AtlTh nodes carry `textCase: UPPER`; `characters` stays "Column" and Figma renders COLUMN, exactly as `text-transform: uppercase` does | my own live sweep: `UNBOUND \| Instrument Sans/SemiBold \| 14 \| P:1 \| UPPER → 3 [Display/AtlTh]` |

Two things the analysis got right that were challenged and survived: **§0's four-hits/three-roles grep** (confirmed, and it holds identically in all three frameworks), and **§5B's AtlMenu variant attribution** (confirmed by `variantScope`).

---

## 2. D1 — the rule of three, decided

### 2.1 Candidate A — Instrument Sans Regular 400 / 16px / 1.25

**CSS side — 10 distinct rendered elements, 7 clean.**

| # | Element | Cascade (React line numbers; Angular identical unless noted) |
|---|---|---|
| 1 | `.atl-checkbox label` | atl-checkbox.css:13 family + :14 md + :33 tight |
| 2 | `.atl-toggle label` | atl-toggle.css:13 + :14 + :33 |
| 3 | `.atl-radio` | atl-radio.css:19 + :20 + :18 |
| 4 | `.atl-menu-item` (default) | atl-menu.css:30 family + :36 md, both re-fetched by `font: inherit`@:90, + :94 tight |
| 5 | `.atl-combobox-option` | atl-combobox.css:40 + :174 + :170 |
| 6 | `.atl-table.size-lg tbody td` | atl-table.css:38 + :114 + :87 |
| 7 | `atl-option [role='option']` | **Angular only** — atl-option.css:27 + :48 + :45 |
| 8–10 | `.atl-input input`, `.atl-select select`, `.atl-combobox-input` | ADR-0073 carve-outs: the padding `calc()` names `--ui-line-height-tight` as an operand |
| — | `.atl-tbody-empty-cell` | **dead** — :250 (0,1,0) loses to :107 (0,2,2) |

Per framework, excluding carve-outs: **react 6 / vue 6 / angular 7.**

**Figma side — 12 drawn, 11 visible, 11 faithful.**

| Master | Nodes | Rule it draws | Faithful? |
|---|---:|---|---|
| Navigation/AtlMenu `variant=default` | 6 | `.atl-menu-item` | ✓ |
| Navigation/AtlMenuItem | 2 | `.atl-menu-item` | ✓ |
| Form/AtlOption | 3 | `atl-option [role='option']` | ✓ |
| Display/AtlTbody `empty-message` | 1 | `.atl-tbody-empty-cell` — dead declaration, and `visible: false` | ✗ excluded twice over |

None is inside an instance. Distinct rendered elements represented: **2** (the menu row, the option row).
AUTO reservoir that lands here after a leading fix only: **16** — AtlRadio 4 (`.atl-radio`) and AtlTable `default-lg` tbody 12 (`.atl-table.size-lg tbody td`). *Not* the 35 the whole `Regular 16/AUTO` row shows: AtlCard's 12 resolve 16/**1.5** (prose) and AtlDrawer's 7 resolve SemiBold 20/1.5 (a header). Those 19 belong to C1 and C3, not to A.

**Verdict: MINT.** 7 clean CSS sites × 11 faithful Figma nodes across 3 masters. It clears three on both sides under ADR-0074's own rule, under exact-value node counting, under record counting, and under master counting. The one metric where it lands at 2 is "distinct rendered elements Figma has drawn faithfully" — a number that measures how much of the library the Figma file has caught up with, not how often the library repeats the combination. And that number is a floor: every 14→16 correction the analysis recommends moves nodes *into* A (AtlCheckbox 5, AtlToggle 4, AtlRadioGroup 4, AtlCombobox's 8 option rows, plus the 16 value-text nodes), so measuring A before the corrections understates it by roughly 37 nodes.

**Explicit override.** One skeptic in the dossier concluded "HOLD ty/row, it stands on one CSS rule", on the premise that `Form/AtlOption` has no styleable CSS site because React and Vue render a native `<option>`. The premise is wrong and the grep that produced it (`grep -rn "\.atl-option" --include='*.css' libs/`) could not have found the site, because the Angular rule is `[role='option']`, not a class. `libs/angular/src/lib/select/atl-option.css` exists, is 68 lines, and its own comment at :21-23 explains exactly why. A's faithful nodes span two real rules, not one.

**What lands in `tokens.css`:**

```css
--ui-type-row: var(--ui-font-weight-normal) var(--ui-font-size-md) /
  var(--ui-line-height-tight) var(--ui-font-family);
```

Mirrored as `ty/row` = Instrument Sans Regular 16 / 125%.

**What visibly changes.** Binding the 11 already-exact nodes changes nothing rendered — it changes only what the node references. AtlRadio 4 and AtlTable-lg 12 move AUTO → 125%, ≈3% taller lines, which is ADR-0059's point. On the CSS side the role asserts `font-weight: 400` at seven sites where **no component stylesheet in any framework states a weight today** (`grep -rn "font-weight" libs/{angular,react,vue}/src/lib | grep '\.css:' | grep -iE 'normal|400'` → no output; declared weights in React are medium ×8, semibold ×17, bold ×2, inherit ×1). In a consuming page with a bold body those seven sites stop inheriting it. ADR-0073's Consequences records precisely this happening on its four migrated rules and calls it *"ADR-0049's argument one property further, so it is the intended direction"* — so there is precedent, but it is a rendered change and the ADR must say so.

**ADR-0073 interaction, stated rather than inherited.** §5A left this open. The answer is that the carve-out does not reach the Figma node. ADR-0073 rule 1 forbids a **`font:` shorthand** in a rule whose padding `calc()` names the leading, because the shorthand would hide an operand. A Figma text style hides nothing from a `calc()` — there is no `calc()` in Figma. So the 16 value-text nodes (AtlInput 5, AtlSelect 5, AtlCombobox `input/*` 6) **should carry `ty/row`** while their CSS keeps longhand, exactly as `.atl-select label` writes ty/control's longhand today. Binding them is also their size correction: they draw 14 and the CSS resolves 16, which `tools/figma/type-baseline.json` already records for AtlInput and AtlSelect.

### 2.2 Candidate B — Instrument Sans Regular 400 / 14px / 1.25

**CSS side — 7 raw, 3 durable.**

| Element | Cascade | Counts? |
|---|---|---|
| `.atl-table.size-md tbody td` | atl-table.css:38 + :107 + :87 | ✓ |
| `.atl-breadcrumb-item .breadcrumb-link` | atl-breadcrumbs.css:20 + :36 + :25 | ✓ |
| `.atl-combobox-no-results` | atl-combobox.css:40 + :208 + :44 — real prose ("No results") | ✓ |
| `.atl-menu.variant-compact .atl-menu-item` | atl-menu.css:30 + :46 + :55 | ADR-0073 carve-out (`padding: calc(… --ui-line-height-tight …)` at :56) |
| `.ellipsis` | atl-pagination.css:13 + :97 + :18 | ✗ aria-hidden glyph (atl-pagination.tsx:138) |
| `.atl-select .error-message` | atl-select.css:14 + :103 + :18 | ✗ **defect** — the only one of seven error-message rules in the library missing `line-height: var(--ui-line-height-normal)`. Fix it and it becomes ty/body-sm |
| `.atl-tbody-empty-cell` as rendered | same three declarations as row 1 | ✗ not a second site |

**3 durable, 4 with the carve-out.** Landing exactly on the threshold, with no margin.

**Figma side — 35 drawn, 25 faithful-shaped, 10 deduped.**

| Master | Nodes | Rule | Faithful? |
|---|---:|---|---|
| Navigation/AtlMenu `variant=compact` | 6 | `.atl-menu.variant-compact .atl-menu-item` | ✓ |
| Display/AtlTd | 3 | `.atl-table.size-md tbody td` | ✓ |
| Navigation/AtlBreadcrumbItem | 1 | `.breadcrumb-link` | ✓ |
| Display/AtlTr | 6 | instances of AtlTd | dedup out |
| Display/AtlTbody | 6 | instances of AtlTd | dedup out |
| Navigation/AtlBreadcrumbs | 3 | instances of AtlBreadcrumbItem | dedup out |
| Form/AtlInput | 5 | `.atl-input input` resolves **16** | ✗ — a defect recorded in `type-baseline.json` today |
| Form/AtlSelect | 5 | `.atl-select select` resolves **16** | ✗ — same |

**10 deduped faithful nodes / 3 masters / 3 distinct rendered elements.**
AUTO reservoir: 137 nodes at Regular 14/AUTO across 15 masters — but most of that is the same 14-vs-16 defect (AtlCheckbox 5, AtlToggle 4, AtlRadioGroup 4, AtlCombobox 15 all belong to A after correction, not to B). B's genuine AUTO reservoir is AtlTable's 36 `size=md` body cells and the 2 ellipses; call it 36.

**Verdict: MINT — and say plainly that it clears by nothing.** 3 CSS sites × 10 nodes × 3 masters. Both sides land on the threshold exactly, after four separate deductions. That is a pass, not a comfortable one, and the ADR should record the margin rather than the raw 7 × 35.

Two facts keep it a pass rather than a fail. First, the biggest deduction on the CSS side (`.atl-select .error-message`) is a defect whose fix removes it from B without touching the core three. Second, the biggest deduction on the Figma side (AtlInput + AtlSelect, 10 nodes) removes nodes that were never B's — they are A's, drawn wrong.

```css
--ui-type-row-sm: var(--ui-font-weight-normal) var(--ui-font-size-sm) /
  var(--ui-line-height-tight) var(--ui-font-family);
```

Mirrored as `ty/row-sm` = Instrument Sans Regular 14 / 125%.

**What visibly changes.** AtlTd 3 / AtlMenu-compact 6 / AtlBreadcrumbItem 1 bind with no rendered change. AtlTable's 36 `size=md` cells move AUTO → 125%. The three-fold nested duplication (AtlTd → AtlTr → AtlTbody, and AtlBreadcrumbItem → AtlBreadcrumbs) means only the master's copy is bound; the instances inherit, per §3 R3 of the analysis.

### 2.3 Candidate C — Instrument Sans SemiBold 600 / 14px / 1.25 — the third candidate, and the interesting one

The analysis rated this **4 CSS sites × 1 faithful node, "unreachably so"**. Both numbers are wrong and the verdict still holds, for a reason neither the analysis nor any dossier census gave.

**CSS side — 8 raw, 7 distinct elements, 4 role-expressible.**

| Element | Cascade | Extra axis |
|---|---|---|
| `.step-circle` | atl-stepper.css:18 + :67 + :68 + :23 | — |
| `.step-item.is-active .step-label` | atl-stepper.css:18 + :95 + :131 + :23 | — |
| `.breadcrumb-current` | atl-breadcrumbs.css:20 + :36 + :82 + :25 | — |
| `.page-btn.is-active` | atl-pagination.css:13 + :48 + :73 + :18 | — |
| `.atl-badge.size-md` | atl-badge.css:16 + :31 + :17 + :18 | **`letter-spacing: wide`** (:20) |
| `.atl-table.size-md thead th` | atl-table.css:38 + :107 + :62 + :74 | **`letter-spacing: wide` (:64) + `text-transform: uppercase` (:65)** |
| `.atl-button.size-sm` | atl-button.css:18 + :116 + :20 + :21 | **`letter-spacing: tight`** (:22); also an ADR-0073 carve-out |
| `.atl-th-sort-btn` at md | atl-table.css:198 `font: inherit` + :200 `font-weight: inherit` | pass-through of the row above — excluded |

**Figma side — 9 drawn, 4 usable.**

| Master | Nodes | Disposition |
|---|---:|---|
| Navigation/AtlStep `step-circle/step-number` | 3 | ✓ faithful to `.step-circle` |
| Navigation/AtlStep `step-number` "!" | 1 | ✗ React renders `<AtlIcon name="close" size="sm"/>` (atl-stepper.tsx:172-173) — no DOM text |
| Navigation/AtlBreadcrumbItem `breadcrumb-current` | 1 | ✓ faithful to `.breadcrumb-current` |
| Navigation/AtlBreadcrumbs | 1 | ✗ instance of the above |
| Display/AtlTh `Column` | 3 | ✗ **`letterSpacing PERCENT:1`, `textCase UPPER`** |

**Verdict: NO ROLE — and no snap either. Split it.**

The AtlTh exclusion is the finding. My own live sweep over all 566 master TEXT nodes returned exactly three groups with a non-default `letterSpacing` or `textCase`:

```
UNBOUND | Instrument Sans/Bold  | 10 | PX:0 | ORIGINAL  →  2  [Display/AtlAvatar]
UNBOUND | JetBrains Mono/Bold   | 12 | P:3  | ORIGINAL  →  6  [Display/AtlCodeBlock, AI/AtlChat]
UNBOUND | Instrument Sans/SemiBold | 14 | P:1 | UPPER    →  3  [Display/AtlTh]
```

`--ui-letter-spacing-wide` is `0.01em` (tokens.css:43) = the 1% measured, and `.atl-table thead th` sets `text-transform: uppercase`. AtlTh is drawing its CSS **correctly**. But all ten `ty/*` styles are `ls PERCENT:0 / case ORIGINAL / deco NONE` (verified live), and `tokens.css:103-105` says so on purpose: *"It does not touch letter-spacing — pair … an uppercased label role with `--ui-letter-spacing-uppercase` yourself."* So no role in the vocabulary can express the table header, three of C's eight CSS sites carry an axis the roles cannot carry, and C is not one combination but two.

That leaves the role-expressible half at 4 CSS sites × 4 Figma nodes in **2 masters**. It clears on sites and nodes, fails on masters, and its four sites are four unrelated pieces of "you are here" emphasis. Recording it as a named non-role, the way ADR-0074 recorded SemiBold 20 and Regular 12, is the right outcome.

**But C6 must be withdrawn on two of its three targets, and that is a source change.** C6 proposed moving `.step-circle`, `.step-item.is-active .step-label` and `.breadcrumb-current` semibold → medium so they snap to ty/control. Measured:

- `.step-circle` — **withdraw.** `Navigation/AtlStep` draws SemiBold 14/125%, exactly the CSS. C6's evidence came from `Navigation/AtlStepper`, which draws the same numeral at Regular 14/AUTO across 21 nodes and does **not** instance AtlStep (every numeral is `insideInstance: false`). Moving the CSS to Medium would match *neither* master. The fix is in Figma: repair AtlStepper's numerals to SemiBold 14/125%, or recompose AtlStepper from AtlStep instances the way AtlTr already composes AtlTd.
- `.breadcrumb-current` — **withdraw.** `Navigation/AtlBreadcrumbItem` draws SemiBold 14/125%, exactly the CSS. Nothing to fix on either side.
- `.step-item.is-active .step-label` — **stands.** All 24 AtlStepper labels (3 labels × 8 variants) are bound to ty/control = Medium 14/125%, and `.step-item.is-active` (atl-stepper.css:129-132) sets only `color` and `font-weight`. Figma has already decided the active step is distinguished by colour. Move the CSS.

C6 was written on the belief that this combination had one faithful node. It has four, and two of C6's three targets are among them.

### 2.4 The table ladder, resolved as one construct

`.atl-table.size-{sm,md,lg} thead th, tbody td` (atl-table.css:96-115) is **two** ladders over one set of size rules, and the analysis treated it as one.

| Rung | tbody td resolves | thead th resolves |
|---|---|---|
| sm | Regular 12 / 1.25 | SemiBold 12 / 1.25 + wide + UPPER |
| md | Regular 14 / 1.25 | SemiBold 14 / 1.25 + wide + UPPER |
| lg | Regular 16 / 1.25 | SemiBold 16 / 1.25 + wide + UPPER |

**tbody:** lg → `ty/row`, md → `ty/row-sm`, sm → **nothing**. Regular 12/tight has 2 strict CSS sites (`.step-description`, `.atl-table.size-sm tbody td`) and 4 faithful Figma nodes in **one** master (AtlStep's `step-description`). It fails the rule of three on the CSS side and on masters. §5B's "the ladder resolves in one stroke" is wrong: one rung stays raw, and that must be written down rather than discovered later.

**thead:** no rung can take a role at any size, because all three carry `letter-spacing: wide` + `text-transform: uppercase`. Every one of AtlTable's 15 thead nodes is currently bound to `ty/label` (Medium 12/125%) — wrong on weight at all three rungs, wrong on size at md and lg, and wrong on two axes the style cannot carry. **All 15 bindings should be cleared, not rebound.** `Display/AtlTh` — the master that models the same rendered element and was never audited — already draws it correctly and correctly carries no style.

**Is ADR-0074's `ty/label` on the 12 `size=sm` tbody cells the defect it is alleged to be?** Yes, and the analysis's description of it is exact: Medium 12 where `.atl-table.size-sm tbody td` resolves Regular 12. But the remedy §5B implies — "re-decide it" alongside minting two roles — has no landing site, because Regular-12-tight cannot earn a role. **Clear the 12 bindings and leave the nodes raw**, which is what ADR-0074 itself did for AtlTooltip when the rule of three failed (`0074:§Decision.4`). Same for the 15 thead nodes. That is 27 clearings in AtlTable, and it is the honest outcome of the ladder, not a gap in it.

### 2.5 The other combinations the sweep turned up

| Combination | CSS sites | Figma faithful | Verdict |
|---|---:|---|---|
| Medium 16 / 1.25 | **0** | 20 drawn (AtlButton `size=md` 16, AtlAvatar 2, AtlChat send 2) | Not a candidate — a **weight defect**. `.atl-button` is semibold at every size (atl-button.css:20, one root declaration; :110-138 state only font-size and a padding `calc()`), `.atl-avatar` likewise (:32). Fix Figma |
| Medium 18 / 1.25 | **0** | 6 drawn (AtlButton `size=lg` 4, AtlAvatar 2) | Same defect. **Trap:** correcting AtlButton `size=lg` to SemiBold 18/125% makes it byte-for-byte `ty/title`, a heading role on a button. Do not bind it |
| SemiBold 12 / 1.25 | 2 strict (`.atl-badge.size-sm`, `.atl-table.size-sm thead th`) | **0** — no `SemiBold\|12\|125%` row exists in the file | Fails both sides. Both sites carry `letter-spacing: wide` anyway |
| Regular 12 / 1.5 (§5E, tooltip) | 2 | 4 nodes, **1 record, 1 master** | Fails on CSS sites and, independently, on masters |
| Mono SemiBold 12 / 1.25 (§5F) | 1 | 0 — the 6 drawn nodes are Mono **Bold** 12/AUTO with `ls 3%` | Fails. Fix the Figma weight and leading; leave unbound. `letter-spacing: 0.03em` and `text-transform: lowercase` put it outside the vocabulary regardless |
| SemiBold {10..18} / 1 (avatar initials) | 1 ladder | 0 | `line-height: 1` is glyph centring, never a role. Additionally `.atl-avatar .initials` carries `letter-spacing: 0.02em` (:60) — a third site outside the vocabulary |

**No third role. The field is A and B.**

### 2.6 The button, since C9 asked the wrong question

`.atl-button.size-sm`'s SemiBold 14 is neither "a fourth control combination the button legitimately owns" nor "a bug in the button's size ladder". The ladder is regular and correct: one weight on the root, three size rules that vary only `font-size` and the padding `calc()`. What is under-specified is the **role scale**, which names only the button's middle rung — `ty/action` is byte-for-byte `.atl-button.size-md`. The button's size axis crosses the role scale in both directions: SemiBold 14 below (no role) and SemiBold 18 above (`ty/title`'s exact value on something that is not a heading).

All 24 Button texts are Medium against a semibold CSS, and the four `size=sm` nodes are not merely unbound — they are **bound to ty/control**, a wrong style, which is harder to find than a missing one. An instance swap onto `Action/AtlButton` (C9 step 2) is not safe today and would be a **no-op on type**: the hand-drawn labels in AtlCard, AtlDialog and AtlDrawer are Instrument Sans Medium 14, and `Action/AtlButton size=sm` is Instrument Sans Medium 14. Repair the master first.

---

## 3. D2 — the variable collection, decided

### 3.1 What `Docs Brand Tokens` is, and what the 212 nodes actually bind to

**There is no wrong-collection binding. The premise is false.**

My own read-only query resolving every member of every local collection:

```
Docs Brand Tokens  VariableCollectionId:3:120   39 variables — {COLOR: 39}
Library Tokens     VariableCollectionId:877:371 78 variables — {COLOR: 50, FLOAT: 27, STRING: 1}
Primitive 73:405 76 · Component 73:445 15 · Effects 73:402 11 · Motion 73:399 2   (locals total 221)
```

**`Docs Brand Tokens` contains no typography variables at all.** It is 39 colour variables — `area/*`, `bg/*`, `tx/*`, `badge/*`, `border/*`, `focus/*`. No `font-size/*` exists in it.

The six variables the 212 nodes bind to are **deleted**:

| id | name | resolves by id | in owner's `variableIds` | in `getLocalVariablesAsync()` | claims collection |
|---|---|---|---|---|---|
| VariableID:3:165–3:170 | `font-size/xs … 2xl` | yes | **no** | **no** | `VariableCollectionId:3:120` |

They are zombies: resolvable by id, carrying a name and frozen `valuesByMode`, absent from the collection they name. The artifact's `fontSizeVariableCollection: "Docs Brand Tokens"` is an accurate report of a *claim* and a misleading report of a *fact*, because `figma-snapshot.mjs`'s `collOf` (:479-497) resolves `v.variableCollectionId` through `getVariableCollectionByIdAsync` and never tests membership.

**How the masters came to depend on them.** Collection id 3:120 and variable ids 3:121–3:170 place this collection among the oldest nodes in the file, long before Library Tokens (877:371). No script in the repo writes it — `grep -rn 'Docs Brand' tools/ libs/ docs/ plan/` returns only read-side references and prose, while `gen-figma-library-tokens.mjs` and `figma-sync-library-tokens.mjs` target Library Tokens exclusively. The masters were built against the docs-site collection; the docs collection was later rebuilt and its `color/*` and `font-size/*` deleted; ADR-0030 migrated the colour bindings and left the typography ones. ADR-0030's own Consequences records the typography binding work as an open follow-up — and also states *"the zombie variables are no longer referenced by anything"*, which is false: 936 distinct (node, variable) pairs / 986 raw bindings survive file-wide.

**The full zombie population inside the 43 masters**, from my own walk of 1976 nodes:

```
fontSize font-size/sm  3:166 → 146   fontSize font-size/md  3:167 →  55
fontSize font-size/xs  3:165 →   7   fontSize font-size/lg  3:168 →   4   = 212
effects  color/primary 3:121 →   8   effects  color/surface 3:134 →   8   =  16
live bindings 4999 — 100% Library Tokens.  zombie 228.
```

**The 16 effect zombies are new.** They are the two-layer focus ring on eight `state=focus` variants — AtlCheckbox, AtlRadio, AtlRadioGroup, AtlToggle and four AtlButton variants. They are in no document, in no ADR, and in no baseline. The snapshot's own guard for exactly this, `nonSemanticTokens`, reads **0 across 196 fields** in the committed `snapshot.json`, because its data source (`figma_get_component_for_development_deep`) returns a bare `{id}` for a deleted variable — no `name`, no `collection` — and the guard at `figma-snapshot.mjs:817-824` requires both. A zombie is structurally invisible to it on *any* variant. A third instance of ADR-0080's "a guard that skips is not a check".

### 3.2 Does a text style clear a `fontSize` variable binding?

**Observed, not inferred:** across all 9 pages, 1752 TEXT nodes — 336 styled with no variable, 538 variable-bound with no style, 878 with neither, **0 with both**. A clean separation across 1752 nodes on 9 pages.

**Inferred, and flagged:** that the separation is *caused* by style application clearing the binding. The observation is strictly one-directional (styled ⇒ no variable), 878 nodes carry neither, and Figma's plugin docs state no precedence — the `TextNode` and `boundVariables` pages describe the two fields independently. Settling causation needs one write, which this run is forbidden. It should be tested on a throwaway node in a scratch file the user owns, never in `QMnDD8uZQPldPrlCwZZ58T`.

**The fact that actually matters is not in dispute.** All ten `ty/*` styles carry `boundVariables: {}` (verified live). Every one hard-codes a literal `fontSize`. So binding a style to a node that currently references `font-size/md` **replaces a token reference with the number 16**, whether or not it "clears" anything. That is the ordering constraint, and it is independent of the causal question.

### 3.3 The fix path

**Take path A: rebind, do not retype.**

Swap the 212 fontSize bindings from `VariableID:3:165–3:170` to `877:373–378`, and the 16 effect colours from `3:121`/`3:134` to `877:384`/`877:405`. Every target exists and is value-identical — I re-probed all eight:

```
font-size/xs 12→877:373 12 ✓   sm 14→877:374 14 ✓   md 16→877:375 16 ✓
lg 18→877:376 18 ✓   xl 20→877:377 20 ✓   2xl 24→877:378 24 ✓
color/primary #006470/#34d8d8 → 877:384 identical ✓
color/surface #ffffff/#0a1116 → 877:405 identical ✓
```

**Cost:** 228 writes, zero value change, zero visual diff, no design review. **Reversibility:** total — the zombie ids stay resolvable, and Figma version history covers it.

**What must exist before the first operation.** One prerequisite nobody has flagged, and it is real: `877:384` (`color/primary`) has `scopes: ["ALL_FILLS", "STROKE_COLOR"]` and `877:405` (`color/surface`) has `scopes: ["FRAME_FILL", "SHAPE_FILL"]`. **Neither includes `EFFECT_COLOR`.** The six font-size counterparts are correctly scoped (`["FONT_SIZE"]`); the two colour ones are not scoped for the effect binding they are about to receive. Widen those two scopes first, or the 16 effect rebinds land out of scope — bound in the file, invisible in the picker, and a fresh hygiene defect one axis over from the one being fixed.

**Why not the others.**

- **Path B — bind the `ty/*` styles and let them carry the size.** Blocked on D1, and it is a retype rather than a rebind: of the 212, exactly **2** match one of the ten existing roles (AtlChat's `send-button` and `new-chat-button`, both Medium 14/125% = ty/control's shape with the style overridden off), 210 do not, and **175 sit on AUTO leading**, so applying a style moves leading on most of them. Visible diff, reversible only through version history.
- **Path C — delete `Docs Brand Tokens`.** It removes 39 live variables with zero consumers anywhere in the file, does **not** remove the zombies, and would strand the mode resolution of 936 bindings whose `resolvedVariableModes` still lists `3:120`. Highest risk, fixes nothing A does not.
- **Path D — widen `SEMANTIC_COLLECTIONS`** (check-figma.js:752) to admit `Docs Brand Tokens`. Wrong: it would legitimise binding to a variable that does not exist.

**The gate should change, but not the way it looks.** The defect is a binding to a **deleted** variable, not to a foreign collection, and the check's recorded rationale has the risk backwards. `check-figma.js:724` says the two scales *"agree today, so nothing renders wrong and nothing will until they diverge."* Frozen values cannot diverge. The real exposure is that Library Tokens **can** change — `figma-sync-library-tokens.mjs` rewrites it on every `tokens.css` change — and the 212 sizes plus 16 focus rings will silently fail to follow.

Two independent gate fixes follow, and they are not the same fix:

1. **`nonSemanticTokens` needs one clause**, not a new query. The deep payload already distinguishes live from dead for free: an alias that arrives without a `name` is a deleted variable. Add that test at `figma-snapshot.mjs:817-824`. This is what catches the 16 effect zombies.
2. **`collOf` should record `live: true|false`** by testing membership in the owner's `variableIds`, and `check-figma.js:1676` should fail on `live === false` rather than on a collection-name mismatch. This is what makes `text-nodes.json` tell the truth, and it survives a future genuine cross-collection binding to a variable that really exists. Cost: the 106 recorded finding strings in `type-baseline.json` churn once, because they embed the collection name.

Note also that `SEMANTIC_COLLECTIONS` is `{'Library Tokens', 'Component Tokens'}` and Component Tokens has **zero consumers anywhere in the file** — the allowed pair is an allowed singleton, which is a second argument for a liveness test.

### 3.4 Ordering against D1

**D2's rebind lands first. D1's binding pass lands second. Neither blocks the other from starting.**

- **Minting the two roles is not blocked by D2 at all.** Creating a `ty/*` style and adding two `--ui-type-*` declarations touches no variable.
- **Binding a node that carries a fontSize variable *is* a D2 decision wearing a binding's clothes.** All ten styles hard-code a literal size, so binding one of the 212 destroys a token reference. 20 of AtlButton's 24, and every node in A's and B's post-correction population that lives in AtlTable, AtlCombobox, AtlCheckbox, AtlToggle or AtlRadioGroup, is in that state.
- **The genuinely D2-free work** is (i) minting the styles, (ii) every weight and leading repair in Figma, and (iii) binding the 33 nodes among the eight unaudited masters that carry no variable at all — AtlStep 12, AtlBreadcrumbs 7, AtlTr 6, AtlTh 3, AtlAvatar 4, AtlChatSuggestion 1.
- **One correction to the analysis's blocker claim in the other direction:** D2 does not block the *size corrections* either. The rebind changes no size, and none of the eight unaudited masters needs a size change — every size on all 61 of their nodes already matches its CSS. What D2 blocks is the *binding* pass, because binding is where the token reference is lost.

---

## 4. The five CSS defects

All five confirmed at file:line this session. Two of the five as *described* in the analysis are wrong — #3's prescribed fix and #5's "no effect today".

| # | Defect | Status | Exact edit |
|---|---|---|---|
| 1 | `.atl-tbody-empty-cell`'s `font-size` is dead — (0,1,0) vs `.atl-table.size-* tbody td` (0,2,2). Rendered: **sm 12px, md 14px, lg 16px** against the 16px written | **Confirmed, 3 frameworks** | react `atl-table.css:250` · vue `:250` · angular `:234` → `font-size: var(--ui-font-size-md) !important;`. Matches the `!important` the same rule's `padding` (:248) and `background-color` (:251) already carry for the identical collision. **Open first:** is 16px right at size=sm? Making a dead declaration live is 4px larger than the cells around it. If the intent was "match the table", the fix is to **delete** the line |
| 2 | Angular's readonly combobox has no visual treatment — `:host(.is-readonly) .atl-combobox-input` matches nothing; the template emits `class="combobox-input"` | **Confirmed, Angular only.** ADR-0045 violation (that ADR's Status: *"has a visual treatment"* in every framework) | `libs/angular/src/lib/combobox/atl-combobox.css:206` → `:host(.is-readonly) .combobox-input {`. React `:228` and Vue `:228` are already correct — do not touch |
| 3 | Tooltip: React and Vue set `white-space: nowrap` beside `max-width: 20rem` + `word-wrap: break-word`; Angular states no `white-space` at all | **Confirmed as a divergence. The analysis's fix is wrong** | react + vue `atl-tooltip.css`: delete `white-space: nowrap;` (:44) **and** add `width: max-content;` beside `max-width: 20rem` (:41). Angular: no change. Deleting nowrap alone collapses the tooltip to a ~68–82px column, because React's `.atl-tooltip` is absolute inside an inline-block wrapper while Angular's lives in a CDK overlay pane |
| 4 | Five chat controls state no `font-family` and render in the UA control font. `.field` is a `<textarea>` — its UA font is **monospace**, not the sans the four buttons get. `.close-btn` and `.chip` state no size either and render at 13.333px | **Confirmed, 3 frameworks. And the sweep is 12 sites short** | react `atl-chat.css` :118 `.fab-bubble`, :188 `.close-btn`, :345 `.chip`, :397 `.field`, :430 `.action-btn` · vue :118/:188/:335/:387/:420 · angular :105/:175/:332/:384/:417. **Four more glyph-only close buttons have the same defect at the same severity in all three frameworks** — `.atl-alert .dismiss`, `.atl-toast .dismiss`, dialog `.close-btn`, drawer `.close-btn` — so the class is 9 selector families × 3 frameworks = 27 sites, not 15 |
| 5 | `.radio-text` styled nowhere; Angular emits no such span | **Confirmed. "No effect today" is wrong** | Two directions, and picking one is a decision. **A:** `libs/angular/src/lib/radio/atl-radio.ts:43` `<ng-content />` → `<span class="radio-text"><ng-content /></span>`. **B:** delete the span at `atl-radio.tsx:56` and `atl-radio.vue:64-66` plus Vue's `.radio-input` (:60) and `.radio-indicator` (:63). Neither closes the width gap on its own — see below |

**Mechanical, one commit: #1 and #2.** Both are single-token edits with verified before/after, no gate interaction, no API or DOM change. Nothing else belongs in it.

**Needs a decision first: #3, #4, #5.**
- #3 — "should a tooltip wrap at all" is a design question tied to §5E's `ty/label` route.
- #4 — `font-family: inherit`, `font: inherit`, or `all: unset`? The repo already uses all three: seven components write `font-family: inherit` / `font: inherit`, and eight stylesheets per framework write `all: unset` (which resets font-family to `inherit` because it is inherited) — `atl-chat.css` itself does so at :54-61. If `font: inherit` is chosen it **must be the first declaration in each rule** with the existing longhands restated below it: `check:typeface`'s `[FONT-AFTER]` blocks the other order, and the shorthand would wipe `.field`'s stated leading and `.action-btn`'s size and weight.
- #5 — the width divergence is a separate decision from the class fix. Angular's span would land inside the `<label>` while the host's 12px `gap` sits one level up with a single child; closing the gap needs the label to become the flex row.

**What moves a box `check:geometry` measures.** Only one chat box is in the roster — `AtlChatClose` (`check-geometry.mjs:216-225`), and its rule states `width`/`height` as `var(--ui-control-height-sm)` with `padding: 0`, so it measures **32×32 before and after under either idiom**. The four other chat controls are outside the roster (the roster is discovered by grepping for `--ui-control-height-*` / `--ui-row-height-*`) but they do move: `.chip` 60→62px under `font-family: inherit` and 60→69px under `font: inherit`; `.action-btn` 34→35px and 34→39px. The tooltip directory references no height token, so #3 touches nothing the gate measures, and `.atl-tooltip` is already in the box-sizing contract so `gen:box-sizing --check` does not move either. **#1 changes rendered text size in two of three table sizes and is worth one eyeball before it lands.**

### Two things the defect sweep found that are worse than any of the five

Out of scope for the typography decision; in scope for whoever reads this.

- **The Vue toggle never visibly turns on.** `.atl-toggle.is-checked .track` (atl-toggle.css:91) and `.thumb` (:97) are the only rules that fill the track and slide the thumb. `atl-toggle.vue:39` binds `{ 'is-invalid': invalid, 'is-disabled': disabled }` and stops. React (`atl-toggle.tsx:47`) and Angular (`atl-toggle.ts:105`) both push `is-checked`.
- **Vue's active pagination page and Vue's error text are unstyled** for the same reason: `.page-btn.is-active` (atl-pagination.css:69/:76) against a template binding `{ active: … }` (atl-pagination.vue:82); `.error-message` (atl-input.css:112 and three siblings) against `<li class="error">` (atl-input.vue:70).

Defect #2 is one instance of this class, not a one-off. The class is "a state class the CSS styles and the template never emits", and it spans two frameworks and at least seven components. A `check:dead-selectors` gate is the gate the repo is missing — but it must be scoped **per component directory** (component CSS is directory-scoped, so a class emitted by component A must not rescue a dead rule in component B) and it must **not** exclude the `is-` prefix, which is exactly this library's state-class namespace.

---

## 5. Execution order

Each step names what turns red, what ratchet moves, and what must be re-recorded. Current baselines: `[FIGMA-AUTO-LEADING]` 206 · `[FIGMA-VARIABLE-COLLECTION]` 212 · `[ROOT-TYPE]` 8 · `[TEXT-OVERRIDE]` 4 · `[TEXT-UNSTYLED]` 257.

1. **Land CSS defects #1 and #2** (one mechanical commit). *Gate consequence:* none. `check:geometry` unchanged (73 measurements), `check:typeface` unchanged, `gen:box-sizing --check` unchanged. #1 changes rendered text size at table sm and md — look at it once.
2. **Widen `877:384` and `877:405` scopes to include `EFFECT_COLOR`** (Figma, 2 writes). *Gate consequence:* none; this is the prerequisite for step 3.
3. **D2 path A — rebind 212 fontSize + 16 effect colours to Library Tokens** (228 writes, zero visual diff). *Gate consequence:* re-run `figma:snapshot`; `[FIGMA-VARIABLE-COLLECTION]` goes 212 → **0** and the ratchet blocks until all 106 finding strings are removed from `type-baseline.json`. `snapshot.json` and `text-nodes.json` both take a new `generatedAt` — they must be committed together. `nonSemanticTokens` stays 0 either way, because it cannot see zombies.
4. **Fix the two gates:** add the missing-`name` clause to `nonSemanticTokens`; add `live` to `collOf` and switch `check-figma.js:1676` from a name test to a liveness test. *Gate consequence:* run this **after** step 3 or the liveness test fires 228 findings on day one and the ratchet has to record debt that is about to be paid. Both fixes are re-recordings of a baseline that step 3 already emptied.
5. **Repair `Action/AtlButton`** in Figma: all 24 Button texts Medium → SemiBold; clear the four wrong `size=sm` ty/control bindings; bind the 16 `size=md` nodes to `ty/action`; leave the 4 `size=lg` unbound. *Gate consequence:* `[TEXT-UNSTYLED]` drops by 16 and rises by 4 — a **substitution**, which is exactly what the finding-level baselines introduced in commit `25ac006` exist to catch. Re-record.
6. **Repair the Figma weight and leading defects that need no role** — AtlAvatar (all 10 nodes to SemiBold, clear the two wrong bindings), AtlCodeBlock (Bold → SemiBold, AUTO → 125%), AtlStepper's 21–22 numerals to match AtlStep, AtlChatSuggestion's `chip-label`. *Gate consequence:* `[FIGMA-AUTO-LEADING]` drops; re-record. `[TEXT-UNSTYLED]` unchanged for the unbound ones.
7. **Clear the 27 wrong AtlTable bindings** — 15 thead (no role can express uppercase + wide) and 12 `size=sm` tbody (Regular 12 has no role). *Gate consequence:* `[TEXT-UNSTYLED]` rises by 27. This is a **deliberate increase** and the ADR must say so, or the next reader will treat the ratchet's red as a regression.
8. **ADR + mint `ty/row` and `ty/row-sm`** — two `--ui-type-*` declarations in `tokens.css` × 3 frameworks, two Figma styles. *Gate consequence:* `check:figma`'s style-vs-tokens comparison covers the new pair to three decimals (ADR-0074's precedent); nothing else moves until anything binds. `check:token-bypass` and `check:css-tokens` unaffected — no component rule references the roles yet.
9. **Bind A and B** — the 11 already-exact A nodes, the 10 already-exact B nodes, then the AUTO-only corrections (AtlRadio 4, AtlTable-lg 12 → row; AtlTable-md 36 → row-sm), then the 14→16 corrections (AtlCheckbox 5, AtlToggle 4, AtlRadioGroup 4, AtlCombobox 8 option rows, AtlInput 5, AtlSelect 5, AtlCombobox 6 value → row). *Gate consequence:* `[TEXT-UNSTYLED]` falls by roughly 110 and `[FIGMA-AUTO-LEADING]` by roughly 90; re-record both. `[ROOT-TYPE]` should clear AtlInput and AtlSelect — those two findings are the whole reason commit `25ac006` exists.
10. **Withdraw C6 on two of three sites, apply the third** — `.step-item.is-active .step-label` semibold → medium in all three frameworks, then bind 24 stepper labels (already ty/control, so nothing moves). Leave `.step-circle` and `.breadcrumb-current` alone. *Gate consequence:* `check:typeface` unaffected; `[ROOT-TYPE]` unaffected.
11. **Then** the analysis's remaining C-list (C1 grown to three headers including AtlCard, C2, C3, C4, C5, C7, C8) and only after that promote `[TEXT-UNSTYLED]` from ratchet to blocker.

**Ordering constraint stated once more, because it is the thing to get wrong:** step 3 before step 9. Every binding in step 9 that touches a node carrying a fontSize variable replaces a token reference with a literal, and 212 nodes are in that state today.

---

## 6. Verified vs assumed

### Verified — re-derived this session by a named command or query, most by two routes

| Claim | How |
|---|---|
| 566 TEXT / 311 unbound / 255 bound / 43 masters / 24 unbound combinations | `node -e` over `text-nodes.json`, **and** my own live `figma_execute` walk of `🧩 Components` |
| A = 12 drawn / 11 visible / 4 masters; B = 35 / 18 records / 8 masters; C = 9 / 5 / 4 | same census, per-master expansion printed |
| AtlMenu default = 16/125%, compact = 14/125% | `variantScope` printed per record |
| All 255 bound nodes match their style's family/weight/size/leading exactly | grouping bound records by style × own values — one bucket per style |
| Only 3 groups in 566 master TEXT nodes carry a non-default `letterSpacing` or `textCase`; AtlTh is `P:1 / UPPER` | my own live sweep |
| All 10 `ty/*` styles are `ls P:0 / case ORIGINAL / deco NONE` **and** `boundVariables: {}` | two live `getLocalTextStylesAsync()` queries |
| `Docs Brand Tokens` = 39 variables, all COLOR; `3:165–3:170` absent from it and from `getLocalVariablesAsync()`; 221 locals | my own live query resolving every collection member |
| Components page = 755 TEXT / 338 unbound-size / 394 zombie / 23 live | my own live per-page query |
| 43 masters / 1976 nodes / 4999 live bindings / 228 zombie = 212 fontSize + 16 effects on 8 focus variants | my own live walk (node-level `boundVariables` only — no paint double-count) |
| All 8 counterparts exist in Library Tokens, value-identical; `877:384`/`877:405` lack `EFFECT_COLOR` scope | my own live query printing `valuesByMode` and `scopes` |
| 1752 file-wide TEXT: 336 styled / 538 variable / 878 neither / **0 both** | my own live walk of all 9 pages |
| `nonSemanticTokens` = 196 fields, **0 entries** in the committed snapshot | `node -e` walk of `snapshot.json` |
| Baselines 206 / 212 / 8 / 4 / 257 | `node -e` over `type-baseline.json` summing `×N` multiplicities |
| No component stylesheet in any framework states weight 400 or `normal`; declared weights are medium 8, semibold 17, bold 2, inherit 1 | `grep` returning empty; `sed | sort | uniq -c` |
| semibold declarations: react 14 files / 17 lines, vue 14 / 17, **angular 15 / 18** — the extra is `atl-option.css:62` | `grep -rln` and `grep -rn`, both run |
| `libs/angular/src/lib/select/atl-option.css` exists and is a real A site at `:27 + :48 + :45` | read the file end to end |
| `.atl-select .error-message` is the only one of seven missing `line-height: normal` | per-file `grep -A6 'error-message {' \| grep -c line-height` → 1,1,1,1,**0**,1,1 |
| `.atl-card` normal (:31) + `.atl-card-header` lg/semibold/no-leading (:82-83) → SemiBold 18/1.5 vs 12 nodes on ty/title at 125% | read the file; bound-node dump |
| `.atl-chat` line-height normal (:38), so `.chip-label` (:373-375) resolves 1.5 not tight | read atl-chat.css:28-38 and :373-381 |
| The table ladder covers thead **and** tbody at :96-115; thead adds wide + uppercase at :64-65 | read atl-table.css:55-120 |
| `--ui-letter-spacing-wide: 0.01em` (tokens.css:43); tokens.css:103-105 says the roles do not touch letter-spacing | read |
| All five CSS defects at the stated file:line, incl. Angular tooltip having zero `white-space` declarations and Angular's radio emitting a bare `<ng-content />` | read each file; `grep -c` |
| Vue's toggle binds only `is-invalid`/`is-disabled` while `.is-checked` rules exist; Vue pagination binds `active` against `.is-active`; Vue emits `<li class="error">` against `.error-message` | read all three templates and stylesheets |
| Working tree clean; no Figma write; no source file edited | `git status --porcelain` → empty, after the last query |

### Assumed — and the honest label for each

| Assumption | Why it matters | Who falsifies it |
|---|---|---|
| **Nobody ran a browser for the cascades.** Every resolved value in §2 is hand-derived from CSS files | if one is wrong, the role it justifies is wrong. The three most exposed are the same three the analysis named: `.step-description` and `.breadcrumb-link` resolve weight 400 by CSS *initial value* because no rule in either chain declares one, and `.chip-hint`'s "UA control font" rests on a premise no stylesheet in the repo states | one Storybook session with DevTools on those three |
| **Applying a text style *clears* a fontSize variable binding** | decides whether path B was ever viable. The disjointness is measured across 1752 nodes; the causation is not | one write on a throwaway node in a scratch file |
| The browser measurements in §4 (12px/14px/16px empty cell, 368px tooltip overflow, 59.5/71.5/83.5px radio, 32×32 chat close) | they are the whole evidence for #1, #3 and #5 being real rather than theoretical | I did not re-run them; two independent dossier runs did, with matching directions and differing magnitudes on the tooltip (that number is a property of the fixture's sentence, not of the component) |
| **A `<button>`/`<textarea>` UA `font` shorthand blocks inherited family and leading** | defect #4's entire premise | standard behaviour, but no stylesheet in the repo states it |
| The rebind in step 3 produces no visual diff | it is what makes D2 cheap and review-free | it follows from value identity, which I verified for all 8 counterparts — but nothing has been rendered |
| That step 3 takes `[FIGMA-VARIABLE-COLLECTION]` to 0 | the gate consequence in §5 | it follows from `check-figma.js:1676` reading `rec.fontSizeVariableCollection`, which I read — but no snapshot was run, and running one would dirty the tree (`figma-snapshot.mjs:640-643` stamps `generatedAt` into both artifacts). Prediction, not measurement |
| The CSS-site counts for A, B and C are complete | a missed site changes a rule-of-three input | I re-derived all 17 React semibold declarations and read every A and B site in React plus the divergent Angular ones. I did **not** resolve every Angular and Vue cascade independently — a framework-only site could still be hiding, and one already was (`atl-option.css:62`, found only because the declaration counts differ 18 vs 17) |
| Nested-instance dedup is the right unit | it turns B's 35 into 10 and C's 9 into 4 | no ADR states a dedup rule; ADR-0074 counted raw nodes. I am tightening the precedent, not applying it |

---

## 7. The weakest point of this document

**The counting rule in §0 is mine, and it is the load-bearing thing here that no prior decision authorised.**

ADR-0074 counted raw Figma nodes on three axes with leading ignored, and got 75 and 15. I count exact four-axis values, deduplicate nested instances, exclude invisible nodes, exclude icon-only glyphs, and exclude nodes carrying an axis the vocabulary cannot express. Under my rule, ADR-0074's own two roles would score 75 and 15 rather than something smaller — they survive — but that is luck, not validation: nobody has re-run the precedent under the successor's rule. Every verdict in §2 is a function of a rule invented for this document, and a reader who rejects any single exclusion gets different answers. Reject the letter-spacing exclusion and combination C becomes a live role candidate at 7 sites × 7 nodes, and the whole of §2.3 inverts. Reject the instance dedup and B goes from "clears by nothing" to "clears three times over". Reject the "faithful, not merely drawn" split and §5A's 27 comes back.

I have stated the rule explicitly and justified each exclusion against something the repo already does elsewhere, which is the most I can do without an ADR to point at. **The rule should be argued and adopted in the ADR that closes D1, before the numbers it produces are quoted.** If it is quoted first and argued later, this document becomes the next `§5A`.

Two smaller ones, unprompted. First, everything in §2's CSS column is hand-derived from stylesheets in a text editor — no browser ran, which is the same admission the analysis made in its own §7 and which I have not improved on. Second, the whole of §2's Figma column measures a file that is being counted **before** the corrections that would change it: A's evidence grows after the 14→16 fixes and B's shrinks, so minting both today locks in a pre-correction picture. I think that is the right call — A is the one that grows and A is the one I am most confident about — but a reader who wants the strongest possible evidence should sequence the size corrections first and re-run the census, and I cannot show that they would be wrong to.
