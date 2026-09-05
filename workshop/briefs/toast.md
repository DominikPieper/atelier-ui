# Component brief — Toast

> **Source:** canonical. Transcribed from the uianatomy record for `toast`
> (`get_component_view(id: "toast", view: "designer")`, read 2026-08-29), mapped onto
> Atelier's `Library Tokens` vocabulary.
> **Starter frame:** `Toast / Starter` — node `703:341` on the `🛠️ Workshop-Templates`
> page.
> **Read [`README.md`](README.md) first** — the shared rules and the "done when" bar
> live there and are not repeated here.

A transient floating notification anchored to a corner of the viewport, auto-dismissing
after a short visible duration. It is **not** an Alert (inline, persistent) and not a
Modal (blocking). What separates it from both is ephemerality plus positioning — and
that distinction is the first thing the component owes: a message the user can afford
to miss.

---

## 1. Anatomy

Nine slots. Three are required outright — `viewport`, `container`, `body`; two more
become required the moment you add the close button. The two-tier structure —
a viewport that owns stacking and a container that owns one message — is the part
people get wrong, so it is the part to get right.

| Slot | Required | Figma | What it is |
|---|---|---|---|
| `viewport` | yes | frame | Fixed-position region at one viewport corner holding every visible toast. **One per page.** Owns stacking, hover-pause, and the landmark. |
| `container` | yes | frame, auto-layout horizontal | One toast's surface. Max inline size 360–420px. Carries the severity treatment and its own live-region role. |
| `icon` | no | instance | Severity glyph at the inline-start. Glyph swap bound to the severity variant. Decorative. |
| `title` | no | text | Optional brief heading. Only when the body runs multi-line — a single-line toast *is* its headline. |
| `body` | yes | text | The message. One or two sentences, by canon. Anything longer is an Alert. |
| `action` | no | instance | **Exactly one** inline action ("Undo", "View"). Two actions is a redesign signal. |
| `close-button` | no | instance | Real button. Icon-button, close variant, inline-end. |
| `close-icon` | yes (of the button) | instance | The × glyph. Decorative, always. |
| `close-label` | yes (of the button) | text | The accessible name — a visually hidden "Dismiss notification", or an `aria-label` on the button. Counted as a slot so the dependency is structural, not prose. |

**Token budget.** `container`: background `color/surface-raised`, border `color/border`,
radius `radius/md`, padding and gap off the `spacing/*` ladder. `viewport`: `spacing/*`
padding and gap only. `icon` and `action` foreground: `color/text` or the severity
colour. `close-button` foreground: `color/text-muted`.

**The shadow is not a variable.** A toast floats, which means `--ui-shadow-lg`. There is
no `shadow/*` in `Library Tokens` — elevation lives only in `tokens.css`. State that in
your Figma description; do not invent a variable for it.

---

## 2. Axes

**Variant (the severity axis):** `info` · `success` · `warning` · `danger`.

**Properties (not variants):**

| Property | Kind | Values |
|---|---|---|
| `position` | enum | `block-start-start`, `block-start-end`, `block-start-center`, `block-end-start`, `block-end-end`, `block-end-center` |
| `dismissible` | boolean | — |
| `hasAction` | boolean | — |
| `hasIcon` | boolean | — |

`position` is a property of the **viewport**, not of a toast. It selects a corner; it
does not restyle the message.

### Scope for the 90-minute block

**In scope: `success` and `danger`, in the `open` and `closing` states.** Those two
severities are the pair that must differ in more than hue (see §4) and the pair whose
live-region politeness differs — so they carry the whole lesson between them. Model
`dismissible` and `hasIcon` as booleans if time allows.

**Out of scope, and say so in the description rather than silently omitting:** `info`
and `warning`, the six `position` values (build one corner), the stacking behaviour, and
the progress affordance.

---

## 3. States

**Interactive:** `hover`, `focus-visible`. These are CSS, not variants.

**Data:** `opening` → `open` → `paused` → `open` → `closing` → `closed`.

| From | To | Trigger |
|---|---|---|
| `closed` | `opening` | The consumer fires the toast. It mounts; the timer is initialised but not started. |
| `opening` | `open` | Slide-in completes (or immediately under `prefers-reduced-motion: reduce`). **Now** the timer starts and the live region announces. |
| `open` | `paused` | Pointer enters the viewport **or** focus moves into it. Every visible toast pauses, not just the hovered one. |
| `paused` | `open` | Pointer and focus are both out. The timer **resumes** — it does not restart. Elapsed time counts. |
| `open` | `closing` | Timer expires; or Escape with focus in the region; or dismiss/action activated; or a programmatic close. |
| `closing` | `closed` | Slide-out completes (or immediately under reduced motion). Removed from the viewport and from the live region; the stack reflows. |

Announcement happens on entering `open`, not on mount. A toast that announces while it
is still sliding in announces content the user cannot yet read.

---

## 4. Accessibility requirements

Non-negotiable. Three of these are blocker-severity in the canonical record.

1. **Timers pause on hover and focus.** *(blocker — WCAG 2.2.1 Timing Adjustable)*
   Pause on pointer-enter **and** focus-into the viewport; resume only when both are
   out. Pause at viewport level, not per toast, so a user can move between adjacent
   toasts. Without this, a slow reader loses the message mid-sentence.
2. **Escape dismisses.** *(blocker)* With focus inside the toast region, Escape closes
   the focused toast — or the most recent one if none is focused. Otherwise the only
   exits are tabbing to the button or waiting, and the keyboard contract feels broken
   next to every other light-dismiss surface.
3. **Severity drives live-region politeness.** *(major)* `info` and `success` →
   `role="status"` (polite). `danger` → `role="alert"` (assertive). `warning` is
   canonically polite. Marking every toast assertive interrupts the user for every
   "Copied" and trains them to switch notifications off.
4. **Critical errors are not toasts.** *(blocker)* Anything the user must act on — a
   network failure, a data-loss warning — is an Alert or a Modal. Toast is for what can
   be missed without consequence. Getting this wrong is a content decision that no
   amount of correct markup repairs.
5. **The region is a landmark, not a live region.** `role="region"` with
   `aria-label="Notifications"` on the viewport; the live-region roles sit on the
   individual toasts.
6. **The close control announces once.** `aria-label="Dismiss"` **or** a visually hidden
   span — never both. The `close-icon` is `aria-hidden="true"` and never carries a name
   of its own.
7. **The icon is never the severity.** `aria-hidden="true"` on the glyph; severity
   reaches assistive tech through the role and the visible text.
8. **Stack depth is capped.** *(major)* Three visible toasts; queue the rest. An
   unbounded stack floods the screen and the screen reader alike.
9. **The action is a button.** Reachable by Tab after the dismiss button, with a real
   accessible name.

---

## 5. Figma ↔ code gotchas

The four places this component's design file and its implementation habitually disagree.
Each one is worth a sentence in your Figma description.

| Drawn as | Implemented as | Why it hurts |
|---|---|---|
| A toast next to the button that triggered it | A single fixed-position viewport region per page | Per-trigger floating surfaces compete with each other and lose the stacking, the auto-dismiss and the live region all at once. |
| One static visual with no timer affordance | An auto-dismiss timer at a configurable duration | Designers do not see that it vanishes; developers ship no progress affordance and no sane default. Document the duration and the hover-pause as canonical behaviour. |
| "One toast" / "two toasts" / "three toasts" variants | One toast plus a viewport that stacks | The three-toast frame is decorative. Stacking is a viewport concern; document the max depth in the viewport slot, not as a toast variant. |
| An inline link "Undo" inside the body text | A Button in the `action` slot | An anchor is the wrong semantic (Undo does not navigate) and a click-handler span has no semantic at all. The body describes; the action is separately reachable. |

---

## 6. What "finished" looks like here

Beyond the shared bar in [`README.md`](README.md):

- The variant axis is named `variant` with values `success` and `danger` — lowercase,
  matching the string-literal union the spec will carry.
- `success` and `danger` are distinguishable with colour removed.
- The description on the master states: the auto-dismiss duration, the hover-pause
  contract, the Escape binding, and that the shadow is CSS-only.
- The two in-scope states are `open` and `closing`, and the description names the four
  data states you did not build.
