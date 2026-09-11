# figma-console-mcp tool inventory (atelier repo)

125 tools total. 10 `figjam_*` tools (FigJam board primitives — stickies, sections,
connectors, code blocks, tables, board contents/connections) and 16 `*_slide*` tools
(Figma Slides — create/delete/duplicate/focus/list/reorder, content/grid/transition/
background/view-mode) exist but are **out of scope**: this repo targets Figma Design
files only. Remaining **99 tools** loaded and analyzed below.

"Bridge" = requires the Desktop Bridge plugin running in Figma Desktop (WebSocket,
live document state, works on any Figma plan). "REST" = Figma REST API (some paths
Enterprise-gated). Many tools try Bridge first and fall back to REST. "Refs" = raw
occurrence count found via `rg` across `.claude/skills/figma-workspace-architect/`,
`plan/*.md` + `plan/adr/*.md`, `tasks/lessons.md`, `tools/figma/`, `tools/scripts/`,
`docs/src/pages/*.astro`, `AGENTS.md`.

## (a) Tools by category

### Read / Inspect file

| Tool                            | Purpose                                                         | Key inputs                  | R/W | Bridge?                                           | Refs |
| ------------------------------- | --------------------------------------------------------------- | --------------------------- | --- | ------------------------------------------------- | ---- |
| figma_get_file_data             | Doc tree/structure; start summary+depth1                        | fileUrl, depth≤3, verbosity | R   | REST                                              | 24   |
| figma_get_file_for_plugin       | Tree filtered for plugin dev (IDs, no visuals), deeper (≤5)     | fileUrl, depth              | R   | REST                                              | 0    |
| figma_get_selection             | Current canvas selection                                        | —                           | R   | Bridge only                                       | 3    |
| figma_get_styles                | Color/text/effect/grid styles, code-export option               | fileUrl, verbosity          | R   | REST                                              | 9    |
| figma_get_text_styles           | Local text styles + IDs for figma_execute                       | —                           | R   | Bridge                                            | 1    |
| figma_get_design_system_summary | Compact overview: categories/counts/collections                 | fileUrl, forceRefresh       | R   | cached                                            | 1    |
| figma_search_components         | Find components by name/category; cross-file via libraryFileKey | query                       | R   | REST                                              | 13   |
| figma_get_component             | Single component metadata or reconstruction spec                | nodeId, format              | R   | REST (Bridge needed for full desc on unpublished) | 14   |
| figma_get_component_details     | Full variant/property/keys for instantiation                    | componentKey/Name           | R   | REST                                              | 3    |

### Component-for-development (handoff)

| Tool                                     | Purpose                                                                                    | Key inputs                    | R/W | Bridge?                     | Refs |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------- | --- | --------------------------- | ---- |
| figma_get_component_for_development      | Depth-4 tree + tokens + states + slots + 2x image, code-gen ready                          | nodeId, fileUrl, codebasePath | R   | REST+image                  | 14   |
| figma_get_component_for_development_deep | Unlimited-depth tree, resolved token names, reactions                                      | nodeId, depth≤20              | R   | Bridge only                 | 5    |
| figma_analyze_component_set              | Variant axes, CSS pseudo-class map, per-variant visual diffs, slot mapping, prop→code-prop | nodeId (COMPONENT_SET)        | R   | Bridge only                 | 4    |
| figma_get_design_system_kit              | Tokens+components+styles, delta-encoded variants, one call                                 | fileKey, format, include[]    | R   | Bridge/relay→REST, any plan | 6    |

### Variables/tokens

| Tool                             | Purpose                                                        | Key inputs                           | R/W            | Bridge?                                 | Refs |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------ | -------------- | --------------------------------------- | ---- |
| figma_get_variables              | Vars/collections/modes, paginated, alias-resolve option        | format, collection, namePattern      | R              | Bridge→REST(Enterprise)→Styles fallback | 36   |
| figma_get_token_values           | Resolved token values after summary                            | filter, type                         | R              | cache                                   | 0    |
| figma_browse_tokens              | Interactive token browser (MCP App UI)                         | fileUrl                              | R              | UI-only                                 | 0    |
| figma_export_tokens              | Vars→DTCG/CSS/Tailwind/SCSS/TS/JSON files, merge-diff strategy | format, outputPath, strategy         | R+writes files | Bridge/relay                            | 0    |
| figma_import_tokens              | DTCG→create/update vars, alias-aware; replace can delete       | payload/files, strategy              | W              | Bridge                                  | 0    |
| figma_setup_design_tokens        | One-shot collection+modes+vars, brace alias refs               | collectionName, modes, tokens[]≤100  | W              | Bridge                                  | 21   |
| figma_create_variable            | Single variable                                                | collectionId, name, resolvedType     | W              | Bridge                                  | 9    |
| figma_batch_create_variables     | Bulk create ≤100, up to 50x faster                             | collectionId, variables[]            | W              | Bridge                                  | 7    |
| figma_update_variable            | Update value and/or description                                | variableId, modeId+value/description | W              | Bridge                                  | 2    |
| figma_batch_update_variables     | Bulk value update ≤100                                         | updates[]                            | W              | Bridge                                  | 4    |
| figma_delete_variable            | Delete one (destructive)                                       | variableId                           | W              | Bridge                                  | 4    |
| figma_delete_variable_collection | Delete collection + all vars (destructive)                     | collectionId                         | W              | Bridge                                  | 2    |
| figma_create_variable_collection | Empty collection + modes                                       | name, additionalModes                | W              | Bridge                                  | 4    |
| figma_add_mode                   | Add mode to collection                                         | collectionId, modeName               | W              | Bridge                                  | 5    |
| figma_rename_mode                | Rename mode                                                    | collectionId, modeId, newName        | W              | Bridge                                  | 3    |
| figma_rename_variable            | Rename var, values preserved                                   | variableId, newName                  | W              | Bridge                                  | 7    |

### Component authoring (create/edit/arrange/properties/slots)

| Tool                            | Purpose                                                           | Key inputs                                 | R/W | Bridge? | Refs |
| ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ | --- | ------- | ---- |
| figma_create_component_set      | Build variant set from base or existing components; ≤100 variants | baseComponentId+properties OR componentIds | W   | Bridge  | 0    |
| figma_arrange_component_set     | Grid-arrange variants in place, purple-dashed viz                 | componentSetId                             | W   | Bridge  | 14   |
| figma_add_component_property    | Add BOOLEAN/TEXT/INSTANCE_SWAP/VARIANT/SLOT prop                  | nodeId, propertyName, type                 | W   | Bridge  | 6    |
| figma_edit_component_property   | Rename/change default/preferred values                            | nodeId, propertyName, newValue             | W   | Bridge  | 4    |
| figma_delete_component_property | Remove prop (not VARIANT)                                         | nodeId, propertyName                       | W   | Bridge  | 4    |
| figma_add_slot_property         | Manually bind SLOT prop to existing frame                         | nodeId, frameNodeId                        | W   | Bridge  | 0    |
| figma_create_slot               | Create SlotNode + linked SLOT prop                                | nodeId, name                               | W   | Bridge  | 0    |
| figma_append_to_slot            | Clone/create content into an instance's slot                      | instanceId/slotId, sourceNodeId            | W   | Bridge  | 0    |
| figma_reset_slot                | Reset instance slot to default/empty                              | instanceId/slotId                          | W   | Bridge  | 0    |
| figma_get_slots                 | List SlotNodes on component/set/instance                          | nodeId                                     | R   | Bridge  | 0    |
| figma_instantiate_component     | Create instance from design system                                | componentKey+nodeId                        | W   | Bridge  | 2    |
| figma_set_instance_properties   | Set TEXT/BOOLEAN/INSTANCE_SWAP/VARIANT props on instance          | nodeId, properties{}                       | W   | Bridge  | 3    |

### Node mutation

| Tool                 | Purpose                                        | Key inputs            | R/W | Bridge? | Refs |
| -------------------- | ---------------------------------------------- | --------------------- | --- | ------- | ---- |
| figma_clone_node     | Duplicate node (offset placement)              | nodeId                | W   | Bridge  | 1    |
| figma_create_child   | New shape/frame/text inside parent             | parentId, nodeType    | W   | Bridge  | 1    |
| figma_delete_node    | Delete node (undoable)                         | nodeId                | W   | Bridge  | 1    |
| figma_move_node      | Reposition within parent                       | nodeId, x, y          | W   | Bridge  | 1    |
| figma_resize_node    | Resize, respects child constraints by default  | nodeId, width, height | W   | Bridge  | 1    |
| figma_rename_node    | Rename layer                                   | nodeId, newName       | W   | Bridge  | 1    |
| figma_set_fills      | Solid fill or bind to variable                 | nodeId, fills[]       | W   | Bridge  | 2    |
| figma_set_strokes    | Stroke color/weight or variable bind           | nodeId, strokes[]     | W   | Bridge  | 2    |
| figma_set_text       | Text content + optional font size/family/style | nodeId, text          | W   | Bridge  | 3    |
| figma_set_image_fill | Base64 image fill on nodes                     | nodeIds[], imageData  | W   | Bridge  | 1    |

### Documentation (description, annotations, doc generation)

| Tool                            | Purpose                                                                    | Key inputs                           | R/W | Bridge?     | Refs |
| ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------ | --- | ----------- | ---- |
| figma_set_description           | Set component/style description (Dev Mode)                                 | nodeId, description                  | W   | Bridge      | 19   |
| figma_get_annotation_categories | List annotation categories                                                 | —                                    | R   | Bridge      | 2    |
| figma_get_annotations           | Read designer-authored specs (timings, a11y notes, pinned props)           | nodeId, include_children             | R   | Bridge      | 2    |
| figma_set_annotations           | Write/clear annotations, markdown labels, pinned props                     | nodeId, annotations[]                | W   | Bridge      | 11   |
| figma_generate_component_doc    | AI-complete markdown docs: anatomy, tokens, a11y, parity, optional history | nodeId, codeInfo, history{figma,git} | R   | REST+enrich | 3    |

### Review/audit/lint/a11y

| Tool                                | Purpose                                                               | Key inputs                | R/W | Bridge?     | Refs |
| ----------------------------------- | --------------------------------------------------------------------- | ------------------------- | --- | ----------- | ---- |
| figma_audit_component_accessibility | Scorecard: states, focus, non-color diff, target size, colorblind sim | nodeId                    | R   | Bridge      | 12   |
| figma_audit_design_system           | File health dashboard (naming, tokens, a11y, consistency)             | fileUrl                   | R   | shown in UI | 6    |
| figma_audit_design_system_report    | Same audit as scored JSON, chunked by category, ~5min cache           | fileUrl, category, format | R   | —           | 0    |
| figma_lint_design                   | WCAG 2.2 + design-system + layout checks, categorized findings        | nodeId, rules[]           | R   | Bridge      | 3    |

### Parity & verification (design parity, screenshots, code a11y scan)

| Tool                          | Purpose                                                                | Key inputs            | R/W | Bridge?           | Refs |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------- | --- | ----------------- | ---- |
| figma_check_design_parity     | Design-vs-code discrepancy score + fix items both sides                | nodeId, codeSpec{}    | R   | REST/Bridge       | 49   |
| figma_capture_screenshot      | Plugin exportAsync screenshot of current runtime state, AI-size-capped | nodeId, format, scale | R   | Bridge only       | 8    |
| figma_take_screenshot         | Screenshot, Bridge preferred, falls back to REST                       | nodeId, format, scale | R   | Bridge/REST       | 18   |
| figma_get_component_image     | Rendered image via REST, 30-day URL                                    | nodeId, format, scale | R   | REST              | 2    |
| figma_scan_code_accessibility | axe-core scan of HTML (structural/semantic only, no visual contrast)   | html                  | R   | none (standalone) | 6    |

### History/versions/changelog/blame/comments

| Tool                            | Purpose                                                  | Key inputs                                              | R/W | Bridge?                                   | Refs |
| ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- | --- | ----------------------------------------- | ---- |
| figma_diff_versions             | Page-diff always; deep node diff with component_ids      | from_version, to_version, component_ids                 | R   | REST (+Bridge for desc/annotation deltas) | 0    |
| figma_get_changes_since_version | Convenience wrapper, since_version→current               | since_version                                           | R   | REST                                      | 0    |
| figma_generate_changelog        | Wraps diff_versions, returns markdown+data               | from_version, to_version                                | R   | REST                                      | 0    |
| figma_get_file_versions         | Version history list, paginated, labeled-only by default | fileUrl, include_autosaves                              | R   | REST                                      | 7    |
| figma_get_file_at_version       | File/nodes snapshot at a past version                    | version_id, node_ids                                    | R   | REST                                      | 0    |
| figma_blame_node                | Binary-search who/when introduced a change               | node_id, target_component_property/target_child_node_id | R   | REST                                      | 0    |
| figma_get_design_changes        | Buffered live change events since last check             | since, clear                                            | R   | Bridge (WS)                               | 4    |
| figma_get_comments              | Comment threads, author/message/pin                      | fileUrl, include_resolved                               | R   | REST                                      | 1    |
| figma_post_comment              | Post/reply comment, optional node pin                    | message, node_id                                        | W   | REST                                      | 2    |
| figma_delete_comment            | Delete comment by ID                                     | comment_id                                              | W   | REST                                      | 1    |

### Design-system pipeline (ds_*) — Local Mode only, codebase-facing (reverse direction: code → Figma-ready tokens/Storybook)

| Tool                       | Purpose                                                                      | Key inputs        | R/W      | Bridge?    | Refs |
| -------------------------- | ---------------------------------------------------------------------------- | ----------------- | -------- | ---------- | ---- |
| figma_ds_analyze           | Scan app codebase(s): framework, styling, component inventory + porting rank | targets[]         | R (fs)   | Local only | 0    |
| figma_ds_extract_tokens    | Mine tokens from analyzed code → DTCG+CSS/Tailwind/SCSS/TS                   | outDir            | R+writes | Local only | 0    |
| figma_ds_extract_component | Deep single-component extraction: source, props, story scaffold              | outDir, component | R        | Local only | 0    |
| figma_ds_scaffold          | Generate design-system package skeleton                                      | outDir            | writes   | Local only | 0    |
| figma_ds_setup_storybook   | Wire freshly-init Storybook to extracted tokens/fonts                        | outDir            | writes   | Local only | 0    |
| figma_ds_status            | Read/update porting progress (persisted to disk)                             | outDir, update{}  | R/W      | Local only | 0    |
| figma_ds_verify            | Fidelity-eval gate before handoff/Figma push                                 | outDir            | R        | Local only | 0    |

### Console/plugin debugging

| Tool                   | Purpose                                                                    | Key inputs      | R/W       | Bridge?     | Refs |
| ---------------------- | -------------------------------------------------------------------------- | --------------- | --------- | ----------- | ---- |
| figma_diagnose         | Plain-language health check; disambiguates other Figma-related MCP servers | verbose         | R         | —           | 0    |
| figma_get_status       | Connection status; probe:true for live roundtrip                           | probe           | R         | —           | 17   |
| figma_reconnect        | Force full reconnect                                                       | —               | W(conn)   | —           | 2    |
| figma_reload_plugin    | Reload Figma page/plugin, optional clear console                           | clearConsole    | W         | Bridge      | 2    |
| figma_clear_console    | Clear log buffer                                                           | —               | W         | —           | 1    |
| figma_get_console_logs | Retrieve recent plugin console logs                                        | count, level    | R         | —           | 2    |
| figma_watch_console    | Stream logs live, max 5 min                                                | duration, level | R         | —           | 2    |
| figma_execute          | Run arbitrary JS in plugin context (full figma API, read/write)            | code, timeout   | R/W       | Bridge only | 109  |
| figma_navigate         | Switch active file target among connected plugins; lock:true pins it       | url, lock       | W(target) | Bridge      | 2    |

### Library/cross-file

| Tool                               | Purpose                                                              | Key inputs                  | R/W | Bridge?                    | Refs |
| ---------------------------------- | -------------------------------------------------------------------- | --------------------------- | --- | -------------------------- | ---- |
| figma_get_library_component_by_key | Resolve componentKey→props/variants/visualSpec, no source URL needed | componentKey                | R   | REST (library_assets:read) | 0    |
| figma_get_library_components       | Discover published components in a shared library file               | libraryFileKey/Url          | R   | REST                       | 3    |
| figma_get_library_variables        | Inventory variables from subscribed team libraries                   | libraryName, collectionName | R   | Bridge                     | 0    |
| figma_import_library_variable      | Import one library variable into current file (idempotent)           | variableKey                 | W   | Bridge                     | 0    |
| figma_execute_across_files         | Run same JS across multiple connected files in parallel              | code, fileKeys/allFiles     | R/W | Bridge, Local Mode only    | 0    |
| figma_list_open_files              | List files connected via Bridge, shows active target                 | —                           | R   | Bridge                     | 1    |

### MCP Apps (dashboard, token browser)

| Tool                  | Purpose                                  | Key inputs | R/W | Bridge? | Refs |
| --------------------- | ---------------------------------------- | ---------- | --- | ------- | ---- |
| ds_dashboard_refresh  | Refresh Design System Dashboard app data | fileUrl    | R   | UI-only | 0    |
| token_browser_refresh | Refresh token browser app data           | fileUrl    | R   | UI-only | 0    |

## (b) Zero-reference tools (30 of 99)

- **ds_dashboard_refresh** — MCP-App dashboard refresh; design-review sessions run interactively in the UI, not scripted.
- **figma_add_slot_property** — manual alt to create_slot; design-to-code handoff prep (binding an existing frame as a slot).
- **figma_append_to_slot** — populate an instance's slot; building review/demo instances.
- **figma_audit_design_system_report** — scored JSON audit with per-finding fixability; design review/audit automation.
- **figma_blame_node** — who/when introduced a change; design review provenance, changelog authorship.
- **figma_browse_tokens** — interactive token explorer UI; design review of token coverage.
- **figma_create_component_set** — programmatic variant-set build; component-authoring (not handoff/review).
- **figma_create_slot** — define a freeform slot; component authoring for slot-based composition (→ code children/slots).
- **figma_diagnose** — connection/health troubleshooting; supports any workflow when the bridge misbehaves.
- **figma_diff_versions** — page+node version diff; design review / "what changed since last handoff" checks.
- **figma_ds_analyze / figma_ds_extract_component / figma_ds_extract_tokens / figma_ds_scaffold / figma_ds_setup_storybook / figma_ds_status / figma_ds_verify** — the whole code→Figma extraction pipeline (reverse-engineer an existing codebase into Figma-importable tokens + a Storybook workshop); code-to-design sync direction, opposite of this repo's Figma→spec→code flow.
- **figma_execute_across_files** — cross-file scripting; multi-file design review/audit at scale.
- **figma_export_tokens** — variables→code token files; design-to-code token sync/automation.
- **figma_generate_changelog** — human-readable release notes from a version diff; release-notes workflow.
- **figma_get_changes_since_version** — convenience diff wrapper; "what's new" design-review checks.
- **figma_get_file_at_version** — historical file/node snapshot; design review/audit of past states.
- **figma_get_library_component_by_key** — resolve a library component's props from just its key; handoff when only a key is known.
- **figma_get_library_variables** — inventory subscribed library tokens; cross-file token handoff.
- **figma_get_slots** — discover slot children before appending; component-authoring/handoff of slot-based components.
- **figma_get_token_values** — resolved token values post-summary; docs-generation/handoff detail lookup.
- **figma_import_library_variable** — bring one library token into the current file; token handoff.
- **figma_import_tokens** — code tokens→Figma variables; code-to-design sync (reverse of the repo's usual direction).
- **figma_reset_slot** — clear an instance slot to default; component-authoring/demo cleanup.
- **token_browser_refresh** — MCP-App token browser refresh; same UI-driven review caveat as ds_dashboard_refresh.

`tools/figma/` (parity.json, snapshot.json, text-nodes.json, type-baseline.json) holds
only data output — one incidental string match (parity.json) — not tool-invocation code.
All real repo usage of tool names lives in `.claude/skills/figma-workspace-architect/`
(433 of 546 total occurrences), `docs/src/pages/*.astro` (45), `plan/` (35, mostly
`plan/figma.md` and `plan/adr/0024-design-parity-persistence-gate.md`), `tools/scripts/*.mjs`
(26, e.g. `figma-snapshot.mjs`, `check-parity.js`), `tasks/lessons.md` (5), `AGENTS.md` (2).

## (c) Notable details for a skill author

- **Two connection modes.** "Local Mode" = Desktop Bridge plugin over WebSocket, live
  state, any Figma plan. "Cloud Mode" pairs with a single plugin instance, rejects
  `fileKey`/multi-file params. `figma_execute_across_files` and the whole `ds_*` pipeline
  are Local-Mode-only.
- **figma_execute is the escape hatch and highest-risk tool** (109 refs, most-used by far).
  Mandatory housekeeping is baked into its description: screenshot before/after, place new
  nodes inside a Section/Frame (never bare canvas), delete orphaned nodes on failed retries,
  and — critically — **instance text edits fail silently**; use `figma_set_instance_properties`
  for INSTANCE nodes instead of touching text nodes directly.
- **figma_get_variables resolution order**: Bridge → REST Variables API (Enterprise-only,
  can 403) → Styles API partial fallback. A 403 is not a dead end — bridge/relay works on
  any plan; `figma_get_design_system_kit` and variable-binding fill/stroke tools repeat this note.
- **Token round-trip pair**: `figma_export_tokens` / `figma_import_tokens` replace Style
  Dictionary + Tokens Studio. Only DTCG is fully round-trip safe; Tokens Studio JSON, raw CSS
  vars, Tailwind v4, SCSS, Style Dictionary v3 as **inputs** are "scaffolded but return
  NotImplementedError" — convert to DTCG first. `figma_setup_design_tokens` supports brace
  alias refs (`{color.blue.600}`), resolved against same-call vars first, then existing ones.
- **Size/timeout limits**: `figma_batch_create/update_variables` cap 100 items;
  `figma_create_component_set` hard-caps 100 variants (timeout auto-scales ~1.2s/variant,
  30s floor/2min cap; split >40-variant matrices); screenshot tools auto-downscale to 1568px
  longest side (the "AI vision processing ceiling"); `figma_get_library_component_by_key`
  auto-downgrades to `summary`/strips specs over 500KB; `figma_get_design_system_kit`
  auto-compresses oversized responses regardless of requested format; `figma_watch_console`
  maxes 5 min; `figma_get_file_versions` caps 200 (default 50, autosaves excluded by default);
  `figma_blame_node` walks up to 500 versions via binary search.
- **figma_diff_versions coverage gaps** (inherited by `figma_generate_changelog` /
  `figma_get_changes_since_version`): REST snapshots never carry description/annotation
  changes unless the Bridge plugin was connected during the edit (session buffer). Never
  tracked: canvas instances, unbound raw layout/visual props, variable _value_ changes,
  style content, edits made while disconnected — see `scope_coverage`/`notes[]`.
- **figma_lint_design vs figma_scan_code_accessibility are complementary, not redundant.**
  Design-side lint covers real WCAG rules plus opt-in "best-practice" hints, and notes
  sub-1.5 line-height alone is _not_ itself a WCAG 1.4.12 failure (lack of override support
  is, a code concern). Code-side scan runs axe-core via JSDOM with visual checks (contrast,
  focus visibility) disabled — pair both for full-spectrum coverage.
- **figma_check_design_parity** requires a hand-built `codeSpec` (read the component source
  first). `figma_scan_code_accessibility` with `mapToCodeSpec:true` auto-generates the
  `codeSpec.accessibility` slice.
- **figma_post_comment**: `@mentions` render as plain text only — no clickable tag, no
  Figma notification.
- **figma_navigate**: `lock:true` pins the active file target so reconnects and the human's
  own clicking elsewhere can't silently redirect subsequent calls.
- **figma_search_components**: query matches component name _and_ description text, so an
  unrelated component can surface via a description hit.
- **figma_diagnose** exists to disambiguate this server from _other_ Figma-related MCP
  servers a user may have installed (AGENTS.md separately references the official
  `figma-mcp` alongside `figma-console-mcp`).
