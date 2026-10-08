# NotebookLM digest — A10: Figma AI-readiness before handoff (2026-10-08)

Verbatim answer from the NotebookLM notebook "Atelier — Design workflows" (id f153635d-…, 79 web sources,
see memory/reference). Unverified synthesis: numbered citations point into the notebook, several
sources are Reddit threads and vendor blogs. Treat thresholds (e.g. detachment rate) as claims to
check, not facts.

Checking a Figma component for **AI readiness** before handing it off to a coding agent (such as Claude Code, Cursor, or Codex) requires verifying that the component's visual, structural, and metadata layers are represented as deterministic, structured data rather than arbitrary shapes [1, 2].

Here are the concrete, checkable criteria, the tools used to lint or score them, and the recommended pre-handoff workflows grounded in your sources.

---

### 1. Concrete, Checkable "AI Readiness" Criteria

- **Variables & Tokens over Hardcoded Values**:
  - **Criterion**: All fills, strokes, paddings, gaps, font sizes, and border radii must be bound to 3-tier Figma Variables (`Primitives` → `Semantic` → `Component`) [3-5].
  - **Why**: Hardcoded hex values or pixel numbers in Figma cause AI agents to emit inline styles or hardcoded utility classes instead of referencing your codebase's token system [3, 6].
- **Variable Scoping & `codeSyntax.WEB` Setup**:
  - **Explicit Scoping (`scopes`)**: Variables must have explicit property scopes defined rather than relying on Figma's default `ALL_SCOPES` [7]. Unscoped variables clutter property pickers and lead to incorrect token suggestions [7].
  - **`codeSyntax.WEB`**: Every variable must have `codeSyntax.WEB` configured (e.g., `--color-brand-primary` or `brand-primary`) [7]. Without `codeSyntax.WEB`, MCP tools like `get_design_context` return raw internal Figma variable names instead of production CSS/Tailwind tokens, breaking the design-to-code pipeline [7].
- **Layer Naming & Variant Consistency**:
  - **Semantic Layer Names**: All layers must use semantic PascalCase or descriptive path names (e.g., `PricingCard/Header/PlanName` or `CardContainer`) rather than default auto-generated names like `Group 47`, `Frame 427`, or `Rectangle 1` [4, 5, 8, 9].
  - **Identical Layer Names Across Variants**: Text layers and nested instances must keep identical layer names across every variant in a component set [8, 10]. This enables Figma and Code Connect to preserve text and property overrides when swapping variants or instances [8, 10-12].
- **Component & Variable Descriptions**:
  - **Criterion**: Attach short descriptions to main components, variants, variables, and styles [8, 10].
  - **Why**: Descriptions surface as tooltips in Figma and pass into MCP contexts, clarifying intended usage, edge cases, and constraints for the LLM [8, 10, 13].
- **Variant & Property Architecture**:
  - **Component Properties**: Use explicit `Variant`, `Boolean`, `Instance Swap`, and `TEXT` component properties [7, 14].
  - **`TEXT` Properties**: Bind text layers to `TEXT` component properties so label overrides survive component updates and map cleanly to component props in code [7, 15].
  - **`Boolean` Toggles**: Use `Boolean` properties for optional sub-elements (e.g., `hasIcon`) rather than duplicating variant axes, which prevents exponential variant matrix growth [14, 16, 17].
  - **Native Component Slots**: Use native Component Slots (or `getSlot()`) for open-ended child regions instead of creating endless variant permutations for content patterns [14, 18-21].
  - **Shallow Component Nesting**: Keep component nesting shallow (1–2 levels max) [22, 23]. Deeply nested component variants (3+ levels) confuse MCP context extraction [22].
  - **Spec Frames / State Wrappers**: Organize variant sets inside labeled spec wrapper frames displaying states (`Default`, `Hover`, `Pressed`, `Disabled`) [7, 15].
- **100% Auto Layout Coverage**:
  - **Criterion**: Auto Layout must be applied to every frame and sub-layer with explicit flex directions, padding, gap, and Hug/Fill constraints [4, 6, 24].
  - **Why**: Non-Auto Layout frames are interpreted by MCP tools as absolute-positioned coordinates (`top`, `left`), resulting in fragile, non-responsive code [6].
- **Dev Mode Annotations & Resources**:
  - **Criterion**: Use Dev Mode annotations to convey non-visual behavioral intent (e.g., keyboard focus order, ARIA roles, responsive breakpoint behavior) [4, 25].
- **Code Connect Mappings (`.figma.ts` / Code Connect UI)**:
  - **Criterion**: Published components should be linked to codebase exports using Code Connect (`send_code_connect_mappings` or CLI `.figma.ts` files) [26-30].
  - **Why**: Code Connect tells the MCP server (`get_code_connect_suggestions`, `get_design_context`) to reference actual production component paths (e.g., `<Button variant="primary">`) rather than generating raw HTML/Tailwind from scratch [4, 26, 31, 32].

---

### 2. Tools that Score, Audit, or Lint Components

- **Figma Native Built-In Tools**:
  - **Check Designs** (_Figma Schema feature_): Reviews selected sections/frames and flags unassigned raw colors, spacing, or typography values, proposing system variables to fix them [19, 33-35].
  - **Library Analytics / Admin Panel**: Tracks component usage and detachment rates across files [36-39].
  - **Official Figma MCP Server Suite**:
    - `get_design_context`: Returns structured React/Tailwind representations, layer trees, and variable bindings [40-42].
    - `get_variable_defs`: Pulls variables and styles used in a selection [41, 43].
    - `get_code_connect_suggestions` & `send_code_connect_mappings`: Identifies unmapped published components and establishes Code Connect definitions [27, 30, 44].
    - `create_design_system_rules`: Generates project-level rule files (e.g., `CLAUDE.md` or Cursor rules) for coding agents [45].
- **`southleft/figma-console-mcp-skills`**:
  - `figma-lint-design`: Performs WCAG 2.2 and design-system quality linting across a node tree [46].
  - `figma-audit-accessibility`: Generates per-component accessibility scorecards (state coverage, focus states, minimum 44x44px target sizes, color-blindness simulation) [46].
  - `figma-analyze-component-set`: Extracts variant state machines, CSS pseudo-class mappings, and per-variant visual diffs [47].
  - `figma-check-design-parity`: Compares a Figma node against a code spec and outputs a parity score with discrepancies [46].
  - `figma-manage-variables`: Audits and manages variable scopes, `codeSyntax`, and multi-mode definitions [48].
- **Open-Source MCP Skills**:
  - **`generate-design-system` MCP Skill** (_by natdexterra_): An open-source skill for Claude Code/Cursor/Codex that automates auditing existing Figma files [49, 50]. It explicitly audits 5 issues:
    1. Variable scoping (flags variables defaulting to `ALL_SCOPES`) [7].
    2. Missing `codeSyntax.WEB` on variables [7].
    3. Duplicate or orphaned variables [15].
    4. Unbound fills and strokes [7].
    5. Text nodes missing `TEXT` component properties [7].

---

### 3. Recommended Score Thresholds & Hand-off Workflows

To ensure zero friction during handoff ("fix until clean before handoff"), the following **5-phase pre-handoff workflow** is recommended [15]:

1.  **Discovery & Audit Pass**: Run automated audit tools (`figma-lint-design` or `generate-design-system` Phase 1) over component sets to surface unbound fills, missing `codeSyntax.WEB`, `ALL_SCOPES` pollution, and text nodes lacking `TEXT` properties [7, 15].
2.  **Automated Remediation**: Apply `codeSyntax.WEB` to 100% of variables, restrict variable scopes to specific property types, bind all raw fills/strokes to semantic tokens, and attach `TEXT` component properties [7, 15].
3.  **Accessibility & Parity Quality Gate**: Run `figma-audit-accessibility` (WCAG 2.2) and `figma-check-design-parity` until errors reach 0 (100% clean pass) [15, 46].
4.  **Code Connect Mapping**: Run `get_code_connect_suggestions` and map 100% of published components to codebase exports [28, 30, 31].
5.  **The "Swap Test" / Validation Pass**: Toggle variable modes (Light/Dark) across a test page built solely from system components to verify that no contrast breaks or text disappears [15, 51].

#### Recommended Key Thresholds:

- **100% Token Binding (0 Unbound Fills)**: 100% of visual properties (colors, radii, spacing) must be bound to variables before handoff [3, 7, 13, 52].
- **100% `codeSyntax.WEB` Coverage**: 100% of published design tokens must have `codeSyntax.WEB` defined [7].
- **< 20% Component Detachment Rate**: Monitor Figma Library Analytics; a detachment rate above 20% signals missing component states or structural flaws that require fixing before handoff [38, 39].
- **WCAG 2.2 AA Compliance**: Minimum 4.5:1 color contrast ratio and minimum 44x44px touch targets [53, 54].

---

### 4. What the Sources Do Not Cover

- **Classic Third-Party `FigmaLint` Plugin**: While third-party community plugins like _FigmaLint_ are popular in the broader design ecosystem, the provided sources do not detail specific scoring mechanics or API rules for the standalone third-party _FigmaLint_ plugin itself, relying instead on **Figma's native Check Designs** [33, 34] and MCP-based linting skills like **`figma-lint-design`** [46] and **`generate-design-system`** [49, 50].
- **Official Native 0–100 "AI Readiness Score"**: Figma does not officially produce a single, unified numeric "AI Readiness Score" (0–100) inside its core app UI. Instead, "AI readiness" is evaluated through pass/fail criteria (token coverage, Auto Layout usage, `codeSyntax`, Code Connect coverage) and custom parity/accessibility scores provided by MCP audit skills (e.g., `figma-check-design-parity` [46] or `figma-audit-accessibility` scorecards [46]).
