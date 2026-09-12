---
status: accepted
date: 2026-09-12
sources:
  - a pilot on `accordion` in all three frameworks, 2026-09-11/12 — nine behaviours written as story plays, seven deleted again
  - libs/spec/src/behaviors.json (151 behaviours, 29 subjects) and tools/parity/behavior-coverage.mjs
  - plan/adr/0011-typed-covers-behavior-gate.md (the `covers()` binder these stories do not use)
  - plan/adr/0121-the-stories-are-the-spec.md (Decision 2's "the play title is the behaviour id", and its 2026-09-11 correction)
  - plan/adr/0124-a-gate-that-measured-nothing.md (rule 1 — a printed counter is asserted or removed)
  - plan/adr/0128-a-skip-is-a-finding-and-a-finding-names-which.md (the three ratcheted skip buckets a new population must not hide in)
  - libs/{angular,react,vue}/vite.config.mts (`environment: 'jsdom'` — why most plays prove nothing new)
---

# ADR-0129: A story that demonstrates a behaviour is not a variant sample

## Status

Accepted 2026-09-12, from a pilot that was commissioned to roll out and instead argued itself
down by a factor of four.

## Context

The instruction was to give stories `play` functions with tests. Measuring first, three facts
changed what that means.

**The behaviour manifest is a record, not a roster.** `behaviors.json` holds 151 behaviours
over 29 subjects, and all 151 are bound by `covers()` in all three frameworks — 453 checks,
green. That is true by construction: the file's own `$comment` says it "locks behaviors
currently covered in all three adapters". It cannot show a gap, because it is built from what
is already covered. A targeted sweep for interactive affordances with no id found five real
ones immediately — tooltip's focus/blur and Escape paths against four hover-only ids, menu's
Escape, outside-click and arrow-key navigation (all of it, in Angular delegated to
`@angular/cdk/menu`), dialog's and drawer's native `cancel` event, chat's `drawer` variant
which is its _default_ and is unlisted where `inline` and `popup` are named, and table's
`onSort`/`onSelectedChange` behind ids that only assert the control renders.

**Of 151 behaviours, 49 are things a reader learns from watching.** The other 96 are static
render facts derived from props — a class or ARIA attribute mirroring an input — which a
`play` would only re-render, and 6 are both.

**Then the pilot: of accordion's nine, two earn a play and seven do not.** The seven fire the
same click and assert the same attribute as the spec that already covers the id. The two that
earn it — `expand-on-click`, `collapse-on-click` — assert real rendered height, and the unit
specs run in jsdom, which computes no layout at all; the component discloses through
`grid-template-rows: 0fr → 1fr`, so height is the only observable and jsdom can never see it.
The pilot looked specifically for a third in the keyboard group and found none: jsdom
implements `activeElement`, `.focus()` and `.blur()` fully, and this component moves focus by
explicit `.focus()` calls rather than native Tab order.

So the discriminator is not "is it an interaction". It is **does the assertion depend on
computed layout** — or on real focus order, or on browser event sequencing that jsdom
simulates rather than performs.

**And behaviour stories collide with the paint gate.** Nine new stories produced nineteen new
`GEOMETRY` findings across three frameworks, because `AtlAccordionGroup` is `display: block`
with auto height and every item-count-and-expanded-state combination renders a different pixel
height against the master's one fixed 222px row — the same structural meaninglessness the six
existing variant stories' findings are already recorded for. At 49 behaviours × 3 frameworks
that is over a hundred meaningless entries.

## Decision

**A `play` is written only where a jsdom spec cannot reach. A story that demonstrates a
behaviour declares which one, and is therefore not measured as a variant sample.**

1. **The bar for a play is that it proves something no unit spec can**: computed layout, real
   focus order, real browser event sequencing. Every behaviour is already covered three times
   over in jsdom, so a play is not an additional test — it is a test in a different
   environment, and it earns its place only where that environment is the point. A play that
   repeats a spec is the decoration ADR-0121's own Consequences warn against.
2. **`parameters.behaviour: '<subject>/<id>'`**, a plain string, per story. It is the
   machine-readable form of ADR-0121 Decision 2's "the play title is the behaviour id" —
   Storybook has no separate play title, so the alternative was the story's display name and
   nothing checkable.
3. **The id is validated against `behaviors.json`. An unknown id is a hard error** naming the
   story, in the same unconditional class as `[NO-INDEX-ENTRY]` and `[PLAY-TIMEOUT]` — it
   blocks even `--update-baseline`, and it is deliberately not a ratchet, because unlike the
   three recurring skip populations there is no legitimate reason for the id to be wrong.
4. **A declaring story is excluded from paint, geometry and type comparison, structurally**:
   the check runs before any demo, render or probe classification and returns, so such a story
   cannot reach `measured`, `skipped-demo`, `not-rendered` or `no-probe`. Its own count is
   printed and asserted (a duplicate would fail an invariant), and it is never folded into one
   of ADR-0128's ratcheted buckets, where a new population would hide.

**This is a declaration, not an opt-out, and the distinction is the point.** A
`parameters.paint: false` would be a mute button: it invites silencing exactly the measurements
this repo spent two days un-silencing. Here the exemption is only grantable by making a claim
the manifest can reject — to escape measurement a story must name a behaviour that actually
exists, which is not something a person reaches for to quiet an inconvenient finding.

Alternatives considered:

- **Write all 49.** Rejected on the pilot's own count: seven of nine were decoration, and the
  sidebar-visibility argument for them does not survive the runtime cost and the paint noise.
- **`parameters.paint: false`.** Rejected as above.
- **Record the manufactured findings**, as the six existing accordion variant stories'
  findings already are. Rejected: it doubles a population already known to be structurally
  meaningless, which is the noise-recording failure refused twice while getting here.
- **Put the behaviour binding in the story's name only.** That is the status quo and it is
  unenforced; a name is not checkable against the manifest without a convention nobody can
  verify.

## Consequences

- **49 is an upper bound, not a work item.** It counts interactions worth watching; the work
  item is the subset whose assertion depends on layout, focus order or event sequencing, and
  the pilot's ratio suggests that is much smaller. Applying the criterion to the remaining
  forty-seven is the next measurement, and it is cheap now that the criterion is sharp.
- **The declaration is the path by which `behavior-coverage.mjs` could one day read stories as
  well as specs** — ADR-0121 Decision 2's eventual shape. Deliberately not built here: the
  declaration exists first, the gate learns to read it later, not the other way round. That
  gate is untouched and still reports its 453 checks.
- **`behaviors.json`'s nature is now recorded.** It locks what is covered, so it can never
  surface an uncovered behaviour. The five found by sweeping are in `tasks/todo.md`; closing
  them means writing specs in all three frameworks before an id can be added at all, which is
  the manifest's own admission rule and is why they went unnoticed.
- **Not addressed, and it is the same question the AtlChat master raised:** a single fixed
  Figma height for a component whose height is content-driven. Until that is answered, every
  accordion story's height finding is noise that happens to be recorded.
- **Verified as of this record:** the pilot green in all three frameworks — `check:paint`
  exit 0 with `behaviour: 2` per framework and no new baseline entries, `storybook-test` green,
  `behavior-coverage` unchanged at 453, `check:contracts` unchanged at 93 warnings; and the
  negative test, an id the manifest does not contain failing the run by name. **Assumed:** that
  the accordion ratio generalises. It is one component, chosen because it was the densest; a
  component whose behaviours are mostly layout-driven would invert it.
