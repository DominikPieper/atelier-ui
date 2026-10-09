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
connected, `--file` not among the connected Figma files).

### `check-contracts` flags

| Flag                | Meaning                                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--fw <name>`       | Check one framework (overrides `framework` / `frameworks`).                                                                                                                                        |
| `--contracts <dir>` | Contracts directory (overrides `contracts`).                                                                                                                                                       |
| `--snapshot <file>` | Figma snapshot JSON (overrides `snapshot`).                                                                                                                                                        |
| `--stories <dir>`   | A story root; repeatable. Applies to every requested framework (overrides `stories`).                                                                                                              |
| `--report`          | Also print one `ok` line per component reached.                                                                                                                                                    |
| `--emit <dir>`      | Write `<dir>/<fw>/<Component>.codespec.json` (`componentAPI`, `metadata`, `tokens.usedTokens`) per component, to feed `figma_check_design_parity`. The API is written in Figma's terms, see below. |

### `figma-snapshot-contracts` flags

| Flag                | Meaning                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--file <key>`      | Required. The Figma file key. Several files may be connected: that one is read, whichever is active. Exits 2 if it is not connected. |
| `--out <file>`      | Where to write the snapshot (overrides `snapshot`).                                                                                  |
| `--contracts <dir>` | Contracts directory (overrides `contracts`).                                                                                         |
| `--dry-run`         | Print the roster and the plugin code for the first master; never connects to Figma.                                                  |

It needs Figma Desktop with the file open and the figma-console Desktop Bridge plugin
running in it. With several files connected (each with its own plugin), `--file` picks the
one to read: the script looks it up in `figma_list_open_files` and reads it through
`figma_execute_across_files` with `fileKeys: [<key>]`, so the file you are working in
stays the active one and no target pin is touched. A file that is open in Figma without
the plugin running in it is not connected and cannot be read (exit 2, the connected files
are listed). The output directory is created if it does not exist. The MCP server version must be pinned in the MCP config (see `mcpConfig`); it
refuses to fall back to `@latest`.

### `--emit`: the codeSpec in Figma's terms

`figma_check_design_parity` pairs the codeSpec's `componentAPI.props` with the master's
properties by name (lower-cased, everything outside `[a-z0-9]` removed) and reports every
code prop without a Figma partner and every Figma property without a code partner. It has
no notion of a deliberate difference, so `--emit` writes the code's API in Figma's terms,
using the contract and the snapshot master:

| Contract entry | In the emitted `componentAPI.props`                                                                                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `axisMap`      | One prop under the **Figma** name (the axis, or the Boolean's key), with the Figma values when the entry maps values (`values` keys), else the code prop's members. The code name is not emitted. Several entries on one axis merge into one prop.                                             |
| `codeOnly`     | The code prop is left out.                                                                                                                                                                                                                                                                     |
| `figmaOnly`    | A prop under the Figma name, `type: "figma-only"`, with the reason in `description`, so the tool finds a partner for it. `state=<value>` entries, and a `state` axis of interaction states only (`default`, `hover`, `focus`, `focus-visible`, `active`, `pressed`), are covered the same way. |

Figma keys Boolean, Text and Instance-swap properties as `Name#<id>` and the tool keeps the
id's digits when it compares, so a matching code prop is emitted under the master's full
key (the snapshot keeps it). A difference the contract does not record stays a mismatch and
is still reported: that is the point. A component with no master in the snapshot
(`[NO-MASTER]`) keeps the code's own names, there is nothing to translate to. Events and
slots are emitted as names, the parity schema takes strings. `visual`, `spacing`,
`typography` and `accessibility` are not derived here.

Limits: a Figma name made only of non-ASCII letters, or two names that differ only in such
letters (`Größe` and `Gre`), collapse to the same key in the tool's comparison.

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
- `AXIS` also fires for an `axisMap` entry **without** `values` whose code prop (direct, or
  `Child.prop` when the child's type resolves) is boolean, unless the Figma axis is exactly
  the two strings `true` and `false` (any order, case-sensitive). An axis like `ja | nein`
  or `an | aus`, or a single-value axis, says nothing about which value means `true`: add
  `values: { ja: true, nein: false }`. Entries with `values` are unaffected.
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

## Tests

`npm test` (in this directory) runs `node --test test/*.test.mjs`. The tests run both bins
as child processes against a small fixture design system in `test/fixture` (one Angular
component, German Figma names, a `--n-` token prefix) and a stand-in figma-console server
(`test/fake-figma-console.mjs`, put on `PATH` as `npx`), so no live Figma is needed. The
`--emit` golden is `test/golden/NButton.codespec.json`; `UPDATE_GOLDEN=1 npm test` rewrites
it. `test/` is not published (`files`).
