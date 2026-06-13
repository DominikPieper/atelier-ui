# Docs Site UI/UX Review + Ideas — atelier.pieper.io (2026-06-12)

Third review package today, after the content/design review and the fix round (deployed as of v0.1.9). Method: 43 fresh live-site captures including interaction states (search open, mobile drawer, framework switched, MCP call, 404); 6 review lenses (IA/navigation, interaction, first-visit journey simulation on Opus; readability, mobile, a11y on Sonnet); every P1/P2 finding survived a skeptic refute-pass (35 of 41 confirmed, 6 refuted). In parallel, an idea panel: 3 persona generators (learner / author / delight, Opus, with best-in-class research), 29 ideas scored independently by 2 judges, top 12 feasibility-checked against the codebase (Sonnet). I spot-verified three findings against source myself.

## Executive Summary

The site is in good shape mechanically — no P1s survived verification — but one theme dominates everything: **the numbered 1–8 learning path makes a promise the rest of the UI doesn't keep.** The sidebar numbers a sequence, yet the in-page "Next" cards point off-path (Setup's "Next" goes to Storybook, not step 4), the kata prompt stays framework-generic despite the framework switcher, the German Schulung agenda sits unannounced at step 2, and there is no prev/next, no position indicator, and no checkpoint telling a participant they finished a step correctly. The idea panel independently converged on the same diagnosis: the four top-ranked ideas are all "make the path real" (data-driven prev/next pager, checkpoints, framework-aware prompt copy, single source of truth for the track). Secondary clusters: the framework switcher doesn't reach all surfaces (import tabs and the MCP explorer keep their own state), search lacks keyboard navigation, mobile lacks a TOC and has sub-44px touch targets, and a mistyped URL lands on a literally blank page. Fixing the path cluster plus the 404 covers roughly half the confirmed friction with mostly S-effort changes.

**Findings: 0 × P1 · 24 × P2 · 18 × P3 (after merging 3 cross-lens duplicates) · Ideas: 29 ranked, top 12 feasibility-checked.**
Raw data: `tmp/ux-review/ux-findings.json`, `tmp/ux-review/ideas-ranked.json`, screenshots `tmp/ux-review/*.png`.

## P2 Findings (verified)

### Cluster A — Learning path breaks its own promise
| Finding | Evidence | Fix sketch |
|---|---|---|
| In-page "Next" links contradict the numbered sidebar: /workshop's "Next" card goes to Storybook (step 4 is Figma access); /tutorial has no Next at all; /first-component labels Patterns "More" | `workshop.astro:371`, `tutorial.astro:571-574`, `first-component.astro:213` vs sidebar `BaseLayout.astro:259-298` | Idea #1 (prev/next pager) fixes this wholesale |
| Setup hands off to /tutorial as "next" although the kata (/first-component) is the fastest path to a working component — and three near-identical pages (Tutorial / Design to code / First component) all build the same Settings Card with no "which one do I take?" guidance | journey lens, home/workshop shots | One sentence of role-differentiation at each handoff + ordered pager |
| German "Schulung (2 Tage)" is step 2 of an otherwise English track, unmarked in nav; page itself has no nav-level language/audience signal (also flagged by readability lens: no in-page TOC for 13 blocks) | `BaseLayout.astro:264-267`, `schulung.astro` | Move to an "For instructors (DE)" slot or tag it in nav; don't number it as a participant step |
| Kata Step 3 says "Replace {framework}" but the prompt is framework-generic; the Angular/Vue fall-back-to-libs/spec nuance lives only on /design-to-code | `first-component.astro:17,128-131` (I verified) | Idea #3: substitute the framework token live from framework-pref before copy |

### Cluster B — Dead ends
| Finding | Evidence | Fix sketch |
|---|---|---|
| No 404 page at all: blank white screen, no chrome, no recovery (flagged independently by two lenses) | `state-404.png`; no `docs/src/pages/404.astro`; `_redirects` has no fallback (skeptic verified hosting too) | 404.astro on BaseLayout + 3 recovery links; idea #8 gives it the brand treatment |

### Cluster C — Framework switcher doesn't reach all surfaces
| Finding | Evidence | Fix sketch |
|---|---|---|
| Import tabs ignore the switcher — own `useState(0)`, always opens Angular | `ComponentDetail.tsx:107-119` (I verified) | Drive `MultiCodeBlock` from the shared framework state |
| MCP Explorer "Server" switcher is isolated — always opens Angular regardless of preference | `McpExplorer.tsx` | Read framework-pref on mount |

### Cluster D — Search
| Finding | Evidence | Fix sketch |
|---|---|---|
| Cmd+K search has no keyboard navigation (no arrow keys, no Enter-to-open) and no live-region result announcement (interaction + a11y lenses) | `Search.tsx:77-86` — handler covers only Cmd+K and Escape (I verified) | Roving active index + `aria-activedescendant` + result-count live region |

### Cluster E — Mobile
| Finding | Evidence |
|---|---|
| Header touch targets 28–36px (hamburger 36×32, theme 34×30, drawer close 28×28) vs 44px guideline | measured via Playwright |
| TOC is `display:none` on mobile; tokens (~11000px), tutorial (~9900px), workshop (~6900px) navigable only by scrolling | mobile shots |
| Mobile drawer cuts the REFERENCE group below the fold with no scroll indicator | `state-mobile-drawer.png` |

### Cluster F — A11y of hydrated islands
| Finding | Evidence |
|---|---|
| Mobile drawer: no focus trap, no Escape, no focus restoration, no `aria-expanded`; sidebar links stay in tab order when drawer closed | `BaseLayout.astro` nav script |
| Framework switcher + import tabs: active state via CSS class only, no ARIA state | `ComponentDetail.tsx` |
| McpExplorer: parameter inputs unlabeled; tool list/chips without selection state; play-character button without accessible name; response not announced | `McpExplorer.tsx` |

### Other P2
- Storybook/Figma/MCP labeled differently across topbar / sidebar / bottom-nav ("MCP Explorer" / "MCP playground" / "MCP") — pick canonical labels (`BaseLayout.astro:203-206,340-351,448-465`)
- /tokens and /schulung: long multi-section pages without usable in-page hierarchy in the TOC

## P3 (18, unverified pass-through — list in ux-findings.json)
Highlights: home links only 3 of 8 steps; "Start the workshop" button lands on a page titled "Workshop setup"; breadcrumb data computed for JSON-LD but never rendered; components section swaps the whole sidebar (path disappears); jargon tooltips unreachable on touch; filter pills ~30px; stacked mobile tables lose header context; unlabeled consecutive code blocks in the kata.

## Refuted in verification (6)
Mostly judgment calls the skeptics deemed standard/acceptable: SVG-diagram density on /tutorial, sticky chrome cost on mobile, patterns-page demo stacking, step-row collapse, "no scaffold guidance" (page does cover it), workshop-page conceptual steps without commands.

## Ideas — ranked (29 generated, 2 judges, top 12 feasibility-checked)

Full list with judge notes + feasibility detail: `tmp/ux-review/ideas-ranked.json`. Top of the table:

| # | Score | Idea | Effort | Feasibility |
|---|---|---|---|---|
| 1 | 25.0 | **Path-aware prev/next pager** following the 1–8 sequence, driven by one ordered array | S | exists-partially: BottomNav.astro takes items[]; 8-step order hardcoded in BaseLayout — extract to `docs/src/data/workshop-track.ts`, add TrackNav variant, 8 page edits |
| 2 | 23.3 | **Checkpoint blocks** ("You should now have X working") on every track page, extracted from first-component's proven kata-target/kata-done pattern | M | exists-partially: pattern + CSS live inline in first-component.astro:68-92,197-207 — componentize, add to 4 pages |
| 3 | 22.5 | **Framework token live inside copied prompts** — copy button substitutes `{framework}` from framework-pref | M | exists-partially: framework-pref + copy buttons exist; wire substitution into the copy path |
| 4 | 22.3 | **Single source of truth for the learning path** (nav + pager + progress all derive from one data file) | M (concept) | foundation for #1/#5; consistent with ADR-0021 build-time derivation |
| 5 | 21.5 | **"Step N of 8" position indicator** in track-page heroes | S | straightforward once #4 exists |
| 6 | 21.3 | **"Stuck on this step?" escape hatches** linking to the matching troubleshooting anchor | S | exists-partially (troubleshooting page has failure modes; needs anchors) |
| 7 | 20.0 | llms.txt discoverability (header link tag + footer affordance) for AI consumers | S | exists-partially |
| 8 | 19.0 | **Branded 404** — "This piece isn't in the collection" studio metaphor | S | straightforward; also closes the P2 dead-end finding |
| 9 | 18.5 | Framework-aware home: route learners straight into their framework's path | M | straightforward |
| 10 | 18.5 | Teaching empty/no-results states (search, gallery filter) | S | exists-partially |
| 11 | 18.5 | The four-step loop (Figma→spec→code→verify) as recurring visual motif | M | exists-partially |
| 12 | 18.3 | Exhibit-numbered section heroes (wordmark-grade) | M | exists-partially |

Below the cut (13–29): per-page feedback widget → GitHub issue (18.0), interactive token playground (18.0), "Edit this page" (17.0), persisted path progress checkmarks (15.8), embedded Storybook previews (15.0), changelog from ADRs (14.5), drift badges (13.5), instructor mode (13.0), demo theatre (13.0), dark-mode easter egg (12.0).

## Recommendation — Top 5 next moves

The findings and the ideas converge: **build the path infrastructure once, and most of Cluster A + three top ideas land together.**

1. **Workshop-track data file + prev/next pager + step indicator** (ideas #1/#4/#5, fixes the Next-contradiction P2 and the "More"-label friction). One data file, one component, 8 page edits — S/M total.
2. **404 page, branded** (idea #8 + P2 dead-end). One file. S.
3. **Framework-state completion**: import tabs + MCP explorer read framework-pref; copy buttons substitute `{framework}` (ideas #3, Cluster C, kata P2). M.
4. **Checkpoints on track pages** (idea #2). M.
5. **Search keyboard navigation + drawer a11y pass** (Cluster D + drawer items from Cluster F — the two highest-traffic a11y P2s). M.

Schulung placement (Cluster A) is a content/IA decision for you rather than a build task: instructor material probably shouldn't be step 2 of the participant path.

## Method stats
UX review: 47 agents, ~1.6M tokens. Idea panel: 17 agents, ~1.0M tokens. Captures: 43 shots + measured touch targets/link counts.
