# parity — drift gates you can reuse in any repo

Atelier ships the same component across three frameworks plus a spec, docs,
tokens, and an LLM index. Keeping them in sync by review does not scale, so
every kind of drift is caught by a **gate**: a script that fails CI (and the
pre-push hook) when two things that must agree have diverged.

This directory holds the one gate that is fully **repo-agnostic** —
`marker-coverage` — plus this catalogue of the pattern so you can rebuild the
rest in your own repo.

## The meta-pattern

Every gate is the same shape:

> **one source of truth → N derived projections → a `--check` gate** (often with
> a matching auto-fix), wired into **CI** and a **pre-push hook** so drift dies
> locally, before it lands.

Pick the gate type per kind of drift:

| Rule type | "These must agree" | Atelier example |
|---|---|---|
| **mirror** | file A is byte-identical to copies B, C | spec types & tokens.css copied into each framework lib |
| **dir-parity** | the same entries exist under several roots | every component dir exists in angular/react/vue |
| **file-present** | each entry ships a required sibling file | every component dir has a `*.stories.*` |
| **barrel-export** | each entry is re-exported from the public entry point | every component is in `src/index.ts` |
| **union-in-css** | each member of a typed union has a matching CSS class | spec `variant`/`size` members ↔ `.variant-*` classes |
| **value-parity** | a value extracted from N sources is equal | default of each axis prop matches across adapters + docs |
| **marker-coverage** | each manifest id is tagged in every implementation | `// @behavior <id>` in each adapter's spec |
| **generated** | a generated artifact equals a fresh regeneration | `llms.txt`, cookbook manifest (`gen … --check`) |

`mirror`, `dir-parity`, `file-present`, `barrel-export`, `generated` are a few
lines each — write them inline. `union-in-css` and `value-parity` need light
parsing (see `tools/scripts/check-variants.js`, `check-defaults.js` for
worked examples). `marker-coverage` is the one worth a shared tool — below.

## marker-coverage (the reusable tool)

A manifest maps each **subject** to behaviour **ids** every **implementation**
must cover; an implementation declares coverage by tagging a file with
`<marker> <id>`. The gate fails on any untagged (subject, id, implementation).
It enforces coverage *parity*, not correctness — the tagged tests do that. The
idea generalises past UI: API handlers, DB migrations, plugin adapters — any
"N implementations must each cover the same behaviours."

```
node tools/parity/marker-coverage.mjs <config.mjs>
```

Config (see `behavior.config.mjs`):

```js
export default {
  manifestPath: 'libs/spec/src/behaviors.json', // { subject: [{ id }, …], $comment? }
  marker: '@behavior',                           // tag token
  implementations: {                             // dir template, {subject} substituted
    angular: 'libs/angular/src/lib/{subject}',
    react: 'libs/react/src/lib/{subject}',
    vue: 'libs/vue/src/lib/{subject}',
  },
  filePattern: /\.spec\.(ts|tsx)$/,              // files scanned per dir
  label: 'behavior',
};
```

Manifest entries marked `default-is-base`-style exceptions, per-implementation
allowances, etc. are kept in the manifest / a small allowlist — see how
`check-variants.js` documents its exceptions.

## Reuse in another repo

1. Copy `tools/parity/marker-coverage.mjs` (no Atelier paths are baked in — they
   all live in the config).
2. Write a `*.config.mjs` for your subjects/implementations.
3. Add `"check:behavior": "node tools/parity/marker-coverage.mjs path/to/config.mjs"`
   to `package.json`, fold it into a `check:all` aggregate.
4. Run `check:all` from a **pre-push hook** (so drift is caught locally) and a
   **CI** step (so it is caught for everyone). Atelier's hook lives at
   `tools/git-hooks/pre-push`; install with `tools/scripts/install-hooks.sh`.
5. For the other drift kinds, add inline gates using the table above.
