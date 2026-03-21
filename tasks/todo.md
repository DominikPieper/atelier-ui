# Implementation Plan — Review & Next Steps

## Priority 1: Composition Cookbook ✅ Complete

- [x] Login Form story (with validation error variant)
- [x] Settings Page story (Tabs + Toggle + Select + Input + Alert)
- [x] Confirmation Dialog story (trigger → dialog → action flow)
- [x] Data List with Actions story (Card + Badge + Menu + Tooltip)
- [x] Notification Center story (Accordion + Alert + Badge)
- [x] Add composition snippets to CLAUDE.md

## Priority 2: New Components ✅ Complete

- [x] LlmToast (service + container + toast component, tests, stories)
- [x] LlmSkeleton (text/circular/rectangular, shimmer animation, tests, stories)
- [x] Export from index.ts
- [x] Add API reference to CLAUDE.md

## Priority 3: CDK Refactoring ✅ Complete

- [x] LlmSelect → Already uses `ActiveDescendantKeyManager`
- [x] LlmDialog → Already uses `cdkTrapFocus`
- [x] LlmAccordion → Already uses `CdkAccordion` + `CdkAccordionItem`
- [x] LlmTabs → Kept manual (DOM buttons not FocusableOption; CDK adds complexity, not simplicity)
- [x] LlmRadioGroup → Kept manual (native radio inputs; CDK FocusKeyManager is for custom items)

## Priority 4: Additional Components ✅ Complete

- [x] LlmAvatar
- [x] LlmDrawer
- [x] LlmBreadcrumbs
- [x] LlmPagination
- [x] LlmProgress

## Known Issues

- [ ] **Fix `llm-components-angular` build error**: `Cannot find module '@atelier-ui/spec'` during ng-packagr compilation.
  - **Root cause**: `@nx/angular:package` executor doesn't invoke Nx's `createTmpTsConfig` path remapping (source → dist) for `@atelier-ui/spec` dependency.
  - **Fix**: Switch executor in `libs/llm-components-angular/project.json` from `@nx/angular:package` to `@nx/angular:ng-packagr-lite`, which uses Nx's full buildable libs infrastructure and properly remaps paths.
  - `dependsOn: ["^build"]` is already in place (added during investigation).

## Priority 5: Publishing & Tooling

- [ ] Auto-generated API reference script
- [x] npm packaging (build targets + package.json already configured; publish workflow added at `.github/workflows/publish.yml`)
- [x] Versioning (triggered by GitHub Release)
- [ ] Set `NPM_TOKEN` secret in GitHub repo settings before first publish
- [ ] Demo app / docs site deployment

## Verification ✅

- [x] `nx test llm-components` — 332 tests pass across 18 suites
- [x] No build target configured (library consumed directly)
- [ ] Storybook visual check (light + dark mode) — manual step

## Review

### What was delivered
- **5 cookbook stories** composing 12+ components into realistic page layouts
- **2 new components**: LlmToast (service-based notifications) + LlmSkeleton (loading placeholders)
- **CLAUDE.md updated** with new component API references, composition cookbook section, and rationale for each addition
- **Rationale documentation** in `tasks/rationale.md` explaining why each component/pattern was chosen
- **CDK assessment**: 3/5 already refactored, 2/5 intentionally kept manual (documented why)

### Total component count: 17 components + 1 service
