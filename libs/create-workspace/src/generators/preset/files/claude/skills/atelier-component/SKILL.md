---
name: atelier-component
description: Build, change or review one component in this Atelier workshop workspace, running the Figma → contract → stories → checks loop against the surfaces this workspace actually has (`<app>/src/contracts/`, `contracts.config.json`, `npm run check:contracts`, `npm run check:stories`). Use whenever the ask is to implement, add, port, restyle or review a component here, when a figma.com/design link arrives with a component name, or when `check:contracts` or `check:stories` report findings that need explaining. Do NOT use for Storybook configuration, for editing `.storybook/*`, or for work that is not about a single component.
---

# One component, in this workspace

This is a generated Atelier workshop workspace: one app (`workshop-<framework>`), one
framework, a local Storybook on port 6006, and a contract loop. The loop below is the one
the Atelier monorepo runs, minus the parts that need the monorepo — say so plainly when you
reach one, rather than pretending the step happened.

## What this workspace can check, and what it cannot

| Can                                                    | How                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| That a contract matches its Figma master's shape       | `npm run check:contracts` against `tools/figma/snapshot.json` |
| That every variant value and Boolean state has a story | the same check's `[COVERAGE]` findings                        |
| That every story renders, behaves, and passes axe      | `npm run check:stories` (Chromium, headless)                  |
| That CSS uses tokens rather than literals              | `npm run check:stylelint`                                     |

It cannot check design parity against the live Figma file unless the `figma-console` MCP is
wired in `.mcp.json` and the Desktop Bridge plugin is running. If it is not, the loop ends at
`check:stories` — and you say that, instead of claiming parity.

For a component imported from `@atelier-ui/<framework>` rather than written here,
`check:contracts` skips docgen (the import resolves into `node_modules`) and reports only
`[NO-STORY-META]`. A green run on such a component proves the wiring, not the component.

## The loop

1. **Get the shape from Figma, not from a picture.** `figma_get_component_for_development` on
   the node if the MCP is available. Write down the variant axes, the Boolean properties, the
   tokens, and the interaction states before writing any code. If you were handed a screenshot
   and nothing else, say that behaviour has not been specified yet and ask for the node.
2. **Write the contract.** `<app>/src/contracts/<name>.contract.ts` — the master's node id and
   only the Figma ↔ code mismatches you are making on purpose (`figmaOnly`, `codeOnly`,
   `axisMap`). Never props, defaults, unions or prose: those live in the component's own types
   and JSDoc. See `<app>/src/contracts/README.md`.
3. **Write the component.** Tokens only — every colour, space and radius is a `--ui-*` custom
   property. A raw hex or a hardcoded `2.5rem` is a stylelint error here, not a style opinion.
4. **Write the stories, because the stories are the claims.** One story per variant value and
   per Boolean state, `args`-based; one `play` per behaviour you are asserting, with a real
   assertion. Copy the shape from `<app>/src/atl-button.stories.*`, which ships with this
   workspace for exactly that purpose.
5. **Run the checks.** `npm run check:contracts`, then `npm run check:stories`. Read the exit
   code, not the last line of output.
6. **Close the loop against Figma** if the MCP is available: `figma_check_design_parity`,
   with the code side assembled from `check:contracts` and `figma_scan_code_accessibility`.

## Never invent a prop

Before using any prop of a component from `@atelier-ui/<framework>`: call `docs-list` once to
get valid ids, then `docs-show` for the component. The answer comes back shaped for this
framework — two-way bindings and split Inputs/Outputs for Angular, `v-model` and typed slots
for Vue, JSX and `children` for React. If a prop is not in the docs, it does not exist; say so
rather than guessing from another library's naming.

For a component whose source lives in this workspace, its own types are the API.

## Reading `check:contracts`

| Finding                                               | What it means                                                |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `[CONTRACT-MISSING]` / `[CONTRACT-NODE]`              | no contract file, or its node id disagrees with the snapshot |
| `[AXIS]` / `[BOOLEAN]` / `[ENUM-UNDRAWN]`             | a Figma property has no matching code prop                   |
| `[COVERAGE]` / `[COVERAGE-BOOL]`                      | a variant value or Boolean state that no story renders       |
| `[FIGMA-ONLY]` / `[STALE-EXEMPTION]` / `[UNMIRRORED]` | an exemption is missing, stale, or unexplained               |
| `[NO-STORY-META]` / `[NO-MASTER]`                     | a contract with nothing yet to check it against              |
| `[CONTRACT-IMPORT]`                                   | a story meta does not import its contract (a warning here)   |

A `[COVERAGE]` finding is not noise to silence. It means a state exists in the design that
nothing in this workspace has ever rendered — which is the one thing this loop exists to
catch.

## Definition of done

`npm run check:format`, `npm run check:stylelint`, `npm run check:contracts` and
`npm run check:stories` each exit 0 — checked as exit codes, one at a time. Never pipe a
check into `head` or `grep` to read it: the pipe's status is 0 whatever the check did, and
that turns a red run into a green report.

Then say which of the six loop steps you actually ran, and which you could not.
