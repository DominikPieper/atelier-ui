---
status: accepted
date: 2026-09-07
sources:
  - libs/angular/src/lib/select/atl-select.ts:82-146 (before/after: role="combobox"
    moved from the host to the trigger `<button>`, alongside `aria-required`)
  - libs/angular/src/lib/select/atl-select.spec.ts (updated assertions: role and
    aria-required now read off `button.trigger`, not `atl-select`)
  - libs/angular/src/lib/combobox/atl-combobox.ts:48-53 (in-framework precedent:
    role="combobox" already co-located with aria-expanded/aria-controls/
    aria-activedescendant on the same `<input>`)
  - libs/react/src/lib/combobox/atl-combobox.tsx:169-174 (cross-framework
    precedent: identical co-location on the `<input>`)
  - libs/react/src/lib/select/atl-select.tsx (confirms React's Select is a plain
    native `<select>` with no hand-authored role — this defect is Angular-only)
  - plan/adr/0092-a-guard-hand-copied-three-times-now-a-gate.md (revises its
    Consequences' "Out of scope, unchanged" entry — the host-vs-button question
    it explicitly deferred; corrected in place, same commit)
  - plan/adr/0091-a-caption-two-adapters-shipped-and-the-contract-missed.md (the
    aria-label host-guard reasoning this ADR keeps in force, restated for the
    host's new roleless state)
  - plan/adr/0007-cdk-where-complex-manual-where-simple.md (the native-`<select>`-
    vs-CDK-overlay-listbox split `A11Y_PARITY_EXEMPT`'s `select`/`combobox`
    entries rest on — confirmed unaffected by this change)
  - tools/scripts/check-host-attr-guards.js (the guard rule is unconditional on
    the alias existing, not conditional on the host carrying a role)
  - tools/scripts/check-a11y-parity.js + tools/scripts/lib/allowlists.js
    (`A11Y_PARITY_EXEMPT`) — confirmed `select` carries zero committed
    snapshots today, so the roster/hygiene checks do not engage
  - WAI-ARIA 1.2, §5.3 role tables: combobox's required states include
    `aria-expanded`; `aria-activedescendant`'s supported roles do not include
    `button` (https://www.w3.org/TR/wai-aria-1.2/)
---

# ADR-0109: A role with none of its own required state

## Status

Accepted. `AtlSelect`'s Angular adapter now puts `role="combobox"` on the
trigger `<button>` — the same element that already carried every other
combobox ARIA state — instead of on the component host. `aria-required`
moves with it. The host is now roleless.

## Context

ADR-0092 built `check:host-guards` to enforce the `'[attr.aria-label]':
'null'` guard pattern, and its Consequences explicitly deferred a structural
question it found but did not take a position on: "whether `AtlSelect`'s
`role="combobox"` belongs on the host at all, versus the focusable trigger
button that carries every other combobox ARIA state." This ADR answers that
question.

**Measured, before any fix:** `atl-select.ts` put `role: 'combobox'` on the
`@Component` host (a bare object-literal `host: { role: 'combobox', … }`,
line 132), while `aria-expanded`, `aria-haspopup`, `aria-controls`, and
`aria-activedescendant` were all bound on the inner trigger `<button>`
(lines 90-93). The host carried no `tabindex` anywhere in its bindings or
template (grepped, zero matches) — it is not focusable, and an Angular
component tag is not a native Custom Element, so it has no implicit ARIA
semantics of its own; its only accessible-tree presence came from the
explicit `role="combobox"`.

**This is a real ARIA violation, not a defensible split, on two independent
grounds:**

1. **The host's own `role="combobox"` is missing a required state.**
   WAI-ARIA 1.2 lists `aria-expanded` as a *required* state for `combobox`
   — the role's accessible object must itself carry the state that tells
   assistive tech whether the popup is open. The host had no `aria-expanded`
   binding anywhere; that state lived exclusively on the button, a
   *different* accessible object. This is exactly axe-core's
   `aria-required-attr` check, and it would fail here.
2. **The button's states include one its role does not support.**
   The `<button>` has no explicit `role`, so its implicit role is `button`.
   `aria-activedescendant`'s ARIA-1.2 supported-roles list is
   `application, combobox, grid, group, listbox, menu, menubar, radiogroup,
   row, search, select, spinbutton, tab, table, textbox, toolbar, tree,
   treegrid` — `button` is not on it. `aria-expanded` and `aria-haspopup`
   *are* commonly valid on `button` (disclosure-button pattern), so those
   two alone would not have been a defect; `aria-activedescendant` is the
   one that turns this from "unconventional" into "invalid." This is
   axe-core's `aria-allowed-attr` check, and it would fail here too.

Combined, the practical assistive-technology experience was: a user
tabbing through the page never lands on the accessible object that has
`role="combobox"` (the host is unreachable by Tab), and the object they do
land on and interact with (the button) claims a state,
`aria-activedescendant`, that its own role does not license — so the
"active option" announcement while arrowing through the listbox is not
guaranteed to be exposed correctly by a real accessibility API mapping,
independent of whichever normalized tree `check:a11y-parity`'s jsdom-based
comparison (which does not model role/attribute *validity*, only presence)
would show.

**In-framework precedent — `AtlCombobox` already gets this right.**
Angular's own `atl-combobox.ts` puts `role="combobox"` on the same
`<input>` element that carries `aria-expanded`, `aria-controls`,
`aria-autocomplete`, and `aria-activedescendant` (lines 48-53) — no split at
all. React's `AtlCombobox` does the identical co-location on its `<input>`
(`atl-combobox.tsx:169-174`). So this was not a two-component convergence
question; `AtlCombobox` was never wrong, in either framework. `AtlSelect`'s
React adapter renders a plain native `<select>` with no hand-authored role,
confirming the defect is Angular-`AtlSelect`-only.

A repo-wide grep of every Angular host's `role:` binding
(`accordion → presentation`, `alert → alert`, `avatar → img`,
`badge → status`, `button → button`, `progress → progressbar`,
`toast → status` ×2, `tooltip → tooltip`, `menu → separator`,
`radio-group → radiogroup`) found no other component splitting a role from
its own composite ARIA states onto a nested focusable element — `AtlSelect`
was the only occurrence. Not a rule-of-three case; a single, isolated fix.

## Decision

**Move `role="combobox"` from `AtlSelect`'s host to the trigger `<button>`**,
alongside the ARIA states it already carries. **Move `aria-required` there
too**, for the same underlying reason `aria-invalid` and `aria-describedby`
were already correctly placed on the button rather than the host: `combobox`
is the role that supports `aria-required`; a roleless host does not, and
leaving `aria-required` behind would have swapped one unsupported-attribute
defect for a smaller, structurally identical one. The host keeps its
`(keydown)` listener unchanged — `keydown` bubbles from the only focusable
descendant (the button) up to the host regardless of which element carries
which ARIA role, so listener placement was never entangled with role
placement.

**What this does to the four things ADR-0092 left entangled with the host's
`role`:**

- **`'[attr.aria-label]': 'null'` guard** — stays, unchanged. ADR-0092's
  `check:host-guards` rule fires on the `ariaLabel` input's alias existing at
  all, unconditionally — it is not conditional on the host having a role.
  ADR-0092 built exactly this "prevention, not firefighting" reasoning for
  `AtlDialog` and `AtlTable`, both already-roleless hosts guarded against a
  role they might gain later. `AtlSelect`'s host is now in the identical
  position: the guard is a harmless no-op today and stays defended anyway.
  Only the code comment's *reason* needed correcting — it previously said
  the guard mattered because "the host already carries `role="combobox"`,"
  which is no longer true; the comment now says what Dialog/Table's already
  say.
- **`[attr.aria-required]` on the host** — moved to the button (see above),
  not left in place. Verified by updating both host-vs-button assertions in
  `atl-select.spec.ts` and rerunning `nx test angular` (see Consequences).
- **`check:host-guards`** — unaffected; confirmed by running it after the
  change (see Consequences). It never asserted anything about `role`
  placement — ADR-0092 recorded that question as explicitly out of its
  scope, and this ADR is the resolution, not a change to that gate.
- **The host's `(keydown)` handler** — unaffected; left in place. Reasoned
  above: DOM event bubbling does not depend on ARIA role placement, and
  moving a listener that already works correctly would be a change with no
  correctness payoff, against `AGENTS.md`'s "minimal impact" principle.

**`check:a11y-parity` — confirmed unaffected before making the change, not
assumed.** `select`'s `A11Y_PARITY_EXEMPT` entry
(`tools/scripts/lib/allowlists.js`) is `kind: 'design'`, and its reason is
the native-`<select>`-vs-CDK-overlay-listbox split (ADR-0007) — Angular
renders a CDK overlay panel where React/Vue render a browser-native
`<select>`; the trees were always going to differ structurally regardless of
which Angular element carries `role="combobox"`. Read literally: this
exemption is about the panel/listbox shape, not about where inside Angular's
tree the role sits. `ls tools/parity/a11y/` was checked directly: zero
`atl-select.*.json` or `atl-combobox.*.json` files exist, so the gate's
per-component comparison loop never engages for `select` today, and moving
the role neither creates a snapshot that could now diverge nor risks the
`[STALE]` hygiene check (which only fires when snapshots exist *and* an
exemption still names the component). Confirmed by running
`check:a11y-parity` after the change (see Consequences) — it stayed green,
unchanged.

## Consequences

- `AtlSelect`'s trigger button is now the sole accessible object carrying
  `role="combobox"` together with every state that role requires or
  supports (`aria-expanded`, `aria-haspopup`, `aria-controls`,
  `aria-activedescendant`, `aria-required`, `aria-invalid`,
  `aria-describedby`, `aria-label`) — matching the WAI-ARIA "select-only
  combobox" pattern and Angular's own `AtlCombobox` precedent. The host is
  roleless, matching `AtlDialog`/`AtlTable`.
- Two `atl-select.spec.ts` assertions (`aria-required` on/off) were moved
  from `atl-select` (host) to `button.trigger`; one new test pins the role's
  new location (`button.trigger` has `role="combobox"`, `atl-select` does
  not have a `role` attribute at all).
- Verified by running, not assumed: `nx test angular` (all Select specs
  pass, including the two rewritten and the one new assertion), `nx lint
  angular` (clean), `check:host-guards` (green, unchanged reasoning), and
  `check:a11y-parity` (green, unchanged — `select` stays exempt, zero
  snapshots, roster/hygiene checks do not engage it). Exit codes and command
  output are recorded in the task report, not restated here.
- **`plan/adr/0092-a-guard-hand-copied-three-times-now-a-gate.md` gets a
  dated in-place correction** pointing at this ADR, per `AGENTS.md`'s ADR
  convention and enforced by `check:adr-refs`'s `[ADR-CORRECTION]` check —
  its Consequences described the host-vs-button split as "a pre-existing,
  separately tracked structural question," and that question is now closed.
- **Alternatives rejected:**
  - *Leave the split in place, allowlist it in `HOST_ATTR_GUARD_EXEMPT`.*
    Rejected — that allowlist governs the `aria-label`/`id` guard pattern
    specifically; the host-vs-button role split is a different defect
    (missing required state, disallowed attribute) with no exemption
    mechanism built for it, and none should be built for a genuine ARIA
    violation with a one-line fix.
  - *Converge `AtlSelect` and `AtlCombobox` on a shared pattern by changing
    `AtlCombobox`.* Rejected on the evidence: `AtlCombobox` (both Angular and
    React) was already correct. There was nothing to converge — only
    `AtlSelect` needed to move.
  - *Also move `aria-invalid`/`aria-describedby` as part of this change.*
    Not applicable — both were already correctly on the button before this
    ADR; only `role` and `aria-required` were on the host.
- **Out of scope, left as found:** the same audit that found zero other
  Angular hosts splitting role from composite ARIA state did not re-audit
  React or Vue's `AtlCombobox`/`AtlSelect` beyond the two file:line spots
  cited above — a full cross-framework ARIA-validity sweep (running an axe
  pass against all three adapters' rendered output) is a larger, separate
  task, not a drive-by extension of this one-component fix.
