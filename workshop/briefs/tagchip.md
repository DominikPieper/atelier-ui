# Component brief — TagChip

> **Source: composed, not canonical.** There is no `tag-chip` or `chip` in the uianatomy
> roster — `list_components` returns 41 ids and `search_components("chip")` returns
> nothing. This brief assembles one from two records that _are_ canonical:
> the `tag` and `tag-remove` slots of `tag-input`, and the whole of `badge`
> (`get_component_view(…, view: "designer")`, read 2026-08-29). Where the two disagree,
> the disagreement is called out rather than smoothed over.
> **Starter frame:** `TagChip / Starter` — node `703:352` on the `🛠️ Workshop-Templates`
> page.
> **Read [`README.md`](README.md) first** — the shared rules and the "done when" bar
> live there and are not repeated here.

A compact labelled token that can be removed. It looks like a Badge and behaves like the
`tag` inside a Tag Input, and the gap between those two facts is the entire brief: a
Badge is **read-only by canonical contract**, and the moment you put an × on it you have
inherited a hit-target obligation the Badge was never designed to meet.

---

## 1. Anatomy

Six slots. Three come from `badge`. `remove-button` is `tag-input`'s `tag-remove`;
its two children are not slots `tag-input` declares — they follow the
`close-button` / `close-icon` / `close-label` split that `toast` records, which is
where the canonical roster puts an accessible name on an icon-only control.

| Slot            | Required            | From                           | Figma                         | What it is                                                                                                                 |
| --------------- | ------------------- | ------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `root`          | yes                 | badge `root` + tag-input `tag` | frame, auto-layout horizontal | The pill surface. Carries the variant treatment, the radius, and the padding budget.                                       |
| `icon-leading`  | no                  | badge                          | instance                      | Optional glyph before the label, on the leading edge with a consistent gap.                                                |
| `label`         | yes                 | badge                          | text                          | The chip's text and its accessible name. A noun phrase, truncating with ellipsis when it overflows.                        |
| `remove-button` | no                  | tag-input `tag-remove`         | instance                      | Real `<button>`. Icon-button at the inline-end. Absent on read-only chips.                                                 |
| `remove-icon`   | yes (of the button) | toast `close-icon`             | instance                      | The × glyph. Decorative, always.                                                                                           |
| `remove-label`  | yes (of the button) | toast `close-label`            | text                          | The accessible name: `"Remove <label>"` — the wording is `tag-input`'s. Visually hidden, or an `aria-label` on the button. |

**Token budget.** `root`: background `color/surface-sunken` (neutral) or the severity's
`color/<severity>-bg`, foreground `color/text` or `color/<severity>-text`, border
`color/border`, radius `radius/full` for a pill or `radius/sm` for a rectangular chip,
padding and gap off `spacing/*`, type `font-size/xs` at `font-weight/semibold`.
`remove-button`: foreground `color/text-muted`, focus ring off `color/input-border-focus`.

**Where the two sources disagree.** `badge` puts the pill at `radius.pill` and the type
at `text.xs`; `tag-input`'s `tag` puts it at `radius.sm` and `text.sm`, because a tag
sits inside a form control and matches the input's type. Pick one and write the reason
into the description. A standalone chip is closer to a Badge; a chip inside a field is
closer to a tag. This decision _is_ the design work.

---

## 2. Axes

**Variant (the severity axis, from `badge`):** `default` · `success` · `warning` ·
`danger` · `info`. A closed enum — the same one the CSS contract maps to token pairs.

**Properties (not variants):**

| Property    | Kind    | Values     | From      |
| ----------- | ------- | ---------- | --------- |
| `size`      | enum    | `sm`, `md` | badge     |
| `removable` | boolean | —          | tag-input |
| `hasIcon`   | boolean | —          | badge     |

`removable` is the axis that turns a Badge into a TagChip, and it is a **property**, not
a variant — exactly as `badge` models `dot`. Forking "Chip" and "Removable Chip" into two
components is the documented drift: they diverge in padding, size and border within a
release or two.

### Scope for the 90-minute block

**In scope: `default` and `success`, with `removable: true`.** Two severities prove the
token pairing; `removable: true` is what makes this a TagChip at all and drags in the
whole a11y section. The chip is not itself the interactive element — the remove button
is (§3) — so per [`README.md` item 1](README.md#done-when) it draws no `state` axis at
all: hover and focus-visible on the × go into the master's description, exactly like the
states listed as out of scope below.

**Out of scope, and say so in the description rather than silently omitting:**
`warning`, `danger`, `info`, the `sm` size, `hasIcon`, Badge's own data states (`idle`,
`updated`, `max`, `hidden` — §3), the remove button's `hover`/`focus-visible` states, and
the selected/keyboard-navigated state a chip acquires inside a Tag Input — none of these
draws as a chip-level `state` axis; document them in the master's description instead.

---

## 3. States

**Interactive:** `hover`, `focus-visible` — on the **remove button**, not on the chip.
The chip itself is not a button. `badge`'s canonical record lists _no_ interactive states
at all, which is the honest starting point: the only focusable thing here is the ×.
Neither is drawn as a chip-level `state` axis — the chip is not the interactive element,
so per [`README.md` item 1](README.md#done-when) these go into the master's description
instead.

**Data (from `badge`):** `idle`, `updated`, `max`, `hidden`.

A chip living inside a Tag Input inherits that component's states as well — `empty`,
`filled`, `busy`, `invalid` belong to the field, not to the chip. Do not model them here.

There is one transition worth drawing even though it is out of scope to build: removal.
Activating the remove button takes the chip out of the value list **and moves focus to
the next chip**, or to the input if it was the last. Focus that lands nowhere after a
removal is the most common way this component breaks for keyboard users.

---

## 4. Accessibility requirements

The blocker here is the one people are most surprised by. Each item is also tagged
**(this block)** — checkable on the `default`/`success` frame with `removable: true` you
draw — or **(full component)** — real, and one of them blocker-severity, but dependent on
a behaviour (removal itself, multiple chips, `hasIcon`) this brief's scope puts out of
reach for the 90 minutes (see [`README.md` item 7](README.md#done-when)). A **(full
component)** tag is not permission to skip it — it is why the closing check does not fail
you for not having built it.

1. **The hit target is at least 24 × 24 px.** _(blocker — WCAG 2.5.8 · this block)_ A
   remove button sized to look right inside a compact chip is routinely 16px. Extend the
   activation region with padding or an `::after` overlay so the _visible_ chip stays
   compact while the _target_ meets the threshold. The canonical record's own advice is
   blunter: if the design genuinely needs an interactive badge, reach for Tag Input or
   Button instead — this component exists in the seam between them, and that is worth
   knowing before you draw it. `removable: true` is in scope — the target size is
   measurable directly on the frame.
2. **Chips are removable by keyboard, not only by pointer.** _(blocker · full component)_
   Inside a field, the canonical model is: Backspace at an empty input _selects_ the last
   chip; a second Backspace removes it; ArrowLeft / ArrowRight navigate between selected
   chips. Standalone, the minimum is that the remove button is a real `<button>` in the
   tab order. Mouse-only removal is a hard fail. **Removal is explicitly out of scope to
   build here (§3)** — a static Figma frame has no keyboard to fail with, so this cannot
   be demonstrated in the 90-minute close. Draw the transition (§3) and write the keyboard
   contract into the description; build it when you write the code.
3. **Chips carry list structure.** _(blocker · full component)_ A row of chips is a
   `<ul>` (or `role="list"`) with each chip an `<li>` — not a `<div>` of styled spans.
   Without it a screen reader hears an undifferentiated run of text and cannot tell chip
   from chrome. Depends on a row of chips; the starter frame is one chip.
4. **Severity is never colour alone.** _(blocker · this block)_ Pair the variant with an
   icon, a textual prefix, or a visually hidden severity word. Colour is reinforcement.
   `default` and `success` are exactly the pair you draw — checkable directly.
5. **The remove button names its target.** _(this block)_ `aria-label="Remove <label>"`
   — not "Remove", not "Close". The user needs to know _which_ one they are about to
   delete. `remove-label` is an anatomy slot (§1) present whenever `removable: true` —
   checkable on the frame.
6. **The remove icon announces nothing.** _(major · this block)_ `aria-hidden="true"` on
   the glyph. Naming both the icon and the button double-announces. `remove-icon` is an
   anatomy slot (§1), marked decorative — checkable on the frame.
7. **The leading icon announces nothing either.** _(major · full component)_ Decorative
   whenever a visible label is present. `hasIcon` — and with it `icon-leading` — is out of
   scope (§2); nothing built here has a leading icon to mark.

---

## 5. Figma ↔ code gotchas

| Drawn as                                              | Implemented as                                                    | Why it hurts                                                                                                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Static text-with-border decorations                   | Live elements with remove buttons that are part of the form value | Implementations follow the mock and ship styled spans: no remove affordance, no keyboard contract, no way to change a value except retyping all of it. |
| A "Chip" and a separate "Removable Chip" component    | One component with a `removable` boolean                          | The two drift independently — different padding, different border, different size — and the canonical anatomy forks visually.                          |
| The × drawn, but no keyboard navigation between chips | Arrow-key navigation plus Backspace removal                       | Keyboard users must Tab through every chip's × in turn. The design encodes the affordance and omits the model.                                         |
| Five separate frames, one per severity                | One `variant` prop mapped to token pairs                          | The matrix doubles for nothing, and severity drift becomes invisible — `success` and `info` can quietly converge on the same hue.                      |

---

## 6. What "finished" looks like here

Beyond the shared bar in [`README.md`](README.md):

- One component set with `variant` (`default` / `success`) and a `removable` boolean —
  not two components.
- The remove button's activation region measures ≥ 24 × 24 px even where the chip is
  smaller, and the description says how that is achieved.
- The master's description states the remove button's `hover`/`focus-visible` styling and
  the selected/keyboard-navigated model — neither is drawn as a chip-level axis (§2, §3).
- The description records **which** source you followed for radius and type (badge or
  tag), and why.
- `default` and `success` are distinguishable with colour removed.
