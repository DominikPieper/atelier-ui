# The Figma linter prompt

Used in Day 1 Block 03 (on the master the trainer names, in your prepared duplicate) and in
Day 2 Block 01 (on your own component set, before you write the handoff document). It is
read-only: nothing is changed in the file. The Desktop Bridge must be connected.

```text
Run figma_lint_design on the node <NODE> (<MASTER NAME>) with only the rules
hardcoded-color, default-name and detached-component. Return the findings as a list:
layer, rule, message. Change nothing in the file.
```

`<NODE>`: Day 1, the master the trainer names (read its id in your duplicate, do not assume
it is the id you saw on the projector); Day 2, your own component set: select it in Figma and
say "the node I have selected" (the agent reads the id with `figma_get_selection`).

Sort each line of the result: **real** or **false alarm**. A finding is something to sort,
not a verdict. The three rules catch raw colours, layers left on default names and detached
instances. They do not see whether the design is right, nor spacing and radius. On Day 2,
fix the real findings first and note the false alarms.
