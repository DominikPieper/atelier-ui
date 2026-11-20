# Day 1, Block 05: a screen from Storybook, against the clock

Used in Day 1 Block 05. You build a "Team directory" screen out of components that
already exist in `{{PKG}}`. The only thing you know about those components is what the
`{{MCP}}` MCP server tells you. Nobody gives you the steps: a brief, four rules, a clock
and closing checks. Expect a screen that looks finished early. The second half of the
exercise is finding out what "finished" was never checked against.

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

**Done when** the screen runs and behaves as the brief says, you can point to the
`docs-show` passage behind every prop you pick at random (or the prop was removed), and
you have checked three lines of the agent's "not verified" list with your own eyes.

## The start prompt

Paste this into Claude Code. It is only a start. The agent may get all of it right on the
first pass; that is the harder case, because a green result nobody has looked at is still
a claim. What you check afterwards is the exercise.

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

## What nobody looked at

Paste this after the receipts. The checks are green and every prop has a source; neither
says that anyone has seen the screen work.

```text
List what you did not verify about this screen: every claim you made from
reading code or docs without running or seeing the result. One line each, with
how I can check it myself in under a minute. Do not run or change anything.
```

Pick three lines and check them yourself: `npm start`, then use the screen like a user.
Type a search that matches nothing. Combine search and role. Go to the last page, then
change a filter. Click "Invite member". Write down what you found for each of the three:
holds, does not hold, or the brief does not say.

## Finished early: a story for the screen

For the build time, when your screen runs before 16:30. A screen without a story is a
screen nothing re-checks tomorrow.

```text
Write a story for the Team directory screen, then run npm run check:stories and
report the exit code. If it is not 0, read the output, repair, and run it again.
```

Then read the story: what does it check that you would otherwise click through by hand,
and what does it still leave to you?

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

## The time box (95 minutes)

| Minutes | What happens                                                                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5       | The brief and the four rules, plus one live `docs-show` on AtlTable from the trainer. The clock starts.                                               |
| 15      | Build. The trainer stays quiet.                                                                                                                       |
| 30      | Build goes on. The trainer walks the room; a hint is a question about a `docs-show` line. Finished early: use the screen like a user, then the story. |
| 15      | Checks, receipts, then the "not verified" list; check three of its lines by hand.                                                                     |
| 25      | Two volunteers show their receipts and their list. Which line did you check, and what did you find? Where did the import names come from?             |
| 5       | Recap question.                                                                                                                                       |

The build ends at 16:30 on the clock. If you are stuck, paste the four things in
{{STUCK_REF}}, or see `rescue.md`.
