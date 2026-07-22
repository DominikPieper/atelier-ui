## 0.2.5 (2026-07-22)

### 🚀 Features

- **a11y:** gate 6 more components; capture native form states in the normalizer ([6282b4f](https://github.com/DominikPieper/atelier-ui/commit/6282b4f))

### ❤️ Thank You

- Dominik Pieper @DominikPieper

## 0.2.4 (2026-07-22)

### 🩹 Fixes

- **angular:** require Angular 22 peers — the library is built with v22 ([dc2e6cf](https://github.com/DominikPieper/atelier-ui/commit/dc2e6cf))

### ❤️ Thank You

- Dominik Pieper @DominikPieper

## 0.2.3 (2026-07-22)

### 🚀 Features

- **a11y:** extend cross-framework a11y-parity gate to Dialog, Menu, Tabs, Alert ([4e6c297](https://github.com/DominikPieper/atelier-ui/commit/4e6c297))

### ❤️ Thank You

- Dominik Pieper @DominikPieper

## 0.2.2 (2026-07-22)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.2.1 (2026-07-21)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.2.0 (2026-07-21)

### 🚀 Features

- ⚠️  **docs:** rename Llm prefix to Atl across docs, generated artifacts, and tooling docs ([965787d](https://github.com/DominikPieper/atelier-ui/commit/965787d))
- ⚠️  **angular:** rename Llm prefix to Atl across the Angular library ([24eb25a](https://github.com/DominikPieper/atelier-ui/commit/24eb25a))
- ⚠️  **spec:** rename Llm prefix to Atl in spec contract ([6860cc4](https://github.com/DominikPieper/atelier-ui/commit/6860cc4))

### ⚠️  Breaking Changes

- **docs:** rename Llm prefix to Atl across docs, generated artifacts, and tooling docs  ([965787d](https://github.com/DominikPieper/atelier-ui/commit/965787d))
- **angular:** rename Llm prefix to Atl across the Angular library  ([24eb25a](https://github.com/DominikPieper/atelier-ui/commit/24eb25a))
  every Angular component selector, class, injection
  token, CSS class/custom-property, and file name renamed llm-/Llm/LLM_
  -> atl-/Atl/ATL_ (ADR-0029). Updates the eslint selector-prefix rule
  and the lib's Nx "prefix" to match. a11y-parity snapshot renamed too
  (tools/parity/a11y/llm-button.*.json -> atl-button.*.json) since its
  content has no cross-framework dependency — no need to wait for the
  other two frameworks. nx lint/test/build angular all green (528/528).
- **spec:** rename Llm prefix to Atl in spec contract  ([6860cc4](https://github.com/DominikPieper/atelier-ui/commit/6860cc4))
  every exported spec type/interface renamed
  Llm* -> Atl* (ADR-0029). Framework libs will fail to typecheck
  until each is renamed in turn (next commits) — expected mid-migration.

### ❤️ Thank You

- Dominik Pieper @DominikPieper

## 0.1.12 (2026-07-21)

### 🩹 Fixes

- **angular:** repair dead CSS across 19 components (host-encapsulation bug) ([3c2e3b9](https://github.com/DominikPieper/atelier-ui/commit/3c2e3b9))

### ❤️ Thank You

- Claude Sonnet 5
- Dominik Pieper @DominikPieper

## 0.1.11 (2026-07-10)

### 🩹 Fixes

- **build:** ship component CSS + tokens.css in packages ([10d19ad](https://github.com/DominikPieper/atelier-ui/commit/10d19ad))
- **tokens:** dark-mode on-success fg + light-theme symmetry ([#4](https://github.com/DominikPieper/atelier-ui/issues/4), [#0](https://github.com/DominikPieper/atelier-ui/issues/0))

### ❤️ Thank You

- Claude Fable 5
- Dominik Pieper @DominikPieper

## 0.1.10 (2026-07-06)

### 🚀 Features

- **a11y:** cross-framework a11y-tree conformance gate (ADR-0025) ([ebf980d](https://github.com/DominikPieper/atelier-ui/commit/ebf980d))

### ❤️ Thank You

- Claude Fable 5
- Dominik Pieper @DominikPieper

## 0.1.9 (2026-06-12)

### 🩹 Fixes

- **ui:** scope dialog size-* selectors to dialog/panel ([247a58a](https://github.com/DominikPieper/atelier-ui/commit/247a58a))

### ❤️ Thank You

- Claude Fable 5
- Dominik Pieper @DominikPieper

## 0.1.8 (2026-06-02)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.1.7 (2026-05-30)

### 🚀 Features

- **tooling:** replace @behavior comment marker with typed covers() gate ([ff36fe9](https://github.com/DominikPieper/atelier-ui/commit/ff36fe9))
- **spec:** AI-readiness metadata + token manifest layer ([d7f6235](https://github.com/DominikPieper/atelier-ui/commit/d7f6235))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Claude Opus 4.8 (1M context)
- Dominik Pieper @DominikPieper

## 0.1.6 (2026-05-27)

### 🚀 Features

- **a11y:** add roving arrow-key navigation to React/Vue radio-group ([0c2ae81](https://github.com/DominikPieper/atelier-ui/commit/0c2ae81))
- **tooling:** enforce behavioral-parity coverage across framework adapters ([06c1829](https://github.com/DominikPieper/atelier-ui/commit/06c1829))

### 🩹 Fixes

- **angular:** suppress click events on disabled button ([1639ced](https://github.com/DominikPieper/atelier-ui/commit/1639ced))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.1.5 (2026-05-20)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.1.4 (2026-05-20)

### 🩹 Fixes

- **storybook-mcp:** align hosted MCPs with Storybook 10.4 reality ([a043e56](https://github.com/DominikPieper/atelier-ui/commit/a043e56))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.1.3 (2026-05-19)

### 🩹 Fixes

- **lint:** satisfy new typescript-eslint + react-hooks v7.1 rules ([e9713f6](https://github.com/DominikPieper/atelier-ui/commit/e9713f6))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.1.2 (2026-04-30)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.1.1 (2026-04-30)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.1.0 (2026-04-28)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.42 (2026-04-28)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.41 (2026-04-28)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.40 (2026-04-28)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.39 (2026-04-27)

### 🚀 Features

- **cookbook:** smoke play() functions across all 6 patterns × 3 frameworks (P6) ([e8f7993](https://github.com/DominikPieper/atelier-ui/commit/e8f7993))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.38 (2026-04-26)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.37 (2026-04-26)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.36 (2026-04-26)

### 🩹 Fixes

- **angular:** drop dead `?? ''` and stale eslint-disable directives ([d00545b](https://github.com/DominikPieper/atelier-ui/commit/d00545b))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.35 (2026-04-26)

### 🚀 Features

- **libs:** Phase 3 — non-color differentiation + protanopia bumps ([#64748](https://github.com/DominikPieper/atelier-ui/issues/64748), [#4](https://github.com/DominikPieper/atelier-ui/issues/4))
- **libs:** Phase 2.2 — LlmCard opt-in role prop ([eae5e5d](https://github.com/DominikPieper/atelier-ui/commit/eae5e5d))
- **libs:** Phase 1 a11y fixes — Progress label, Accordion headingLevel, Button aria-label, Table tabindex ([76b9b7f](https://github.com/DominikPieper/atelier-ui/commit/76b9b7f))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.34 (2026-04-25)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.33 (2026-04-25)

### 🩹 Fixes

- **storybook:** theme toggle compares against background key not hex ([#1](https://github.com/DominikPieper/atelier-ui/issues/1))
- **tokens:** consolidate on-primary into mode-aware text-on-primary ([#0](https://github.com/DominikPieper/atelier-ui/issues/0), [#00](https://github.com/DominikPieper/atelier-ui/issues/00))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.32 (2026-04-25)

### 🚀 Features

- **icon:** add LlmIcon component across all frameworks ([7ef91f2](https://github.com/DominikPieper/atelier-ui/commit/7ef91f2))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.31 (2026-04-25)

### 🩹 Fixes

- **button:** outline hover/active uses surface-sunken (a11y) ([400bbf4](https://github.com/DominikPieper/atelier-ui/commit/400bbf4))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.30 (2026-04-25)

### 🚀 Features

- **chat:** smooth streaming polish — inline typing cursor + smooth scroll ([a60db12](https://github.com/DominikPieper/atelier-ui/commit/a60db12))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.29 (2026-04-25)

### 🚀 Features

- **chat:** auto-scroll messages + focus input on open ([686af87](https://github.com/DominikPieper/atelier-ui/commit/686af87))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.28 (2026-04-25)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.27 (2026-04-25)

### 🩹 Fixes

- **chat:** make Angular content projection work across variants ([b064964](https://github.com/DominikPieper/atelier-ui/commit/b064964))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.26 (2026-04-25)

### 🚀 Features

- **chat:** add LlmChat component for Angular ([48392af](https://github.com/DominikPieper/atelier-ui/commit/48392af))
- **button:** add danger variant ([bcdb114](https://github.com/DominikPieper/atelier-ui/commit/bcdb114))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.25 (2026-04-24)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.24 (2026-04-24)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.23 (2026-04-23)

### 🚀 Features

- **cookbook:** API-docs drift gate + 6th pattern across all 3 frameworks ([f78af67](https://github.com/DominikPieper/atelier-ui/commit/f78af67))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.22 (2026-04-23)

### 🚀 Features

- **storybook:** categorize sidebar and bring Vue stories to parity ([13a666e](https://github.com/DominikPieper/atelier-ui/commit/13a666e))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.0.21 (2026-04-23)

### 🚀 Features

- **a11y:** add invalid-state glyph to LlmInput (WCAG 1.4.1) ([a79064d](https://github.com/DominikPieper/atelier-ui/commit/a79064d))
- **a11y:** add invalid-state glyph to LlmTextarea (WCAG 1.4.1) ([60b6657](https://github.com/DominikPieper/atelier-ui/commit/60b6657))

### 🩹 Fixes

- **tokens:** align dark-mode --ui-color-on-primary with @media value (AA) ([#0](https://github.com/DominikPieper/atelier-ui/issues/0), [#00](https://github.com/DominikPieper/atelier-ui/issues/00))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.20 (2026-04-23)

### 🚀 Features

- **a11y:** add Unicode indicator glyphs to Badge + Alert semantic variants ([05104c8](https://github.com/DominikPieper/atelier-ui/commit/05104c8))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.19 (2026-04-23)

### 🩹 Fixes

- **tokens:** point --ui-color-error-text at the AA-safe darker danger ([#991](https://github.com/DominikPieper/atelier-ui/issues/991))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.18 (2026-04-23)

### 🚀 Features

- **tokens:** add semantic-bg + semantic-text pairs for AA-safe Badge/Alert ([#22](https://github.com/DominikPieper/atelier-ui/issues/22), [#166534](https://github.com/DominikPieper/atelier-ui/issues/166534), [#854](https://github.com/DominikPieper/atelier-ui/issues/854), [#991](https://github.com/DominikPieper/atelier-ui/issues/991), [#0](https://github.com/DominikPieper/atelier-ui/issues/0))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.17 (2026-04-23)

### 🩹 Fixes

- **tokens:** darken placeholder once more to clear AA on input sunken bg ([#6](https://github.com/DominikPieper/atelier-ui/issues/6), [#4](https://github.com/DominikPieper/atelier-ui/issues/4))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.16 (2026-04-23)

### 🩹 Fixes

- **tokens:** repair on-primary + secondary contrast after primary darken ([#00](https://github.com/DominikPieper/atelier-ui/issues/00), [#007070](https://github.com/DominikPieper/atelier-ui/issues/007070), [#0](https://github.com/DominikPieper/atelier-ui/issues/0), [#64748](https://github.com/DominikPieper/atelier-ui/issues/64748), [#475569](https://github.com/DominikPieper/atelier-ui/issues/475569), [#334155](https://github.com/DominikPieper/atelier-ui/issues/334155), [#1](https://github.com/DominikPieper/atelier-ui/issues/1))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.15 (2026-04-22)

### 🩹 Fixes

- **tokens:** darken primary + placeholder for WCAG AA contrast ([#00](https://github.com/DominikPieper/atelier-ui/issues/00), [#9](https://github.com/DominikPieper/atelier-ui/issues/9), [#0](https://github.com/DominikPieper/atelier-ui/issues/0), [#007070](https://github.com/DominikPieper/atelier-ui/issues/007070), [#009696](https://github.com/DominikPieper/atelier-ui/issues/009696), [#005858](https://github.com/DominikPieper/atelier-ui/issues/005858), [#003](https://github.com/DominikPieper/atelier-ui/issues/003), [#6](https://github.com/DominikPieper/atelier-ui/issues/6))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.14 (2026-04-22)

### 🩹 Fixes

- **release:** bump source package.json + refresh lockfile for CI ([fc4314f](https://github.com/DominikPieper/atelier-ui/commit/fc4314f))
- **create-workspace:** make CLI e2e green end-to-end ([f0e46c6](https://github.com/DominikPieper/atelier-ui/commit/f0e46c6))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper @DominikPieper

## 0.0.13 (2026-04-22)

This was a version bump only for angular to align it with other projects, there were no code changes.

## 0.0.12 (2026-04-22)

This was a version bump only for angular to align it with other projects, there were no code changes.