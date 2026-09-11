# A design-to-code workflow that holds what it promises — plan, 2026-09-10

_Follows `tasks/spec-format-review-2026-09-10.md`. Option A of that review (correct the
false claims) landed the same day. This is the plan for what comes after: a workflow a
one-framework team can take home, with every promise it makes backed by a check — or, if
that turns out too heavy, the smaller shape we fall back to. Nothing here is built. The
decomposition and the open questions at the end are what the owner is asked to confirm._

> **Amended the same day by `tasks/spec-rethink-2026-09-10.md`.** That document starts
> from the tools rather than from the existing spec and arrives at a thinner shape: no
> contract document; the stories are the spec, with a micro-contract block in the story
> meta. It supersedes § 2 here and changes S2 and S3 (see its § 3d); S0 (wire the idle
> browser-mode suite into CI) is added ahead of S1. The two-source model, the promises
> table, the complexity budget and S1/S4/S5/S6 stand. Shape T below remains the additive
> fallback. Read that document first; this one is kept for the reasoning it carries.

## 1. What the workflow has to promise

Written as claims a customer would repeat, each with the check that would make it true.
If a claim has no check, it is not a promise, it is a hope.

| #   | Promise                                                                                        | Held by                                                                                                                      | Today                                                                      |
| --- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| P1  | The agent knows which props exist, with their defaults and descriptions, before it writes code | The framework's docgen manifest, derived from the component (`angular-component-meta`, `vue-component-meta`, `react-docgen`) | **held** (ADR-0097)                                                        |
| P2  | The component's API matches the design: same axis names, same values, same booleans            | A check that compares the docgen manifest with a snapshot of the Figma master                                                | held only in the monorepo, and only via `libs/spec` (`check:figma`)        |
| P3  | Behaviour the picture cannot carry is written down before code and tested after                | A contract document with behaviour ids, and a check that every id is bound to a test                                         | half: the handoff document exists (ADR-0096); nothing reads it             |
| P4  | Every fact has one authored home; everything else is derived or gated                          | The component for shape, the contract document for intent, Figma for design                                                  | **not held** — a default is typed seven times                              |
| P5  | The loop runs in the customer's repo, one framework, no monorepo                               | The scaffold ships the artefacts and one command                                                                             | **not held** (review F12)                                                  |
| P6  | Verification is a gate with an exit code, not a look                                           | The check above plus the parity call with a _complete_ `codeSpec`                                                            | half: parity call exists; `codeSpec` is hand-assembled and thin specs pass |

## 2. The model: two authored sources, one external, everything else derived

The review's sharpest finding was Codex's: _authority depends on the fact_. The fix is not
to pretend one source; it is to name the authority for each kind of fact and make the
others derived or checked.

| Fact                                                                                                       | Authority                 | Form                                                                          | Derived from it                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Shape — prop names, types, unions, defaults, descriptions, events, slots                                   | **the component**         | its own input/prop types and JSDoc                                            | docgen manifest → Storybook docs, MCP prop tables, the docs table                                            |
| Intent — purpose, behaviour, a11y obligations, exclusions, anatomy, tokens per part, decisions, provenance | **the contract document** | one markdown file beside the component, fixed headings, prose inside          | behaviour-id coverage check, parity `codeSpec` (accessibility, tokens, metadata sections), story description |
| Design — axes, values, bindings, geometry, paint                                                           | **the Figma master**      | external; snapshotted as JSON beside the contract when the handoff is written | manifest ↔ snapshot check, parity call                                                                       |

Three consequences:

- **No separate type file for a one-framework repo.** The component _is_ the shape
  contract. Angular cannot bind a class to an interface anyway (review F1); docgen already
  reads the class. A `*.contract.ts` file, which the workshop case prescribes today, would
  be a fourth copy of the union with nothing reading it.
- **The handoff document becomes durable and machine-findable, not machine-authored.**
  ADR-0096's argument — the author must _decide_ behaviour and exclusions in their own
  words — stands. What changes: the file lives beside the component instead of under
  `tasks/`, its headings are fixed so a script can find the sections, and behaviour lines
  carry an id (`[b:timer-pauses-on-hover]`) so a test can claim them. Prose stays prose. This
  is a dated correction to ADR-0096, not a reversal.
- **The monorepo keeps `libs/spec/src/index.ts` as its internal join key for now.** It
  works for what it does (three adapters, one vocabulary); ripping it out during a redesign
  would put 40 gates in motion at once. Option B of the review — deriving the unions from
  the contract — stays a later decision, taken once the contract file has carried one
  cohort (§ 6, S6).

## 3. The participant's loop (one framework)

Five steps, no branch, two hand-authored artefacts, three commands.

```
0. Contract   skill prefills Source/Canon/Scope/Tokens from the master and writes the
              Figma snapshot JSON; the author writes Behaviour [b:ids], A11y, Out, Reuse.
              File: src/lib/<name>/<name>.contract.md  (+ <name>.figma.json)
1. Generate   component + story + test in the one framework; JSDoc on every input;
              defaults in code. Test file binds behaviours: covers('<name>', 'timer-pauses-on-hover')(...)
2. Check      npm run contract:check -- <name>
              → docgen the component (no Storybook build, see S1)
              → C1 manifest ↔ figma.json: axis names, values, booleans; exclusions honoured
              → C2 contract [b:ids] ↔ covers() in the test file, both directions
              → C3 tokens: CSS literals that duplicate a --ui-* token (portable rule)
              → writes <name>.codespec.json (componentAPI from the manifest, accessibility +
                tokens + metadata from the contract) for step 3
              exit code is the result
3. Parity     figma_check_design_parity with the generated codeSpec — complete by
              construction, so a clean report means something. Discrepancies go into the
              contract's Decisions section, not a chat reply.
4. Report     verified (exit codes, parity sections compared, states) vs. assumed.
```

Compared with today's skill checklist: eight steps and a repo/workshop branch become five
steps and no branch; the three-to-six gates that go "red by design" for a participant
disappear, because nothing they do touches a shared roster. That is less complexity for
the participant and more for us, once.

## 4. Complexity budget, and the fallback if we blow it

Budget per participant, Day 2 Block 02–04: **two hand-authored artefacts** (contract,
component with test and story), **three commands** (generate, check, parity), **zero
gates they cannot make green**. Budget for us: the check must run without a Storybook
build, or step 2 takes minutes instead of seconds and nobody runs it twice.

**Fallback (W3-lite), if S1 or S3 below fails the budget:** drop the contract file's
behaviour coverage (C2) and keep only C1 (manifest ↔ Figma) plus the parity call with a
manifest-assembled `codeSpec`. The handoff document stays a task file. That holds P1, P2,
P5, P6 and gives up P3 — the ADR-0096 hole reopens, and we say so in the curriculum
instead of implying coverage. Decide this at the S3 checkpoint, not before.

## 5. What this does not solve, on purpose

- **The monorepo's seven copies of a default.** The docs table and the three stories keep
  their hand-written defaults until S6 derives the docs table from the manifests. Not a
  customer promise; lower priority.
- **Metadata and `behaviors.json` in the monorepo.** Both are candidates to fold into
  per-component contract files (S6). Not touched before the format has run once outside.
- **Angular's `input()`-to-interface gap.** Structural; not fixable by a workflow. The
  manifest ↔ Figma check makes it irrelevant for P2.
- **Figma masters that lie** (invented API, missing states). `check:figma`'s
  master-side rules stay in the monorepo; a customer's Figma hygiene is the
  architect skill's job, not this loop's.

## 6. Decomposition — independently verifiable steps

Each step names what "done" means; none is done by assertion.

**S1 · Spike: docgen without a Storybook build (0.5–1 d).** Can `angular-component-meta`
(or the docgen server Storybook wraps) and `vue-component-meta` produce inputs/outputs
with defaults and JSDoc for one component file, standalone, in under five seconds? Done
when a script prints `AtlButton`'s inputs with defaults and descriptions for Angular and Vue
without `storybook build`. If no: fall back to the local `addon-mcp` `docs-show` (needs a
running Storybook) or to `storybook build --test`, and the budget in § 4 is re-checked.
_This is the feasibility question; everything in S3 depends on its answer._

**S2 · Contract file format (0.5 d).** Promote `skills/design-to-code/references/handoff-document.md`
to `<name>.contract.md`: fixed H2 headings (Source, Canonical record, Reuse or new, In
scope, Explicitly out, Token bindings, Behaviour, Accessibility, Decisions, Acceptance),
behaviour lines as `- [b:<id>] <prose>`, Source carries the snapshot file name. Done when
one existing component (AtlToast — the worked example the skill already uses) has a
committed contract file and the skill writes this file instead of `tasks/handoff-*.md`.
ADR: dated correction to ADR-0096 (headings and ids are findable; content stays prose;
still not a schema).

**S3 · `contract-check` (1.5–2 d).** One portable script, no monorepo imports: reads
`<name>.contract.md`, `<name>.figma.json`, the docgen output from S1 and the test file;
rules C1 (axis names/values/booleans, exclusions), C2 (`[b:id]` ↔ `covers()`, both
directions), C3 (token literals); emits `<name>.codespec.json`; exit code. Done when it is
green on AtlToast and AtlButton in the monorepo and **red on three negative tests**: a
renamed axis value in the Figma JSON, a removed `covers()`, an undeclared behaviour id in
a test. Ships as `tools/scripts/contract-check.mjs` here and is copied into the scaffold
preset's `files/` (same idiom as `preflight.mjs`), so there is one source and a
`check:preflight-clone-sync`-style drift gate for the copy.

**S4 · Scaffold (1 d).** The preset ships: the contract template, `contract-check.mjs`, a
`covers()` helper, a unit-test runner (today `unitTestRunner: 'none'` /
`skipTests: true`), the `contract:check` script, and a `CLAUDE.md` section that names the
loop. Done when a fresh scaffold plus the Toast brief runs steps 0–4 end to end in one
sitting, timed, and the timing is written down.

**S5 · Skill and curriculum (1 d).** `design-to-code` Build mode step 3 becomes "write
the contract file"; the repo/workshop branch collapses to one path for participants
(they never touch `libs/spec`, in the clone or the scaffold); `schulung.astro` Block 02–04
and `first-component.astro` follow; `tools/e2e/schulung-claims.e2e.mjs` asserts the new
gate set (which should be: none red by design). Done when the e2e is green and the skill's
eval fixtures pass with the new step.

**S6 · Monorepo backport — later, each its own ADR.** (a) Derive the docs table's props
from the three manifests. (b) Fold `metadata/*.ts` and `behaviors.json` into per-component
contract files. (c) Decide review Option B: derive `index.ts` unions from the contract, or
keep the join key hand-written. Not scheduled; gated on one cohort having used S2–S5.

Order: S1 → S2 ∥ S3 → S4 → S5. S1 first because it is the only step that can make the
whole shape wrong. Estimated total for S1–S5: about five working days, plus the dry run.

## 7. Open questions for the owner

1. **Location.** Contract file beside the component (`src/lib/<name>/<name>.contract.md`)
   in both the clone and the scaffold — agreed? Alternative: a `contracts/` folder per
   library. Beside-the-component keeps the rename story simple.
2. **Distribution of the check.** Vendored copy in the scaffold with a sync gate (as
   `preflight.mjs` is today), or a published `@atelier-ui/contract-check` package?
   Vendored is simpler and matches ADR-0016's stance that the release pipeline is not for
   production; a package is cleaner for customers who did not scaffold.
3. **Scope of S6.** Does the monorepo adopt contract files for its 29 components in the
   same cycle, or only after the first cohort? Recommendation: after.
4. **Scaffold weight.** S4 turns the test runner on. That adds Vitest and its config to
   every scaffolded app. Acceptable?
5. **ADR-0096.** Fixed headings plus `[b:id]` markers inside otherwise free prose — does
   that still count as "a checklist, not a schema" for you? If not, C2 is the fallback's
   first casualty (§ 4).
6. **Curriculum wording.** `schulung.astro:84` still says "libs/spec als Quelle der
   Wahrheit — Parität spürbar machen". With this plan the Day-2 sentence becomes "die
   Komponente ist die Quelle der Form, das Contract-Dokument die Quelle der Absicht" —
   change it in S5, or keep the libs/spec demo as a monorepo-only aside?

## 8. Verified vs. assumed in this plan

**Verified:** the built manifests under `dist/storybook/*/services/core/docgen/` carry
name, type, default and JSDoc description for Angular (`argTypes[...].table.defaultValue`,
category `inputs` vs internal `properties`) and name, type, default and enum schema for Vue
(`vueComponentMeta.props`) — read on 2026-09-10 for `AtlButton`. The scaffold's current
contents (review F12). The gate set that goes red today for a single-framework addition
(`tasks/lessons.md`, 2026-09-07 probe).

**Assumed:** that the docgen packages run standalone in acceptable time (S1 exists to
test exactly this); that fixed markdown headings are enough structure for C2 without
turning the document into a form; the day estimates.

**Weakest point:** the plan moves the monorepo's own duplication problem to S6 "later".
If the owner's priority is the repo's health rather than the customer's take-home, the
order flips and Option B moves up.
