---
name: atelier-component
description: Build, change or review one component in this Atelier workshop workspace, running the component → stories → checks loop against the surfaces this workspace actually has (`<app>/src/atl-button.stories.*` as the pattern to copy, `npm run check:unit`, `npm run check:stories`). Use whenever the ask is to implement, add, port, restyle or review a component here, or when `check:unit` or `check:stories` report findings that need explaining. Do NOT use for Storybook configuration, for editing `.storybook/*`, or for work that is not about a single component.
---

# One component, in this workspace

This is a generated Atelier workshop workspace: one app (`workshop-<framework>`), one
framework, and a local Storybook on port 6006 — scaffolded without Figma (`--no-figma`),
so there is no contract loop here. ADR-0144: a contract is the set of deliberate Figma ↔
code mismatches, and with no Figma there is nothing for one to disagree with. The loop
below is the part of the Atelier monorepo's own loop that does not depend on Figma — say
so plainly if asked for design parity against a live file, rather than pretending this
workspace can check that.

## What this workspace can check, and what it cannot

| Can                                                                     | How                                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| That a component, composable, service, or helper behaves as unit-tested | `npm run check:unit` (jsdom, `@testing-library/*`) — for React/Vue, composing the component's own stories (`composeStories`) is preferred over restating their claims by hand; see `<app>/src/atl-button.spec.*` |
| That every story renders, behaves, and passes axe                       | `npm run check:stories` (Chromium, headless)                                                                                                                                                                     |
| That CSS uses tokens rather than literals                               | `npm run check:stylelint`                                                                                                                                                                                        |

This workspace has no Figma connection at all: no `figma-console` MCP entry in
`.mcp.json`, no contract file, no Figma snapshot, and no way to check design parity
against a live Figma file from here. If someone asks for that, say a Figma-enabled
workspace is a separate scaffold (`--figma`), not something this one can do.

## The loop

1. **Get the shape from the actual requirement, not from a guess.** Write down the
   variant axes, the Boolean properties, and the interaction states before writing any
   code — from a written spec, a screenshot, or a verbal description, whatever you were
   handed. If you were only handed a vague description, say the states have not been
   specified yet and ask for them.
2. **Write the component.** Tokens only — every colour, space and radius is a `--ui-*`
   custom property. A raw hex or a hardcoded `2.5rem` is a stylelint error here, not a
   style opinion.
3. **Write the stories, because the stories are the claims.** One story per variant value
   and per Boolean state, `args`-based; one `play` per behaviour you are asserting, with a
   real assertion. Copy the shape from `<app>/src/atl-button.stories.*`, which ships with
   this workspace for exactly that purpose.
4. **Run the checks.** `npm run check:unit`, then `npm run check:stories`. Read the exit
   code, not the last line of output.

## Never invent a prop

Before using any prop of a component from `@atelier-ui/<framework>`: call `docs-list` once to
get valid ids, then `docs-show` for the component. The answer comes back shaped for this
framework — two-way bindings and split Inputs/Outputs for Angular, `v-model` and typed slots
for Vue, JSX and `children` for React. If a prop is not in the docs, it does not exist; say so
rather than guessing from another library's naming.

For a component whose source lives in this workspace, its own types are the API.

## Definition of done

`npm run check:format`, `npm run check:stylelint`, `npm run check:unit` and
`npm run check:stories` each exit 0 — checked as exit codes, one at a time. Never pipe a
check into `head` or `grep` to read it: the pipe's status is 0 whatever the check did,
and that turns a red run into a green report.

Then say which of the four loop steps you actually ran, and which you could not.
