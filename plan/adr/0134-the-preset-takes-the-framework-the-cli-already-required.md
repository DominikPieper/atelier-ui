---
status: accepted
date: 2026-09-12
sources:
  - libs/create-workspace/src/generators/preset/schema.json (the option that changed shape)
  - libs/create-workspace/src/generators/preset/preset.ts (the branches that only served a list)
  - libs/create-atelier-ui-workspace/bin/index.ts (the CLI, single-framework since it was written)
  - libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs (loops frameworks, passes them one at a time)
  - node_modules/nx/dist/src/utils/params.js (prompt-before-setDefaults, read to confirm the x-prompt fires)
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (the scaffold is the one-framework environment)
  - plan/adr/0014-workshop-single-framework.md (the rule the workshop already works under)
---

# ADR-0134: The preset takes the framework the CLI already required

## Status

Accepted 2026-09-12.

## Context

`@atelier-ui/create-workspace`'s preset accepted `frameworks` — a comma-separated string —
and scaffolded one app per entry. Its CLI wrapper, `create-atelier-ui-workspace`, never
allowed more than one: a `'angular' | 'react' | 'vue'` union, a validation that throws on
anything else, and a single-select prompt. Everything downstream agrees with the CLI, not
with the preset: ADR-0084 calls the scaffold the one-framework environment, ADR-0014 fixes
one framework per session, `docs/src/pages/workshop.astro` says "you pick **one**
framework" in three places, and the e2e iterates the three frameworks by scaffolding three
separate workspaces.

So the list was a capability nothing offered. It was not free. It bought:

- `6006 + frameworks.indexOf(framework)` port arithmetic, and with it ports 6007 and 6008,
  which existed nowhere outside the assertions that checked for them;
- a `primaryFramework = frameworks[0]` narrowing, because the contract loop
  (`contracts.config.json`) names exactly one framework and had to pick;
- list rendering in the generated `CLAUDE.md` and `README.md`, a multi-entry `.mcp.json`
  loop, a per-framework fan-out in `buildStylelintConfig` and in the generated `nx.json`
  stylelint inputs;
- twenty-two call sites in `preset.spec.ts` keeping all of it alive — the only place in the
  repo where the multi-framework path ran at all.

A separate, quieter defect sat in the same option. The schema's `default: "angular"` meant
that a bare `create-nx-workspace --preset=@atelier-ui/create-workspace` — the documented
Nx entry point, which does not go through our CLI — silently produced an Angular workspace
without asking. The CLI's select prompt is the CLI's, not the preset's.

## Decision

The preset takes `framework`: a string with `enum: ["angular", "react", "vue"]`, a
`default`, and an `x-prompt`. `frameworks` is gone, and with it every branch that only
existed to serve more than one entry. The Storybook port is the literal 6006. The CLI
passes `framework` through unchanged in every other respect.

The `x-prompt` fires even though the property has a `default`: Nx's
`combineOptionsForGenerator` runs `promptForValues` **before** `setDefaults`, so a default
on a prompted option becomes the prompt's initial value rather than suppressing the
question. Read in `nx/dist/src/utils/params.js` rather than assumed.

**No backwards-compatibility shim.** This is a breaking change to a published package's
option, and it is safe because version skew cannot occur: the CLI installs the preset
pinned to its own version (`@atelier-ui/create-workspace@${presetVersion}`), and both
packages release in lockstep from nx.json's `libraries` group. The only caller a shim would
protect is someone invoking the preset directly with `--frameworks`, a form no document in
this repo has ever shown.

Rejected: **keep the list and let the CLI narrow it.** It reads as harmless — the CLI
already passes one value — but it keeps branches alive that no user can reach, and keeps
tests asserting behaviour (port 6007) that ships to nobody. A test that proves an
unreachable path is a maintenance cost wearing the costume of coverage.

Rejected: **accept both keys for a release.** A compatibility window for a skew that the
pinned preset spec makes impossible.

## Consequences

The generator is straight-line code from one `framework` const. Ports 6007 and 6008 no
longer exist anywhere in the repo. `contracts.config.json` names the framework because
there is one, not because it picked the first.

Coverage was converted rather than dropped. One test was deleted outright — sequential port
assignment across two frameworks — because the behaviour it asserted is gone and there is
nothing left to check. Several tests gained an assertion the multi-framework versions could
not make: that the _other_ frameworks' packages are absent. With all three always selected
together, nothing was ever checked for absence, so `@storybook/react-vite` leaking into an
Angular scaffold would have passed.

Anyone who wants all three frameworks side by side scaffolds three workspaces, or clones
this repo — which is what the three-framework rig is for, and what ADR-0084 already says.

The documentation needed no change, because it already described the single-framework
behaviour. That is the tell that this ADR is recording a removal, not a decision: the
decision was made when the CLI was written, and the preset simply never caught up.
