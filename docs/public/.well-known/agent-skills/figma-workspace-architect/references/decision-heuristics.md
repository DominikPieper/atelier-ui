# Decision heuristics

The recurring forks in Figma workspace architecture. Each section gives a recommendation, the reasoning, and the alternative path with its trade-off.

In Decide mode, find the matching question, give the recommendation in the first sentence, the reasoning in the second, and the alternative in the third. Don't lecture — the user is at a fork, not a seminar.

## Variant vs. Component Property vs. Instance Swap vs. separate Components

**Use a Variant when:**
- The visual difference is meaningful and a designer benefits from seeing each option.
- The values correspond to an enum-typed prop in code (`variant: 'primary' | 'secondary'`).
- The total Variant count stays manageable (under ~30 frames in the set).

**Use a Boolean Property when:**
- An element appears or doesn't appear, with no other change.
- Examples: `HasIcon`, `Loading`, `Disabled`.

**Use an Instance Swap when:**
- A nested component varies per instance (an Icon, an Avatar, a sub-component).
- This is also how slot patterns are implemented (the slot is an Instance Swap).

**Use separate Components when:**
- There are too many options for a Variant picker to be browsable (icons — 50+ options).
- The components have genuinely different prop APIs in code.
- Group them with slash naming for asset-panel folders.

**Decision tree:**

```
Is the variation an enum the code uses?      → Variant
Is it just show/hide?                         → Boolean Property
Is a nested component varying per instance?   → Instance Swap
Are there 30+ options with no shared structure? → separate Components
Is text content varying?                      → Text Property
```

If two of these apply, often you need a combination — e.g. Button has Variant `Type` AND Boolean `HasIcon` AND Instance Swap `Icon`. That's correct.

## Primitive vs. Semantic vs. Component Token

**Primitive when:**
- The variable holds a raw value (color hex, pixel number, font size).
- The name describes *what it is*, not *what it's for* (`color/blue/500`, `space/4`).
- It will be aliased by Semantics, never referenced directly by components.

**Semantic when:**
- The variable describes *purpose* (`color/text/primary`, `space/inline/md`).
- The variable aliases a Primitive — it doesn't hold raw values.
- It carries Modes (Light/Dark, Brand-A/Brand-B).
- Components reference these.

**Component when:**
- The token is specific to one component (`button/primary/background-default`).
- There are enough state-driven values that maintaining them centrally beats inline overrides.
- Most teams skip this layer in Figma and keep it on the code side.

**Default recommendation:** **Two tiers (Primitive + Semantic) only.** Add a Component tier only if the team explicitly wants it and has a clear use case.

**Decision tree:**

```
Does the value describe what it is, or what it's for?
  → "what it is" → Primitive
  → "what it's for" → Semantic

Does only one component use this purpose?
  → Yes, and the team wants centralization → Component
  → Yes, but inline overrides are fine → Skip the Component tier
```

## New Mode vs. New Collection

A Mode is appropriate when **the same Semantic token resolves to a different value in a different context**.

**Use a Mode when:**
- Light vs. Dark — same token (`color/text/primary`) resolves differently per theme.
- Brand-A vs. Brand-B in a multi-tenant product — same token, different brand value.
- Density Comfortable vs. Compact — same `space/inline/md`, different value.

**Use a new Collection when:**
- The values represent a fundamentally different category (`Color` collection vs. `Layout` collection).
- The variables don't share consumers — Layout consumers don't care about Color modes and vice versa.
- A new tier is being added (Component tokens get their own collection).

**Don't use a Mode for:**
- States like hover/disabled — those are Variant Properties.
- Different sizes of the same component — those are Variant Properties.
- Different platforms (iOS / Android / Web) where the design language genuinely differs — that's a separate Library.

**Default:** modes for theming/branding, separate collections for separate categories. Modes on the **Semantic** tier only.

## Nested Component vs. Slot

**Use a nested component when:**
- The inner component is fixed for that variant — designers shouldn't be able to swap it.
- Example: a Modal contains a fixed CloseButton.

**Use a slot (Instance Swap Property) when:**
- The inner area should be configurable per instance.
- Example: a Card's content area, where designers compose different content.
- Example: a Notification's action area, where the action button can be a Button, IconButton, or Link.

**Implementation of a slot:**

1. Create a placeholder component, prefixed `_Slot/Default` (the `_` keeps it unpublished).
2. Inside the parent, place an instance of the slot placeholder.
3. Expose the nested instance as an Instance Swap Property.

**Default:** if you find yourself making 5+ Variants of the same parent component just to vary one nested area, that area should be a slot.

## Single Library vs. Multiple Libraries

**Use a single Library when:**
- The team is small, one product, one platform.
- The total component count is manageable (<150).
- Tokens, components, patterns can coexist on different pages within one file.

**Split into multiple Libraries when:**
- File size approaches Figma's 2GB per-file limit.
- Different teams own different parts (e.g. Foundations team owns tokens, UI team owns components).
- Different publishing cadences are needed (tokens stable, components move fast).
- Web vs. Mobile have separate prop APIs and concerns.

**Common splits:**

- **Foundations** (tokens, type, color) — consumed by everything.
- **Components** — consumed by product files.
- **Brand** (logo, brand colors, marketing illustrations) — consumed by marketing files too.

**Don't split prematurely.** Each split is a maintenance cost. A monolithic library that works is better than three libraries that drift apart.

## Variables vs. Styles

**Use Variables for:**
- Colors (Variables support modes, Styles don't).
- Numbers (spacing, radius, sizing).
- Strings (font family/style, locale-specific text).
- Booleans (visibility toggles).

**Still use Styles for:**
- Effect Styles (shadows, blurs) — Variables don't fully cover effects yet.
- Text Styles — though typography is increasingly possible with Variables (font-size, weight, line-height as variables); the text-style wrapper is still useful.

**Default:** new work goes on Variables. Don't migrate existing Styles aggressively unless modes are actually needed — Styles continue to work fine.

## Code-side mapping — naming alignment is the bridge

This skill explicitly does not recommend Figma's official Dev-Mode MCP or Code Connect. The toolchain is figma-console-mcp only, and the bridge to code is **naming alignment**:

- Component names match code component names exactly.
- Variant Property names and values match code prop API exactly.
- Variable names match codebase token names.

When alignment is tight, code-gen tools infer the mapping with high accuracy without an explicit Code Connect file. When alignment drifts, no mapping config recovers it.

**Default:** invest the maintenance effort in keeping names in lockstep, not in setting up a parallel mapping system. If the user asks about Code Connect or the official Figma Dev-Mode MCP, say it is out of scope for this skill — figma-console-mcp doesn't implement it and we don't run a second MCP for it.

## `figma_execute` vs. high-level Component Property tools

When defining or modifying a Component Property (Boolean / Text / Instance Swap), prefer the typed CRUD tools over hand-rolling Plugin API in `figma_execute`.

**Use `figma_add_component_property` / `figma_edit_component_property` / `figma_delete_component_property` when:**
- The change is a single property definition.
- The atomicity boundary is "one property, valid or rolled back".
- The agent or a future reader benefits from typed inputs (no malformed `componentPropertyDefinitions` shapes possible).

**Use `figma_execute` when:**
- The property change must happen alongside other mutations atomically (e.g. add `HasIcon` AND set every variant's icon-slot Instance Swap default in one go).
- The script involves walking the component tree to derive the property's allowed values from existing variants.

**Default:** start with the high-level tool. Escalate to `figma_execute` when the atomic boundary genuinely needs the wider scope.

## Section vs. Frame as container

Sections and Frames look similar but carry different layout primitives. Pick the right one — using a Section where a Frame belongs breaks downstream layout assumptions.

**Use a Section when:**
- The container is **page-level grouping** of unrelated artifacts (e.g. "Tokens", "Components", "Patterns" as sections on a page).
- You want to mark the entire grouping **Ready for dev** in one go.
- Designers should be able to navigate it as a labeled region but it doesn't constrain its contents.

**Use a Frame when:**
- Anything **inside** a component — every variant frame, every nested layout box.
- Auto Layout is needed (Sections don't have it).
- Constraints, clip-content, corner radius, fills, or strokes are needed (Sections don't have these).
- The container will live inside another Frame (Sections cannot nest inside Frames).

**Decision tree:**

```
Is this the inside of a component / variant?     → Frame
Does this container need Auto Layout / fills?    → Frame
Does this container need to live inside a Frame? → Frame
Is it a page-level "this is the Components area" grouping? → Section
```

**Default:** Frame. Sections are a small, specialized tool for organizational labeling — most "container" needs in a design system are Frames.

## Component Tokens — yes or no?

Component-tier tokens (`button/primary/background-default`) sit between Semantic tokens and the component itself.

**Pros:**
- Centralizes per-component values; changing one place updates all instances.
- Useful when state values (hover, active, disabled) are complex.

**Cons:**
- Adds a third tier — more variables, more discoverability cost.
- Often duplicates what's already in Semantics (`button/primary/background-default` → `color/action/primary`, the `button` prefix adds nothing).
- Most code-side design systems handle component tokens in code, not in Figma.

**Default recommendation: skip Component tokens in Figma.** Reach for them only when:
- A component has many state-driven values that aren't expressible as direct Semantic references.
- The team explicitly wants Figma to own the component-token layer (rare).

If unsure: skip. You can always add the layer later.

## When to ask the user vs. decide yourself

Ask the user when:
- The decision depends on team conventions, codebase, or product roadmap that you can't infer.
- Multiple reasonable answers exist and the trade-offs matter (e.g. "do you need dark mode now or in 6 months?").
- The decision is destructive (rename, delete, restructure).

Decide yourself when:
- One option is clearly correct given general best practices and the file's existing state.
- The cost of being wrong is low (renames are reversible, additions are reversible).
- Asking would interrupt a flow the user explicitly delegated.

A useful test: "Will the user regret it if I pick the wrong one?" If yes, ask. If it's reversible and a sensible default exists, decide and document the choice in the build summary so the user can override.
