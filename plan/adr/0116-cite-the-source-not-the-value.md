---
status: accepted
date: 2026-09-09
sources:
  - tasks/schulung-content-review-2026-09-08.md (§ C1, § "Gegenprobe — Codex, 2026-09-09" finding G6)
  - plan/big-picture.md (this pass's rewrite)
  - plan/figma.md (this pass's rewrite)
  - tools/scripts/gen-llms-txt.mjs, package.json (check:llms, gen:llms, sync:generated)
  - tools/figma/snapshot.json
  - skills/design-to-code/SKILL.md (its own node-id staleness warning)
  - plan/adr/0115-the-source-is-an-axis-not-a-file.md
---

# ADR-0116: Cite the source, not the value

## Status

Accepted.

## Context

`docs/src/pages/schulung.astro:192` instructs workshop participants to paste
`plan/big-picture.md` into the agent's prompt context as the ground truth for API
naming. `plan/figma.md` is cited the same way earlier in the curriculum for the Figma
file's structure. The 2026-09-08 content review (§ C1) and its Gegenprobe (finding G6)
found both documents stale in exactly the way that matters most for a prompt-context
file: `big-picture.md` used `Llm*` names throughout (the code has been `Atl*` for the
whole three-framework era) and cited a path, `libs/llm-components-react`, that does not
exist; `figma.md` carried the same `Llm*` vocabulary plus two `COMPONENT_SET` node-id
tables that `skills/design-to-code/SKILL.md` already warns its own agent about by name,
because they had gone stale before.

Fixing the names is mechanical. The harder question, raised by the node-id table
specifically, is what to do about the facts underneath the names — counts, versions,
node IDs, member lists — that are not renamed, they _decay_. The node-id table did not
go stale because someone forgot a rename; it went stale because a human transcribed a
live, generated fact into static prose, twice, and the repo added no gate that would
catch a third drift. The same failure mode was already visible elsewhere before this
pass touched it:

- The Figma text-style table locked `Inter` weights years after ADR-0035 moved the
  brand to Instrument Sans / Instrument Serif / JetBrains Mono, and the `--ui-type-*`
  role list it should have mirrored has grown three times since (8 roles → 10 →
  12, ADR-0059 → ADR-0074 → ADR-0085) — a table transcribed once cannot track that.
  Similarly, `plan/design-principles.md`'s `scale(0.97)` press-state rule was corrected
  as part of the same finding (G6) once measurement showed no component in any
  framework transforms on hover or active.
- `big-picture.md`'s CSS token example hard-coded hex/px values (`#3b82f6`,
  `0.375rem` radius) that have since changed at least once (the "Direction A" teal
  rebrand; the radius scale moved 0.375/0.5/0.75rem → 0.5/0.625/0.875rem). The token
  _names_ (`--ui-color-primary`, `--ui-radius-md`) are still exactly right; the values
  next to them were wrong the moment the brand changed, silently, because nothing reads
  this file back against `tokens.css`.
- `big-picture.md` §10 described a hand-maintained "LLM context cheat sheet file" to
  "update as part of the release process." The repo already built the real thing:
  `tools/scripts/gen-llms-txt.mjs` generates `docs/public/llms-full.txt` from the same
  component data the docs site renders, `check:llms` fails the build if the checked-in
  file and a fresh generator run disagree, and it runs inside both `check:all` and
  `sync:generated`. The document was describing an artifact weaker than the one that
  already ships, and describing it in a way indistinguishable from prose that also
  cannot be checked.

Every one of these is the same shape: a fact that lives somewhere generated or
verifiable was copied into a hand-written document as if it were itself the source.
`AGENTS.md`'s existing rule — "point at its live source instead of restating it as
prose" — already says this for ADRs. It was not yet applied to the two files an agent
is actually told to load into its own context window, which is the one place a stale
restatement does the most damage: a wrong example here does not sit unread, it becomes
generated code.

## Decision

For `plan/big-picture.md` and `plan/figma.md` — and, by the same reasoning, any other
document a skill or curriculum page tells an agent to load into its prompt context —
apply one rule at the sentence level, not the document level:

**A sentence that states architecture, a naming convention, a behavior, or a worked
example stays as prose, verified against the repo at edit time.** This is what makes
the document teach something; a principle without an example is not usable by a first
pattern-matching read, the failure mode these two documents exist to prevent.

**A sentence that states a count, a version, an inventory, or a generated value gets
repointed at its live source instead of restated**, even when the restated value is
correct today, because "correct today" is exactly the property that already failed
here three times over. Concretely, applied in this pass:

- `figma.md`'s two `COMPONENT_SET` node-id tables were replaced with a pointer to
  `tools/figma/snapshot.json` (`components[].nodeId`, keyed by `selector`) plus the one
  fact worth keeping as prose: which two entries drifted last time
  (`AtlBreadcrumbs`, `AtlPagination`), as a concrete illustration of why the table is
  gone rather than corrected in place a third time.
- `figma.md`'s Text Styles table was rewritten to name the mapping rule (`ty/<role>`
  styles mirror `--ui-type-*` roles 1:1, ADR-0059/0074/0085) and the one architectural
  fact that survives any future role being added — which roles use the display face
  vs. the UI face vs. the mono face — instead of enumerating the current role list.
- `big-picture.md`'s CSS token block keeps every token _name_ used in the original
  (still accurate) and drops every literal value, pointing at the canonical
  `tokens.css` for current numbers.
- `big-picture.md` §10 was rewritten around the real generated artifact
  (`gen-llms-txt.mjs` → `docs/public/llms-full.txt`, gated by `check:llms`) and quotes
  a trimmed, labeled excerpt of that file rather than an invented format. The version
  string and component count inside that excerpt (`0.2.41`, `28 components`) are left
  untouched _inside the quoted excerpt_ — changing them would misquote the file — but
  the surrounding prose does not restate them as document-level facts.
- Both files' component-category tables keep the category _names_, verified against
  the live Storybook sidebar (`storySort.order` plus every story's `title:` prefix in
  `libs/{angular,react,vue}/.storybook`) rather than `docs/src/data/components.ts`'s
  parallel category list, which uses `Layout` for the same two components Storybook
  still files under `Feedback` — a live, unresolved naming split between the two
  category systems, noted here rather than silently picked one side of.

## Consequences

- Both files should not need a `Llm*`-style rename pass again. They can still go stale
  on the sentences that remained prose (an example component's props, a framework's
  idiom) — that risk was accepted deliberately, because a document with no examples
  fails the curriculum's actual job (`schulung.astro:192`) even if it never goes wrong.
- This creates no new gate, the same limitation ADR-0115 named for its own ownership
  map: nothing fails CI if a future edit reintroduces a hand-transcribed count into
  either file. Enforcement is `grep -c Llm` as a manual habit and reviewer discipline,
  not a check. A `check:big-picture-drift`-shaped gate (grep both files for a small
  denylist of patterns already known to decay — hex colors, `VariableCollectionId:`,
  bare `nodeId` tables) is the natural next step if this drifts again; not built here,
  because this pass's job was corpus currency, not a new gate.
- The `Feedback` vs. `Layout` category-name split (found while verifying, not asked
  for) is left unresolved by design — `docs/src/**` is out of scope for this pass, and
  resolving it is an editorial call (pick one name, or explain why the two systems
  differ) for whoever owns that boundary next.
