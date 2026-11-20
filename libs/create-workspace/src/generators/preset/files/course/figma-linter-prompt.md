# Figma prompts: the pink test and the linter

Used in Day 1 Block 03 and Day 2 Block 01. The Desktop Bridge must be connected. Everything
here happens in your prepared duplicate of the Figma file, never in the original.

## The pink test (Day 1 Block 03)

The pink test answers one question: which colours of a master are bound to a variable, and
which are painted on? It sets every colour variable to one loud pink in a mode of its own;
whatever is not pink afterwards is not bound. By hand that is more than a hundred variables,
so the agent does it. **This prompt writes to your duplicate**: it adds a mode and a test
frame. The second prompt, in the micro-exercise, removes the mode again.

```text
Run the pink test on the AtlButton master (Inputs/AtlButton on the Components
page): in the Library Tokens collection add a third mode "Pink Test", set every
colour variable to #ff00c8 in that mode, put a test frame with one instance of
every AtlButton variant on the Workshop-Templates page and set the frame to the
Pink Test mode. Show me a screenshot and tell me what did not turn pink.
```

Look at the screenshot before you read the answer. What stayed its own colour? Say it as a
sentence: "this fill is not bound to a variable".

For the micro-exercise at the end of the block, the repair on a copy:

```text
Fix that binding on a copy of the master, not on the master itself: copy the
variant that did not turn pink into the test frame's section, bind its fill to
the variable its sibling variants use, and show me the pink test on the copy.
Then delete the Pink Test mode again.
```

If you do not get to the micro-exercise, clean up with one line: "Delete the Pink Test mode
again."

If your Figma plan does not allow another variable mode, the agent cannot add one: watch
the trainer's run instead and do the repair by hand in the variable picker.

## The linter (Day 1 Block 03 and Day 2 Block 01)

On Day 1 on the master the trainer names, on Day 2 on your own component set, before you
write the handoff document. This one is read-only: nothing is changed in the file.

```text
Run figma_lint_design on the node <NODE> (<MASTER NAME>) with only the rules
hardcoded-color, default-name and detached-component. Return the findings as a list:
layer, rule, message. Change nothing in the file.
```

`<NODE>`: Day 1, the master the trainer names (read its id in your duplicate, do not assume
it is the id you saw on the projector); Day 2, your own component set: select it in Figma
with Claude Code already running and say "the node I have selected" (the agent reads the id
with `figma_get_selection`). A selection made before the session started is not seen: if
the agent reports that nothing is selected, click the set again.

Sort each line of the result: **real** or **false alarm**. A finding is something to sort,
not a verdict. The three rules catch raw colours, layers left on default names and detached
instances. They do not see whether the design is right, nor spacing and radius. On Day 2,
fix the real findings first and note the false alarms.

On your own set, expect `default-name` findings on `Vector` layers inside icon instances.
Those layers belong to the library's icon, not to you: false alarm, note it and move on. A
list with no finding of your own is not proof of a clean set. Three rules ran; nobody has
checked spacing, radius or structure.
