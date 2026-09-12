---
status: accepted
date: 2026-09-12
sources:
  - libs/create-workspace/src/generators/preset/preset.ts (the generator, and the nx.json write it did not do before)
  - tools/stylelint-rules/*.js and tools/scripts/sync-preflight.mjs (what travels, and the guard that keeps it identical)
  - plan/adr/0130-a-rule-needs-somewhere-to-put-the-finding.md (the port these rules came from)
  - plan/adr/0125-the-gates-stay-scripts-until-the-cases-abstract.md (what the scaffold already received, and why the rest does not travel)
  - plan/adr/0090-one-preflight-branched-inside-not-forked-outside.md (the idiom the rule files travel under)
  - plan/adr/0126-the-linter-is-a-gate-where-the-invariant-fits-in-one-file.md (the per-framework ESLint posture the scaffold already gets)
  - plan/adr/0124-a-gate-that-measured-nothing.md (the failure class the day-one criterion is chosen against)
  - measured 2026-09-12: a scaffold-shaped fixture, then a real generated workspace from a locally published CLI
---

# ADR-0131: The scaffold gets the checks that fire on day one

## Status

Accepted 2026-09-12, answering "which of the checks that are not tied to this repo's
three-framework rig should a generated workspace receive, sensibly preconfigured?"

## Context

A workshop attendee scaffolds a one-framework workspace with
`@atelier-ui/create-workspace` and writes components in it. What that workspace can check
about their work is whatever the preset put there.

Until now that was: `preflight`, `check:contracts`, `figma:snapshot`, `check:stories`, and
a per-framework ESLint posture (ADR-0126 §6). ADR-0125 explains why it is not more —
about twenty-eight of this repo's gates are a generic idea wearing Atelier literals, about
twelve are meaningful only here, and the honest size of what travels is one substantive
gate. That reasoning is about the **gates**. It says nothing about the rules, because when
it was written there were two, both monorepo-local by construction.

After ADR-0130 there are four stylelint rules, and they are a different kind of thing: a
rule fires in the editor, on the file being typed, with no chain to run. That is exactly
the shape a workshop wants. The question is which of them are worth an attendee's first
hour.

**The criterion is what a person hits by writing ordinary CSS, not what the design system
considers important.** Three qualify:

- `no-raw-color-literal` — `background: #3b82f6`. The first thing anyone does.
- `no-undeclared-token` — `var(--ui-color-primry)`. A typo'd custom property is not an
  error in CSS; the declaration silently renders at its fallback, or nothing. Nothing else
  in a scaffolded workspace would ever say so.
- `no-token-bypass` — `height: 2.5rem`, which is exactly what `--ui-control-height-md`
  holds. The value looks right and the link to the system is gone.

`no-primitive-token` does not. It polices reaching past the semantic tier into a primitive
ramp — `--ui-color-teal-500` instead of `--ui-color-primary` — which presupposes knowing
the ramp exists. An attendee who knows that is past their first hour.

**Two things had to be true before any of this could travel**, and one of them was a real
defect rather than a refactor. The rules hardcoded `libs/<fw>/src/lib`, a topology a
generated workspace does not have — that is the refactor. But both token-reading rules also
did a top-level `require('../scripts/lib/allowlists')`, which runs the instant `index.js`
loads the file into the `plugins` array — whenever **any** rule in the plugin is used,
enabled or not. A workspace without that file would have thrown `MODULE_NOT_FOUND` from
merely loading the plugin, before any config decision about which rules to turn on.

## Decision

**Three rules ship, wired. Six files ship, byte-identical. The cache wiring ships with
them, not after them.**

1. **The rules travel under ADR-0090's clone idiom** — `tools/stylelint-rules/` in the
   scaffold holds byte-identical copies of this repo's, and `sync-preflight.mjs`'s table
   grows from 8 pairs to 14 so either copy drifting blocks the build.
2. **All six files ship although three rules are wired.** `index.js` requires all four
   rules unconditionally, so `no-primitive-token.js` ships too — inert, never turned on. A
   scaffold-specific `index.js` that drops one `require()` was rejected: it forks a file
   the clone idiom exists to keep singular, and the cost of that fork is permanent while
   the cost of one unreferenced file is a few kilobytes.
3. **The generated `nx.json` declares the rule files and the config as `stylelint` target
   inputs.** The preset wrote nothing to `nx.json` before this change; that is the gap, not
   a reason to skip it. Both the config and the rules live outside every project that reads
   them, which is exactly the shape that serves a stale cached pass — proven twice in this
   repo while porting.
4. **`tokens.css` is excluded at the CLI (`--ignore-pattern`), not exempted in the
   config.** It is the one file that legitimately spells out raw colour and dimension
   literals, because it is where the tokens are defined; a config-level exemption would say
   the same thing in a place where it reads as an excuse.
5. **A sibling `stylelint` target, not folded into `lint`** — the same reasoning ADR-0130
   §3 records for this repo: `lint` is inferred per project, and overriding it to also
   shell out re-implements what inference gives for free.

Alternatives considered:

- **Ship all four rules wired.** Rejected on the day-one criterion, and the shape of the
  rule agrees: `no-primitive-token` carries the heaviest configuration (a forbidden-token
  catalogue and an exemption map) for the finding least likely to occur.
- **Ship the gates too.** Rejected by ADR-0125 already, and unchanged by this record: they
  join sources a one-framework customer repo does not have.
- **Wait for a `@atelier-ui/nx` plugin to carry them.** Rejected for the same reason
  ADR-0125 gives for the gates — there is one customer, and the clone idiom already has a
  guard. A package is the answer when the second workspace exists.

## Consequences

- **An attendee's first badly-written stylesheet now fails in their own workspace**, with
  a message naming the token they should have used. That is the whole point of shipping a
  rule rather than a gate: nothing has to be run for it to be seen.
- **The preset now writes `nx.json`**, a surface it never touched. Anything else that needs
  target defaults has a precedent to follow, and a new way to break a generated workspace
  if it writes carelessly.
- **One implicit coupling, documented in the generated config and enforced by nothing:**
  the scaffold passes neither `componentRoot` nor `allowlistsFile`, correct today because
  a workspace with no exemption file has no staleness to police. Someone hand-adding
  exemptions later without also adding `componentRoot` gets a scan that silently does not
  run.
- **The end-to-end proof is not a permanent gate.** It was real — tarballs, a local
  verdaccio, the published CLI installed into a temp directory outside the repo, the real
  preset generating an Angular workspace, a bad stylesheet failing its own `stylelint`
  target by name and passing once fixed — but it lives in a session scratchpad.
  `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs` is where it would live permanently;
  whether stylelint belongs in that e2e is an open item in `tasks/todo.md`, deliberately
  not decided by the change that made it provable.
- **Verified as of this record:** a scaffold-shaped fixture with no `allowlists.js` and no
  `allowlistsFile` option, where the plugin loads and the three rules each fire once and
  return exit 0 once the declarations are rewritten to tokens; the real generated workspace
  doing the same; all six clones byte-identical by `cmp`; `check:preflight-clone-sync` at
  14 pairs; `nx test create-workspace` at 97 tests; and this repo's own `check:stylelint`
  unchanged at 110 files and three `[GAP]` warnings, which is the measurement that would
  have caught the port getting blinder. **Assumed:** that `tokens.css` is the only file in
  a generated workspace that legitimately carries raw literals — true of what the preset
  writes today, not guaranteed of what an attendee adds.
