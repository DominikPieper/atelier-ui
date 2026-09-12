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
// Two override *scopes* below — component CSS (split three ways, one per
// framework) and docs — because the two rules' declared-token source
// differs by scope (see `no-undeclared-token.js`'s header): component CSS
// is checked only against the shared `tokens.css`; the docs site's CSS is
// checked against that file UNION `docs/src/styles/docs-theme.css`.
// `no-primitive-token` and `no-token-bypass` (stage 2 of the CSS-discipline
// port) are wired ONLY on the component-CSS blocks, never the docs ones —
// the token tiers they enforce (ADR-0018/0036/0038) and the token-family
// bypass check (ADR-0047) are both about component stylesheets; the docs
// app is a token *consumer* like any other product surface, same scoping
// the retired check-primitives.js/check-token-bypass.js scripts used.
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import atelier from './tools/stylelint-rules/index.js';

// Frameworks are discovered from the filesystem, not enumerated by hand: any
// `libs/<name>/src/lib` directory is a component library and gets its own
// override block below. A hand-typed list of three (angular/react/vue) would
// silently drop a fourth such library from every one of the four rules below
// the day it's added — its CSS would match none of the per-framework
// overrides, fall through to the empty top-level `rules: {}`, and lint clean
// with nothing checked (2026-09-12 stylelint review, claim 1, reproduced:
// a fixture `libs/probeframework/src/lib/**/*.css` with a raw color literal,
// an undeclared token AND a token bypass in it — three violations any real
// framework library would be flagged for — lints 0 problems, exit 0, under
// the old three-name array). Reading `libs/` costs one `readdirSync` plus one
// `existsSync` per entry at config-load time (under a millisecond, measured
// — negligible next to the seconds a stylelint run itself takes), and this file
// is already a declared `stylelint` target input (see `nx.json`), so a change
// in which libraries exist re-evaluates on the next run the same way any
// other edit to this file does. Today this resolves to exactly
// `['angular', 'react', 'vue']`, sorted — the same three blocks the old
// hardcoded array produced, in the same order.
const CONFIG_DIR = dirname(fileURLToPath(import.meta.url));
const LIBS_DIR = join(CONFIG_DIR, 'libs');
const FRAMEWORKS = readdirSync(LIBS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(join(LIBS_DIR, name, 'src', 'lib')))
  .sort();

// This file lives outside every project that reads it here (the four
// `stylelint` Nx targets, in libs/{angular,react,vue}/project.json and
// docs/project.json), so it is not covered by any project's own `^default`
// input glob. `nx.json`'s `stylelint` target-default block lists it as an
// explicit input — omitting that would let a change here serve a stale
// cached pass instead of the `[UNDECLARED]` failures it should produce.
const TOKENS_CSS =
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css';
const DOCS_THEME_CSS = 'docs/src/styles/docs-theme.css';
// Read by `no-primitive-token`/`no-token-bypass` via their `allowlistsFile`
// secondary option (a scaffolded workspace passes neither rule this option
// at all — it has no allowlists.js and starts with zero exemptions; see
// those rules' own headers for the documented empty-map default).
const ALLOWLISTS = 'tools/scripts/lib/allowlists.js';

export default {
  plugins: [atelier],
  // Stylelint requires a top-level `rules` object even when every rule is
  // actually turned on per-scope below in `overrides` — left empty on
  // purpose, so a CSS file matched by none of the overrides (there is none
  // today, but a future one would) is linted with no rules rather than
  // erroring.
  rules: {},
  overrides: [
    // One block per discovered framework (see `FRAMEWORKS` above), not one
    // shared `libs/*/src/lib/**/*.css` glob, because `no-primitive-token`/
    // `no-token-bypass` need an explicit `componentRoot` to know which tree
    // to scan for staleness — the config declares that (the way `tokenFiles`
    // already declares which token source(s) apply) instead of the rule
    // pattern-matching the input file's own path to guess which framework
    // tree it belongs to. Each Nx `stylelint` target already only ever hands
    // stylelint that one framework's files (see project.json), so this
    // split changes nothing about which files get linted — only makes the
    // topology each block already implied explicit.
    ...FRAMEWORKS.map((fw) => {
      const componentRoot = `libs/${fw}/src/lib`;
      return {
        files: [`${componentRoot}/**/*.css`],
        rules: {
          'atelier/no-raw-color-literal': true,
          'atelier/no-undeclared-token': [true, { tokenFiles: [TOKENS_CSS] }],
          'atelier/no-primitive-token': [
            true,
            { componentRoot, allowlistsFile: ALLOWLISTS },
          ],
          'atelier/no-token-bypass': [
            true,
            {
              componentRoot,
              tokenFile: TOKENS_CSS,
              allowlistsFile: ALLOWLISTS,
            },
          ],
        },
      };
    }),
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
