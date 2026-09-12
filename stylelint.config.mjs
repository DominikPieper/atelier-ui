// This repo's own CSS-discipline rules only (`tools/stylelint-rules/`) — no
// `stylelint-config-standard` or any other base config. Stylelint 16+ ships
// no built-in formatting/stylistic rules at all (they were split out to the
// separate, opt-in `@stylistic/stylelint-plugin`, which this repo does not
// install), so there is nothing here that could fight Prettier — no
// `stylelint-config-prettier` compatibility shim is needed, and installing
// one (last published 2023, predating that split) would just add a
// dependency that disables rules this config never enables in the first
// place.
//
// Two override blocks below, one per scope, because the two rules' declared
// -token source differs by scope (see `no-undeclared-token.js`'s header):
// component CSS is checked only against the shared `tokens.css`; the docs
// site's CSS is checked against that file UNION `docs/src/styles/docs-theme.css`.
// `no-primitive-token` and `no-token-bypass` (stage 2 of the CSS-discipline
// port) are wired ONLY on the component-CSS block, never the docs ones —
// the token tiers they enforce (ADR-0018/0036/0038) and the token-family
// bypass check (ADR-0047) are both about component stylesheets; the docs
// app is a token *consumer* like any other product surface, same scoping
// the retired check-primitives.js/check-token-bypass.js scripts used.
import atelier from './tools/stylelint-rules/index.js';

// This file lives outside every project that reads it here (the four
// `stylelint` Nx targets, in libs/{angular,react,vue}/project.json and
// docs/project.json), so it is not covered by any project's own `^default`
// input glob. `nx.json`'s `stylelint` target-default block lists it as an
// explicit input — omitting that would let a change here serve a stale
// cached pass instead of the `[UNDECLARED]` failures it should produce.
const TOKENS_CSS =
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css';
const DOCS_THEME_CSS = 'docs/src/styles/docs-theme.css';

export default {
  plugins: [atelier],
  // Stylelint requires a top-level `rules` object even when every rule is
  // actually turned on per-scope below in `overrides` — left empty on
  // purpose, so a CSS file matched by none of the overrides (there is none
  // today, but a future one would) is linted with no rules rather than
  // erroring.
  rules: {},
  overrides: [
    {
      files: ['libs/*/src/lib/**/*.css'],
      rules: {
        'atelier/no-raw-color-literal': true,
        'atelier/no-undeclared-token': [true, { tokenFiles: [TOKENS_CSS] }],
        'atelier/no-primitive-token': true,
        'atelier/no-token-bypass': true,
      },
    },
    {
      files: ['docs/src/styles/global.css'],
      rules: {
        'atelier/no-raw-color-literal': true,
        'atelier/no-undeclared-token': [
          true,
          { tokenFiles: [TOKENS_CSS, DOCS_THEME_CSS] },
        ],
      },
    },
    {
      files: ['docs/src/components/*.astro'],
      customSyntax: 'postcss-html',
      rules: {
        'atelier/no-raw-color-literal': true,
        'atelier/no-undeclared-token': [
          true,
          { tokenFiles: [TOKENS_CSS, DOCS_THEME_CSS] },
        ],
      },
    },
  ],
};
