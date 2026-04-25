# Component design

Figma offers four mechanisms to express variation in a component. Choosing the right one for each axis of variation is what separates a maintainable library from a 256-permutation Variant set that nobody can navigate.

The four mechanisms:

1. **Variants** — multiple frames inside a Component Set, switched via Variant Properties.
2. **Component Properties** — typed knobs on a single component: Boolean, Text, Instance Swap.
3. **Nested Component Instances** — composing components inside other components.
4. **Separate Components** — when something looks similar but is fundamentally a different thing.

## When to use each

### Variant — for visually distinct states/types

Use when:
- The visual difference is large enough that a designer benefits from seeing each option.
- The combinations are bounded and meaningful (e.g. `Type × State` where both axes have ≤4 values).
- The variations correspond to **enum-typed props** in the codebase (`type: 'primary' | 'secondary' | 'ghost'`).

Don't use for:
- Showing/hiding sub-elements (use a Boolean Property instead).
- Swapping an icon for a different icon (use Instance Swap).
- Hundreds of options like an icon set (use separate Components).

The bound to watch: **Variants × Variants × Variants explodes.** A component with `Type (4) × Size (3) × State (5) × Icon Position (3)` is 180 frames. Convert one of those axes to a Boolean or Instance Swap.

### Boolean Property — for show/hide

Use when an element appears or doesn't appear without otherwise changing the component.

Examples:
- `Has Icon` — toggles whether an icon slot is rendered.
- `Has Helper Text` — input field with optional helper.
- `Loading` — toggles a spinner overlay.

Don't use Boolean Properties to encode mutually exclusive states (Default / Hover / Disabled). That's a Variant.

### Text Property — for editable strings

Use for any text content that designers will customize per instance: button labels, headings, helper text. The property exposes the text node directly, so designers can override without detaching.

Bind to a Variable when the string should come from a translation file or a token (`label/cta-default`). Otherwise leave it as plain text with a sensible default.

### Instance Swap Property — for swappable nested components

Use when one component nests another and the inner component needs to vary per instance.

Examples:
- A Button has an Icon Property (Instance Swap pointing at the Icon library) so designers pick which icon.
- A Card has a Header Property that can be swapped between `CardHeader/Default` and `CardHeader/WithAvatar`.

This is also how you implement **slot patterns** — a Card's content area can be an Instance Swap pointing at a Frame the user composes elsewhere.

### Nested Components — for composition without a property

Use when the inner component is fixed for that variant and shouldn't be designer-configurable. Example: a Modal contains a CloseButton that's always the same — nest it directly, don't expose it as a property.

### Separate Components — when they're different things

Use when:
- There are too many options for a Variant to be browsable (icons — there's no visual preview in a Variant dropdown, so an "icon" Variant set with `Name` as a property is unusable).
- The components have different prop APIs in code. Don't force-fit a Variant if the code-side `<TextInput>` and `<Select>` have different props.

For a related family of separate components, use **slash naming** to group them in the asset panel: `Icon/16/Home`, `Icon/16/Settings`, etc.

## Variant Property naming — match the code

Variant property names and values are a contract with engineering. Make them match the code component's prop API exactly.

| Code prop                          | Figma Variant property              |
|------------------------------------|-------------------------------------|
| `<Button size="sm" />`             | `Size: sm` (not `Size: Small`)      |
| `<Button variant="primary" />`     | `Variant: primary`                  |
| `<Button isLoading />`             | `Loading: true` (boolean)           |
| `<Input state="error" />`          | `State: error`                      |

Rules of thumb:
- Property names are **PascalCase or Title Case** in Figma (Figma's own UI uses Title Case).
- Property values match the code value casing exactly (`sm`, not `Sm` or `Small`) — this is what gets read out by code-generation tools.
- Boolean properties end in a positive (`HasIcon`, `Disabled`, `Loading`) — never negative (`NoIcon`).

## Atomic composition

Build atomic sub-components and nest them. Don't paste the same set of layers across every Variant.

Example: a Button has many variants. Inside, the icon should be an instance of an `Icon/*` component, not a directly-drawn vector. Why:

- Icon swap costs nothing — it's just changing an Instance Swap.
- A change to the icon style propagates to every button automatically.
- The Button file size stays small — duplicate vectors blow up file weight fast.

Apply this all the way down: a Button contains an Icon and a Text node, a Card contains a CardHeader (which contains an Avatar and a Title) and a CardBody. Each level is a component.

## Slot pattern

A "slot" is a property on a component that accepts an arbitrary instance — the equivalent of `children` in React.

Implementation:
1. Inside the parent component, place an instance of a placeholder component (e.g. `_Slot/Default` — note the `_` prefix marks it as unpublished).
2. Expose that nested instance as an Instance Swap Property.
3. Designers using the parent can swap the slot's instance to anything they need.

This is what makes a Card actually reusable for many content shapes without ballooning into a 50-Variant set.

## Don't-do list

| Anti-pattern                                                               | Fix                                                                  |
|----------------------------------------------------------------------------|----------------------------------------------------------------------|
| One Variant set per icon, with `Name` as the Variant property              | Make every icon a separate Component, group with slash naming.        |
| State (hover/disabled) modeled with separate Components                    | Combine into a Variant set with `State` property.                     |
| `IconLeft`, `IconRight`, `IconBoth` as separate Variants                   | One Boolean `HasIcon` plus a Variant `IconPosition: left | right`.    |
| Detached instance to "fix" a one-off — committed to the file               | Surface the missing variant as a real Variant or Property.            |
| Variant Property names that differ from the code prop names                | Rename Figma to match code. The code is the source of truth here.    |
| Component without a description                                            | `figma_set_description` after creation. Always.                      |
| All-caps Component names (`BUTTON`)                                        | Match the engineering naming exactly (typically PascalCase).         |
| 100+ frames in a single Variant set                                        | Decompose: one or more axes should become Properties or sub-components. |

## Atomic-design vocabulary — optional

Some teams adopt Brad Frost's vocabulary (Atoms / Molecules / Organisms / Templates / Pages). It's fine if it works for the team, but don't impose it. Figma's primitives don't care, and codebases rarely follow this vocabulary literally. The important thing is that the **levels of nesting** match between Figma and code, regardless of what they're called.
