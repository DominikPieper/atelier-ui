# Day 2 prompts

Used in Day 2 Block 00 (the Definition-of-Done exercise), Block 01 (make your component set
machine-readable, then the API rules), Block 02 (generation with plan mode, `docs-show` on
your own component, then look at both), Block 03 (what was red, is the handoff document
still true, red on purpose) and Block 04 (accessibility and the dark check). The parity
prompt of Block 04 is in `parity-prompt.md`; from Block 02 on, your handoff document is the
input for all of them (an example is in `handoff-example.md`).

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

## Block 01: make your component set machine-readable

You drew the set by hand from the starter frame. The agent does not draw it again: it binds,
structures and describes what is there. Select your component set in Figma with Claude Code
already running (a selection made before the session started is not seen: if the agent
reports that nothing is selected, click the set again).

```text
Read course/briefs/<your brief>.md and course/briefs/README.md. My component
set is the node I have selected in Figma. I drew it by hand: do not redraw it
and do not change how it looks. Use the figma-workspace-architect skill and
make it machine-readable: bind every fill, stroke, radius, padding and gap to a
Library Tokens variable, put Auto Layout on every frame that has children, add
the component properties the brief's scope names, and write the master's
description: what is out of scope and the (full component) accessibility
obligations. Then check it in Dark mode, take a screenshot, switch back to
Light, and tell me everything you changed and everything you could not bind.
```

Read the "could not bind" list before you go on. A value with no variable (a gap of 7 where
the scale has 4 and 8) is yours to decide: move it onto the scale, or keep it and write it
into the handoff document. Then compare the screenshot with what you drew: did it stay your
drawing?

If your drawing is not there yet, let the agent build from the starter and catch up by
reading what it built:

```text
Read course/briefs/<your brief>.md and course/briefs/README.md. In my Figma
file, on the Workshop-Templates page, copy the starter frame the brief names
and build my component set from the copy, in the brief's scope for the
90-minute block. Use the figma-workspace-architect skill. Bind every fill,
stroke, radius, padding and gap to a Library Tokens variable, use Auto Layout
on every frame with children, add the component properties the scope names,
and write the master's description: what is out of scope and the (full
component) accessibility obligations. Put it into its own section next to the
starters and do not touch the starter itself. Then check it in Dark mode, take
a screenshot, switch back to Light, and tell me the node id of the component
set and everything you could not bind.
```

Then select the set the agent built: every prompt from here on works on your
selection.

Next is the linter on your own set: the prompt is in `figma-linter-prompt.md`.

## Block 01: the API rules, before you write a prop name

The handoff document fixes the names and values the code will carry, so they are checked
first. Four rules for an API an agent can use without guessing:

1. **Predictable names.** The same thing has the same name as in the rest of the library
   (`variant`, `size`, `disabled`), not a synonym.
2. **Literal unions.** The allowed values are a short list (`'success' | 'danger'`), not
   free text and not a number that means something.
3. **Composition instead of configuration.** A region that can hold anything is a slot, not
   a growing pile of Boolean properties.
4. **No hidden defaults.** Every default is visible in the API; nothing depends on a value
   that is written down nowhere.

```text
List each property of the component set I have selected in Figma with its name
and its values. Check the list against these four rules: predictable names (as
in the rest of the library), literal unions (the allowed values as a list, not
free text), composition instead of configuration, no hidden defaults (every
default is visible in the API). For each rule say what you would rename or
change and why. Where my brief (course/briefs/<your brief>.md) fixes a name
that breaks a rule, say so. Do not rename anything yet.
```

Decide each line yourself: rename it in Figma now, or keep the brief's name and write the
reason into the "Deliberate differences" of your handoff document. Expect few renames: the
brief fixes most names. The find is the place where a fixed name breaks a rule. The result
is the property list your handoff document takes over.

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

## Block 02: look at both (10 minutes, no prompt)

The checks are green. Nobody has looked yet. Put Storybook next to your Figma component set
and go through every variant and state you built, one by one. This is by hand on purpose:
it is the only step that finds what a green check does not measure.

1. Same variant, same state, side by side: spacing, radius, colour, text size, icon.
2. Press Tab once. Is the focus ring there, and does it keep its distance from the content?
3. Compare the width. Does the component have the size the design gives it, or does it
   take the width of whatever holds it?
4. If your design has a shadow or a thin border: can you see it in the story?

Write every difference down as a list, one line each: where, what the design shows, what the
story shows. Do not sort and do not fix: Block 04 sorts the list (a wanted difference, a
defect in the code, or a gap in the design). An empty list after two minutes means you
looked at one variant.

Then commit (`git add -A && git commit -m "day 2 block 02: green"`) and **leave this Claude
Code session open over lunch**: Block 03 starts in it.

## Block 03: green is not yet right

Block 02 most likely ended green. That says the checks passed at the end, not how they got
there. Three prompts, in this order. Your commit from the end of Block 02 is the state to go
back to. If `git status` still lists changes, commit now:
`git add -A && git commit -m "day 2 block 02: green"`.

### What was red on the way

In the same session that generated the component (after `/clear` the agent has to look for
traces in the files and finds fewer). If the session was closed, start Claude Code in the
workspace folder with `claude --continue`: that resumes the last session there.

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

The list is the agent's account of itself. Hold two commands against it, in a second
terminal in the workspace folder:

```shell
git show --stat HEAD
git grep -nE "eslint-disable|stylelint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|\.skip\(|\.only\(|(^|[^e])xit\(|xdescribe\(" -- workshop-{{FRAMEWORK_LC}}/src
```

The first shows every file the Block 02 commit touched (if you committed a second time
just now, that commit is one back: `git show --stat HEAD~1`). A file outside
`workshop-{{FRAMEWORK_LC}}/src` and `course/`, above all a config (`eslint.config.mjs`,
`stylelint.config.mjs`, a `tsconfig`, a `project.json`), is a changed rule. The second finds
disable comments and skipped tests. Is every hit on the agent's list? Neither command finds
a renamed selector or a removed assertion: for those you have only the list and your own
reading of the diff.

Read the "went around" lines first, then check the "fixed" ones: would you have marked
them the same way? For each line decide where the right place for the fix is. A disable
comment silences one line. A rule that is wrong for this workspace is changed in its
config, and that is a decision for a person, not for the agent. A removed assertion is a
behaviour nobody checks any more: put it back or say why it is gone. Then revise once:
either the prompt, or a line in `CLAUDE.md` that would have prevented the detour, and say
why.

### Is the handoff document still true?

The agent learned things while it built that the document did not know. Two prompts, and a
decision of yours between them. First the list, nothing else:

```text
Read my handoff document <path> next to the code you find for <ComponentName>.
Do not change any code and do not change the document yet. List every line of
the document that is no longer true of what was built: a token that does not
exist, an assumption about a library component that turned out wrong, a variant
or state that was added or dropped. Number the list. For each line say what the
code does instead, and whether you would correct the document or the code.
```

Decide each number yourself: is the document wrong, or is the code wrong? A document that
is rewritten to match whatever was built stops being a specification. Where the code is
wrong, the line stays and the fix is a repair of the code, one change at a time. Where the
document is wrong, hand back only those numbers:

```text
Correct the handoff document for the numbers <numbers> of your list, and only
those: describe what was built, and mark each corrected line with "(corrected
after generation)". Do not change any code.
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

**Measure the target size, if your brief names one.** A minimum target (24 × 24 px on a
remove or close button) is measured by none of the steps above: the Figma audit skips it for
a set it calls "presentational", axe does not check it, and parity compares the outer box of
the whole set. In the browser: right-click the control, Inspect, select the `<button>`
itself in the Elements panel (the click often lands on the icon inside it) and read the size
of its box. In Figma: select the control's frame and read W and H in the Design panel. Both
at least 24 × 24, or it is a finding.

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
