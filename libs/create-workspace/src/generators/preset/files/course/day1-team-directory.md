# Day 1, Block 05: a screen from Storybook, against the clock

Used in Day 1 Block 05. You build a "Team directory" screen out of components that
already exist in `{{PKG}}`. The only thing you know about those components is what the
`{{MCP}}` MCP server tells you. Nobody gives you the steps: a brief, four rules, a clock
and closing checks.

## The brief

A "Team directory" screen:

- A heading "Team directory".
- A toolbar: a search field labelled "Search people", a select labelled "Role" (All roles,
  Engineer, Designer, Manager) and a primary button "Invite member".
- A table of members: Name, Email, Role, Status. Status is a badge: active is success,
  invited is warning, suspended is danger.
- Pagination under the table, 5 rows per page.
- Search narrows by name or email, the role select narrows by role, both together.
  Changing a filter goes back to page 1. No match shows the table's own empty state.
- Data: a hard-coded array of 12 members in the component. No HTTP.

Components involved: AtlInput (search), AtlSelect (role filter), AtlButton `primary`
(Invite member), AtlTable, AtlBadge (one per status), AtlPagination.

## The four rules

1. **Look before you write.** The agent calls `docs-list`, then `docs-show` for every
   component, before the first line of code.
2. **Every prop has a source.** A prop, input, slot or event in your code must appear in the
   `docs-show` output (its code examples count) or in `docs-show-story`. Not documented
   means not used, and the agent says so. The one exception: the import class names and the
   package name come from the installed package's type exports, and the receipts say so.
3. **No hand-built twin.** Where the library has a component, you use it. A `div` with a
   border is not a card, a hand-styled `span` is not a badge.
4. **No raw colours.** Every colour and every spacing is a `var(--ui-*)` token, in a plain
   `.css` file. This is a rule you keep, not a check that enforces it: the checks below
   catch only part of it.

**Done when** the screen runs and behaves as the brief says, and you can point to the
`docs-show` passage behind every prop you pick at random (or the prop was removed).

## The start prompt

Paste this into Claude Code. It is only a start: where the agent goes wrong, and how you
steer it, is the exercise.

**Checkpoint:** before any file is written, the agent has shown you the component list and
the `docs-show` calls behind it. If it skipped that, stop it and have it start over from
rule 1.

```text
Build a "Team directory" screen with components from {{PKG}} only.

Before you write any code:
1. Call docs-list on the {{MCP}} MCP, then docs-show for every
   component you plan to use. Tell me the list first.
2. A prop, input, slot or event may be used only if it appears in the
   docs-show output (its code examples count) or in docs-show-story.
   If something you want is not documented, do not use it. Tell me.
3. docs-show prints full code for only some stories and lists the rest by
   name. If you need one of those (Sortable, Empty State), call
   docs-show-story with its id. Do not guess what a story does from its name.

The screen:
- A heading "Team directory".
- A toolbar: a search field labelled "Search people", a select labelled
  "Role" (All roles, Engineer, Designer, Manager) and a primary button
  "Invite member".
- A table of members: Name, Email, Role, Status. Status is a badge:
  active is success, invited is warning, suspended is danger.
- Pagination under the table, 5 rows per page.
- Search narrows by name or email, the role select narrows by role,
  both together. Changing a filter goes back to page 1. No match shows
  the table's own empty state.
- Data: a hard-coded array of 12 members in the component. No HTTP.

Rules:
- No hand-built element where the library has a component. Plain layout
  elements (div, h1) are fine.
- Styles go in {{CSS}} (a separate .css file), only
  var(--ui-*) tokens for colour and spacing: no hex, rgb, hsl or named
  colours, no pixel values for spacing.
- Save the screen as {{FILE}}. Then mount it so the
  app shows it instead of the Nx welcome page: {{MOUNT}}.

When you are done, list every library component you used with the
docs-list id it came from, and every prop with the docs-show line
it came from.
```

{{LINTNOTE}}

## The checks prompt

Paste this when the build time ends (16:30 on the clock, whatever the state of the screen).

```text
{{CHECKS}}
```

If the agent repairs formatting by hand, tell it: "`npm run format` is the fix for
`check:format`, and for nothing else."

## The receipts prompt

Paste this after the checks. These checks do not catch an invented name or a hand-built
element, which is why the receipts come next.

```text
You listed the components and props you used. Now check yourself against the
docs, not against memory: call docs-show again for each component and, for every
prop, input, slot and event in the code you wrote, print one line: the name, the
docs-show passage it appears in, or NOT DOCUMENTED. Remove everything marked NOT
DOCUMENTED, or tell me why you kept it.
```

## When the agent goes wrong

If it starts writing without calling `docs-list`:

```text
Stop. Do not write more code yet. Call docs-list on {{MCP}} and give me the
ids of the components you will use. Then call docs-show on each and tell me, for
every prop you plan to use, where it appears in the output.
```

If it uses an input the docs do not list:

```text
You used <INPUT> on <ELEMENT>. Show me the exact line of the docs-show or
docs-show-story output it comes from. If there is none, remove it and tell me what
you do instead.
```

If it hand-builds something the library has:

```text
<ELEMENT> is hand-built. Call docs-list and check whether the library has a
component for it. If it does, replace it with that component, using only documented
props.
```

## The time box (80 minutes)

| Minutes | What happens                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------- |
| 5       | The brief and the four rules, plus one live `docs-show` on AtlTable from the trainer. The clock starts. |
| 30      | Build. The trainer stays quiet, then walks the room.                                                    |
| 15      | Checks and receipts.                                                                                    |
| 25      | Two volunteers show their receipts. Which prop had no source, and where did the import names come from? |
| 5       | Recap question.                                                                                         |

The build ends at 16:30 on the clock. If you are stuck, paste the four things in
{{STUCK_REF}}, or see `rescue.md`.
