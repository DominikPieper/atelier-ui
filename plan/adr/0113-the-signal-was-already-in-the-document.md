---
status: accepted
date: 2026-09-09
sources:
  - tasks/schulung-content-review-2026-09-08.md (§ Gegenprobe — Codex, 2026-09-09, finding G1)
  - tasks/schulung-review-2026-09-05.md (§ B1, the gate reproduction table)
  - skills/design-to-code/SKILL.md
  - skills/design-to-code/references/handoff-document.md
  - docs/src/pages/schulung.astro (Tag 2, Block 02)
  - schulung-2tage-agenda.md
  - plan/adr/0096-the-handoff-a-picture-cannot-carry.md (the document this ADR branches, and its provenance-is-mechanical correction)
  - plan/adr/0024-design-parity-persistence-gate.md (why a record against the wrong node is worse than none)
  - plan/adr/0014 (one framework per session — the shape §0a's branch had to fit inside)
---

# ADR-0113: The signal was already in the document

## Status

Accepted. `design-to-code`'s Build mode now has an explicit repo/workshop branch (§0a),
and the training curriculum points at it instead of working around it.

## Context

`design-to-code`'s Build mode and the two-day training curriculum gave a participant
opposite instructions for the same decision — where does *this* component's spec go —
and each instruction was correct only in its own context:

- `skills/design-to-code/references/handoff-document.md:36` (pre-fix): **"Target files.**
  `libs/<fw>/src/lib/<name>/…` ; spec block in `libs/spec/src/index.ts`."` — correct for a
  real Atelier component: the spec is the ground truth all three adapters are
  drift-gated against.
- `docs/src/pages/schulung.astro:178` (pre-fix): *"Eigene Spec als eigene Datei neben der
  Komponente, **nicht in den geteilten Master**"* — correct for a workshop participant's
  component, which has no place in `libs/spec/src/index.ts`'s roster.

Neither sentence was wrong. The skill had no branch, so it stated only the repo answer;
the curriculum, aware of the collision, worked around the skill with a standalone
instruction rather than fixing the skill. `tasks/schulung-review-2026-09-05.md`'s §B1
reproduction measured the cost of getting the branch wrong in the workshop direction:
a single-framework addition already trips `check:sync`, `check:a11y-parity` and
`check:design-status` (three reds, expected, no fault of the participant's work); adding
the spec block to the shared master adds `check:spec`, `check:variants` (`[UNMAPPED]`)
and `check:metadata` (`[MISSING-REGISTRY]`) on top — six, and the room had no way to
tell the two states apart. The skill's completion path had the matching defect on the
parity side: `SKILL.md`'s Build checklist ran `npm run parity:record` unconditionally,
while `schulung.astro` already correctly taught that a participant's node is not in
`tools/figma/snapshot.json` and that the closing check there is the ad-hoc
`figma_check_design_parity` MCP call, not the repo gate.

## Decision

**Give Build mode an explicit repo-vs-workshop branch (`SKILL.md` §0a), keyed on a
signal the handoff document already collects — not a new question, mode, or field.**

The handoff document's **Source** line (`references/handoff-document.md`) already has to
name the file the node lives in: the Atelier file itself (key `QMnDD8uZQPldPrlCwZZ58T`),
or a duplicate in someone's own drafts. ADR-0096's 2026-09-07 correction already
establishes that this line is filled from real inspection (`figma_search_components` →
`figma_get_component_for_development`), not typed from memory — it is a mechanical
provenance fact, not a self-report. §0a reads that same line as the answer to "repo case
or workshop case": a duplicate never reaches `tools/figma/snapshot.json`, which only
indexes the Atelier file, and that one fact is what both branch decisions turn on.

The branch touches exactly two of the checklist's nine steps and nothing else:

- **Step 3 (spec placement).** Repo case: block added to `libs/spec/src/index.ts`,
  as before. Workshop case: the spec becomes its own file beside the generated
  component (`libs/<fw>/src/lib/<name>/atl-<name>.contract.ts`); the generator itself is
  unaffected either way, since it scaffolds boilerplate and never reads `libs/spec`.
- **Step 7 (closing check).** Repo case: `npm run parity:record`, unchanged. Workshop
  case: stop after the ad-hoc `figma_check_design_parity` call — no record — because
  `check:parity`'s hash would have nothing of the repo's to watch, mirroring the
  reasoning ADR-0024 already gives for a moved node.

Alternatives considered and rejected:

- **A third top-level `### Workshop mode` heading.** Rejected: `tools/scripts/test-skill.mjs`
  derives every fixture's valid `mode` value from `### <Name> mode` headings in
  `SKILL.md`, and the mode-routing table already lists "a workshop brief" and "the kata"
  as *Build* triggers. A separate mode would fork one nine-step loop that differs in two
  places into two parallel checklists, and would force every workshop fixture to declare
  `mode: Workshop` for what is, apart from those two steps, the same procedure — the
  "bolt on a mechanism the file's structure fights" the assignment warned against.
- **Asking an explicit question every time** ("is this a workshop component?").
  Rejected as redundant: step 0 already forces the author to name the file the node
  lives in, to satisfy the Source line ADR-0096 requires. Asking again duplicates a
  decision already made one step earlier.
- **A new explicit field on the handoff document** (e.g. a `Context: repo | workshop`
  line). Rejected per ADR-0096 itself: the document is deliberately a checklist, not a
  schema, precisely because a schema lets an author fill a field without making the
  decision behind it. The Source line's two existing example shapes already carry the
  distinction in prose; a second field naming the same fact would be exactly the
  schema-creep ADR-0096 ruled out.
- **Keying the branch on the component's name or brief** (e.g. "if it's one of the four
  workshop briefs, it's the workshop case"). Rejected: the whole point of the briefs
  (`workshop/briefs/README.md`) is that Toast and Avatar are canonical components a real
  Atelier build might also target one day; the component's *name* says nothing about
  which file its node lives in. Only the Source line does.

The curriculum was corrected in the direction of pointing at the mechanism instead of
substituting for it: `schulung.astro:178` and the matching passage in
`schulung-2tage-agenda.md` (both had carried the same standalone instruction, one commit
apart per the 09-05 review) now say that the skill reads the handoff document's Source
line and routes automatically, rather than instructing the room to redirect Claude by
hand. Both files were checked to still agree after the edit.

## Consequences

- The repo case is unweakened: every step it used to run — spec block in
  `libs/spec/src/index.ts`, `atl-component` generator, `parity:record` — still runs
  exactly as before when Source names the Atelier file. A new fixture
  (`tests/build-from-handoff-repo-master`) exercises this path end to end, because
  fixing the existing TagChip fixture (below) would otherwise have left it untested.
- `tests/build-from-handoff-react` was, by its own prose ("the node id belongs to the
  user's duplicate, not the Atelier file"), already the workshop case — but its Required
  Surface still asserted the old unconditional behaviour (spec block, `parity:record`).
  It is corrected here rather than left as a passing fixture that never exercised its own
  stated scenario. `skills/design-to-code/evals/evals.json`'s eval #1 carried the same
  stale assertion for the same prompt and is corrected alongside it, though it sits
  outside the `tests/` fixtures the grading script validates.
- **Nothing enforces that the Source line is true.** The branch is only as reliable as
  that line, and nothing re-checks it against the node's actual file at steps 3 or 7 —
  step 1's inspection resolves the real file, but a stale or hand-edited handoff document
  reviewed loosely could still claim "duplicate" for a real master or vice versa. A wrong
  branch in the workshop direction reproduces exactly the six-red-gate failure §B1
  measured; wrong in the repo direction, it silently drops a real component's parity
  record. The handoff document's own review point (ADR-0096: a trainer reads it before
  code exists) and step 1's inspection are the only things that catch this — there is no
  gate that reads a participant's prose, and building one would reopen the
  machine-readable-format question ADR-0096 already closed.
- The curriculum change is a documentation convention, not a gate: nothing stops a future
  edit to `schulung.astro` or the agenda from reintroducing a standalone workaround
  instruction if this ADR is not read first.

**Corrected 2026-09-10.** Step 3's workshop artefact is superseded, not its branch.
ADR-0121 (`plan/adr/0121-the-stories-are-the-spec.md`) retires the hand-written
`Atl*Spec` interface this record's step 3 described — `atl-<name>.contract.ts` beside the
generated component — in favour of a micro-contract, `<name>.contract.ts` (an object
literal typed by `ComponentContract`, not an interface: the master's node id and only
intentional Figma ↔ code mismatches), and the participant's component now declares its
own input types directly rather than importing them from that file. The branch itself —
the Source line deciding repo case vs. workshop case — is unchanged, and §0a of
`design-to-code`'s `SKILL.md` still reads it the same way; the branch now additionally
decides where the participant's Figma snapshot is written (`figma-snapshot-contracts.mjs
--out`, always explicit, never the tool's own default). Step 7's branch (whether the run
closes on `parity:record`) is likewise unchanged. `tools/e2e/schulung-claims.e2e.mjs`'s
"spec in the shared master" scenario — appending a spec block to
`libs/spec/src/index.ts` and asserting three more red gates — is retired along with it:
there is no spec left to land there, so the scenario has nothing left to reproduce.
