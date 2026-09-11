'use strict';

/**
 * Local ESLint flat-config plugin for this repo's own single-file
 * invariants. `nx.json` has declared `{workspaceRoot}/tools/eslint-rules/**`
 * as a lint input for every project since before this directory existed —
 * that cache-busting wiring is why a change here invalidates every lint
 * cache entry, even though no nx project actually lints these files
 * themselves (only `libs/{angular,react,vue}` and a few tooling libs have a
 * `lint` target; the repo root does not).
 *
 * Each lib's own `eslint.config.mjs` imports this and enables the rule(s)
 * relevant to what it lints (see the file-scoped comments there).
 */

module.exports = {
  meta: { name: 'atelier-eslint-rules', version: '0.0.0' },
  rules: {
    'host-attr-guard': require('./host-attr-guard'),
    'story-description-source': require('./story-description-source'),
  },
};
