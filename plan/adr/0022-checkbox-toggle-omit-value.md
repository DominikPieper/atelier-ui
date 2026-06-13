---
status: accepted
date: 2026-06-13
sources:
  - "libs/spec/src/index.ts (LlmFormFieldSpec, LlmCheckboxSpec, LlmToggleSpec)"
  - "libs/{angular,react,vue}/src/lib/{checkbox,toggle}/* (all use checked, none use value)"
  - "docs-review finding: prop tables advertised a [(value)] alias no adapter implements"
supersedes: []
---

# ADR-0022: Checkbox and Toggle omit the inherited `value`/`onValueChange`

## Status

Accepted. Recorded at decision time. Refines **ADR-0001** (LLM-optimized API:
predictable, no surface that doesn't map to real behaviour) and sits under
**ADR-0006** (spec is the single source of truth).

## Context

Every form field extends `LlmFormFieldSpec`, which carries the value-based pair
`value?: any` / `onValueChange?`. That pair is the right contract for the
value-based fields — Input, Textarea, RadioGroup, Select, Combobox.

Checkbox and Toggle are **checked-based**: their state is `checked` /
`onCheckedChange`, and `value` has no meaning for a boolean control. Yet both
`LlmCheckboxSpec` and `LlmToggleSpec` plainly `extends LlmFormFieldSpec`, so they
*inherited* `value`/`onValueChange`. No adapter ever implemented them: Angular
uses a `checked` model (`FormCheckboxControl`), React explicitly
`Omit<…, 'value'>`s it off the native input props, Vue exposes only `checked` +
`update:checked`. The inherited pair was dead surface in the contract.

A docs review surfaced the downstream symptom: the checkbox/toggle prop tables
documented a `value` row with an Angular `[(value)]` alias "for Signal Forms
integration" — an alias that exists in no framework. A participant copying it
would bind a prop that is silently ignored.

Two honest fixes were possible: (a) make the adapters implement `value` to match
the spec, or (b) make the spec stop claiming `value` for these two. Option (a)
adds redundant API to satisfy an inheritance artifact and contradicts ADR-0001
(`checked` already *is* the state); option (b) makes the contract tell the truth.

## Decision

Checkbox and Toggle omit the inherited value-based pair at the spec level:

```ts
export interface LlmCheckboxSpec extends Omit<LlmFormFieldSpec, 'value' | 'onValueChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}
export interface LlmToggleSpec extends Omit<LlmFormFieldSpec, 'value' | 'onValueChange'> { … }
```

`Omit<…>` over redeclaration: it keeps the shared form-field props
(`disabled`/`readonly`/`invalid`/`required`/`name`) inherited and only subtracts
the two that don't apply — explicit intent, minimal surface, and it mirrors the
precedent already in the React adapter (`Omit<…HTMLAttributes, …, 'value'>`).
The docs prop tables drop the corresponding `value`/`onValueChange` rows.

**Alternatives rejected:** adapter parity (option a) — adds meaningless API;
docs-only removal — fixes the visible symptom but leaves the spec, the published
contract, still asserting props no implementation honours.

## Consequences

- The form-field family now splits cleanly in the contract: value-based (Input,
  Textarea, RadioGroup, Select, Combobox) vs checked-based (Checkbox, Toggle).
- Zero runtime/adapter change — all three frameworks already behaved this way; the
  spec and docs caught up to them. `check:all` (sync, spec, behaviors, docs,
  metadata, llms, …) stays green after `sync:generated` regenerates the spec
  copies, `behaviors.generated.ts`, and `llms.txt`.
- The form-field base stays prescriptively shared by the five value-based fields;
  nothing depended on *uniform* `value` exposure, so the abstraction is unaffected.
- An LLM reading the spec/docs/llms.txt is no longer told Checkbox/Toggle take a
  `value` — it generates `checked`-based code, the only thing that works.
