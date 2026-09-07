# `codeSpec` for `figma_check_design_parity`

The tool diffs the Figma node against **the sections you declare** and nothing else. A thin
spec comes back clean and proves nothing (ADR-0096). The repo's parity gate exists
because the score was once read as a component property when it is a property of the
declaration and the sampled node (ADR-0024, 2026-08-26 amendment: three runs on one commit
for AtlStepper returned 70, 52 and 83).

## The seven sections

Schema as the architect's `references/code-sync.md` records it:

| Section | Fields | Where the code value comes from |
|---|---|---|
| `visual` | fills, strokes, opacity, radius | component CSS, resolved through `tokens.css` for the mode you sample |
| `spacing` | padding, gap, margins | CSS plus the rendered story — measure; do not trust the stylesheet alone for heights |
| `typography` | font family, size, weight, line-height, letter-spacing | CSS; ADR-0048 (leading stated explicitly), ADR-0035 (Instrument Sans / Serif, JetBrains Mono) |
| `tokens` | expected Variable bindings | the `--ui-*` names the CSS uses, mapped to `Library Tokens` variable names |
| `componentAPI` | prop names and values | the spec block in `libs/spec/src/index.ts` — axis names and values verbatim |
| `accessibility` | roles, labels, contrast minimums | `figma_scan_code_accessibility({ mapToCodeSpec: true })` on the story HTML |
| `metadata` | description text, slash-name shape | the master's description should name the `Atl*Spec` interface (`check:figma` Warning otherwise) |

Declare all seven for a first verification. For a re-verify after a scoped change,
declare the sections the change touched **and** `visual` and `tokens` — the shared token
sheet moves every component (ADR-0104).

## The ceiling of a static read

The tool reads the component tree as it stands; it cannot trigger a pseudo-class. Measured
2026-09-07 on AtlSelect: four of five painted states (`.has-value`, `[aria-expanded]`,
`:hover`, `:focus-visible`) are unreachable to it, so an automated pass validates about a
fifth of what Figma paints (`tasks/todo.md`, "An automated parity pass validates about a
fifth"). For any component with interaction states, follow the parity call with the
architect's `references/code-verify.md` recipe — Storybook plus browser automation, each
state, Light and Dark — and say in the report which states you drove.

## Reading the result

- Tolerance: about 2 px on lengths and 0.01 on opacity absorbs sub-pixel rounding;
  anything larger is a real discrepancy.
- Each discrepancy carries `category`, `property`, `severity`, `designValue`, `codeValue`,
  `suggestion`. Decide per item: fix code, fix master (architect Build/Migrate), or record
  as intentional. "Understood" is the bar for the *report*; for the *record* the bar is
  "fixed or durably recorded" — durable means the handoff document (Build), a
  `FIGMA_CONFORMANCE_EXCEPTIONS` entry with a reason, or an open `tasks/todo.md` decision
  item. A commit message that mentions the gap is not a record; the first eval of this
  skill re-recorded AtlCard over exactly such a gap.
- If you want a number for a report, the southleft rubric is
  `100 − critical×15 − major×8 − minor×3 − info×1`. Do not store it.

## Recording — and what the record cannot say

```
npm run parity:record -- --component <AtlName> [--node <id>]
```

Stores the node id, git sha, timestamp, the snapshot's `figmaLastModified`, and an
`inputsHash` over the component's rendered inputs across **all three frameworks**
(implementation, CSS, story, the shared `tokens.css`; spec files excluded — ADR-0104).
It stores neither the framework you verified in, nor the states you drove, nor the
sections you declared. That is the report's job: a record after an Angular-only,
default-state, three-section run is a legitimate record, and a reader must be able to
tell that from the report beside it. Requires the Desktop Bridge for the verify itself;
`check:parity` is offline.
