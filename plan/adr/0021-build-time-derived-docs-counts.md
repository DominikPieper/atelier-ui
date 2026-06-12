---
status: accepted
date: 2026-06-12
sources:
  - "docs/src/lib/skill-meta.ts"
  - "docs/src/pages/llms.astro"
  - "docs/src/pages/skills/figma-workspace-architect.astro"
  - "docs/src/pages/agent-skills.astro"
  - "docs-review findings on hardcoded counts (this session)"
---

# ADR-0021: Docs counts and sizes derived at build time where the source is local

## Status

Accepted. Recorded at decision time. Complements **ADR-0009** (drift-gate system:
one source → projection → `--check`) by applying the same instinct to docs prose:
where a number has a local source of truth, the docs *derive* it instead of
restating it.

## Context

A docs review found a cluster of hardcoded numbers that had silently drifted from
their sources:

- `/llms` claimed **24 components** and "…and 22 more" while
  `docs/src/data/components.ts` ships 28; its size badges said "~2 KB" / "~12 KB"
  while the committed `docs/public/llms.txt` / `llms-full.txt` are ~5 KB / ~77 KB.
- `/skills/figma-workspace-architect` pinned `SKILL_VERSION = '0.2.0'` while the
  skill's `package.json` is at 0.2.44, listed **13 references** while the skill
  ships 16 (`inventory-generation.md`, `inventory-payload.md`, `sync-workflow.md`
  were missing from the table), and documented 4 modes / 3 sub-modes while
  `SKILL.md` had grown a Sync mode and Build's Inventory sub-mode.
- `/agent-skills` repeated the same stale mode / sub-mode / reference counts.

Every one of these numbers has a machine-readable source *inside the repo*. The
prose was a second, unguarded copy — exactly the drift class the ADR-0009 gates
exist to eliminate, just surfacing in `.astro` pages instead of generated files.

## Decision

**Derive docs counts and sizes at build time wherever the source data is local;
keep them hardcoded only where it is not.**

1. **Component count ← `docs/src/data/components.ts`.** `/llms` imports
   `ALL_COMPONENTS` and computes the total (and the "…and N more" remainder) from
   `ALL_COMPONENTS.length`.
2. **Skill version + reference count ← the skill directory.** A new build-time
   module `docs/src/lib/skill-meta.ts` reads the version from
   `skills/figma-workspace-architect/package.json` and the reference list via
   `readdirSync` of its `references/` directory. The repo-root `skills/` copy is
   the canonical source — `.claude/skills/figma-workspace-architect` is a symlink
   to it and `docs/public/.well-known/agent-skills/…` is a synced distribution
   copy, so reading the source stays correct even before a sync runs.
3. **llms file sizes ← `fs.statSync` of the committed `docs/public/llms*.txt`.**
   The badges show whatever the last `gen:llms` produced; `check:llms` already
   gates staleness of those files, so the badge inherits that guarantee.
4. **The hand-written references table gets a free drift gate.** The table on the
   skill page stays curated (it carries one-line summaries no directory listing
   can produce), but the page throws at build time when
   `references.length !== referenceCount` — adding or removing a reference file
   without updating the table now fails `nx build docs`.
5. **Figma-derived counts stay hardcoded — explicitly excluded.** Numbers that
   describe the Figma file (component/variant counts on other pages) have no API
   available at build time, and the committed `snapshot.json` is partial, so
   deriving them would just trade one stale copy for another. They are corrected
   by hand (separately from this decision) and remain the one category where
   prose numbers are maintained manually.

**Rejected alternative — a CI drift-check script** that greps docs pages for
known numbers and compares them to sources. More moving parts (a script, a number
registry, fuzzy matching against prose), and it only *detects* drift after the
fact. Derivation removes the drift class instead of detecting it: there is no
second copy left to diverge. The one place where a curated copy must remain (the
references table) gets the cheap inline assertion instead of a separate script.

## Consequences

- The docs build now fails loudly if `components.ts` stops exporting
  `ALL_COMPONENTS`, the skill directory moves, `docs/public/llms*.txt` are
  missing, or the references table falls out of sync with `references/` — all
  good failures: each one is real drift or a broken contract surfacing at build
  rather than shipping as a wrong number.
- `docs/src/lib/skill-meta.ts` is Node-only (`node:fs`); it must only be imported
  from `.astro` frontmatter (build-time), never from client-side code.
- The llms size badges are only as fresh as the last `gen:llms` run — acceptable,
  because `check:llms` (in `check:all`) already gates staleness of the underlying
  files; the badges can't be *more* stale than the files themselves.
- Reference *summaries* in the skill-page table are still hand-written; the gate
  catches missing/extra rows but not a stale description. That residual risk is
  accepted — summaries are editorial content, not data.
- Mode and sub-mode counts on the skill pages are derived from the page's own
  `modes` array, which remains a curated mirror of `SKILL.md`; SKILL.md itself
  has no machine-readable mode manifest to derive from yet.
