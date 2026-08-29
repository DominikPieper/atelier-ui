# Component brief — Avatar

> **Source:** canonical. Transcribed from the uianatomy record for `avatar`
> (`get_component_view(id: "avatar", view: "designer")`, read 2026-08-29), mapped onto
> Atelier's `Library Tokens` vocabulary.
> **Starter frame:** `Avatar / Starter` — node `703:355` on the `🛠️ Workshop-Templates`
> page.
> **Read [`README.md`](README.md) first** — the shared rules and the "done when" bar
> live there and are not repeated here.

A graphic stand-in for a person, organisation, or entity — image, initials, or icon —
inside a bounded 1:1 surface. The component looks trivial and is not: its whole substance
is a **fallback chain** and the accessible name that has to survive every rung of it.
An avatar that renders correctly but announces "image, AB" has failed.

---

## 1. Anatomy

Five slots. One required; four conditional, and the conditions are the component.

| Slot | Required | Figma | What it is |
|---|---|---|---|
| `container` | yes | frame, fixed size, aspect 1:1 | The bounded surface. Carries the shape, the size step, and the status anchor. Radius is bound to the shape variant. |
| `image` | no | image fill on the container | The primary representation. Loads async; `object-fit: cover`, cropped to the container shape. |
| `initials` | no | text, centred | Fallback when no image. One or two letters, size scaled to the avatar step. |
| `fallback-icon` | no | instance | Last rung. A generic person glyph when neither image nor name exists. |
| `status-indicator` | no | frame, small circle | Presence dot anchored to the container's **inline-end / block-end** corner, with a border matching the page background so it separates from the avatar surface. |

**The fallback chain is ordered and the order is a contract:**
`image` → `initials` → `icon`. The image rung activates when `src` is present *and*
the load succeeds; the initials rung when a name is present *and* the image rung failed;
the icon rung when both failed.

**Token budget.** `container`: background `color/surface-sunken`, border `color/border`,
radius `radius/full` (circle) or `radius/md` (square). `initials`: foreground
`color/text-muted`, weight `font-weight/semibold`. `fallback-icon`: `color/text-muted`.
`status-indicator`: radius `radius/full`, border colour `color/surface`.

**Size is a token, not a number.** Bind the container's dimension to a step, not to
`24px`. A hardcoded pixel avatar drifts out of alignment with its neighbouring text the
first time the type scale is rebalanced.

---

## 2. Axes

**Variant (the shape axis):** `circle` · `square`.

**Properties (not variants):**

| Property | Kind | Values |
|---|---|---|
| `size` | enum | `xs`, `sm`, `md`, `lg`, `xl` |
| `status` | enum | `online`, `offline`, `away`, `busy` |
| `hasStatusIndicator` | boolean | — |

Note what is *not* here: there is no "image avatar" and no "initials avatar". Those are
**states of one component**, not variants of two (see §5).

### Scope for the 90-minute block

**In scope: `circle` and `square`, in the `image-loaded` and `initials-fallback`
states.** That pair is the whole point of the component — it is where the fallback chain
becomes visible and where the accessible name has to be identical across both.

**Out of scope, and say so in the description rather than silently omitting:** the five
size steps (build `md`), the four `status` values, `image-loading`, and `icon-fallback`.

---

## 3. States

**Interactive:** `hover`, `focus-visible` — and only when the avatar is itself the
activator, which is rare. Usually the host element handles interaction.

**Data:** `image-loading`, `image-loaded`, `image-error`, `initials-fallback`,
`icon-fallback`.

These are data states, not variants — the runtime moves between them by itself as the
image resolves. The canonical record carries no named transitions for Avatar because the
movement is one-directional and driven by the load result rather than by user intent:
`image-loading` resolves to `image-loaded` or `image-error`, and `image-error` falls
through to `initials-fallback` and then `icon-fallback` as each rung's precondition
fails.

Draw at least the `image-loaded` and `initials-fallback` frames. The canonical guidance
is explicit: designers draw all three fallback rungs for **one** representative avatar,
so developers have a reference for the case the mock never shows.

---

## 4. Accessibility requirements

Two of these are blocker-severity. Both are about the name, not the picture.

1. **Every rung has an accessible name.** *(blocker)* The initials and icon rungs set
   `role="img"` plus `aria-label` on the container. The image rung uses
   `<img alt="…">`. An avatar that renders "AB" with no label is meaningless to
   assistive tech.
2. **The fallback order is fixed.** *(blocker)* image → initials → icon, always. An
   implementation that falls back differently depending on environment or library
   version gives the same person a different identity on different screens.
3. **The name is the full name, never the initials.** *(major)* `aria-label="Alex Black"`,
   not `aria-label="AB"`. The initials are visual shorthand; the accessible name is the
   source of truth.
4. **`alt` is always present on the image rung.** *(major)* `alt=""` for a decorative
   avatar whose host already carries the name; `alt="<entity name>"` otherwise. Never
   *undefined* — some screen readers then announce the file path.
5. **The status dot carries a label.** *(major)* `aria-label="online"` / `"offline"` /
   `"away"` / `"busy"`. A coloured dot alone is sighted-only information.
6. **Decorative avatars opt out entirely.** When a visible name sits beside the avatar,
   set `aria-hidden="true"` and let the host's name carry it — announcing the name twice
   is worse than not announcing it here at all.
7. **The status dot anchors with logical properties.** `inset-inline-end` /
   `inset-block-end`, so it mirrors under RTL instead of stranding itself on the wrong
   edge.

---

## 5. Figma ↔ code gotchas

| Drawn as | Implemented as | Why it hurts |
|---|---|---|
| "Avatar (image)" and "Avatar (initials)" as two components | One component with a runtime fallback chain | The two drift. Designers stop drawing the initials frame for new avatars, and developers have no reference for the fallback the user will actually see. |
| A coloured dot placed near the avatar at absolute coordinates | A slot anchored via logical properties | Identical in LTR, wrong in RTL. Model the dot as a **child** of the container, not a sibling. |
| Static text "AB" baked into the frame | Initials computed from a `name` prop | The file never documents the algorithm — first letter? first two? first of each word? — so every implementation reinvents it. Canon: **first letter of each word, max two**. |
| `width: 24px` on the frame | A size token (`xs`…`xl`) | The Figma file lags the next scale rebalance and the shipped avatar disagrees with the text beside it. |

---

## 6. What "finished" looks like here

Beyond the shared bar in [`README.md`](README.md):

- One component set with a `variant` axis of `circle` / `square` — not two components.
- The `image-loaded` and `initials-fallback` frames both exist, for the same entity,
  with the **same** accessible name written into the description.
- The description states the fallback order and the initials algorithm.
- The status dot, if you build it, is a child of the container and positioned with
  logical properties.
