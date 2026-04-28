# Figma Story Design Links — 2026-04-28

## Context

The 2026-04-27 Figma restructure (commits around `i-want-to-try-humble-willow.md` plan)
collapsed several Variant axes into Boolean Component Properties:

- `LlmInput` / `LlmTextarea` / `LlmSelect` / `LlmCombobox` / `LlmCheckbox` /
  `LlmRadio` / `LlmRadioGroup` / `LlmToggle` / `LlmTable` / `LlmTabGroup` —
  `disabled`, `invalid`, `required`, `loading`, `empty`, `error` are now Booleans.
- `LlmAlert` — `dismissible` moved from variant axis to Boolean.
- `LlmStepper` — `variant` axis split into `orientation` × `state`.
- `LlmChat` — three separate sections (drawer/popup/inline) merged into one
  ComponentSet at `507:2953` with `variant` Variant axis.

Effect on Storybook `parameters.design` overrides: variant frames that backed
specific state-named stories (e.g. `LlmCombobox` `state=disabled`,
`LlmTable` `state=empty`, all `LlmChat` sub-frames at `453-17xx`) no longer exist.

## Stale node-IDs in shipped stories

Validated 132 unique node-IDs against the Atelier UI file via `figma_execute`
(`getNodeByIdAsync`). 18 unique IDs returned `null`:

| Old ID | Story usage | Replacement |
|---|---|---|
| `421-328` | combobox/Disabled (3 fws) | drop override → inherit meta `421-339` (disabled is now Boolean) |
| `421-332` | combobox/Invalid (3 fws) | drop override → inherit meta `421-339` (invalid is now Boolean) |
| `421-1103` | table/EmptyState (3 fws) | drop override → inherit meta `421-1183` (empty is now Boolean) |
| `471-2730` | icon meta (3 fws) | drop meta-level design entirely — Icons live as individual COMPONENTs on the `Icons` page, no ComponentSet |
| `453-1758` (chat meta), `453-1760/-1762/-1764/-1766/-1768/-1770/-1772/-1774/-1776/-1778/-1780/-1782` (12 chat sub-frames per fw) | chat meta + 12 stories (3 fws) | remap meta → `507-2953` (compSet); Drawer\* → `507-2950`, Popup\* → `507-2951`, Inline\* → `507-2952` |

## Story → variant remap (chat)

LlmChat sub-states (Default, Empty, Streaming, Error) are not yet a Variant axis
per the description ("Old `status` (idle/streaming/error) and `empty` mockup
frames remain illustrated as sibling frames in the AI section pending
follow-up Variant axis"). All 4 sub-states for a given variant share one
nodeId.

| Story | NodeId |
|---|---|
| `(meta)` | `507-2953` |
| `DrawerDefault`, `DrawerEmpty`, `DrawerStreaming`, `DrawerError` | `507-2950` |
| `PopupDefault`, `PopupEmpty`, `PopupStreaming`, `PopupError` | `507-2951` |
| `InlineDefault`, `InlineEmpty`, `InlineStreaming`, `InlineError` | `507-2952` |

## Stories left inheriting meta (no Figma variant frame for the state)

After the restructure, these story states are Boolean-property toggles, not
Variant frames. They legitimately inherit the meta link:

- `LlmInput`: `Disabled`, `Readonly`, `Required`, `Email`, `Password`,
  `Number`, `Tel`, `Url`, `WithErrors` (content variation), `AllTypes`.
- `LlmTextarea`: `Disabled`, `Readonly`, `Required`, `WithErrors`,
  `AutoResize`, `TallRows`, `AllStates` (composition).
- `LlmSelect`: `Disabled`, `Invalid`, `Required`, `WithErrors`, `WithDisabledOption`.
- `LlmCombobox`: `Disabled`, `Invalid`, `Required` (after this commit).
- `LlmCheckbox`: `Disabled`, `DisabledChecked`, `Invalid`, `Required`,
  `WithErrors`, `Interactive`, `SelectAll`.
- `LlmRadio`: `Disabled`, `IndividualDisabled`.
- `LlmRadioGroup`: `Disabled`, `Invalid`, `Required`, `WithErrors`,
  `WithDisabledOption`, `IndividualDisabled`.
- `LlmToggle`: `Disabled`, `DisabledChecked`, `Invalid`, `Required`,
  `WithErrors`, `Interactive`, `SettingsPanel`, `AllStates`.
- `LlmAlert`: `Dismissible`, `AllDismissible` (Boolean now).
- `LlmTable`: `Empty`, `Loading`, `Disabled`, `Error` (Booleans now).
- `LlmTabGroup`: `Disabled`, `Loading`, `WithDisabledTab` (Booleans now).
- `LlmAvatar`: `WithStatus` (status not yet a Variant axis).

Composition stories (`AllVariants`, `AllSizes`, `AllStates`, `Playground`,
`Default`, `Sizes`, `AllIcons`, etc.) also inherit — they legitimately show
the whole component family, not a single variant.

## Verification

- `node tools/scripts/check-cookbook-parity.mjs` — unchanged.
- `nx run-many -t lint -p angular,react,vue` — clean.
- `nx run-many -t test -p angular,react,vue` — green.
- Spot-check Storybook Design panel on one story per remapped component
  (chat/combobox/table/icon) — Figma jumps to the correct variant or
  ComponentSet.
