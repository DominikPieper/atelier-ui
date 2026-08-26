---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0041-control-height-is-the-primitive.md (the defect this gate would have caught)
  - tasks/design-findings-2026-08-26.md
---

# ADR-0042: A gate that measures rendered geometry

## Status

Accepted. `check:geometry` joins `check:all`, which now requires a browser in
the two CI jobs that run it.

## Context

ADR-0041 fixed a control that rendered 46px while claiming 40, and a size step
that rendered 48.5 while claiming 48. The interesting part is not the arithmetic;
it is that **the defect was invisible to a fully green suite for months**.

Twenty-one gates, and none of them measures a box:

- `check:css-tokens` proves a value came from a token, never what it renders to.
- `check:a11y-parity` compares accessibility trees, which carry no geometry.
- `check:parity` does compare geometry — against Figma, by hand, per component,
  with a live bridge and a hand-authored `codeSpec`. It never ran between April
  and today.
- The unit tests render components and assert behaviour, never dimensions.
- `check:figma` reads a committed snapshot of the *design*, not the code's output.

So the library could state a control height in a token, render something else,
and every signal stayed green. An input sat 6px taller than the button beside it
in every form, in all three frameworks, and nothing said so.

## Decision

**A gate renders every control that claims a `--ui-control-height-*` token and
asserts the box it produces is the height it claims.**

A real browser does the measuring. Computing the box model in Node would be the
same mistake the contrast checker made with its hardcoded palette — a second copy
of the truth, free to drift from the first. `check:contrast` was rewritten to read
the token source for exactly that reason (ADR-0037), and the same logic applies
harder here: layout is the browser's answer, not ours.

**The roster is discovered, and disagreement is an error in both directions.** Any
component stylesheet referencing a `--ui-control-height-*` token must appear in
the gate's `CONTROLS` table, and every entry there must still reference one. So a
control that migrates onto the token without being registered fails, and an entry
left behind after a control moves away fails too. That is the same
derive-the-roster convention as ADR-0034, and it makes the remaining control
migration self-gating: adding the token to a select forces the select into the
gate.

**Markup stays hand-written.** Only the component knows which element carries its
height — `.atl-button` is the button, but the input's height lives on
`.atl-input input`, two levels in. Deriving that from the source would be
guessing; the table states it, and a broken selector is a `[MARKUP]` failure
rather than a silent pass.

**Tolerance is 0.5px.** Sub-pixel rounding is not a defect. Six pixels is.

Alternatives considered:

- **Hang it on the Storybook browser-mode harness.** Rejected: that harness fails
  whenever `CI` is set (tracked as B4, with a repro), so the gate would not run
  where it matters. Plain Playwright avoids the vitest browser-session machinery
  entirely.
- **Keep it out of `check:all`** and give it its own CI job, so the other gates
  stay browser-free. Rejected: the `checks` job comment says the gate list is
  single-sourced from `check:all`, and a release gated by `check:all` would
  otherwise ship geometry regressions. One list, one browser install, in the two
  jobs that run it.
- **Skip gracefully when no browser is present.** Rejected outright. A gate that
  silently skips is the failure mode this whole record exists to close; it exits
  non-zero and says to run `playwright install chromium`.

## Consequences

- **The original defect is reproducibly caught.** Restoring the input's authored
  padding makes the gate fail with `renders 46px but --ui-control-height-md claims
  40px (off by 6.00px)` and names the remedy. Verified, along with the `[ROSTER]`
  and `[MARKUP]` paths.
- **`check:all` now needs a browser**, which is a real cost: a
  `playwright install --with-deps chromium` step in the `checks` job and in
  publish's `verify` job. Accepted, because the alternative was a second gate
  list.
- **Coverage is honest and small: four control sizes across two components.**
  Everything else still authors its padding and is not measured — the gate reports
  what it measured rather than implying more.
- **The CI leg works** (verified 2026-08-26, run 32967483005, commit `0ce4fe9`):
  `Sync checks` installs chromium and the gate reports
  `every control renders the height its token claims` in 2.6s. Publish's `verify`
  job runs the same list, so a release is gated on it too.
- **That also narrows B4.** Plain Playwright driving a `file://` fixture is fine on
  the runner, while vitest browser mode fails there with `CI` set. So B4 is not
  "browsers do not work in CI" — it is specific to how vitest's browser provider
  has the served page connect back to its server. Next diagnosis should start
  there, not at the browser.
- **This closes the class, not the instance.** Any future control whose padding
  drifts from its height fails here, in every framework, without anyone opening
  Figma.
