# A3 wave 2: a real parity run, AtlBadge (Angular), 2026-10-08

Read-only run. Figma not mutated (no `figma_post_comment`, no set/create tools). Only reads: `figma_get_status`, `figma_scan_code_accessibility` (no Figma needed), `figma_check_design_parity`, `figma_get_component_for_development`.

## 1. How the repo assembles the codeSpec (sources read)

- `.claude/skills/design-to-code/references/parity-codespec.md` is the recipe; AGENTS.md "Verify" step 4 is the rule.
- Seven sections: `visual`, `spacing`, `typography`, `tokens`, `componentAPI`, `accessibility`, `metadata`. The tool diffs only what is declared; a thin spec comes back clean and proves nothing (ADR-0096). The score belongs to the declaration plus the sampled node (ADR-0024 amendment: three runs on AtlStepper gave 70, 52, 83).
- `npm run check:contracts -- --emit <dir>` fills three sections only: `componentAPI`, `metadata` (name + description), `tokens.usedTokens`. It writes `<dir>/<framework>/<AtlName>.codespec.json`. `--help` is not implemented: it simply runs the whole gate (exit 0, prints per-framework counts and findings) and `--emit` is parsed at `tools/scripts/check-contracts.mjs:130`. Emit code: lines ~1531-1560.
- `figma_scan_code_accessibility({html, mapToCodeSpec:true})` fills `accessibility`. The recipe says to copy the story root `outerHTML` from the running Storybook; I did not run Storybook and hand-wrote the host markup instead (see caveats).
- `visual`/`spacing`/`typography` are NOT derived by any script. I derived them by hand from `libs/styles/src/badge/atl-badge.css` + `libs/styles/src/tokens.css` (default/md variant). The recipe only asks for these where measured via the architect `code-verify` recipe; mine are read from the stylesheet, not measured in a browser.
- Docs: `docs/src/pages/first-component.astro` step "Run the parity check" uses a `PARITY_PROMPT` (node-id 936-2954) and expects "0 discrepancies" (line ~371).
- Contract: `libs/spec/src/contracts/badge.contract.ts` is only `{ component: 'AtlBadge', figmaNodeId: '55:22' }` (no figmaOnly/codeOnly/axisMap/probes).

## 2. Commands and raw outputs

### 2a. `node tools/scripts/check-contracts.mjs --emit <scratch>/emit` (exit 0)

Summary lines:

```
[angular] components: 31, contracts: 43, stories: 32 ..., warnings: 25, errors: 0
[react]   components: 28 ... warnings: 32, errors: 0
[vue]     components: 29 ... warnings: 25, errors: 0
```

No finding concerns AtlBadge. Emitted `angular/AtlBadge.codespec.json` (verbatim):

```json
{
  "componentAPI": {
    "props": [
      { "name": "size", "type": "\"sm\" | \"md\"", "values": ["sm", "md"], "defaultValue": "md", "description": "Size of the badge." },
      { "name": "variant", "type": "\"default\" | \"success\" | \"warning\" | \"danger\" | \"info\"", "values": ["default", "success", "warning", "danger", "info"], "defaultValue": "default", "description": "Semantic color variant of the badge." }
    ],
    "events": []
  },
  "metadata": { "name": "AtlBadge" },
  "tokens": { "usedTokens": ["--ui-border-width", "--ui-color-border", "--ui-color-danger-bg", "--ui-color-danger-text", "--ui-color-info-bg", "--ui-color-info-text", "--ui-color-success-bg", "--ui-color-success-text", "--ui-color-surface-sunken", "--ui-color-text-muted", "--ui-color-warning-bg", "--ui-color-warning-text", "--ui-font-family", "--ui-font-size-sm", "--ui-font-size-xs", "--ui-font-weight-bold", "--ui-font-weight-semibold", "--ui-letter-spacing-wide", "--ui-line-height-tight", "--ui-radius-full", "--ui-spacing-2", "--ui-spacing-3"] }
}
```

Observation: `metadata` has NO `description`. The class JSDoc in `libs/angular/src/lib/badge/atl-badge.ts` sits above `const VARIANT_ICON_NAMES`, not above `@Component`, so docgen finds no component description. A real (small) code bug in the emit chain, not reported by any gate output I saw. Not flagged by parity because the tool does not compare description.

### 2b. `figma_get_status({probe:true})`

Connected via WebSocket (port 9225, fallback from 9223), file "Atelier UI", probe success, 1 ms. Other bridge instances on 9223/9224 exist.

### 2c. `figma_scan_code_accessibility` (html: `<atl-badge class="atl-badge variant-default size-md" role="status">Default</atl-badge>`, mapToCodeSpec, includePassingRules)

```json
{ "engine": "axe-core", "version": "4.13.0", "mode": "jsdom-structural", "note": "JSDOM mode: structural/semantic checks only. Visual rules (color contrast, focus visibility) are disabled ...", "categories": [], "summary": { "critical": 0, "warning": 0, "info": 0, "total": 0 }, "passes": 9, "incomplete": 2, "inapplicable": 76, "codeSpecAccessibility": { "semanticElement": "div", "role": "status", "focusVisible": false } }
```

Caveat: `semanticElement:"div"` is an artefact of scanning a custom element (`atl-badge`) in JSDOM; the host really is an `atl-badge` element with `role=status`. `focusVisible:false` is the tool's static default, not a measurement. No contrast ratio is produced (visual rules off).

### 2d. `figma_check_design_parity` nodeId `55:22`, canonicalSource default ("design"), enrich default true

codeSpec declared: filePath, componentAPI, metadata, tokens (+tokenPrefix `--ui-`), accessibility, visual, spacing, typography = ALL SEVEN. Values for variant=default, size=md: bg #f1f5f9, border #e2e8f0 1px, radius 9999, padding 5/12/5/12 (top/bottom from CSS literals 0.3125rem, left/right `--ui-spacing-3`), Instrument Sans 14px / 600 / lineHeight 17.5 / letterSpacing 0.14 (0.01em).

Raw result (the `ai_instruction` prose and repeated `codeData` trimmed; structure kept):

```json
{
 "summary": {"totalDiscrepancies":2,"parityScore":96,"byCritical":0,"byMajor":0,"byMinor":1,"byInfo":1,
             "categories":{"typography":1,"accessibility":1}},
 "discrepancies": [
  {"category":"typography","property":"fontWeight","severity":"minor","designValue":500,"codeValue":600,
   "message":"Font weight mismatch: design=500, code=600"},
  {"category":"accessibility","property":"role","severity":"info","designValue":null,"codeValue":"status",
   "message":"Code defines role=\"status\" but design has no accessibility annotations",
   "suggestion":"Add accessibility annotations in Figma description"}
 ],
 "actionItems": [
  {"discrepancyIndex":0,"side":"code","codeChange":{"filePath":"libs/angular/src/lib/badge/atl-badge.ts","property":"fontWeight","currentValue":600,"targetValue":500,"description":"Update code to match design: Font weight mismatch: design=500, code=600"}},
  {"discrepancyIndex":1,"side":"code","codeChange":{"filePath":"libs/angular/src/lib/badge/atl-badge.ts","property":"role","currentValue":"status","targetValue":null,"description":"Add accessibility annotations in Figma description"}}
 ],
 "ai_instruction": "<prose: render as '## <name> - Parity Report / Score / Action Required / Aligned / Notes / Verdict'; critical/major + real minor spec gaps -> Action Required; paradigm differences + info -> Notes>",
 "designData": {
   "name":"Display/AtlBadge","resolvedName":"Display/AtlBadge","type":"COMPONENT_SET","isComponentSet":true,
   "defaultVariantName":"variant=default, size=md","componentSetName":"Display/AtlBadge","componentSetNodeId":"55:22",
   "fills":[{"type":"SOLID","color":{"r":0.945,"g":0.961,"b":0.976,"a":1},"boundVariables":{"color":{"type":"VARIABLE_ALIAS","id":"VariableID:877:407"}}}],
   "strokes":[{"type":"SOLID","color":{"r":0.886,"g":0.910,"b":0.941,"a":1},"boundVariables":{"color":{"type":"VARIABLE_ALIAS","id":"VariableID:877:409"}}}],
   "cornerRadius":9999,
   "spacing":{"paddingRight":12,"paddingLeft":12,"width":72,"height":22},
   "componentProperties":["variant","size"] },
 "codeData": { "...echo of the declared codeSpec (filePath, visual, spacing, typography, tokens, componentAPI, accessibility, metadata)..." }
}
```

**Score: 96/100. Discrepancies: 2 (0 critical, 0 major, 1 minor, 1 info).** Single run; per ADR-0024 do not treat 96 as a property of the component. Note: the tool picked the default variant (`variant=default, size=md`) of the set, so the other nine variants were never compared.

### 2e. Read-only cross-check `figma_get_component_for_development` on variant 55:12 (text child 3:466)

Text style: Instrument Sans, `fontStyle: Medium`, `fontWeight: 500`, size 14, lineHeightPx 17.5 (125%), `letterSpacing: 0`, text style id 915:2345. Frame: paddingLeft/Right 12 (bound to a spacing variable), NO paddingTop/Bottom, height FIXED 22, fills/strokes/radius variable-bound. Confirms the weight finding is real in Figma, and shows letterSpacing 0 vs code 0.01em (not flagged, see 4).

## 3. Anatomy of the parity result

| Field                                                             | Meaning (with the example from this run)                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `summary.parityScore`                                             | 0-100. 96 here. Derived from severity-weighted discrepancies; the repo's own parity-codespec.md gives the southleft rubric `100 - critical*15 - major*8 - minor*3 - info*1` (this run: 100-3-1 = 96, matches) and says "do not store it". Score depends on what you declared and which variant was sampled (ADR-0024).                                                                                                                                   |
| `summary.totalDiscrepancies`, `byCritical/byMajor/byMinor/byInfo` | Counts per severity. 0/0/1/1.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `summary.categories`                                              | Count per category: `typography:1`, `accessibility:1`. Categories seen in the tool's vocabulary map to the codeSpec sections (visual, spacing, typography, tokens, componentAPI, accessibility, metadata). A category with no entry means either aligned OR not declared; the summary cannot tell you which.                                                                                                                                             |
| Severity                                                          | `critical`/`major`: real spec gaps, always "Action Required" per the tool's own instruction. `minor`: real gap if it is a colour/spacing/radius/typography/token value; "Notes" if it is a paradigm difference (className prop, React-only behavioural props). `info`: always "Notes", e.g. missing annotations. Tolerance ~2 px and 0.01 opacity is absorbed (parity-codespec.md).                                                                      |
| `discrepancies[]`                                                 | One entry: `category`, `property`, `severity`, `designValue`, `codeValue`, `message`, optional `suggestion`. E.g. `typography/fontWeight/minor 500 vs 600`. Entry 2 has `designValue:null`: the design side has no data at all (not "different"), so it is an "absent annotation", not a wrong value.                                                                                                                                                    |
| `actionItems[]`                                                   | Machine-readable fix proposals: `discrepancyIndex`, `side` (`code` or `design`), `codeChange{filePath, property, currentValue, targetValue}` or a Figma-side call. `side` follows `canonicalSource` ("design" default: the other side, code, is told to change). Beware: item 2 is mis-built. Its `suggestion` says add a Figma annotation but `side` is `code` with `targetValue:null`, i.e. it proposes removing the role from code. Never auto-apply. |
| `canonicalSource`                                                 | `design` (default) or `code`. Flips which side `actionItems` target. Pass `code` for reverse parity.                                                                                                                                                                                                                                                                                                                                                     |
| `ai_instruction`                                                  | Prompt text for the model: how to format the report (Action Required / Aligned / Notes / Verdict). "Paradigm differences" live here: the tool tells you to put Figma-property-vs-React-composition differences and metadata differences into Notes. No separate field; in this run there were none.                                                                                                                                                      |
| `designData`                                                      | What the tool read from Figma: node type (`COMPONENT_SET`), sampled `defaultVariantName`, bound variable ids, `spacing` (only 12/12 + 72x22), `componentProperties`. Read this to see what was actually compared. Notice there is no paddingTop/Bottom on the design side.                                                                                                                                                                               |
| `codeData`                                                        | Echo of what you declared. Use it to state in the report which sections were passed.                                                                                                                                                                                                                                                                                                                                                                     |
| `enrich`                                                          | Token coverage/enrichment analysis, default true. Produced no extra block in this run (no `enrichment` key returned).                                                                                                                                                                                                                                                                                                                                    |

What the tool did NOT report (compared silently or not at all):

- Matched, so quiet: fills, stroke colour+width, radius, paddingLeft/Right, fontFamily, fontSize, lineHeight, props/values/defaults.
- Not reported although different (see section 4): vertical padding, letterSpacing, metadata description.
- Never compared: the 9 non-sampled variants (success/warning/danger/info strokes etc.), interaction states, dark mode, token _names_ against variables (it got `usedTokens` but flagged nothing).

## 4. Triage of each finding

Classes: (1) fix code, (2) fix Figma, (3) intended mismatch, goes in the contract.

### D1. typography.fontWeight: design 500 vs code 600 (minor)

- Verified real: Figma text is Medium 500 (2e); CSS is `--ui-font-weight-semibold` (600) in `.atl-badge`.
- Already known to the repo: ADR-0107 states it "surfaced three separate findings ... the master's label text is Medium 500 where the code asks semibold 600" (AtlButton). I found no `tasks/todo.md` item for AtlBadge's weight and no `FIGMA_CONFORMANCE_EXCEPTIONS` entry for it (grep of allowlists.js showed none for AtlBadge), so it is un-recorded for the badge.
- Classification: (1) or (2), not (3). The contract has no vocabulary for it: contracts hold only `figmaOnly` / `codeOnly` / `axisMap` / `probes` (AGENTS.md step 2, ADR-0121), which cover API-shape mismatches, not painted values. A painted value that differs is a drift to resolve, or a `FIGMA_CONFORMANCE_EXCEPTIONS` entry with a reason (the parity-codespec.md "durable record" list). Decision owner chooses which side is right; the tool's suggested direction (code to 500) follows only because `canonicalSource` defaults to design. Note ADR-0071 touched AtlBadge weights (`700` icon glyph). Recommended: ask the designer; if 600 is intended (badges are labels), fix Figma text style (2) and rebind to the semibold style; otherwise change `--ui-font-weight-semibold` to the medium token in `atl-badge.css` (1) in all three frameworks (shared CSS in libs/styles, so one edit).

### D2. accessibility.role: code `status`, design null (info)

- Not a value mismatch; Figma has no a11y annotation. Masters carry the a11y note in the description: the AtlBadge master description already says "badges are decorative by default. If they convey state changes ... wrap in role=\"status\"".
- Hmm: code puts `role: 'status'` on EVERY badge host (`host: { role: 'status' }`) while the master says "decorative by default; wrap in role=status when needed". That is a genuine contradiction between master description and code, and the tool only noticed the weaker "no annotation" form. Classification: (1) fix code if the description is the truth (drop the host role, document wrapping) or (2) fix Figma description if the code is the truth. Not (3): contracts cannot express a role. The actionItem's `side:"code"`/`targetValue:null` is therefore dangerously misleading; do not apply it blindly. Also record in the handoff doc.

### Silent findings the tool did not raise (found while verifying; all unreported by the 96 score)

- S1. Vertical padding: I declared `paddingTop/Bottom: 5`; design has none (height FIXED 22, block padding 0). No discrepancy reported, apparently because the design side's 0/absent value is skipped. This is intended: ADR-0107 and `BLOCK_HEIGHT_DERIVED` in `tools/scripts/check-figma.js` (includes AtlBadge): the master states the height and padding-block is exactly 0 there, the code derives it. Class (3)-like but NOT a contract entry: it is a policy encoded in the `check:figma` gate, not in `badge.contract.ts`. Teaching point: declaring a value the design side lacks produces silence, so a clean score can hide a mismatch. Also note computed height: 17.5 + 2*5 + 2 border = 29.5px vs master 22 px; the code's padding literals 0.3125rem and a 1px border do not obviously land on 22 px at 14px/1.25. That deserves a measured check (`check:geometry` measures it); I did not measure it in a browser.
- S2. Letter spacing: code `0.01em` (`--ui-letter-spacing-wide`, 0.14px), Figma 0. Not reported (tolerance ~2px absorbed it, or letterSpacing is not compared). Class (1)/(2) candidate; low value.
- S3. `metadata.description` missing from emit (JSDoc mis-placed above `VARIANT_ICON_NAMES` in atl-badge.ts). Class (1), trivial: move the doc block above `@Component`. The parity tool never saw it. The master description also names `AtlBadgeSpec`; `check:figma` would warn otherwise.
- S4. Other 9 variants unsampled. E.g. in the snapshot, the success/warning/danger/info master strokes are `color/<x>-text` full opacity, while CSS uses `color-mix(in srgb, <x>-text 25%, transparent)`; `gap: 4` (spacing/1) in the master vs CSS icon `margin-right: 0.3em`. These could be real drifts; a single `figma_check_design_parity` call on the set cannot see them. They are the next calls to make (node ids of the variant components).
- S5. Contract file is minimal, so there is nothing in it to justify a mismatch; no `figmaOnly`/`codeOnly`/`axisMap` was needed (variantAxes in the snapshot, `variant` x `size`, match the code props exactly and `check:contracts` reported nothing for AtlBadge).

When would an item go into the contract? Only API-shape mismatches: a Figma axis/value with no code prop (`figmaOnly`, needs a reason or `check:contracts` prints `[FIGMA-ONLY] ... reason is UNEXPLAINED`, as seen for AtlCombobox/AtlInput/AtlSelect), a code prop with no Figma property (`codeOnly`, e.g. AtlButton `type` flagged `[UNMIRRORED]`/`[FW-ONLY]`), or axis renames (`axisMap`). Neither D1 nor D2 qualifies.

## 5. Reverse parity: `figma_post_comment` (described, NOT called)

The tool list contains `figma_post_comment` (plus `figma_get_comments`, `figma_delete_comment`). I did not load its schema or call it. From the name and the parity tool's design: `figma_check_design_parity` accepts `canonicalSource: "code"`, which flips `actionItems` so the _design_ side is told to change; those are Figma-side fixes. The documented route in the tool family for code-as-truth is to post the discrepancies as comments pinned to the Figma node so the designer can act without a Figma write by the agent. Whether repo docs mention this: `grep` for `post_comment|reverse` in the design-to-code skill and references found nothing; I did not check other docs. It writes to the shared Figma file, so it needs explicit owner approval; this run was forbidden from using it.

## 6. Tool errors and caveats (verbatim where applicable)

- No tool errors. `check-contracts.mjs --help` does not print help; it runs the full gate.
- Accessibility HTML was hand-written (`<atl-badge class="atl-badge variant-default size-md" role="status">Default</atl-badge>`), NOT the story `outerHTML` as the recipe prescribes, and omitted the icon child that other variants render. The result `semanticElement:"div"` is therefore an artefact.
- visual/spacing/typography were read from CSS, not measured in a rendered Storybook.
- Only variant=default/size=md of the set was in scope; only Angular named, but styles are shared CSS (libs/styles), so values apply to React/Vue too; componentAPI emitted for Angular only.
- I did not run `check:figma` or `check:parity` for AtlBadge; whether the repo already holds a recorded exception for the weight was only checked by grep (none found in `tools/scripts/lib/allowlists.js`; `tasks/todo.md` grep for badge+weight found nothing).
- Single run; scores vary run to run (ADR-0024).

## 7. Teaching takeaways for A3

1. Declare all seven sections or say which you did not; the score is a property of the declaration (this run: 96 with 7 sections, three of them hand-read).
2. A quiet category is not a pass: S1-S4 were all invisible in the report.
3. Triage rule: value drift -> fix one side (or a conformance exception with a reason); API-shape intent -> contract; design-side absence (`designValue:null`) -> annotation/description, and check `side` in `actionItems` before applying anything.
4. Check `canonicalSource` before reading `actionItems`.
