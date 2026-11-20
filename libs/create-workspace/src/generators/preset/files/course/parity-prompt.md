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

4. Compare again after the fix, point by point. "All fixed" is the agent's sentence; the
   frame next to the card is the check. A difference that is still there goes back with the
   exact value from Figma (which side, how many pixels, which token).

A difference that fits neither label (someone chose it on purpose) is parked: "not code, not
Figma, we name it on Day 2", and is not "fixed" in code.

The tool that automates part of this comparison comes on Day 2. It compares what it is
handed, so the eye stays the first check.

## Day 2 Block 04: your own component

The node id comes from your handoff document.

```text
Run figma_check_design_parity on the node <NODE FROM THE HANDOFF DOCUMENT> against my
component <ComponentName>. Sort every discrepancy into one of four: **code** (the code
should change), **Figma** (the master should change), **kept on purpose** (only if the
handoff document's "Deliberate differences" section names it) or **tool artefact** (the
tool compared two things that are not the same thing, so there is no difference to fix;
say what it compared). Give the reason in one line each. Then list what the tool did not
compare at all. Do not fix anything yet.
```

Expect a low score and a short real list. The tool marks every finding as a code change;
the sorting is the work. Typical artefacts: a resolved hex on the Figma side against a
`var(--ui-*)` string on the code side, the bounding box of the whole variant set against
one element, a property reported as missing on both sides because Figma's name carries an
`#id` suffix. Check two of the "tool artefact" lines yourself before you believe them: an
artefact label is also a way to make a real difference disappear.

A quiet report is not a clean component: what the call does not compare, it does not report.
Afterwards you own every line: code (hand it back to Claude), Figma (a note for the
designer), kept on purpose (it must be in the handoff document's "Deliberate differences")
or tool artefact (nothing to fix, and you can say what was compared with what).

Without the bridge there is no parity call: compare by eye the way you did on Day 1.
