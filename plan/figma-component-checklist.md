# Figma Component Pre-Release Checklist

Every component shipped to `libs/{angular,react,vue}` must have a matching, machine-readable representation on the **Components** page of the Atelier UI Figma file (`QMnDD8uZQPldPrlCwZZ58T`). The Figma Console MCP reads directly from this file — the quality of any AI-generated UI built against Atelier is bounded by how well the file conforms to this checklist.

This checklist is enforced as a required section of every PR that adds, renames, or substantially refactors a component. **As of ADR-0019, the five spec-conformance items below are also covered by an automated gate**, `check:figma` — run it (`npm run check:figma`) instead of ticking those boxes by hand. The Inventory-page items remain manual. See `plan/ai-readiness.md` § 4 and `plan/adr/0019-figma-conformance-gate.md` for the rationale.

### How the automated gate works

The gate is **offline**: `check:figma` reads a committed snapshot (`tools/figma/snapshot.json`) of the Figma masters, not the live file. Refresh the snapshot with `npm run figma:snapshot` (needs Figma Desktop + the figma-console Desktop Bridge connected) whenever the Figma library changes, then commit it. The gate compares the snapshot against `libs/spec`. Known false-positives are allowlisted in `tools/scripts/lib/allowlists.js` (`FIGMA_CONFORMANCE_EXCEPTIONS`).

---

## Checklist

Items 1–5 are **automated** by `check:figma` — the gate is authoritative; the notes record what it does and does not cover. Severity in brackets is what the gate assigns.

- [ ] **Complete variant matrix** — every variant value declared in `libs/spec/src/metadata/<component>.metadata.ts` (`variantMatrix`) exists as a Figma variant on the master `COMPONENT_SET`. No spec-documented variant is missing from the Figma component. — **Automated [Blocker]**. Code-only `variantMatrix` keys (e.g. `role`) that aren't Figma variant axes are ignored.
- [ ] **Descriptions annotated** — the master component's Figma description matches `metadata.purpose`. Each variant has a one-line description explaining when it applies. (Annotated via the description field in the Inspect panel, not as a text layer.) — **Partially automated [Warning]**: the gate checks that the master description is **present and references its spec interface** (e.g. `LlmButtonSpec`); it does not enforce verbatim equality (Figma descriptions are intentionally richer than the one-line purpose) nor per-variant descriptions — those stay a manual review item.
- [ ] **Token-linked styles** — no hardcoded colour, spacing, typography, radius, or shadow values. Every style reference resolves through a Figma Variable bound to a `--ui-*` token. The `UI Tokens` collection is the only collection components should bind to directly (semantic layer); avoid direct primitive-token binding inside a component. — **Automated [Critical]** for raw fills/strokes, raw corner radii, and raw padding/gap; binding to a non-semantic collection is a Warning. Sampled on each master's **default variant** (see snapshot `coverage`).
- [ ] **Auto layout throughout** — every frame uses Auto Layout, not absolute positioning. This is what lets MCP-driven code generators infer responsive intent. Single-child wrappers count: an icon-only button still has an Auto Layout container. — **Automated [Critical]** for any frame *with children* lacking Auto Layout; childless frames (dividers, spacers) are exempt.
- [ ] **Name alignment** — the master component's Figma name matches the spec selector exactly (`LlmButton`, not `Button` or `Primary Button`). Variant property names match the spec union names (e.g. `variant`, `size`); variant values match the union string literals (`primary`, not `Primary`). Mismatches break the MCP-to-code mapping. — **Automated [Blocker]**. The gate compares the **leaf** of a section-prefixed name (`Action/LlmButton` → `LlmButton`) and ignores Figma axes with no spec union (e.g. the interaction `state` axis).

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
- `plan/figma.md` is the file-structure reference (pages, variable collections, naming conventions) and the source of truth for master node IDs that `figma-snapshot.mjs` reads.
- The automated gate is `tools/scripts/check-figma.js` (offline) + `tools/scripts/figma-snapshot.mjs` (refresh); see `plan/adr/0019-figma-conformance-gate.md`. This supersedes the "Future work / `gen-figma-report.mjs`" item noted in `plan/ai-readiness.md` § 4.
