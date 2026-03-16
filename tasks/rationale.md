# Design Rationale — Why Each Addition Was Chosen

This document explains **why** specific components, patterns, and refactors were selected for the library. The library's unique value proposition is "built for apps written by AI, used by humans" — every decision is filtered through that lens.

---

## Composition Cookbook — Why These 5 Patterns?

The cookbook is Priority 1 because LLMs can generate individual components fine, but composing 5–7 components into a realistic page layout is where they need examples. Each pattern was chosen based on frequency analysis of what AI-generated applications actually need:

### 1. Login Form
**Why:** Login/signup forms are the single most frequently AI-generated page across all LLM coding tools. Every "build me an app" prompt results in auth UI. This pattern teaches Card + form control composition, validation error display, and loading state management — three patterns that appear in nearly every form.

### 2. Settings Page
**Why:** Settings pages exercise the most components simultaneously (Tabs, Toggle, Select, Input, Button, Alert). They test tab-based layout composition at scale. When an LLM is asked to "build a SaaS dashboard," settings is always one of the first pages needed. This pattern proves the component set works together.

### 3. Confirmation Dialog
**Why:** Every CRUD application needs "are you sure?" dialogs. The trigger→dialog→action flow is a composition pattern that LLMs frequently get wrong (forgetting to wire up open/close state, misplacing the dialog in the DOM). Having this as a reference pattern eliminates that failure mode.

### 4. Data List with Actions
**Why:** Data lists with inline actions are the core building block of admin panels and dashboards — the most common AI-generated application type. This pattern combines Badge (status indicators), Menu (contextual actions), Tooltip (icon affordance), and Card (row layout). Without this example, LLMs tend to reach for HTML tables instead of composing components.

### 5. Notification Center
**Why:** Monitoring dashboards and admin tools need grouped notification displays. This pattern combines Accordion (structural grouping) with Alert (feedback), showing how to nest interactive components inside collapsible sections. It's a composition that LLMs rarely attempt without an example.

---

## New Components — Why Toast & Skeleton?

### LlmToast (Snackbar)
**Why chosen:** Alert is inline-only — it sits in the page flow. But every real application needs transient "action completed" / "error occurred" messages that appear and auto-dismiss without disrupting layout. Toast fills this gap.

**Why service-based:** LLMs naturally reach for `inject(Service)` patterns. An imperative `toastService.show('Saved!', { variant: 'success' })` is more intuitive for AI-generated code than a declarative template approach. It also works from any component/service without template wiring.

**Why this API shape:** The variant/duration/dismissible pattern mirrors Alert's API for consistency. Position is on the container (set once) rather than per-toast (simpler mental model). Auto-dismiss with configurable duration covers 95% of use cases.

### LlmSkeleton
**Why chosen:** Loading states are universal but LLMs consistently forget to implement them. Having a dedicated, discoverable component solves this — when an LLM sees `LlmSkeleton` in the component list, it's prompted to add loading states. Without it, AI-generated apps jump from blank to loaded with no intermediate state.

**Why pure CSS:** Skeleton is a visual placeholder with zero interactive logic. Making it pure CSS (shimmer animation via `@keyframes` + gradient) keeps it extremely lightweight — no JS overhead, no change detection cost. It can be used freely without performance concerns.

**Why three variants:** `text` (inline paragraph placeholder), `circular` (avatar), and `rectangular` (image/card) cover every loading skeleton pattern seen in production UIs. More complex layouts compose from these three primitives.

---

## CDK Refactoring — Why These Components?

### Already Done (no refactoring needed)
- **LlmSelect** — Already uses `ActiveDescendantKeyManager` from CDK a11y
- **LlmDialog** — Already uses `cdkTrapFocus` from CDK a11y
- **LlmAccordion** — Already uses `CdkAccordion` + `CdkAccordionItem`

### Kept Manual (Decision: Not Worth Refactoring)

#### LlmTabs — Keeping manual keyboard nav
**Why not refactor:** The current ~40 lines of manual roving tabindex are clean and well-tested. `FocusKeyManager` expects items implementing `FocusableOption`, but tab buttons are rendered directly in the template as `<button>` elements, not as Angular components. Wrapping each DOM button in a `FocusableOption` adapter class, managing lifecycle, and subscribing to `change` events would produce roughly the same amount of code with an added abstraction layer. Net benefit: negative.

#### LlmRadioGroup — Keeping manual keyboard nav
**Why not refactor:** RadioGroup uses native `<input type="radio">` elements, which have built-in browser focus behavior. CDK's `FocusKeyManager` is designed for custom focusable items (Angular components implementing `FocusableOption`), not native form controls. The current ~20 lines of arrow key handling work directly with the DOM inputs — this is the correct pattern for native radio buttons.

### Why CDK Where It's Used
The three components that *do* use CDK benefit from it:
- **Select** uses `ActiveDescendantKeyManager` — complex type-ahead + highlight tracking justifies the abstraction
- **Dialog** uses `cdkTrapFocus` — focus trapping is notoriously hard to implement correctly
- **Accordion** uses `CdkAccordion` — expand/collapse state coordination with single/multi mode
- **Menu** uses `CdkMenu` — nested submenus, overlay positioning, and complex keyboard interactions
- **Tooltip** uses CDK Overlay — viewport-aware positioning with fallback logic

The pattern: use CDK when it handles genuinely complex behavior (focus trapping, overlays, nested menus). Keep manual code when the behavior is straightforward and the manual code is cleaner.

---

## Why This Priority Order?

1. **Cookbook first** — Validates that the existing 15 components compose well. If composition is awkward, we fix APIs before adding more components. Highest AI impact per effort.
2. **Toast + Skeleton** — Fills the two biggest gaps that block real-app generation. Every app needs notifications and loading states.
3. **CDK refactoring** — Cleanup while patterns are fresh. Reduces maintenance burden before the library grows.
4. **Additional components** — Built as the cookbook reveals gaps. Avatar, Drawer, Breadcrumbs are common but not blocking.
5. **Publishing** — When the library is feature-stable. Premature publishing creates versioning headaches.
