---
status: accepted
date: 2026-09-06
sources:
  - live check: https://atelier.pieper.io/.well-known/agent-skills/atelier-design/SKILL.md -> 404
  - docs/public/.well-known/agent-skills/ (figma-workspace-architect, storybook-angular,
    storybook-react, storybook-vue, index.json — no atelier-design)
  - tools/scripts/sync-skill-discovery.mjs (previous single required argument)
  - package.json `sync:generated` (hard-coded `... sync-skill-discovery.mjs figma-workspace-architect`)
  - nx.json `release.groups.skills.projects` (previously `["figma-workspace-architect"]` only)
  - git b1725d6 "feat(skills): figma-workspace-architect — auto-release + discovery mirror"
    (scoped to the one skill it names, never revisited for a second one)
  - tasks/review-state-2026-08-26.md ("no --check mode for skill discovery"; the adjacent
    half of this same gap, flagged in review and never acted on)
  - skills/atelier-design/project.json, skills/figma-workspace-architect/project.json
    (identical target shape — package, sync-discovery, lint, test, nx-release-publish)
  - docs/src/pages/schulung.astro Day 2 Block 01 (claims both skills as available co-pilots)
---

# ADR-0099: A second skill the sync never reached

## Status

Accepted.

## Context

`schulung.astro`'s Day 2 Block 01 tells participants two skills are available
as co-pilots: `figma-workspace-architect` and `atelier-design`. Only the first
was ever reachable — `https://atelier.pieper.io/.well-known/agent-skills/
atelier-design/SKILL.md` answered 404. `skills/atelier-design` has shipped a
`SKILL.md` since `a0297db` and its `project.json` is structurally identical to
its sibling's (`package`, `sync-discovery`, `lint`, `test`,
`nx-release-publish` targets, same `private: true` package.json shape) — the
machinery to distribute it has existed the whole time and simply never
produced output for it.

The cause was one hard-coded name. `sync-skill-discovery.mjs` took a single
skill-name argument; `package.json`'s `sync:generated` — also what the
pre-push hook runs — called it with `figma-workspace-architect` literally,
because the commit that built the pipeline (`b1725d6`) was about that one
skill and nothing since revisited the call site when a second skill arrived.
That commit's scope was not wrong at the time; the gap opened later and
nothing closed it. `tasks/review-state-2026-08-26.md` had already flagged the
adjacent half of the same problem — no `--check` mode, CI never runs the
per-project `sync-discovery` targets, the sole guard is a `--no-verify`-
skippable pre-push hook — without anyone acting on it. Separately, `nx.json`'s
`skills` release group also listed only `figma-workspace-architect`, so
`atelier-design`'s version has sat at `0.1.0` since 2026-05-01 through several
later content changes.

Every other `check:all` gate stayed green throughout. Each of them compares
one committed artifact against another; none compares the _roster_ of skills
on disk against the roster the discovery index actually serves. A defect in
"which skills exist" rather than "is this skill's content correct" had no
gate shaped to catch it.

## Decision

1. **`sync-skill-discovery.mjs`'s roster is filesystem-derived, not
   name-supplied.** Called with an explicit name — as each skill's own
   `sync-discovery` nx target and its README instructions still do — it syncs
   just that skill, unchanged behavior. Called with no argument, as
   `package.json`'s `sync:generated` now does, it enumerates every directory
   under `skills/` that has a `SKILL.md` and syncs all of them in one pass. A
   new `tools/scripts/lib/skill-discovery.mjs` holds the roster-discovery and
   digest logic, imported by both the sync script and the new gate below, so
   the two can never compute "what should be published" differently from
   "what must already be published."
2. **New gate, `check:skill-discovery`** (`tools/scripts/check-skill-
discovery.mjs`), wired into `check:all` as gate 36: every `skills/<name>`
   with a `SKILL.md` must have a same-named entry in `docs/public/.well-known/
agent-skills/index.json` whose digest matches a fresh sha256 of the
   on-disk file, and the mirrored `SKILL.md` must actually exist on disk — or
   the name must be listed in a new `UNDISTRIBUTED_SKILLS` allowlist
   (`tools/scripts/lib/allowlists.js`) with a reason, matching this repo's
   existing per-gate exemption idiom (`TOKEN_BYPASS_EXEMPT`,
   `A11Y_PARITY_EXEMPT`, etc.). A `DEAD-ALLOWLIST` check catches an exemption
   that outlives its skill. Deliberately out of scope: `storybook-angular` /
   `-react` / `-vue`'s `index.json` entries, hand-authored directly at the
   discovery endpoint with no `skills/` source directory to compare against;
   and `.claude/skills/**` (e.g. `uianatomy-mcp`), a local-only Claude Code
   skill never intended for the public endpoint.
3. **`atelier-design` joins `nx.json`'s `skills` release group** alongside
   `figma-workspace-architect`. Nothing on record — no ADR, no commit message
   — states a deliberate reason to leave it out; `b1725d6` wired the group up
   scoped to the one skill it was about, and `0.1.0` (the manual
   initial-extraction version from `a0297db`) has stood unmoved through
   several later content changes. Its `project.json` already carries the same
   `nx-release-publish`-skip echo (`private: true`, distributed as a zip, not
   npm) as its sibling, so `conventionalCommits` + `fallbackCurrentVersionResolver:
"disk"` + the `skill-{projectName}-{version}` release tag apply unchanged.
   `publish.yml`'s path filter (`skills/**`) already covers it — no change
   needed there.

**Why not a maintained name list instead of filesystem discovery** (e.g.
passing several names through the `sync:generated` script string). Rejected —
it is the same defect shape with a longer list: a fourth skill still goes
unpublished silently until someone remembers to add its name. The roster must
come from something that changes automatically when a skill is added, which
only the filesystem does.

**Why not a `--check` flag on `sync-skill-discovery.mjs` instead of a separate
gate script.** Considered, since the repo's other `sync-*.mjs` scripts pair a
write mode with a `--check` mode read by `check:all`. Rejected here because a
self-diff (`--check` recomputing the same thing the writer just computed and
comparing to itself) proves the script agrees with itself, not that
`index.json` was actually regenerated after someone hand-edited a `SKILL.md`
and forgot to run `sync:generated`. A separate script that reads the
committed `index.json` independently is the check that actually catches that
case, and it reuses the same roster/digest helpers so it cannot drift from
what the sync script does.

## Consequences

- `atelier-design` is reachable at its discovery URL as of this change, with a
  real digest — closing the gap `schulung.astro`'s Day 2 claim depended on.
- `check:all` grows to 36 gates. Both places that state the count in prose —
  `AGENTS.md` and the `check:all` diagram on `docs/src/pages/claude-design.astro`
  (its visible label and its SVG `<desc>`) — are updated in the same change.
- A third skill added later needs nothing beyond a `SKILL.md` + `package.json`
  - `project.json` to be picked up by `sync:generated` and enforced by
    `check:skill-discovery` — no name to remember to add anywhere for
    discovery. It still needs an explicit `nx.json`
    `release.groups.skills.projects` entry to be auto-versioned; that stays a
    deliberate per-skill choice (a skill could reasonably want manual
    versioning) and is not mechanized by this ADR.
- Not fixed here, left as recorded in `tasks/review-state-2026-08-26.md`: CI
  still does not run each skill's own per-project `sync-discovery` target
  directly. `check:skill-discovery` in `check:all` is the equivalent safety
  net now — it verifies the _outcome_ (index matches disk) rather than
  re-running the per-project target, which is a cheaper and more general
  check than invoking every skill's target individually.
