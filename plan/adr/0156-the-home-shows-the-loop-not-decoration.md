---
status: accepted
date: 2026-10-07
sources:
  - .impeccable/critique/2026-10-07T17-32-18Z__docs-src-pages.md (local critique snapshot, gitignored)
  - docs/src/components/LoopDiagram.astro
  - docs/src/pages/index.astro
  - docs/src/components/Callout.astro
  - skills/atelier-design/ui_kits/docs-site/ (landing.jsx, landing.css, README.md)
  - skills/atelier-design/references/brand-guide.md
---

# ADR-0156: The home shows the loop, not decoration, and the kit changes with it

## Status

Accepted. The docs home opens with a descriptive H1, one sentence, one primary action and
the design-to-code loop drawn as a spec sheet (`LoopDiagram`). The gradient wordmark, grid
background, glow, pulsing dot, eyebrow labels and the three pillar cards are gone. Tone on
callouts and accent cards is a full 1px tinted border, a tinted fill and the icon, never a
thick side stripe. The brand kit in `skills/atelier-design/` changes in the same commit and
stays the authority. Owner decisions of 2026-10-07. Recorded at decision time.

## Context

An Impeccable critique of the docs (2026-10-07, 27/40) judged about two thirds of the site
to be interchangeable docs scaffolding. Its detector flagged the hero for gradient text, a
grid background, a glow, a pulsing dot and a chip above the heading, and flagged seven
coloured side stripes. The design review reached the same verdict without the detector: a
site that teaches a token system never showed one, except on `/tokens`. A first-timer also
met three equal hero buttons and, further down, a fourth that competed with them.

The decoration was not an accident. It was copied from the brand kit
(`ui_kits/docs-site/landing.css`; the docs CSS cited the kit's line numbers). Changing only
the docs would have created two authorities, and the next agent that rebuilt a page "per
kit" would bring the grid back. The kit was also less authoritative than it looked: its
`index.html` linked a token sheet at a path that does not exist, so it had been rendering
unstyled.

The loop already existed twice: an inline SVG on `/design-to-code` and, by implication, the
three pillar cards on the home. A third rendering on the home would have made three copies
to keep in step.

## Decision

1. **The hero's image is content.** `LoopDiagram` renders Inspect → Contract → Generate →
   Verify with its return path. Each step shows its real artefact: the `boundVariables` keys
   the tutorial uses, the contract path, an `<atl-button>` usage and a rendered sample, and
   `figma_check_design_parity` reporting 0 discrepancies. Token names are annotated with
   leader lines, the way a spec annotates measurements. It is HTML/CSS on `--ui-*` tokens,
   reflowing by container query (four columns, two, one with a side rail) because
   `check:docs-layout` admits only four `@media` widths and the sidebar makes the viewport
   a poor proxy for space.
2. **One component, two pages.** `/design-to-code` uses `LoopDiagram` in place of its SVG.
   `WorkflowDiagram` on `/figma` stays: it depicts the Figma → Storybook → AI tool chain, a
   different thing.
3. **One action.** "Start the workshop" is the only button. "Browse components" is a text
   link. The disclaimer is one quiet sentence-case line below the loop.
4. **No eyebrows, no side stripes.** Kicker labels above headings are removed from the home.
   Callouts, the component pages' AI cards, the Storybook link cards and five page-scoped
   blocks drop their 2–4 px coloured edge. A tone is now a full 1px tinted border, a tinted
   fill and the icon. Lane identity in the `/a11y-workflow` mobile fallback is a coloured dot
   beside a text label.
5. **The kit moves in lockstep.** `landing.jsx`/`landing.css` mirror the shipped hero and
   loop. `README.md`, `SKILL.md` and `brand-guide.md` no longer prescribe a crosshair grid,
   a glow or a wordmark hero. They state the tone rule above.

## Consequences

- The first viewport at 1440×900 carries the H1, the action and the whole loop, so an
  attendee sees what the day produces before reading a word of setup.
- At a 1200 px window the four loop cards are about 160 px wide. The Inspect card then
  stacks property over token without leader lines; the annotation idea survives only in the
  Generate callouts. Nothing overflows (measured across seven container widths), but the
  spec-sheet character is weakest exactly at a common laptop width.
- The loop's artefacts are illustrative, not live output: "0 discrepancies" is not read
  from a run. The keys and token names are real.
- Rejected: keeping the kit's hero and changing only callouts and eyebrows (leaves the
  interchangeable first impression the critique scored); a text-only editorial hero (says
  nothing about the method); docs-only change with the kit left as is (two authorities, and
  the kit would re-seed the grid).
- Weakest point: the visual judgement was made by agents and one orchestrator review by
  screenshot. No attendee has seen it, and the critique re-run is still to come (step 7 in
  `tasks/todo.md`).
