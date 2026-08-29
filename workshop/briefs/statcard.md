# Component brief — StatCard

> **Source: composed, not canonical.** There is no `stat-card` in the uianatomy roster —
> `list_components` returns 41 ids and none of them is a stat card. This brief assembles
> one from `card` and `badge` (`get_component_view(…, view: "designer")`, read
> 2026-08-29). Two of the slots below —
> `value` and `delta` — have **no canonical counterpart**; they are this composition's
> own, mapped onto slots that do exist. Every such mapping is marked.
> **Starter frame:** `StatCard / Starter` — node `703:348` on the
> `🛠️ Workshop-Templates` page.
> **Read [`README.md`](README.md) first** — the shared rules and the "done when" bar
> live there and are not repeated here.

A bounded surface presenting one metric: a label, the number, and how it is trending.
The temptation is to treat it as "a Card with a big number in it". The reason it needs a
brief is that a Card's canonical anatomy has a **required** action slot and a StatCard
has no action — so the first thing this component owes is a recorded decision about what
it drops and why.

---

## 1. Anatomy

Six slots. Four map onto canonical Card slots; two are this composition's own.

| Slot | Required | Maps to | Figma | What it is |
|---|---|---|---|---|
| `container` | yes | card (the surface itself) | frame, auto-layout vertical | The bounded surface. Carries the variant treatment, the radius and the padding budget. |
| `label` | yes | card `eyebrow` | text | What is being measured. Short, categorical, above the number — establishes context before the value. **Not** a heading: it is metadata. |
| `value` | yes | *composition-specific* — occupies card `title` | text | The number itself, at display size. The card's primary identifier, and it must read as a standalone label outside the card's context. |
| `delta` | no | *composition-specific* — a `badge` instance | instance | The trend marker: `+12%`, `−3.4%`. A Badge with a severity variant. |
| `caption` | no | card `subtitle` | text | Secondary descriptor narrowing the value — "vs. last week", "rolling 30 days". Not a place for prose. |
| `footer` | no | card `footer` | frame, auto-layout horizontal | Tertiary metadata at lower visual weight — timestamp, source, a link out. |

**The slot this composition drops.** Card marks `primary-action` **required** — exactly
one decision-committing button per card. A StatCard commits no decision. Dropping it is
legitimate, and recording the drop in the master's description is the difference between
a deliberate composition and an incomplete one. If your StatCard *does* need a "View
details" affordance, read §4.1 first: it changes the component's keyboard story
completely.

**Token budget.** `container`: background `color/surface-raised` (elevated) or
`color/surface` with `color/border` (outlined), radius `radius/lg`, padding off
`spacing/*`. `label`: `color/text-muted`, `font-size/xs`, `font-weight/medium`, with
`letter-spacing` wide if you uppercase it. `value`: `color/text`, the largest step your
type scale offers. `caption` and `footer`: `color/text-muted`, `font-size/xs`.
`delta`: the Badge's own severity pair — `color/success-bg` + `color/success-text`, or
`color/danger-bg` + `color/danger-text`.

**Elevation is a CSS-only token.** The `elevated` variant needs `--ui-shadow-md`, and
`Library Tokens` carries no `shadow/*` — Figma cannot bind it. State the shadow in the
description; do not invent a variable for it. (This is why the `outlined` variant, which
needs only `color/border`, is the easier of the two to make token-true.)

---

## 2. Axes

**Variant (from `card`):** `elevated` · `outlined` · `flat`. These are structurally
different surfaces, which is what earns them a variant axis.

**Properties (not variants):**

| Property | Kind | Values | From |
|---|---|---|---|
| `orientation` | enum | `vertical`, `horizontal` | card |
| `density` | enum | `comfortable`, `compact` | card |
| `interactive` | boolean | — | card |
| `hasDelta` | boolean | — | *composition-specific* |

`orientation` is a **property**, not a variant — the single most common counting
mismatch on this component. Designers who model it as a variant see six variants where
developers see three variants and a binary prop, and the two files stop agreeing about
what exists.

### Scope for the 90-minute block

**In scope: `elevated` and `outlined`, in the `idle` and `hover` states, with
`hasDelta: true`.** The two variants differ in exactly one dimension — border versus
shadow — which makes the Figma-cannot-bind-a-shadow lesson concrete rather than
theoretical. `hasDelta` pulls in the Badge composition and its colour-alone rule.

**Out of scope, and say so in the description rather than silently omitting:** `flat`,
both `orientation` values (build `vertical`), `density`, `interactive`, and the
`selected` / `loading` data states.

---

## 3. States

**Interactive (from `card`):** `hover`, `focus-visible`, `active`, `disabled` — and only
when `interactive: true`. A static StatCard has none of them, and drawing hover on a
non-interactive card promises an affordance that is not there.

**Data (from `card`):** `selected`, `loading`.

`loading` deserves a thought even though it is out of scope to build: a StatCard's
whole content is one asynchronous number, so the skeleton state is not decoration — it
is the state the component spends its first frames in. Note in the description what the
card shows before the number arrives.

**`selected` is a data state, not a variant.** Modelling it as "outline + filled
background" duplicates the treatment in two places and blocks the combination
`selected + disabled` outright.

---

## 4. Accessibility requirements

1. **An interactive card is one activator, and nested controls need the overlay
   pattern.** *(blocker)* Wrapping the whole card in an `<a>` makes it a single tab stop
   and traps anything focusable inside it — a screen reader then reads the nested
   controls as part of the link's name. The canonical fix: keep the card a plain
   container, give the `value` (or `label`) a real `<a>` whose `::before` covers the
   card, and lift genuinely separate controls onto a higher stacking context.
2. **A clickable card has a real focusable activator.** *(blocker)* A click handler on a
   `<div>` is unreachable by keyboard and unannounced. `<a href>` for navigation,
   `<button>` for in-page actions — never `role="button"` on the card div.
3. **The delta is never colour alone.** *(blocker, from `badge`)* Green-up / red-down is
   invisible to a large group of users. Pair it with a sign (`+` / `−`), an arrow glyph
   *plus* text, or a visually hidden word. The number's direction must survive
   greyscale.
4. **A live-updating value announces politely.** *(major, from `badge`)* If the number
   changes without a navigation, wrap it in `aria-live="polite"` with
   `aria-atomic="true"` so the whole new value reads rather than a fragment — and
   throttle it, or a fast-moving metric floods the screen reader.
5. **The label is not a heading.** Card's canonical guidance: the eyebrow is metadata.
   If the value and label need to be announced as a unit, associate them with
   `aria-labelledby` rather than promoting the label to `<h3>`.
6. **Value and label are announced together.** "1,284" alone is meaningless. Whichever
   mechanism you pick — DOM order, `aria-labelledby`, or a visually hidden combined
   string — write it into the description.
7. **A decorative delta icon is hidden.** *(major)* `aria-hidden="true"` on the arrow
   glyph when a textual sign is already present; otherwise it double-announces.
8. **Media alt never repeats the label.** *(minor)* If you add a sparkline or an icon,
   its alt adds what the text does not say ("Chart showing 12% growth"), or it is `alt=""`.

---

## 5. Figma ↔ code gotchas

| Drawn as | Implemented as | Why it hurts |
|---|---|---|
| Variants for hover / focus / active / disabled | CSS pseudo-classes and ARIA attributes | 3 variants × 4 states × 2 orientations is 24+ frames, and none of them maps to a pseudo-class without a hand translation. Document interaction states on a separate states sheet. |
| Media-on-top and media-on-leading as separate variants | One component with an `orientation` prop | Designers count six variants, developers count three plus a binary union. The counts diverge and so do the files. |
| A card component stacked on an invisible button component | One `<a>`/`<button>` wrapping the card, or the overlay pattern | The Figma file does not encode the affordance, so neither side realises the whole card must be a single accessible activator. |
| A "selected" variant with outline + filled background | A `data-selected` / `aria-selected` attribute | The treatment is duplicated in two places and drifts, and `selected + disabled` becomes unrepresentable. |

---

## 6. What "finished" looks like here

Beyond the shared bar in [`README.md`](README.md):

- The variant axis is `variant` with values `elevated` and `outlined` — `orientation`
  and `density` are properties if you model them at all.
- The master's description records: that `primary-action` was deliberately dropped, that
  the `elevated` shadow is a CSS-only token, and what the card shows while the number is
  loading.
- The delta's direction is readable in greyscale.
- The `delta` slot is an **instance** of your Badge (or of `Display/AtlBadge`), not a
  hand-drawn pill — the composition has to be a real composition, or the next token
  change breaks it silently.
