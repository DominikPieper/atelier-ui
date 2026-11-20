# Day 2 prompts

Used in Day 2 Block 00 (the Definition-of-Done exercise), Block 02 (generation with plan
mode, then `docs-show` on your own component), Block 03 (what was red, is the handoff
document still true, red on purpose) and Block 04 (accessibility and the dark check). The parity prompt of Block 04 is in
`parity-prompt.md`; your handoff document is the input for all of them (an example is in
`handoff-example.md`).

## Block 00: the Definition-of-Done exercise (5 minutes)

The workspace carries a rule the agent reads every session: `CLAUDE.md`, section "Definition
of Done". The agent runs what the list names; a check that is not in the list is a check
nobody asked for. The trainer shows that once on the projector: delete one line, `/clear`,
ask again, and the check is gone.

Your part:

1. Ask: "Which commands does this workspace's Definition of Done list? Only list them."
   The answer names six.
2. Write down the one line your own team would add to this list, in the same shape: the
   command, a dash, what it proves. Think of the thing your reviews keep catching by hand.
3. Compare with your neighbour: does the line name a command that exits non-zero when it
   fails, or a wish ("the code is clean")? Only the first is a rule an agent can run.

## Block 02: generate the component

**Plan mode first.** Before pasting, press Shift+Tab until the status line shows plan mode,
paste the prompt, and read the plan: every prop in it must be a prop of your handoff
document. Only then let it build. An invented prop is cheaper to catch as a line of plan
than as a red story.

**Answer the plan's questions before you approve.** A plan usually ends with additions the
handoff document does not have (an extra output, a different role, a default) and one or
two questions. A plain "build it" approves all of them. Say yes or no to each, in words.

The prompt is short on purpose. The standing rules that hold for every component (tokens,
composition by region, a name on every icon-only control, status visible without colour,
`tags: ['autodocs']`) live in the workspace's `atelier-component` skill, with their reasons.
The prompt carries only what is true of this task.

```text
Generate the {{FRAMEWORK}} implementation of <ComponentName> with its test and
its stories, from my handoff document <path or pasted text>, not from the
Figma picture alone. Do not write any other file, except the design image the
atelier-component skill asks for.

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

## Block 02, after generation: `docs-show` on your own component (10 minutes)

Through the local Storybook MCP (`storybook-local`), once your component and its stories
render. The point: what would an agent that uses your component have to guess? The
descriptions are probably there already, because the agent wrote them while it generated.
That is why the question is an open one.

```text
Call docs-list on storybook-local, then docs-show for my component <ComponentName>.
Read the output as an agent that has never seen this component and has only this
text. List everything it would have to guess or would get wrong: a missing
description, a code snippet that would not work as shown, a value whose effect is
not stated, behaviour that is documented nowhere. Do not change anything yet.
```

Read the list before you hand it back. Which lines are a gap in the documentation, and
which are a gap in the component? Then close the first kind:

```text
Close the documentation gaps where they live: JSDoc for a missing or wrong
description, the story for a snippet that would not work as shown. Do not change
the component's behaviour. Call docs-show again and show me what changed.
```

Without the MCP, the same lookup through the CLI:

```text
npx storybook tools --config-dir workshop-{{FRAMEWORK_LC}}/.storybook --json docs show --input '{"id":"<id>"}'
```

## Block 03: green is not yet right

Block 02 most likely ended green. That says the checks passed at the end, not how they got
there. Three prompts, in this order. Your commit from the end of Block 02 is the state to go
back to. If `git status` still lists changes, commit now:
`git add -A && git commit -m "day 2 block 02: green"`.

### What was red on the way

In the same session that generated the component (after `/clear` the agent has to look for
traces in the files and finds fewer):

```text
Look back over this session. Do not run or change anything. List every check
that was red at any point while you built <ComponentName> (format, stylelint,
lint, build, unit test, story): the first error, what you changed to make it
green, and whether that change fixed the cause or went around the check. Going
around means: a disable comment, a changed rule or config, a renamed thing, a
loosened or removed assertion, a skipped test. Mark each line "fixed" or "went
around". If you no longer have the session, say so and look for the traces in
the files instead.
```

Read the "went around" lines first, then check the "fixed" ones: would you have marked
them the same way? For each line decide where the right place for the fix is. A disable
comment silences one line. A rule that is wrong for this workspace is changed in its
config, and that is a decision for a person, not for the agent. A removed assertion is a
behaviour nobody checks any more: put it back or say why it is gone. Then revise once:
either the prompt, or a line in `CLAUDE.md` that would have prevented the detour, and say
why.

### Is the handoff document still true?

The agent learned things while it built that the document did not know.

```text
Read my handoff document <path> next to the code you find for <ComponentName>.
Do not change any code. List every line of the document that is no longer true
of what was built: a token that does not exist, an assumption about a library
component that turned out wrong, a variant or state that was added or dropped.
For each one say what the code does instead. Then correct the document so that
it describes the component as built, and mark each corrected line with
"(corrected after generation)".
```

### Make it red on purpose

Now the loop the block is named after, on a change you choose. Take one variant or state
from the "Explicitly out" line of your handoff document. The story comes first, so that
the red is yours to see.

Commit before you start (`git add -A && git commit -m "day 2 block 03: corrected"`). The
corrected handoff document and your revision are then safe from the undo further down.

```text
My component is <ComponentName>, its handoff document is <path>. One thing moves
from "Explicitly out" into scope: <the variant or state>. Add it to the handoff
document first. Then write only its story with a play function that proves it,
and do not touch the component yet. Run that story (test-run through
storybook-local, or npm run check:stories when Storybook is not running) and
show me the first error exactly as the tool reports it. Do not fix anything.
```

Read the error before you go on. What did the `play` function expect, and who chose that
expectation: you, the handoff document, or the agent?

```text
Now repair from that error: one change, in the right place, then run the story
again and report the result. If it is still red after two attempts, stop and
tell me what you think the cause is.
```

After two failed repairs there is no third patch. Go back to your last commit. That
discards everything since then, in the whole workspace: the repairs, and with them the new
story and the line you added to the handoff document. Look first at what would go:

```shell
git status --short
git clean -nd -- workshop-{{FRAMEWORK_LC}}/src
```

Then undo, paste the first prompt of this section again, and diagnose from the failing
story, not from the patches:

```shell
git reset --hard HEAD && git clean -fd -- workshop-{{FRAMEWORK_LC}}/src
```

When it is green, ask what is still open: "What did this change leave undone? Do not fix
it, list it." Typical answers: the story controls do not offer the new value, lint and
build were not run again, the Figma master has no such variant. Commit when the stories
are green.

## Block 04: the accessibility check

Three steps, in order. The Desktop Bridge must be running: confirm `figma_get_status`
reports `setup.valid: true` first. Fix only the obligations tagged **(this block)** in the
brief you chose (`briefs/`), for the variant and state you actually built.

```text
Run the accessibility check on <ComponentName>, in order, and report each step's
result before moving to the next:

1. figma_audit_component_accessibility against the Figma node (needs the Desktop
   Bridge running: confirm figma_get_status reports setup.valid: true first).
   Report the score, how the tool classified the component, and which checks it
   skipped because of that classification.
2. Open the story in Storybook and read the A11y panel (axe-core): list every
   violation, not just the count.

Fix only the obligations tagged (this block) in section 4 of the brief, pasted below this
prompt, for the variant/state you actually built. Leave (full component) items as a
written note in the master's Figma description, not as code you claim passes a check
it was never exercised against.
```

Step 1 can return 100 out of 100 and still have checked little: a set the tool classifies
as "presentational" skips the focus-indicator and target-size checks. Read the
classification, not only the score.

**Step 3 is yours, by hand.** Open the story in the browser and put the mouse away: Tab,
Shift+Tab, Enter, Space, Escape. Does focus arrive where you expect, can you see it, does
activation work, does dismissal work? The agent can script this, but then you approve five
long scripts and still have not seen the focus ring.

## Block 04: the dark check

```text
Switch the theme control in Storybook's toolbar to dark (addon-themes, it sets
`data-theme="dark"`; the backgrounds control only recolours the canvas and
switches nothing) and look at <ComponentName> in the variants and states you
built. Confirm two things and report each:

1. Every colour still resolves through a `--ui-*` custom property, none
   hardcoded, so the dark values declared for `[data-theme="dark"]` take effect.
   A hardcoded colour is invisible in light mode and wrong in dark mode.
2. No control gained a `transform` on hover or press: state is a colour or
   border token swap, no shrink and no lift.
```

Then switch the toolbar yourself and look. The agent reads the stylesheet; you see whether
the text is still readable.

{{STUCK}}
