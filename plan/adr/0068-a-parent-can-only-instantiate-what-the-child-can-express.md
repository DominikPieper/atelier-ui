---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0065-the-table-gives-its-children-back-their-states.md (the first composition, and the rule it hinted at)
  - plan/adr/0067-a-text-property-is-api.md (the properties that made this possible)
  - plan/adr/0047-bind-the-literals-that-duplicate-a-token.md (the exemptions this prunes)
---

# ADR-0068: A parent can only instantiate what the child can express

## Status

Accepted. Composes AtlBreadcrumbs and three of AtlChat's four bubbles, states the limit
that stops the other four parents, adds `[STALE-EXEMPTION]`, and deletes seven dead
allowlist entries.

## Context

ADR-0065 composed AtlTr from AtlTd and AtlTbody from AtlTr, and ADR-0067 removed the
supposed blocker for the rest. So the remaining question was which parents can be built
from their children — and the answer turned out to be a rule rather than a list.

A parent's variant frequently **reshapes its child**. `.atl-tab-group.variant-pills
.tablist button` gives the tab a radius, a fill and a shadow that the default tab has
none of. `.atl-menu.variant-compact .atl-menu-item` changes its height, padding and font.
`.atl-table.size-sm tbody td` changes the cell's height. `.atl-stepper.orientation-vertical
.step-item` changes the step's layout. In every case the child master **cannot express the
appearance**, because the axis that selects it belongs to the parent — and giving the
child that axis would be the container-claims-its-child's-state mistake of ADR-0056, run
backwards.

## Decision

**1. A parent may instantiate a child only where no parent axis reshapes it.** Measured
against the CSS rather than assumed:

| Parent | Reshapes the child? | Composed |
|---|---|---|
| AtlBreadcrumbs | no variants at all | **yes** — four AtlBreadcrumbItem instances |
| AtlChat | no variant-scoped `.atl-chat-message` rule | **yes**, three of four bubbles |
| AtlTabGroup | `.variant-pills .tablist button` | no |
| AtlMenu | `.variant-compact .atl-menu-item` | no |
| AtlTable | `.size-sm/md/lg tbody td` | no |
| AtlStepper | `.orientation-vertical .step-item` | no |

Composing AtlBreadcrumbs fixed two divergences on the way in: the master drew `/` where
the CSS's `content` is `›`, and its row had `gap: 8` where `.breadcrumbs-list` has
`gap: 0` and the spacing comes from the link's padding plus the separator's margin.

**2. The fourth chat bubble stays drawn, and that is the slot blocker made concrete.**
`msg-asst-2` wraps the AtlCodeBlock instance. An instance cannot host free content, so
composing it from AtlChatMessage would drop the code block. Three simple bubbles became
instances; the one that carries content did not, with the reason recorded on the
exemption that survives for it.

**3. `[STALE-EXEMPTION]`: an allowlist entry that suppressed nothing this run is
reported.** Composing the three bubbles left two raw-colour exemptions with no subject,
and nothing would have said so. An excuse for a defect that no longer exists reads, to
the next person, as a defect still being excused.

It immediately found five more, and the empirical test — delete all seven, run the gate,
see what fires — showed **none of them was load-bearing**. Four were `name:` exemptions
whose check no longer asks: ADR-0062 narrowed `[NAME]`'s axis derivation to unions ending
in Variant | Size | Shape | Position | Orientation | Align | Role, so a union ending in
`Status` is never a candidate. The behaviour is unchanged — the exemption already excused
the demand — but the *record* changed, because two of those comments held an open design
question: an axis is owed for `AtlAvatarStatus` and `AtlChatStatus`. Those moved to
`tasks/todo.md`. **An allowlist is a poor place to keep a follow-up: it is read only when
something fails.** A note in place of the seven says they were removed rather than lost.

**4. A glyph inside an instance belongs to the child master.** Composing AtlBreadcrumbs
made it inherit AtlBreadcrumbItem's `›` finding *without* the exemption, which lives on
the child's description. The glyph probe now skips text inside instances, the same rule
the layer walk already followed. The cost is stated rather than swallowed: a glyph typed
as an instance **override** is now unseen, recorded beside the probe's other blind spot.

## Consequences

- `check:all` exits 0 with 12 advisory warnings. AtlBreadcrumbs renders
  `Home › Settings › Account › **Profile**` from four instances.
- **Composition is bounded by the child's API, not by Figma.** The slot problem is real
  but smaller than it looked: of six parents, four are blocked by a parent axis that
  reshapes the child, and only one bubble by genuine free content. Fixing the slot
  problem would unblock one drawing; giving children the parents' axes would break
  ADR-0056.
- **A dead exemption is worse than a missing one.** Seven had accumulated, four of them
  because a gate's question changed rather than because a defect was fixed — which is
  exactly the case the new warning's own message calls "the more interesting one".
- Left open with the measurement: whether `[NAME]`'s axis-word list should include
  `Status`, or whether a status is a value union rather than an axis. The list is a
  convention, and a union outside it is never asked about at all.
