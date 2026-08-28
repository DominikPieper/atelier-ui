---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0080-a-guard-that-skips-is-not-a-check.md (the ratchet-vs-blocker test this applies, and the resolve-don't-skip rule)
  - plan/adr/0066-a-warning-nobody-can-clear.md (why the reverse direction is not shipped as a warning)
  - plan/adr/0043-the-geometry-contract-ships-with-the-component.md (the generated `:is(…)` block this gate must not report)
  - plan/adr/0007-cdk-where-complex-manual-where-simple.md (why adapters legitimately differ in internal markup)
  - plan/adr/0082-a-blocker-the-chain-cannot-clear.md (why check:all can be green while ten parity records are owed)
  - tasks/lessons.md (check:geometry scoped per directory, correct only until select/ held two components)
---

# ADR-0081: A class the CSS paints and no template emits

## Status

Accepted. `check:dead-selectors` is a plain blocker in `check:all`, between
`check:variants` and `check:css-tokens`, with five `gap` exemptions that warn on every run
and each name `tasks/todo.md` as where the decision is owed — the pointer the other `gap`
allowlists in `lib/allowlists.js` already carry, and what keeps five permanent lines from
being the warning ADR-0066 threw out.

## Context

`.atl-toggle.is-checked .track` is the only rule that fills a Vue toggle's track, and
`atl-toggle.vue` bound `is-invalid` and `is-disabled` and stopped. The published Vue
toggle never visibly turned on. React and Angular both emitted `is-checked`.

**It was never right.** The Vue adapter's first commit — `892ac6f`, 2026-03-21, "Add vue" —
already carried `.llm-toggle.is-checked .track` in the stylesheet and
`:class="{ 'is-invalid': invalid, 'is-disabled': disabled }"` in the template. There is no
commit where the two agreed and no regression to point at: the rule and the binding were
written apart. Version 0.0.5 went out two days later and every Vue release since — through
`v0.2.9` — shipped a switch that cannot show its on state. **160 days.** The unit tests
were green throughout, because `reflects checked state` asserts the native input's
`checked` property, which was bound correctly all along; what nothing asserted was the class
the paint hangs on.

That is a whole class of defect, not one bug: **a class the stylesheet paints and the
template can never put on an element.** Fourteen of them were found across two
frameworks and eight components, including a rename that missed one selector
(`:host(.is-readonly) .atl-combobox-input` against a template emitting
`combobox-input`), and four Vue form controls rendering `<li class="error">` under
stylesheets that style `.error-message`.

**Every gate here was blind to it, and structurally so.** `check:variants` walks the spec
unions and asserts the matching class *exists* in the CSS; `check:primitives`,
`check:token-bypass` and `check:css-tokens` read declarations, not selectors;
`check:typeface` splits rules but only to read `font-*`. Not one of them asks whether a
class the CSS selects can ever be emitted. The direction was simply missing.

Two things make the check harder than a grep, and both were established by measurement
before any code was written.

**Names are constructed.** Nine prefixes — `variant- size- shape- position- padding-
status- role- align- orientation-` — are built at runtime as `` `variant-${variant}` ``
or `'align-' + align()`, so no literal exists to find. A naive scan reports ~340 of them
dead. (A tenth axis family, `sort-`, is written out as literals in all three adapters —
`atl-table.ts:317`, `atl-table.tsx:155`, `atl-th.vue:30` — so it needs no resolution and
is checked by the plain string path. Nine is the number of prefixes that have to be
*resolved*; ten is the number of axis families this gate ends up owning.)

**The stylesheet↔template edge is not the filename.** Four Angular components ship no
`styleUrl` at all (`atl-menu-item`, `atl-menu-separator`, `atl-step`, `atl-tab`) and are
styled by a sibling's sheet. Vue's `import './x.css'` edge is worse than useless:
`atl-menu.css` is imported only by `atl-menu-trigger.vue` while three other SFCs in that
directory emit the classes it styles. Pairing by basename yields 355 findings.

## Decision

### 1. Resolve constructed names with the type checker; do not exempt a prefix

The tempting shape is a carve-out: ignore every class starting `variant-`, `size-`, and
so on. It was rejected. That is an exemption covering ten families that nothing else
owns — `check:variants` walks spec → CSS and never the reverse — so a `.variant-*` rule
with no spec member would be owned by no gate at all. It is also precisely the failure
ADR-0080 was written about: the carve-out is a guard that skips, and a guard that skips
is indistinguishable from a passing check.

Instead each `${…}` in a class-position template literal, and the right operand of a
`'prefix-' + expr`, is typed with `checker.getTypeAtLocation`. If the type is a
string-literal union the prefix is expanded over its members. This resolves all nine
prefixes exactly, and it needs no prefix→prop table — which would be wrong anyway, since
`AtlTooltipSpec`'s `position-` classes come from a prop named `atlTooltipPosition`.

Reading `libs/spec` directly was also rejected, for a reason found by measuring rather
than by arguing: React's radio-group declares `orientation` in its **own** props
interface and `AtlRadioGroupSpec` has no such field, so a spec-table resolver reports
React's live `.orientation-vertical` dead. The spec is still the real source in the
common case, because the component types re-export it; the checker just follows the chain
instead of hardcoding it.

**Where a substitution cannot be resolved the gate fails** with `[UNRESOLVED]`, naming the
file, the prefix and the type. It does not skip. Verified by widening one substitution to
`string`: the gate reports `[UNRESOLVED]` *and* turns the three `.variant-*` rules it can
no longer vouch for into blockers, rather than passing them in silence.

### 2. Scope is the component directory, per framework

Per-stylesheet is unavailable (the four Angular components with no `styleUrl`);
per-importer is wrong for Vue. The directory is the only unit that is correct in all
three adapters, and it is the *safe* direction of wrong: it can forgive, never invent.
This is the check:geometry trap from `tasks/lessons.md` — which hostified per directory,
correct only until `select/` held two components — and it does not recur here, because
this gate only asks "is this name emitted" and never has to rewrite a selector.

Cross-directory liveness is the **render relation**, and nothing wider. A still-unmatched
class is live in two shapes, both requiring that the two directories actually be parent and
child — read from the tag names in the source text (`<atl-checkbox`, `<AtlCheckbox`), a
name that has to match a real root in `lib/component-roots.js` before it counts:

- *a child's root used as a descendant selector* — `.atl-avatar .atl-icon`, where this
  directory renders the icon and the icon emits its own root. Three cases exist today.
- *a class the parent puts on the child's element* — `<AtlIcon className="invalid-icon"/>`
  lands in the input's bag while the rule for it may live in the icon's own sheet.

A blanket framework-wide fallback with no relation at all was measured and rejected: it
rescues 7 of the 14 real defects.

**Both halves of that were wrong in the first cut, in opposite directions, and both were
found by probing rather than by reading.** The root rescue asked only "is this another
directory's root, and does that directory emit it" — and a component always emits its own
root, so the second clause is a tautology and every `.atl-*` root was live in every
directory of the framework: `.atl-menu .atl-avatar` appended to React's menu sheet, a rule
for a child the menu does not render, passed silently. The parent-applied shape had no
rescue at all, so `.probe-fp-child` styled in `atl-icon.css` and emitted from
`atl-input.tsx` was reported as a **blocker on correct markup**, advising the author to
delete a live rule. Gating both on the render relation fixes the two together and leaves
the five exemptions and the 858-selector population unchanged.

### 3. A plain blocker, not a ratchet

ADR-0080's test for a ratchet is whether the remedy is gated on a decision nobody has
taken — there, retyping a node whose fontSize binds to a docs-site collection is not the
master's to change, so the count can never reach zero on this repo's authority. Nothing
like that is true here: every finding is a line of CSS or a line of template in this
working tree. Shipping a ratchet and satisfying its own promotion condition in the same
run is strictly worse than shipping the blocker.

The five findings that *are* decision-gated go in `DEAD_SELECTOR_EXEMPT` in
`lib/allowlists.js`, keyed `framework:dir:class`, all `kind: 'gap'` so they warn on every
run rather than settling in. Three parts and not four: the gate compares per directory,
and pairing a class to one stylesheet would be precision the check does not have. A
`[STALE-EXEMPTION]` fires when an exempted class becomes emitted, for the reason the other
allowlists give — an improvement nobody records can silently reverse.

The five: `orientation-vertical` and `orientation-horizontal` in Angular's and Vue's
radio-group (the axis exists only in React, and settling it is a spec change either way),
and `atl-checkbox` in Angular's table, where `.atl-tr-select-cell .atl-checkbox label`
centres a child Angular renders as the *element* `<atl-checkbox>` while React and Vue emit
the class. That last one was missed by the word-boundary sweep that found the other
fourteen, because `<atl-checkbox` matches the word `atl-checkbox`; comparing
class-position CSS against class-position emission is what separates them.

### 4. The reverse direction is not shipped

`[UNSTYLED-CLASS]` — emitted but selected by nothing — was built and measured with this
same extractor: **49 rows, and they are not one population.** Most are deliberate unstyled
markup hooks (`radio-text`, `checkbox-label`, `tab-panels`); some are vestigial
(`is-touched` on seven Angular components, after ADR-0055 dropped `touched` from the
contract); at least two are artifacts of the extractor rather than findings (`status-`,
because `AtlAvatarStatus` includes `''`). A blocker on that set would demand deleting
markup ADR-0007 entitles the adapters to differ on, and a warning on it is the unclearable
warning ADR-0066 refuses. It is recorded in `tasks/todo.md`, which is where an open
question belongs rather than in an allowlist that is only read when something fails.

One slice of those 49 is **not** an unstyled markup hook and should not be filed as one:
`is-checked` is emitted by Angular's and React's checkbox and not Vue's; `is-open` by
Angular's and React's dialog and not Vue's; `is-active`, `is-open` and `is-selected` by
Angular's select alone. No stylesheet selects any of them, so this gate is right to be
green — but a consumer who writes `.atl-checkbox.is-checked` gets three different answers
from three adapters, which is the Vue toggle's defect pointed the other way with the CSS
not yet written. Whether the state classes are public contract or private implementation is
the decision that settles it, and it is not this gate's to take. It is in `tasks/todo.md`
under its own heading rather than folded into the 49.

## Consequences

- **Fourteen dead rules are repaired and cannot come back — thirteen by emitting the class,
  one by deleting the rule.** Verified by reverting the repairs one at a time — the Angular
  combobox rename, the Vue toggle's `is-checked`, React's `is-checked`, Vue pagination's
  `is-active`, Angular radio's `is-invalid`, the combobox `.invalid-icon`, and the Vue
  `.error-message` markup — and watching the gate name that exact class each time, then
  restoring. Two of the fourteen are worth naming individually, because their remedies were
  not interchangeable with the rest:
  - **The deletion is Angular's `.atl-menu-panel`.** React and Vue keep the identical rule
    *and* emit it (`atl-menu.tsx:180`, `atl-menu-trigger.vue:78`), so on the face of the
    diff this looks like the divergence the `.orientation-*` decision refused to erase. It
    is not: Angular's `AtlMenuTrigger` is a bare `@Directive` host-directive over
    `CdkMenuTrigger` (`atl-menu.ts:26-36`), the CDK overlay positions the panel, and no
    `.atl-menu-panel` element is ever rendered. The rule was a copy of the React/Vue sheet
    for markup this adapter does not build, so emitting it would mean inventing an element;
    deletion is the only remedy available. `.atl-menu` still styles the box.
  - **Vue pagination's `is-disabled` repairs a contract, not a pixel.** `.page-btn.is-disabled`
    shares its declaration block with `.page-btn:disabled` (`atl-pagination.css:82`) and the
    buttons already carry the attribute, so nothing rendered changes. It restores class
    parity with the other two adapters, which is worth doing and is not the same claim as
    "a broken state now paints".
- **A required field was added to a published type and that is a breaking change.**
  `AtlRadioGroupContext` (exported from `libs/angular/src/index.ts`) gains a required
  `invalid: Signal<boolean>`, matching React's and Vue's contexts, which both already
  require it. The only in-repo implementor is `AtlRadioGroup`, which already declared
  `invalid` and satisfies the wider interface unchanged — but an outside implementor of the
  interface breaks, so it is semver-major and is recorded in `tasks/todo.md` for the next
  release note rather than left in a diff.
- **The gate blocked correct markup before it shipped, and only a probe found it.** A class
  a parent puts on a child component's element, styled in the child's own sheet, was
  reported dead — with remediation advice ("emit the class where the state is modelled, or
  delete the rule") that was wrong in both directions for that shape. It fired on nothing in
  the repo, because every one of the 33 such sites happens to style the hook in the emitting
  component's sheet, so no amount of running the gate would have surfaced it. §2 records the
  repair; the lesson is that the false-*positive* direction of a new blocker needs a
  constructed probe exactly as much as the false-negative direction does.
- **Symbol resolution is the load-bearing part, and it was proven so rather than assumed.**
  Neutering `getSymbolAtLocation` takes the gate from 5 findings to 288 (149 React, 131
  Vue) while still exiting like a gate that ran. The widely-repeated warning about
  `setParentNodes` turned out **not** to apply to a Program — the binder sets parents
  anyway — but it is genuinely load-bearing for the one standalone `createSourceFile`, in
  the Vue template-expression rewriter, which throws without it. The header says which of
  those two is measured and which is insurance.
- **Ten axis families are now owned by a gate for the first time.** `check:variants`
  asserts spec → CSS; this asserts CSS → template. They can disagree loudly and that is
  the point: `.orientation-vertical` exists in all three radio-group stylesheets, so
  `check:variants` is green, while two frameworks never emit it.
- **Directory scoping forgives one real defect shape, and the forgiveness was measured, not
  assumed.** `.probe-cross-sheet` added to `select/atl-option.css` and emitted only from the
  sibling `atl-select.ts`, where it can never land on an option, is reported zero times.
  Blast radius is exactly two directories: of all 89 component stylesheets, only Angular's
  `select/` and `toast/` hold more than one, and every one of the 89 is referenced from its
  own directory (no orphans). Stated in the header as a limit rather than left to be
  discovered, because the tighter rule is not available — this is the `check:geometry` trap
  `tasks/lessons.md` records, entered knowingly and bounded.
- **Names are compared, not elements.** `atl-select.ts` adds `is-open` to the overlay panel
  at runtime while the host carries `is-open` too, so a rule targeting one is rescued by
  the other. Deciding that needs a rendered DOM, which is `check:geometry`'s job and costs
  a browser.
- **Cost is ~2.8s** for three TypeScript programs over 89 stylesheets and 858 class
  selectors — cheap next to `check:geometry`, which launches Chromium.
- `@vue/compiler-sfc` splits the SFCs. It resolved only as a hoisted transitive of `vue`,
  which `npm ci` happens to accept and `tasks/lessons.md` records as exactly the assumption
  not to rely on; it is now a declared devDependency and `package-lock.json` records it, so
  the next `npm install` cannot quietly rewrite the intent.
- **What this gate still cannot see, stated from the false-negative hunt rather than from
  the design.** (a) A class emitted in one directory and styled in a sibling stylesheet of
  the same directory — bounded at two directories, above. (b) A class the render relation
  cannot reach: applied two components out, or by a consumer app; the relation itself is
  read from tag text and over-collects, so a directory that merely mentions `<AtlIcon>`
  counts as rendering it. (c) Names, not elements — `atl-select.ts` puts `is-open` on the
  overlay panel while the host carries it too, so a rule for one is rescued by the other,
  and separating them needs a rendered DOM. (d) The whole reverse direction (§4). (e) The
  collector over-collects into the bag along three channels, not the one first documented:
  an axis member (`variant = 'elevated'`), a comparison operand (`sortDirection() === 'asc'`
  contributes `asc`), and an object-literal KEY, because the branch that reads Vue's
  `:class="{…}"` runs on every object literal, so `input(false, { alias: 'disabled' })`
  contributes `alias`. Each was found by probing a rule that selects it and watching the
  gate stay quiet. Measured: gating the object-key branch to Vue produces zero new findings,
  so nothing is masked today — but the channel is wider than "a destructured default", and
  the header now says all three. **This list is the point.** A gate that found fourteen
  defects on its first run invites the claim that the direction is now covered; it is not,
  and ADR-0080's lesson was earned three times in one week by records that said otherwise.
