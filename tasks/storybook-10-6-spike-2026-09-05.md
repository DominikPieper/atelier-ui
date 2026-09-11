# Spike — Storybook 10.6 retires ADR-0083

**Date:** 2026-09-05 · **Trigger:** a Storybook announcement about `10.6.0-alpha.7` (ACM replacing Compodoc, `experimentalDocgenServer`, `componentsManifest`) · **Status:** spike complete, decision open · **Worktree:** `.claude/worktrees/agent-a22b1066d056c24de` (branch `worktree-agent-a22b1066d056c24de`, uncommitted, kept as evidence and as a migration base)

## The result in one line

**Both Angular and Vue now serve genuinely framework-native component docs over MCP. ADR-0083's worker substitution can be retired in full, not shrunk.**

## What was measured

The announcement was already out of date. From the npm registry:

```
storybook  latest = 10.6.0   published 2026-09-02
           next   = 11.0.0-alpha.0
@storybook/angular-vite  10.6.0   ← did not exist in our pinned 10.5.10
```

### Baseline, on the main tree

A production build writes `dist/storybook/react/manifests/{docs,components}.json` but only `docs.json` for Angular and Vue. The `experimental_manifests` preset contributors in the installed tree are `@storybook/addon-docs`, `@storybook/addon-mcp` and `@storybook/react` — the Angular and Vue framework packages contribute nothing. That absence is ADR-0083's entire basis, and it is confirmed by build artefact, not only by reading source.

The hosted `storybook-angular` endpoint, asked for `AtlToggle` today:

```
import { AtlToggle } from "@atelier-ui/react";
onCheckedChange?: (checked: boolean) => void;
children?: ReactNode;
```

### With 10.6.0

|                                         | Angular                                  | Vue                              |
| --------------------------------------- | ---------------------------------------- | -------------------------------- |
| `manifests/components.json`             | 24 KB, 32 entries                        | 13 KB, 32 entries                |
| `meta.docgen`                           | `angular-component-meta`                 | `vue-component-meta`             |
| `AtlCheckbox` shape                     | `checked` input + `checkedChange` output | `update:checked` event + `slots` |
| `children` / `onCheckedChange` anywhere | no / no                                  | no / no                          |

Then the question the build could not answer — does the **MCP surface** serve it? Spoke MCP directly to both dev servers (`initialize`, `notifications/initialized`, `tools/call`).

Angular, `docs-show` for `AtlToggle`:

```html
<atl-toggle [(checked)]="enabled">Enable notifications</atl-toggle>
```

```
AtlToggleInputs   checked?: boolean; // two-way: [(checked)]
AtlToggleOutputs  checkedChange: (e: boolean) => void
```

Vue, same call:

```
Models   checked?: boolean; // v-model:checked="..."
Events   "update:checked": [value: boolean]
Slots    default: {}
```

Vue's reply even carries the instruction _"do not pass the prop and listen to its `update:` event separately"_, and its stories come back as real SFCs with `<script setup>`. Angular's carry the source JSDoc including the `[formField]` directive notes.

This is the exact inverse of today's behaviour. The surface participants actually touch is fixed.

## What it costs

**1. Angular needs a framework swap, and that is a gain.** Keeping `@analogjs/storybook-angular` does not work: with the flag set, the build still exits 0 but swallows `Invariant failed: experimental_manifests must supply components.meta.docgen` and writes a **decoy** — 32 entries carrying only `id` and `name`, no props. An empty manifest that looks full. Only `@storybook/angular-vite` produces real data. Swapping replaces a third-party wrapper with the first-party package and puts us on the path where upstream sets its defaults (`experimentalDocgenServer` is default _there_). Its peers — Angular ≥21 <23, vite ≥8, TS ≥5.9 — are already satisfied here.

**2. `@angular/animations` comes back.** It is a hard peer of `@storybook/angular-vite` and was pulled in transitively (22.0.7). This repo deliberately never installed it; the long comment in `libs/angular/.storybook/main.ts`'s `viteFinal` explains why the stub plugin exists instead. Under the new framework the stub becomes optional — but only because the deprecated package is genuinely present. **This reverses a deliberate decision and should be decided explicitly, not absorbed as a side effect.**

**3. Every MCP tool was renamed.** Only `get-storybook-story-instructions` survives:

| 10.5.10                       | 10.6.0                      |
| ----------------------------- | --------------------------- |
| `list-all-documentation`      | `docs-list`                 |
| `get-documentation`           | `docs-show`                 |
| `get-documentation-for-story` | `docs-show-story`           |
| `preview-stories`             | `stories-preview`           |
| `run-story-tests`             | `test-run`                  |
| `get-changed-stories`         | `stories-changed`           |
| `get-stories-by-component`    | `stories-find-by-component` |

**32 files** in this repo name the old ones — including `AGENTS.md`, `README.md`, three published `docs/public/.well-known/agent-skills/*/SKILL.md`, `talk/storybook-mcp-talk.md`, eight docs pages, and `libs/create-workspace/src/generators/preset/preset.ts`, which ships to npm and would scaffold workspaces with stale names.

**4. Smaller items.** Vue needs `experimentalDocgenServer: true` explicitly until 11. `@storybook/addon-mcp` jumps `0.7.0` → `10.6.0` (its versioning now tracks Storybook's, and its old peer range excludes 10.6). A stale `package-lock.json` produced a reproducible false `ERESOLVE`; deleting and reinstalling fixed it.

## Consequences for the training material

Mostly subtraction, which is unusual and good:

- ADR-0083 gets superseded; the Cloudflare Worker's substitution comes out.
- The M3 bullet written into `schulung.astro` today — Angular/Vue must translate a React-shaped reply via the spec — becomes obsolete. It stops being a rule to teach and becomes, at most, a note about older versions.
- `AGENTS.md`'s Storybook MCP section loses its central asymmetry ("the reply is React-shaped throughout").
- Day 1 Block 03's `experimentalReactComponentMeta` line needs revisiting alongside its Angular and Vue siblings.

## Recommendation

Migrate, and before the next cohort — the material currently teaches a workaround that upstream has removed. But sequence it as its own piece of work with an ADR, not as a dependency bump:

1. Decide the `@angular/animations` question explicitly. It is the only item that reverses a prior decision.
2. Framework swap + version bump + the two feature flags, gates green.
3. Rename sweep across the 32 files, `libs/create-workspace` included — that one changes published output.
4. Retire the worker substitution; supersede ADR-0083.
5. Only then simplify the curriculum (M3, `AGENTS.md`, Block 03).

Not verified: whether the **hosted** worker serves the new sharded `$ref` manifest shape unchanged. Both MCP probes above were against local dev servers. That is the one remaining unknown before step 4.
