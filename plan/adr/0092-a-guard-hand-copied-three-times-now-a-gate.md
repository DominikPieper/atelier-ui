---
status: accepted
date: 2026-09-05
sources:
  - libs/angular/src/lib/input/atl-input.ts:62-80
  - libs/angular/src/lib/textarea/atl-textarea.ts:65-76
  - libs/angular/src/lib/select/atl-select.ts:131-144
  - libs/angular/src/lib/dialog/atl-dialog.ts:68-80
  - libs/angular/src/lib/table/atl-table.ts:75-86
  - tools/scripts/check-host-attr-guards.js
  - tools/scripts/lib/allowlists.js (HOST_ATTR_GUARD_EXEMPT)
  - plan/adr/0091-a-caption-two-adapters-shipped-and-the-contract-missed.md (the
    id/aria-label host-duplication defect this gate now enforces the fix for)
  - plan/adr/0025-cross-framework-a11y-conformance.md (precedent: a gate
    recorded as its own ADR when it closes a hole no existing gate covers)
  - tasks/todo.md (2026-09-05 follow-up: "a shared host-metadata constant or a
    gate would make it structural")
---

# ADR-0092: A guard hand-copied three times, now a gate

## Status

Accepted. `check:host-guards` enforces, per Angular `@Component` class, that
an input aliased to `aria-label`/`aria-labelledby` or literally named `id` has
a matching `'[attr.<name>]': 'null'` host guard. Wired into `check:all`
immediately after `check:defaults`. Two components caught on the gate's first
run — `AtlDialog` and `AtlTable` — both fixed by adding the guard, not by
exempting them.

## Context

ADR-0091 found and fixed a real Angular defect: a static attribute written on
a component's tag (`<atl-input aria-label="Name">`) matches an aliased
`input()` of the same name **and** independently survives on the host element
as a literal DOM attribute — Angular keeps static attributes even when they
also bind an input, unlike a `[prop]="…"` binding, which does not reflect.
Left alone, `id` duplicates onto both the host and the inner control (invalid
HTML, and it breaks `<label for>` association since the host is not labelable
and is first in document order); `aria-label`/`aria-labelledby` on a host that
carries a `role` becomes a second, competing accessible name next to whatever
names the actual widget.

ADR-0091 fixed this by hand in the three components that had it at the time —
Input and Textarea (`id` + `aria-label`), Select (`aria-label` only; it has no
`id` input) — by force-nulling the attribute on the host:
`'[attr.id]': 'null'` / `'[attr.aria-label]': 'null'`. Nothing enforced the
pattern staying in place, or being applied to the next component that aliases
one of these attributes. Its own follow-up list said so directly: "a shared
host-metadata constant or a gate would make it structural" — and named the
constant as the tempting option. A constant is still something a fourth
component's author has to remember to reach for; only a gate *detects* the
omission when they don't.

Auditing every Angular component for the pattern (`grep` across all
`atl-*.ts` for `alias: 'aria-label'`, `alias: 'aria-labelledby'`, and a
literally-named `id` input) found two more occurrences, both undefended:

- `AtlDialog` aliases both `aria-label` and `aria-labelledby` to the inner
  `<dialog>` element (`atl-dialog.ts:55-56`), with no host guard for either.
- `AtlTable` aliases `aria-label` to the inner `role="region"` scroller
  (`atl-table.ts:67`), with no host guard.

Both hosts are roleless today, so an undefended attribute is currently a
no-op, not a live defect — the same status Input's host had before ADR-0091
gave it a `role`-agnostic reason to guard anyway: an aria-label surviving on
a roleless host is silently useless today and silently wrong the day that
host gains a role (exactly Select's situation, whose host carries
`role="combobox"`). Prevention, not firefighting.

## Decision

**Add `check:host-guards`** (`tools/scripts/check-host-attr-guards.js`),
regex/line-based like its neighbors `check-defaults.js` and
`check-primitives.js` — no TS AST dependency. Scope: `libs/angular/src/lib/**/
atl-*.ts`, excluding specs and stories. Per Angular `@Component` class:

- aliases an input to `aria-label` → host must contain
  `'[attr.aria-label]': 'null'`
- aliases an input to `aria-labelledby` → host must contain
  `'[attr.aria-labelledby]': 'null'`
- declares an input literally named `id` → host must contain
  `'[attr.id]': 'null'`

**Grade per `@Component` class, not per file.** Several files declare more
than one component — `atl-dialog.ts` holds four (`AtlDialog`,
`AtlDialogHeader`, `AtlDialogContent`, `AtlDialogFooter`), `atl-table.ts` six.
Grading per file would let one component's `host` satisfy a sibling's
requirement: `atl-dialog.ts:149` binds `'[attr.id]': 'context.headerId'` on
`AtlDialogHeader` — a real id binding for a component with no `id` input at
all — and a file-level gate could misread that as `AtlDialog`'s guard. The
gate instead splits each file into blocks at the `@Component(` boundary and
checks each class only against its own decorator's `host` object and its own
class body. This is the same failure mode check-a11y-parity.js's own header
warns against: a gate reporting green for a thing it never looked at.

**Exemptions via `HOST_ATTR_GUARD_EXEMPT`** (`tools/scripts/lib/
allowlists.js`), keyed `<ClassName>:<attr>` — class, not component dir, for
the same per-class precision the file-splitting exists for. Same two-kind
convention as the file's other allowlists (`design` silent, `gap` warns every
run), plus the same `[STALE]` hygiene check the others have. **Started, and
stays, empty**: every alias/id found when this gate was built got the real
guard added, not an exemption — a fix is the correct outcome for a real
finding, and an allowlist entry would only have hidden it.

**Fix the two findings directly** rather than allowlist them: `AtlDialog`
gained both `'[attr.aria-label]': 'null'` and
`'[attr.aria-labelledby]': 'null'`; `AtlTable` gained
`'[attr.aria-label]': 'null'`. No other structural change to either
component.

**Alternatives rejected:**

- *A shared host-metadata constant* (the follow-up's other suggested fix).
  Rejected for the reason above: it reduces duplication but still requires
  the next author to remember to reach for it. Only a gate that fails CI
  without the guard removes the "remember" step.
- *Allowlist Dialog/Table as `gap`* instead of fixing them. Rejected — both
  fixes are one line each, the reasoning was already fully worked out by
  ADR-0091 for the identical pattern, and an allowlist is for a defect that
  is understood but not yet worth fixing, not a stand-in for a same-session
  fix that costs nothing more to make.

## Consequences

- `check:host-guards` runs in `check:all` right after `check:defaults`
  (component-source gates neighborhood), scanning 58 Angular `@Component`
  classes and triggering on 8 alias/id declarations (Input ×2, Textarea ×2,
  Select ×1, Dialog ×2, Table ×1), 0 exemptions, exit 0 on the current tree.
- Negative-tested both branches: deleting Select's `'[attr.aria-label]':
  'null'` line fails with `[HOST-GUARD] …atl-select.ts: AtlSelect aliases an
  input to 'aria-label' …`, exit 1; deleting Input's `'[attr.id]': 'null'`
  line fails with `[HOST-GUARD] …atl-input.ts: AtlInput declares an input
  literally named \`id\` …`, exit 1. Restoring either returns the gate to
  exit 0.
- `AtlDialog` and `AtlTable`'s roleless hosts can no longer silently pick up
  a competing accessible name if either ever gains a `role` — the exact
  failure Select's `role="combobox"` host already lived through before
  ADR-0091's fix.
- The next component that aliases `aria-label`/`aria-labelledby` or declares
  a literal `id` input, and forgets the host guard, fails `check:all`
  instead of shipping a silent duplicate-attribute or competing-name defect.
- Out of scope, unchanged: whether `AtlSelect`'s `role="combobox"` belongs on
  the host at all, versus the focusable trigger button that carries every
  other combobox ARIA state — a pre-existing, separately tracked structural
  question (`tasks/todo.md`), not something this gate's guard requirement
  takes a position on either way.
