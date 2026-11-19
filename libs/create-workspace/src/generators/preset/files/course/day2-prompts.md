# Day 2 prompts

Used in Day 2 Block 00 (the Definition-of-Done exercise), Block 02 (generation with plan mode, then `docs-show` on your own component) and Block 04 (accessibility).
The parity prompt of Block 04 is in `parity-prompt.md`; your handoff document is the input
for all of them (an example is in `handoff-example.md`).

## Block 00: the Definition-of-Done exercise (10 minutes)

The workspace carries a rule the agent reads every session: `CLAUDE.md`, section "Definition
of Done". Four steps:

1. Ask: "Which commands does this workspace's Definition of Done list? Only list them."
   The answer names six.
2. Delete this exact line from the list in `CLAUDE.md` and save. Leave the count word
   ("all six") as it is:

   ```text
   - `npm run check:stories` — every story, rendered in Chromium, axe-checked
   ```

3. `/clear`, ask the same question again. The list now names five; `check:stories` is gone.
4. Put the line back (undo) and save.

The agent runs what the list names; a check that is not in the list is a check nobody asked
for. Stretch: write down the one line your own team would add to this list, the command and
what it proves.

## Block 02, part 1: `docs-show` on your own component (10 minutes)

Through the local Storybook MCP (`storybook-local`), once your component and its stories
render. The point: what would an agent that uses your component have to guess?

```text
Call docs-list on storybook-local, then docs-show for my component <ComponentName>.
List what an agent using this component would have to guess: a missing component
description, a property without a description, a value set shown as a bare alias. Do not
change anything yet.
```

Then:

```text
Add the JSDoc that closes those gaps: a description for the component and one line per
property. Call docs-show again and show me what changed.
```

Without the MCP, the same lookup through the CLI:

```text
npx storybook tools --config-dir workshop-{{FRAMEWORK_LC}}/.storybook --json docs show --input '{"id":"<id>"}'
```

## Block 02: generate the component

**Plan mode first.** Before pasting, press Shift+Tab until the status line shows plan mode,
paste the prompt, and read the plan: every prop in it must be a prop of your handoff
document. Only then let it build. An invented prop is cheaper to catch as a line of plan
than as a red story.

The prompt is short on purpose. The standing rules that hold for every component (tokens,
composition by region, a name on every icon-only control, status visible without colour,
`tags: ['autodocs']`) live in the workspace's `atelier-component` skill, with their reasons.
The prompt carries only what is true of this task.

```text
Generate the {{FRAMEWORK}} implementation of <ComponentName> with its test and
its stories, from my handoff document <path or pasted text>, not from the
Figma picture alone. Do not write any other file.

The handoff document's "Deliberate differences" are given constraints, not
mistakes to correct: where the code differs from the design on purpose, build
it that way.

Every prop name matches the handoff document's sections one-for-one: add no
prop and rename no prop. Follow the atelier-component skill for tokens,
composition, accessibility and stories. If a requirement has no natural
mapping onto what you are generating, ask instead of inventing a workaround.
When you are done, run the Definition of Done checks from CLAUDE.md (the ones /verify runs) and
report each exit code.
```

## Block 04: the accessibility check

Three steps, in order. The Desktop Bridge must be running: confirm `figma_get_status`
reports `setup.valid: true` first. Fix only the obligations tagged **(this block)** in the
brief you chose (`briefs/`), for the variant and state you actually built.

```text
Run the three-step accessibility check on <ComponentName>, in order, and report each
step's result before moving to the next:

1. figma_audit_component_accessibility against the Figma node (needs the Desktop
   Bridge running: confirm figma_get_status reports setup.valid: true first).
2. Open the story in Storybook and read the A11y panel (axe-core): list every
   violation, not just the count.
3. Keyboard-walk the rendered component yourself: Tab, Shift+Tab, Enter, Escape: does
   focus order, activation and dismissal all work with no mouse?

Fix only the obligations tagged (this block) in section 4 of the brief, pasted below this
prompt, for the variant/state you actually built. Leave (full component) items as a
written note in the master's Figma description, not as code you claim passes a check
it was never exercised against.
```

{{STUCK}}
