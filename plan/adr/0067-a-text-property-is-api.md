---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0061-what-a-property-turns-on-must-be-checked-while-it-is-off.md (the Boolean rule this mirrors)
  - plan/adr/0062-a-part-promoted-to-a-master-becomes-checkable.md (the child masters this was meant to unblock)
  - plan/adr/0056-a-master-models-one-thing.md (a master must not offer what the component does not take)
---

# ADR-0067: A text property is API

## Status

Accepted. Adds `[TEXT-UNSPECED]` to `check:figma`, adds four text properties, renames
four and removes eleven.

## Context

The recorded next step was to compose the remaining parent masters from their children,
blocked — so the note said — because *"an instance cannot gain children, so a part that
takes free content needs the master to expose a slot"*. Checking what each child actually
needs showed the blocker was narrower than that: a tab needs a **label**, a step a label,
a chat bubble its **content**. Those are string fields on the spec, and Figma has a
property type for exactly that. No slot required.

Adding one exposed something else. Trying to give AtlStep a TEXT `description` beside its
existing Boolean of the same name, Figma **did not refuse** — it created
`description2`. A property whose name no reader can trace to anything, arriving silently.

That prompted a look at the text properties already in the file. There were ten, all
hand-authored, all capitalised, and **each one already carried a `- Text \`X\`: …` line in
its master's description** — which is why the first version of this check passed them: it
accepted a sentence as an exemption. Resolving those sentences against the spec:

| Property | Reality |
|---|---|
| `AtlSelect.Placeholder`, `AtlTextarea.Placeholder` | the field is `placeholder` — right field, wrong case |
| `AtlTooltip.Content` | the field is `atlTooltip` |
| `AtlAvatarGroup.max` | exact, and a number rather than a string |
| `AtlBadge.Label`, `AtlCheckbox.Label`, `AtlToggle.Label`, `AtlAlert.Message` | no such field: the text is content projection |
| `AtlAvatar.Initials` | no such field, and not settable at all — `atl-avatar.tsx` computes `getInitials(name)` |
| `AtlCard.Title`/`Body`, `AtlDialog.Title`/`Message`/`ConfirmLabel`/`CancelLabel` | no such fields; `atl-dialog.tsx` has no `title` or `confirmLabel` prop of any kind |
| `AtlToast.Message` | AtlToast has no spec interface; the message is the service call's first argument |

## Decision

**1. A text property is API, and names a field.** `[TEXT-UNSPECED]` blocks a TEXT or
INSTANCE_SWAP property unless its name is a field of the component's own spec, or its
`- Text` line states a mapping **the check resolves** — `maps to <Interface>.<field>`,
with both the interface and the field verified — or states `not a property — <reason>`
for a value that is derived or arrives another way. This is `[BOOL-CLAIM]`'s rule one
type over: an unchecked claim is how the ten got there.

**2. Eleven properties removed, four renamed, four added.**

- Added, each naming a spec string: `AtlTab.label`, `AtlStep.label`,
  `AtlChatMessage.content`, `AtlChatSuggestion.label`.
- Renamed to the field they mean: `Placeholder` → `placeholder` (twice), `Content` →
  `atlTooltip`, `Message` → `message`.
- Removed: `AtlBadge.Label`, `AtlCheckbox.Label`, `AtlToggle.Label`, `AtlAlert.Message`,
  `AtlAvatar.Initials`, `AtlCard.Title`/`Body`,
  `AtlDialog.Title`/`Message`/`ConfirmLabel`/`CancelLabel`. **Nothing is lost by
  removing them**: text inside a Figma instance is editable without any property, so
  these added a panel field and the implication of a prop that does not exist. The
  avatar's was worse than redundant — it offered to set a value the component derives,
  so a designer could type something it can never render.

**3. Presence and content cannot share a name.** `AtlStep.description` and
`AtlChatSuggestion.hint` stay Booleans: Figma allows one property per name, and presence
is the state worth switching. The content of those two lines is therefore not settable
from the panel — a real limitation, recorded in the masters' descriptions rather than
worked around with an invented name like `descriptionText`.

**4. The removals are recorded in the descriptions, not erased.** Each master keeps its
`- Text \`X\`: REMOVED 2026-08-27 (ADR-0067) — <reason>` line. A reader who wonders why
the badge has no label property finds the answer where they are already looking.

## Consequences

- `check:all` exits 0 with 12 advisory warnings. All three failure shapes verified by
  injection: an undocumented property, a documented one stating no mapping, and one
  claiming a field that does not exist — each with its own message.
- **A sentence is not a claim until something resolves it.** Ten properties carried
  documentation and three of those documented nothing that exists. The `- Boolean` checks
  learned this in ADR-0058; the text properties had the same hole for as long as they had
  existed.
- **Figma appends a digit instead of refusing a duplicate name.** Any script that adds a
  component property has to read back the key it got rather than the one it asked for —
  and `deleteComponentProperty` on the requested name then fails, which is how
  `description2` survived its own cleanup for several minutes.
- The composition work this was meant to unblock is now unblocked for the label-only
  parents: AtlTabGroup, AtlStepper, AtlBreadcrumbs and AtlChat's bubbles can be built
  from child instances with the text set per instance. AtlMenu's items (icon **and**
  label) and AtlAccordionItem's panel still need a genuine slot decision.
