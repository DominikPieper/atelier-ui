# The `.dc.html` sheet — what you read, what you write

The format specification is first-party and complete, and it ships through the MCP
server, not a docs page: `get_claude_design_prompt` returns it (ADR-0032, verified
2026-08-26 and again 2026-09-07). Load it before writing; this file only says what to
look for and how Atelier's sheets use the format.

## Skeleton (as the prompt specifies it)

```html
<!doctype html>
<html>
  <head>
    <script src="./support.js"></script>
  </head>
  <body>
    <x-dc>
      <helmet data-dc-atomics>
        <meta name="design_doc_mode" content="canvas" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/…" />
        <link rel="stylesheet" href="./_sheet.css" />
        <style>
          /* component-specific classes, palette names only */
        </style>
      </helmet>
      <div data-screen-label="AtlBadge — variant × size">…markup…</div>
      <script type="text/x-dc" data-dc-script data-props="{}">
        class Component extends DCLogic { renderVals() { return {}; } }
      </script>
    </x-dc>
  </body>
</html>
```

- `support.js` is server-provided (`create_support_js`), one per directory holding
  `.dc.html`; never hand-write it.
- `<helmet>` injects into `<head>`; the `design_doc_mode="canvas"` meta gives the host
  pan/zoom, so wide sheets are fine.
- The prompt's own style rule: design-specific values as short single-class utilities in
  `<helmet><style>`; inline `style="…"` only for genuine one-offs; anything on two or
  more elements becomes a class. `<helmet><style>` is therefore the intended home for a
  palette block — the reason ADR-0032's alternative 4 was reopened.
- The `data-dc-script` block is empty for a static sheet (`renderVals() { return {} }`).
  Atelier's sheets are static.

## How Atelier's sheets are laid out (project `7a6a2f19…`)

Read in this order; the pictures are specimens, the prose is the content.

1. **Header prose** — component name, the Figma node id ("node 55:141" style, which may
   be stale — verify against `tools/figma/snapshot.json`), the `Atl*Spec` interface, the
   ADRs that shaped it.
2. **Length / Anatomy / States** — tables of measured values (heights, paddings, type
   sizes, radii), each in palette names or px as measured in the browser. These are
   _measurements of the code at sheet time_, not the spec: a sheet written 2026-08-27 does
   not know about a token change on 2026-09-05.
3. **Findings** — the section that earns the file. Items marked `open` are unresolved
   decisions (e.g. "10px initials off the type scale", "status is code-only with the
   empty string as a union member"). Carry each into the handoff document as a **claim to
   verify**, dated by the sheet's etag, never as a fact about today's code.
4. **`Index.dc.html`** — the redesign's own table of contents; it calls the sheets
   canonical "Zustände, Anatomie-Maße und Findings, im Browser gemessen". `Foundations.dc.html`
   documents the palette and type roles the sheets share.

Shared: `_sheet.css` — sheet chrome plus the specimen primitives every form field shares
(field recipe, panel, option row, adornment, state modifiers) and, at its top, the
`:root` palette block (see `palette-mapping.md`). Each sheet links it and keeps only what
is specific to that component.

## Writing a sheet (Publish mode)

- Copy the shape of a neighbouring sheet (`read_file` one first) rather than inventing a
  layout; the Index links them all and readers expect the same sections.
- Measure from the running story, Light and Dark; write palette names, not literals. A
  literal is allowed only with a one-line reason beside it (elevation has no palette
  entry, for instance).
- Cite in prose: Figma node id (from the snapshot), `Atl*Spec` name, the parity record's
  date and git SHA (`tools/figma/parity.json`), the story id.
- Findings you discover while measuring go into the sheet **and** into `tasks/todo.md`;
  a finding that lives only in a sheet is invisible to every gate.
- File name: `Atl<Name>.dc.html` at project root, one component per sheet; studies (a
  typography exploration, a direction comparison) are `kind: "study"` in the registry and
  count as coverage for nothing.

## Reading limits

`read_file` caps at 256 KiB per call — the largest Atelier sheets are ~22 KiB, so one call
suffices; use `offset`/`limit` for anything bigger. `list_files(depth: -1)` returns every
file with an `etag`; keep the etag you read in the handoff document's provenance and pass
it as `if_match` on any later write to that path.
