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

## The decisions file comes first

Every component keeps a permanent decision history next to its source, committed with the
code: `<component-folder>/<name>.decisions.md` (the folder of the component's main source
file). It records where a decision came from and why, months later. The course files are
German, so are the headings and entry labels.

**One place per fact.** No information lives in two places; a second copy drifts.

| Fact                                        | Lives in                                                                                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Requirement, story text                     | The ticket. The file holds only the key (or the brief path), never a copy. With no ticket, the purpose is the first Umfang entry. |
| Look, variants, tokens                      | Figma.                                                                                                                            |
| API, props                                  | The code, read through `docs-show`.                                                                                               |
| Behaviour in detail                         | The `play` tests. The file says only THAT a behaviour was decided and WHY, in one line.                                           |
| Why a decision was made, where it came from | The decisions file.                                                                                                               |

An entry holds only what ages slowly: the decision and its reason. Never current values,
counts, variant lists, token bindings, sizes, props or target files.

Shape of the file:

- Header: the component name; **Ticket** (an issue key such as `PROJ-123`; in the course the
  brief path, `course/briefs/toast.md`, or `eigene Idee` when the participant builds their own
  component and there is neither ticket nor brief); **Figma** (file key and node id).
- `## Offene Fragen`: questions the build still needs answered. You write them; the human
  answers each by turning it into a decision entry and removing the question.
- `## Entscheidungen`: append-only, dated entries, never edited or deleted. A change is a new
  entry that names the one it replaces. Entry form:
  `- 2026-11-23 · <Ticket> · <Art>: <decision>. Grund: <reason>. Entschieden von: <name or role>.`
  where **Art** is one of **Umfang** (in / deliberately out), **Verhalten** (one behaviour =
  one `play`), **Bewusste Abweichung** (code differs from Figma on purpose) or **Sonstiges**.

**When asked to build a component from Figma** (a node, a URL, a selection, a brief) **and no
decisions file exists:** create it with the header and **Offene Fragen**. Ask the human for the
ticket key if it was not given (in the course it is the brief path). If there is no ticket and
no brief, write `Ticket: eigene Idee` and ask for the purpose in one sentence; record it as the
first **Umfang** entry (never as a copy in the header or anywhere else). Fill **Figma** from the
master (file key, node id). Put every question the build needs answered under **Offene
Fragen**, then stop and show the file. Do not write the component, the stories or any other
file until the open questions that matter are answered as entries: a guessed scope is a
decision nobody made.

**When a decisions file exists,** read it before any change. Build one `play` per current
**Verhalten** entry (the latest entry on a behaviour wins; an entry that cannot become one
`play` is two behaviours or none: say which), take the scope from **Umfang**, and treat
**Bewusste Abweichung** entries as constraints, not as findings. The props come from the
master and the code, not from the file.

**When a new decision is made during the work,** append an entry with date and ticket and say
so. Never rewrite an old entry; the file is append-only.

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
   When the component has a decisions file that names a Figma source, the story meta also
   carries `parameters.design` with the link from the file's Figma line, so the Design tab
   shows the frame next to the story:

   ```ts
   parameters: {
     design: { type: 'figma', url: '<link from the Figma line>' },
   },
   ```

   The link only, no exported image: the embed is live and the course browsers are logged in
   to Figma. If there is no Figma line, write no `design` parameter and say so; never invent a
   link. `atl-button.stories.*` carries the link to the AtlButton master when this workspace
   was created with its Figma file key: copy the shape, never its URL.

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
