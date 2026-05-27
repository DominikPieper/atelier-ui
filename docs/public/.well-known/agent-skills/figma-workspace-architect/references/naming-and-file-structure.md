# Naming and file structure

If a designer can't find a component in 30 seconds, they'll build a duplicate. Naming and file structure are what prevent that.

## Slash naming convention

Figma turns every `/` in a name into a hierarchy level — in the asset panel picker, in the layer panel, and in the instance-swap menu. Use this deliberately.

### For Components

```
{ComponentName}/{Variant1}/{Variant2}
```

Examples:
- `Button/Primary/Default`
- `Button/Primary/Hover`
- `Input/Text/Error`
- `Card/WithImage`

The first segment is the engineering component name — it's what designers and developers both use as the canonical reference. **Match it exactly to the code-side component name** (typically PascalCase: `Button`, `TextInput`, `IconButton`). Don't use `BTN` or `Btn` — use `Button`.

When the component is a Variant Set, the segments after the first are converted into Variant Properties at conversion time. Once converted, the segments live in the Properties panel, not in the layer name. Don't reintroduce them in the name post-conversion — that's a corrupted-variant bug.

### For Variables

```
{category}/{purpose}/{variant}/{state?}
```

See `token-architecture.md` for examples and rules. Variables and Components both use `/`, but they live in separate panels — there's no conflict.

### For Icons

Icons are **separate Components**, never a single Variant set with a `Name` property (Variant pickers don't show previews — an icon Variant set is unusable past 5 icons).

```
Icon/{size}/{name}
```

Examples:
- `Icon/16/Home`
- `Icon/16/Settings`
- `Icon/24/Home`
- `Icon/24/Settings`

The size segment makes sizes browsable as folders. If there's only one size, drop it: `Icon/Home`.

### Sub-components — `_` and `.` prefix

Components prefixed with `_` or `.` are **excluded from publishing** — they're library-internal building blocks. Use this for:

- Slot placeholders (`_Slot/Default`)
- Internal sub-pieces designers shouldn't drag onto a canvas directly (e.g. `_ButtonContent`, `_CardShell`)
- Work-in-progress components not yet ready for the team

The user-facing library should only show the components designers should use. Atomic sub-components that are only useful inside other components should be hidden.

## File / page structure for a Library file

A library file is **only for publishable components and reference material**. Working designs do not belong in the library file — they go in product files that consume the library.

The recommended page layout for a library file:

```
📐 Cover                — the file thumbnail; library name, version, last-updated date
🎨 Tokens               — visual documentation of Variables: color swatches with names, type scale, spacing, shadows
🔣 Icons                — the icon set, browsable as folders
🧩 Components/Actions   — buttons, links, IconButton
🧩 Components/Inputs    — TextInput, Select, Checkbox, Radio, Toggle, Combobox
🧩 Components/Feedback  — Toast, Alert, Badge, Spinner
🧩 Components/Overlays  — Modal, Drawer, Popover, Tooltip
🧩 Components/Navigation — NavBar, Sidebar, Tabs, Breadcrumb, Pagination
🧩 Components/DataDisplay — Table, Card, Avatar, List
🧩 Components/Layout    — Divider, Container, Stack, Grid
📋 Patterns             — annotated reference designs (NOT publishable components)
🚧 _Internal            — sub-components prefixed with _ or .; not visible to consumers
📝 Changelog            — major updates, version notes
```

Notes:

- **One page per category** scales well for libraries with 30+ components. A small library can collapse all components onto one `Components` page.
- **The Cover page** is what shows up as the file thumbnail. Make it informative — at minimum, library name and version. Designers see this in the file browser.
- **Patterns** are not components. They're reference designs (e.g. "how to compose an empty state"). Don't publish them.
- The page emoji is there for human navigability, not Figma's structure. It's optional but appreciated.

## Sections vs. Frames — when to use which container

Both group children, but they serve different roles. Mixing them up is a recurring audit finding (FS4).

| Aspect                | Section                                   | Frame                                          |
|-----------------------|-------------------------------------------|------------------------------------------------|
| Auto Layout           | ❌                                         | ✅                                              |
| Constraints           | ❌                                         | ✅                                              |
| Clip content          | ❌                                         | ✅                                              |
| Fills / strokes       | ❌                                         | ✅                                              |
| Can nest in a Frame   | ❌                                         | ✅                                              |
| `Ready for dev` marker| ✅                                         | ✅                                              |
| Asset-panel grouping  | Page-level region                         | n/a                                             |

**Rule:**

- **Page-level grouping** (e.g. "Tokens reference area", "All Buttons here", "Patterns gallery") → Section. Mark the Section Ready for dev when the group ships together.
- **Anything inside a component** — every variant frame, every nested layout container — → Frame. No exceptions.

A Section nested inside a Frame is invalid hierarchy and must be lifted out. A component built around a Section instead of a Frame loses every reflow guarantee.

## File / page structure for a working file

A product / feature file is for current design work, not the library. Recommended pages:

```
📐 Cover         — thumbnail, project name, status
📊 Flow          — user flows, IA diagrams
🎨 Designs       — current high-fidelity designs (one screen / state per frame)
🧪 Exploration   — earlier ideas, alternatives kept for reference
💬 Feedback      — review notes, comments anchored to specific designs
💻 Handoff       — final specs, often a mirror of Designs but cleaner
```

Working files **consume** library components, but they don't define new ones. If a need for a new component arises during product work, sketch it on the Exploration page — when ready, promote it to the library file.

## When to split into multiple library files

A single Figma file can hold a lot, but at some point splitting helps. Common splits:

- **Foundations / Tokens** in their own file. Components live in a separate file that consumes Foundations as a library. Allows tokens to be versioned and consumed independently of components.
- **Web vs. Mobile** components. Different prop APIs, different responsive concerns, different teams.
- **Brand library separate from product library.** Logo, brand colors, marketing illustrations live in Brand. Product UI components live in the product library. Brand is consumed by both product files and marketing files.

Don't split prematurely. The cost is real: more files to publish, more libraries to enable per project, more drift opportunities. Split only when:
- The file has crossed the 2GB Figma limit, or
- Different teams own different parts and need independent publishing cadences, or
- A clear consumer/dependency boundary exists (foundations consumed by everything, components consumed by product files only).

## Audit signals for naming / structure

| Signal                                                                       | Severity   |
|------------------------------------------------------------------------------|------------|
| Component name doesn't match the engineering component name                  | Critical   |
| `BTN`, `TXT`, abbreviated names                                              | Warning    |
| Variant Property values use casing that differs from code (`Small` vs `sm`)  | Critical   |
| Working designs found inside a published library file                        | Warning    |
| Atomic sub-components are publishable (no `_` prefix) and clutter the asset panel | Warning |
| Icons modeled as a Variant set instead of separate Components                | Critical   |
| File has a single page named "Page 1" with everything on it                  | Critical   |
| Cover page is empty or generic                                               | Suggestion |
| No Patterns page or any reference for composition examples                   | Suggestion |
| Inconsistent slash depth across components (some `Button/Primary`, some `Button-Primary`) | Warning |
