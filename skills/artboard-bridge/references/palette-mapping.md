# Palette mapping — `_sheet.css` short names ↔ `--ui-*` tokens

> Token *value* ownership across Figma, the framework libs, and this artboard copy is
> mapped by axis in ADR-0115; this file is that map's artboard-projection axis in detail.

An artboard renders standalone in Claude Design, where the library's `tokens.css` is
not loaded. So `_sheet.css` opens with a `:root { … }` block that carries the light-mode
palette as **literals under short names** — `--text`, `--muted`, `--primary`, `--border`,
`--border-strong`, `--border-hover`, `--success`, `--bw`, `--r-lg`, `--serif`, … (48
values as of 2026-09-07).

## Where the block comes from

- **Generated**, never maintained: `tools/scripts/gen-artboard-palette.mjs` derives it from
  `libs/create-workspace/src/generators/preset/files/styles/tokens.css` (the token source
  of truth per `sync-tokens.mjs`) and writes `tools/design/artboard-palette.css`.
- **Gated**: `npm run check:artboard-palette` fails when the committed file no longer
  matches what the generator would produce.
- **Copied by hand into the project**: the repo cannot write into Claude Design from a
  script (the MCP is interactively authenticated), so the block is pasted into
  `_sheet.css` — Publish mode's P2 step diffs the two and updates the project copy under
  the same plan when they differ.
- History: the block was hand-maintained until 2026-08-27 and had drifted in 7 of 40
  values, including the three status colours the ramps changed (ADR-0071). That is why
  "map by eye" is forbidden below.

## Mapping a sheet value back to a token (Intake)

1. Open `tools/design/artboard-palette.css` (committed, generated) and read the short
   name → literal pairs; open `gen-artboard-palette.mjs` for the short name → `--ui-*`
   source mapping it encodes.
2. For each value the sheet states as a palette name, record the `--ui-*` token the
   generator maps it from.
3. For each value the sheet states as a **literal** (a hex, a px), do not guess a token
   by nearest colour. Record it as "literal in sheet; candidate token `--ui-…` (matches
   the generated value)" only when the literal equals a generated value exactly; else
   record it as a literal and list it under the handoff document's claims to verify —
   it is either off-scale by intent (the sheets' 11 px card meta, for instance) or a
   finding.
4. Namespace collision to watch (ADR-0106): a project file declaring `--ui-*` names with
   values that differ from `tokens.css` — four such files once coexisted in the design-
   system project. The redesign project uses the short-name namespace precisely to avoid
   this; a sheet that declares `--ui-*` itself is a finding, not a convenience.

## Writing values (Publish)

Palette names only. When a needed value has no palette entry (elevation — `Library
Tokens` and the palette carry no shadow; letter-spacing; z-index), write the literal with
a one-line reason and add the gap to the sheet's Findings. Do not add a name to the
`:root` block by hand — extend the generator, regenerate, gate, then paste.
