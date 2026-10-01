# P1 CSS spikes (throwaway code, kept for reference)

Saved verbatim on 2026-10-01 from the session scratchpad at the owner's request, as the
starting point for P1.4 (the real generator). **Not maintained, not linted, not formatted**
(listed in `.prettierignore`); paths inside may still point at the original scratchpad.

- `inventory/` — the P1.0 normalizers behind `tasks/p1-css-inventory-2026-10-01.md`
  (`normalize.js` naive `:host` rewrite, `smart.js` rule-aware pass, `audit.js`
  `:host-context` / unscoped-rule audit, `drawer-probe.js` the Playwright probe).
- `generator/` — the P1.1 prototype behind `tasks/p1-1-spike-2026-10-01.md`. `gen.js` +
  `config.js` turn Angular `:host` CSS into class-rooted CSS; `FORCEPREFIX=1` applies the
  prefix-everywhere policy, `NODOM=1` drops the DOM escape hatches. The other scripts are
  the side-effect and rename analyses.

Run from the repo root after `mkdir tasks/spikes/p1-css/generator/out` (gitignored), e.g.
`node tasks/spikes/p1-css/generator/gen.js button`. Output
directories (`out/`) were not kept.
