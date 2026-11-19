# Parity prompt

Used in Day 1 Block 02 (the Settings Card) and Day 2 Block 04 (your own component). It
compares the code against the Figma master through `figma_check_design_parity`, so it needs
the Figma Desktop Bridge connected. Without the bridge there is no parity call: sort the
list you made in Day 1 Block 02 instead.

## Day 1 Block 02: the Settings Card

Run it after lint and build are green: the comparison with Figma is the expensive,
judgement-heavy last step, so do not spend it on a component that fails lint or build.
The settings card node is the "Settings / Card" frame (node `936:2954` on the Workshop-Templates page of the original file; ids differ in your duplicate, so select the frame in Figma and say "the node I have selected").

```text
Run figma_check_design_parity on the settings card node
against the component I just generated. For each discrepancy, say whether the
code or the Figma master should change, and why. Fix only the code ones.
```

Two labels only: **code** or **Figma**. A long list: label the three largest. A difference
that fits neither (someone chose it on purpose) is parked: "not code, not Figma, we name it on
Day 2", and is not "fixed" in code.

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
