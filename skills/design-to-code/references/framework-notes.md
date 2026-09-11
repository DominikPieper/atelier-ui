# Framework notes

One framework per session (ADR-0014). Component docs come from that framework's hosted
Storybook MCP, whose manifest is emitted natively (ADR-0097) — do not translate from
another framework's prop table.

| Framework | Hosted MCP                                                      | Manifest source          | Binding shape you will read and write                                                                  |
| --------- | --------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Angular   | `storybook-angular` (`atelier.pieper.io/storybook-angular/mcp`) | `angular-component-meta` | signal inputs, `model()` two-way `[(checked)]`, split Inputs/Outputs, `ng-content` instead of children |
| React     | `storybook-react`                                               | `react-docgen`           | props `& AtlFooSpec`, `children`, `on*Change`, `forwardRef`                                            |
| Vue       | `storybook-vue`                                                 | `vue-component-meta`     | `defineProps` mirroring the spec interface, `v-model` / `update:*` emits, typed slots                  |

## Hosted vs local, and what `AGENTS.md` requires

The hosted endpoints expose `docs-list`, `docs-show`, `docs-show-story` only. A local
Storybook (`nx storybook <fw>`; this repo binds 4400 Angular / 4401 React / 4402 Vue — read
the port from the terminal) adds the `dev` and `test` toolsets.

`AGENTS.md` § Storybook MCP Workflows makes these **required** when creating or editing
components or stories against the chosen framework's local Storybook — since Storybook
10.6 all three local Storybooks expose the same tool surface, not React only:

1. `get-storybook-story-instructions` before writing any code that touches a
   `*.stories.*` file.
2. `stories-preview` after any change; the returned `previewUrl`s go into the final
   report.
3. `stories-changed` before bulk edits.
4. `test-run` after each change (`{ stories: [...] }` for a focused run; fix failures
   before reporting completion).

`nx test <lib>` (Vitest) remains the unit half in every framework, run alongside the above,
not instead of it. In every framework, autodocs is per-story: `tags: ['autodocs']`.

## Shared across frameworks

Class names `atl-<name>`, `variant-<x>`, `size-<x>`, `is-<state>`; CSS duplicated per
adapter on purpose; Testing Library for tests (`@testing-library/angular` render/screen,
never raw TestBed); every colour, spacing, radius and font value through `--ui-*`;
`behaviors.json` in `libs/spec/src` is part of the contract alongside `index.ts`,
`metadata/` and `tokens.manifest.ts`.
