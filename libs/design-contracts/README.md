# @conciso/design-contracts

The Figma-to-code **contract loop**: a component's Figma master, its code, its stories and
one small hand-written contract are joined and checked for drift, offline and in CI.

- `check-contracts` joins four inputs and reports drift by tag: the component's **docgen
  manifest** (Angular and Vue through the Storybook framework worker, React through
  `react-docgen`), the **story `args`** (read with `storybook/internal/csf-tools`), a
  **Figma snapshot** (a JSON file), and the **contracts** (`<name>.contract.ts`, read
  statically; no code is executed). No Storybook build, no browser, no network.
- `figma-snapshot-contracts` refreshes that snapshot from Figma Desktop (through the
  `figma-console` MCP server and its Desktop Bridge plugin). Its roster is the contracts:
  one master per contract's `figmaNodeId`.

A contract records only what no derived artefact can know: which Figma master a component
is, and where Figma and code differ on purpose. Props, defaults, unions and prose live in
the component's own types and JSDoc, the stories, and the master. The type is exported:

```ts
import type { ComponentContract } from '@conciso/design-contracts';

export const contract = {
  component: 'Button', // selector, equals the master's `selector` in the snapshot
  figmaNodeId: '129:20', // the master's COMPONENT_SET node id
  figmaOnly: [{ name: 'iconOnly', reason: 'Not modelled in code yet.' }],
} satisfies ComponentContract;
```

A contract must stay a plain object literal (no imports of values, no computed members),
because it is evaluated statically. Use `satisfies`, not a type annotation, so an extra
key fails the build.

## Install

Plain Node ESM, no build step, no Nx. Node >= 22.12.

```
npm install --save-dev @conciso/design-contracts
```

The package does **not** bundle the tooling it reads your components with. It resolves
these from **your** `node_modules` (the working directory), so the check always uses the
Storybook you build with:

| Peer dependency                  | Needed for                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| `storybook` (>= 10.6)            | always (`storybook/internal/csf-tools`)                       |
| `typescript`                     | always (static contract evaluation)                           |
| `@storybook/angular-vite` (10.6) | `angular` (`internal/docgen-worker`)                          |
| `@storybook/vue3` (10.6)         | `vue` (`internal/docgen-worker`)                              |
| `react-docgen` (8)               | `react`                                                       |
| `@modelcontextprotocol/sdk`      | a regular dependency; used by `figma-snapshot-contracts` only |

The framework packages are optional: install the one you use.

## Usage

Run from the root of the workspace that holds `contracts.config.json`:

```
npx check-contracts [--fw <angular|react|vue>] [--contracts <dir>] [--snapshot <file>]
                    [--stories <dir>]... [--report] [--emit <dir>]
npx figma-snapshot-contracts --file <figmaFileKey> [--out <file>] [--contracts <dir>] [--dry-run]
```

Exit codes: `0` no errors (warnings are allowed), `1` the check found errors, `2` it could
not run (invalid JSON, a missing required setting, an unknown framework, Figma bridge not
connected, `--file` not matching the open Figma file).

### `check-contracts` flags

| Flag                | Meaning                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `--fw <name>`       | Check one framework (overrides `framework` / `frameworks`).                                                                                |
| `--contracts <dir>` | Contracts directory (overrides `contracts`).                                                                                               |
| `--snapshot <file>` | Figma snapshot JSON (overrides `snapshot`).                                                                                                |
| `--stories <dir>`   | A story root; repeatable. Applies to every requested framework (overrides `stories`).                                                      |
| `--report`          | Also print one `ok` line per component reached.                                                                                            |
| `--emit <dir>`      | Write `<dir>/<fw>/<Component>.codespec.json` (`componentAPI`, `metadata`, `tokens.usedTokens`) per component, to feed a Figma parity tool. |

### `figma-snapshot-contracts` flags

| Flag                | Meaning                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| `--file <key>`      | Required. The Figma file key. The tool exits 2 if Figma Desktop has another file open. |
| `--out <file>`      | Where to write the snapshot (overrides `snapshot`).                                    |
| `--contracts <dir>` | Contracts directory (overrides `contracts`).                                           |
| `--dry-run`         | Print the roster and the plugin code for the first master; never connects to Figma.    |

It needs Figma Desktop with the file open and the figma-console Desktop Bridge plugin
connected. The MCP server version must be pinned in the MCP config (see `mcpConfig`); it
refuses to fall back to `@latest`.

## `contracts.config.json`

Read from the **current working directory**. Nothing is derived from where the package is
installed, and there are no built-in locations: every path below is relative to the
working directory, and a flag always wins over the file. A missing required setting is an
error (exit 2) that names the setting.

```json
{
  "framework": "angular",
  "contracts": "src/contracts",
  "snapshot": "tools/figma/snapshot.json",
  "stories": ["src"]
}
```

| Field                    | Required | Type                                          | Meaning                                                                                                                                                                                                                                            |
| ------------------------ | -------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `framework`              | one of   | `"angular"` \| `"react"` \| `"vue"`           | The one framework to check.                                                                                                                                                                                                                        |
| `frameworks`             | one of   | array of the above                            | Several frameworks, checked in one run (cross-framework findings such as `[FW-ONLY]` need more than one). `--fw` > `framework` > `frameworks`.                                                                                                     |
| `contracts`              | yes      | path                                          | Directory of `<name>.contract.ts` files.                                                                                                                                                                                                           |
| `snapshot`               | yes      | path                                          | The Figma snapshot JSON: read by `check-contracts`, written by `figma-snapshot-contracts` (default for `--out`).                                                                                                                                   |
| `stories`                | yes      | `string[]` or `{ "<fw>": string[] }`          | Roots walked recursively for `*.stories.ts` / `*.stories.tsx` (`node_modules` excluded). A list applies to every framework; a map gives each framework its own roots, and every checked framework needs one.                                       |
| `componentDirs`          | no       | `string[]` or `{ "<fw>": string[] }`          | Extra directories searched for a child component's source when an `axisMap` entry names `Child.prop`. A story's own directory is always searched.                                                                                                  |
| `styleDir`               | no       | path                                          | A directory of per-component stylesheets kept apart from the components, looked up as `<styleDir>/<component directory name>`. Read only by `--emit` (token scan).                                                                                 |
| `tokenPrefix`            | no       | string, default `"--"`                        | CSS custom-property prefix `--emit` scans for as design tokens (`var(<prefix>...)`).                                                                                                                                                               |
| `contractImportAlias`    | no       | module path prefix                            | A path alias under which a story may import its contract as `<alias>/<name>.contract`. Accepted by `[CONTRACT-IMPORT]` and used in its suggestion. Without it only a relative import is accepted.                                                  |
| `contractImportSeverity` | no       | `"error"` \| `"warning"`, default `"warning"` | Severity of `[CONTRACT-IMPORT]` (a story whose component has a contract but does not import it and set `parameters.contract`). Make it an error where something renders the wiring.                                                                |
| `sharedPropsInterface`   | no       | `{ "file": path, "name": string }`            | React only. A base interface (in a `.ts` file) that components' prop types extend. `react-docgen` cannot see a string prop inherited through it with no default; the check recovers those from the component's destructured props. Off when unset. |
| `mcpConfig`              | no       | path, default `".mcp.json"`                   | `figma-snapshot-contracts` only. The MCP config whose `mcpServers["figma-console"].args` pins `figma-console-mcp@<version>`.                                                                                                                       |

## Findings

Each finding has a tag and a level. Errors fail the run (exit 1), warnings do not.

- Errors: `CONTRACT-MISSING`, `CONTRACT-DUPLICATE`, `CONTRACT-NODE`, `AXIS`, `BOOLEAN`,
  `STALE-EXEMPTION`, `ENUM-UNDRAWN`, `COVERAGE`, `DOCGEN-EMPTY`, `DOCGEN-FAILED`, `ROSTER`
  (docgen measured nothing although stories exist: a gate that measures nothing is a
  failure, not a pass).
- Warnings: `CONTRACT-ORPHAN`, `FIGMA-ONLY` (a `figmaOnly` reason still `UNEXPLAINED`),
  `FW-ONLY`, `NO-MASTER`, `COVERAGE-BOOL`, `UNRESOLVED-ARGS`, `UNMIRRORED`, `STALE-MIRROR`,
  `NO-STORY-META`.
- `CONTRACT-IMPORT` follows `contractImportSeverity`.

A component imported from an installed package (not a workspace path) is skipped before
docgen: local docgen cannot read into `node_modules`, so there is nothing to compare.

## Library use

`@conciso/design-contracts/docgen` exports the shared docgen plumbing (`findStoryFiles`,
`makeWorkerDocgen`, `normalizeAngular`, `normalizeVue`, `makeReactDocgenTools`,
`normalizeReactDocgen`, `findExternalPackageDir`, ...) for scripts that need to read the
same component manifests the check reads. Every function takes its roots and its
`require` as arguments; none reads a path derived from its own location.

## Vendoring

The package is plain `.mjs` / `.cjs`, so it can also be copied into a repo as a folder (keep
`bin/` and `src/` side by side) and run with `node <folder>/bin/check-contracts.mjs`. The
file extension fixes the module format, so the host repo's `"type"` does not matter.
