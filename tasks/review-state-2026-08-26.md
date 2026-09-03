# State review — 2026-08-26

## Verdict

- **The day-to-day loop is sound.** `check:all` ran 18 gates to exit 0 (4 non-blocking warnings), `nx run-many -t lint` passed 10 projects, `nx run-many -t test -p spec,react,vue` passed 416 React tests + Vue to exit 0. Nothing here is on fire.
- **The one path that ships artifacts is the least gated one.** `publish.yml` has no `needs:`/`workflow_run` on CI, and `main` has neither branch protection nor rulesets — so lint and test never gate a release. Build *is* gated (`nx.json:68-70` makes `build` a `dependsOn` of `nx-release-publish`) and the 18 drift gates run in `tools/git-hooks/pre-push`, but that hook is opt-in and `--no-verify`-skippable. This is the single highest-value fix in the repo.
- **Several gates self-report green on coverage they do not have.** `check:a11y-parity` builds its roster by globbing the snapshot directory, so four unsnapshotted components are invisible with zero output; and where a snapshot *does* exist it can be one shallow scenario (AtlChat's entire committed a11y tree is two `listitem` nodes — the header, and therefore the known React/Vue-vs-Angular close-button divergence, is not rendered at all). "COMPLETE for all comparable components" (tasks/todo.md:496) overstates what is actually asserted.
- **The decision log now contradicts the shipped gate policy.** `check:figma` and `check:parity` are both in `check:all`; ADR-0019 §5 and ADR-0024 §4 still read as "standalone, not in `check:all`", and for `check:figma` the precondition those ADRs named (snapshot freshness) was never built — the committed snapshot is 35 days old with `figmaLastModified: null`.
- **Dependencies are in good shape and cheap to move.** 25 of 121 deps at latest, no security-driven emergency; one low-risk batch (nx patch, Storybook family alignment, MCP pair, `@types/node`, three dep deletions, overrides-block removal) plus one Angular minor that dedupes a nested Vite copy. Only TypeScript 7 and ESLint 10 are hard-blocked, both with registry-verified reasons.

**Component-count reconciliation** (resolves a contradiction across three inputs): `libs/react/src/lib` holds 31 directories; two of them (`foundation`, `showcase`) are not components, so **29 real components**, matching the 29 Figma masters. 25 have a11y snapshots (75 files / 3 frameworks). `check:sync`'s "31" counts every directory. The "~27" in `schulung-2tage-agenda.md` and `tasks/claude-design-prompt.md` is stale; "25/31" in commit 18455d5 mixes two rosters. Use **29 components / 29 masters** in any client-facing material.

## Now (this week)

| item | why | effort | evidence |
|---|---|---|---|
| Gate `publish` on CI | Lint and test never gate a release: `publish` fires on push to `main` with no `needs:`/`workflow_run`, and `main` has no protection (`gh api .../branches/main/protection` → 404; `.../rulesets` → `[]`). Add `npm run check:all` + `nx run-many -t lint,test` as steps before the release step, or make publish `workflow_run`-triggered on CI success. Partial mitigation already exists — do not remove it: build is gated by Nx, drift by the local hook. | S | `.github/workflows/publish.yml:31-33,57`; `nx.json:68-70`; `tools/git-hooks/pre-push:44-86`; `README.md:165-167` |
| ADR for the `check:all` promotion of `check:figma` + `check:parity` | The gates moved; the ADRs did not. ADR-0019 §5 and ADR-0024 §4 still read as current and say the opposite. Record what changed, what made the parity promotion safe, and what residual risk the figma promotion carries (its stated precondition is unmet). Set `supersedes`/status per the CLAUDE.md ADR rule. | S | `plan/adr/0019-figma-conformance-gate.md:102-111`; `plan/adr/0024-design-parity-persistence-gate.md:78-84`; `package.json` `check:all` ends `… && check:a11y-parity && check:parity && check:figma` |
| Close the `check:a11y-parity` roster hole with a reasoned allowlist | Roster comes from `fs.readdirSync(A11Y_DIR)` (line 47), so a component with zero snapshots produces no comparison and no `[MISSING]` warning — the warning at line 69 only fires for partial coverage. Unsnapshotted: `accordion`, `combobox`, `radio`, `select`. Three are documented as out by design in prose; **accordion is documented nowhere and is the exact component ADR-0025:28 cites as the motivating cross-framework a11y divergence.** Fix: diff `isComponentDir`-filtered `getComponentDirs()` against `byComponent.keys()` and require an allowlist entry with a reason. A bare blocker would wrongly fail select/combobox (ADR-0007). | S | `tools/scripts/check-a11y-parity.js:32,47,65,69`; `tools/scripts/lib/component-discovery.js:20,25`; `tasks/todo.md:481-500`; `plan/adr/0025-cross-framework-a11y-conformance.md:28` |
| Fix `plan/figma-component-checklist.md:19` — wrong collection name | Line 19 tells contributors "`UI Tokens` … is the only collection components should bind to"; ADR-0030 renamed that to Docs Brand Tokens and made **Library Tokens** the semantic tier, which is what the tooling enforces. `plan/ai-readiness.md` §4 says this checklist is reproduced as a required section of every component PR — so following it earns a warning from the very gate it claims to satisfy. Also fix the `LlmButton` example (ADR-0029 renamed the prefix to `Atl`). | S | `plan/figma-component-checklist.md:19,21`; `plan/adr/0030-library-tokens-collection.md`; `tools/scripts/figma-snapshot.mjs:94-97,269`; `tools/scripts/check-figma.js:229` |
| Run `storybook-test` in CI (React + Vue only) | Both libs define a `storybook-test` target and `@storybook/addon-a11y` + `@storybook/addon-vitest` are installed, but no CI job invokes it — the interaction/axe suite only ever runs by hand. Add a two-project job; leave Angular off the matrix per the 2026-04-28 triage. | S | `libs/react/project.json`, `libs/vue/project.json` (target present; absent on `libs/angular`); `.github/workflows/ci.yml` job list (lockfile-guard, checks, lint, test, build, cli-e2e); `tasks/angular-storybook-vitest-triage-2026-04-28.md:61-79`; `tasks/todo.md:82` |
| Fix the `AtlStepper` React key defect and make React console errors fail tests | `steps.map()` returns a bare `<>` with `key={i}` on the inner `<div>`, so React sees keyless list children. Vitest logs `Each child in a list should have a unique "key" prop … AtlStepper` and the test passes. Fix is `<React.Fragment key={i}>`. Then add a console-error policy to the Vitest setup so keys / `act()` / invalid-nesting warnings stop being permanently advisory. | S | `libs/react/src/lib/stepper/atl-stepper.tsx:139,152-154` (verified: `return (` → `<>` → `<div key={i}`); test log on `atl-stepper.a11y.spec.tsx` |
| Dependency batch A (one PR) | All low-risk, all verified: `nx`+`@nx/*` 23.1.0→23.1.1 via `nx migrate`; raise the Storybook floor to `^10.5.10` incl. the exact-pinned `eslint-plugin-storybook@10.4.0`; `@storybook/addon-mcp` 0.6.0→0.7.0 **together with** `@storybook/mcp` 0.7.0→0.8.0 (addon 0.7.0 pins `@storybook/mcp` at exactly 0.8.0; root declares `^0.7.0`, so bumping one forks two copies of a handler used at `worker/mcp.ts:1`); `vitest` 4.1.10→4.1.11; `@types/node` 20.19.9 → `^22.20.1`. | S | `package.json:172` (ts pin), `:24`/`:7` (engines), `.node-version`; `libs/create-workspace/package.json:32`; `libs/create-atelier-ui-workspace/package.json:24` |
| Delete four dead dependencies + the `overrides` block | `@tanstack/react-router` (declared as a runtime `dependency`), `@tanstack/router-plugin` — verified: `grep -rn tanstack` excluding node_modules/lockfile hits **package.json only**. `eslint-plugin-playwright` — referenced by none of the five `eslint.config.mjs` (grep returns nothing), which makes its 1.x→2.x major moot. `@angular/animations` — deprecated upstream, zero source imports, optional peer of `@storybook/angular`. And the `overrides` block: resolving the tree twice (`npm install --package-lock-only`, with and without) produced 3266 identical lockfile entries, 0 differing versions. Land the overrides deletion as its own commit so the no-op lockfile diff is the proof. | S | greps above; `package.json:81` (animations); `^10.3.0-beta.2` override value is the historical tell (addon-designs@11.1.3 peer range) |

## Next (this month)

| item | why | effort | evidence |
|---|---|---|---|
| Snapshot-freshness policy for `check:figma` | The gate validates existence / parse / non-empty but never age. `meta.generatedAt` = 2026-07-22T18:50:07.600Z (35 days old), `meta.figmaLastModified` = `null` — even the one field that could detect Figma-side movement is unpopulated. For a repo whose headline claim is verified design parity, the gate can pass indefinitely against a moved design. Fix: fail (or loudly warn) past a max age, and populate `figmaLastModified` in `figma-snapshot.mjs` so the gate compares rather than guesses. This is the unmet precondition ADR-0019 §5 named. | M | `tools/scripts/check-figma.js:69-89,276,296`; `tools/figma/snapshot.json` meta; `git log -1 -- tools/figma/snapshot.json` → 39f92a4, 2026-07-22 |
| Roster meta-gate (gate-of-gates) | One green `check:all` run reports mutually inconsistent counts: sync 31, behaviors-gen 29, figma 29, parity 27/29, metadata 26 (+5 allowlisted), a11y-parity 25, variants 24, docs 23, story-descriptions 9 dirs allowlisted. Some gaps are explicit and reviewable; others are silent discovery omissions. `grep -rn "roster\|reconcil\|meta-gate" tools/ plan/ docs/src` → nothing. Fix: one gate that takes `isComponentDir`-filtered `getComponentDirs()` as the roster and asserts every other gate either covers each component or names it in an allowlist with a reason. This is `tasks/todo.md`'s "B6 meta-test for the gates". | M | counts from a single `check:all` run; `package.json` `check:all` is a plain `&&` chain |
| Deepen a11y-parity scenarios (the coverage is per-scenario, not per-component) | Verified: `libs/react/src/lib/chat/atl-chat.a11y.spec.tsx:20-27` renders only `AtlChat variant="inline"` + two messages — no `AtlChatHeader` — and the committed tree is exactly two `listitem` nodes (`tools/parity/a11y/atl-chat.react.json`). So "zero divergences on first pass" describes the scenarios, not the components. The normalizer excludes only `aria-hidden`/`hidden`, not `display:none` (`libs/react/src/testing/a11y-tree.ts:110`), so CSS-hidden nodes would count as present if they were rendered. Add a second scenario per component covering the composed/subcomponent surface. | M | files above |
| Chat close-button divergence — restated correctly, then fixed | `tasks/todo.md:501` is wrong about Vue. Verified: **React** (`atl-chat.tsx:200-205`) and **Vue** (`atl-chat-header.vue:20-24`) both render the close button unconditionally and hide it with CSS (`atl-chat.css:118` `.variant-inline … .close-btn { display: none }`); **Angular** omits it from the DOM (`atl-chat.ts:190` `@if (context.variant() !== 'inline')`). A real DOM/a11y divergence, outside the gate for the reason above. Correct the note, then align on one strategy (prefer Angular's — don't ship an unreachable control). | S | files/lines above |
| Scope the generic global CSS classes in React/Vue | Same bug class as the already-fixed `.size-*` leak, never swept. Bare selectors in globally imported stylesheets: `.panel`, `.close-btn` (dialog), `.close-btn` again byte-identical (drawer — two equal-specificity declarations of one class from different components), `.spinner` (button), `.track`/`.fill` (progress), `.chevron`/`.accordion-panel`, `.page-btn`/`.page-list`/`.ellipsis`, `.step-circle`/`.step-label`/`.step-text`, `.code-line`, `.overflow-badge`. Any consumer element with those class names is restyled by importing the library. (The note's companion claim is stale: Angular's `<dialog>` does carry `class="atl-dialog"`.) | M | `libs/react/src/lib/dialog/atl-dialog.css:69,146`; `libs/react/src/lib/drawer/atl-drawer.css:200`; `libs/react/src/lib/progress/atl-progress.css:7,29`; `libs/react/src/lib/button/atl-button.css:126`; Vue mirrors `…/dialog/atl-dialog.css:69,146`; `libs/angular/src/lib/dialog/atl-dialog.ts:53` |
| Invert `check-docs-sync` | The gate is spec→docs only and says so: "extra props in docs … are intentionally not checked". That is exactly the hole that let five fabricated props ship (tooltip `position`, `autoResize` on Input, `closeOnEscape`, Angular `label`, signal `.read()`) and become P1 findings on a site whose pitch is first-try-correct code. Flag docs props absent from the spec, with an allowlist for legitimate callbacks. | M | `tools/scripts/check-docs-sync.js:16-19`; `tasks/review-docs-site-2026-06-12.md` P1 rows 5-9; `tasks/todo.md:84` (D14) |
| Cross-check `accessibility.role` in `check:metadata` against the a11y baselines | The gate only asserts non-empty string, so metadata may claim `button` for a component that renders `link`. 25 components × 3 frameworks of normalized roles already sit in `tools/parity/a11y/`, which makes this near-free. `tasks/todo.md:84` (D13) goes from speculative to small. | S | `tools/scripts/check-metadata.js:208-217`; `tools/parity/a11y/` (75 files) |
| Angular 22.0.7 → 22.1.x (`ng update`) | **There is no Angular 23** — `npm view @angular/core dist-tags` → latest 22.1.3, next 22.2.0-next.3. This is a minor, and it is the one bump that deletes a nested Vite copy: `@angular/build@22.0.7` depends on vite at exactly 7.3.5, `@angular/build@22.1.5` at exactly 8.1.5 = the root pin. Move the whole train together (core/common/compiler/compiler-cli/forms/router/platform-browser/cli/language-service/aria/cdk/devkit/schematics/ng-packagr). `libs/angular/package.json:31` peer stays `^22.0.0`, so the published contract is unaffected. | M | `node_modules/@angular/build/node_modules/vite` = 7.3.5 today; registry dist-tags |
| `--check` mode for skill discovery | `sync:generated` regenerates four artifact families; three have a `--check` gate in `check:all`. The fourth — `docs/public/.well-known/agent-skills/` — has none, and CI never runs the `sync-discovery` targets that exist on both skill projects. Sole guard is the opt-in, `--no-verify`-skippable pre-push hook, so published discovery metadata can go stale with CI green. | S | `tools/scripts/sync-skill-discovery.mjs:36` (reads only `argv[2]`, no `--check`); `.github/workflows/ci.yml` target list; `skills/*/project.json`; `tools/git-hooks/pre-push` |
| Make `cli-e2e` render a component | ADR-0026 recorded this as a known consequence; still true. The preset generator ships only `styles/tokens.css` and `tools/scripts/preflight.mjs` — no component usage — and the e2e asserts the tokens import plus `nx build`, never importing from `@atelier-ui/<fw>`. The exact defect class ADR-0026 fixed (React missing component CSS, Vue with no entry point) would pass today. | S | `libs/create-workspace/src/generators/preset/files/`; `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs:306-314` |
| Style `AtlOption` in Angular | Projected option rows inside `<atl-select>` render unstyled, including the `is-selected`/`is-active`/`is-disabled` classes the template emits. Documented in ADR-0028 as needing design work, not a scoping fix. | M | `libs/angular/src/lib/select/` has no `atl-option.css`; `grep -n option …/atl-select.css` → no matches; `atl-option.ts:24-42` |
| Decide the breaking batch: `AtlChatMessageSpec.role` → `messageRole` | Ship it or close the item as accepted. It currently pays rent in two allowlists: `jsx-a11y/aria-role` was relaxed with `ignoreNonDOM: true` to stop flagging `<AtlChatMessage role="user">`, and `check:figma` carries `AtlChat:name:messageRole`. | S | `libs/spec/src/index.ts:446-451`; `tools/scripts/lib/allowlists.js`; `tasks/todo.md:520` |
| Batch C: astro-6-compatible independents | Each needs a gate re-run, none needs astro 7: `@astrojs/mdx` 5→**6.0.3** (peer `astro ^6.4.0`, new satteri peer is optional), `astro-pagefind` 1.8.6→2.0.1 (peer already includes `^6`), `astro-llms-md` 2.2.2→3.0.1 (**acceptance criterion: `npm run check:llms` green** — there is a hand-rolled `gen-llms-txt.mjs` and a `check:llms` gate), `astro-og-canvas` 0.11.1→0.13.0, `astro-expressive-code` 0.41.7→0.44.1, `@material-symbols/svg-400` 0.44.12→0.47.0 (smoke-test the docs icon set). Also move `@astrojs/mdx` and `astro-expressive-code` out of runtime `dependencies` — they are docs build tooling. | M | `package.json:51,57`; peer ranges verified against the registry |

## Later / won't

- **Docs broken-link failures** — `astroBrokenLinksChecker` runs with `throwError` false, deliberately, because `/storybook-*/` subtrees build after docs; the side effect is that *every* internal broken link is advisory and `docs` has no `test` target. Fix by post-processing the report and failing on non-`/storybook-*/` links. `docs/astro.config.mjs:53-58`; `docs/project.json`. **Later, M.**
- **`nx test` empty-target guard** — reproduced: `nx run-many -t test -p spec,react,vue` prints "The following projects do not have a configuration for any of the provided targets ("test") - spec" and exits 0. Defensible for `spec` today (types + data only, zero exported functions, zero `.spec.ts`), but a lib that loses its tests yields a green Test job. **Later, S.**
- **Non-blocking `[MAP]`/`[DESC]` warnings** — the same 4 warnings every run (`AtlToast`, `AtlCodeBlock`: no spec/registry mapping; Figma descriptions don't reference the spec interface). Either allowlist them as recorded exceptions or make un-allowlisted `[MAP]` blocking. `check-parity.js:130-134`; `check-figma.js:291-298`. **Later, S.**
- **Dead/stale gate tooling** — `tools/scripts/wcag-contrast.mjs` is wired to nothing (`check-css-tokens.js` has zero contrast logic), so WCAG contrast on `--ui-*` is a manual tool despite the a11y emphasis; `tools/parity/marker-coverage.mjs` declares itself superseded and is referenced only in prose; `check-css-tokens.js:23-25` documents a `MANIFEST_COVERAGE_REQUIRED` constant that no longer exists (the real gate is `COVERAGE_REQUIRED` at line 178, currently armed at 101/101 tokens — the comment understates it). **Later, S.**
- **`docs-old/`** — not ignored (`git check-ignore -v docs-old` matches nothing) but harmless: it holds only two ignored `.DS_Store` files and an empty `public/`, and `git status --porcelain -uall` is empty. No gitignore gap. Delete the directory rather than add a rule. **Nice-to-have, S.**
- **Astro 7 batch** (astro 6.4.8→7.2.7 + `@astrojs/mdx@7` + `@astrojs/react@6`) — genuine major: Rust `.astro` compiler with no HTML auto-correction, JSX-rule whitespace stripping, Sätteri as default Markdown processor, Vite 8. Payoff is real (deletes the last two nested vite 7 copies) but expect whitespace-driven visual diffs across an MDX-heavy docs site. **Later, own coordinated PR.**
- **`jsdom` 27.4.0→30.0.1** — three majors, the largest gap. Only used as the vitest `environment` in three configs, but the dialog/drawer/chat/combobox/select specs hand-polyfill `showModal`/`close` and the Popover API; jsdom 28–30 may implement some natively, so each polyfill needs re-checking. Its engines also tighten to `^22.22.2 || ^24.15.0 || >=26`, which would make `engines.node: ">=22.12.0"` over-promise. **Later, own PR.**
- **`@testing-library/jest-dom` 6.9.1→7.0.1** — matchers are registered globally in `test-setup.ts`, so a behavior change touches every spec in all three libs at once. **Later, own PR.**
- **`vite-plugin-dts` 4.5.4→5.0.3** — not dead code: it emits the published Vue lib's `.d.ts` (`libs/vue/vite.config.mts:6,17`). Peers are permissive; the risk is the emitted `.d.ts` shape of a published package. Renamed upstream to `unplugin-dts` at v5, so options may have moved. **Later, own PR.**
- **Won't: replace Figma with Claude Design.** See the mini-ADR below.

## Version currency

| package | current | latest | jump | risk | recommendation |
|---|---|---|---|---|---|
| nx + `@nx/*` (13 root entries) | 23.1.0 | 23.1.1 | patch | low | now, via `nx migrate 23.1.1`; also `libs/create-workspace/package.json:32`, `libs/create-atelier-ui-workspace/package.json:24` |
| storybook family | `^10.4.0` → 10.5.3 | 10.5.10 | minor | low | now; raise the declared floor to `^10.5.10` and unpin `eslint-plugin-storybook@10.4.0` (the one real skew) |
| `@storybook/addon-mcp` | 0.6.0 | 0.7.0 | major (0.x) | low | now — **must move with `@storybook/mcp`** |
| `@storybook/mcp` | 0.7.0 | 0.8.0 | major (0.x) | low | now — addon 0.7.0 pins it at exactly 0.8.0; runtime dep at `worker/mcp.ts:1` |
| `vitest` | 4.1.10 | 4.1.11 | patch | low | now (`npm update`, floats under `^4.0.8`) |
| `@types/node` | 20.19.9 | 26.3.0 | major | low | now → `^22.20.1` (or `^24.13.3` and raise engines to `>=24`) |
| `@angular/*` | 22.0.7 (aria/cdk 22.0.5) | 22.1.3 | minor | low | next, via `ng update @angular/core@22.1 @angular/cli@22.1` |
| `@angular/build` | 22.0.7 | 22.1.5 | minor | low | next — this is the one that dedupes vite |
| `@analogjs/*` | 2.6.3 | 2.7.0 | minor | low | next; peer ranges unchanged from 2.6.3 |
| `@astrojs/mdx` | 5.0.6 | 7.0.8 | major ×2 | medium | next → 6.0.3 (peer `astro ^6.4.0`); 7.x with the astro-7 batch |
| `astro-pagefind` | 1.8.6 | 2.0.1 | major | low | next; peer already accepts `^6` |
| `astro-llms-md` | 2.2.2 | 3.0.1 | major | medium | next; acceptance = `npm run check:llms` green |
| `astro-og-canvas` | 0.11.1 | 0.13.0 | major (0.x) | low | next; move with `canvaskit-wasm` or not at all |
| `astro-expressive-code` | 0.41.7 | 0.44.1 | major ×3 (0.x) | low | next; expect code-block config churn |
| `@material-symbols/svg-400` | 0.44.12 | 0.47.0 | major (0.x) | low | next; SVG assets only, smoke-test glyphs |
| `astro` | 6.4.8 | 7.2.7 | major | medium | later, one coordinated PR with mdx@7 + react@6 |
| `@astrojs/react` | 5.0.7 | 6.0.4 | major | medium | later — ships with astro 7 (6.0.0 published 2026-06-22, ~2s before astro 7.0.0) |
| `jsdom` | 27.4.0 | 30.0.1 | major ×3 | medium | later, own PR |
| `@testing-library/jest-dom` | 6.9.1 | 7.0.1 | major | medium | later, own PR |
| `vite-plugin-dts` | 4.5.4 | 5.0.3 | major | medium | later, own PR |
| `eslint-plugin-playwright` | 1.8.3 | 2.11.0 | major | low | **remove** — unused by all five eslint configs (distinct from `@nx/playwright`, which is live at `nx.json:74`) |
| `@angular/animations` | 22.0.7 | 22.1.3 | minor | low | **remove** — deprecated upstream, zero imports, optional peer |
| `@tanstack/react-router`, `@tanstack/router-plugin` | — | — | — | low | **remove** — verified unused outside package.json |

**Hold, with reasons**

- **`typescript` 6.0.3 → 7.0.2** — hard hold, two registry-verified blocks: `@angular/compiler-cli@22.1.3` peer `typescript >=6.0 <6.1`; `typescript-eslint@8.68.0` peer `>=4.8.4 <6.1.0`. TS 7 is the Go port with no stable programmatic compiler API — exactly what Angular's template type-checker and typescript-eslint import. Both wait for 7.1. `tsconfig.base.json:32` already carries `"ignoreDeprecations": "6.0"`.
- **`eslint` 9.39.5 → 10.9.1 and `@eslint/js`** — blocked by three plugins whose peers stop at eslint `^9` and which are all already at their own latest: `eslint-plugin-react@7.37.5`, `eslint-plugin-import@2.32.0`, `eslint-plugin-jsx-a11y@6.10.2`. Nothing to bump to. `@eslint/js@10.0.1` peers `eslint ^10`, so it cannot go first.
- **root `vite` 8.1.5 → 8.2.2** — hold the pin *deliberately*. Every peer in the tree accepts `^8`, but `@angular/build@22.1.5` depends on vite at exactly 8.1.5; raising the root re-forks a nested copy. Keep the root pin in lockstep with `@angular/build`'s exact dep — that is what the pin is for.
- **`jsonc-eslint-parser` 2.4.2 → 3.3.0** — `@nx/eslint-plugin@23.1.1` depends on `^2.1.0`; bumping the root forks a duplicate while Nx's JSON rules keep parsing with 2.x. Worse than leaving it.
- **`canvaskit-wasm` 0.41.1 → 0.42.0** — no direct usage; present only to satisfy `astro-og-canvas`'s `^0.41.1`. Move when astro-og-canvas widens.
- **`@angular/platform-browser-dynamic`, `@angular-devkit/build-angular`** — both deprecated upstream, both with zero source imports, both **required** (non-optional) peers of `@storybook/angular@10.5.10`. They leave when the Angular Storybook framework does; bump them with the batch meanwhile.

## Platform feature gaps

- **Angular/Vue have no per-component Storybook MCP data.** Storybook 10.4 only emits `components.json` for React, so Angular/Vue expose the `docs` toolset (MDX foundation pages) only, and prop tables come from the React MCP as cross-framework reference or from `libs/spec/src/index.ts` directly. Nothing to fix in-repo; keep the fallback documented in CLAUDE.md. **Effort: none (constraint).**
- **`@storybook/angular-vite@10.5.10` now exists first-party**, which makes `@analogjs/storybook-angular` optional and would drop both remaining deprecated Angular packages (`@angular-devkit/build-angular`, `@angular/platform-browser-dynamic`) out of the tree. **Effort: M, own PR, own ADR.**
- **`storybook-test` preview/test tools are React-only in practice.** Vue/Angular `preview-stories` is experimental in 10.4; the Angular/Vue loop stays `nx test <lib>` plus a manual browser check. **Effort: none (constraint).**
- **No contrast gate.** `wcag-contrast.mjs` exists but is wired to nothing; `check-css-tokens.js` enforces token discipline and manifest annotation only. A framework-agnostic contrast gate is `tasks/todo.md` B5 and is still open. **Effort: M.**
- **No SSR stance, no reduced-motion gate, no API-stability contract, no CONTRIBUTING.md** — all four are listed as open "blind spots (decisions)" in `tasks/todo.md:86` and remain undecided. **Effort: S each to decide, M to implement.**
- **`/design import|export|status` is refused in the Claude Code preview**, and Figma is absent from claude.ai/design's own export/handoff list — there is no round-trip between the canvas and Figma. **Effort: none (constraint; see below).**

## Claude Design

### What it is (mechanics that matter for teaching)

Two different things ship under the name `/design`, and conflating them is the first mistake to avoid.

**(a) The bundled `design` canvas skill in Claude Code 2.1.246.** Not a native canvas: a precompiled React editor ("appifact") that Claude copies, seeds, and publishes as an ordinary Artifact. Two files ship to disk — `payload.template.html` (2,488,127 bytes / 11,054 lines, the whole editor) and `seed-canvas.mjs` (464 lines, the only sanctioned way to write it). No `SKILL.md` on disk; its text is embedded in the CC binary and loaded through the Skill tool. Claude never touches the editor code: it writes `.dc.html` artboard files plus a `canvas.json` manifest in the working tree, and the helper stamps them into a JSON `<script type="application/json" id="appifact-doc">` state block inside a fresh copy of the template, published pinned to `contract: "0.1.31"`.

The mechanics that actually change how you teach it:

- **One artboard = one self-contained `.dc.html`**: a `<head>` carrying the literal line `<script src="./support.js"></script>` (a placeholder the renderer replaces — the helper warns if it is missing verbatim), a `<x-dc>` template block, optionally a `<helmet><style>` head-injection block, and optionally a `<script data-dc-script data-props='{...}'>` holding `class Component extends DCLogic`.
- **Rendering is srcdoc + a patched `fetch`.** The host replaces the `support.js` tag with `<base href>`, `window.__dcFiles = {...}`, guard scripts, React/React-DOM UMD, and a generated runtime. Inside the frame `window.fetch` is monkey-patched to serve `window.__dcFiles[key]` as a 200 — that is how `<dc-import>` sibling resolution and same-folder assets work with no network.
- **Images are resolved by literal filename substitution** — any files-entry name matching `/\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i` found in the source is rewritten to `data:<mime>;base64,<value>`. So stored image data must be **bare base64** (no `data:` prefix) or it double-wraps into a broken image, and the `src` must match the files key exactly.
- **A document containing `<noscript>`, or one that cannot be scanned for nested browsing contexts, is refused** with "This design can't be previewed".
- **Two storage models, selected by one key.** The shipped template's state block carries `"store":"db"` (the live per-document framestore model: `design/meta` with `boardOrder`, one `boards/<fid>` per artboard, `files/`, `notes/`, `comments/`, `_blob/` assets, ≤200 KB per artboard document). `seed-canvas.mjs:456` executes `delete state.store` with the comment "No db capability in this preview: drop the live-store marker so the page boots as the page-is-the-document model with Save." **In Claude Code the page IS the document**: every artboard, `canvas.json`, and image lives in the one state block; Save is `window.claude.self.publish(wholeDocument)` under whole-document compare-and-set; 16 MiB page cap, ≤200 files entries, ≤2 MiB per entry. The 200 KB-per-board / `boardOrder` / `read_db` / `_blob` machinery in the payload's own README belongs to the claude.ai/design deployment and is unreachable from Claude Code — the helper refuses a `store:"db"` page as "not published by this preview".
- **Editing is gated three ways**: the skill enabled (`isDesignCanvasSkillEnabled()`), the artifact-publish capability present in that user's roster, and at runtime WRITE access on the artifact plus viewer consent. Any miss degrades to a view-and-export page (PNG/JPEG at 0.5–4×, per-element PNG, one PDF for all artboards, and a per-artboard HTML `.zip` containing the `.dc.html` plus transitively referenced siblings/images, `support.js`, `vendor/react*.js`, and a generated README).
- **"Play mode" is not a mode**: it is the artboard-expand control ("Play: open this artboard as a clickable prototype"). The expanded artboard fills the window and its sandboxed iframe relays Escape to the host to collapse.

**(b) `/design-sync` + the `DesignSync` tool.** The reverse direction: a **React-only** converter that pushes the repo's real component library (Storybook-static, or a bare package `dist` + `.d.ts`) into a claude.ai/design design-system project, so designs it produces use the real components. Discovery is ts-morph over `.tsx`/`.jsx`.

### Sources

First-party, verified:

- **Announcement** — "Introducing Claude Design by Anthropic Labs", https://www.anthropic.com/news/claude-design-anthropic-labs, dated **2026-04-17**. Workspace for "designs, prototypes, slides, one-pagers"; Opus 4.7; included with the plan and metered against subscription limits; Pro/Max/Team/Enterprise, Enterprise off by default. Imports DOCX/PPTX/XLSX; exports Canva, PDF, PPTX, standalone HTML, folder. "When a design is ready to build, Claude packages everything into a handoff bundle that you can pass to Claude Code with a single instruction."
- **Product page** — https://claude.com/product/design (no publication date). Beta on Pro/Max/Team/Enterprise; names the Claude Code bridge as `/design-sync` or `/design`; exports PDF/PowerPoint/HTML; connectors Adobe, Base44, Canva, Gamma, Lovable, Miro, Replit, Vercel, Wix; shares usage limits with chat, Cowork, and Claude Code.
- **Help Center, "Get started with Claude Design"** — https://support.claude.com/en/articles/14604416-get-started-with-claude-design (timestamp shown only as "Updated over 2 weeks ago"). Chat left / canvas right; exports ZIP, PDF, PPTX, standalone HTML. Stated limitations: inline comments occasionally don't persist; large codebases lag; multi-person editing unreliable; design-system imports depend on source quality.
- **Help Center, "Set up your design system in Claude Design"** — https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design. Extraction from codebases / screenshots / PPTX / PDF / individual assets yields colors, typography, components, layout. A "Published" toggle gates team-wide access. **No named Figma or Storybook integration on this page.**
- **Help Center, admin guide** — https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans, **last updated 2026-07-23**. Default OFF for Enterprise; enablement in Organization settings → Capabilities; an Enterprise-only "Claude Design Admin" role. **"Uploaded assets are stored persistently, and fall under the same data retention and deletion policies as other Anthropic enterprise products." No data-residency support. Figma is not in the export/handoff list.**
- **The only first-party page on the Claude Code side** — https://code.claude.com/docs/en/whats-new/2026-w34 (Week 34, 2026-08-17→21), tagged **research preview**: "The `/design` skill brings Claude Design's artboard workflow into the CLI and Claude Code Desktop, built on artifacts… Available on Pro, Max, Team, and Enterprise. Requires v2.1.233 or later." Example prompt: `/design redesign the composer based on what people actually use it for`. Links onward only to `/docs/en/artifacts#availability`.
- **The only first-party demo asset**: https://mintcdn.com/claude-code/2SnAdpL4dJ18nKb3/images/whats-new/design-skill.mp4, embedded in that digest.

**What does not exist publicly** (verified absences, not assumptions):

- **No `/design` entry in any Claude Code CHANGELOG** — all 5,894 lines of `anthropics/claude-code` CHANGELOG.md and the 5,904-line docs-generated changelog were downloaded and searched: zero hits for `/design`, "artboard", "design canvas", `.dc.html`. The 2.1.234 and 2.1.233 sections were printed in full to confirm.
- **No `/design` row in the official commands reference** — https://code.claude.com/docs/en/commands.md documents `/design-sync` and `/design-login` but not `/design` (`grep -c` over the 179-line page = 0).
- **No spec, doc page, or announcement anywhere for the `.dc.html` Design Component format** — not on anthropic.com, claude.com, support.claude.com, code.claude.com, or docs.claude.com. The only public text describing it is an unofficial system-prompt mirror repo.
- **No first-party Figma / Figma Make / v0 / Stitch comparison.** Third-party write-ups exist and **contradict each other** on whether Figma import/export is supported.
- **No dedicated `/design` doc page.**

### Verdict: parallel to Figma? (mini-ADR)

**Context.** Atelier's loop is Figma → spec → code → verify (CLAUDE.md:12-26), and every gate in `check:all` is keyed on one of four identities: a Figma `COMPONENT_SET` name and variant axes, a `libs/spec` string-literal union, a `--ui-*` token, or a Figma node id. A Claude Design artboard has **none** of those four.

**Options considered and rejected.**

1. *Replace Figma with Claude Design* — rejected: it deletes the gate stack. ADR-0019's variant-matrix-completeness blocker and token-link-coverage critical read `tools/figma/snapshot.json`; ADR-0024's parity record stores a Figma node id + score. An artboard has no node id, no variables, no component sets, no modes. ADR-0018's collections/variables have zero counterpart, and the canvas editor's own known-limits text says design-system color tokens are unavailable in it.
2. *Post-code presentation surface only* — rejected as too small: it forfeits the one thing the canvas beats Figma at for this audience — a developer producing four credible visual directions in ten minutes without knowing Figma. Tag 2 Block 1 (09:30-11:00, 90 min of hands-on Figma) is the agenda's highest-risk block precisely because the room is Figma-naive.
3. *Pre-Figma ideation only* — rejected as incomplete: it drops the cheap win at the far end (one shareable link needing no Figma account and no running Storybook) and leaves `/design-sync`, which genuinely belongs after the code exists, unplaced.
4. *Full second track with its own gate* — rejected **for now**: there is nothing legitimate to gate. The design skill's own contract instructs literal inline style values ("every other theme value stays literal inline so it paints while streaming") and prefers inline `style="…"` over classes because that is what the properties panel edits. A `check:artboards` that grepped participant `.dc.html` for raw hex would be gating against the tool's documented behavior. The one deterministic projection available is generating an artboard `:root{--ui-*}` starter block **from** `libs/create-workspace/src/generators/preset/files/styles/tokens.css` (the token source of truth per `tools/scripts/sync-tokens.mjs:16-19`).

**Decision.** Claude Design occupies **step 0** (divergence, before Inspect) and **step 5** (handoff, after Verify), plus one trainer-led demo of `/design-sync` as the reverse direction. It never touches steps 1–4. Figma remains the single source of truth because it is the only surface the gates can address. **Teach the fence itself as content**: the lesson is "the source of truth is the thing a gate can check", and Claude Design is the counter-example that makes that concrete.

**Tradeoff accepted.** Two design surfaces across two days is real cognitive load, and the canvas dead-ends: no Figma import, no Figma export, `/design import|export|status` refused in the Claude Code preview, the editor frozen at publish time, and saving conditional on the artifact-publish capability being in the viewer's roster. We accept that to buy a Figma-free on-ramp and one honest lesson about gated truth.

**Placement in docs**: a new Explanation-category chapter `/claude-design` beside `/design-principles` (`BaseLayout.astro:386-397`), deliberately **not** an eighth step in `docs/src/data/workshop-track.ts` — adding it to the numbered spine would itself assert it is part of the loop, which is the exact misread to prevent (cf. ADR-0014's framing correction).

Record as `plan/adr/0032-claude-design-as-parallel-track.md` **before** it reaches any agenda.

### What breaks

- **Not workshop-ready as of 2026-08-26.** Per-seat save availability is unverified and cannot be guaranteed across a room: editing needs the skill enabled **and** the artifact-publish capability in that user's roster **and** WRITE access plus viewer consent. Any miss degrades to read-only view-and-export. **Until behaviour is confirmed on at least two accounts that are not the author's, no exercise may use "you edited it in the canvas" as a done-condition.** The katas below are written so their done-conditions survive a read-only canvas — but that must be verified, not assumed.
- **The `--ui-*` artboard starter kit does not exist.** Without it, the skill's own step-0 rule ("lift EXACT values from the real component source … copy them pixel-perfectly as markup + inline styles") produces de-tokenized artboards full of resolved hex, and Katas 2 and 5 teach the wrong lesson — "Claude invents colours" instead of "the canvas cannot hold a token architecture".
- **No ADR.** `schulung-2tage-agenda.md` is client-facing; a second design surface with no recorded rationale will be re-litigated in every cohort. Record the `check:all` promotion of `check:parity`/`check:figma` in the same pass, because it turns "a Claude-Design-first component can never pass `check:parity`" from a manual observation into a hard CI fact.
- **`/design-sync` is React-only** (verified in the CC binary strings: "Push a React design system to claude.ai/design… bundles the real component code (from Storybook or a bare package)"; adapters Storybook-static and package `dist` + `.d.ts`; discovery via ts-morph over `.tsx`/`.jsx`). Per ADR-0014 each cohort runs one framework — so for an Angular or Vue cohort, the `/design-sync` kata is a trainer-machine demo or it is cut. Do not let this track silently re-import the three-framework problem ADR-0014 closed.
- **Governance is a precondition, not a footnote.** `/design-sync` uploads component source and rendered previews to claude.ai/design; Anthropic's own admin guide states uploaded assets are stored persistently under enterprise retention with no data-residency support, and Claude Design is default-OFF on Enterprise. Rehearsing on Atelier's own OSS library is the safe case. Any scenario where a participant pushes their **employer's** design system is a data-processing decision: per company policy that goes to the internal data-protection officer (DSB) and, for org enablement, the internal information-security officer (ISB), **before** it appears on an agenda a client sees.
- **No version-pinned contract to teach against.** `/design` appears in zero CHANGELOG entries and is absent from the commands reference; there is no first-party spec for `.dc.html`; the skill text itself says the preview is not at parity with claude.ai/design and the baked-in editor never updates after publish. **Teach the concepts, never the keystrokes or the flag set** — a Claude Code bump can move all of it.

### Exercises (the katas)

Five katas, all five delivered. Each is written so its done-condition survives a read-only canvas.

**Kata 1 — Four Directions in Ten Minutes (agenda label: "Vier Richtungen in zehn Minuten")**

- *Goal*: Produce three-to-four visibly different visual directions for the participant's own Day-2 component brief BEFORE opening Figma, and commit to one out loud.
- *Steps*:
  1. Read the Day-2 brief (Toast / StatCard / TagChip / Avatar) chosen in Tag 2 Block 0.
  2. Run `/design` with a brief that names the deliverable as direction sketches, e.g. "four low-fi direction artboards for a Toast: one brutally minimal, one editorial, one dense/utilitarian, one soft. 390x844 frames, inline SVG icons only, no emoji." Naming the deliverable is what stops the skill asking a design question mid-exercise.
  3. Let Claude author `Main.dc.html` plus siblings and a `canvas.json` in the working tree; do not hand-edit yet.
  4. Read the published link (or, if the publish is denied or read-only, the local seeded `.html` path Claude hands over).
  5. Add ONE decision sentence as a canvas sticky note: an `annotations` entry in `canvas.json` (`{id, x, y, w, text}`) saying which direction goes into Figma and why. Re-seed and republish.
  6. Say the sentence to the room in 20 seconds.
- *Teaches*: Divergence is cheap and Figma is expensive. Also the first honest boundary: what you just made has no variants, no tokens, no node id, and cannot enter step 1 of the loop — it is a decision aid, not a design.
- *Timebox*: 20 min
- *Done*: Working tree contains >=3 `.dc.html` artboards plus a `canvas.json` whose `annotations` array holds exactly one note naming the chosen direction; the participant has stated the choice aloud. Deliberately NOT dependent on the canvas being editable.
- *Agenda slot*: REPLACES the first 20 min of Tag 2 Block 1 (09:30-11:00, "Design in Figma"). New shape: 09:30-09:50 canvas divergence, 09:50-10:35 manual Figma build, 10:35-11:00 MCP structuring. No agenda inflation — the existing block already splits ~45m manual / ~45m MCP, and this trades 20 min of blank-canvas Figma flailing for 20 min of decided direction.

**Kata 2 — The De-Tokenized Artboard**

- *Goal*: Prove to yourself, by counting, that a Claude Design artboard cannot hold Atelier's token architecture — and see what it costs to force it.
- *Steps*:
  1. Ask Claude to build one artboard of the Atelier Button variant row, explicitly grounded in `libs/react/src/styles/tokens.css`.
  2. Count the raw hex literals it emitted: `grep -o '#[0-9a-fA-F]\{6\}' Main.dc.html | wc -l` (the file has 235 `--ui-*` declarations upstream; see how many survive as tokens).
  3. Now ask Claude to rewrite the same artboard with a `:root { --ui-color-primary: ...; ... }` block inside `<helmet><style>` and every value referenced as `var(--ui-*)`. Re-seed, `--check`, republish as a second artboard.
  4. Count hex literals again in the rewritten file.
  5. Open both artboards in the canvas, select a coloured element in each, and try to change its colour in the properties panel. Record what the panel can and cannot edit.
  6. Write one line: which version a designer can actually restyle, and which version a gate could actually check.
- *Teaches*: Why Figma Variables are load-bearing rather than a nicety, and the exact mechanism: the canvas properties panel edits inline `style="..."` attributes, so a `var(--ui-*)` reference is invisible to it — token fidelity and hand-editability are mutually exclusive here. Pedagogically this belongs BEFORE the participant meets Figma Variables, so the three-tier architecture (ADR-0018) lands as a solution to a problem they already felt.
- *Timebox*: 25 min
- *Done*: Two `.dc.html` files in the tree with their hex-literal counts written down, plus one sentence naming which one the properties panel could edit. Nothing needs to save.
- *Agenda slot*: EXTENDS Tag 1 Block 2 ("Figma für Entwickler", 11:00-12:15) as its closing 25-minute segment, immediately before the Variables/Tokens tour — trim the Inventory-vs-Components-page walkthrough by 10 min and the block's slack by 15. Do not move it to Day 2: its value is entirely in arriving before the token architecture is explained.

**Kata 3 — The Variant Matrix, Twice**

- *Goal*: Build the brief's variant matrix once as a canvas artboard and once as a Figma COMPONENT_SET, then let `check:figma` show which one a machine can read.
- *Steps*:
  1. Author the matrix as ONE `.dc.html`: `<sc-for list="{{rows}}" as="row">` over variant x size, values computed in `renderVals()` (never in the handlebars — `{{a + b}}` fails silently).
  2. Add `<script data-dc-script data-props='{"variant":{"editor":"enum","options":["info","success","danger"],"default":"info"}}'>`. Note the attribute must be single-quoted.
  3. In the canvas, flip the resulting tweak chip. Observe two things: exactly one variant value is live at a time, and (where saving is enabled) a tweak change becomes the FILE's new default on Save — the artboard has no matrix, it has a current state.
  4. Build the same matrix as a real component set in the participant's duplicated Figma file: variant properties named to match the spec's string-literal union exactly (`primary`, not `Primary`).
  5. On the trainer machine with the Figma bridge connected: `npm run figma:snapshot` then `npm run check:figma`. Read the variant-matrix-completeness result and the token-link-coverage result out loud.
  6. Add a third `.dc.html` artboard whose only content is a screenshot-free list of the two verdicts. Note that `<dc-import name="Card">` is the canvas's only reuse primitive and that every imported file is itself forced onto the canvas as an artboard — there is no hidden master, which inverts Atelier's Components-page/Inventory-page convention.
- *Teaches*: Variants as machine-readable axes versus variants as a picture. Why `metadata.variantMatrix` and ADR-0019's Blocker severity exist: a name or value mismatch silently breaks MCP->code generation, and only the Figma side can be checked at all.
- *Timebox*: 40 min
- *Done*: One `.dc.html` with a working `enum` tweak chip AND one Figma component set for the same brief; `npm run check:figma` output captured (pass or fail — a fail with a named unbound-radius or missing-variant row is a PASS for this kata). The participant can state in one sentence why the artboard produced no gate output.
- *Agenda slot*: REPLACES the "~45m MCP-Strukturierung" half of Tag 2 Block 1 (09:30-11:00), i.e. 10:35-11:00 plus the first 15 min of Tag 2 Block 2 (11:15-12:30). Same slot, same tools (`figma_add_component_property`, `figma_analyze_component_set`), sharper contrast — the MCP structuring work now has a foil.

**Kata 4 — /design-sync: The Library IS the Design System (trainer-led demo)**

- *Goal*: Show the reverse direction — the repo's real React components become the design system Claude Design draws with — and name why it is not a participant exercise.
- *Steps*:
  1. Trainer machine only. `nx build-storybook react`.
  2. Run `/design-sync`. Narrate what it writes: `.design-sync/config.json` (the single source of truth for the converter's overrides), generated preview HTML carrying a first-line `<!-- @dsCard group="..." -->` marker, and `_ds_manifest.json` compiled from those markers.
  3. Stop at the `DesignSync finalize_plan` permission prompt and read the path list and `localDir` out loud, without approving yet. This is the teaching moment: the tool shows the user the exact write set independently of the model's narration.
  4. Approve against a throwaway design-system project (`create_project`), then `list_files` on it. Compare the discovered component count against the repo's master list (use **29** — see the component-count reconciliation in the Verdict; the a11y gate's 31 counts non-component dirs and the agenda's 27 is stale).
  5. Show the two adapter shapes: Storybook-static (which produces a reference render to compare each card against) versus bare package (`dist/` + shipped `.d.ts`, graded on absolute criteria because there is no reference).
  6. State the constraint plainly: React only. An Angular or Vue cohort cannot run this. That is a consequence of ADR-0014's one-framework-per-cohort rule reaching further than syntax.
  7. State the governance constraint plainly: this uploads code and renders; for anything client-owned it goes to the DSB first.
- *Teaches*: Direction of authority. Everywhere else in the workshop, design flows toward code; here code IS the design system. Also that a design system is a build artifact with a manifest, not a mood board — and that a research-preview bridge has hard framework and governance edges.
- *Timebox*: 20 min demo + 10 min discussion
- *Done*: Participants have seen the `finalize_plan` path list before approval and can name (a) which adapter fired for `libs/react` and why, (b) the one reason this is not on their own machines today. No participant artifact.
- *Agenda slot*: EXTENDS Tag 1 Block 4 ("MCP & Claude Code Grundlagen", 14:45-16:00) as its closing 30 min, replacing the current thin "Skills-Konzept kurz vorstellen" tail — this IS that segment, made concrete. Cut the `get-changed-stories` micro-demo from Tag 2 Block 3 to pay for the 30 min if the day runs long; it is the most expendable item on Day 2.

**Kata 5 — The Handoff Card**

- *Goal*: Ship one link that shows the finished component completely — variant sheet, dark/light pair, keyboard map — to a viewer who has no Figma account and no running Storybook.
- *Steps*:
  1. After `figma_check_design_parity` and `npm run parity:record`, read the `--ui-*` values the implementation actually resolved to (browser devtools on the running story, not the token file — the point is what shipped).
  2. Author three artboards from the Atelier artboard starter: `Main.dc.html` (the variant sheet), `Dark.dc.html` (the same sheet, dark values), `Keyboard.dc.html` (the interaction matrix: Tab / Shift+Tab / Enter / Escape per the brief).
  3. Write `canvas.json` with all three positioned (>=80px between frames in a row, >=120px between rows) and one `annotations` note carrying the spec interface name and the recorded parity score.
  4. Feel the cost: dark mode is a hand-duplicated second artboard, because artboards share nothing at runtime — no state, no logic, no tweaks cross files. There is no mode switch. Write that down in the sticky note.
  5. `node seed-canvas.mjs --check <file>.html` must print `ok:` with the expected title and file list, then publish.
  6. In Show & Tell, open the link instead of screen-sharing three tools.
- *Teaches*: The canvas as a communication artifact — its real advantage is that the viewer needs nothing installed. And the closing symmetry with Kata 2: what you gained (a shareable link) and what you gave up (modes, variables, a node id, any gate at all). This is where the parallel-track decision gets justified to the room from their own experience rather than from a slide.
- *Timebox*: 30 min
- *Done*: `--check` prints `ok:` with three artboards and a `canvas.json`; the link (or local path) opens showing all three; the sticky note names the spec interface, the parity score, and the sentence about hand-duplicated dark mode.
- *Agenda slot*: REPLACES the first 30 min of Tag 2 Block 5 ("Show & Tell + Best Practices", 16:40-17:30) — build 16:40-17:10, then 17:10-17:30 is round-robin link-opening plus the trainer synthesis. Faster and far more robust than 8-12 people sequentially sharing Figma + Storybook + editor, which is the current plan's biggest schedule risk.
### Repo work needed

1. `plan/adr/0032-claude-design-as-parallel-track.md` — the mini-ADR above, plus a row in `plan/adr/README.md`. **S.**
2. The ADR for the `check:parity`/`check:figma` promotion into `check:all` (same pass — it is what makes the "Claude-Design-first component can never pass `check:parity`" consequence a CI fact). **S.**
3. A `--ui-*` artboard starter-kit generator: emit a `:root{…}` block from `libs/create-workspace/src/generators/preset/files/styles/tokens.css` (source of truth per `tools/scripts/sync-tokens.mjs:16-19`) for pasting into `<helmet><style>`. Blocks Katas 2 and 5. **S–M.**
4. New docs chapter `docs/src/pages/claude-design.*` in the Explanation category (`BaseLayout.astro:386-397`) — and **not** in `docs/src/data/workshop-track.ts`. **M.**
5. Fix the stale component count in `schulung-2tage-agenda.md` and `tasks/claude-design-prompt.md` (~27 → 29). **S.**
6. Fold the five katas into `schulung-2tage-agenda.md` with the slot swaps each one names (Kata 1 and 3 both cut into Tag 2 Block 1 — reconcile the arithmetic before publishing). **M.**
7. Verify per-seat save on two non-author accounts before anything reaches an agenda. **S, but blocking.**

### Self-study path for the author

Ordered, each step ending in something verified rather than read:

1. **Read the two on-disk files.** `payload.template.html` line 38 (the seed state block, `"store":"db"`) and all 464 lines of `seed-canvas.mjs` — especially lines 20-29 (state-block regex and `<` escaping) and 455-461 (`delete state.store`). That one delete is the whole difference between the two products; understanding it is most of the mental model.
2. **Read the two first-party pages that actually exist** for the Claude Code surface: the Week 34 digest and its demo video. Ten minutes. There is nothing else.
3. **Read the admin guide** (2026-07-23) end to end before any client conversation — persistent asset storage, no data residency, Enterprise default-off. This is the part that determines whether the track is teachable at a client at all.
4. **Run `/design` once on Atelier itself** with a Toast brief. Then, without publishing, inspect the working tree: the `.dc.html` files, the `canvas.json`, and the seeded HTML. Run the helper's `--check`. You now know what a participant will see.
5. **Do Kata 2 yourself and record both hex counts.** That number is the ADR's evidence and the docs chapter's opening.
6. **Test save on a second account.** Until this is done, treat every "then they edit it" sentence in the material as unverified.
7. **Run `/design-sync` against Atelier's React Storybook build once**, on your own machine, and read what it uploads. Only then decide whether Kata 4 is a participant exercise or a demo — and route the employer-design-system question to the DSB/ISB before it appears anywhere client-facing.

## Verified vs assumed

**Verified in this session (commands run in-repo):**

- 31 directories under `libs/react/src/lib`; 29 real components after removing `foundation` and `showcase`; `tools/parity/a11y` holds 75 files = 25 components × 3. The four unsnapshotted components are `accordion`, `combobox`, `radio`, `select`.
- `AtlStepper` React key defect: `libs/react/src/lib/stepper/atl-stepper.tsx:152-154` returns a bare `<>` from `steps.map()` with `key={i}` on the inner `<div>`.
- Chat close-button divergence and the corrected description: React `atl-chat.tsx:200-205` and Vue `atl-chat-header.vue:20-24` both render it unconditionally; `atl-chat.css:118` hides it with `display:none` under `.variant-inline`; Angular `atl-chat.ts:190` omits it with `@if (context.variant() !== 'inline')`. `tasks/todo.md:501` is wrong about Vue.
- The Chat a11y scenario renders **no header** (`atl-chat.a11y.spec.tsx:20-27`) and the committed tree is two `listitem` nodes (`tools/parity/a11y/atl-chat.react.json`). "Close chat" appears in none of the three snapshots. The normalizer excludes only `aria-hidden`/`hidden`, not `display:none` (`libs/react/src/testing/a11y-tree.ts:110`).
- `@tanstack/*` appears only in `package.json` (grep excluding node_modules and the lockfile). `eslint-plugin-playwright` appears in none of the `eslint.config.mjs` files.
- ADR index ends at 0031; there is no ADR for the `check:all` gate promotion. `tasks/todo.md:78-86` still lists D11 (gate publish on CI), C8 (`check:figma`+freshness), B4 (storybook-test+axe in CI), B6 (meta-test for the gates), D13, D14 as open. `tasks/todo.md:496` claims the a11y gate is "COMPLETE for all comparable components" and lists six "out by design" — accordion is not among them.

**Verified by the input audits (evidence cited, re-checked where it mattered):**

- All three suites green: 18 gates to exit 0 with 4 non-blocking warnings; lint 10 projects; 416 React tests + Vue to exit 0.
- Publish gap as corrected: no `needs:`/`workflow_run`, `main` protection 404, rulesets `[]`, build gated via `nx.json:68-70`, drift gated via `tools/git-hooks/pre-push`.
- Snapshot age (`generatedAt` 2026-07-22T18:50:07.600Z, `figmaLastModified: null`, last commit 39f92a4).
- Per-gate component counts in a single run; no roster-reconciliation mechanism (`grep` for roster/reconcil/meta-gate returns nothing).
- `sync-skill-discovery.mjs:36` has no `--check`; CI never runs `sync-discovery`.
- Overrides block is a verified no-op (two full `--package-lock-only` resolutions, 3266 identical entries, 0 differing versions).
- Angular dist-tags (latest 22.1.3, next 22.2.0-next.3 — **there is no Angular 23**); the `@angular/build` exact-vite dependency 7.3.5 → 8.1.5; the `addon-mcp@0.7.0` exact pin on `@storybook/mcp@0.8.0`; the TypeScript 7 and ESLint 10 peer blocks; the three deprecated Angular packages and which of them is removable.
- Claude Design mechanics: the two on-disk files and their sizes, the state-block shape, `delete state.store` at `seed-canvas.mjs:456`, the fetch patch, the image-substitution rule, the `<noscript>` refusal, the three editing gates, "Play" as the expand control.
- Claude Design sources: all six first-party URLs above, plus the four verified absences (no CHANGELOG entry across 5,894 + 5,904 lines, no `/design` row in `commands.md`, no `.dc.html` spec anywhere, no first-party competitive comparison).

**Assumed / unverified — do not act on these without checking first:**

- **Launch date conflict.** The newsroom post says 2026-04-17; the Help Center release notes list Claude Design under 2026-04-16. Marked "likely" in the input. Use "mid-April 2026" in any written material.
- **Per-seat save behaviour in a room.** Never tested on an account other than the author's. This is the blocking unknown for the whole Claude Design track.
- **Help Center "Get started" page date** — the page shows only "Updated over 2 weeks ago"; no absolute date exists. Written as "not verified" wherever cited.
- **Katas 3–5, and Kata 2's timebox/done-condition** — referenced in the input but never delivered (truncation). Not reconstructed here; they must be authored.
- **`jsdom` 28–30 native `showModal`/Popover support** — asserted as "may implement some natively"; each hand-polyfill needs re-checking during that upgrade rather than assumed obsolete.
- **`vite-plugin-dts` 5 option renames** — the project was renamed to `unplugin-dts` at v5, so option names "may have moved". Not confirmed against the v5 docs.
- **Astro 7 visual impact on this docs site** — "expect whitespace-driven visual diffs" is a reasoned prediction from the changelog (JSX-rule whitespace stripping, no HTML auto-correction), not a measured result.
- **The truncated tails of two input audits** — the planning-layer audit was cut off mid-finding (the Chat item, which I re-verified above) and the version audit mid-package (`@analogjs/vitest-angular`, described as a minor at 2.6.3 → 2.7.0 with unchanged peers, consistent with its sibling `@analogjs/vite-plugin-angular`). Any further findings past those cut points are not in this report.
- **`libs/spec` having no `test` target being permanently safe** — defensible today (types and data only), but nothing detects the day that changes.