# Figma Component Pre-Release Checklist

Every component shipped to `libs/{angular,react,vue}` must have a matching, machine-readable representation on the **Components** page of the Atelier UI Figma file (`QMnDD8uZQPldPrlCwZZ58T`). The Figma Console MCP reads directly from this file — the quality of any AI-generated UI built against Atelier is bounded by how well the file conforms to this checklist.

This checklist is enforced manually as a required section of every PR that adds, renames, or substantially refactors a component. There is no automated drift-gate against Figma today; the PR reviewer is the gate. See `plan/ai-readiness.md` § 4 for the rationale.

---

## Checklist

Tick all five items before requesting review on a component-adding PR. If a box does not apply, mark it `n/a` with a one-line reason rather than leaving it blank.

- [ ] **Complete variant matrix** — every variant value declared in `libs/spec/src/metadata/<component>.metadata.ts` (`variantMatrix`) exists as a Figma variant on the master `COMPONENT_SET`. No spec-documented variant is missing from the Figma component.
- [ ] **Descriptions annotated** — the master component's Figma description matches `metadata.purpose` verbatim. Each variant has a one-line description explaining when it applies. (Annotated via the description field in the Inspect panel, not as a text layer.)
- [ ] **Token-linked styles** — no hardcoded colour, spacing, typography, radius, or shadow values. Every style reference resolves through a Figma Variable bound to a `--ui-*` token. The `UI Tokens` collection is the only collection components should bind to directly (semantic layer); avoid direct primitive-token binding inside a component.
- [ ] **Auto layout throughout** — every frame uses Auto Layout, not absolute positioning. This is what lets MCP-driven code generators infer responsive intent. Single-child wrappers count: an icon-only button still has an Auto Layout container.
- [ ] **Name alignment** — the master component's Figma name matches the spec selector exactly (`LlmButton`, not `Button` or `Primary Button`). Variant property names match the spec union names (e.g. `variant`, `size`); variant values match the union string literals (`primary`, not `Primary`). Mismatches break the MCP-to-code mapping.

---

## Inventory page

When the master `COMPONENT_SET` is added or renamed:

- [ ] **Inventory tile present** — one `INSTANCE` of the master lives on the Inventory page. Never duplicate by hand; instance off the master.
- [ ] **TOC count + date bumped** — the table-of-contents block at the top of the Inventory page reflects the new total and the change date.

When a master is removed: the Inventory `INSTANCE` auto-detaches; delete it and bump the TOC.

---

## Where this checklist plugs in

- `.github/PULL_REQUEST_TEMPLATE.md` reproduces this list as a required PR section.
- `plan/ai-readiness.md` § 4 is the strategic rationale.
- `plan/figma.md` is the file-structure reference (pages, variable collections, naming conventions).
- An automated audit (`tools/scripts/gen-figma-report.mjs`) is listed under "Future work" in `plan/ai-readiness.md` but not in scope today.
