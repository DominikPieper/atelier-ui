# Wave 2 / A2 — "Code-only props" layer: spike for an ADR

Date: 2026-10-08. Read-only research. Nothing in the repo or in Figma was changed (one read-only
`figma_execute` walk of node `129:20`). No decision is made here; section 5 lists options.

Transcript paths: `~/Downloads/ai-design-systems-transcripts/` (cited as T102 / T115, line numbers
from `cat -n`).

## 0. Headline findings (read first)

1. **T115 ("DSAI Sep 24") does not contain the technique.** `grep -i "code.only|nathan|curtis|hidden layer"`
   returns zero hits. The only relevant material is generic advice (T115 L272-288): use annotations and
   descriptions heavily "on component sets and individual component variants", name layers
   semantically (`icon`, `swap instance icon`), and put dos/don'ts/intent in the description field.
   That is an argument for _descriptions_, i.e. option (b), not for a hidden layer. The only full
   description of the technique is T102 (33 lines, ~6 min, one practitioner demo; the speaker is not named
   in the file).
2. **Nathan Curtis's article is referenced but not identified.** T102 L4: "this really insightful
   article by Nathan Curtis about adding this new technique that he's calling code-only props in Figma".
   No title, no URL. Only other mentions of Curtis in the corpus are unrelated (T094 L174 specs; T101
   L322). T109 L6 uses "code only runtime props" in a different sense (parity-tool discrepancies).
   The ADR should cite the article as "title/URL not given in the transcript, to be looked up by the owner".
3. **Atelier already has a partial equivalent and a precedent:** `codeOnly` in the contract
   (`libs/spec/src/contracts/types.ts:29-37`) and a gate that makes it _mirrored in the master
   description_ (`tools/scripts/check-contracts.mjs:363-376`). The AtlInput contract even quotes the
   master's own wording "(code-only props on AtlInputSpec: type, placeholder, value, onValueChange,
   name)" (`libs/spec/src/contracts/input.contract.ts:17`). Name collision: Atelier's `codeOnly` means
   "code prop with no Figma property"; Curtis's "code-only props" means "non-visual facts stored in
   Figma for code to read". Related but not identical. The ADR should say which meaning it adopts.
4. **Toolchain risk is concentrated in two places:** a hidden _direct TEXT child_ of a variant root
   changes the root type read (`figma-snapshot.mjs:384-395`); and any layer name not starting with `_`
   enters the `layers` / `unnamedFrames` / `nodes` walks. Details in section 3.

## 1. What exactly is the technique (T102)

Source: T102 only (single demo, a freshly generated button, not a production DS).

- **Problem statement** (T102 L10-12, "almost directly from Nathan's article"): Figma component
  properties are biased toward visual outcomes; design systems need to communicate accessibility,
  semantics and behavioural intent to developers.
- **Structure** (T102 L4, L16): "a hidden layer, to be inserted into your component that holds a lot of
  the non-visual properties, things like ARIA labels and alt tags". The prompt (said to be word for
  word from the article) says: "Position it zero, zero absolute. Use the name `CodeOnlyProps`."
  Speaker notes the name is arbitrary: "this can either be an industry accepted thing or underscored
  or some sort of specific labeling" (L16).
- **Where it lives:** inside the component (the demo button had "one main layer and one nested text
  layer", L6), as an absolutely positioned child at 0,0. Whether it is per variant or per set is not
  stated; the demo component had one default variant, so the sync-across-variants question is not
  addressed in the source.
- **Hidden or not:** "hidden layer" / "hidden metadata container" (L4, L18). Mechanism (visible=false vs.
  tiny/transparent) is not specified. A hidden container with a nested accessibility label is the only
  concrete content shown (L22: "added the CodeOnlyProps with the accessibility label, and then you can see
  it added it up here as well", i.e. also surfaced in the layer list/properties panel).
- **Contents:** ARIA labels, alt tags, "non-visual properties" generally (L4); "accessibility
  semantics and behavioral intent" (L12). The demo adds only an accessibility label. Behaviour is
  claimed in the purpose statement, not shown.
- **How agents read it:** implied, not demonstrated. The agent reads the component's node tree (via the
  MCP) and sees the layer and its text/children; the stated benefit is "allow the AI to understand
  additional context about the component and ensuring those things get addressed when the component is
  being developed" (L4). No read-side demo in T102.
- **Written by an agent:** Figma Console MCP `figma_execute` via the Desktop Bridge plugin creates the
  container (L18-22). Prompt gave explicit file/node to save tokens (L14).
- **Keeping in sync / markdown-inventory loop** (L24-28): (1) ask the agent to generate a markdown
  inventory of components; (2) use a design-system-assistant MCP to propose the "likely properties and
  metadata" per component; (3) have the agent iterate over every component in the Figma file to add the
  layer, "so if we're keeping Figma parity with code intact"; (4) either one by one or "generate a
  markdown file and then ask it to execute on that markdown file". Sync across variants and later drift
  are not discussed; the loop is a one-shot back-fill, not a maintenance mechanism.
- **Speaker's prior art** (L30-32): they previously "manually added these properties to the component
  itself" and in the component description's "purpose and intent part", which "worked out really well".
  The hidden layer is called "another viable solution", i.e. an alternative to, not a replacement of,
  description text. This is the same family as Atelier's current description convention.
- **Evidence strength:** one demo, no measured benefit, no read-side test, no comparison to the
  description approach. The article may say more; it was not fetched (instruction).

## 2. How Atelier represents code-only facts today

- **Contract** `libs/spec/src/contracts/types.ts:18-68`. `codeOnly` (`:29-37`): "Code props or events that
  have no Figma property on purpose, each with the reason". Domain rule: only string-literal enum props
  need an entry; booleans, strings, numbers, callbacks, events never do (`:33-36`; ADR-0121 Refinement
  item 1, `plan/adr/0121-the-stories-are-the-spec.md:215-218`). Props/defaults/prose are forbidden in
  the contract (`:9-12`, `libs/spec/src/contracts/README.md:3-7`).
- **Settled vs owed** (ADR-0145; README `:9-21`): a `codeOnly` entry is either settled (behaviour,
  semantics, data, keys; "need no owner and no follow-up") or owed (drawn but missing in Figma).
  Hidden-layer facts are exactly the "settled, not drawn" class.
- **Examples:**
  - `button.contract.ts:6-12` `type` ("form-semantics attribute ... not a Figma-drawn visual axis").
  - `dialog.contract.ts:6-17` `open` (ADR-0056, false renders nothing) and `closeOnBackdrop` (behaviour only).
  - `input.contract.ts:13-19` `type`, reason quoting the master's description.
- **Mirror-in-description rule** `tools/scripts/check-contracts.mjs:363-376`: every `codeOnly` name must
  be a substring of `master.description`, else `[UNMIRRORED]`; also `UNEXPLAINED` reasons warn
  (`:364-370`). Same for `figmaOnly` (`:326-361`) and `axisMap.figmaAxis` (`:379-388`). Per ADR-0121
  Refinement item 4 these are warnings, not blockers. Weakness: **substring match**; `type` matches
  almost any prose, so the check proves very little (AtlButton's description has no "type" at all in the
  current snapshot, per a regex scan, yet this is only a warning/UNMIRRORED candidate; run
  `npm run check:contracts` to see its live state). Not verified here.
- **Staleness gates:** `codeOnly` naming a prop absent from every manifest -> error
  (`check-contracts.mjs:1589-1616`); present in one framework only -> `[FW-ONLY]` (`:1616`).
- **Master description convention already structured:** AtlButton description (snapshot, `129:20`) has an
  "API surface (Figma -> spec)" list with line patterns `- Variant \`x\`: ...`, `- Boolean \`x\`: ...`,
`- Text \`x\`: ...`, `- Glyph \`c\` on \`layer\`: ...`, parsed by `tools/scripts/check-figma.js:414,
  543, 595, 630, 660`(Boolean/Text/Variant/Glyph lines, "not modelled" opt-outs, "inherited from"). Plus
prose "Use when / Don't use when / A11y". The A11y line for AtlButton already states aria-label rule and
that`disabled` is native, i.e. the same content a CodeOnlyProps layer would hold.
- **ADR-0144** (`plan/adr/0144-no-figma-no-contract.md`): contracts and `snapshot.json` exist only with
  Figma enabled; `check-contracts.mjs` is "entirely snapshot-driven" (`:30-40`).
- **ADR-0148 `:84`** mentions codeOnly as "hidden in CSS" vs recorded in the contract (not further relevant).

## 3. How a hidden layer in masters interacts with the toolchain

Pipeline: `npm run figma:snapshot` -> `tools/scripts/figma-snapshot.mjs` (spawns figma-console-mcp,
runs a plugin-side probe, writes `tools/figma/snapshot.json` + `tools/figma/text-nodes.json`) ->
offline gates `check:figma` (`check-figma.js`), `check:contracts`, `check:paint`, `check:geometry`
(`package.json:35,50,55`). Master list is a hard-coded `MASTERS` array (`figma-snapshot.mjs:~58`).

Assumed layer for the analysis: variant child, name `CodeOnlyProps` or `_code-only-props`, visible=false,
`layoutPositioning=ABSOLUTE`, at 0,0; contents TEXT children and/or sub-frames. Precedent: AtlButton's
variant root already has hidden ABSOLUTE children `_disabled-overlay` (FRAME, bound to Boolean) and
`_loading-spinner` (ELLIPSE), see section 4.

| Consumer                                            | Behaviour with a new hidden layer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Cite                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Deep walk -> `nodes[]`                              | Hidden nodes are **walked, not skipped** (explicit design, ADR-0061). A frame with children appears as a node.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `figma-snapshot.mjs:1053-1137`                                                      |
| `[AUTOLAYOUT]` (critical)                           | A FRAME/GROUP with children and `layoutMode NONE` is an offender. A non-auto-layout wrapper holding text would fail the gate; the layer must be auto-layout or a childless frame/text, or be allowlisted.                                                                                                                                                                                                                                                                                                                                                                                                           | `check-figma.js:1397-1427`; snapshot `:1117,1132`                                   |
| `[OVERLAY]` (critical)                              | Any descendant whose name starts with `_` is read as an overlay: needs bound fills (RAW fill -> critical), box covering parent at 0,0, not outside parent, and "hidden and bound to no property" -> `orphan` critical. A hidden `_code-only-props` layer bound to nothing **would fail** `orphan:` (`check-figma.js:2874-2879`). So do **not** use the `_` prefix without a gate change, or allowlist (`allowed(sel,'overlay',kind)`).                                                                                                                                                                              | `figma-snapshot.mjs:436-478`; `check-figma.js:2830-2885`                            |
| `layers[]` / `[LAYER-PAINT]` / `[LAYER-UNRESOLVED]` | Non-`_`, non-generic-named FRAME/RECTANGLE/ELLIPSE (not INSTANCE) are recorded and the gate tries to resolve `.<name>` as a CSS selector; unresolved layers are **ratcheted** (count goes up -> blocker, baseline needs re-record). A frame named `CodeOnlyProps` is a new unresolved layer in each master.                                                                                                                                                                                                                                                                                                         | `figma-snapshot.mjs:481-531`; `check-figma.js:2905-2935, 2971-3010`                 |
| `unnamedFrames` / `[LAYER-UNNAMED]`                 | Auto-layout frames still named `Frame`/`Frame N` are counted (ratchet). Generic names also skip the `_` exemption only for `_`-prefixed. Name any frame in the layer.                                                                                                                                                                                                                                                                                                                                                                                                                                               | `figma-snapshot.mjs:536-566`; `check-figma.js:2943-2965`                            |
| Root type read                                      | `fontSize`/`lineHeight` of a variant root use `v.children.filter(TEXT)` and require **exactly one** direct TEXT child. A hidden TEXT placed directly under the variant root makes `length===2` -> null -> `[ROOT-TYPE]` row loses its comparison (count changes against `type-baseline.json`). Put text inside a frame, not at root level.                                                                                                                                                                                                                                                                          | `figma-snapshot.mjs:384-395`                                                        |
| `text-nodes.json` / TEXT rules                      | Every TEXT under a master is recorded (hidden ones with `visible:false`). `[FIGMA-AUTO-LEADING]` and `[FIGMA-VARIABLE-COLLECTION]` do **not** skip hidden nodes; only `[TEXT-UNSTYLED]` does (`rec.visible === false` -> continue). So hidden TEXT must carry a `ty/*` style bound to the semantic collection with explicit leading, or the ratchets rise (baseline `tools/figma/type-baseline.json`). 24 variants x N text nodes = counts.                                                                                                                                                                         | `check-figma.js:2650-2740` (esp. ~2680 AUTO, ~2690 collection, `:2714` hidden skip) |
| `[MASTER-GLYPH]`                                    | TEXT nodes that look like glyph characters are flagged; plain words are fine. Skips nodes inside instances.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `figma-snapshot.mjs:~296-310`, `check-figma.js:~673`                                |
| `rootPaint` / `booleanCover`                        | Reads variant root fill/stroke/box; `booleanCover` only considers children with a `visible` property reference at 0,0 same size. A layer with no `visible` binding is ignored there.                                                                                                                                                                                                                                                                                                                                                                                                                                | `figma-snapshot.mjs:317-426`                                                        |
| Box / `childrenExtent`                              | Extent is of **variants inside the set** (`set.children`), not of a variant's children, so a child does not change it. But a hidden child in a hug-content auto-layout variant only avoids changing the variant's size if it is `layoutPositioning=ABSOLUTE` (ignored by hug). Non-absolute hidden children are not laid out either when invisible? (Figma skips hidden children in auto layout) - not verified; use ABSOLUTE as in the existing overlays.                                                                                                                                                          | `figma-snapshot.mjs:573-590`, `check-figma.js:3728-3744`                            |
| `check:paint`                                       | Reads only `rootPaint` per master (`check-paint.mjs:7-24, 1744-1925`), contracts' `probes`/`codeOnly` for axis resolution (`:21-24`). **Does not read layer trees**; a hidden layer is ignored.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `check:geometry`                                    | Compares rendered CSS geometry with snapshot; no per-layer read in the grep (`check-geometry.mjs`), not examined further. Likely ignored if ABSOLUTE+hidden; not verified.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `check:contracts`                                   | Reads `snapshot.json` `description`, `properties`, `variantAxes` only (`check-contracts.mjs:299-388, 999-1241`). A hidden layer is **invisible to it**, so today it cannot verify codeOnly entries against the layer; it would need new code to do so.                                                                                                                                                                                                                                                                                                                                                              |
| Snapshot size/churn                                 | Captured per variant for AtlButton = 24 copies of the layer; `snapshot.json` is committed. `text-nodes.json` is deduplicated across variants (`check-figma.js:2618-2625`), `layers` too.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Inventory page                                      | `figma-sync-inventory.mjs` rewrites cards from masters; preview is a fresh INSTANCE of the default variant; header, meta line (type, WxH), property rows from axes/Boolean/TEXT definitions (`:18-24`). A hidden child inside the instance is not rendered and does not change W/H of an ABSOLUTE child. **No change needed**, but the new layer appears in instances' layer trees (designer-visible noise).                                                                                                                                                                                                        |
| `figma_check_design_parity`                         | External tool (figma-console-mcp); compares a declared `codeSpec` against the node's tree (SKILL `:310`; `references/parity-codespec.md`). Not executed here. The seven codeSpec sections are manifest-derived; an extra hidden layer likely ignored but **unverified**; test in the pilot.                                                                                                                                                                                                                                                                                                                         |
| `figma_scan_code_accessibility`                     | Operates on code, not on the master; unaffected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| design-to-code skill                                | Step 1.2 (`.claude/skills/design-to-code/SKILL.md:110-113`) reads variant axes, boundVariables, paddings, and **the description**; the API reference for the agent is the framework manifest "not where the agent looks up props". Nothing reads a hidden layer today. The skill (and `references/handoff-document.md`, `review-checklist.md`) would need a new step ("read CodeOnlyProps layer") for the layer to have any consumer. `figma_get_component_for_development` (depth 4) does return children, so the layer would be in its output (the MCP returns the node tree; hidden-ness handling not verified). |
| `figma_search_components`                           | "also matches description text" (SKILL `:102`); layer content is not searched. Description facts are discoverable, layer facts are not.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Summary: no gate reads layer text for meaning; the work is to make the existing structural gates
tolerant (naming, absolute positioning, auto-layout, text styles) and to add _one new consumer_
(gate and/or skill step), otherwise the layer is unused data.

## 4. Real master: AtlButton (`129:20`, "Inputs/AtlButton", COMPONENT_SET, 24 variants)

Read-only `figma_execute` walk, 2026-10-08. Properties: `disabled#507:192` (BOOLEAN),
`loading#507:217`, `hasIcon#507:242`, `label#1169:0` (TEXT), `variant`, `size`, `state` (VARIANT).
Variant `variant=primary, size=sm, state=default` (COMPONENT, HORIZONTAL auto layout, 120x32):

```
variant=primary, size=sm, state=default      COMPONENT  HORIZONTAL  120x32
  Button                  TEXT     visible   characters <- label#1169:0
  _disabled-overlay       FRAME    hidden    ABSOLUTE 120x32  visible <- disabled#507:192
    label                 TEXT     visible   characters <- label#1169:0
  _loading-spinner        ELLIPSE  hidden    ABSOLUTE 16x16   visible <- loading#507:217
```

Description today (from `tools/figma/snapshot.json`, `generatedAt 2026-10-08T07:28:07Z`): one-line
mapping ("Maps to AtlButtonSpec in libs/spec"), Use when / Don't use when, an "API surface (Figma ->
spec)" bullet list (Variant/Text/Boolean lines with `maps to AtlButtonSpec.x`), an A11y paragraph
("native HTML button ... supply `aria-label` for icon-only ... Disabled uses HTML `disabled`, not
aria-disabled"), a Status line, and a "Declared Boolean properties that reference no layer (ADR-0058)"
block. `type` (the `codeOnly` entry) is **not** named in it.

Hypothetical "after" (illustration only, not a proposal): a fourth child of each of the 24 variants:

```
  CodeOnlyProps           FRAME    hidden    ABSOLUTE 0,0, auto layout, no fill
    role                  TEXT     "button"             (native <button>)
    type                  TEXT     "button | submit | reset (default button)"
    aria-label            TEXT     "required when no visible label"
    disabled-semantics    TEXT     "native disabled, not aria-disabled"
```

Constraints from section 3 for this hypothetical: frame must be auto-layout (else `[AUTOLAYOUT]`),
named without `_` (else `[OVERLAY]` orphan) which then makes it a `layers[]` entry that resolves to no
CSS class (`[LAYER-UNRESOLVED]` ratchet +1 per master unless baseline re-recorded or an alias/allow
rule is added), its TEXT children need `ty/*` bound styles with explicit leading, and text must not sit
directly under the variant root (root type read). The 24x duplication is a manual-sync burden: the
fact is per component, not per variant.

## 5. Options for the ADR (no recommendation)

Common axis: a code-only fact has a **writer** (who edits it), a **reader** (what consumes it) and a
**sync check** (what notices drift). Today: writer = contract author, reader = `check:contracts` +
`docs-block.ts`; Figma carries a mirrored mention only (substring-checked).

### (a) Hidden layer per master, as in the course

- Pros: travels with the node, so `figma_get_component_for_development` (tree, depth 4) returns it
  without extra calls; survives copying into a participant's duplicate file; matches a technique taught
  in the course; machine-structured if children are named TEXT nodes.
- Cons: 24-ish copies per set (one per variant) with no native propagation between variants; toolchain
  tolerance work (section 3: AUTOLAYOUT, OVERLAY/`_` naming, layers ratchet, text-style ratchets, root type
  read); invisible to designers unless layers panel is open; Figma TEXT is a poor structured container;
  nothing reads it yet; evidence base is a single demo (T102). Back-fill is an agent loop (T102 L24-28)
  that needs Desktop Bridge and no other client holding the bridge (`figma-snapshot.mjs:19-22`).
- Gate to keep in sync with contract: extend `figma-snapshot.mjs` probe to record `codeOnlyProps`
  (name -> text) per master (new field, deduped across variants, flag variants that differ), then
  `check-contracts.mjs` compares them with `contract.codeOnly` and the manifest.

### (b) Structured text in the component description

- Pros: already the convention (`- Variant|Boolean|Text|Glyph` lines parsed at `check-figma.js:414-660`);
  one copy per set, no per-variant sync; surfaced by `figma_search_components` and
  `figma_get_component_for_development`; already in `snapshot.json` so no probe change; T115 L272-288
  and T102 L30-32 report this works for others too; zero impact on layer gates.
- Cons: free text, size, formatting limits in the Figma description field; description is also
  human prose (mixing); needs a stricter grammar (e.g. `- Code-only \`type\`: ...`) to be machine-parsed;
the current `includes(name)` mirror check is weak (`check-contracts.mjs:371`).
- Gate: add a line grammar (`- Code-only \`name\`: <reason>`), and in `check-contracts.mjs`require line
match instead of substring and equal-reason or reason-prefix with`contract.codeOnly[*].reason`.

### (c) Figma component property / annotations

- Component property: text properties are visible in the properties panel, per set not per variant,
  and appear in `componentPropertyDefinitions` (already in snapshot as `properties`). But a TEXT property
  must bind to a layer's characters (the Text-property machinery in `check-figma.js:543`) and would
  create a phantom prop vs code (the `[BOOLEAN]`/prop-parity checks key on property names); it would
  also surface as an instance override in every consumer. Poor fit for aria/semantics facts.
- Annotations (figma-console `figma_get_annotations` / `figma_set_annotations` /
  `figma_get_annotation_categories` exist): attached to nodes, categorised, and `figma_get_component_for_development`
  already returns "design annotations" (tool description). T115 L272 recommends annotations "specifically
  for motion and accessibility". Pros: designed for this, no layer pollution, no geometry/paint effects,
  readable by the MCP. Cons: not in `snapshot.json` today (probe change needed); Dev Mode feature, may
  not be writable in all plans (not verified); per node, so a set-level annotation vs 24 variants must be
  chosen; the annotation categories need to be defined.
- Gate: add `annotations` to the snapshot probe; compare to `contract.codeOnly`.

### (d) Hybrid

Example split: description carries the human-readable _why_ + the grammar line (source for gates and
search); a single hidden layer or annotation holds only what an agent must not miss (aria/role/keyboard
contract) in a stricter form. Pros: each carrier used for what it is good at. Cons: three places
(contract, description, layer) is the exact duplication that ADR-0121 Decision 3 and ADR-0145 argue
against ("a contract that regrows into a metadata file has failed", `types.ts:12-13`), unless one is
declared canonical and the others derived or gated.

### Cross-cutting: duplication with the contract's `codeOnly`

- Two different kinds of fact live under the same name. Contract `codeOnly` = **enum props with no Figma
  axis** (domain rule `types.ts:33-36`), recorded to silence `[ENUM-UNDRAWN]`. Curtis-style layer = **a
  free set of non-visual facts** (aria, alt, role, behaviour) that mostly are _not_ manifest props.
  Their intersection is small (AtlButton `type`, AtlDialog `open`/`closeOnBackdrop`).
- Possible single-source models for the ADR to choose among:
  1. Contract stays canonical for the _set of names_ + reason; Figma carriers are a **mirror** checked
     by a gate (extend current `[UNMIRRORED]` from substring to exact structured match).
  2. Figma carrier canonical; the contract's `codeOnly` reason is generated/validated from the snapshot
     (reverses ADR-0121 where Figma is checked against code and the contract is hand-authored).
  3. Separate namespaces: contract `codeOnly` unchanged; a new Figma-side "semantics" block holds
     aria/role/keyboard facts that have no manifest prop, checked only for presence/shape (e.g. every
     master with an interactive role has it), not against the contract.
- Existing sync checks that can be reused: `[UNMIRRORED]` (`check-contracts.mjs:371-376`),
  `[STALE-EXEMPTION]` (`:1589-1616`), `[FW-ONLY]`. A new check would live in `check-contracts.mjs`
  because it joins two sources (snapshot + contract), which is the repo's own line between a gate and a
  lint rule (memory: project_gate_vs_lint_rule_line, ADR-0126).
- Also decide: **who reads it.** Today no skill, gate or agent step reads a hidden layer
  (`.claude/skills/design-to-code/SKILL.md:110-113` reads the description). Without a consumer the layer
  is write-only.

## 6. Smallest pilot (no decision implied)

Pilot on **one master, one carrier at a time, with a measurable read-side test**, e.g. AtlButton:

1. Carrier A (layer): add `CodeOnlyProps` (auto-layout FRAME, hidden, ABSOLUTE 0,0, children = TEXT
   with `ty/*` style, none directly under the variant root) to **one variant only**
   (`variant=primary, size=sm, state=default`), via `figma_execute` (needs a mutation approval, outside
   this spike). Run `npm run figma:snapshot` then `npm run check:figma` and `check:contracts` and
   `check:paint` with exit codes captured (`cmd > /tmp/out 2>&1; echo $?`), and record which rules fire
   (expected from section 3: `[LAYER-UNRESOLVED]` +1, possibly `[FIGMA-AUTO-LEADING]`/`[TEXT-UNSTYLED]`
   counts, `[OVERLAY]` if `_`-prefixed).
2. Read-side test: ask an agent to implement AtlButton from `figma_get_component_for_development` **with
   and without** the layer and with the description's A11y paragraph removed, and compare whether
   aria-label / native `disabled` / `type` come out right. This tests whether the layer adds anything
   beyond the existing description.
3. Carrier B (description grammar, option b) and C (annotation) on the same master for the same test, to
   get a like-for-like comparison. Then write the ADR from the three results.

## 7. Verified vs assumed

Verified: transcript contents (T102 full, T115 grep + the passage L218-290), all repo file:line citations
above (read directly), AtlButton live layer tree (read-only execute), snapshot description text.
Assumed / not verified: behaviour of `figma_check_design_parity` with an extra hidden layer;
whether `figma_get_component_for_development` includes hidden children; `check:geometry` handling;
whether a hidden non-ABSOLUTE child alters hug sizing; whether annotations are writable in this file's
plan; the exact current output of `check:contracts` for AtlButton `type` (not run). I did not run any
gate.
