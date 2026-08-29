# Architecture Decision Records

Each record uses MADR-style YAML frontmatter, so its `status`, `sources` (and `confidence`, on the reconstructed 0001–0016) are machine-readable.

**0001–0016 are RECONSTRUCTED** — written after the fact from the repo, commit history, and session notes, not recorded when each decision was made; each carries a per-record **Confidence** marker (*Documented* = quoted from existing repo text, *Reconstructed* = inferred from commits/code/session). **From 0017 onward, ADRs are recorded at decision time** per the `CLAUDE.md` § Decision Records convention — those are contemporaneous and carry no `confidence` field (shown as *Recorded* below).

| ADR # | Title | Status | Confidence |
|---|---|---|---|
| [0001](0001-llm-optimized-api-surface.md) | LLM-optimized API surface | Accepted | Documented |
| [0002](0002-signals-only-reactivity-signal-forms.md) | Signals-only reactivity + Signal Forms | Accepted | Documented |
| [0003](0003-composition-over-configuration.md) | Composition over configuration | Accepted | Documented |
| [0004](0004-css-custom-property-design-tokens.md) | CSS custom-property design tokens | Accepted | Documented |
| [0005](0005-three-frameworks-hand-written-no-codegen.md) | Three frameworks, hand-written, no codegen | Accepted | Documented |
| [0006](0006-framework-agnostic-spec-source-of-truth.md) | Framework-agnostic spec as source of truth | Accepted | Reconstructed |
| [0007](0007-cdk-where-complex-manual-where-simple.md) | CDK where complex, manual where simple | Accepted | Documented |
| [0008](0008-toast-imperative-skeleton-pure-css.md) | Toast = imperative service/hook; Skeleton = pure CSS | Accepted | Documented |
| [0009](0009-drift-gate-system.md) | Drift-gate system (one source → projection → --check) | Accepted | Reconstructed |
| [0010](0010-ai-readiness-layer.md) | AI-readiness layer (metadata + token manifest + behavior manifest) | Accepted | Documented |
| [0011](0011-typed-covers-behavior-gate.md) | Typed covers() behavior gate replaces @behavior comment marker | Accepted | Documented |
| [0012](0012-composition-cookbook.md) | Composition cookbook (6 canonical patterns) | Accepted | Documented |
| [0013](0013-ai-discovery-surfaces.md) | AI-discovery surfaces (llms.txt + hosted Storybook MCP + manifests) | Accepted | Reconstructed |
| [0014](0014-workshop-single-framework.md) | Workshop covers ONE framework; the 3-framework rig is prep infra | Accepted | Documented |
| [0015](0015-docs-astro-diataxis-design-to-code.md) | Docs: Astro + Diátaxis + single Design-to-Code narrative | Accepted | Reconstructed |
| [0016](0016-release-nx-release-not-for-production.md) | Release: nx release, 0.0.x not-for-production, automation-token publish + publish-only recovery | Accepted | Reconstructed |
| [0017](0017-record-adr-for-every-decision.md) | Record an ADR for every non-trivial decision | Accepted | Recorded |
| [0018](0018-figma-token-tiering-and-css-projection.md) | Figma token tiering (Primitive→UI→Component) + UI-only CSS projection | Accepted | Recorded |
| [0019](0019-figma-conformance-gate.md) | Figma conformance gate (`check:figma`) via committed snapshot + offline check | Accepted | Recorded |
| [0020](0020-personal-authorial-signature.md) | Personal authorial signature (serif-italic heading accent + shared motion grammar) | Accepted | Recorded |
| [0021](0021-build-time-derived-docs-counts.md) | Docs counts/sizes derived at build time where the source is local | Accepted | Recorded |
| [0022](0022-checkbox-toggle-omit-value.md) | Checkbox/Toggle omit the inherited `value`/`onValueChange` | Accepted | Recorded |
| [0023](0023-version-band-0-1-x.md) | Version band moves to 0.1.x (revises ADR-0016's 0.0.x signal) | Accepted | Recorded |
| [0024](0024-design-parity-persistence-gate.md) | Design-parity persistence gate (`check:parity`) | Accepted | Recorded |
| [0025](0025-cross-framework-a11y-conformance.md) | Cross-framework accessibility conformance gate (`check:a11y-parity`) | Accepted | Recorded |
| [0026](0026-ship-css-and-tokens-in-packages.md) | Ship component CSS + `styles/tokens.css` inside the npm packages | Accepted | Recorded |
| [0027](0027-angular-22-nx-23-upgrade.md) | Upgrade Angular to 22 and Nx to 23 | Accepted | Recorded |
| [0028](0028-host-encapsulation-css-fix.md) | Fix the host-encapsulation CSS bug across 19 more Angular components | Accepted | Recorded |
| [0029](0029-atl-naming-convention.md) | Rename component naming prefix from `Llm` to `Atl` | Accepted | Recorded |
| [0030](0030-library-tokens-collection.md) | Library Tokens: a code-generated semantic tier in Figma | Accepted | Recorded |
| [0031](0031-single-source-component-maps.md) | Single-source component maps in the metadata registry | Accepted | Recorded |
| [0032](0032-claude-design-as-parallel-track.md) | Claude Design as a parallel track, not a replacement for Figma | Accepted | Recorded |
| [0033](0033-gate-publish-on-full-check-suite.md) | Gate npm publish on the full check suite | Accepted | Recorded |
| [0034](0034-what-a-green-check-all-asserts.md) | What a green `check:all` asserts: promoted gates, derived rosters (revises 0019 §5, 0024 §4) | Accepted | Recorded |
| [0035](0035-typography-instrument-pair.md) | Typography: Instrument Sans + Instrument Serif + JetBrains Mono (revises 0020's Inter choice) | Accepted | Recorded |
| [0036](0036-type-roles-not-axes.md) | Type roles, not a size ladder (`--ui-type-*`) | Accepted | Recorded |
| [0037](0037-contrast-gate-reads-the-token-source.md) | The contrast gate reads the token source (`check:contrast`) | Accepted | Recorded |
| [0038](0038-tonal-ramps-with-checked-annotations.md) | Tonal ramps with checked annotations (teal; primitive tier in CSS) | Accepted | Recorded |
| [0039](0039-primitive-tier-gate.md) | A gate for the primitive tier (`check:primitives`) | Accepted | Recorded |
| [0040](0040-design-status-is-derived.md) | Design status is derived, and a fragment is not coverage | Accepted | Recorded |
| [0041](0041-control-height-is-the-primitive.md) | The control height is the primitive; padding is derived | Accepted | Recorded |
| [0042](0042-a-gate-that-measures-rendered-geometry.md) | A gate that measures rendered geometry (`check:geometry`) | Accepted | Recorded |
| [0043](0043-the-geometry-contract-ships-with-the-component.md) | The geometry contract ships with the component (`check:box-sizing`) | Accepted | Recorded |
| [0044](0044-parity-drift-during-the-redesign-phase.md) | Parity drift is a warning during the redesign phase | Accepted | Recorded |
| [0045](0045-readonly-only-where-it-is-enforced.md) | `readonly` lives only where it is enforced | Accepted | Recorded |
| [0046](0046-one-concept-one-drawing.md) | One concept, one drawing (`check:iconography`) | Accepted | Recorded |
| [0047](0047-bind-the-literals-that-duplicate-a-token.md) | Bind the literals that duplicate a token (`check:token-bypass`) | Accepted | Recorded |
| [0048](0048-a-stated-height-cannot-be-content-driven.md) | A stated height cannot be content-driven | Accepted | Recorded |
| [0049](0049-every-component-states-its-typeface.md) | Every component states its typeface (`check:typeface`) | Accepted | Recorded |
| [0050](0050-a-glyph-in-a-string-map-is-still-an-icon.md) | A glyph in a string map is still an icon | Accepted | Recorded |
| [0051](0051-a-reset-undoes-the-contract.md) | A reset undoes the contract (`[RESET-WIPED]`) | Accepted | Recorded |
| [0052](0052-the-row-is-the-second-ladder.md) | The row is the second ladder, and it centres rather than pads | Accepted | Recorded |
| [0053](0053-a-peer-npm-installs-for-you.md) | A required peer is a version npm picks for you | Accepted | Recorded |
| [0054](0054-the-last-values-a-variable-could-not-bind.md) | The last values a Figma Variable could not bind (status ramps + 2xs) | Accepted | Recorded |
| [0055](0055-invalid-is-not-a-colour.md) | invalid is not a colour, and a glyph in a template is still an icon (`[TEXT-GLYPH]`) | Accepted | Recorded |
| [0056](0056-a-master-models-one-thing.md) | A master models one thing, and its axes are its API | Accepted | Recorded |
| [0057](0057-the-icon-set-was-text-in-figma-too.md) | The icon set was text in Figma too | Accepted | Recorded |
| [0058](0058-the-master-facts-nothing-was-reading.md) | The master facts nothing was reading (`[BOOL-INERT]`, `[MASTER-GLYPH]`) | Accepted | Recorded |
| [0059](0059-the-file-was-in-the-wrong-typeface.md) | The file was in the wrong typeface (`[FONT-FAMILY]`, `[TEXT-STYLE]`) | Accepted | Recorded |
| [0060](0060-bound-is-not-the-same-as-bound-correctly.md) | Bound is not the same as bound correctly (`[ROOT-PAINT]`) | Accepted | Recorded |
| [0061](0061-what-a-property-turns-on-must-be-checked-while-it-is-off.md) | What a property turns on has to be checked while it is off (`[OVERLAY]`, `[BOOL-UNSPECED]`) | Accepted | Recorded |
| [0062](0062-a-part-promoted-to-a-master-becomes-checkable.md) | A part promoted to a master becomes checkable (ten child masters) | Accepted | Recorded |
| [0063](0063-the-layer-name-is-the-selector.md) | The layer name is the selector (`[LAYER-PAINT]`) | Accepted | Recorded |
| [0064](0064-what-the-parity-stamp-rests-on.md) | What the parity stamp rests on (redesign phase closed) | Accepted | Recorded |
| [0065](0065-the-table-gives-its-children-back-their-states.md) | The table gives its children back their states (AtlTh/AtlTd/AtlTr/AtlTbody) | Accepted | Recorded |
| [0066](0066-a-warning-nobody-can-clear.md) | A warning nobody can clear (`[MAP]` classifies) | Accepted | Recorded |
| [0067](0067-a-text-property-is-api.md) | A text property is API (`[TEXT-UNSPECED]`) | Accepted | Recorded |
| [0068](0068-a-parent-can-only-instantiate-what-the-child-can-express.md) | A parent can only instantiate what the child can express (`[STALE-EXEMPTION]`) | Accepted | Recorded |
| [0069](0069-the-illustration-beside-the-master.md) | The illustration beside the master (`[PAGE-GLYPH]`) | Accepted | Recorded |
| [0070](0070-the-catalogue-is-generated.md) | The catalogue is generated (`figma:sync-inventory`) | Accepted | Recorded |
| [0071](0071-the-literals-the-scale-already-named.md) | The literals the scale already named (`font-weight` in the bypass gate) | Accepted | Recorded |
| [0072](0072-the-third-surface.md) | The third surface (`check:artboard-palette`) | Accepted | Recorded |
| [0073](0073-a-role-is-for-prose-not-for-a-derived-box.md) | A role is for prose, not for a derived box (`[FONT-AFTER]`, `lib/type-roles.js`) | Accepted | Recorded |
| [0074](0074-two-roles-the-eight-did-not-span.md) | Two roles the eight did not span (`--ui-type-control`, `--ui-type-action`; 231 nodes bound) | Accepted | Recorded |
| [0075](0075-the-direction-nothing-checked.md) | The direction nothing checked (`[UNDECLARED]`, `[SET-CLIPS]`) | Accepted | Recorded |
| [0076](0076-the-padding-nobody-compared.md) | The padding nobody compared (`[ROOT-BOX]`; bindable vs derived) | Accepted | Recorded |
| [0077](0077-an-unresolved-layer-is-an-unchecked-layer.md) | An unresolved layer is an unchecked layer (mechanical selector shapes + state-class cascade) | Accepted | Recorded |
| [0078](0078-a-count-you-can-only-ratchet-down.md) | A count you can only ratchet down (`[NO-SIZE]`, `lib/component-roots.js`, `--update-baseline`) | Accepted | Recorded |
| [0079](0079-type-does-not-need-the-painted-box.md) | Type does not need the painted box (`ROOT_TYPE`, `[TEXT-UNSTYLED]`, `tools/figma/type-baseline.json`) | Accepted | Recorded |
| [0080](0080-a-guard-that-skips-is-not-a-check.md) | A guard that skips is not a check (ratchets record findings, not counts; amends 0078/0079) | Accepted | Recorded |
| [0081](0081-a-class-the-css-paints-and-no-template-emits.md) | A class the CSS paints and no template emits (`check:dead-selectors`, `DEAD_SELECTOR_EXEMPT`) | Accepted | Recorded |
| [0082](0082-a-blocker-the-chain-cannot-clear.md) | A blocker the chain that runs it cannot clear (`check:parity --report`; amends 0024) | Accepted | Recorded |
| [0083](0083-the-manifest-the-framework-cannot-emit.md) | The manifest the framework cannot emit (hosted Angular/Vue MCP serve React's components manifest as the cross-framework reference) | Accepted | Recorded |
| [0084](0084-two-environments-one-canonical-per-audience.md) | Two environments, one canonical per audience (clone for the two-day cohort, scaffold for the self-serve reader; both documented, branched per page) | Accepted | Recorded |

## Related rationale (do not duplicate — cross-link)

The documents below remain the source for fine detail. The ADRs are the decision *index*: `../big-picture.md` and `../../tasks/rationale.md` in particular hold the full reasoning that the ADRs only summarize — read them when you need the depth behind a decision.

- [`../big-picture.md`](../big-picture.md) — LLM-optimization principles, the React rationale, and LlmChat.
- [`../design-principles.md`](../design-principles.md) — core design principles.
- [`../ai-readiness.md`](../ai-readiness.md) — the AI-readiness layer (metadata, token manifest, behavior manifest).
- [`../../tasks/rationale.md`](../../tasks/rationale.md) — component-level "why" (CDK choices, Toast/Skeleton, cookbook).
- [`../../tasks/lessons.md`](../../tasks/lessons.md) — accumulated correction patterns.
- [`../roadmap.md`](../roadmap.md) — roadmap.
