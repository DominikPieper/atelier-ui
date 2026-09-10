---
name: design-to-code
description: Turns a Figma component into a verified, framework-native Atelier component in one framework, running the repo's Figma → contract → code → verify loop as a checklist that starts from a written handoff document and ends in the parity gate; also reviews one existing component across Figma and code. Use whenever the user wants to implement, build, generate or port a component from a Figma design, master, node or URL — "implement AtlToast from Figma", "build this design in Vue", a pasted figma.com/design link plus a framework, the /first-component kata, a workshop brief, "make the code match the master" — and for review or verification of one component: "review the AtlAlert master before the PR", "does AtlCard still match Figma", "design QA on X", "explain these parity discrepancies", "why does check:figma fail on X". Do NOT use for auditing or restructuring the Figma file as a whole, or for creating a Figma master from the spec (both figma-workspace-architect), for cross-framework spec changes (component-trinity), or for pure Storybook/docs edits.
---

# Design to code

Take one Figma component to a verified component in **one** framework, or review one
component across both surfaces. The loop is the one `AGENTS.md` describes — Inspect,
Contract, Generate, Verify — run as a checklist that begins with a written handoff document
and ends in a gate, because the two places this loop fails are the two ends: prompting
from a picture (behaviour never gets written down) and stopping at "looks right" (nothing
records that it was checked).

Repo-bound: it names `libs/spec`, the gates and the Atelier file. In a scaffolded
workspace outside the monorepo, run the same steps and stop where a gate does not exist
(the parity report is the last step there).

## Mode routing

| User says… | Mode | First action |
|---|---|---|
| "implement / build / generate / port X from Figma", a node URL + framework, a brief, the kata | Build | Find or write the handoff document |
| "make the code match the master again" | Build (existing component) | Handoff document with the delta as scope |
| "review the master before the PR", "design QA", "does X still match Figma", "explain these discrepancies", "why does check:figma fail on X" | Review | Pin the snapshot, then `figma_analyze_component_set` |
| "audit the file", "fix the token architecture", "create the master for X" | Out-of-scope → `figma-workspace-architect` | Say so, point there |
| "add a variant across all three frameworks" | Out-of-scope → `component-trinity` | Say so, point there |

Pick **one** framework per session (ADR-0014). The other two adapters are drift-gated
reference infrastructure; touching them is `component-trinity`'s job.

Tool names below are the `figma-console` server's unless prefixed otherwise
(`storybook-<fw>:`, `uianatomy:`) — two Figma MCP servers can be connected at once.

### Build mode

Copy this checklist into your working notes and tick it as you go:

```
- [ ] 0. Handoff document exists; mechanical half filled, decisions written by the author;
        Source line read for repo vs. workshop case (§0a)
- [ ] 1. Inspect: search → component-for-development → analyze_component_set
- [ ] 2. Canon: uianatomy bridge view read; composition vs canonical decided and recorded
- [ ] 3. Contract: repo case → micro-contract in libs/spec/src/contracts (plus the legacy
        Atl*Spec block/metadata, required until ADR-0121 S6); workshop case →
        micro-contract beside the component, libs/spec/src/index.ts untouched; new vs
        extend decided
- [ ] 4. Docs: storybook-<fw> docs-list → docs-show (local dev: story instructions first)
- [ ] 5. Generate: one framework; one story per variant value and Boolean state,
        args-based where possible, a play per behaviour line, tags: ['autodocs']
- [ ] 6. Gates: nx test <lib>, nx lint <lib>, nx storybook-test <fw> — exit codes
        read, not tails
- [ ] 7. Contract & parity: check:contracts (default for repo case, flags for workshop
        case) proves coverage and emits the codeSpec fragment; figma_check_design_parity
        with that plus figma_scan_code_accessibility and the relevant of seven sections;
        interactive Light/Dark check for stateful components; repo case → parity:record,
        workshop case → stop after the check, no record
- [ ] 8. Report: verified vs assumed; framework, states and sections named
```

#### 0. The handoff document

The document is the input, not a by-product. It is a checklist, deliberately not a schema
(ADR-0096): filling it forces the decisions a picture cannot carry — which variants are
*in*, what the timer/keyboard/live-region behaviour is, whether this is a new component
or a composition of existing ones. When the user hands you only a URL or a brief, start
the document from `references/handoff-document.md`: fill the **provenance and scope**
sections from the master (file, node id, axes, bindings, snapshot stamps) and leave
behaviour, exclusions and the reuse-vs-new decision as visible blanks, then **stop and
show it**. ADR-0096's 2026-09-07 correction allows exactly this split and no more: an
extractor that also wrote the behaviour would produce a confident document missing what
the canvas misses. The review point is the cheapest in the loop — a trainer reads the
document in thirty seconds and sees the missing behaviour before any code exists.

**§0a — repo case or workshop case: read it off the Source line.** The document's
**Source** field already names the file: the Atelier file itself (key
`QMnDD8uZQPldPrlCwZZ58T`) is the **repo case**; a duplicate in someone's own drafts is the
**workshop case**, no matter who is building it — that node will never reach
`tools/figma/snapshot.json`, which only ever indexes the Atelier file. This is not a new
question to ask; `references/handoff-document.md`'s two Source examples already show
both, and its worked example (Toast) is the workshop case throughout. The branch changes
exactly two later steps — step 3 (where the contract and, for the repo case, the legacy
spec block go) and step 7 (where the snapshot comes from and whether the run closes with
`parity:record`) — and nothing else: inspection, canon, docs, generation and gates run
identically in both cases, because both are real code in this repo, checked by the same
gates. There is no shared spec block for a workshop-case component to land any more
(ADR-0121, corrected 2026-09-10) — its own types are the API — so getting the branch
wrong no longer turns three expected-red gates into six; the three (`check:sync`,
`check:a11y-parity`, `check:design-status`) stay three. What the wrong branch actually
breaks is narrower and gate-visible on its own: a micro-contract placed under the repo
path (`libs/spec/src/contracts/`) for a node absent from `tools/figma/snapshot.json` — the
workshop node never reaches that file — makes `check:contracts` report
`[CONTRACT-ORPHAN]` for it.

#### 1. Inspect the master

Node ids are stable inside a file and are the provenance the handoff document and
`tools/figma/snapshot.json` record. They differ between the Atelier file and a
participant's duplicate, so resolve the id in the file you are actually reading and keep
the recorded one as provenance.

1. `figma_search_components` with the component name. The search also matches
   description text, so confirm the hit is the master on the Components page — a
   `COMPONENT_SET`, or a single `COMPONENT` when the component has no variant axis
   (AtlBreadcrumbs `55:139` is one) — not an instance on Inventory or a content sample
   beside the master. Then compare with `tools/figma/snapshot.json`'s entry for the
   selector. If the component already exists in the target framework, say so before
   anything else and offer Review mode; Build on an existing component is a delta, and the
   handoff document's scope section names the delta.
2. `figma_get_component_for_development` on the set. Read the variant axes,
   `boundVariables` (these are the `--ui-*` tokens, one-to-one), padding/gap/radius, and
   the description — for a repo master, `check:figma` expects it to name the `Atl*Spec`
   interface (a fact about that gate, not about where the agent looks up props); the API
   reference for the agent is the framework's own manifest, read in step 4.
3. `figma_analyze_component_set` for the state machine. Hover, focus and active are CSS
   pseudo-classes — not variants, not props. `disabled` and `loading` are boolean props in
   the manifest (`AtlButtonSpec` still declares both in `libs/spec/src/index.ts` today) and
   Figma Booleans on the master; what the
   briefs forbid is putting any of these into the *variant matrix*
   (`variant-explosion-from-states`).

If the Desktop Bridge is not connected, `figma_get_status` says so; REST-only reads are
fine for this step but may lag a recent edit.

#### 2. Check the canon

`uianatomy:get_component_view({ id, view: "bridge" })` for the canonical component. It
lists Figma ↔ code mismatches and named mistakes for exactly this kind of component. If
`search_components` finds nothing, the component *may* be a **composition** of canonical
ones — the briefs establish two (TagChip = tag-input's tag slots + badge; StatCard = card
+ badge) — or it may simply be outside the roster. Decide which and record the decision
in the handoff document; a search miss is not evidence of composition. Check the
record's `lastReviewed`; the briefs treat anything past the server's 90-day threshold as
a strong prior, not scripture.

#### 3. Settle the contract

Under ADR-0121 the hand-authored artefact is a **micro-contract** (`ComponentContract`):
the master's node id, and only intentional Figma ↔ code mismatches (`figmaOnly`,
`codeOnly`, `axisMap`, `probes`) — never props, defaults, unions, variant matrices or
prose; those live in the component's own types and JSDoc, or in a story. See
`libs/spec/src/contracts/README.md` and `types.ts` for the schema and a worked example
(`toggle.contract.ts`).

**Repo case** (§0a — Source is the Atelier file). **Two artefacts, both required until
ADR-0121 S6 retires the legacy gates.** (a) The component's block in
`libs/spec/src/index.ts` (and `metadata/`, `tokens.manifest.ts`, `behaviors.json`) — this
is not the component's spec any more, but it is still the monorepo's cross-framework
**join key**: `check:props`, `check:variants` and `check:metadata` still read it, so any
binding those gates leave ambiguous is still settled there, not in the adapter. (b) The
micro-contract, `libs/spec/src/contracts/<name>.contract.ts` (drop the `Atl` prefix,
kebab-case the rest: `AtlToggle` → `toggle.contract.ts`). For a new component, add the
spec block first, then run the generator from `tools/generators/`:
`npx nx g @atelier-ui/generators:atl-component <name> --framework=angular|react` for
Angular or React (`<name>` in kebab-case, e.g. `tag-chip` — the `atl-` file prefix and the
`Atl` class prefix are added automatically), `npx nx g
@atelier-ui/generators:atl-component-vue <name>` for Vue (see
`tools/generators/generators.json`), then write the contract. Variant property
names and values must equal the Figma axis names and values verbatim —
`variant=primary`, not `Type=Primary` — because `check:figma` and `check:contracts` both
compare them as strings.

**Workshop case** (§0a — Source is a duplicate). ADR-0113's old artefact here — a
hand-written `Atl*Spec` interface in `atl-<name>.contract.ts` — is superseded (ADR-0121,
corrected 2026-09-10): the generated component's own input types are the API, declared
directly on the component (a literal-union type beside it, no separate interface file),
and the only hand-authored artefact is the micro-contract, beside the generated component
and never a block in the shared `libs/spec/src/index.ts`: `libs/<fw>/src/lib/<name>/
<name>.contract.ts`, typed via the `@atelier-ui/spec/contracts/*` path alias
(`import type { ComponentContract } from '@atelier-ui/spec/contracts/types';`) — e.g.
`libs/angular/src/lib/tagchip/tag-chip.contract.ts`. The generator step is identical
either way — it scaffolds boilerplate and never reads `libs/spec`. `check:variants` and
`check:metadata` still read the shared `UNION_TO_COMPONENT` and
`COMPONENT_METADATA_REGISTRY` registries, both keyed off `libs/spec/src/index.ts` until
S6 — a name added there without a matching Atelier master still fails `[UNMAPPED]` /
`[MISSING-REGISTRY]`, on top of the three gates (`check:sync`, `check:a11y-parity`,
`check:design-status`) any single-framework addition already trips. Same
verbatim-against-the-Figma-axis rule for variant names and values — now also read by
`check:contracts` once step 7's flags point it at your own contract, stories and
snapshot. When you generate that snapshot (step 7), `figma-snapshot-contracts.mjs`
connects to whichever file Figma Desktop currently has open, checks it against `--file`,
and exits 2 naming both keys on a mismatch — pass your own duplicate's key, not the
Atelier file's.

#### 4. Read the framework's own docs

Call the chosen framework's hosted Storybook MCP once: `storybook-<fw>:docs-list`, then
`docs-show` for the component and for any `Atl*` part you compose. Each framework's
manifest is native (ADR-0097): two-way `[(checked)]` and split Inputs/Outputs for Angular,
`v-model`/`update:*` and typed slots for Vue, JSX `children`/`on*Change` for React. If a
prop is not documented there and not in the manifest and not in the component's types, it
does not exist — say so rather than inventing it. With the chosen framework's local
Storybook running, `AGENTS.md` makes three more calls required:
`get-storybook-story-instructions` before touching any `*.stories.*` file,
`stories-preview` after each change (include the `previewUrl`s in the report), and
`test-run` after each change — since Storybook 10.6 all three frameworks expose the same
local tool surface, not React only. Details in `references/framework-notes.md`.

#### 5. Generate

Write the component — its own types and JSDoc are the API, no separate spec interface —
its CSS, its test (Testing Library, never raw `TestBed`), and its stories in the one
framework. Bind every colour, spacing, radius and font value to a `--ui-*` custom
property; `check:css-tokens` and `check:token-bypass` catch literals, but catching them
yourself is cheaper. Elevation is CSS-only (`Library Tokens` carries no shadow variable) —
state it, do not invent one.

**The stories are the claims** (ADR-0121): one story per variant value and per Boolean
state, `args`-based wherever the story can express it that way, a `play` function for
every behaviour line the handoff document names (the `play` title names the behaviour it
proves), and `tags: ['autodocs']` on every story — autodocs is not on globally in any of
the three Storybooks, and a story without it renders a Canvas and no Docs tab, which
fails the closing check for a reason unrelated to the component. `parameters.a11y.test`
is `'error'` globally, so a story that fails axe fails the suite in step 6, not just the
panel.

#### 6. Run the gates and read the exit codes

```
nx test <lib> > /tmp/test.out 2>&1; echo $?
nx lint <lib> > /tmp/lint.out 2>&1; echo $?
nx storybook-test <fw> > /tmp/storybook-test.out 2>&1; echo $?
```

`storybook-test` renders every story in a real Chromium and runs axe against it
(`parameters.a11y.test: 'error'`) — this is where the `play` functions from step 5
actually execute; an assertion-free `play` passes it and proves nothing. Piping into
`tail` or `grep` reports the pipe's status, always `0`; this repo has already recorded a
false "all green" from exactly that. Lint through Nx, not the raw binary — the project
config is stricter.

#### 7. Prove coverage, then parity, then record it

**`check:contracts` first.** It joins the micro-contract, the framework's docgen manifest
and the stories' `args` (plus the Figma snapshot, when one is available) and reports drift
by tag — `libs/spec/src/contracts/README.md` and the header of
`tools/scripts/check-contracts.mjs` carry the full tag table. **Repo case:** the default
run, unchanged by any flag —

```
npm run check:contracts
```

**Workshop case:** your own files, none of them on the default paths —

```
node tools/scripts/check-contracts.mjs --fw <fw> \
  --contracts libs/<fw>/src/lib/<name> \
  --stories libs/<fw>/src/lib/<name> \
  --snapshot libs/<fw>/src/lib/<name>/figma.snapshot.json
```

That snapshot is generated once, with the Bridge connected, before this call:

```
node tools/scripts/figma-snapshot-contracts.mjs --file <duplicate file key> \
  --contracts libs/<fw>/src/lib/<name> \
  --out libs/<fw>/src/lib/<name>/figma.snapshot.json
```

Always give an explicit `--out` — the bare default is Atelier's own
`tools/figma/snapshot.json`, and writing there would corrupt the repo's real roster.
**Without the Bridge**, drop `--snapshot` and run the check anyway: it falls back to the
monorepo's own snapshot, which has no entry for a workshop component, so it reports
`[NO-MASTER]` for it rather than failing — the check still proves story coverage against
the manifest and, with `--emit <dir>`, still writes the codeSpec fragment below. Fix every
`error`-level finding (`AXIS`, `BOOLEAN`, `ENUM-UNDRAWN`, `COVERAGE`, `CONTRACT-NODE`,
`CONTRACT-MISSING`, `DOCGEN-EMPTY`, `STALE-EXEMPTION`) before moving on; `warning`-level
findings (`NO-MASTER`, `FIGMA-ONLY`, `FW-ONLY`, `NO-STORY-META`, `CONTRACT-ORPHAN`,
`COVERAGE-BOOL`, `UNMIRRORED`, `UNRESOLVED-ARGS`) are read, not necessarily cleared.

**Then assemble the parity `codeSpec`.** Re-run `check:contracts` with `--emit` added —
repo case:

```
npm run check:contracts -- --emit dist/codespec
```

workshop case, the same command as above with one flag added:

```
node tools/scripts/check-contracts.mjs --fw <fw> \
  --contracts libs/<fw>/src/lib/<name> \
  --stories libs/<fw>/src/lib/<name> \
  --snapshot libs/<fw>/src/lib/<name>/figma.snapshot.json \
  --emit libs/<fw>/src/lib/<name>/codespec
```

It writes `<dir>/<fw>/<Name>.codespec.json` with `componentAPI`, `metadata` and `tokens.usedTokens`
— derived from the manifest and a token scan, not hand-typed. **The parity call is
complete for exactly those three sections.** `figma_scan_code_accessibility` adds the
fourth, `accessibility`: open the story in the running Storybook, in DevTools select the
story root element and copy its `outerHTML`, then pass that string as `html` with
`mapToCodeSpec: true` — no Figma connection needed for this call. Of the seven `codeSpec`
sections (`references/parity-codespec.md`), the remaining three — `visual`, `spacing`,
`typography` — are not derived this way at all; ADR-0121's stage 2 (rendered paint against
the snapshot) is not built, so declare them only where the architect skill's
`code-verify` recipe measured them from the rendered story yourself. A section you never
assemble is never sent, and `figma_check_design_parity` does not compare what it was not
given (ADR-0024) — a thin `codeSpec` comes back clean and proves nothing for the sections
it omits, so name in the report exactly which sections you passed; do not imply a
fully-populated `codeSpec` is the default outcome, because for most runs it is not.

`figma_check_design_parity` needs the Desktop Bridge connected. Without it the loop stops
after `check:contracts` and `storybook-test` — that is a degraded run (no snapshot,
`check:contracts` reporting `[NO-MASTER]`, no parity call at all), not something to
"continue" past.

`figma_check_design_parity` then compares that codeSpec against the node. Know the tool's
ceiling: a static tree read reaches only the default state — on AtlSelect four of
five painted states sit behind pseudo-classes — so for any stateful component also run the
interactive Light/Dark check in the architect skill's `code-verify` reference. Read every
discrepancy and decide: fix the code, fix the master (an architect Build/Migrate task), or
record it as intentional. **Record it durably** — in the handoff document (Build), in
`FIGMA_CONFORMANCE_EXCEPTIONS` with a reason when it is a standing exception, or as an
open decision item in `tasks/todo.md` naming the component and the value. A commit
message or a chat reply is not a record. This much is identical in both cases (§0a). Then,
once every discrepancy is fixed or durably recorded, the two cases end differently:

**Repo case** (Source is the Atelier file):

```
npm run parity:record -- --component <AtlName> [--node <id>]
```

The score is deliberately not stored (ADR-0024); the record's hash lets `check:parity`
flag the component when its inputs change later. The hash covers all three frameworks'
inputs and the record stores no framework, state list or declared sections — so the
report, not the record, says which framework, which states and which sections were
compared.

**Workshop case** (Source is a duplicate): stop here — **no `parity:record`**. The node
lives only in the participant's duplicate; `tools/figma/snapshot.json` indexes the
Atelier file, so `check:parity`'s hash would have nothing of the repo's to watch, and a
record written against a component absent from the roster is worse than none — the same
reasoning ADR-0024 gives for a moved node applies here to a node that was never in the
file the gate reads. The ad-hoc `figma_check_design_parity` call above — run, read,
decided and reported — is the closing check; `schulung.astro`'s Erfolgs-Verifizierung
already draws this exact line between the MCP call and the repo gate.

In a scaffolded workspace (outside the monorepo, no gates at all), stop at the parity
report regardless of case.

Optional last check: `uianatomy:validate_implementation` with the component source. Treat
`missing` entries as a checklist — substring search has false negatives.

#### 8. Report

Two lists, never merged: what you **verified** (gate exit codes, parity discrepancies and
what each one means, the recorded node id, framework/states/sections) and what you
**assumed** (behaviour taken from the brief but not testable in Storybook, values read
while the Bridge was disconnected). Include the Storybook `previewUrl` if the local addon
exposed one.

### Review mode

One component, both surfaces, at PR time or after a change. The architect's Audit mode
covers the *file*; this covers *this component* and its code. Output uses the shape of the
architect skill's audit-report template (its `audit-report-template` asset): priority
list first, every finding with a severity and a one-line fix, then the questions only a
human can answer.

```
- [ ] R0. Pin: git SHA + Figma lastModified (npm run figma:snapshot if the master moved)
- [ ] R1. Figma side: analyze_component_set vs variantMatrix; lint; a11y audit;
         the five check:figma items; description names Atl*Spec; Inventory tile is INSTANCE
- [ ] R2. Code side: check:contracts (repo default, or workshop flags); parity with
         declared sections; scan_code_accessibility; check:parity
- [ ] R3. Interactive: each state, Light and Dark (code-verify.md) for stateful components
- [ ] R4. Human prompts: detach test, non-colour signal, leading, behaviour the brief names
- [ ] R5. Report: Blockers first; known false positives named, not re-fixed
```

- **R0.** A review of a moved master is a review of the wrong thing. Read
  `tools/figma/snapshot.json`'s `meta`, compare with `figma_get_file_versions
  (max_versions: 1)` (ADR-0105), refresh if needed, and write both stamps into the
  report header.
- **R1.** `figma_analyze_component_set` gives axes and values — compare verbatim with the
  framework's manifest enum props and the micro-contract; `variantMatrix` is the legacy
  metadata `check:figma` still reads for a repo master, so check that stays aligned too.
  Any axis outside the union is either an interaction state drawn
  as a variant (finding) or a documented exception in `FIGMA_CONFORMANCE_EXCEPTIONS`
  (`tools/scripts/lib/allowlists.js` — read it before flagging). `figma_lint_design` on
  the set, `figma_audit_component_accessibility` (≥ 85 per `plan/figma.md`). The five
  `check:figma` items (`plan/figma-component-checklist.md`) are what `npm run check:figma`
  reports; run it and quote it rather than re-deriving.
- **R2.** Run `check:contracts` first — repo case: the default `npm run check:contracts`;
  workshop case: Build step 7's flags against the component's own contract, stories and
  snapshot. Its `error`-level findings are review findings, not merely reported. Then as
  Build step 7 for the parity `codeSpec` and the call itself. Re-record (`parity:record`)
  only when the user asked for it *and* every discrepancy is fixed or durably recorded —
  Review has no handoff document, so "intentional" here means an allowlist entry with a
  reason or an open `tasks/todo.md` decision item; a gap that is merely mentioned in an
  old commit message is open, not recorded. Say "clean" or "clean except <named, recorded
  gap>", never just "clean".
- **R3.** Static parity reaches about a fifth of what Figma paints; a review that skips
  the interactive pass says so explicitly.
- **R4.** The questions no tool answers, phrased for the reviewer: would a designer new
  to the library need to detach this to use it; does every status colour have a
  non-colour signal; does the root text state its leading (the ungated `[ROOT-PAINT]`
  hole in `plan/figma.md`); does the brief name behaviour the master cannot show.
- **R5.** `references/review-checklist.md` carries the severity table and the known
  false positives (page-level `wcag-color-only` on Badge/Alert/Toast, the empty
  `card-section-2` frames) so they are named, not re-fixed.

## Examples

**"Implement TagChip in React from my handoff doc"** → Build. Read the document, confirm the
node id resolves and the composition claim (tag-input slots + badge). If the document's
Source names a duplicate (this is the workshop `tagchip.md` brief in its usual shape) —
own `tag-chip.contract.ts` beside the component (typed via `@atelier-ui/spec/contracts/*`),
`libs/spec/src/index.ts` untouched, generator, React docs for `AtlBadge`, component with
its own prop types + stories with a `play` per behaviour line, gates including
`storybook-test`, `check:contracts` with the workshop flags, parity with the declared
sections, **no `parity:record`**. If Source instead names the Atelier file, the same steps
run with both the legacy spec block added to `libs/spec/src/index.ts` and a
`libs/spec/src/contracts/tag-chip.contract.ts` micro-contract (until ADR-0121 S6 retires
the former), the default `check:contracts` run, and the run closing on `parity:record`.

**"Build this in Vue: figma.com/design/QMnDD8uZQPldPrlCwZZ58T/...?node-id=55-141"** → Build,
stops early. No handoff document. Inspect node `55:141` (AtlBreadcrumbs), fill the
mechanical half, show it, wait. The prompt-from-a-picture path is the one this skill exists
to prevent.

**"Does AtlCard still match Figma after the token change?"** → Review, verify slice. Pin,
node from `tools/figma/snapshot.json`, declared `codeSpec`, parity, compare with
`tools/figma/parity.json`. Re-record only if the user asked and every discrepancy is
fixed or durably recorded; a known-but-undecided gap gets a `tasks/todo.md` item first,
and the report says "clean except …".

**"Review the AtlAlert master before I open the PR"** → Review, full. Pin, R1–R4, report
with the `wcag-color-only` false positive named up front.

## Common edge cases

- **The handoff document's Source names a duplicate, not the Atelier file.** That is the
  workshop case (§0a, step 3, step 7) — own micro-contract, no `parity:record` —
  regardless of who is building it or whether it might one day become a real Atelier
  component.
  Promoting it later is a fresh Build against the real master and its own node, not
  editing this run's files or records in place.
- **Master and spec disagree on an axis value.** Do not pick a side silently. The contract
  names the master; the manifest is the API; `check:contracts` compares them, and the
  master is what `check:figma` reads. Report the mismatch and let the
  owner choose — usually the fix is a rename on the Figma side (architect, Migrate).
- **Contract without a master.** Compare against the `components[].selector` list in
  `tools/figma/snapshot.json` rather than trusting a plan document — the node table in
  `plan/figma.md` has been stale before (it still lists `55:141` for AtlBreadcrumbs; the
  master is `55:139`) — and expect `check:contracts` to say the same thing itself, as
  `[NO-MASTER]`, once a contract and a story exist with nothing to compare against. Build
  cannot start without a node: the master is an architect Build task first; record that
  order in the handoff document and stop.
- **The node in the URL does not exist.** A pasted link can predate a rebuild. Establish
  that with one read-only call — `figma_execute` running `await figma.loadAllPagesAsync();
  return figma.getNodeByIdAsync('<id>')` — before saying anything about what the node
  *is*. If it returns `null`, say "does not exist", name the master the snapshot records
  for that component name, ask for a fresh link, and never pick a neighbouring id as a
  guess. A story's `figmaNode('…')` link or a plan table naming the id is a claim about the
  past, not evidence the node resolves today; the first eval run of this skill stated a
  dead id was "a content-sample instance beside the master" on exactly that kind of
  evidence, and it was false.
- **The brief demands behaviour Storybook cannot show** (timer pause on hover, Escape to
  close). Test it in a `play` function or the component's test file; list it under
  *verified* only when a test pins it.
- **Bridge down.** Inspect via REST, but do not run parity or record — the parity call
  needs the live plugin, and a record without a real run is worse than none.
- **Colour is the only signal for a status variant.** Stop; that is a WCAG 1.4.1 finding
  the master must fix before code copies it.
- **The user says "just build it" without a document.** Fill the mechanical half, ask the
  three blanks as three questions, and build only once they are answered; the answers go
  into the document, not only into the chat.

## References

- `references/handoff-document.md` — the checklist template with one worked example and
  the line between what the agent may prefill and what the author writes.
- `references/parity-codespec.md` — the seven `codeSpec` sections, which to declare, the
  ~2 px / 0.01 opacity tolerance, the static-read ceiling, why the score is not stored.
- `references/framework-notes.md` — per-framework binding shapes, hosted vs local
  Storybook MCP surfaces and which calls `AGENTS.md` makes required; points at ADR-0097
  rather than restating prop tables.
- `references/review-checklist.md` — Review mode's severity table mapped to the tool or
  gate that checks each item, and the known false positives.
- The architect skill's `code-verify` reference (in `skills/figma-workspace-architect`,
  not copied here) — the interactive Light/Dark verification recipe for stateful
  components.
