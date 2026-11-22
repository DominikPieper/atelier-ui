---
name: atelier-component
description: Build, change or review one component in this Atelier workshop workspace, running the Figma → component → stories → checks loop against the surfaces this workspace actually has (`npm run check:stories`, `npm run check:unit`, the Figma MCP). Use whenever the ask is to implement, add, port, restyle or review a component here, when a figma.com/design link arrives with a component name, or when `check:stories` reports findings that need explaining. Writing a Figma ↔ code contract is opt-in (see the optional section), not part of this loop. Do NOT use for Storybook configuration, for editing `.storybook/*`, or for work that is not about a single component.
---

# One component, in this workspace

This is a generated Atelier workshop workspace: one app (`workshop-<framework>`), one
framework, and a local Storybook on port 6006. The loop below is the one
the Atelier monorepo runs, minus the parts that need the monorepo — say so plainly when you
reach one, rather than pretending the step happened.

## What this workspace can check, and what it cannot

| Can                                                                     | How                                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| That a component, composable, service, or helper behaves as unit-tested | `npm run check:unit` (jsdom, `@testing-library/*`) — for React/Vue, composing the component's own stories (`composeStories`) is preferred over restating their claims by hand; see `<app>/src/atl-button.spec.*` |
| That every story renders, behaves, and passes axe                       | `npm run check:stories` (Chromium, headless)                                                                                                                                                                     |
| That CSS uses tokens rather than literals                               | `npm run check:stylelint`                                                                                                                                                                                        |

It cannot check design parity against the live Figma file unless the `figma-console` MCP is
wired in `.mcp.json` and the Desktop Bridge plugin is running. If it is not, the loop ends at
`check:stories` — and you say that, instead of claiming parity.

## The handoff document comes first

A handoff document (`handoff/<name>.md`) is a short-lived order: it holds only what neither
Figma nor the code carries, in four sections, headed exactly **Quelle**, **Umfang**,
**Verhalten** and **Bewusste Abweichungen** (the course files are German, so are the
headings):

- **Quelle**: the Figma file key and the master's node id.
- **Umfang**: what is in scope (`Im Umfang`) and what is deliberately left out (`Bewusst
draußen`), including whether this is a new component or a composition of library ones.
- **Verhalten**: one line per behaviour. Each line becomes exactly one `play`.
- **Bewusste Abweichungen**: where the code deliberately differs from Figma, with the reason.

Never put variant lists, token bindings, sizes, props or target files in it: they live in
Figma and in the code, and a copy drifts.

**When asked to build a component from Figma** (a node, a URL, a selection, a brief) **and no
handoff document exists:** create `handoff/<name>.md` in that shape first. Fill **Quelle** from
the master (file key, node id). You may list what you see in the master as candidates, marked
as candidates. Leave **Umfang**, **Verhalten** and **Bewusste Abweichungen** as visible blanks or
open questions, then stop and show the file. Do not write the component, the stories or any
other file until the human has filled those three sections: they are the decisions the
document exists for, and a guessed scope is a decision nobody made.

**When a handoff document exists,** build from it: the scope from **Umfang**, one `play` per
**Verhalten** line (a line that cannot become one `play` is two lines or no behaviour; say
which), and **Bewusste Abweichungen** as constraints, not as findings. The props come from the
master, not from the document.

When the work is done the human dissolves the document: behaviour lines are the `play` tests,
"Bewusst draußen" goes into the master's description and the component's JSDoc, deliberate
deviations into the story parameters or the PR description, and the file is deleted. Do not
treat it as living documentation.

## The loop

1. **Get the shape from Figma, not from a picture.** `figma_get_component_for_development` on
   the node if the MCP is available. Write down the variant axes, the Boolean properties, the
   tokens, and the interaction states before writing any code. If you were handed a screenshot
   and nothing else, say that behaviour has not been specified yet and ask for the node.
2. **Write the component.** Tokens only — every colour, space and radius is a `--ui-*` custom
   property. A raw hex or a hardcoded `2.5rem` is a stylelint error here, not a style opinion.
   Compose by region: a component with more than one logical region (header, body, footer;
   icon, label, action) gives each region its own sub-component or the framework's slot or
   projection mechanism, the way `AtlCard` does with `AtlCardHeader`/`AtlCardContent`/`AtlCardFooter`
   (look it up with `docs-show`) — a flat prop bag cannot take content the design did not
   foresee, and consumers then rebuild the component. Give every icon-only control a real
   accessible name (`aria-label`, or the library icon's `label`) and make every interactive
   control a real `<button>` or `<a>`, not a styled `<div>`/`<span>` — axe in `check:stories`
   flags a missing name, but not a div that only looks clickable. Make any severity, status
   or state visible without colour (an icon, a prefix word, or visually hidden text) — colour
   alone fails users who cannot see it, and no check here catches that.
3. **Write the stories, because the stories are the claims.** One story per variant value and
   per Boolean state, `args`-based; one `play` per behaviour you are asserting, with a real
   assertion. Copy the shape from `<app>/src/atl-button.stories.*`, which ships with this
   workspace for exactly that purpose.
   Declare `tags: ['autodocs']` on the story meta, as `atl-button.stories.*` does — without it
   Storybook renders Canvas only, with no Docs tab.
   When the component is built from a handoff document that names a Figma source, the story
   meta also carries `parameters.design` as an array of two entries: the link from the
   document's Source line, and a PNG of the frame. Export the PNG with `figma_take_screenshot`
   (figma-console, Desktop Bridge, no Figma token); Claude Code saves an image a tool returns
   to a file and prints its path in the tool result (`[Image: source: <path>]`), so copy that
   file next to the stories as `<component-file-name>.design.png`. Reference it with
   `new URL(...).href`, which needs no config and passes this workspace's type-check and lint:

   ```ts
   parameters: {
     design: [
       { type: 'figma', url: '<link from the Source line>' },
       { type: 'image', url: new URL('./<component-file-name>.design.png', import.meta.url).href },
     ],
   },
   ```

   Both entries, because the embed is live but shows only in a browser that is logged in to
   Figma, while the PNG always shows and is a dated snapshot. If the bridge is off or no path
   is reported, carry the link only and say so; never invent an image. `atl-button.stories.*`
   has no handoff document, so it has no `design` parameter: do not copy one from it.

4. **Run the checks.** `npm run check:stories`. Read the exit code, not the last line of
   output.
5. **Close the loop against Figma** if the MCP is available: `figma_check_design_parity`,
   with the code side read from the component's own styles and stories plus
   `figma_scan_code_accessibility`.

## Never invent a prop

Before using any prop of a component from `@atelier-ui/<framework>`: call `docs-list` once to
get valid ids, then `docs-show` for the component. The answer comes back shaped for this
framework — two-way bindings and split Inputs/Outputs for Angular, `v-model` and typed slots
for Vue, JSX and `children` for React. If a prop is not in the docs, it does not exist; say so
rather than guessing from another library's naming. Ask the library's server named in
CLAUDE.md ("Storybook MCP servers"); ids from `storybook-local` are not valid there.

For a component whose source lives in this workspace, its own types are the API.

## Optional: the Figma ↔ code contract

Only when asked, or when you want the offline Figma ↔ code join. Write
`<app>/src/contracts/<name>.contract.ts` — the master's node id and only the Figma ↔ code
mismatches you are making on purpose (`figmaOnly`, `codeOnly`, `axisMap`); never props,
defaults, unions or prose (see `<app>/src/contracts/README.md`) — then run
`npm run check:contracts` against `tools/figma/snapshot.json`. For a component imported from
`@atelier-ui/<framework>` it skips docgen and reports only `[NO-STORY-META]`: a green run
there proves the wiring, not the component. Findings:

| Finding                                               | What it means                                                |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| `[CONTRACT-MISSING]` / `[CONTRACT-NODE]`              | no contract file, or its node id disagrees with the snapshot |
| `[AXIS]` / `[BOOLEAN]` / `[ENUM-UNDRAWN]`             | a Figma property has no matching code prop                   |
| `[COVERAGE]` / `[COVERAGE-BOOL]`                      | a variant value or Boolean state that no story renders       |
| `[FIGMA-ONLY]` / `[STALE-EXEMPTION]` / `[UNMIRRORED]` | an exemption is missing, stale, or unexplained               |
| `[NO-STORY-META]` / `[NO-MASTER]`                     | a contract with nothing yet to check it against              |
| `[CONTRACT-IMPORT]`                                   | a story meta does not import its contract (a warning here)   |

A `[COVERAGE]` finding is not noise to silence. It means a state exists in the design that
nothing in this workspace has ever rendered — which is the one thing the contract check exists to
catch.

## Definition of done

`npm run check:format`, `npm run check:stylelint`, `npm run lint`, `npm run build`,
`npm run check:unit` and `npm run check:stories` each exit 0 — checked as exit codes, one at
a time (`/verify` runs every command listed under Definition of Done). Never pipe a check into `head` or `grep` to read it: the pipe's status is 0 whatever
the check did, and that turns a red run into a green report.

Then say which of the five loop steps you actually ran, and which you could not.
