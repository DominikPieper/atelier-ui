# @atelier-ui/mcp

MCP server for consumers of `@atelier-ui/angular` (ADR-0177). It answers `docs-list`, `docs-show`
and `docs-show-story` over stdio from a Storybook manifest snapshot built from the same commit as
the library. No network, no port. `private` until the owner approves publishing.

```json
{ "mcpServers": { "atelier": { "command": "npx", "args": ["atelier-mcp"] } } }
```

- **Version check.** At start the server compares the `@atelier-ui/angular` installed in its
  working directory with its own version and warns in the `instructions` and on stderr on a
  mismatch. It never aborts.
- **Layers.** `ATELIER_MCP_LAYERS` (comma list of ids, unset = all) switches knowledge layers on
  and off for ablation runs; see `src/layers.mjs`. Only `api` (L0) exists. An unknown id is an error.
  `ATELIER_MCP_VERSION_CHECK=off` disables the version note for the evaluation lab.
- **Snapshot.** `snapshot/` is generated (`npm run build`, also run by `prepack`) from
  `dist/storybook/angular`; build that first with `npx nx build-storybook angular`. It is not
  committed.
- **Gate.** `npm run check:mcp-package` runs the unit tests and `scripts/smoke-test.mjs`, which
  packs the tarball and talks to the unpacked bin over stdio, offline.
