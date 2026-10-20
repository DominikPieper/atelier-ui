---
status: accepted
date: 2026-10-20
sources:
  - tools/scripts/lib/purpose-description.js
  - tools/storybook/purpose-docgen-worker.mjs
  - tools/scripts/check-manifests.js
  - libs/angular/.storybook/main.ts
  - libs/react/.storybook/main.ts
  - libs/vue/.storybook/main.ts
---

# ADR-0176: The Storybook manifest description starts with the metadata purpose, prepended at build time

## Status

Accepted. Recorded at decision time.

## Context

`metadata.purpose` (`libs/spec/src/metadata/*.metadata.ts`) is the owned one-sentence description
of a component. Since commit `5b4b5b00` the docs site, the gallery and `llms-full.txt` read it, and
ADR-0174's knowledge JSON projects it. Humans in the Storybook Docs tab see it too, because every
story meta sets `parameters.docs.description.component` to it (enforced by the
`story-description-source` lint rule) and the Docs block prefers that parameter.

AI agents never saw it. Querying the Storybook MCP on 2026-10-20 (R-221) showed that
`docs-list`/`docs-show` print the description from the components manifest, and the manifest takes
it from docgen: the class JSDoc in Angular, the component JSDoc in React, nothing at all in Vue.
None of the 24 Angular and 22 React JSDoc first sentences matched `purpose`; React's AtlButton still
said "A versatile button component…", the text `5b4b5b00` had replaced on the docs site; all 32 Vue
entries had no description. The lint rule policed text no agent reads.

A throwaway spike (2026-10-20, discarded worktree) tested the build-time route: React's manifest
can be rewritten in a user `experimental_manifests` preset, but Angular and Vue run in
docgen-server mode, where that hook sees an empty component map; for them the working hook is
`experimental_docgenProvider`, a middleware worker wrapping the framework's docgen payload.

## Decision

1. The manifest description of every component with metadata **starts with its `purpose`**,
   followed by a blank line and the original docgen description when there is one (prepend, not
   replace). Angular's usage examples in the JSDoc stay visible; the 90-character `docs-list` line
   shows the purpose.
2. **React** uses `experimental_manifests` in `libs/react/.storybook/main.ts`; **Angular and Vue**
   append an `experimental_docgenProvider` worker (`tools/storybook/purpose-docgen-worker.mjs`).
   One shared helper (`tools/scripts/lib/purpose-description.js`) does the join (spec name with
   `Spec`/`Options` stripped → component name) and the prepend, and is unit-tested.
3. The helper reads `purpose` from ADR-0174's generated per-component JSON
   (`docs/public/.well-known/components/<slug>.json`), which `check:knowledge` already keeps in
   sync with the metadata. No new generator, and no parsing of `.ts` in the worker thread.
4. `check:storybook-manifests` gains `[NO-PURPOSE]`: in all three built manifests, every
   component with metadata must have a description that starts with its purpose, and each
   metadata file's main component must be present. Without the hooks the gate reports 82
   findings; with them it passes.

Rejected:

- **Gate the JSDoc first sentence against `purpose`** (rewrite ~70 JSDoc blocks, add a gate): the
  sentence would live in two places and the gate would only police the drift; Vue would still need
  new JSDoc everywhere.
- **Make the JSDoc the owner and drop `purpose`** (the direction ADR-0121 sketched): reverses
  `5b4b5b00` and ADR-0174's inputs, touches every generator and the docs data; largest change.
- **Replace instead of prepend**: loses the usage examples agents use (AtlTable's is part of Day 1
  Block 05, ADR-0175).
- **Regex-parse the metadata `.ts` files in the worker** (what the spike did): fragile; the
  generated JSON already exists and is gated.

## Consequences

- Agents in all three frameworks now read the same owned sentence humans read; Vue entries have a
  description for the first time. `AGENTS.md`, `/storybook-readiness` and `/screen-from-storybook`
  say so, and `/storybook-readiness` presents the hook as one way a customer can do the same.
- `story-description-source` still enforces `parameters.docs.description.component` = `purpose`
  for the Docs tab; it is no longer the only route by which `purpose` reaches readers.
- Both hooks are experimental and pinned to Storybook 10.6.0; a bump can break them silently, which
  is why `[NO-PURPOSE]` reads the built manifests rather than trusting the hooks.
- The Storybook build now depends on the generated knowledge JSON being current; `check:knowledge`
  runs earlier in `check:all`.
- Sub-components inherit their family's purpose (AtlRadio shows the radio group's sentence), since
  metadata exists per family. AtlToast and AtlCodeBlock have no metadata and keep their JSDoc only.
- The hosted MCP endpoints show the change only after the next Storybook build and deploy.
- Weakest point: two experimental Storybook APIs carry an agent-facing guarantee. The gate catches a
  break; it does not prevent the work of re-finding a hook after an upgrade.
