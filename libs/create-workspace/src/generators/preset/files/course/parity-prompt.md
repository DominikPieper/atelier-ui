# Parity prompt

Day 1 Block 02 compares the Settings Card with its Figma frame by eye. Day 2 Block 04 runs
`figma_check_design_parity` on your own component, which needs the Figma Desktop Bridge
connected.

## Day 1 Block 02: the Settings Card, by eye

Do it after lint and build are green: the comparison with Figma is the judgement-heavy last
step, so do not spend it on a component that fails lint or build. Put the rendered card next
to the "Settings / Card" frame in Figma (node `936:2954` on the Workshop-Templates page of
the original file; ids differ in your duplicate).

1. Write down every difference you can see: spacing, colour, type, an element that is
   missing or extra, a state. Five minutes, no tool.
2. Label each one **code** (the code should change) or **Figma** (the frame should change).
   A long list: label the three largest.
3. Hand the code ones back to the agent:

```text
The settings card differs from its Figma frame in these points:
<your list>. Fix only these. Do not change anything else.
```

A difference that fits neither label (someone chose it on purpose) is parked: "not code, not
Figma, we name it on Day 2", and is not "fixed" in code.

The tool that automates part of this comparison comes on Day 2. It compares what it is
handed, so the eye stays the first check.

## Day 2 Block 04: your own component

The node id comes from your handoff document.

```text
Run figma_check_design_parity on the node <NODE FROM THE HANDOFF DOCUMENT> against my
component <ComponentName>. For each discrepancy, say whether it is **code** (the code
should change), **Figma** (the master should change) or **kept on purpose**, and why. Only
call it "kept on purpose" if the handoff document's "Deliberate differences" section
names it. Do not fix anything yet.
```

A quiet report is not a clean component: what the call does not compare, it does not report.
Afterwards you sort every difference: code (hand it back to Claude), Figma (a note for the
designer) or kept on purpose (it must be in the handoff document's "Deliberate differences").

Without the bridge there is no parity call: compare by eye the way you did on Day 1.
