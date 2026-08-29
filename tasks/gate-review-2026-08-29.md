# The 29 Gates — Review, Portability, and the Holes

**Date:** 2026-08-29 · **HEAD:** `c9bc4e9`, tree clean · **Inputs:** four reading agents over the 29 `check:all` entries, plus two challenge passes. Where a challenge refuted a reader, the refutation is the finding. **Read-only:** nothing in the repo was changed; every command below was run against the working tree as committed.

---

## 1. Verdict

This is not a lint suite with 29 rules. It is **10,181 lines across 30 scripts implementing roughly 90 distinct assertions**, of which about a quarter are ideas that do not exist anywhere else — a Figma-facts snapshot checked offline, a ratchet that records identities rather than counts, a dead-CSS gate that resolves constructed class names through the TypeScript checker, and an exemption store that errors when an excuse stops excusing anything. What is worth taking elsewhere is mostly **not the gates**: it is four pieces of substrate totalling ~350 lines that this repo has reimplemented between three and eleven times each, and five patterns that cost nothing to adopt and are the reason the gates here are narrow enough to stay green. The honest cost of the rest is high and non-obvious: `check:figma` is 2,504 lines that cannot run without an 895-line Figma probe, a Desktop bridge, a hand-maintained 43-node roster and three hand-maintained cascade tables, and its value is entirely conditional on the design file already being a real source of truth.

Verified this run: `npm run check:all` → exit 0, **39.82s real / 40.55s user**, 14 non-blocking Figma warnings, four ratchets settling at their recorded baseline, snapshot `2026-08-29T14:18:54.079Z`, 43 masters.

---

## 2. The portable core

Ordered by value ÷ effort. **The one to take first is #1**, and it is deliberately not the most impressive thing here — it is the one whose absence makes everything below it decay.

### 1. The exemption store with the stale sweep — ~40 lines, five reimplementations here

**What it checks:** nothing, directly. It is the shape every allowlist in the repo has: a key, a `kind: 'design' | 'gap'`, and a prose reason. `design` is a closed question and stays silent; `gap` prints a warning on **every** run so an unfinished migration keeps nagging; and the gate errors when an entry suppressed nothing this run — the defect was fixed and the excuse outlived it.

**Seam:** none needed. `exemptions(map) → { check(key), reportStale(seenKeys), warnings }`.

**Cost:** trivial. It exists five times already, independently: `check-figma.js:165-190`, `check-primitives.js:90-96`, `check-a11y-parity.js:98-107`, `check-metadata.js:250-259`, `check-token-bypass.js:173-179`.

**Depends on:** nothing.

**Why first.** Because the failure mode it prevents is the one that kills gate suites, and this repo has the receipt: `lessons.md:129` — *"An exemption list is where a rule goes to die. I wrote `«` and `»` into `[TEXT-GLYPH]`'s exempt set as French and German quotation marks — true, and it let six live first/last-page arrows through in the same change that closed the rule."* The generalisation is stated at `check-figma.js:165`: an excuse for a defect that no longer exists reads, to the next person, as a defect still being excused. Applied here at three nesting levels inside one file — allowlist keys, `TEXT_UNSTYLED_PENDING` paths (`:1718`), and pending entries keyed on a master that vanished (`:1727`).

Two consequences for anyone extracting a gate from this repo: **every `as-is` label in the Figma group except `[SET-CLIPS]` is wrong without this**, because the check calls `allowed()`. Verified by grepping all 19 `allowed(` call sites in `check-figma.js`: `[AUTOLAYOUT]` (:944), `[OVERLAY]` (:1807), `[TOKEN]` (:902/905/908/912) and `[PAGE-GLYPH]` (:2394) all consult it. `checkSetClips` (:2357-2385) is the only check in that 2,504-line file that does not.

### 2. The severity harness — ~60 lines, duplicated near-verbatim

`blocker()/critical()/warning()` into one `{sev, tag, msg}` array, a `report()` that sorts BLOCKER→CRITICAL→WARNING, prints one actionable line each, exits 1 on errors only. `check-figma.js:107-111` + `:2408+` and `check-parity.js:88-95` + `:180-221` are the same code down to a `critical()` that `check-parity` never calls and marks `eslint-disable-next-line no-unused-vars`. Cost: trivial. Depends on: nothing.

The part worth copying is not the sort — it is that **a finding prints what to do about it**. Every message in this repo names the fix, and the two-severity split is what lets the suite carry 14 standing warnings without them reading as failure.

### 3. `driftGate({ targets, regenCommand, hint })` — ~30 lines, eight copies

**What it checks:** a committed artifact equals what its generator would produce right now. Build in memory, read the file (missing = drift), compare, print `Run: <generator>`, exit 1.

**Cost:** trivial to write; deletes ~110 lines across eight call sites.

**Verified count: eight, not nine.** `grep -n "'--check'" tools/scripts/*` returns eleven hits; `check-geometry.mjs:55` and `wcag-contrast.mjs:166` both bind it to `QUIET`, a verbosity flag over a live measurement, not a drift compare. The eight real ones are `sync-spec`, `sync-tokens`, `gen-behaviors`, `gen-llms-txt`, `gen-cookbook-manifest`, `gen-box-sizing`, `gen-design-status`, `gen-artboard-palette` — and no two spell it the same way (three use `argv.includes`, two `mode === '--check'`, one a `CHECK` const, two something else again).

The reusable half is the decision, not the helper. `sync-tokens.mjs:8-14`: **a copy that is MAINTAINED drifts; a copy that is GENERATED cannot.** Five mirrors of `tokens.css` exist here; four are byte copies and are generated, and the fifth — three Storybook MDX pages that must *name* the font families in prose — cannot be a copy, so it is checked instead. Generate what you can, check what you cannot.

### 4. `check:css-tokens` Pass A + Pass C — ~60 lines, best hit rate per line in the suite

**A:** no raw colour literal in a declaration value, after every `var(...)` call is stripped out (`stripVarCalls()`, `:76-100`, a balanced-paren remover so a fallback literal inside `var()` does not count). **C:** every `--ui-*` a stylesheet *reads* is declared somewhere.

**Seam:** the token prefix and a glob.

**Depends on:** nothing but CSS.

Pass C is the single most transferable rule here and the cheapest to reimplement, and this repo has a **live instance of exactly its defect one directory outside its scope**: `docs/src/pages/figma-token.astro:172` reads `var(--ui-color-on-primary)` with no fallback; that token is declared nowhere (the real one is `--ui-color-text-on-primary`, `tokens.css:302`), so the SVG label paints the CSS default instead of white on the primary fill. `lessons.md:313` states the rule the finding produced: *"The fallback is what makes it silent, so a fallback is not an excuse to skip the report; it is the reason to make one."*

Do **not** take Pass B with it. That is a 75-line check that every `--ui-*` carries an `{intent, constraints[]}` annotation in `tokens.manifest.ts` — an Atelier invention (`plan/ai-readiness.md`). Its self-arming mechanism is worth stealing on its own, though: `COVERAGE_REQUIRED = annotatedTokens.size > 0` (`:194`) promotes the check from warning to blocker the moment the first annotation lands.

### 5. The "a document may not cite what does not exist" family — 78 + 81 lines, as-is

`check-adr-refs.js` (78 lines, `fs` + `path`, three config values: the ADR dir, the index path, and six extra source files) and `check-skill.mjs` (81 lines, `node:fs`/`path`/`url`, one path constant). Both enforce the same rule on different corpora, and `check-docs-sync.js:393-407` enforces it a third time on a nav index. Three implementations, one rule, zero shared lines.

Take the code, not the idea: the regex boundary comment at `check-adr-refs.js:48-49` records that the first version reported thirteen ADRs as citing "ADR 2026", because `\d{4}-[a-z0-9-]+\.md` matches the date tail of `design-findings-2026-07-22.md`. Any reimplementation hits that. It caught six dead references across 65 ADRs, the same wrong filename guessed twice — from the title rather than the path.

The generalisation is `check:docs`'s `[NODE-ID]` half: **a docs page may not cite an identifier the source of truth does not know.** Swap Figma node ids for Jira keys, operationIds, feature flags, table names; the harness is `{ inventory(): Set<string>, extract(line): string[] }` and ~60 lines. The expensive engineering is the false-positive guards, not the loop: `check-docs-sync.js:300-302` requires the line to mention figma/node-id, requires ≥2 digits per part and forbids a leading zero, so `11:00–12:15` and `4.5:1` are not node ids — and one German agenda file is excluded by name with the finding attached (`:45-53`, seven hits, all clock times).

### 6. `check:box-sizing` — 167 lines, and one CSS trap no linter checks

Two rules. (1) Every component stylesheet opens with a generated `<root>, <root> * { box-sizing: border-box }`, whose selector is derived from that directory's own leading `.atl-*` classes, so adding a root without regenerating fails `--check`. (2) **Any rule using `all: unset|initial|revert` must restate `box-sizing` in the same block**, because the reset has the same specificity and wins on source order.

The specificity argument (`:26-29`) is the transferable design thinking: declare the box model with the component at (0,1,0), so it beats a consumer's `* { box-sizing: content-box }` and still loses to any rule naming an element. Measured motivation, in the header: with no consuming reset, Angular's `atl-button` at `size=md` renders **60px against a token claiming 40**, a menu item 52 against 36, a code-block header 65 against 43. ADR-0051: AtlPagination's page button rendered 38px against its own `height: 2.25rem` because `all: unset` had put it back to content-box — 15 rules across three frameworks were in that state.

**Seam:** the `.atl-` prefix, the `atl-<dir>.css` convention, and a per-target "is this encapsulated" flag (Angular gets `:host`). One caution: this gate **writes into hand-edited files** and does stale-block replacement by string surgery (`:152`). A package wants a delimited region.

The same family: `check-typeface.js`'s `[FONT-AFTER]` (`:207-219`) — no `font-*`/`line-height` longhand above a `font:` shorthand in the same rule, because the shorthand resets them. That one is genuinely as-is; it fires on any `font:` shorthand. Its sibling `[RESET-WIPED]` is **not** as-is, and the challenge is right: `:222-227` gates the loop body on `FAMILY_TOKENS = /var\(--ui-font-(family|display|mono)\)/`, so `.x { font-family: Georgia, serif; all: unset }` is silently accepted. It enforces "an Atelier token declaration wiped by a later reset", not the general CSS fact.

### 7. The a11y-tree normalizer + cross-implementation differ — 209 + 147 lines

Take this **if and only if you ship more than one implementation of one contract.** Then it is the highest-value artifact in the repo.

`a11yTree(root: Element) → {role, name, states}[]` walks a rendered DOM and normalizes to semantic equivalence: explicit role beats a 20-tag implicit table, `presentation`/`none` and role-less wrappers are skipped but descended, `aria-hidden`/`hidden` subtrees leave both the tree and the accessible name, native `disabled`/`checked`/`required` collapse onto their ARIA equivalents, `aria-X="false"` and absent both drop.

**The evidence that it carries nothing repo-specific is mechanical:** it is **byte-identical across all three libs** (`diff libs/react/src/testing/a11y-tree.ts libs/{vue,angular}/…` → no output, verified). It is triplicated only because `@nx/enforce-module-boundaries` forbids a spec importing from `tools/` (ADR-0025).

Two design decisions to keep. Without normalization, React's `<button>` and Angular's `<atl-button role="button" aria-disabled>` could never compare equal despite being identical to a screen reader. And the differ compares **N real renders against each other, not against one authored expectation** — an authored expected tree can itself be wrong; three renders agreeing have no privileged reference. That is what makes it general past three JS frameworks: web vs native, a rewrite against its predecessor.

**Two things a published version must fix**, both found by reading: equality is `JSON.stringify(a) !== JSON.stringify(b)` (`check-a11y-parity.js:122`), key-order sensitive and safe here only because one normalizer produces every snapshot; and jsdom means computed visibility is not modelled, so a component hidden by `display: none` still appears.

### 8. `tools/parity/behavior-coverage.mjs` — 167 lines, already config-driven, and the only portability claim in this review verified by execution

For every `(subject, id)` in a JSON manifest and every implementation directory, an **invoked** `covers('<subject>','<id>')(…)` call must exist in a matching spec file, read from the AST. Bare statements and `.skip`/`.only`/`.todo` chains do not count; `.each` does.

`isInvokedBinding` (`:43-59`) is the reusable part: it distinguishes *a test that runs and claims this id* from *a string that exists in the file*, which is the failure its own predecessor could not detect. `marker-coverage.mjs` is still in the tree as the artefact, and `lessons.md:39` states the lesson: **a drift gate that greps a hand-written comment proves a string exists, not that the thing is true.**

Verified by running it against a config I wrote, unmodified, with a negative control: one implementation and a custom label → `✓ react-only behavior coverage in sync (150 checks across 29 subjects × 1 implementations)`, exit 0; then `binder: 'coversNothing'` → 150 `[UNCOVERED]` findings and a non-zero exit, proving the pass is not vacuous.

### 9. The perturbation probe — ~30 lines inside `check-geometry.mjs`

Measure the box; inject `* { line-height: 3 }` (controls) or `body { line-height: 100px }` (rows); measure again. **If the height moved, it is decided by text metrics rather than by its token.** That proves a value is *stated* rather than coincidental, and it generalises to any "the token claims X" assertion.

Three design notes worth carrying: a *font* override was tried and rejected because the real-world delta was sub-tolerance (`lessons.md:71`); the row probe uses an absolute 100px rather than a multiplier because `line-height: 3` against 12-16px text fits inside a 40-56px row and "let a stripped table cell through" (`lessons.md:91`); and the fixture supplies **no CSS reset**, deliberately, so it measures what a consumer with none actually gets — `lessons.md:49`: *"a fixture's job is to reproduce the consumer's environment, not a comfortable one."*

### 10. `check:dead-selectors` — 898 lines, 3.31s, the novel one

Every class in *selector position* must be emittable by some source in the same component directory, where "emittable" is computed by building a real TypeScript Program and resolving constructed names like `` `variant-${v}` `` through `checker.getTypeAtLocation` to their string-literal union members. An unresolvable substitution is a blocking `[UNRESOLVED]`, not a skip (ADR-0080).

Dead-CSS detection is old. Resolving constructed class names through the type checker is not, and nothing off-the-shelf does it — stylelint has no type information and the class-usage plugins are literal-string scanners. ADR-0081 rejected both alternatives by measurement: a prefix carve-out blinds the gate to ten families nothing else owns; a spec-table resolver reports React's live `.orientation-vertical` dead. Neutering `getSymbolAtLocation` turns 5 findings into 288 — the gate reports most of the library dead while looking like it ran.

Roughly 600 of the 898 lines are framework-generic. **Two blockers for a general package**, both verified: the Angular front-end reads only the decorator's inline `template:` and `host:{}` (this repo has zero `templateUrl` and zero `.html` under `libs/angular/src/lib`, so it is complete here and would miss most real Angular apps); and the React front-end assumes hand-rolled class joining (no clsx/classnames/cva/tailwind-merge anywhere). `clsx('a', c && 'b')` happens to work — its string arguments fall through to `ts.forEachChild` — but `cva({variants:{variant:{primary:'…'}}})` does not, because the object-literal branch (`:342-355`) harvests property **keys** and returns without visiting values. Handling cva/tailwind-variants is the bulk of the extraction work, not the porting.

Adopt when a dead class has already cost you something. It cost 160 days here: the Vue toggle shipped `.atl-toggle.is-checked .track` with no template binding, across every release from v0.0.5 to v0.2.9, green unit tests throughout.

### 11. The ratchet — ~180 lines, and take it **last**

`settleRatchets()` (`check-figma.js:1464-1620`) settles findings against a committed baseline. Five properties, all load-bearing, each learned from a failure the comments record:

1. **Findings, not counts.** *"A count is blind to substitution: fixing one node on a master while breaking another kept the number flat and the gate green"* (`:88-90`). Measured, not theorised — sizing `.atl-accordion-group` while leading `.atl-accordion-item` passed green under the counting version.
2. **Appearance blocks, and unrecorded disappearance blocks** — two independent findings, never a net delta (`:1578-1596`).
3. **`×N` multiplicity travels with the finding**, so a dedup record's arithmetic stays exact when a variant is added.
4. **`why` + `kind ∈ {design, gap}` are mandatory**, enforced as a blocker (`:1554-1560`). Without them a later reader cannot tell "decided against" from "forgotten" (ADR-0066).
5. **The green summary is derived from what was OBSERVED, not from the file**, so it can never print "at the recorded baseline" two lines under a blocker saying it is not.

**Seam:** `ratchet({ observed: Map<tag, Map<label, {count, details[]}>>, baselineFile, seed, emit, isTreeClean })`.

The second copy (`check-typeface.js:285-430`, `[NO-SIZE]`) implements the same rule set **minus one property** — it has no count channel at all; the identity list length *is* the count — and `settleRatchets` has two couplings the second copy lacks: it embeds `snapshot.meta.fileKey` in the appearance blocker (`:1585`) and calls `report()` to exit from `--update`. So "two identical copies" is wrong; "two copies, one rule, and the third caller is one gate away" is right. Rule of three says extract on the third.

**Why last.** It is a tool for a debt you have already measured and cannot pay today. Adopting it before you have one is building machinery for a problem you do not have.

### 12. `probeMcp` from `preflight.mjs` — ~120 lines, different audience entirely

`initialize` → `notifications/initialized` → `tools/list`, then **one real tool call**, over JSON-RPC, handling both `application/json` and SSE `data:` framing. The reason it escalates to a real call is at `:74-80`: the hosted Storybook MCP once answered every reachability check with a harmless status while every tool call failed — a broken manifest fetch inside the worker, surfaced as **HTTP 200 + isError**, because manifests are only fetched inside tool calls. This session's own header carries a live example of the distinction: `plugin:github:github (400)` failed to connect.

No Atelier concepts required. The only repo in the world that does not want this is one that uses no MCP servers.

---

## 3. The transferable patterns

These matter more than the scripts, and none of them requires this repo.

**The ratchet, as a policy rather than a library.** A gate that cannot be green today is a gate people turn off. Record the findings you are not fixing, by identity; block on anything that appears; block on anything that disappears without being recorded; make every entry carry a reason and a kind. The counting version of this is worse than nothing — it is a gate that a substitution passes.

But note the hole it does not cover, live in this repo right now. `tools/figma/type-baseline.json` carries exactly four tags; `FIGMA-VARIABLE-COLLECTION` is gone, its debt paid. The ratchet is still wired at `check-figma.js:1736`, `RATCHET_SEED` still seeds it at `:722`, and `ROOT-TYPE`'s recorded `why` still ends *"Promote to a plain blocker once that entry is gone"* — against `check-figma.js:95`'s own rule, *"WHEN A CHECK'S ENTRY IS GONE: delete the ratchet and make that check a plain blocker."* **265 findings across 35 masters are ratcheted on a blocker that no longer exists.** The ratchet gates drift in the findings; nothing gates drift in the reason. The missing sixth property: a `why` should have to name its clearing condition in a form the gate can resolve, so a satisfied precondition trips the gate instead of waiting to be noticed. That is `[STALE-EXEMPTION]` one level up, and this repo already runs that idea at three nesting levels elsewhere.

**Committed snapshot + offline `--check`.** Split the thing that needs credentials from the thing that applies rules. `figma-snapshot.mjs` captures **facts only** — names, axes, bound-variable names, boxes, per-node type — and its header says so and the code honours it: no severity, no rule, no allowlist. `check-figma.js` applies rules offline against the committed artifact: zero network, deterministic, CI-safe. Four guards make it honest, and all four were learned:

1. **Fail loud on missing / malformed / empty**, four separate times (`:188-240`). The comment at `:205` states the hazard: an unreadable file falling through to "no findings" reads as a clean run *and quietly ratchets every count to zero*.
2. **Pin sibling artifacts to each other** by a shared `generatedAt`, or exit 1 (`:229-237`). Two files from different runs are two different documents.
3. **Refuse to re-record from a red tree** (`:1508-1512`). The documented remedy must not also be the command that swallows an unrelated blocker.
4. **Diff-stable no-op writes** — a no-op `--update` must not rewrite the timestamp.

**Findings, not counts — and identities, not line numbers.** `[NO-SIZE]`'s identity is file + selector with no line numbers, so it survives churn. A number is a thing a gate can keep green while the population underneath it rotates.

**A guard that skips is not a check.** This is the repo's single most recurring failure, named in ADR-0080: *"`if (want !== null)` and `if (label in TABLE)` both read as care and both produce silence. Silence is what a green run looks like."* Four instances in one week: `lengthOf()` returned null for `font-size: inherit`, so `.atl-input`/`.atl-textarea`/`.atl-select` had **never** had their type measured (proven by setting a deliberately wrong token and watching the gate stay green at 14 warnings, exit 0); `ROOT_PAINT`'s exclusion, justified by paint, silently excluded *type* for 13 masters; `[LAYER-PAINT]` did `continue` on an unresolved layer, so fill, radius, stroke and box were all skipped — adding two mechanical selector shapes produced **13 blockers on layers with no prior coverage**; and a master missing from the snapshot produced an *advisory* warning indistinguishable from a stale file, because the probe's category filter omitted the `Data/` prefix.

**Negative-test every gate — and suspect the test.** `lessons.md:73`: *"after adding a check, break the thing it is supposed to catch and confirm it fails. A check that cannot detect its own failure class reads as coverage while providing none — delete it rather than keep it."* Then `lessons.md:325`, from the day the padding gate landed: *"When a negative test fails, suspect the test's setup before the code — the assertion 'this input takes path B' is itself a claim to check."* And the meta-version, `lessons.md:203`: reading a **filtered** view and calling it green — `grep -c "LAYER-PAINT"` printed 0 because the script had thrown, and the stack trace was on a line the grep dropped. Capture to a file and print the exit code.

**Put the exemption where the reader of the artifact will see it.** For a Figma Boolean whose false value renders nothing, the escape is a sentence in the master's own description (`- Boolean \`open\`: not modelled — <reason>`), parsed by the gate. A list inside the script is an exemption nobody reading the master can see. The grammar is Atelier's; the move is universal.

**Convention beats a table.** `[LAYER-PAINT]` resolves a layer name to a CSS selector mechanically (`.name`, `.root .name`, `.root-name`) rather than through a per-layer map, *"because a hand-maintained table about a generated thing rots"* — the failure the Inventory cards had already demonstrated.

**Before writing the report, ask whether the other side CAN comply.** `[ROOT-BOX]` splits thirteen padding divergences into seven bindable (a spacing token holds the value, so it blocks) and six derived (ADR-0041 computes 6.25 / 9 / 11.25px from the control recipe; no token holds them and no Figma Variable can express the arithmetic, so it warns). Reporting all thirteen the same way would have demanded thirteen fixes, six of them impossible.

---

## 4. What is specific to Atelier, and why

Not a list of names. Four bindings, and each one is a decision rather than a path.

**The spec contract.** `libs/spec/src/index.ts` is a TypeScript file that four gates parse with a bespoke syntactic reader, and the convention it encodes — a string-literal union named `Atl<Base><Axis>` where `Axis ∈ Variant|Size|Shape|Position|Orientation|Align|Role` — is what makes `[NAME]`, `check:variants`, `[AXIS-NAME]` and `check:defaults` possible at all. `check:metadata` goes further and validates Atelier's own `ComponentMetadata` schema against Atelier's own registry: 482 lines that check nothing a stranger's repo has. The remainder test at `check-figma.js:848` exists because a plain prefix test turned `AtlTabGroupVariant` and `AtlTableVariant` into axes named `groupVariant` and `leVariant` — the convention is load-bearing enough to have its own bug history.

**The Figma file.** `figma-snapshot.mjs` is 895 lines of which the two Plugin-API probes encode Atelier conventions end to end: a hand-maintained 43-node `MASTERS` roster (with comments explaining why 55:141 and 55:145 were replaced), the `_`-prefixed overlay layer convention, the `Icon/` master prefix, the `Action|Form|Display|Navigation|Overlay|Feedback|AI|Data/` section paths, and the page names. `ROOT_PAINT` (30 entries), `ROOT_TYPE` (16) and `LAYER_ALIASES` are three more hand-maintained tables of pure repo knowledge. And one twelve-line function is the whole bridge: `cssToVariable()` (`:1776-1787`) maps `var(--ui-<group>-<name>)` ↔ `<group>/<name>`. Four checks depend on it. **Any port begins by choosing that bridge**, and it is a naming convention, not a rule.

**The three-adapter rig.** `check:sync`, `check:exports`, `check:a11y-parity`, `check:defaults` and half of `check:typeface` exist because one contract has three implementations. Note the honest inversion: **five gates never open `libs/spec` at all** — they compare adapters to each other, or apply one rule uniformly to all three — and those five carry almost all of the group's portable value. The gates that read the spec degrade in portability exactly in proportion to how much of Atelier's naming they encode. The rig is also why the a11y normalizer is triplicated rather than shared, and why `check:defaults` has three framework-specific extraction regexes instead of one.

**The workshop.** `check:llms` emits a public `llms.txt` with five hardcoded prose blocks. `check:cookbook` and `check:cookbook-manifest` are both hardwired to a six-pattern catalog in `docs/src/data/patterns.ts` and both throw unless they find exactly six. `check:design-status` derives a table from five in-repo artifacts plus one out-of-repo registry, and it exists because ADR-0040 found the honest coverage number was zero of 29 while seven ADRs of adjacent token infrastructure got done in one session and nobody could see it. `check:story-descriptions` enforces that a Storybook description is a *reference* to `metadata.purpose` rather than a copy. All four exist to keep teaching material true, and none of them is a design-system gate.

`check:iconography`'s `[NO-GEOMETRY]`/`[ORPHAN]` is the least portable and cheapest to rewrite: a bijection between two named constants matched by regex against raw source text. Two brittleness notes worth carrying into any rewrite — `:157` requires exactly two-space indentation and forbids digits in an icon name (`arrow-2` would read as undefined geometry), and `:156` slices from the first *textual* occurrence of `ATL_ICON_GEOMETRY`, so a doc comment above the declaration moves the window.

---

## 5. The holes

This is the section that saves somebody else the same week.

### Gates that do not exist

| Hole | Consequence | Evidence |
|---|---|---|
| **Nothing typechecks the stories** | `atl-stepper.stories.tsx(88,35): error TS2322: Type '"vertical"' is not assignable to type '"horizontal"'` — invisible to `check:all` and to `nx run-many -t test,lint`, both green | run this session. `tsc -p libs/react/tsconfig.spec.json` currently reports 7 more, so the gate cannot be switched on without paying them first |
| **`radio-group/` is watched by no parity record** | 37 parity records hash 25 of 31 component directories. Four of the six uncovered are the named intentional ones; `radio-group` is a real directory in all three frameworks that no `inputsHash` invalidates | re-derived from every record's `inputs` list this run |
| **The parity gate cannot see the shared token layer** | `inputsHash` covers `libs/*/src/lib/<module>/` only, so ADR-0035 changed the UI typeface for all 29 components and triggered no `[DRIFT]` blocker | todo.md:372 |
| **A second `preflight.mjs`, ungated** | `libs/create-workspace/.../tools/scripts/preflight.mjs` is byte-identical to `tools/scripts/preflight.mjs` (verified by `diff`) — a 426-line maintained copy in exactly the shape `sync-tokens.mjs` exists to prevent | verified |
| **Nothing cross-checks `snapshot.json.uiTokens`** | Its only guard asserts prefix counts sum to the total, which a *truncated* list satisfies — the pre-fix snapshot held 50 names summing cleanly to 50 | todo.md:1862 |
| **Nothing gates the Figma icon set against `AtlIconName`** | The snapshot captures the Components page, not the Icons page; adding an icon to the spec and forgetting Figma is invisible | todo.md:701 |
| **An orphaned Figma main component is unreachable** | Figma keeps a removed COMPONENT alive while an instance references it, and `findAll` cannot reach it — invisible to every tree walk including the probe | todo.md:325 |
| **The reverse direction of `check:dead-selectors`** | A class a template emits and no stylesheet selects. Built, measured at 49 heterogeneous rows, deliberately not shipped (ADR-0066/0081) — which is why AtlRadioGroup's dead `is-readonly` is still ungated | todo.md:776 |
| **Storybook interaction + a11y tests are not wired in CI** | `ci.yml` carries a 20-line comment with the full repro and the ruled-out causes. The reason for leaving it out is right — *a permanently red or yellow job asserts nothing* — but the coverage is absent | ci.yml |
| **A dependency prune can break a dynamic reach** | `@angular/animations` was pruned as a dead dep, CI stayed green three days while every Cloudflare deploy failed | todo.md:1831 |
| **Participant Claude Design artboards** | See §7. Reach, not rules | todo.md:127 |

Also: `nx.json:36` lists `tools/eslint-rules/**/*` as a lint input and **that directory does not exist**. No custom ESLint rules ship.

### Defect classes nothing catches

- **State variants.** `[ROOT-PAINT]` skips every non-`default` `state` variant and says so loudly — 12 of AtlButton's 24, and 8 warnings of this shape in today's run. `[LAYER-PAINT]` does the same skip. The gate reporting its own blind spot is better than most, and the blind spot is still large. `lessons.md:334`: *"Before changing anything in a state the gate does not check, read that state's rule; the gate's silence there is not agreement."*
- **Derived padding.** Six `[ROOT-BOX]` warnings (Button, Input, Textarea, Select, Badge, Tab) will never clear — the ADR-0041 structural limit. That is exactly the "warning nobody can clear" ADR-0066 threw out, routed to a warning rather than to the ratchet built for it.
- **The blocking form of `check:parity` never runs in CI.** `check:all` runs `--report`, which cannot fail. Combined with `redesignPhase` (now closed) there were two independent softeners on one finding. The blocking form is only ever run by hand with the Figma bridge open.
- **Conditional CSS.** The crude splitter `/([^{}]+)\{([^{}]*)\}/g` appears verbatim in `check-typeface.js:156`, `gen-box-sizing.mjs:120` and `check-figma.js:1346`, and it **swallows at-rule preludes**: `[...'.a{color:red} @media (min-width:600px){ .b{color:blue} }'.matchAll(re)]` → `[['.a','color:red'], [' .b','color:blue']]`. The `key.startsWith('@')` guard at `check-figma.js:1350` therefore never fires for a rule nested inside an at-rule. Latent here — 18 stylesheets contain at-rules and their contents are only `animation: none` and a `::backdrop` background, none of which these resolvers read — and fatal for any repo that uses media queries for layout. This sits underneath the proposed shared "offline CSS reader".
- **Two smaller ones of the same kind.** `check-variants.js:73` scrapes classes with `/\.([a-zA-Z][\w-]*)/g` over raw file text, so a class named only in a comment counts as defined (reproduced: `url(./variant-png.png)` yields a class `png`). And `check-story-descriptions.js:80-82` accepts any identifier ending in `.purpose`, so a locally declared `const meta2 = { purpose: 'hand-written' }` satisfies the "derive, don't annotate" rule.

### The failure modes this suite has actually had

`tasks/lessons.md` is 335 lines and 39 dated sections, and it is the single most valuable artifact in this repo for anyone building the same thing. Beyond the skip-is-not-a-check family above:

- **Never justify a gate's scope with what another gate is assumed to guarantee — go read that gate.** `check-geometry` measured React only because "check:sync guarantees the CSS is mirrored". `check:sync` has never read a byte of CSS. The invented guarantee hid a 20px defect: Angular's `<atl-button>` is a custom element and rendered 60px against a 40px token while the gate reported green.
- **A gate whose roster is built from token references cannot see a component that hardcodes the value.** `check:geometry` missed AtlTab at 41px and AtlCodeBlock's header at 43px because they wrote `2.5rem` instead of `var(--ui-control-height-md)`. When a gate discovers its subjects by looking for a token, ask what a bypass looks like — that is where the defect will be.
- **Bound is not the same as bound correctly.** Three of AtlMenu's root facts were bound and wrong (`radius/sm` for `--ui-radius-lg`, `color/surface` for surface-raised), and `[TOKEN]` passed all three. Worse, three Figma bindings rendered *identically* to the right answer because `--ui-color-input-bg` aliases `surface-sunken`: correct pixels, broken semantics, breaks the day the alias moves.
- **Reading tokens.css without stripping comments poisoned every `calc()`.** A prose mention of `--ui-row-inset: 0` was parsed as a declaration; `resolveLength` returned null; every `min-height` behind a `calc()` was silently unchecked. *"A resolver that returns null on failure turns a parse bug into missing coverage — the failure mode you cannot see."*
- **After changing how a value is written, perturb it and watch the gate fail.** Migrating four rules to a `font:` shorthand silently deleted `[ROOT-PAINT]`'s typography check for AtlAlert and AtlToast, and `check:figma` stayed green — the summary line does not count typography comparisons. Green is not evidence the check ran.
- **When a diff comes back mostly-changed, suspect the comparison.** A before/after over 43 masters reported "37 of 43 changed" with deltas up to 2416×1056, because it read each SET's bounding box against a card stating the default *variant*'s size. Absurd enough to catch; a smaller mismatch would have read as a real regression.
- **The write API is not uniformly loud about refusals.** `node.remove()` on a COMPONENT_SET with children did nothing and reported nothing, leaving every drawing duplicated. An overlay loop reported `overlays: 0` because the target was a FRAME not an ELLIPSE — *"a creation count of zero deserves the same suspicion as an empty result set."*
- **A stale closed item is worse than a stale open one.** Two closed backlog entries stated things now known false, including ADR-0070's idempotency claim. A closed item reads as settled fact and nothing revisits it. And one open item sat contradicted by a later entry in the same file for five weeks.

---

## 6. Proportionality

**The measured ratio.** 10,181 lines of gate code in `check:all` (9,339 across 30 chain scripts + 842 in `tools/scripts/lib`), against **27,107 lines of production component code** (14,711 TS/TSX/Vue excluding tests and stories, 12,396 CSS). That is **0.38**. Against the full `libs/*/src/lib` tree including 17,062 lines of stories and 14,747 of tests, it is 0.17. Comment density across `tools/scripts` is 25%, and 29% inside `check-figma.js` — so roughly a third of the gate line count is header prose recording the measured defect that motivated each rule.

Note the brief's figure of ~7,300 lines understates it by about 28%.

**Is it worth it here?** Yes, and for a reason that does not transfer: **this repo's product is the verification story.** The gates are the teaching material. A normal 29-component library copying this ratio would be over-engineering. What it should copy is the *shape of the headers* — every rule here was written after a measured defect and the header names it with a date and a magnitude, which is exactly why the rules are narrow and the allowlists short. `check:token-bypass` explicitly refuses to demand that every value be a token, because grouping 190 literals showed 116 were one-off component dimensions and only 13 duplicated an existing token; tokenising the 116 would have been *the rule of three violated in token form*. `check:dead-selectors` built its reverse direction, measured it at 49 heterogeneous rows, and did not ship it.

**The cheapest available win, which nobody has taken.** `check:all` is 39.82s. Five runs of `npm run check:tokens` take 2.77s; five runs of `node tools/scripts/sync-tokens.mjs --check` take 0.44s. That is **~0.47s of npm wrapper overhead per gate × 29 gates ≈ 13.5 of the 39.8 seconds — about 34% of the run spent spawning npm.** Replacing the `&&` chain with one runner that spawns node directly cuts it to roughly 26s for zero behaviour change.

**What a smaller team adopts, in order.**

*First, the substrate* (§2 items 1-3, ~130 lines): the exemption store with its stale sweep, the severity harness, `driftGate()`. Every later gate is cheaper if these exist, and the first one is what stops the allowlist becoming a place findings go to die.

*Then the cheap high-yield rules:* `check:css-tokens` Pass A + Pass C (~60 lines, and there is a live instance of the Pass-C defect in this very repo one directory outside its scope), `check:box-sizing` (167 lines, catches an `all: unset` trap no linter checks), `check:adr-refs` (78 lines, as-is).

*Then, conditionally:* the a11y normalizer if you ship more than one implementation; `check:dead-selectors` once a dead class has already cost you something; the ratchet only when you have a measured debt you cannot pay.

*Last, and explicitly:* **do not start with `check:figma`.** 2,504 lines, 3.88s, and it cannot run without `figma-snapshot.mjs` (895 more lines, a Figma Desktop bridge, a hand-maintained 43-node roster) plus three hand-maintained cascade tables. Its value is entirely conditional on the design file already being a real source of truth with bound variables and named variant axes. Adopted before that, it asserts nothing.

---

## 7. Claude Design — where it stands

**Shipped, and verifiable.** Four things: the 625-line `/claude-design` Explanation chapter (live, HTTP 200, 107,556 bytes, registered in `BaseLayout`/`source-path`/`og-pages` and deliberately absent from `workshop-track.ts` — zero hits for "claude"); the ~12-minute "Drei Richtungen" trainer demo in Tag 1 Block 04, in both German files, funded without moving the block boundary; `gen:artboard-palette` / `check:artboard-palette`, 6th of 29 in `check:all`, green at 48 values; and the `atelier-design` skill's token sheet, now a fourth generated target of `sync-tokens.mjs` rather than a hand-maintained mirror that had reverted to the retired Inter/Fira Code brand.

**Written and shelved.** Five complete participant katas (`review-state-2026-08-26.md:171-266`), with timeboxes, done-conditions and agenda slot arithmetic, each written so its done-condition survives a read-only canvas. They appear nowhere in `docs/src`. `todo.md:1901`: *"Unchanged and deliberately not shipped."*

**Coverage, stated honestly — which none of the four readers did.** `check:design-status` reports 29 of 29 components with an artboard, 0 fragment-only, and that number is **a hand-typed claim laundered through a generator**. `tools/design/artboards.json` is 31 entries whose `meta.note` says "this registry is hand-maintained"; each entry carries a `file` field like `"Typography Directions.dc.html"` and **nothing in the repo resolves it** — two files mention `.dc.html` at all and neither opens one. The gate proves that `plan/design-status.md` matches the JSON, not that any artboard exists. `gen-design-status.mjs:17` marks the column `← hand-maintained` in a source comment; the published table does not carry that caveat next to the number. This is the one place the repo knowingly breaks its own rule (`lessons.md:286`: *"if a value exists twice because one side cannot import the other, generate the second side on the day you create it"*), and the generated presentation makes the exception harder to see rather than easier. All 29 landed on a single day: `3fe7d9b` → `e55de22`, 2026-08-26.

**Blocked on what, exactly.**

| Item | Blocked on | Size |
|---|---|---|
| The widened per-seat test — can a non-author, participant-class account run `/design` end to end (skill availability, publish, save)? | Two non-author seats of the right credential class. The workshop provisions API keys, which are the wrong class | small in effort; **gates katas 1/2/5 and the homework option** |
| Figma **export** from claude.ai/design | One manual spike. Import via Figma links is confirmed first-party; export is not | small |
| The `/design-sync` manifest — four verified defects (two phantom tokens, `--ui-transition-*` typed as "color", 20 private `--docs-*` tokens presented as public API, `react/forbid-elements` with an empty list) | An authenticated session. It lives in the external project | small in effort, impossible for any script |
| Participant `.dc.html` artboards ungated | Reach, not rules. The three adherence regexes already exist in the synced DS's `_adherence.oxlintrc.json` | medium — needs mirroring 31 external files or an authenticated client |
| Prerequisites 4-7 (kata slot arithmetic, Kata 3's unexecutable gate leg, re-syncing the DS, Kata 2's counts) | The kata track | medium, all untouched |

**Blocked by decision, not by evidence.** The canvas → Figma → code chain is forbidden and no spike unblocks it: artboards import as frames, not COMPONENT_SETs with variant axes and bound Variables, so `check:figma` and `check:parity` would assert nothing — and because parity keys on a node id (ADR-0024), an imported frame would not *fail* parity, it would *compare nothing*. Published verbatim as a limit, and no diagram on the page draws that arrow.

**The credential fact, reproduced this session rather than taken on trust.** `mcp__claude-design__list_projects` → `{"error":"needs_design_scopes","scopes":["user:design:read","user:design:write"],"prompt":"…run /design-login and retry… Retrying or refreshing the current sign-in won't fix this."}`. So "a spawned script cannot reach it" holds, and holds for subagents specifically. The palette chain is therefore one gated hop and one manual hop — `tokens.css --(gated)--> artboard-palette.css --(a human with MCP access)--> _sheet.css` — and the script's header states the split rather than hiding it.

**What it cannot do, plainly.** It cannot check a single artboard. It cannot push the palette without a human. It cannot be exercised by CI at all. It cannot be used by participants. It cannot feed the loop — nothing an artboard produces enters steps 1-4. `/design-sync` is React-only, so under ADR-0014's one-framework-per-cohort rule it is a trainer demo or it is cut. And its own second hop is unverifiable: nothing confirms that `_sheet.css` in the Atelier project currently matches the generated block.

**State, in one line.** The argument is finished and published; the practice is written and shelved. Everything scoped as unblocked shipped complete and verifiable; everything participant-facing did not, and all of it waits on one small test that has been open since 2026-08-26 while three days of shipping work routed around it.

---

## 8. Verified vs assumed

| VERIFIED (run or read this session) | ASSUMED (read from records, or judgement) |
|---|---|
| `check:all` exit 0, 39.82s real / 40.55s user, 14 warnings, 4 ratchet lines, snapshot `2026-08-29T14:18:54.079Z`, 43 masters | Every extraction cost. No extraction was attempted; all sizes are argued from line counts and named couplings |
| 29 chain entries, 30 distinct scripts, 9,339 + 842 = **10,181 lines**; production 14,711 TS + 12,396 CSS | The twelve in-repo-recorded gate gaps in §5 not marked verified, read from `todo.md` and the ADRs |
| npm overhead: 5× `npm run check:tokens` = 2.77s vs 5× `node …sync-tokens.mjs --check` = 0.44s | That nothing off-the-shelf does checker-driven class resolution (ADR-0081's claim plus the absence of a dependency; no ecosystem survey) |
| `--check` grep: **8** real drift gates; `check-geometry.mjs:55` and `wcag-contrast.mjs:166` bind it to `QUIET` | The cva blind spot in `check-dead-selectors` — read off the code path at `:342-355`, not executed |
| Baseline carries exactly 4 tags; `FIGMA-VARIABLE-COLLECTION` gone; seed still present; `ROOT-TYPE`'s `why` still says "Promote to a plain blocker once that entry is gone" | The `/design-sync` manifest defects and the 7-of-40 palette drift (both external and, by the repo's own admission, unre-checkable from here) |
| All 19 `allowed(` call sites in `check-figma.js`; `checkSetClips` (`:2357-2385`) is the only allowlist-free check | The per-seat editing gate mechanics (from a binary-strings audit, not a run) |
| `npx tsc -p libs/react/.storybook/tsconfig.json --noEmit` → `atl-stepper.stories.tsx(88,35): TS2322` | That the a11y approach generalises past three JS frameworks — an inference from a DOM-only interface |
| 37 parity records hash 25 of 31 dirs; `radio-group` hashed by none | Which checks another design system would actually want |
| `mcp__claude-design__list_projects` → `needs_design_scopes` | |
| `artboards.json`: 31 artboards, `redesignPhase.active === false`, `meta.note` says hand-maintained; only 2 files mention `.dc.html`, neither resolves one | |
| The at-rule regex flattening, the `check-variants` comment scrape, and `behavior-coverage.mjs`'s portability + negative control — all reproduced by execution | |
| `a11y-tree.ts` byte-identical across three libs (`diff`, both ways); the two `preflight.mjs` copies byte-identical | |
| `tools/eslint-rules/` does not exist | |

---

## 9. The weakest point of this review

**No gate was fail-tested.** This was a read-only pass, and every script derives `ROOT` from `__dirname`, so a scratchpad copy reads the real artifacts and a genuine negative test means editing a committed file. So every "gate X catches Y" here is read from the code plus this repo's own dated record of what it caught — not re-demonstrated. That is precisely the standard `lessons.md:73` sets and this review does not meet: *a check that cannot detect its own failure class reads as coverage while providing none.* The one exception is `behavior-coverage.mjs`, which I ran with a negative control, and it is the only portability verdict here that is demonstrated rather than inferred.

Second weakest: the portability classes are a taxonomy applied by reading, and the challenge pass moved seven of them — three by finding an Atelier coupling *several lines above* the emit site rather than in the header. `[RESET-WIPED]` reads as a general CSS fact and is gated behind a token-prefix `continue`; three `as-is` Figma checks all call `allowed()`. **Anyone sizing an extraction from this repo should read outward from the emit site to the top of the enclosing loop, not from the header comment down** — the headers here are unusually honest, and the coupling that downgrades a claim is typically not in them.

Third: `check:metadata`, `check:cookbook`, `check:llms` and `check:design-status` were classified `specific` and not re-challenged. Those four are 1,500+ lines, and their labels stand unchallenged rather than confirmed.
