<!-- NotebookLM synthesis answer, notebook f153635d-2589-4922-8fcc-6c171482d1fe, 2026-09-07. Numbers in brackets are NotebookLM citation ids; the map from id to source excerpt follows the answer. Second reader over the web sources in 03–06, not a primary source. -->

### Reviewing a Figma Component Library

A high-quality Figma component library requires systematic quality checks [1]. Reviewing the library involves verifying layer and variable naming, layout behavior, design tokens, responsive states, accessibility compliance, and documentation [2, 3]. These reviews must be divided into **automated checks** (ideal for CI pipelines, scripts, or AI linter runs) and **human evaluation** (requiring designer or developer judgment) [4, 5].

#### Automatable Checks

- **Token Binding Verification**: Auditing the node tree to find unbound fills, strokes, and effects that are visually correct but hardcoded instead of being linked to semantic variables [3, 6].
- **Layer Casing & Hierarchy Linting**: Validating that naming matches taxonomic rules, specifically that slashes (`/`) are used to nest components (e.g., `Button/Primary`) and that variant properties maintain consistent title casing (e.g., `Default` / `Hover` / `Disabled`) to prevent duplicate menu options [7-10].
- **Variable Scoping & Code Syntax**: Scanning Figma Variable collections to ensure color variables do not use default `ALL_SCOPES` (which pollutes property menus) and that they have `codeSyntax.WEB` set so that AI generation pulls correct CSS tokens instead of raw variable names [6].
- **Text Override Continuity**: Verifying that text layer names are 100% identical across variants so that user overrides do not break when swapping component instances [11, 12].
- **Visual Asset Scans**: Programmatically listing all variables, components, styles, and visual specifications into an inventory [13].
- **Automated Color Contrast Testing**: Programmatically calculating color contrast ratios of text layer nodes against background fills to flag WCAG Level AA violations [14-16].

#### Human-Only Evaluated Checks

- **The Detach Test**: Having a designer unfamiliar with the library attempt to build a page using it [17, 18]. If they have to detach any component or instance to make their screen layout work, the component property architecture has failed and must be rebuilt [17-20].
- **The 3-Minute Usability Test**: Testing if a newly onboarded designer can find, place, and fully configure a core component within three minutes [21, 22].
- **Design Intent & Rationale Evaluation**: Auditing the written "Why" behind choices [23-26]. For example, a human must evaluate whether a primary button uses a 44px minimum height to satisfy WCAG touch targets [23, 24], or if using a `Slot` is functionally superior to building combinatorial variants for cards or modal dialogs [7, 27-29].
- **Branch Review Approvals**: For major changes, routing updates through Figma's branch review workflow, requiring explicit manual sign-off from at least two squad members before merging changes into the master trunk file [30-33].

---

### Verifying AI-Generated Code Against Figma

Automated code generation through the Model Context Protocol (MCP) bridges the gap between design file metadata and real code [34-36]. However, establishing visual and behavioral equivalence requires strict verification gates [37, 38].

```
┌─────────────────────────────────────────────────────────────┐
│                 Figma MCP Verification Loop                 │
├─────────────────────────────────────────────────────────────┤
│ 1. get_design_context ───► Extract layout properties,       │
│                            Auto Layout constraints, tokens   │
│                                  │                          │
│ 2. get_screenshot     ───► Capture baseline visual          │
│                            reference (Source of Truth)      │
│                                  │                          │
│ 3. Code Implementation───► Map tokens to project utilities │
│                            and reuse existing components    │
│                                  │                          │
│ 4. Visual Validation  ───► Compare running DOM overlay      │
│                            against baseline screenshot      │
└─────────────────────────────────────────────────────────────┘
```

#### Design Parity: Screenshots vs. DOM Measurements

- **Structured Context (`get_design_context`)**: AI agents should never generate code based purely on screenshots [39, 40]. Screenshots are static and do not contain nested structural metadata [35, 40]. The code generator must first pull structured JSON data from the Figma scenegraph—this contains the exact parent-child layout hierarchy, typography values, Auto Layout rules, and variant properties [40-42].
- **Visual Baseline (`get_screenshot`)**: The screenshot is captured to serve as the visual baseline [43]. While DOM measurements can verify flex alignment and font size, a screenshot overlay comparison is necessary to catch subtle shifts in rendering engines, layout weights, and empty/loading states [44, 45].

#### Token Usage & Variant Coverage

- **Mapping to Existing Themes**: Generated code must map color, typography, border-radius, and spacing tokens to the project's existing system (e.g., swapping Tailwind utility classes for CSS custom properties like `--color-brand-primary` rather than hardcoding hex codes) [37, 38, 46-49].
- **Code Connect Overrides**: Instead of reinventing custom button elements, the code should reuse existing design system components [37, 38, 46, 47, 49]. By utilizing **Code Connect** (either through the CLI or UI), Figma variants can map directly to React/Vue component props (e.g., Figma `Variant=Primary, Size=Medium` triggers `<Button variant="primary" size="md" />` automatically) [17, 18, 50-53].

#### Typical Failure Modes

1.  **Implicit Responsive Gaps**: Figma MCP reads design files at a fixed layout width [54]. The AI does not inherently know how a design scales from a 1440px desktop to a 375px mobile breakpoint unless separate responsive frames are provided, resulting in broken flex wrap behaviors [54].
2.  **Animation Spec Blindness**: Figma prototyping transitions (smart animate, springs, easing curves) are not fully exposed through MCP [55]. AI-generated components will render the correct end state but have "guessed" or missing micro-interactions [55].
3.  **Combinatorial Nesting Collapse**: When a component is deeply nested (e.g., three levels of parent-child overrides), the context extraction can confuse parameter values, causing the AI to generate incorrect property states [55, 56].
4.  **Heavy Selection Truncation**: When a developer selects a massive page container instead of a logical component chunk, the MCP server output truncates or errors due to context limit fatigue [57-59].

---

### Keeping Figma and Code in Sync (Preventing Drift)

Design system drift is a constant threat [60-62]. Teams preserve sync through structured developer-designer governance and automated pipeline tooling [48, 63, 64].

- **Design-Code Dual Governance (RACI)**: Establish a shared responsibility matrix [63, 64]. A single contribution process defines how new variants are proposed, who approves changes, and how breaking modifications are handled [63-66].
- **Changesets & Semantic Versioning**: Code system updates should be managed using Changesets in a monorepo setup, with automated CI tools (like GitHub Actions) publishing releases to npm registries [67, 68].
- **REST API Diffs & Automated Changelogs**: Utilizing automated terminal-capable skills (such as `figma-version-history` and `figma-generate-changelog`), teams can diff published design file versions and generate human-readable Markdown changelogs during merge requests [14, 69, 70].
- **Token Pipeline Automation (Style Dictionary)**: Never hand-edit tokens in code [71, 72]. Use Style Dictionary (v5.5+) to read a JSON-based token export directly from Tokens Studio or Token Variables and compile platform-specific CSS properties, Swift structs, and Tailwind configs [48, 73].
- **Documentation as a Definition of Done**: Enforce a strict merge block—a code component is not considered "shipped" until its corresponding Figma design and Markdown documentation pages are published and updated [74, 75].
- **Continuous Figma Auditing**:
  - _Check Designs_: Running Figma's native linting linter to flag hardcoded spacing, typography size, or color values and correct them to the published variable set [76-79].
  - _Detachment Rate Metrics_: Monitoring the Figma admin panel's analytics to track component detachment rates [80-85]. High detachment rates flag where code and designs have mismatched APIs or missing functional use cases [80, 81, 84, 85].

---

### Component Library Review Checklist

Use this checklist during component creation, branch reviews, and PR merges [1].

| Item ID   | Check Category              | Severity Level | Verification Criteria                                                                                                                                                             | Supported Sources                   |
| :-------- | :-------------------------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **CL-01** | **A11y Color Contrast**     | **Critical**   | Verify color contrast ratio is \\(\ge\\) 4.5:1 for normal text and \\(\ge\\) 3:1 for large text across light and dark modes [86, 87].                                             | [23], [24], [86], [15], [87]        |
| **CL-02** | **A11y Touch Target**       | **Critical**   | Interactive elements (buttons, inputs) must maintain a minimum touch target size of 44x44px or at least a 44px layout height [23, 24, 86].                                        | [88], [23], [89], [24], [86]        |
| **CL-03** | **Auto Layout Binding**     | **Critical**   | Component frames must utilize Auto Layout instead of fixed coordinates to communicate responsive constraints and sizing rules [53, 90, 91].                                       | [92], [93], [90], [53], [91]        |
| **CL-04** | **Unbound Styles**          | **Critical**   | Audit all fills, strokes, and border-radii nodes; absolutely zero raw/hardcoded values are permitted [94, 95]. Every property must bind to a published Variable [91].             | [94], [95], [91], [6]               |
| **CL-05** | **Token Architecture**      | **High**       | Maintain clear division of 3-tier variables: Primitives must map to Semantic tokens; raw primitives must be hidden from team publishing [96-98].                                  | [96], [99], [3], [97], [98]         |
| **CL-06** | **Layer & Node Naming**     | **High**       | All layers must be named semantically (e.g., `CardContainer`, not `Group 47`) and match component export names exactly [17, 18, 53, 90].                                          | [90], [53], [17], [18], [100], [99] |
| **CL-07** | **Variable Code Syntax**    | **High**       | Color/spacing variables must have `codeSyntax.WEB` set so that `get_design_context` extracts clean tokens rather than raw values [6].                                             | [6]                                 |
| **CL-08** | **Document Completeness**   | **High**       | A component cannot be published to the main library without containing clear guidelines: purpose, when to use, when NOT to use, state previews, and accessibility notes [88, 89]. | [88], [74], [89], [75], [101]       |
| **CL-09** | **Variable menu scoping**   | **Medium**     | Ensure variable scoping is explicitly set (e.g., limiting colors to `fills` or `strokes` only) to keep UI pickers uncluttered [6].                                                | [6]                                 |
| **CL-10** | **Preserve Text Overrides** | **Medium**     | Confirm that nested text layer names match identically across all variants to avoid breaking user edits during variant swaps [11, 12].                                            | [11], [12]                          |
| **CL-11** | **Combinatorial Explosion** | **Medium**     | Review components with multiple option layouts. Optional elements must use **Booleans** or **Slots** instead of creating separate variants [27, 28].                              | [27], [102], [28], [103], [104]     |
| **CL-12** | **Component Descriptions**  | **Low**        | Provide descriptive comments/tooltips on components and variables to optimize local search and enhance AI prompt responses [11, 12].                                              | [11], [12], [101]                   |

---

🚲 **Next Step Suggestion**: Would you like me to generate a complete custom rules document (such as a `CLAUDE.md` or design-review instruction set) for your team, containing the exact JSON/YAML format to feed these verification checklists directly into Claude Code?

## Citation map

- 1: a152df90-7d42-4fae-93ae-6e95c203e677
- 2: aad15693-f896-43be-a715-e6cbd9da0d9a
- 3: 46169426-5ac7-4d9f-a833-39d6b753038c
- 4: 616768c5-b050-4787-919c-80ac1b65e3d0
- 5: 0d3c190c-2b36-4997-b93c-b2991e844f38
- 6: 46169426-5ac7-4d9f-a833-39d6b753038c
- 7: 395b468b-921a-430f-9be9-32e83c320e1e
- 8: 395b468b-921a-430f-9be9-32e83c320e1e
- 9: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 10: c3cab5fd-179d-45ed-8094-7141bf3729b7
- 11: 616768c5-b050-4787-919c-80ac1b65e3d0
- 12: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 13: 0d3c190c-2b36-4997-b93c-b2991e844f38
- 14: 0d3c190c-2b36-4997-b93c-b2991e844f38
- 15: 9481dc57-6d6b-46ee-b991-cce5effb90ab
- 16: 9481dc57-6d6b-46ee-b991-cce5effb90ab
- 17: aad15693-f896-43be-a715-e6cbd9da0d9a
- 18: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 19: 395b468b-921a-430f-9be9-32e83c320e1e
- 20: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 21: aad15693-f896-43be-a715-e6cbd9da0d9a
- 22: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 23: 16accd14-bed4-4528-8b5b-d17bc801695a
- 24: da28bca7-bd52-4fb5-b737-50b9f4600c8e
- 25: 616768c5-b050-4787-919c-80ac1b65e3d0
- 26: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 27: 395b468b-921a-430f-9be9-32e83c320e1e
- 28: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 29: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 30: 616768c5-b050-4787-919c-80ac1b65e3d0
- 31: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 32: a152df90-7d42-4fae-93ae-6e95c203e677
- 33: 9baa5f11-0f3d-4d13-8041-a1ce736e7faf
- 34: 6b317680-74ea-4f29-8e8d-1c4df8e7a40a
- 35: b827dbae-b482-42a4-bdf4-49f83921f6df
- 36: d4a024fb-2ee0-413d-808a-9a0084544c17
- 37: b09cd998-4bdd-4aef-920f-4672c58fca55
- 38: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 39: 1e5bcfd9-6657-4ac7-872d-bedd639ab251
- 40: d4a024fb-2ee0-413d-808a-9a0084544c17
- 41: 1e5bcfd9-6657-4ac7-872d-bedd639ab251
- 42: d4a024fb-2ee0-413d-808a-9a0084544c17
- 43: 1e5bcfd9-6657-4ac7-872d-bedd639ab251
- 44: b827dbae-b482-42a4-bdf4-49f83921f6df
- 45: b827dbae-b482-42a4-bdf4-49f83921f6df
- 46: 1e5bcfd9-6657-4ac7-872d-bedd639ab251
- 47: a16ac033-a921-4367-b81a-6be78bd6e04f
- 48: d5b32c5b-a623-4058-9462-27dc4f69dfa4
- 49: eba2d1c9-abd3-46d0-a0ae-757fab424b40
- 50: d5952221-6631-4aea-a0b0-5a7a5b0472eb
- 51: 3acbf257-2cf2-4291-a09c-0d811df5fd08
- 52: 78bb646e-1723-46f5-9c64-27c09131dc81
- 53: a16ac033-a921-4367-b81a-6be78bd6e04f
- 54: d4a024fb-2ee0-413d-808a-9a0084544c17
- 55: d4a024fb-2ee0-413d-808a-9a0084544c17
- 56: d4a024fb-2ee0-413d-808a-9a0084544c17
- 57: b827dbae-b482-42a4-bdf4-49f83921f6df
- 58: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 59: a16ac033-a921-4367-b81a-6be78bd6e04f
- 60: 395b468b-921a-430f-9be9-32e83c320e1e
- 61: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 62: 6f63c6ff-1478-4e6b-9bee-c584aa85347c
- 63: 616768c5-b050-4787-919c-80ac1b65e3d0
- 64: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 65: 616768c5-b050-4787-919c-80ac1b65e3d0
- 66: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 67: 7d5e86ba-ce4d-438c-9a69-11cfb87bd894
- 68: d42d8ba4-98fb-4cad-ad18-77cc02a63e90
- 69: 7d5e86ba-ce4d-438c-9a69-11cfb87bd894
- 70: d42d8ba4-98fb-4cad-ad18-77cc02a63e90
- 71: 16accd14-bed4-4528-8b5b-d17bc801695a
- 72: da28bca7-bd52-4fb5-b737-50b9f4600c8e
- 73: 290f6523-4222-43fd-b05b-cadc5f489c86
- 74: 16accd14-bed4-4528-8b5b-d17bc801695a
- 75: da28bca7-bd52-4fb5-b737-50b9f4600c8e
- 76: 616768c5-b050-4787-919c-80ac1b65e3d0
- 77: 616768c5-b050-4787-919c-80ac1b65e3d0
- 78: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 79: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 80: 616768c5-b050-4787-919c-80ac1b65e3d0
- 81: 37b6a46b-7dc1-42a7-bb18-1bcafe9ed454
- 82: d5b32c5b-a623-4058-9462-27dc4f69dfa4
- 83: 290f6523-4222-43fd-b05b-cadc5f489c86
- 84: aad15693-f896-43be-a715-e6cbd9da0d9a
- 85: e75b9182-0819-4f61-b3f1-bb71e79e86e6
- 86: 9481dc57-6d6b-46ee-b991-cce5effb90ab
- 87: 994e1ae2-a545-4512-881a-be7aac4e978b
- 88: 16accd14-bed4-4528-8b5b-d17bc801695a
- 89: da28bca7-bd52-4fb5-b737-50b9f4600c8e
- 90: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 91: d4a024fb-2ee0-413d-808a-9a0084544c17
- 92: 395b468b-921a-430f-9be9-32e83c320e1e
- 93: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 94: b09cd998-4bdd-4aef-920f-4672c58fca55
- 95: 0ec8a8c7-c5f0-4e6c-a3a8-adb8da4e15fd
- 96: aad15693-f896-43be-a715-e6cbd9da0d9a
- 97: 58d418c0-161b-43d0-bc11-4a01bc37836f
- 98: 11f57b51-c733-4a17-9080-4322f3010bf2
- 99: 46169426-5ac7-4d9f-a833-39d6b753038c
- 100: d4a024fb-2ee0-413d-808a-9a0084544c17
- 101: d5b32c5b-a623-4058-9462-27dc4f69dfa4
- 102: 395b468b-921a-430f-9be9-32e83c320e1e
- 103: c64d2806-edf9-4632-a1b8-5168ad5fd21c
- 104: c64d2806-edf9-4632-a1b8-5168ad5fd21c
