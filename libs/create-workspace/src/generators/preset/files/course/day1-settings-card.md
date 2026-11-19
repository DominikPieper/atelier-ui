# Day 1, Block 02: the Settings Card

Used in Day 1 Block 02. The Figma frame "Settings / Card" becomes a {{FRAMEWORK}} component
built from `@atelier-ui/{{FRAMEWORK_LC}}`. Select the frame in Figma first (the Desktop
Bridge must be connected, see `rescue.md`).

## Generate the component

```text
I've selected the "Settings / Card" frame in Figma.

1. Use figma-console MCP (figma_get_component_for_development) to read
   the frame's spec — I need the boundVariables and the visual reference.
2. Use {{MCP}} MCP to look up AtlCard, AtlInput, AtlToggle,
   and AtlButton props.
3. Generate the {{FRAMEWORK}} component using:
   - The Atelier UI components matched from Storybook
   - The exact token names from boundVariables (they map 1-to-1 to CSS
     custom properties — no conversion needed)
```

## If the first draft still drifts on tokens

Pattern-matching models sometimes fall back to a literal px or hex value even when told not
to. Paste this one-line fix-up instead of a full re-prompt:

```text
Re-check every inline style/CSS value you just wrote against
var(--ui-*). AtlCard's heading in the canonical example uses
var(--ui-font-size-lg) for size, var(--ui-color-text) for colour, and the card's
own padding/gap are var(--ui-spacing-6) / var(--ui-spacing-4) — no literal px,
no hex, no Tailwind class. Replace anything that isn't a --ui-* custom property with
the matching one and tell me which line you changed.
```

A font weight such as `600` in a `.css` file also fails `npm run check:stylelint`; the token
is `var(--ui-font-weight-semibold)`.

## The agent checks itself (11:00 to 11:10)

{{LADDER}}

## The comparison with Figma

You compare by eye today; the steps are in `parity-prompt.md`. Do not do it on a component
that fails lint or build. The parity tool comes on Day 2.
