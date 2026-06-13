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

## Related rationale (do not duplicate — cross-link)

The documents below remain the source for fine detail. The ADRs are the decision *index*: `../big-picture.md` and `../../tasks/rationale.md` in particular hold the full reasoning that the ADRs only summarize — read them when you need the depth behind a decision.

- [`../big-picture.md`](../big-picture.md) — LLM-optimization principles, the React rationale, and LlmChat.
- [`../design-principles.md`](../design-principles.md) — core design principles.
- [`../ai-readiness.md`](../ai-readiness.md) — the AI-readiness layer (metadata, token manifest, behavior manifest).
- [`../../tasks/rationale.md`](../../tasks/rationale.md) — component-level "why" (CDK choices, Toast/Skeleton, cookbook).
- [`../../tasks/lessons.md`](../../tasks/lessons.md) — accumulated correction patterns.
- [`../roadmap.md`](../roadmap.md) — roadmap.
