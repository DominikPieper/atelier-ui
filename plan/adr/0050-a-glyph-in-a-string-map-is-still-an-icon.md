---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0046-one-concept-one-drawing.md (the gate this corrects)
  - tools/design/artboards.json (the artboard batch that found it)
---

# ADR-0050: A glyph in a string map is still an icon

## Status

Accepted. AtlAlert and AtlBadge render AtlIcon instances instead of Unicode glyphs,
and `check:iconography` has a fifth rule, `[GLYPH-MAP]`.

## Context

ADR-0046 replaced four ways of drawing an icon with one, and gated the two that had
produced the drift: inline `<svg>` in a component source, and a literal glyph in a
CSS `content:`. Drawing the feedback components' artboards found a fifth that all
four rules pass:

```ts
const VARIANT_ICONS: Record<AtlAlertVariant, string> = {
  info: 'ℹ', success: '✓', warning: '⚠', danger: '✕',
};
```

Twenty-four quoted glyphs across six files — AtlAlert and AtlBadge in all three
frameworks. The gate saw nothing: a glyph in a TypeScript string map is neither an
svg element nor a CSS declaration. So the very components whose whole job is to
signal status were still drawing their signals as text, *after* the ADR that was
supposed to have ended that.

Two things made it worse than the ones ADR-0046 caught. The glyphs depended on
whichever installed font happened to have `ℹ` — and Instrument Sans, the library's
own typeface (ADR-0035), does not, so they fell back silently to a system face. And
a Figma master cannot place an icon instance where the code renders a text node, so
the transfer would have had to invent something.

## Decision

**Both components render AtlIcon by name.** The maps stay, but they hold icon
*names* — `info` / `success` / `warning` / `danger`, which the geometry already
defines — so the mapping from variant to symbol is still one lookup, and the symbol
itself is a vector from the single source.

**`check:iconography` gains `[GLYPH-MAP]`**: a component source may not quote a
non-ASCII character. Comments are stripped first, because a rule's own explanation
may quote the glyph it replaced — this ADR and the gate's own header both do.
Negative-tested by putting `'ℹ'` back into AtlBadge's map.

## Consequences

- **Alerts and badges draw real icons.** Rendered and checked: the four status
  symbols are the circled check, the triangle, the circled X and the circled i from
  the icon set, in the variant's colour, at `size="sm"`.
- **The gate now covers all five mechanisms.** Inline svg, CSS glyph, glyph map,
  and the two directions of name/geometry disagreement.
- **The lesson is about gate scope, not about icons.** ADR-0046 gated the two
  mechanisms it had just removed, which is the natural thing to do and the reason
  the fifth survived: a gate written from the instances found tends to miss the
  instance not yet found. Asking "what else could express this?" before writing the
  rule would have cost one sentence.
- **This came out of drawing, not of scanning.** The glyphs had been sitting in the
  source all day, through every gate run. What surfaced them was needing to state,
  on a sheet, what the alert's icon *is*.
