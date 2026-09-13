---
status: accepted
date: 2026-09-13
sources:
  - libs/create-workspace/src/generators/preset/preset.ts (the pre-change `--figma`/`--no-figma` gating: only `.mcp.json`'s `figma-console` entry and CLAUDE.md's "Figma Setup" section)
  - libs/create-workspace/src/generators/preset/files/tools/scripts/check-contracts.mjs (line ~203, `const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));` — unguarded, read directly)
  - plan/adr/0121-*.md (a contract is defined as the deliberate Figma ↔ code mismatch set)
  - tools/scripts/sync-preflight.mjs (the canonical-source/generated-copy pairing `preflight.mjs` is part of, and which none of `verify.md`/`SKILL.md`/`component-review.md` participate in)
  - libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs (pre-change: `--no-figma` on every framework, unconditionally)
---

# ADR-0144: No Figma, no contract

## Status

Accepted.

## Context

The owner's decision: "Der Figma-Teil sollte vollständig abschaltbar sein,
weil wir vielleicht nicht in jedem Projekt Figma überhaupt verwenden" — Figma
has to be genuinely optional in a generated workshop workspace, not just
partially gated.

Before this change, `--figma`/`--no-figma` (the CLI flag; `figmaMcp` in the
preset's own schema) controlled exactly two things: whether `figma-console`
was written into `.mcp.json`, and whether CLAUDE.md's "Figma Setup" section
appeared. Everything else Figma-shaped shipped unconditionally, regardless of
the flag: `tools/scripts/figma-snapshot-contracts.mjs`, `tools/figma/
snapshot.json`, the `figma:snapshot` npm script, `contracts.config.json`,
`<app>/src/contracts/**`, the `check:contracts` npm script and its
`check-contracts.mjs` + `lib/{ts-eval.js,docgen.mjs}` implementation, plus
every doc surface naming that loop (CLAUDE.md's "The Contract Loop" section
and its "Definition of Done", `.claude/commands/verify.md`, the bundled
`.claude/skills/atelier-component/SKILL.md`, and `.claude/agents/
component-review.md`).

Two things made "gate the flag further" the only reasonable shape, rather
than "make the contract loop degrade gracefully without Figma":

1. **`check-contracts.mjs` cannot degrade — it is entirely snapshot-driven.**
   Every `AXIS`/`COVERAGE`/`BOOLEAN`/`ENUM-UNDRAWN` finding it reports is
   computed from `master.variantAxes`/`master.properties` read out of
   `tools/figma/snapshot.json`, and that file is read with an unguarded
   `JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))` (line ~203). With no
   snapshot the script does not warn or skip — it throws, at import time,
   before a single finding prints. Verified by reading the script directly,
   not assumed. Under `--no-figma` there is no `tools/figma/snapshot.json`
   for a lenient version of this gate to fall back to, short of inventing an
   empty placeholder snapshot purely so the script has something to parse —
   which would make every finding vacuous by construction, not a real check.
2. **ADR-0121 already defines the concept away.** A contract is the
   _deliberate Figma ↔ code mismatch set_ (`figmaOnly`/`codeOnly`/`axisMap`/
   `probes`) for one component. With no Figma master to mismatch against,
   there is nothing for a contract to name — "a contract without Figma" is
   not a smaller version of the same idea, it is a different idea with the
   same file extension.

So there is no middle ground to build: under `--no-figma`, the whole contract
loop goes, not just its Figma-only edges.

## Decision

Gate the ENTIRE contract loop on the same `options.figmaMcp` flag that
already gated `.mcp.json`'s `figma-console` entry and CLAUDE.md's "Figma
Setup" section — one preset, one boolean, more `if` branches, not a second
preset or a config file. Specifically, `--figma`/`--no-figma` now also
controls:

- File writes: `<app>/src/contracts/{types.ts,README.md,button.contract.ts}`,
  `tools/scripts/{check-contracts.mjs,figma-snapshot-contracts.mjs,
lib/ts-eval.js,lib/docgen.mjs}`, `tools/figma/snapshot.json`,
  `contracts.config.json`.
- npm scripts: `check:contracts`, `figma:snapshot` (every other script this
  preset writes — `check:unit`, `check:stories`, `check:stylelint`,
  `check:format`, `format`, `start`, `build`, `lint`, `storybook`,
  `build:storybook`, `test`, `preflight` — is unaffected and un-renamed).
- devDependencies: `@modelcontextprotocol/sdk` (imported only by
  `figma-snapshot-contracts.mjs`) and the defensive `typescript` add (needed
  only by `lib/ts-eval.js`, which no longer ships).
- CLAUDE.md: the whole "The Contract Loop" section (omitted entirely, not
  left as a dangling reference to files this workspace never wrote); the
  "Definition of Done" bullet list and its "all five"/"all four" wording,
  computed from an array so the count can never drift from the list itself;
  the "Agent Skills" paragraph's two sentences naming what the always-shipped
  `atelier-component` skill actually runs.
- `.claude/commands/verify.md` and `.claude/skills/atelier-component/
SKILL.md` and `.claude/agents/component-review.md`: **two static file
  variants each**, chosen by `options.figmaMcp` at generation time (`verify.md`
  / `verify.no-figma.md`, `SKILL.md` / `SKILL.no-figma.md`,
  `component-review.md` / `component-review.no-figma.md`) rather than one
  file with inline conditionals. This mirrors the same "pick a static
  template by parameter" shape `preset.ts` already uses for the per-framework
  Storybook/testing templates (`storybookTemplateName`/`testingTemplateName`)
  — extended along a second axis (Figma) instead of inventing a different
  mechanism for it. None of these three files participate in
  `sync-preflight.mjs`'s canonical-source/generated-copy pairing (unlike
  `check-contracts.mjs`, `figma-snapshot-contracts.mjs`, `lib/ts-eval.js`,
  `lib/docgen.mjs`, the `contracts/*` templates, and `preflight.mjs` itself)
  — they have no monorepo-side canonical copy to begin with, so adding a
  second static variant costs nothing there.
- `tools/scripts/preflight.mjs` (canonical copy, synced into the preset by
  `sync-preflight.mjs` — never hand-edited in `files/`): its Figma Desktop
  Bridge / plugin-version-pin / `FIGMA_ACCESS_TOKEN` checks now run only when
  a new `hasFigmaConsoleMcp()` helper finds a `figma-console` entry in
  `.mcp.json`. That exact entry is the signal preflight uses — not a second
  marker file, not a new generation-time flag baked into the script. Preflight
  has no access to the generator's own options (it runs long after
  scaffolding, as a plain `npm run preflight`), so it has to infer the answer
  from something the generator left behind; reusing the very entry
  `--figma`/`--no-figma` writes or omits means the signal cannot drift from
  the flag that actually turned Figma on — there is no second place for the
  two to disagree. In the atelier monorepo clone, the root `.mcp.json`
  commits `figma-console` unconditionally (this repo always uses Figma), so
  the identical test is correct, unconfigured, in both trees this file ships
  into.
- `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs`: previously ran every
  framework with `--no-figma`, so the `--figma` path — the one the workshop
  actually uses — had never been tested end to end. Now exactly one
  framework (`FIGMA_TEST_FRAMEWORK`, the last entry in the possibly
  `E2E_FRAMEWORKS`-filtered list, deliberately decoupled from
  `SKILLS_TEST_FRAMEWORK`, the first entry) runs with `--figma --figma-file
QMnDD8uZQPldPrlCwZZ58T` (this repo's own Figma file key — safe to use
  non-interactively, since `--figma` never contacts Figma during scaffolding,
  only writes an `.mcp.json` entry and names the key in the generated
  `figma:snapshot` script) and asserts the contract loop's files, npm
  scripts, and a real `check:contracts` run all exist and pass. Every other
  framework runs `--no-figma` and asserts the mirror image: none of those
  files, neither npm script, and no `figma-console` entry in `.mcp.json`.

## Consequences

- A scaffolded workspace is either Figma-shaped end to end or has none of it
  — no partial state where, say, `check:contracts` exists but nothing points
  an attendee at it, or a skill still tells them to write a contract file
  that was never generated.
- `preset.spec.ts` gained a dedicated `describe('figma disabled (--no-figma,
ADR-0144)')` block (12 tests) proving the negative space directly (files
  absent, scripts absent, `.mcp.json` clean, doc surfaces reworded), and every
  pre-existing contract-loop test now passes `figmaMcp: true` explicitly
  instead of relying on it being the (accidental, pre-change) default
  behaviour of an unset flag. 246 tests total, all green;
  `nx build create-workspace` confirmed the three new `.no-figma.md` template
  files reach `dist/` (they are plain `.md`, so the `.ts.template` dodge
  documented on `storybookTemplateName()` does not apply to them).
- e2e coverage split three ways instead of tripling runtime: one framework
  proves `--figma` genuinely works against a real, published install (the
  first time this repo has tested that path at all); the other two prove
  `--no-figma`'s absence guarantees. What this leaves uncovered, named
  plainly: a framework-specific bug in the `--figma` scaffold path for the
  two frameworks that only ever run `--no-figma` in the e2e would not be
  caught there — `preset.spec.ts`'s in-memory-tree assertions (which run
  `figmaMcp: true` against all three frameworks) are what still covers them,
  not the e2e.
- Rejected: keeping `check-contracts.mjs` but making it degrade leniently
  without a snapshot (e.g. skip with a warning instead of throwing). Rejected
  because ADR-0121 defines a contract as the Figma mismatch set — a lenient
  "no snapshot, no findings" mode would not be a smaller version of the same
  check, it would be a check that always vacuously passes, which teaches
  exactly the wrong lesson to a first-time attendee running `/verify`.
- Rejected: shipping the contract-loop files without wiring the npm scripts
  (dead weight the attendee never runs). Rejected because the always-shipped
  `atelier-component` skill would still need to either mention them (telling
  an attendee to write a contract nothing ever checks) or ignore them
  (dead files with no in-repo explanation for why they're there) — worse
  than not shipping them.
- Rejected: two separate presets/packages (a `--figma` preset and a
  `--no-figma` preset). Rejected as doubling the maintenance surface — every
  future change to the shared 90% (Storybook, stories-as-tests, jsdom units,
  strict TypeScript, the linter, tokens, `.claude/`) would need applying
  twice — for a difference this preset already expresses cleanly as
  conditionals on one existing boolean, the same way it already gated the
  `.mcp.json` entry and the "Figma Setup" section before this change.
- `.claude/settings.json`'s permissions comment (`Bash(npm run *)`) no longer
  claims a fixed script count ("fourteen") — the exact count now depends on
  `--figma`, and the wildcard rule itself needed no change either way.
