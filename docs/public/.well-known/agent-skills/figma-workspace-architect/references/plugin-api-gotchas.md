# Plugin API gotchas — what bit this repo through `figma_execute`

Load this before any `figma_execute` payload that creates, resizes or re-parents frames,
or edits text. Each item cost a real session: the first nine were recorded in
`tasks/lessons.md` between 2026-04 and 2026-09 while building 39 masters; the tool-level
traps at the end come from figma-console-mcp's own tool descriptions (v1.40.0). General
Plugin API knowledge (colours 0–1, `loadFontAsync`, `appendChild` order) is assumed —
this file is only the part that knowledge gets wrong.

## Auto layout and sizing

- **`node.resize(w, h)` flips auto-layout axis sizing to FIXED on both axes.** To keep a
  frame auto-sizing its height (`primaryAxisSizingMode = 'AUTO'`) after setting a width,
  set the mode *after* `.resize()`, not before; otherwise the frame collapses to the
  resized height regardless of children. Hit in Progress body, Combobox panel/wrapper,
  CodeBlock wrapper/body and Table inner container — all clipped or collapsed silently.
- **Setting `layoutMode` *after* `.resize()` reverts both axes to AUTO.** The frame
  shrink-wraps its children — a 32×32 circle with a "1" inside becomes a narrow pill.
  Either set `layoutMode` first and size last, or re-assert `primaryAxisSizingMode` and
  `counterAxisSizingMode` to `FIXED` and call `.resize()` once more.
- **`primaryAxisAlignItems = 'SPACE_BETWEEN'` with a single child centres it.** Hit the
  CodeBlock `no-copy` header and every Combobox option row without a checkmark. Use
  `'MIN'` plus `layoutGrow = 1` on the first child to push later items to the end.
- **`counterAxisAlignItems` is `'MIN' | 'MAX' | 'CENTER' | 'BASELINE'`** — `'START'` and
  `'END'` throw a validation error.
- **`layoutPositioning = 'ABSOLUTE'` needs a parent whose `layoutMode !== 'NONE'`.**
  Parent first (`parent.appendChild(node)`), then set positioning; on an unparented or
  NONE-layout child it throws.

## Sections and coordinates

- **Moving a SECTION does not move its children.** Section children sit in page-absolute
  coordinates. After changing `section.y`, apply the same delta to every child
  (`child.y += deltaY`), or reposition the component set explicitly
  (`(sec.x + 24, sec.y + 92)` is the offset the Components page uses).

## Text

- **Text in a fixed-width container will not wrap until `textAutoResize = 'HEIGHT'`.**
  The default is `WIDTH_AND_HEIGHT`, so long strings overflow and get clipped by a
  parent's `clipsContent`. Set HEIGHT, then resize the text width to the content-area
  width.
- **Text edits on an INSTANCE through `figma_execute` fail silently.** The tool
  description says so itself: use `figma_set_instance_properties` for instance text and
  Booleans; touch text nodes directly only inside a COMPONENT or a plain FRAME.

## Node ids and URLs

- **Node ids in URLs use `-`, the API uses `:`.** `?node-id=420-87` is node `420:87`.
  `parameters.design` links in stories follow the URL form.
- **Ids are stable within a file and differ across duplicates.** A participant's
  duplicate of the Atelier file has its own ids; resolve with `figma_search_components`
  in the file you are actually editing, and remember the search also matches
  *description* text, so an unrelated component can surface.

## Connection modes and REST

- **REST-backed tools (`figma_take_screenshot`, `figma_get_component_image`, variables
  via the REST Variables API) 403 without `FIGMA_ACCESS_TOKEN` or on a non-Enterprise
  plan for variables.** The Desktop Bridge channel still creates and modifies; read
  `fills`, `boundVariables` and dimensions structurally via `figma_execute` when REST is
  unavailable. `figma_get_variables` falls back Bridge → REST → styles on its own.
- **`figma_take_screenshot` (REST) can be cache-stale right after a write.** Use
  `figma_capture_screenshot` (live) for the first look after a mutation.
- **`figma_execute` housekeeping the tool itself asks for:** screenshot before and after,
  place new nodes inside a Section or Frame (never on bare canvas), delete orphaned nodes
  from a failed attempt before retrying, return every created or mutated node id so the
  next call can reference it. Default timeout 5 s, configurable to 30 s — split large
  builds (the Inventory pipeline chunks at 25 components per call for this reason).
- **`figma_navigate({ lock: true })`** pins the target file so a reconnect or the human
  clicking elsewhere cannot redirect later calls.

## Batch limits

- `figma_batch_create_variables` / `figma_batch_update_variables`: 100 per call.
- `figma_create_component_set`: 100 variants hard cap, timeout scales ~1.2 s per variant;
  split anything above ~40.
- Responses over 500 KB are auto-compressed or downgraded to summaries
  (`figma_get_library_component_by_key`, `figma_get_design_system_kit`).
