---
status: accepted
date: 2026-09-05
sources:
  - tools/scripts/check-prop-surface.js
  - tools/scripts/lib/allowlists.js (PROP_SURFACE_EXEMPT)
  - tools/scripts/check-docs-sync.js:101-142 (the checker-based spec flattening this gate reuses)
  - tools/scripts/check-host-attr-guards.js (the per-@Component block splitting this gate reuses)
  - libs/spec/src/index.ts
  - libs/react/src/lib/input/atl-input.tsx:10,37 (the readOnly outlier)
  - libs/angular/src/lib/input/atl-input.ts:120
  - libs/vue/src/lib/input/atl-input.vue:15
  - plan/adr/0091-a-caption-two-adapters-shipped-and-the-contract-missed.md (deferred this gate explicitly)
  - plan/adr/0025-cross-framework-a11y-conformance.md (precedent: a new gate gets its own ADR)
  - plan/adr/0082-a-blocker-the-chain-cannot-clear.md (precedent: a finding that is real but not yet actionable warns instead of blocking)
  - tasks/schulung-review-2026-09-02.md (B2, which asked for this gate)
---

# ADR-0093: The contract two adapters were never held to

## Status

Accepted. `check:props` compares each component's prop surface against its spec
interface in all three adapters. Wired into `check:all` after `check:host-guards`.
Ships **exit 0 with 55 `gap` exemptions in 14 groups** — every pre-existing
divergence is recorded and warns on every run; nothing was fixed inline.

## Context

ADR-0091 fixed `AtlInput.label` shipping in React and Vue while being absent from
both `libs/spec` and Angular, and deferred the gate that would have caught it —
"a separate task with its own agent". Schulung review item B2 asked for the same
thing. Earlier today a second instance landed: Angular's `AtlSelect.required` was
declared as an `input()` and rendered nowhere, found by hand only because Select
is exempt from the a11y gate.

Exploring for this gate turned up why the class keeps recurring:

> **Vue and Angular have no type-level link to the spec at all.** Zero Angular
> component classes `implements` or `extends` an `Atl*Spec`; only 6 of 31 `.vue`
> files import from `../spec`, and always for a union type, never as a props
> interface. React is the only adapter the compiler holds to the contract.

So for two of three adapters, "one spec, three frameworks" was a convention with
nothing behind it. And no existing gate looked: `check:sync` compares
directories, `check:spec` compares a verbatim file copy, `check:defaults`
compares default *values* of axis props, `check:variants` compares CSS classes,
`check:metadata` never reads the adapters at all. The nearest analog,
`check-docs-sync.js`, compares the spec against the hand-written docs table
rather than against adapter source.

The blast radius was measured by reading every component file before deciding
anything: **7 of 29 components carry an unambiguous cross-framework divergence,
14 once the spec-completeness gaps are counted.** A gate that must ship green
would therefore have meant a large cleanup first.

## Decision

**Add `check:props`** (`tools/scripts/check-prop-surface.js`). Deliberately not
named "parity": `check:parity` already exists and is the Figma design-parity
persistence gate (ADR-0024, ADR-0082). Three rules:

- **`[MISSING]`** — a spec prop absent from an adapter's declared surface.
- **`[EXTRA]`** — an adapter declares a prop the spec does not have.
- **`[DEAD]`** — a declared prop whose name appears nowhere else in its own file.

Four decisions inside those rules carry the weight:

**Change callbacks are mapped, not excluded.** `AtlFormFieldSpec` declares
`onValueChange`, i.e. the spec models change handlers in the React shape. Angular
answers with `model()`, Vue with an `update:*` emit. A literal set comparison
would flag ~16 props across 17 directories as missing, so a spec prop matching
`on<X>Change` is satisfied by an Angular `model('<x>')`/`output()` or a Vue
`update:<x>` emit. Excluding the pattern would have been easier and would have
checked nothing; mapping it verifies the contract is actually honoured.

**Native passthrough attributes are ignored in the `EXTRA` direction only.**
React's props interfaces extend `InputHTMLAttributes` and friends and spread
`{...rest}` onto the native element, so `id`, `aria-label`, `aria-labelledby`,
`aria-describedby` and `type` already work there without being declared. Angular
and Vue have no equivalent: declaring the prop is the only way for them to offer
the same surface, so declaring it is conformance with React's behaviour, not
drift from the spec. `MISSING` is untouched by this — where the spec *does*
declare one of these names, an adapter lacking it is still an error, which is
what keeps `AtlButtonSpec:aria-label` red for Angular and Vue.

**`readOnly` is reported, not normalised** — and the first draft of the ignore
list got this wrong. The spec says `readonly` (`AtlReadonlySpec`), Angular and
Vue agree, and React alone spells it `readOnly`, explicitly `Omit`-ing the HTML
attribute in order to redeclare it (`atl-input.tsx:10,37`). It is therefore not
passthrough at all, and `<AtlInput readonly>` written against the documented
contract silently does nothing in React. Normalising the two spellings would
have made the gate agree with a bug — the same defect class as `AtlInput.label`,
in the opposite direction.

**`DEAD` is file-scoped, not component-scoped.** React's `AtlStep` and `AtlTab`
are `({children}) => children`, with the parent component in the same file
reading `element.props.label`. That is a legitimate compound-component pattern; a
component-scoped rule false-positives on 9 props across those two. File-scoped it
leaves the real hits, and found a third: `AtlRadioGroupSpec.name` in Angular,
declared with a doc comment claiming it is "propagated to all child radio
inputs", referenced nowhere else in the file.

**Ship the gate first; record every existing finding as `kind: 'gap'`.** The
alternative — clean up all 14 components, then ship green — was rejected as the
bigger and later option: it would leave the repo unguarded against *new* drift
for as long as the cleanup took, and the `errors` gap alone needs a shared type
across `WithOptionalFieldTree<ValidationError>[]` and `string[]`, which is a
contract change with its own ADR. `gap` entries warn on every run (ADR-0082's
precedent: a real finding that is not yet actionable nags rather than blocks), so
the backlog is visible instead of silent while the gate earns from day one.

**Report what was not checked.** Seven components have no spec interface to key
on (`AtlCodeBlock`, `AtlAccordionHeader`, `AtlMenuSeparator`, `AtlMenuTrigger`,
`AtlChatInput`, `AtlChatTyping`, `AtlThead`) and are named in the summary line
rather than silently skipped. `toast` is excluded outright: Angular takes four
flat props where React and Vue take one `data: ToastData` object and the real API
is imperative, so a set comparison cannot express the mismatch — allowlisting it
would pretend it had been checked.

**Alternatives rejected:**

- *Make Vue and Angular extend the spec types instead of gating.* The real fix
  for the root cause, and out of reach for Angular: signal inputs are class
  fields, not a props object, so no interface can constrain them. Vue's
  `defineProps<AtlXSpec>` could work and is worth its own investigation — the
  gate does not preclude it, and would verify it.
- *Exclude the change-callback pattern* the way Vue's `update:*` emits are
  excluded. Cheaper, and it would have stopped checking the one contract the
  spec actually models.

## Consequences

- 40 keyed components compared across three adapters, 7 reported unkeyed, 55 live
  exemptions in 14 groups, exit 0. `check:all` is now 34 gates.
- Negative-tested per rule, each restored with a clean `git diff`: a removed spec
  prop fails `[MISSING]`; an added non-spec prop fails `[EXTRA]`; an unreferenced
  prop fails `[DEAD]`; a deleted-but-still-true `gap` entry turns the gate red
  rather than passing silently. Independently re-run for the case that matters
  most — renaming Angular's `AtlInput.label` produces both `[MISSING] label` and
  `[EXTRA] labelXX`, proving the passthrough ignore did not swallow the `MISSING`
  direction.
- Warnings are grouped by reason — 55 individual lines would have been ignored
  within a week; 14 grouped ones read as the two or three decisions they actually
  represent.
- **The gate is spec-keyed, so it cannot see adapter-vs-adapter divergence where
  the spec is silent.** Vue's dialog hardcodes its own `headerId` as the
  `aria-labelledby` target while Angular and React expose the prop — a real
  divergence this gate structurally cannot report, because `AtlDialogSpec`
  declares neither. Tracked in `tasks/todo.md`; closing it means completing the
  spec, not extending the gate.
- `component-map.js`'s registry maps `AtlRadioGroupSpec` to the metadata *module*
  `radio` (shared with `AtlRadioSpec`), not to the `radio-group` component
  directory. The gate carries a local one-entry `DIR_OVERRIDES` with a comment
  rather than changing `component-map.js`, whose metadata-module semantics other
  gates depend on.
- Two findings are defects rather than gaps and are queued as such: React's
  `readOnly` outlier (a breaking rename, its own ADR) and Angular's dead
  `AtlRadioGroupSpec.name` — the second dead-prop instance today after
  `AtlSelect.required`, which is the pattern that justified the `[DEAD]` rule.
