# Figma Workspace Audit — {file name or library name}

**File:** `{Figma file URL or key}`
**Audited:** {ISO date}
**Generated against:** `{git short SHA in the consuming repo, if applicable}` · Figma file last-edited `{ISO date from figma_get_file_data.lastModified, if available}`
**Mode availability for audit:** {Local + Bridge / Remote SSE only}

> **Audit freshness:** This is a snapshot. Before acting on a finding more than a few hours old, re-verify the underlying state — Figma edits or code commits between audit time and now can have already resolved or shifted findings. The "Generated against" line above is the pin point.

## Overall

> **Architectural verdict:** {one sentence — e.g. "Solid foundation but missing a Semantic layer; dark mode is currently impossible."}

| Severity     | Count |
|--------------|-------|
| Blocker      | {n}   |
| Critical     | {n}   |
| Warning      | {n}   |
| Suggestion   | {n}   |

If the figma-console-mcp Design System Dashboard MCP App was run as part of this audit, include its overall score and category scores here. Use it as the breadth view; this report covers depth.

| Dashboard category   | Score | Notes |
|----------------------|-------|-------|
| Naming               | {/100}| {brief}|
| Tokens               | {/100}| {brief}|
| Components           | {/100}| {brief}|
| Accessibility        | {/100}| {brief}|
| Consistency          | {/100}| {brief}|
| Coverage             | {/100}| {brief}|

## Priority list

Top items to fix, ordered: Blockers first, then Criticals by ascending effort.

| # | Severity   | Finding ID | What                                            | Effort | Fix                                          |
|---|------------|------------|-------------------------------------------------|--------|----------------------------------------------|
| 1 | Blocker    | TA2        | No Semantic tier; dark mode impossible          | L      | Add Semantic collection, alias from existing |
| 2 | Critical   | TA4        | All variables use `ALL_SCOPES`                  | M      | Set scopes per type via `figma_execute`      |
| 3 | Critical   | CD2        | Variant values `Small` mismatch code `sm`       | S      | Rename Variant values to match code         |
| 4 | Critical   | N1         | 8 components named `BTN_*`, code uses `Button`  | S      | Rename components                            |
| ... | ...      | ...        | ...                                             | ...    | ...                                          |

Effort key: **S** = single tool call. **M** = a few coordinated calls. **L** = multi-day refactor.

## Findings by category

### 1 — Token Architecture

#### TA1 — Tier separation
- **State:** {what was found}
- **Severity:** {Blocker / Critical / Warning / Suggestion / Pass}
- **Fix:** {one-line actionable}
- **Effort:** {S/M/L}
- **Verified at:** {ISO timestamp — set when re-verify mode confirms the State is still current; omit on first audit}

#### TA2 — Mode placement
- **State:** ...
- **Severity:** ...
- **Fix:** ...
- **Effort:** ...

#### TA3 — Aliasing
...

#### TA4 — Variable Scopes
...

#### TA5 — Variables vs. Styles coverage
...

### 2 — Component Design

#### CD1 — Variant axis explosion
...

#### CD2 — Variant Property naming vs. code
...

#### CD3 — Show/hide encoded as Variants
...

#### CD4 — Icons modeled as Variants
...

#### CD5 — Composition / atomic structure
...

#### CD6 — Component descriptions
...

### 3 — Naming

#### N1 — Component names match engineering
...

#### N2 — Variable path conventions
...

#### N3 — Slash naming for Variants
...

### 4 — File Structure

#### FS1 — Working designs in the library file
...

#### FS2 — Page organization
...

#### FS3 — Sub-components polluting the asset panel
...

### 5 — Engineering-Sync Readiness

#### ES1 — Token names match codebase
...

#### ES2 — Component prop API matches code
...

#### ES3 — Code Connect / mapping setup
...

#### ES4 — Documentation handoff
...

## What's healthy

A short list of things the workspace gets right. Don't skip this — auditors who only list problems leave the team with no sense of what's working.

- {e.g. "Primitives are well-organized in a dedicated collection."}
- {e.g. "Component naming uses slash hierarchy consistently."}

## Recommended next steps

A short numbered list, in order. Aim for 3–7 items. Group related fixes when they can be tackled together.

1. {Step 1 — typically a Blocker fix or a Critical that unblocks multiple others.}
2. {Step 2}
3. {Step 3}

## Re-verify (optional, generated only after a re-verify pass)

If this audit has been re-verified against current state since the original pass, list the result per finding:

| Finding ID | Status | Current state                                                  | Verified at         |
|------------|--------|----------------------------------------------------------------|---------------------|
| TA4        | auto-resolved | 0 non-BOOLEAN ALL_SCOPES variables remain (was 72)      | {ISO timestamp}     |
| HC         | state-shifted | Inputs section is now `#f2f7ff`; 8 other section titles still hardcoded `#000000` | {ISO timestamp} |
| A11y-OL    | still-open | outline + secondary md loading spinner unchanged           | {ISO timestamp}     |

Drop `auto-resolved` rows from the active priority list. Rewrite the `state-shifted` rows before acting. Treat the timestamp as the new pin point for that finding.

## Notes

Anything the user should know that didn't fit above:

- {e.g. "Dashboard categories scoring below 60 are out of this skill's scope and are addressed by figma-console-mcp's built-in checks."}
- {e.g. "Code Connect is not part of figma-console-mcp; if the team wants it, recommend Figma's official Dev Mode MCP alongside."}
