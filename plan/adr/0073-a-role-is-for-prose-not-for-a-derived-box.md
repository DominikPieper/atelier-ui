---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0036-type-roles-not-axes.md (the roles this finally consumes)
  - plan/adr/0041-control-height-is-the-primitive.md (the arithmetic a role would hide)
  - plan/adr/0049-every-component-states-its-typeface.md (the gate that blocked the change)
  - plan/adr/0059-the-file-was-in-the-wrong-typeface.md (the 1.65 code leading this confirmed live)
  - plan/adr/0064-what-the-parity-stamp-rests-on.md (the stamps this made stale)
---

# ADR-0073: A role is for prose, not for a derived box

## Status

Accepted. Adds `tools/scripts/lib/type-roles.js` and the `[FONT-AFTER]` code, migrates
four rules onto the roles, and repairs two gates that could not see the shorthand.

## Context

The open item read: *"Migrate component CSS onto the type roles. The roles are declared
and verified but nothing consumes them yet; 25 of 29 stylesheets still hand-assemble
`font-family` + `font-size` + `font-weight`. Ordering suggestion: … then the form
controls, then the rest."*

Two things were wrong with it, and a census found both. Of **118 rules** that touch type
in the React stylesheets:

| | count | what it is |
|---|---|---|
| 1–2 of the four properties | 92 | a local override — a size bump, a weight. A role would say three things where the rule wants one. |
| ≥3 of the four | 25 | the shape a role could collapse |
| …of those, migratable | **4** | |

So the migration was never 25 rules. Reading the other 21 is the decision.

## Decision

**1. A role fits where the box is NOT derived from the leading.** Six rules name a
line-height token *inside a `calc()`* while also declaring it — ADR-0041's derived
padding:

```css
padding: calc((var(--ui-control-height-md) - var(--ui-line-height-tight) * var(--ui-font-size-md)) / 2 - …)
```

There the leading is an **operand in the box arithmetic**, not just a text metric. A
shorthand that bundles it away would leave the `calc()` naming the value the shorthand
hides — one number, two sources, in the same rule. That is the defect roles exist to
prevent, introduced by a role. Nine control *roots* fail for the same reason one level up:
their `tight` leading is what their inner element's padding formula mirrors.

**2. Two of the six "exact matches" were my matcher being lenient about absent
properties.** `.atl-avatar` and `.atl-badge` declare family, weight and leading but **no
`font-size`** — the size belongs to the variant (sm/md/lg). Treating "absent" as
"compatible" matched them to `--ui-type-title`, which would have forced `font-size: lg`
onto every avatar. **Third occurrence of this exact tolerance bug this session**
(`[LAYER-PAINT]`, `[TEXT-UNSPECED]`, here): *absent is not compatible.*

**3. The gate forbade the change ADR-0036 prescribes.** `check:typeface` looked only for
the `font-family` and `line-height` **longhands**, so `font: var(--ui-type-body-sm)` — the
role applied exactly as ADR-0036 asks — tripped `[NO-LEADING]`. Reproduced before fixing:
that is why nothing consumed the roles. `lib/type-roles.js` now reads the roles in CSS
terms and both gates use it. Only a bare role reference is recognised; a hand-assembled
`font: 600 15px/1.25 X` still answers to the longhand rules.

**4. `[FONT-AFTER]`.** `font:` resets `font-style`, `font-variant`, `font-stretch` and
`line-height`, so a longhand **above** it in the same rule is silently wiped. Not
theoretical — `atl-menu.css` already carries the scar in a comment: *"Declared above it,
the row's stated line-height was silently [wiped]."* Same shape as `[RESET-WIPED]`,
different reset.

**5. The migration silently deleted a working check, and a perturbation test caught
it.** `check:figma`'s `[ROOT-PAINT]` compares each master's root `fontSize`/`lineHeight`
to the CSS via `boxFromDeclarations`, which reads the `font-size` **longhand**. After
migrating, that comparison returned null for AtlAlert and AtlToast — and `check:figma`
stayed green, because a lost comparison looks exactly like a passing one. Proven by
perturbing `--ui-type-body-sm` to `3xl` on both trees: pre-migration
`✗ [ROOT-PAINT] AtlAlert: root text is 14px, but the CSS says 36px`; post-migration,
silence. `boxFromDeclarations` now expands the shorthand, and the perturbation reports
again.

**6. `[FONT-RAW]`: a `font:` shorthand is one role or `inherit`, nothing else.** Reviewing
my own change found that it opened a hole — a hand-assembled `font: 600 15px/1.25 Inter`
would hide the `15px` from `check:token-bypass` (which asks about the `font-size`
*property*, not the shorthand) and leave `[ROOT-PAINT]`'s comparison null again.
Constraining the shorthand to the two shapes the library actually uses — 12 role
references and 6 `inherit` (the native-element reset) — closes it and makes the shorthand
unambiguous for every gate that parses CSS.

## Consequences

- **Four rules migrated** — `.atl-alert`, `.atl-toast` (`body-sm`), `.atl-textarea`
  (`body-md`), `.code-block-pre` (`code`) — across three frameworks, twelve edits.
- **Verified in a real browser, not assumed.** Computed styles under a deliberately bold
  body: family, size and leading **identical** before and after in all four; `lh 23.1px`
  confirmed ADR-0059's 1.65 code leading live. The single change is
  **`font-weight: 700 → 400`**: the longhands let the component inherit the app's bold,
  the role takes control. That is ADR-0049's argument one property further, so it is the
  intended direction rather than a regression.
- `check:all` exits 0; `check:geometry` still makes **73** measurements, so no box
  measurement was lost the way the typography one was.
- The stale `[GAP]` exemption was rewritten. `--ui-font-mono`'s one remaining direct
  consumer is `.code-block-label` at mono/xs/semibold — no role says that, and one
  occurrence is not a role.
- **What the verification turned up, recorded rather than half-fixed:** the eight `ty/*`
  text styles are gated against tokens.css to three decimals and **509 text nodes in 37
  of 43 masters use none of them** (332 with `AUTO` leading; sizes 10/13/15/20/26px off
  the scale). Also AtlAlert's padding is bound to the *wrong* spacing variables (12/16 vs
  the CSS's 16/20), and AtlTextarea's text is 14px against the CSS's 16px — invisible to
  `[ROOT-PAINT]` because that cascade ends at `.atl-textarea textarea`, whose
  `font-size: inherit` resolves to null. Three separate items, each with its measurement,
  in `tasks/todo.md`.
