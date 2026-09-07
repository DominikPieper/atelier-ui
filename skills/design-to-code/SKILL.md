---
name: design-to-code
description: Turns a Figma component into a verified, framework-native Atelier component in one framework, running the repo's Figma → spec → code → verify loop as a checklist that starts from a written handoff document and ends in the parity gate; also reviews one existing component across Figma and code. Use whenever the user wants to implement, build, generate or port a component from a Figma design, master, node or URL — "implement AtlToast from Figma", "build this design in Vue", a pasted figma.com/design link plus a framework, the /first-component kata, a workshop brief, "make the code match the master" — and for review or verification of one component: "review the AtlAlert master before the PR", "does AtlCard still match Figma", "design QA on X", "explain these parity discrepancies", "why does check:figma fail on X". Do NOT use for auditing or restructuring the Figma file as a whole, or for creating a Figma master from the spec (both figma-workspace-architect), for cross-framework spec changes (component-trinity), or for pure Storybook/docs edits.
---

# Design to code

Take one Figma component to a verified component in **one** framework, or review one
component across both surfaces. The loop is the one `AGENTS.md` describes — Inspect,
Spec, Generate, Verify — run as a checklist that begins with a written handoff document
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
- [ ] 0. Handoff document exists; mechanical half filled, decisions written by the author
- [ ] 1. Inspect: search → component-for-development → analyze_component_set
- [ ] 2. Canon: uianatomy bridge view read; composition vs canonical decided and recorded
- [ ] 3. Spec: block read/written in libs/spec; new vs extend decided
- [ ] 4. Docs: storybook-<fw> docs-list → docs-show (local dev: story instructions first)
- [ ] 5. Generate: one framework, story with tags: ['autodocs'], every value via --ui-*
- [ ] 6. Gates: nx test <lib>, nx lint <lib> — exit codes read, not tails
- [ ] 7. Parity: figma_check_design_parity with the relevant of seven sections;
        interactive Light/Dark check for stateful components; parity:record
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

#### 1. Inspect the master

Node ids are stable inside a file and are the provenance the handoff document and
`tools/figma/snapshot.json` record. They differ between the Atelier file and a
participant's duplicate, so resolve the id in the file you are actually reading and keep
the recorded one as provenance.

1. `figma_search_components` with the component name. The search also matches
   description text, so confirm the hit is a `COMPONENT_SET` on the Components page (the
   Inventory page holds instances of the same name).
2. `figma_get_component_for_development` on the set. Read the variant axes,
   `boundVariables` (these are the `--ui-*` tokens, one-to-one), padding/gap/radius, and
   the description — it names the `Atl*Spec` interface when the master is conformant.
3. `figma_analyze_component_set` for the state machine. Hover, focus and active are CSS
   pseudo-classes — not variants, not props. `disabled` and `loading` are boolean props in
   the spec (`AtlButtonSpec` declares both) and Figma Booleans on the master; what the
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

Read the component's block in `libs/spec/src/index.ts` (and `metadata/`,
`tokens.manifest.ts`, `behaviors.json`). The spec is the ground truth all three adapters
and the hosted Storybook manifests are drift-gated against, so any binding the docs leave
ambiguous is settled here, not in the adapter. For a new component, add the spec block
first, then run the generator from `tools/generators/`: `atl-component
--framework=angular|react` for Angular or React, `atl-component-vue` for Vue (see
`tools/generators/generators.json`). Variant property names and values must equal the
Figma axis names and values verbatim — `variant=primary`, not `Type=Primary` — because
`check:figma` compares them as strings.

#### 4. Read the framework's own docs

Call the chosen framework's hosted Storybook MCP once: `storybook-<fw>:docs-list`, then
`docs-show` for the component and for any `Atl*` part you compose. Each framework's
manifest is native (ADR-0097): two-way `[(checked)]` and split Inputs/Outputs for Angular,
`v-model`/`update:*` and typed slots for Vue, JSX `children`/`on*Change` for React. If a
prop is not documented there and not in the spec, it does not exist — say so rather than
inventing it. With a local Storybook running (React), `AGENTS.md` makes three more calls
required: `get-storybook-story-instructions` before touching any `*.stories.*` file,
`stories-preview` after each change (include the `previewUrl`s in the report), and
`test-run` after each change. For Angular and Vue the equivalent is `nx test <lib>` plus
a manual preview in the running Storybook. Details in `references/framework-notes.md`.

#### 5. Generate

Write the component, its CSS, its spec test (Testing Library, never raw `TestBed`) and its
story in the one framework. The story declares `tags: ['autodocs']` — autodocs is not on
globally in any of the three Storybooks, and a story without it renders a Canvas and no
Docs tab, which fails the closing check for a reason unrelated to the component. Bind every
colour, spacing, radius and font value to a `--ui-*` custom property; `check:css-tokens`
and `check:token-bypass` catch literals, but catching them yourself is cheaper. Elevation is
CSS-only (`Library Tokens` carries no shadow variable) — state it, do not invent one.

#### 6. Run the gates and read the exit codes

```
nx test <lib> > /tmp/test.out 2>&1; echo $?
nx lint <lib> > /tmp/lint.out 2>&1; echo $?
```

Piping into `tail` or `grep` reports the pipe's status, always `0`; this repo has already
recorded a false "all green" from exactly that. Lint through Nx, not the raw binary — the
project config is stricter.

#### 7. Prove parity, then record it

`figma_check_design_parity` compares only the `codeSpec` sections you declare — there are
seven: visual, spacing, typography, tokens, componentAPI, accessibility, metadata
(`references/parity-codespec.md`). Declare every section the handoff document touches; a
thin spec comes back clean and proves nothing. `figma_scan_code_accessibility` with
`mapToCodeSpec: true` builds the accessibility slice from the rendered story. Know the
tool's ceiling: a static tree read reaches only the default state — on AtlSelect four of
five painted states sit behind pseudo-classes — so for any stateful component also run the
interactive Light/Dark check in the architect skill's `code-verify` reference. Read every
discrepancy and decide: fix the code, fix the master (an architect Build/Migrate task), or
record it as intentional in the handoff document. Then:

```
npm run parity:record -- --component <AtlName> [--node <id>]
```

The score is deliberately not stored (ADR-0024); the record's hash lets `check:parity`
flag the component when its inputs change later. The hash covers all three frameworks'
inputs and the record stores no framework, state list or declared sections — so the
report, not the record, says which framework, which states and which sections were
compared. In a scaffolded workspace, stop at the parity report.

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
- [ ] R2. Code side: parity with declared sections; scan_code_accessibility; check:parity
- [ ] R3. Interactive: each state, Light and Dark (code-verify.md) for stateful components
- [ ] R4. Human prompts: detach test, non-colour signal, leading, behaviour the brief names
- [ ] R5. Report: Blockers first; known false positives named, not re-fixed
```

- **R0.** A review of a moved master is a review of the wrong thing. Read
  `tools/figma/snapshot.json`'s `meta`, compare with `figma_get_file_versions
  (max_versions: 1)` (ADR-0105), refresh if needed, and write both stamps into the
  report header.
- **R1.** `figma_analyze_component_set` gives axes and values — compare verbatim with the
  spec's `variantMatrix`; any axis outside the spec is either an interaction state drawn
  as a variant (finding) or a documented exception in `FIGMA_CONFORMANCE_EXCEPTIONS`
  (`tools/scripts/lib/allowlists.js` — read it before flagging). `figma_lint_design` on
  the set, `figma_audit_component_accessibility` (≥ 85 per `plan/figma.md`). The five
  `check:figma` items (`plan/figma-component-checklist.md`) are what `npm run check:figma`
  reports; run it and quote it rather than re-deriving.
- **R2.** As Build step 7, without the record unless the review is the verification.
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
node id resolves and the composition claim (tag-input slots + badge), spec block, generator,
React docs for `AtlBadge`, component + story + test, gates, parity with the declared
sections, `parity:record`, report.

**"Build this in Vue: figma.com/design/QMnDD8uZQPldPrlCwZZ58T/...?node-id=55-141"** → Build,
stops early. No handoff document. Inspect node `55:141` (AtlBreadcrumbs), fill the
mechanical half, show it, wait. The prompt-from-a-picture path is the one this skill exists
to prevent.

**"Does AtlCard still match Figma after the token change?"** → Review, verify slice. Node
from `tools/figma/snapshot.json`, declared `codeSpec`, parity, compare with
`tools/figma/parity.json`, re-record only if clean and the user asked.

**"Review the AtlAlert master before I open the PR"** → Review, full. Pin, R1–R4, report
with the `wcag-color-only` false positive named up front.

## Common edge cases

- **Master and spec disagree on an axis value.** Do not pick a side silently. The spec is
  the contract; the master is what `check:figma` reads. Report the mismatch and let the
  owner choose — usually the fix is a rename on the Figma side (architect, Migrate).
- **Spec exists but there is no master** (AtlPagination as of ADR-0106; AtlBreadcrumbs has
  items but no container set). Build cannot start without a node — the master is an
  architect Build task first; record that order in the handoff document and stop.
- **The brief demands behaviour Storybook cannot show** (timer pause on hover, Escape to
  close). Test it in the spec file; list it under *verified* only when a test pins it.
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
