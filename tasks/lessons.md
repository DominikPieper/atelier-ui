# Atelier UI — Lessons

Patterns and gotchas captured during implementation. When a mistake repeats, add a rule here so it doesn't repeat again.

## Figma plugin API (figma-console MCP)

- **`node.resize(w, h)` flips auto-layout axis sizing to FIXED on both axes.** If you want a frame to auto-size its height (`primaryAxisSizingMode = 'AUTO'`) after setting a width, set the mode *after* calling `.resize()`, not before. Otherwise the frame collapses to the resized height regardless of children. This bit me in Progress body, Combobox panel/wrapper, CodeBlock wrapper/body, and Table inner container — all of which silently clipped or collapsed.
- **Setting `layoutMode` on a frame *after* calling `.resize()` reverts both axes to AUTO.** The frame then shrink-wraps to its children — e.g. a 32×32 circle with a "1" text inside collapses to a narrow pill. After flipping layoutMode, explicitly re-assert `primaryAxisSizingMode` and `counterAxisSizingMode` to `FIXED` and call `.resize()` once more, or set layoutMode first and size last.
- **`primaryAxisAlignItems='SPACE_BETWEEN'` with a single child centers it.** This bit the CodeBlock `no-copy` header (single `typescript` text centered) and every Combobox option row without a checkmark. Use `'MIN'` plus `layoutGrow=1` on the first child to push later items to the end.
- **Moving a SECTION on the page does NOT move its children.** Section children are positioned in page-absolute coordinates. After bumping a section's `.y`, re-apply the same delta to every child (`child.y += deltaY`), or reposition the compSet at `(sec.x + 24, sec.y + 92)` explicitly.
- **Text in a fixed-width container won't wrap unless you set `textAutoResize='HEIGHT'`** — Figma defaults to `WIDTH_AND_HEIGHT` so long strings overflow and get clipped by parent `clipsContent`. Setting HEIGHT then explicitly resizing the text width = content-area width makes it wrap properly.
- **`node.layoutPositioning = 'ABSOLUTE'` requires the node's parent to already have `layoutMode !== 'NONE'`.** Parent the node first (`parent.appendChild(node)`), then set `layoutPositioning`. Setting it on an unparented or NONE-layout child throws.
- **`counterAxisAlignItems` enum is `'MIN' | 'MAX' | 'CENTER' | 'BASELINE'`** — not `'START'`/`'END'`. `START` will throw a validation error.
- **REST-backed Figma tools (screenshots, `figma_get_component_image`) 403 without `FIGMA_ACCESS_TOKEN`.** Use structural inspection via `figma_execute` (read `fills`, `boundVariables`, dimensions) when the REST path is unavailable. The Desktop Bridge channel still works for creation/modification.
- **Node-ids in URLs use `-` instead of `:`** — `parameters.design` links like `figmaNode('420-87')` map to Figma node `420:87`.

## Design-system parity

- **Bind every color in a new Figma design to a UI Tokens variable, never a raw hex** — otherwise Dark mode won't follow. Use `figma.variables.setBoundVariableForPaint(paint, 'color', variable)` and discover variables with `figma.variables.getLocalVariablesAsync()`.
- **Before writing new component CSS, check if an equivalent semantic token already exists** (`--ui-color-on-primary`, `--ui-color-text-on-danger`, etc.). Hard-coding `#fff` or `#000` for "on colored background" bypasses the token layer and breaks theming.
- **Storybook `parameters.design` lives on both the meta and every named story** — meta links to the component set, individual stories link to specific variants. Pattern established by `libs/angular/src/lib/button/llm-button.stories.ts:5-9,38-74`.
