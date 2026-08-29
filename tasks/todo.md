# Atelier — Status

## Defect batch: packaging + dark contrast + cleanup — 2026-07-10

Scope: the three "real defects" from the H1 list (dark-mode contrast, D10
packaging, Node baseline) + repo cleanup. ADR-0026.

- [x] Cleanup: deleted untracked `CLAUDE-FABLE-5.md` (system-prompt dump) and
      stray ignored junk `libs/vue/{Users,dist,tmp}` (old copy-command artifact
      with `angular-llm-components` paths + stale local build outputs).
- [x] **Dark-mode contrast**: `--ui-color-text-on-success: #0a1116` added to both
      dark blocks (was #fff on #4ade80 = 1.74:1; now ≈10.9:1). Also fixed the
      **asymmetric `[data-theme="light"]` block** (pre-existing bug: OS-dark +
      explicit light leaked dark values): re-declares `text-on-secondary`,
      `text-on-danger`, `text-on-success`, `opacity-disabled` now. Edited in the
      preset canonical copy, synced via `sync-tokens.mjs` (4 files).
- [x] **D10 packaging** (ADR-0026): React dist now ships `lib/**/*.css` next to
      compiled JS + `styles/tokens.css` (project.json assets). **New discovery
      while fixing: the Vue package had NO entry point at all** (no
      main/module/types/exports in package.json) and Vite lib mode emitted
      `index.css` that nothing imported → fixed via package.json exports map,
      dts `entryRoot: 'src'`, rollup `banner: "import './index.css';"`, and a
      tokens copy step in the build command. Angular ships tokens via
      ng-package assets + merged `exports` subpath. README tokens-import claim
      (`@atelier-ui/<fw>/styles/tokens.css`) is now true for all three.
- [x] **Node baseline**: `engines` `>=22` → `>=22.12.0` (matches preflight; floor
      story now: engines/preflight 22.12.0, schulung "Node 22 LTS",
      `.node-version` 24 = dev/CI pin above the floor). Audit's "agenda 20|22"
      was already fixed. The pnpm mentions in install.astro are legit
      pkg-manager tabs, not stale — no change.
- Verified: consumer proof (packed all 3 dist tarballs → scratch npm install →
  esbuild bundle: React resolves component CSS + tokens, Vue resolves entry +
  auto-loads index.css, Angular tokens subpath resolves); `check:all` green;
  `check:parity` unchanged baseline (3 unverified, non-blocking); preset + CLI
  tests green; lint green (react, vue, angular, create-workspace); cli-e2e run.
- Follow-up (new): cli-e2e never renders a component, so dist-packaging
  regressions stay invisible — make the scaffolded app or an e2e step import a
  component (see ADR-0026 consequences).

## Approach audit: gaps / improvements / blind-spots — 2026-06-17

Source: read-only audit workflow `wf_9736c813-eca` (26 agents, 73 verified findings, 0 refuted).
Full roadmap: `~/.claude/plans/validated-sniffing-lamport.md`. Core finding: gates prove a
string/binding EXISTS, not that it is TRUE; verify-loop + LLM-thesis eval are unenforced/unmeasured.

Safe mechanical fixes (no decision needed) — landing now:
- [x] `.gitignore`: fix malformed line 53 (`settings.local.json.netlify/state.json` was one jammed line); add `.env`/`.env.*`/`.dev.vars`/`*.log`
- [x] Untrack `debug-storybook.log` (`git rm --cached`)
- [x] `plan/figma.md:142` LlmButton variant → add `danger` (spec has it; doc was stale)

DONE this session (Close-the-loop, group A):
- [x] Version band: accept 0.1.x → ADR-0023 (+ ADR-0016 note, README row). User decision.
- [x] **A2 — parity persistence gate**: `tools/scripts/check-parity.js` + `parity-record.mjs` + `lib/parity-inputs.js` + `tools/figma/parity.json`; `check:parity`/`parity:record` scripts; ADR-0024; docs verify-step wired (loop page only — kata builds composed SettingsCard, not a master). Verified: baseline 3-unverified/exit0, record→OK, input drift→BLOCKER/exit1, revert clean; check:all green.
- [~] A1 — generation eval: DEFERRED by user (kept on roadmap; needs a model + API key to run).
- [x] **A3 — cross-framework a11y-tree conformance**: jsdom a11y-snapshot per fw + offline diff gate. New: `libs/<fw>/src/testing/a11y-tree.ts` (normalizer, ×3 like behavior.ts), `llm-button.a11y.spec.*` (×3), `tools/parity/a11y/llm-button.<fw>.json` (×3), `tools/scripts/check-a11y-parity.js`; `check:a11y-parity` (in check:all) + `gen:a11y`; ADR-0025. Proof: LlmButton — all 3 produce byte-identical a11y tree despite native-button (React/Vue) vs role-host (Angular). Verified: gate green, synthetic divergence→BLOCKER, per-fw drift guard passes in `nx test`, lint clean all 3, check:all green.

## H1 acute fixes (full review follow-up) — 2026-07-06

Source: full-material review (4-agent fan-out: gate impl, ADR rationale, workflow, alternatives research).
H1 = acute fixes; H2-H9 (Playwright aria-snapshot gate, DTCG token pipeline, shared testing lib,
visual regression, contract projections, deploy consolidation) reviewed but not yet decided.

- [x] CI `checks` job → `npm run check:all` (was a hand-copied 15-gate list that had already
      drifted: `check:a11y-parity` missing). Gate list now single-sourced from package.json.
- [x] pre-push hook staleness self-check (`cmp` installed copy vs `tools/git-hooks/pre-push`,
      refuse + point to install-hooks.sh). Local hook reinstalled; installed copy from May 27
      had silently missed the May 31 gen-behaviors addition.
- [x] Commit in-flight parity/a11y work: a11y baselines land in the SAME commit as the specs
      that `readFileSync` them (fresh-checkout `nx test` would otherwise ENOENT).
- Review verification: `check:all` green incl. a11y-parity; full `nx test` green in all 3 libs.

Decision-bearing quick wins (deferred — not this session's scope):
- [x] Dark-mode contrast: `--ui-color-text-on-success` in both dark blocks + light-block symmetry → done 2026-07-10 (see top section)
- [x] Version band: re-pin 0.0.x **or** ADR for the 0.1.x move → resolved by ADR-0023 (accept 0.1.x)
- [x] Node baseline: engines → >=22.12.0; rest already coherent → done 2026-07-10
- [ ] Confirm the lockfile flavor — `package-lock.json` was regenerated on macOS for
      dep-batch A (2026-08-26, Docker daemon down). The publish job's `nx release` then
      rewrote it on Linux (7cca39c), pruning 27 macOS-only transitive entries
      (@module-federation/*, @napi-rs/wasm-runtime, …), so main is Linux-written again.
      What that commit did *not* visibly touch is the ~47 `dev` ↔ `devOptional` marker
      flips from the same install. Run `tools/scripts/relock.sh` with Docker up once and
      check whether it produces an empty diff; if it does, close this.
- [ ] **No target type-checks the stories** — this is the mechanism behind the
      "fabricated props" class of defect. Stories *are* in `tsconfig.spec.json`, but
      nothing runs `tsc` over it: `nx test` (vitest) transpiles only, and `nx build` uses
      `tsconfig.lib.json`, which excludes `*.stories.tsx`. Found 2026-08-26 after a story
      passed `totalPages` to `AtlPagination` (the prop is `pageCount`) — it fell into
      `...rest`, spread onto `<nav>`, and rendered a 1-page pagination while the Vue
      showcase rendered 10. `cd libs/react && npx tsc -p tsconfig.spec.json --noEmit`
      currently reports 7 errors, so the gate cannot just be switched on:
        · 5 × `toHaveBeenCalledOnce does not exist on JestMatchers` — `@types/jest`
          (needed by the two jest-based CLI libs) shadows Vitest's matcher types in the
          vitest libs. Fix by scoping `types` in each `tsconfig.spec.json`.
        · `atl-stepper.stories.tsx:88` and `atl-toast.spec.tsx:78` — local helpers whose
          prop type narrows to a single literal from its default (`"horizontal"`,
          `"bottom-right"`). Story/spec typing slips, not product bugs; the specs allow
          both members.
      Then add a `typecheck` target per lib and wire it into CI.
- [ ] **Three a11y-pattern divergences surfaced by the new role cross-check** (2026-08-26).
      Each is a decision about which side is right, not a typo — all three are recorded in
      `METADATA_ROLE_EXCEPTIONS` as `kind: 'gap'`, so `check:metadata` warns on every run
      until they are resolved. Resolve, then delete the exception (the gate errors if an
      exempt component starts matching).
      · **AtlStepper** — metadata says `progressbar`; all three adapters render
        `tablist`/`tab`(+`tabpanel`, and Vue is missing `tabpanel` while React/Angular have
        it); the Figma master description claims a third pattern (`ol` with
        `aria-current="step"`). Three sources, three answers. Pick one and write the ADR —
        a stepper is arguably neither a progressbar nor a tab set. Note the Vue/React
        `tabpanel` asymmetry is a cross-framework divergence the a11y gate did not catch,
        which is more evidence for the deepen-scenarios item.
      · **AtlChat** — metadata says `log`; no adapter renders it (`dialog`, `listitem`,
        `status` only) and the `listitem`s have no list container, so they are orphaned.
        Either add the `log`/`list` container in code (fixes both) or drop the claim.
      · **AtlSkeleton** — metadata says `status`; the component renders `aria-hidden="true"`
        and both baseline scenarios are empty. Either the claim is wrong (→ `none`) or a
        loading skeleton should actually be announced. Decide which.
- [x] **Reopened: a token-discipline gate for Claude Design artboards** (answered
      2026-08-27, ADR-0072) — answered by measurement rather than by a second opinion. The
      proposal was to gate raw hex in participant `.dc.html`; measuring `_sheet.css` showed
      the premise was upside down. An artboard renders standalone, so it MUST carry
      literals — the file's own header says so — and the defect was never that literals
      exist but that the copy was maintained by hand and had drifted in 7 of 40 values. So
      the remedy is `check:tokens`' remedy for the three framework copies: generate the
      copy. `check:artboard-palette` is that gate. What ADR-0032 alternative 4 asked for —
      a `--ui-*` `:root` starter block generated from tokens.css — is now exactly what
      exists, so the alternative is satisfied rather than rejected.
- [ ] **Participant artboards are still ungated.** `check:artboard-palette` covers the
      SHARED sheet. A participant's own `.dc.html` can still hardcode a colour beside the
      palette it links, and nothing reads those 31 files. The three adherence regexes the
      synced file already carries (raw hex → token, raw px → spacing token, `font-family`
      outside the DS list) are the rule set; the blocker is reach, not rules — a gate needs
      the artboards in the repo or an authenticated client. Katas 2 and 5 want this.
      **2026-08-29:** still open as engineering, but no longer silent — the asymmetry is now
      published as content (`/claude-design`, "What it demonstrably does not do") and
      demonstrated live in Tag 1 Block 04. Teaching the gap is not closing it.
- [ ] **Verify Figma *export* from claude.ai/design** — import via Figma links is
      confirmed first-party (`hifi-design` skill); export is still unverified, and
      ADR-0032's "the canvas dead-ends" tradeoff rests partly on it. **2026-08-29:** still
      unverified; `/claude-design` now names the direction explicitly in its limits list
      ("importing Figma links into the canvas is confirmed; exporting out of it is not")
      so the page cannot be misread as endorsing the forbidden canvas → Figma → code chain.
- [x] ~~The persisted `parityScore` is not comparable across runs~~ (resolved 2026-08-26,
      ADR-0024 amendment): the score is no longer stored. `--score` is still accepted and
      echoed, `ATELIER_PARITY_MIN` and the SCORE critical are gone, and 27 records were
      migrated. The gate now asserts only "verified after the files last changed". If a
      mechanically derived `codeSpec` ever lands, revisit — that is the version that would
      have worked.
- [ ] **AtlStepper: Figma pads 16, the code root pads 0** — still a decision, and now the
      only thing standing in the way is the decision itself: ADR-0077 removed the
      "eleven masters cannot be reached" category, so `.stepper-header`, `.step-circle`,
      `.step-text` and `.step-connector` all resolve and are compared. What no gate covers
      is the master's own ROOT padding, because AtlStepper is outside `ROOT_PAINT` — the
      remaining part of the old note:
      `[ROOT-BOX]` has the "master pads where the CSS states nothing" warning this needs, but
      AtlStepper is one of the eleven masters deliberately outside the `ROOT_PAINT` table
      (its paint sits on an inner box, not the root), so the table never reaches it. The
      per-layer map those eleven want is the same open item as `[LAYER-PAINT]`'s. The default variant
      (`421:407`) declares `padding: 16` and `gap: 16`; `.atl-stepper` has neither. Decide
      whether that padding is component chrome (code is missing it) or artboard breathing
      room (Figma should drop it). Not fixed on 2026-08-26 because changing a component's
      padding is a design decision, not a gate-satisfying edit.
- [ ] **AtlStepper Figma master has no focus and no disabled variant**, and its description
      carries no a11y annotations — 5 of the 7 remaining parity findings. Pairs with the
      role question above (metadata says `progressbar`, code renders `tablist`).
- [ ] **Harden Atelier's own design system; Conciso as theme demo** — plan in
      `tasks/atelier-design-system-plan.md` (2026-08-26). Reframed away from a Conciso
      rebrand after finding that ADR-0020 already settled it: the palette is
      "Direction A: Conciso anchor only" and brand DNA is typography + motion, not
      colour. Port six brand-neutral patterns from Conciso (tonal ramps with anchor +
      text-safe shade, annotated contrast, role-based type scale, tonal overlays, the
      `[data-area]` scope mechanism, `_adherence.oxlintrc.json`); Conciso becomes a
      `[data-brand="conciso"]` theme demo, which proves the token thesis instead of just
      swapping values. Work project: Claude Design *Atelier*
      (`7a6a2f19-9a3c-4dd9-9828-65c7cc67766c`); both DS projects are read-only. The plan
      is additive, so the 29 parity records stay valid until component CSS migrates onto
      role tokens — at which point the ADR-0024 change (Phase 0) becomes blocking.
- [ ] **`/design-sync`'s manifest is unreliable — verified** (2026-08-26, *corrected
      2026-08-29*). The synced Atelier design system's `_adherence.oxlintrc.json` lists
      `--ui-font-size-3xl`, `-4xl`, `-5xl` — **`-4xl` and `-5xl` exist nowhere in the repo;
      `-3xl` does exist**, added by ADR-0036 for the display role on the same date this item
      was written. The item was stale within hours of being recorded, which is the joke on
      itself: a hand-typed claim about a generated thing rots, including this one. It is
      also why the `/claude-design` chapter tells the reader to grep the tree rather than
      trust the manifest *or* their memory of it. Two phantoms, not three; the rest stands.
      It types `--ui-transition-*` as
      `"color"`; mixes 20 `--docs-*` private docs-theme tokens into what reads as the
      library's public token API; and ships `react/forbid-elements` with an empty forbid
      list. Two consequences: never treat the manifest as an input (derive from
      `tokens.css`), and use this list as the "review the tool's output" worked example —
      that lands far better with concrete errors than as advice. **2026-08-29:** the list
      shipped in that role on `/claude-design`, as prose rather than as the blocked
      `/design-sync` kata. The item stays open because the manifest itself is still wrong
      and still cannot be re-checked from this repo — it lives in the external project.
- [ ] **Reuse the adherence regexes for ADR-0032 alternative 4.** The synced file already
      carries the three rules an artboard/token gate wants: raw hex → use a token via
      `var()`, raw `\d+px` → use a spacing token, `font-family` outside the DS list. Lift
      them rather than authoring new ones.
- [x] **Decide the Inter question** (closed 2026-08-27, ADR-0059) — stale as written:
      `--ui-font-family` has been Instrument Sans since ADR-0035, and the role-based
      scale it wanted coupled is `--ui-type-*`. What was still open was the *other*
      side: the Figma file was still drawn in Inter (Components/Inventory/Icons) and
      Montserrat + Libre Baskerville (foundations pages + all 19 `ty/*` styles). All
      1621 text nodes swept onto the declared families, the 19 styles replaced by 8
      `ty/<role>` styles generated from `--ui-type-*`, and `[FONT-FAMILY]` +
      `[TEXT-STYLE]` added to `check:figma` so it cannot drift back.
- [ ] **`ComponentMetadata` has no field saying which spec a `variantMatrix` describes.**
      Reframed 2026-08-27 (ADR-0066) — the premise of the original note was wrong. Sharing
      a module between a parent and its children is DELIBERATE: `select.metadata.ts`
      declares `specNames: ['AtlSelectSpec', 'AtlOptionSpec']`, and `DOCS_PRIMARY_SPECS`
      records that one docs entry documents one primary interface. Nine modules cover
      several specs that way, and `radio` even lists the item before the group, so
      "specNames[0] is the primary" is not a rule the data supports either. The residue is
      one allowlist entry (`AtlOption:variant:state=filled`) plus a latent risk that a
      future child inherits a matrix that is not about it. The fix is a field on the type
      (`variantMatrixFor`, or per-spec sections), which reaches `check-metadata` and
      `gen-llms-txt` — worth doing when a second collision appears, not for one entry.
- [x] **Generate the Inventory cards** (closed 2026-08-27, ADR-0070) —
      `npm run figma:sync-inventory` rewrites every card's name, preview instance, meta
      line and property rows from the master. First run: 37 of 43 updated, including
      AtlBreadcrumbs' `COMPONENT_SET · 209×17px` → `COMPONENT · 323×26px`. The blurb and
      the status chip stay hand-written on purpose. Idempotency verified by recomputing
      all 43 cards' expected facts: 0 would change. Not a gate — comparing card to master
      in `check:all` would need the card facts in the snapshot, and a card is
      documentation rather than the transfer target. **Correction (2026-08-28, ADR-0074):
      the idempotency claim above was wrong.** It rested on re-deriving the card data
      because the actual second run had stalled — and re-derivation checked the *data*,
      which was right, while the bug was in the *test*: a preview set to
      `layoutSizingHorizontal = 'FILL'` can never again match its master's width, so the
      staleness check was permanently true and every run rewrote the same 15 cards. Fixed;
      two consecutive runs now report 0 updated.
- [ ] **The breadcrumb separator is a glyph in CSS `content`.**
      `.atl-breadcrumb-item::after { content: var(--atl-separator, '›') }` — a pictogram
      as a character, which ADR-0050's rule sends to the icon set, but a CSS
      pseudo-element cannot hold an icon component. Deciding it means either rendering a
      `chevron-right` AtlIcon in all three templates (a spec-touching change) or stating
      the pseudo-element as the one place a glyph is allowed. The master matches the code
      today, with the exemption written in its description.
- [x] **The table's child masters** (closed 2026-08-27, ADR-0065) — four, not three:
      `AtlTdSpec` exists too. AtlTable gave up `sortable`, `selectable` and `empty`, and the
      three allowlist entries are deleted rather than merely satisfied. Each child is
      complete on one axis instead of a 3x3 matrix, and the parts are COMPOSED: AtlTr's
      cells are AtlTd instances, AtlTbody's rows are AtlTr instances — possible here
      because a cell carries only text, so no content slot is needed.
- [ ] **`.atl-tr-select-cell` is 44px wide with 32px of inherited padding.** It declares
      `width: 2.75rem` and `text-align: center` and inherits `padding-inline:
      var(--ui-spacing-4)` as a `<td>`, leaving a 12px content box for an 18px checkbox.
      The master draws what the CSS computes, so the squeeze is now visible in Figma
      (ADR-0065). Either the cell resets its padding or it gets wider — a code change in
      three frameworks, so it wants its own step.
- [x] **AtlTabGroup's `disabled` belongs on AtlTab** (closed 2026-08-27, ADR-0062) —
      AtlTab now exists as a master and carries it.
- [x] **`[LAYER-PAINT]`: the inner layers** (closed 2026-08-27, ADR-0063) — built as a
      CONVENTION rather than a table: a layer named for a CSS class draws that rule, so
      the layer name is the selector. Found and fixed 33 divergences over AtlMenu,
      AtlTabGroup, AtlAccordionGroup, AtlPagination and AtlChat, plus six bugs in the
      gates themselves.
- [x] **Root typography is gated** (closed 2026-08-27, ADR-0064 amendment) — three
      `ROOT_PAINT` cascades gained a `size` entry, because `.atl-button.size-*`,
      `.atl-avatar.size-*` and `.atl-badge.size-*` are the only axis-scoped root rules that
      declare `font-size`. The resolver now reads `font-size` and `line-height` from the
      concatenated cascade. It found seven masters leaving the root's leading on **AUTO**
      while their CSS states one — AtlInput/AtlSelect 125%, AtlTextarea/AtlTooltip/AtlAlert
      150%, AtlBadge/AtlAvatar 125% — which is ADR-0048's rule unapplied on the Figma side.
      43 text nodes now state their percentage. Still outside it: a root whose text is
      inherited rather than its own single child.
- [x] **The glyphs outside the masters** (closed 2026-08-27, ADR-0069) — `[PAGE-GLYPH]`
      now reads every text node on the Components page that no COMPONENT, COMPONENT_SET or
      INSTANCE owns. Five became icon instances (`✓ ℹ ✕ ▾`), including `"Actions ▾"` —
      a label with an EMBEDDED pictogram, the same shape that hid `‹ Prev`. The one
      remaining is punctuation in prose (`image→initials→icon` in a caption), allowlisted
      as `page:glyph:→`.
- [ ] **A glyph typed as an instance OVERRIDE is unseen.** ADR-0068 made the probe skip
      text inside instances, because a glyph there belongs to the child master which states
      its own exemption — and that is right for the master's own drawing, but an override
      is not the master's drawing. Compare an instance's text against its main component's
      instead of skipping wholesale.
- [ ] **464 text nodes below 12px, and the split decides the answer.** Re-counted
      2026-08-28 (was 536; Inventory dropped 378 → 306 when the cards were regenerated).
      306 on Inventory
      (card meta at 11px), 156 on Colors (swatch labels 11px, hex 9px), 2 in Components —
      and those 2 were the AtlAvatar bug above. So this is catalogue scaffolding, not
      component text. `--ui-font-size-2xs` (10px) exists since ADR-0054: decide whether the
      documentation pages adopt the scale or stay off it by intent, and write the decision
      down either way.
- [ ] **An axis is owed for `AtlAvatarStatus` and `AtlChatStatus`.** Both unions are
      illustrated as sibling frames on the Components page rather than as a variant axis.
      The note lived only in an allowlist entry, which `[STALE-EXEMPTION]` then showed was
      suppressing nothing — because `[NAME]` derives an axis only from a union ending in
      Variant | Size | Shape | Position | Orientation | Align | Role (ADR-0062 narrowed
      it), so a union ending in `Status` is never asked about at all. Two consequences
      worth separating: the design follow-up (draw the axes), and the gate question
      (should the axis-word list include `Status`, or is a status a value union rather
      than an axis?). `AtlChatMessageRole` is settled — AtlChatMessage carries a `role`
      axis since ADR-0062.
- [ ] **Compose parents from their child masters.** AtlMenu's separators are instances of
      AtlMenuSeparator now; its items, the tabs, the steps, the accordion items and the
      chat bubbles could be instances too. Where a parent instantiates its child, the
      geometry cannot drift at all — `[LAYER-PAINT]` makes drift detectable, composition
      makes it impossible. The blocker: an instance cannot gain children, so a part that
      takes free content (a menu item's icon plus label) needs the master to expose a
      slot first. Decide slot-per-part, then convert.
- [ ] **AtlProgress had the convention right before there was one.** Its layers were
      already named `track` and `fill` while AtlMenu had fourteen called `Frame`. Worth a
      look at who drew it and whether other conventions in this file were arrived at once
      and never generalised.
- [ ] **`color-mix()` cannot be a Figma Variable.** Four components paint with it —
      AtlAvatar's root, AtlBadge's variant borders, AtlToast's variant fills,
      AtlAlert's variant borders — so those paints are unverifiable by construction and
      `[ROOT-PAINT]` skips them. Decide: add resolved semantic tokens for the mixes
      (then Figma can bind them and the gate can check them), or accept them as
      code-only and record the exemption per node.
- [ ] **"Effects Tokens" holds eleven STRING variables that cannot paint.** `e/0…e/5`
      and `tonal/1…5` are CSS shadow strings from an older docs pass. Now that
      `shadow/xs…xl` exist as generated effect styles (ADR-0060) they are also
      duplicates. Check what references them, then remove the collection.
- [x] ~~**Nothing gates a COMPONENT_SET against its own variants**~~ — closed 2026-08-28,
      ADR-0075. `[SET-CLIPS]` blocks when a set's frame is smaller than its variants' extent
      (1px tolerance for Figma's fractional sizes). "Two lines against the snapshot" was
      wrong: the snapshot carried no dimensions at all, so the probe had to capture a `box`
      per master first. It caught a live regression immediately — binding text styles
      (ADR-0074) had grown AtlCard and AtlDialog by 2px and both sets clipped again, with
      `clipsContent: true`, the same day. 37 sets checked, 0 clipped.
- [ ] **`[MASTER-GLYPH]` walks masters, so a content sample is invisible to it.** The
      four ADR-0056 content samples still carried `‹ Prev` / `Next ›` as text months
      after the same glyphs left the master. Widen the probe to every frame on the
      Components page, not only COMPONENT/COMPONENT_SET nodes.
- [ ] **Nothing detects an orphaned main component.** No live defect as of 2026-08-28 —
      68 main components resolved from the instance side, all reachable from the document —
      so this is gate work against a class, not a repair. Figma keeps a removed
      `COMPONENT` alive while an instance still references it, and `findAll` cannot
      reach it — so it is invisible to every tree walk, including the snapshot probe.
      Two Inventory tiles (AtlPagination, AtlBreadcrumbs) had drawn *pre-fix* geometry
      for months that way (ADR-0059); a text sweep found them only by failing on nine
      nodes it could not change. The check must run from the instance side: walk
      instances, resolve `getMainComponentAsync()`, assert the result is reachable from
      the document. Capture it in the snapshot probe and gate it.
- [ ] **Two variable collections carry the same ten spacing values.** `Primitive
      Tokens` has `spacing/s1…s16`, `Library Tokens` has `spacing/1…16` — identical
      values (4, 8, 12, 16, 20, 24, 32, 40, 48, 64), and only the latter is generated
      from `tokens.css`. A designer picking from the wrong family binds to a collection
      the CSS does not feed. Decide whether `Primitive Tokens` (76 variables — radii and
      sizes too) is still needed; check what binds to it before removing anything.
- [x] **The off-scale pass covered type, not weight or spacing** (closed 2026-08-27,
      ADR-0071) — `font-weight` was simply missing from `check:token-bypass`'s family map,
      and adding it found 6 literals × 3 frameworks, all bound now. The spacing census
      found 9 distinct off-scale values, and reading each one settled what it was rather
      than assuming: two are the canonical `sr-only` recipe's paired `-1px`, three are a
      composed dimension (`2.25rem`), two were genuinely off-scale on a control and are
      now bound, one was a magic number hiding a derivation, and two remain recorded
      below.
- [ ] **`2.25rem` appears six times for two different reasons.** Re-counted 2026-08-28
      (the item said three; AtlPagination writes it four times — `min-width` and `height`
      on two selectors). It is the invalid
      field's `padding-right` in AtlInput and AtlTextarea (room for the icon) and the page
      button's `min-width`/`height` in AtlPagination. Neither is on the spacing scale, and
      `check:token-bypass` permits a one-off dimension by design — but three uses is the
      rule-of-three signal, and the two reasons want different names. Decide: a token for
      the field's icon gutter, a token for the compact control size, or leave both as
      dimensions and say so.
- [ ] **`margin-top: 2px` on `.step-description` and `.step-optional`.** Off-scale
      micro-spacing, two uses, half of `--ui-spacing-1`. Either the scale gains a `0.5`
      step (which invites 2px everywhere) or these become 4px (which changes the design).
      The Figma master draws 2 and carries an allowlist entry for it (ADR-0062), so the
      two sides agree — on a value neither can name.
- [x] **`_sheet.css`'s palette is generated now** (closed 2026-08-27, ADR-0072) — it had
      drifted in 7 of 40 values, including `--success`, `--warning` and `--info`, the three
      status colours the ramps changed, so all 31 artboards were painting the pre-ramp
      palette. `gen-artboard-palette.mjs` derives the block from tokens.css,
      `check:artboard-palette` fails if the committed copy drifts, and the corrected block
      is pushed into Claude Design. The last hop is still manual, because the Claude Design
      MCP is interactively authenticated and a spawned script cannot reach it.
- [ ] **The parity gate cannot see the shared token layer.** A component's `inputsHash`
      covers `libs/{angular,react,vue}/src/lib/<module>/` only, so `styles/tokens.css` is
      outside it — ADR-0035 changed the UI typeface for all 29 components and triggered no
      DRIFT blocker. Convenient there, wrong in general. Either fold the token source into
      every component's inputs (every token edit then re-verifies all 29) or add a separate
      token-layer verification record. Needs a decision, not a quick patch.
- [x] ~~**509 text nodes use none of the eight `ty/*` text styles**~~ — 231 bound
      2026-08-27, ADR-0074, and the classification split the rest into two different
      problems (below). Two roles were missing and are now added: `--ui-type-control`
      (medium/sm/tight — 6 CSS rules, 75 nodes) and `--ui-type-action` (semibold/md/tight
      — 3 CSS rules, 15 nodes). 40 of 43 masters unchanged in size, 3 grew 1–2px.

- [ ] **311 Figma TEXT nodes across 33 masters carry no `ty/*` role, and not one of them
      is bindable today without a rendered change.** The "201" recorded here on 2026-08-27
      was wrong on both the number and the framing. A read-only census of all 43 masters
      (2026-08-28, `tools/figma/text-nodes.json`, and `tasks/type-role-resolution-2026-08-28.md`)
      counts **566** TEXT nodes, **311** unbound, over **33** masters — not 201 over 23. And
      the framing was inverted: the blocker is not that a body role would *create* a leading
      divergence, it is that **206 of the 311 sit on `lineHeight: AUTO`**, the font's own
      metric, which is not 125% or 150% and matches no role at all. Zero nodes match a
      `ty/*` style exactly today, so *every* binding moves at least the leading. Worse,
      **212 of them source `fontSize` from the wrong variable collection** (below), so the
      size corrections most of them need are not plain edits. What is now true and was not:
      all three counts are gated. `[TEXT-UNSTYLED]` records 257 (after the structural
      exemptions), `[FIGMA-AUTO-LEADING]` 206 and `[FIGMA-VARIABLE-COLLECTION]` 212, each
      per master, each blocking in both directions (ADR-0079, ADR-0080). The per-master
      layer→selector pass this item asks for is still the work; the ratchet is what stops it
      growing meanwhile.

- [ ] **Two roles the ten do not span: `ty/row` and `ty/row-sm`.** Instrument Sans Regular
      16 / 1.25 has **10 CSS sites** (7 excluding the ADR-0073 value-text carve-out) and 27
      Figma nodes already faithful to it; Regular 14 / 1.25 has 5 CSS sites and 16 faithful
      nodes. Both clear the rule of three on both sides several times over, and together
      they account for ~119 of the off-scale population — including the whole
      `.atl-table.size-{sm,md,lg} tbody td` ladder, which currently has one rung bound to
      `ty/label` at the wrong weight, one rung undecided and one left raw. Mint
      `--ui-type-row` / `--ui-type-row-sm` and the matching Figma styles, then bind. Blocked
      behind the collection decision for the 37 nodes that also need 14 → 16.
      §5A/§5B of `tasks/type-role-resolution-2026-08-28.md` carries the tally.

- [ ] **ADR needed: 212 TEXT nodes bind `fontSize` to `Docs Brand Tokens`.** The docs-site
      collection, not the library tiers ADR-0030 made semantic. The two scales agree today,
      so nothing renders wrong and nothing will until they diverge — but it is the root
      debt: **every** "correct this master 14 → 16" recommendation in the analysis is
      unexecutable as a plain edit, because the value is not the master's to set. It also
      blocks the promotion of `[ROOT-TYPE]`, `[TEXT-UNSTYLED]` and `[FIGMA-AUTO-LEADING]`
      from ratchets to plain blockers. Unresolved and undeterminable without mutating the
      document: whether applying a text style clears an existing `fontSize` binding or the
      binding wins.

- [ ] **Seven masters the six mapping groups never covered — 54 unbound nodes.**
      `Action/AtlButton` (20; its `size=md` and `size=lg` labels are Medium where
      `.atl-button` is SemiBold at every size, which is what blocks the hand-drawn-button
      fix below), `AtlStep` (12), `AtlTr` (8), `AtlBreadcrumbs` (7), `AtlAvatar` (6),
      `AtlCodeBlock` (4), `AtlTh` (3), `AtlChatSuggestion` (1). The analysis covered 26 of
      43 masters and says so; these are the remainder, and AtlButton is the one that
      matters, because C9's instance swap targets a master nobody audited.

- [ ] **77 Figma text nodes are in combinations no role expresses.** Medium 16 (18),
      Regular 12 (18), SemiBold 14 (13), Medium 18 (6), JetBrains Mono Bold 12 (4), Italic
      12 (4), Regular 13 (4), Bold 10 (2), SemiBold 15 (2), SemiBold 12 (2), and one each
      of SemiBold 13/20/26 and Italic 14. Five sizes (10, 13, 15, 20, 26px) are off the
      type scale entirely. Each needs a decision: snap to a role, or earn a role by
      appearing three times on both sides — `SemiBold 20` and `Regular 12` were both
      checked and both failed that test (ADR-0074).

- [ ] **The dialog and drawer headers are SemiBold 20px, off the type scale.** Two CSS
      rules, 2px from `--ui-type-title` (semibold `lg` = 18). The Figma masters draw 18
      and are now bound to `ty/title`, so the CSS is the side that diverges. Decide: move
      both to the role, or justify 20.

- [ ] **AtlCard and AtlDialog draw their buttons by hand at Medium 14 instead of
      instantiating AtlButton.** `.atl-button` is semibold `md`; the masters' "Save",
      "Cancel" and "Confirm" are medium `sm`. Same class as ADR-0068 — a parent can only
      instantiate what the child can express — and now visible because those nodes bound to
      `ty/control` rather than `ty/action`.

- [x] ~~**A component root may state a family and a leading but no font-size**~~ — gated
      2026-08-28, ADR-0078 + ADR-0080. `[NO-SIZE]` is in `check:typeface`, keyed off the
      prose leading (`--ui-line-height-normal` means *this one carries prose*), and it was
      not one root but **15** — accordion, card, chat, dialog and drawer, three each, one
      per framework. `font-size: inherit` does not satisfy it. Recorded as roots and not as
      a count in `tools/parity/typeface-baseline.json`, so a new one hidden by a fixed one
      still blocks. **The defect itself is not fixed:** stating the size means deciding what
      it is, which redraws five masters and waits on the collection decision above.

- [x] ~~**Add `[TEXT-UNSTYLED]` so unbound text cannot come back**~~ — landed 2026-08-28,
      ADR-0079 + ADR-0080, as a ratchet rather than the warning this item imagined (ADR-0066
      forbids a warning nobody can clear). 257 nodes over 29 masters, after two *structural*
      exemptions — a node under an INSTANCE, whose master owns the type, and an invisible
      node — plus a short pending-removal list of scenery and glyphs. The snapshot did not
      in fact "already carry per-node facts": family, weight, the text-style binding and the
      size variable's collection were captured nowhere and had to be added
      (`tools/figma/text-nodes.json`). Promote to a plain blocker when the entry reaches
      zero; that waits on the collection decision and on `ty/row`.

- [x] ~~**Root padding diverges on at least two masters, and no gate compares it**~~ —
      closed 2026-08-28, ADR-0076. `[ROOT-BOX]` compares the root's padding and gap, and it
      was **thirteen** masters, not two. Seven were bindable and are corrected in Figma by
      binding the variable (56 variants): AtlInput, AtlTextarea, AtlSelect, AtlMenu
      compact, AtlTooltip, AtlToast, AtlAlert, plus AtlButton's item spacing. Six are
      **derived** values ADR-0041 computes, which no spacing token holds and no Figma
      Variable can express — they warn rather than block, and the question they ask is
      below. `[SET-CLIPS]` then caught the fix's own fallout: the wider padding pushed
      AtlAlert and AtlToast 8px past their sets, both clipping.

- [ ] **`[LAYER-PAINT]` skips every variant whose `state` axis is not `default`, and those
      are the states most likely to diverge.** Found the hard way on 2026-08-28 (ADR-0077):
      setting AtlToggle's hover and focus tracks to `color/border-strong` was wrong — both
      CSS state rules say `border-color: primary` — and nothing would have reported it,
      because the gate treats a non-default `state` as pseudo-class paint it cannot
      resolve. It can now: the state-class cascade added for `selection`/`expanded`/etc.
      generalises to `state=hover` → `:hover`-scoped rules, which is a different shape
      (pseudo-class, not class) but the same resolution problem. Worth doing: 12 of
      AtlButton's 24 variants and 4 of 5 for each form field are in this blind spot, which
      the `[ROOT-PAINT]` warnings already count every run.

- [ ] **AtlDrawer's master paints the dialog twice.** The variant root carries
      `color/surface` + a drop shadow *and* so does the `dialog` layer inside it (ADR-0077,
      where the layer was renamed from `panel`). `ROOT_PAINT` maps the root to
      `.atl-drawer-host dialog`, so both pass against the same rule — but the root is the
      overlay area holding the backdrop rectangle, and painting it surface is wrong for what
      it represents. Decide whether the root should paint the backdrop, nothing, or stay.

- [ ] **`.atl-drawer-host dialog` states nothing typographic.** `all: unset` wipes the
      inherited size and leading and the rule puts neither back, so AtlDrawer is the one
      master whose root type `[ROOT-TYPE]` resolves to nothing for a reason that is a
      defect rather than delegation (ADR-0079). The other six unresolved fallbacks —
      AtlStep, AtlBreadcrumbItem, AtlAccordionItem, AtlChatSuggestion, AtlChatTyping,
      AtlAvatarGroup — legitimately inherit from the parent master that places them, which
      is why the gate stays silent about all seven rather than warning six-sevenths
      unclearably (ADR-0066). Fix is one declaration in `drawer/atl-drawer.css`; deciding
      *which* size waits on the same question everything else in this cluster waits on.

- [ ] **AtlCombobox's fifteen unstyled TEXT nodes are a layer problem, not a root one.**
      `[ROOT-TYPE]` cannot reach them: the master has no single direct TEXT child, so the
      snapshot records no root type at all. `[LAYER-PAINT]` cannot either — every captured
      layer sits in a `state != default` variant and is skipped wholesale, the one
      default-state layer (`input`) dies on `.atl-combobox-input`'s `font-size: inherit`
      at layer level, and three option layers resolve to no rule because their names
      contain spaces. Fixing it needs the layer cascade to carry the component root for
      type only, plus a decision about the state skip — both with a blast radius across
      all 43 masters, so a separate change (ADR-0079).

- [ ] **Five CSS defects found in passing while resolving the type roles** (2026-08-28,
      `tasks/type-role-resolution-2026-08-28.md` §4). Each is independent of typography.
      **Two are now closed and gated** by `check:dead-selectors` (ADR-0081); the other three
      are declaration-level defects that gate reads nothing about, and stay open:
      - `.atl-tbody-empty-cell`'s `font-size` is **dead**. Specificity (0,1,0) against
        `.atl-table.size-md tbody td` at (0,2,2), so the empty message renders 14px and
        never the 16px written. The same rule's `padding` and `background-color` already
        carry `!important` for exactly this reason; `font-size` was missed. Identical in
        Angular and Vue — a shared defect, not drift.
      - ~~**Angular's combobox readonly rule is dead.**~~ **Closed 2026-08-28** (ADR-0081).
        `atl-combobox.css:206` targeted `.atl-combobox-input` while the template emits
        `class="combobox-input"` — one selector missed in a rename. The selector is
        corrected and `check:dead-selectors` reports it by name if the rename ever
        half-lands again. The ADR-0045 readonly contract now holds in all three frameworks.
        **Correction, 2026-08-28:** an earlier version of this entry said
        `atl-combobox.spec.ts` pins the corrected selector. It does not — the string
        `combobox-input` appears nowhere in that file. The spec asserts `is-readonly` on the
        host, `input.readOnly`, and that the listbox stays closed, which is exactly the
        shape of test that stayed green while the rule was dead. The gate is what pins it.
      - **`.atl-tooltip` contradicts itself.** `max-width: 20rem` + `word-wrap: break-word`
        **and** `white-space: nowrap`. React and Vue have the nowrap, Angular does not — so
        the same tooltip wraps in one framework and cannot in the other two. Fix the
        divergence before deciding the tooltip's type.
      - **Five chat controls render in the UA font.** `.action-btn`, `.fab-bubble`,
        `.close-btn`, `.chip` and `.field` are `<button>`/`<textarea>` elements stating no
        `font-family`, so the UA shorthand wins. Every other component in the repo that
        puts text in a form control writes `font: inherit` explicitly; `atl-chat.css` omits
        it, and the chat root's own comment says it exists to prevent this (ADR-0035/0049).
      - **`.radio-text` is styled nowhere**, and Angular does not emit it at all.
        **Examined 2026-08-28 and deliberately not changed** (ADR-0081 §4): it is the
        *reverse* direction, which the new gate does not check. Making Angular emit it means
        wrapping `<ng-content/>` in a span — new markup in a published package, and a
        re-verify against Figma — for a class no stylesheet selects. It belongs to the
        "is a class with no rule a public hook or a leftover" decision below, not to a sweep;
        the risk it names (a future rule silently skipping Angular) is real and unchanged.

- [ ] **AtlChat ships an illustrative app mockup inside the master.** Sixteen TEXT nodes —
      a nav rail, a breadcrumb, a page heading, two sidebar lists, a minimise glyph — are
      scenery, not contract, and are excused from `[TEXT-UNSTYLED]` by name in
      `check-figma.js`'s `TEXT_UNSTYLED_PENDING` rather than by any structural rule. The
      entries are marked pending-removal, not exempt: when the mockup goes, so do they.

- [ ] **Six masters pad on an axis the CSS derives, and it is one question, not six.**
      AtlButton, AtlInput, AtlTextarea, AtlSelect, AtlBadge and AtlTab. ADR-0041's recipe
      gives 6.25 / 9 / 11.25px — no spacing token holds those and no Figma Variable can
      express the arithmetic, so a master can only carry a resolved number that drifts by
      construction. Three of them (Textarea, Select, Tab) pad **zero** and let a positioned
      text node do the work, which is a different construction rather than a wrong number.
      Decide once: keep the resolved numbers in step by hand, or have the masters state
      only their height and stop padding. Same shape as the row ladder's missing Figma
      Variables (ADR-0052), and `[ROOT-BOX]` warns until it is settled.

- [ ] **A parity record is blind to a change on the Figma side.** It stores `figmaNodeId`,
      `verifiedSha` and an `inputsHash` over the component's files — nothing about the
      state of the master. Eight masters changed on 2026-08-28 and no stamp noticed. By
      ADR-0064's definition ("verified after the files last changed") the stamps stay
      valid, and those changes moved Figma toward the code, so this is not urgent. It is
      the exact mirror of the `inputsHash`-cannot-see-the-token-layer item below, and the
      two want deciding together: either a stamp covers both sides or it says which one it
      covers.

- [x] ~~**AtlTextarea's text is 14px where the CSS says 16px**~~ — fixed 2026-08-27,
      ADR-0074: the five nodes are bound to `ty/body-md` (16px/150%). Found again from the
      other side, because binding by appearance had first cemented 14px as `ty/body-sm`.
      The gate blindness behind it is still open:
- [ ] **`[ROOT-PAINT]` cannot see a cascade that ends at `inherit`.** That cascade is `.atl-textarea textarea`, whose `font-size: inherit` resolves to
      null, so the comparison never happens — the value the field actually renders comes from
      the root, which the cascade does not include. Fix the gate by walking up to the
      component root when a cascade leaf says `inherit`; fix the data as part of the 509.
      Do the data first: making the gate see it turns `check:figma` red until Figma is
      corrected and the snapshot re-run.

- [x] ~~**`check:css-tokens` misses consumed-but-undeclared tokens**~~ — closed
      2026-08-28, ADR-0075. Pass C reports `[UNDECLARED]` for every `--ui-*` a component
      stylesheet reads that no token source declares. It found a live second instance the
      day it was written: AtlTooltip read `var(--ui-z-tooltip, 200)` in React and Vue, a
      token that has never existed, so the tooltip's stacking level was the literal 200
      while every other floating layer used `--ui-z-dropdown`. Now 99 referenced tokens,
      all declared; fail-tested in both directions.
- [ ] **Re-sync the Atelier design system in Claude Design.** Its `_ds_manifest.json` and
      guide still say Inter and Fira Code, plus the phantom tokens. **Corrected 2026-08-29:**
      only `--ui-font-size-4xl` and `-5xl` are phantoms — `--ui-font-size-3xl` (ADR-0036) and
      `--ui-font-mono` are both really declared now, so two of the four named here have since
      become real. Reference-only either way, never input. Still blocked on the same thing as
      everything else on this surface: the MCP is interactively authenticated, so no script
      can do it.
- [x] ~~Role-based type scale~~ — done 2026-08-26, ADR-0036: eight `--ui-type-*` roles as
      `font:` shorthands composed from the existing axes, plus `--ui-font-size-3xl`,
      `--ui-font-weight-bold` and `--ui-letter-spacing-uppercase`. Manifest 114/114. All
      eight verified in a browser against the shipped `tokens.css`, not a fixture.
- [x] ~~**Migrate component CSS onto the type roles**~~ — resolved 2026-08-27, ADR-0073, and
      the census inverted the item. Of 118 rules that touch type, 92 carry one or two of the
      four properties (a local override, where a role would say three things), 25 carry three
      or more, and **4** of those migrate. The other 21: six name a line-height token inside a
      `calc()` (ADR-0041's derived padding), where the leading is an OPERAND and a shorthand
      would hide the number the arithmetic must name; nine control roots fail the same way one
      level up; two (`.atl-avatar`, `.atl-badge`) declare no `font-size` at all because the
      variant owns it, so a role would force `lg` onto every avatar. **A role is for prose,
      not for a box derived from the leading.** The blocker was the gate itself:
      `check:typeface` knew only the longhands, so `font: var(--ui-type-body-sm)` — the role
      applied exactly as ADR-0036 asks — tripped `[NO-LEADING]`.
- [ ] **Consider a gate forbidding `--ui-font-display` outside the role definition.** Now
      cheap to write: `lib/type-roles.js` (ADR-0073) already reads which family each role
      names, and `check:typeface` already resolves a role shorthand, so the gate is one more
      rule in a loop that exists. The
      point of ADR-0036 is that "serif, italic, never bolded" is one token rather than three
      declarations to get right; a component naming the family directly can still break it.
- [x] ~~**25 of 29 components respecify `font-family`, against their own manifest
      constraint**~~ — resolved 2026-08-26, ADR-0049, and the constraint was the thing that was
      wrong. Rendering the two states side by side inside an app whose own font was Georgia
      inverted the finding: the components that *did* respecify were correct and the four that
      inherited rendered Georgia beside them. "Apply it on the app shell" is a constraint a
      component cannot keep. `check:typeface` now requires the declaration on every root, and
      `[NO-LEADING]` (ADR-0052) requires the leading beside it.
- [x] ~~**Ramps for the remaining colour families**~~ — done 2026-08-27, ADR-0054. Four
      ramps, 100–950, red / green / amber / sky. The shipping values already sat on the step
      numbers when ordered by OKLab lightness, so only the gaps were generated; the 950 is the
      dark theme's tinted background; a missing tail step is placed where red — the only family
      shipping an 800, a 900 *and* a 950 — puts it, 24.8% from 800 to 950 rather than the
      midpoint. `check:contrast` re-measures 47 annotated steps now, up from 7. **The neutrals
      are still not an explicit ramp** — surface / border / text form an implicit one and that
      half of this item stands.
- [x] ~~One gate for "do not reference a primitive from component CSS"~~ — done
      2026-08-26, ADR-0039: `check:primitives` scans 2654 token references across 88
      component stylesheets against three primitive patterns. Ramp steps and
      `--ui-font-display` are enforced with zero violations; code-block's
      `--ui-font-mono` is a recorded `gap` until it moves to `--ui-type-code`.
- [x] ~~AtlButton hardcodes `-0.01em`~~ (fixed 2026-08-26) — was: `--ui-letter-spacing-tight` holds the same
      value.** Surfaced by drawing the anatomy (2026-08-26). One-line fix in all three
      `atl-button.css`, but it touches component CSS so it re-stales the parity record —
      bundle it with the next button change rather than alone.
- [ ] **AtlButton: six of nine anatomy values are literals**, not tokens — and `[ROOT-BOX]`
      now names it in every run (ADR-0076), so "right now it is neither" is no longer true:
      it is recorded, as a warning, with the numbers. min-height
      (32/40/48) and padding (6/9/12 block, 14/18/24 inline), of which only `24px` lands on
      the spacing scale. `check:figma`'s token-link coverage can therefore never be complete
      for this component. Either the size steps get tokens or the gap gets recorded as
      intended; right now it is neither.
- [x] ~~**AtlButton `size=lg` measures 49px against a stated 48px min-height**~~ — the item
      said to re-measure before calling it a bug, and re-measuring closed it: `check:geometry`
      reads **48px in all three frameworks**, against the 48px token, with no reset supplied.
      The 49 was the artboard's own arithmetic, not the shipped box — ADR-0041 had already made
      the padding derived, which is what removed the half-pixel the estimate carried.
- [ ] **The AtlButton Figma master has 24 variants for a 4x3x4 matrix (48).** Half the
      state combinations are unpopulated. Confirm against the master before the transfer
      decides what to add — `check:figma`'s variant-matrix completeness passes today, which
      suggests the metadata `variantMatrix` does not claim the full cross-product either.
- [ ] **All design findings from the first two artboards live in
      `tasks/design-findings-2026-08-26.md`** — grouped by decision rather than listed,
      because most are one choice each. Four decisions (the size system's stated-vs-rendered
      heights, the missing `box-sizing` reset, states that exist in only one place, literals
      that cannot be bound in Figma) plus one finding that overrides them:
- [x] **Record the font in the snapshot** (closed 2026-08-27, ADR-0059) — it turned out to be
      urgent immediately rather than after the transfer: the census found all 1621 text nodes on
      Inter, Montserrat or Libre Baskerville while `--ui-font-family` had said Instrument Sans
      since ADR-0035. The snapshot now carries a file-wide family tally with one sample location
      per family, plus every local text style, and `[FONT-FAMILY]` / `[TEXT-STYLE]` compare both
      to `tokens.css`. Recorded per FILE rather than per master, which is the shape the defect
      had; a per-master reading would only matter for a master deliberately off-family.
- [x] **Record Boolean component properties as data** (closed 2026-08-27, ADR-0058) — the
      probe now captures `componentPropertyDefinitions` per master, so the declared set is fact
      rather than prose. Three checks read it: `[BOOL-MISSING]` (spec → master),
      `[BOOL-INERT]` (does it toggle any layer) and `[BOOL-UNSPECED]` (ADR-0061 — is it a field
      of the component's own spec at all), which is the direction that caught AtlTable and
      AtlTabGroup declaring a `loading` no framework renders.
- [ ] **Both component artboards need a correction pass** for the two claims above (the
      "code-only props" labels and AtlButton's "half a matrix" note). Listed at the end of
      `tasks/design-findings-2026-08-26.md`.
- [x] ~~Migrate the remaining controls onto `--ui-control-height-*`~~ — done, and the
      answer turned out to be two ladders rather than one (ADR-0052, 2026-08-27). Select,
      textarea, combobox and the code-block header are controls and take ADR-0041's recipe.
      Checkbox, radio and toggle rows, table cells, menu items, combobox and select options
      and the accordion trigger are **rows**, which state the height, zero the block padding
      and centre — deriving padding around a box that holds a control adds it twice
      (measured: 62.5px against a 48px token). `check:geometry` now measures 73 boxes over
      19 entries in 3 frameworks, and its perturbation is chosen per ladder.
- [ ] **The row ladder has no Figma Variables.** `--ui-row-inset` and the three
      `--ui-row-height-*` are `calc()` over the control scale, which Figma cannot express
      as a derived Variable — they will land as four resolved numbers and the derivation
      will live only in ADR-0052 and `tokens.css`. Decide at transfer time whether that is
      acceptable or whether the row scale should be authored flat.
- [x] ~~**AtlIcon has no Figma master** (J1)~~ — done 2026-08-27, ADR-0057, and the premise was
      wrong. Twenty-one `Icon/*` components existed already, each holding a single Unicode TEXT
      glyph on a 32x19 frame. The set is now 25 vector components generated from
      ATL_ICON_GEOMETRY, one per AtlIconName, verified identical in both directions.
- [ ] **Nothing gates the Figma icon set against `AtlIconName`** (ADR-0057). No live
      divergence as of 2026-08-28 — the Icons page holds 25 `Icon/*` components and
      `check:iconography` counts 25 names, identical sets — so this is gate work against a
      class, not a repair. The comparison was made by hand. `check:figma` reads the snapshot, and the snapshot captures masters from the
      Components page, not the Icons page — so adding an icon to the spec and forgetting Figma is
      invisible. Capture the Icons page in `figma-snapshot.mjs` and cross-check the names.
- [ ] **The superseded glyph documentation frame on the Icons page** is marked, not removed
      (ADR-0057). Rebuild it from the new set or delete it when the masters are rebuilt.
      **Ready to delete as of 2026-08-28**: the condition its own note names ("when the
      Figma masters are rebuilt (Phase 3)") passed when the redesign phase closed, and the
      frame is verified inert — 1200×1328, 107 nodes, **0 components, 0 instances, 0
      external references to anything inside it**. Left standing only because deleting from
      a shared design file is outward-facing and was not part of the approved batch.
- [x] ~~**Phase 3 work order — the eight master findings**~~ — the axis and claim half is done
      2026-08-27 (ADR-0056). AtlTabGroup lost its single-value `state` axis and its `selected`
      axis is `selectedIndex`, the actual prop. AtlRadio's `invalid` Boolean is gone, property
      and prose both — `AtlRadioSpec` extends nothing, so validity lives on the group.
      AtlBreadcrumbs and AtlPagination were COMPONENT_SETs whose only axis pictured content;
      both collapsed to the plain COMPONENT they always were, with the other drawings kept as
      content-sample frames on the Components page. `check:figma` reports **zero**
      `[BOOL-CLAIM]`, `[AXIS-NAME]` and `[AXIS-NOT-A-PROP]` now.
- [x] ~~Twelve of the nineteen unbound Booleans have nothing to bind~~ — each states why, in its
      own master, 2026-08-27. **`required` on all five form fields renders nothing**: it is passed
      to the DOM as the HTML attribute and that is all — no class, no CSS, no asterisk. The
      asterisk comes from the label text a consumer writes. AtlTextarea `autoResize` only removes
      the browser's resize grabber, which Figma does not draw. AtlStepper `linear` is behaviour.
      AtlButton `hasIcon` maps to nothing — `AtlButtonSpec` has no such prop; it is a Figma-side
      slot toggle. And **four of AtlTable's five belong to child specs**: `sortable` is
      `AtlThSpec`, `selectable` is `AtlTrSpec`, `empty` is `AtlTbodySpec`, and `error` is in no
      spec at all — the container was carrying its children's states, which is exactly why nothing
      could reference them (ADR-0056).
- [x] ~~**Replace the pictograms drawn as TEXT characters**~~ — done 2026-08-27, ADR-0058.
      `[MASTER-GLYPH]` is zero. It was 120 nodes across 15 masters, not the 42 first reported —
      42 was the deduplicated count and every variant carried its own. 83 became instances of the
      Icon library, each keeping the colour Variable its glyph was bound to
      (`color/success-text`, `color/text-muted`, …), so the token discipline survived the swap.
      Three groups were deliberately NOT made instances, because the code does not draw them with
      an icon: the 32 `⟳` loading spinners are a CSS ring (`border: 2px solid currentColor` with
      a transparent top edge) and are now ellipses with a 270° arc taking the label's colour, as
      `currentColor` does; AtlCheckbox's tick is `::after` with two borders rotated 45° and is
      now that vector path; and AtlChat's `–` stays, marked in the master.
- [ ] **AtlChat's master draws a minimise control the component does not have.** `AtlChatSpec`
      exposes `open` and `onOpenChange` and nothing else — no minimise prop, no
      `is-minimised` class, no CSS. Decide whether AtlChat gains the state or the master loses
      the button; until then the master states the reason itself and `[MASTER-GLYPH]` reads it
      (ADR-0058).
- [ ] **The checkbox tick is drawn twice in the library.** The code draws it with a rotated
      pseudo-element while `ATL_ICON_GEOMETRY` already has a `check`. ADR-0046 says one concept,
      one drawing — so either AtlCheckbox renders `<AtlIcon name="check">` (and keeps the
      `atl-check-pop` animation on it), or the duplication is accepted and recorded. Figma now
      draws the CSS shape faithfully, so the two agree; the duplication is in the code.
- [x] ~~Six spec flags reported as missing that have no state to draw~~ — reasoned out in the
      masters themselves 2026-08-27: AtlAccordionGroup `multi` and AtlStepper `linear` are
      behaviour (`if (linear && i > activeStep) return` is the whole of it), AtlTooltip
      `atlTooltipDisabled` early-returns and renders nothing, AtlDialog and AtlDrawer `open`
      render nothing when false (native `<dialog>` + `showModal()`) and their
      `closeOnBackdrop` is behaviour. Each states its reason as
      `- Boolean \`x\`: not modelled — <reason>` in the master's own description, which the gate
      reads — an exemption inside the script would be one nobody opening the master can see.
- [x] ~~Bind the owed Booleans and add the absent ones~~ — done 2026-08-27, ADR-0058. All six
      Figma conformance codes read **zero**: `[MASTER-GLYPH]`, `[BOOL-INERT]`, `[BOOL-MISSING]`,
      `[BOOL-CLAIM]`, `[AXIS-NAME]`, `[AXIS-NOT-A-PROP]`. Bound: AtlInput and AtlTextarea
      `readonly` (a `_readonly-surface` rect reproducing `background: surface-sunken` +
      `border-color: transparent`), AtlAlert `dismissible` (the button it never had), AtlToast
      `dismissible` (the slot existed and my glyph pass had mislabelled it `danger`), AtlTable
      `stickyHeader` (the 1px line `box-shadow: 0 1px 0 0` draws), AtlToggle and AtlRadioGroup
      `invalid` (the `_invalid-border` overlay idiom), AtlCombobox `readonly`, AtlSkeleton
      `animated` (the shimmer gradient). Explained instead of bound, each in its own master:
      AtlChat `open` (needs the panel and its contents grouped first), AtlProgress
      `indeterminate` (a REPLACING state — belongs on a variant axis), AtlPagination
      `showFirstLast` (the master draws no first/last control at all), `required` everywhere
      (renders nothing), AtlRadioGroup `readonly` (emits a class no stylesheet uses).
- [ ] **AtlRadioGroup emits a dead `is-readonly` class.** `atl-radio-group.tsx` adds it and no
      stylesheet in any of the three frameworks has a rule for it — the same shape ADR-0045
      removed from AtlSelect, still present here. Either style it or drop the class.
      Still ungated after 2026-08-28: `check:dead-selectors` walks CSS → template, and this is
      template → CSS, the direction ADR-0081 §4 measured at 49 rows and did not ship.
- [ ] **AtlRadioGroup's master draws one radio, not a group.** Its variants are a single
      18px circle plus a label, so the group-level states have nothing to sit on. Related to the
      child-master work below (ADR-0056).
- [x] **Eleven child masters** (closed 2026-08-27, ADR-0062) — AtlIcon landed with ADR-0057;
      the other ten were built from their own CSS rules, with descriptions stating the spec
      mapping, why each axis is an axis, and every exemption. The reason they mattered turned out
      to be structural, not cosmetic: `[ROOT-PAINT]` compares a master's ROOT, so a part drawn as
      a layer had nothing to compare — promoting it makes it checkable. Widened ADR-0056's
      criterion in the process: a part earns a master by being independently PLACEABLE or by
      having its own state (AtlMenuSeparator and AtlChatTyping have no spec interface at all).
- [x] **Capture Boolean properties as data** (closed 2026-08-27, ADR-0058) — done with the
      item above; the description is still read, but only for the *mappings*, which exist
      nowhere else.
- [ ] **Angular's `touched` is public API the spec never declared** (ADR-0055). Seven
      components expose it as a `model(false)`; React and Vue have no equivalent, and it no
      longer gates the error message. Remove it with the breaking batch, or add it to the
      spec and to the other two — but not neither.
- [ ] **`@nx/devkit` is still a hard dependency of the preset, pinned to the monorepo's
      nx.** ADR-0053 closed the peer-dependency route by which a plugin outran nx core, but
      `NX_VERSION` is read from whichever devkit the preset itself carries. If
      `create-nx-workspace` ever scaffolds on a newer nx than this pin, the skew returns
      inverted — the generator would install plugins one version *behind* the workspace.
      It has not bitten because the pin moves with the monorepo, but that is discipline, not
      a mechanism.
- [x] ~~**Only the typeface half of the shorthand trap is gated**~~ — closed 2026-08-28,
      done by ADR-0073: `[FONT-AFTER]` reports any `font-*` or `line-height` longhand
      declared ABOVE a `font:` shorthand in the same rule, which is literally what this
      asked for. `[FONT-RAW]` came with it and closes the neighbouring hole — a `font:`
      shorthand must be one `--ui-type-*` role or `inherit`, so a hand-assembled
      `font: 600 15px/1.25 Inter` cannot hide a size from `check:token-bypass`.
- [x] ~~No gate measures rendered geometry~~ — done 2026-08-26, ADR-0042:
      `check:geometry` renders every control claiming a `--ui-control-height-*` token and
      asserts the box matches, in `check:all`. Roster discovered in both directions, so the
      remaining control migration is self-gating. Negative-tested against the original
      defect: restoring the authored padding fails with "renders 46px but claims 40px".
      **The CI leg is verified** — it has run green on every push since, on plain
      Playwright rather than vitest browser mode, so it does not share B4's failure.
- [ ] `coverage.thresholds` in 3 vite configs (measure current coverage first — may fail CI)
- [x] ~~`docs-old/` (42 tracked files, not in nx graph)~~ — closed 2026-08-28, stale as
      written: `git ls-files docs-old` returns **0** and commit `bc714df` ("chore: delete
      orphaned docs-old app") removed it. An untracked directory of the same name may still
      sit in a working copy; that is local cruft, not a repo item.
- [x] Wire `check:figma` into CI — done: it runs inside `check:all`, so the `checks` job
      covers it (recorded in ADR-0034, which revises ADR-0019 §5). It exits 0 with 2
      non-blocking `[DESC]` warnings and a 29/29 snapshot (43 masters and 8 warnings as of
      2026-08-28). **Freshness is still open** —
      the gate never checks snapshot age and `figmaLastModified` is `null` (see C8).

Larger workstreams (ranked, see plan file A–D):
- [ ] A1 generation eval (thesis unmeasured) · A2 persist+gate parity result · A3 cross-fw a11y-tree conformance
- [ ] B4 storybook-test+axe in CI — **blocked 2026-08-26, with a repro**: the suite passes
      locally (216 React + 242 Vue, ~11s/lib) but fails identically whenever `CI` is set —
      `Failed to connect to the browser session … within the timeout` → "Tests no tests".
      Repro without Nx or GitHub: `cd libs/vue && CI=1 npx vitest run --config
      vitest.storybook.config.ts` (passes with CI unset). Playwright launches the headless
      shell and exits 0, so the browser is fine — the page never connects back to the Vitest
      server. Ruled out: missing browser binary, `--no-sandbox`,
      `--disable-dev-shm-usage`, `--no-file-parallelism`,
      `--browser.connectTimeout=180000`, and any `CI` branch in this repo's `.storybook`
      config or in vitest's connect path. **Narrowed 2026-08-26** by ADR-0042's gate:
      `check:geometry` drives real chromium on the runner and passes, so the runner is
      not the problem and neither is headless chromium — the fault is specific to how
      vitest's browser provider gets the served page to connect back. Next: capture the
      served page's console in CI, or bisect `@storybook/addon-vitest` / `@vitest/browser`.
      · ~~B5 contrast gate~~ (done 2026-08-26, ADR-0037: `check:contrast` in `check:all`, palette read from the token source, 104 pairs / 4 modes) · B6 meta-test for the gates — *partial*: ADR-0034
      derives the a11y-parity roster from the component dirs with recorded exemptions; the
      cross-gate roster reconciliation is still open
- [ ] C7 capture bound-token name/value in snapshot · C8 check:figma+freshness · C9 full 27-master snapshot
- [ ] ~~D10 React CSS/tokens packaging defect~~ (done 2026-07-10, ADR-0026; incl. Vue entry-point fix) · ~~D11 gate publish on CI~~ (done 2026-08-26, ADR-0033: `verify` job + `needs:`) · D12 de-personalize host+deploy wf · ~~D13 metadata a11y cross-check~~ (done 2026-08-26: check:metadata now cross-checks `accessibility.role` against the a11y baselines; 3 real divergences found, see below) · D14 invert check-docs-sync · D15 secret/RCE defaults

Blind spots (decisions): SSR stance (Vue Math.random IDs) · reduced-motion gate · 3-fw maintenance/generator · toolchain version-drift · CONTRIBUTING.md · API-stability contract · fw-agnostic contrast gate

## Spec hygiene: checkbox/toggle value (ADR-0022) — 2026-06-13

- [x] Decision: spec-hygiene + docs (not adapter parity / not docs-only)
- [x] LlmCheckboxSpec/LlmToggleSpec → Omit<LlmFormFieldSpec,'value'|'onValueChange'>
- [x] Dropped phantom value/[(value)] rows from checkbox+toggle docs prop tables
- [x] sync-spec + gen-behaviors + gen-llms; check:all green; build 58 pages
- [x] ADR-0022 + README row; commit
- [x] ~~push~~ — done long since; the batch shipped 2026-06-13.
- Remaining open: .panel/.close-btn dialog scoping (component-trinity); McpExplorer tool rename (lossy, disclaimer'd); ideas 11-29

## Quick-win ideas batch — 2026-06-13

- [x] Edit-this-page link (BaseLayout + source-path helper; dynamic routes link template, 404 excluded)
- [x] Teaching empty states (gallery: specific msg + Clear filters + category chips; search: type-hint)
- [x] Verify (lint/build/58 pages) + screenshots + commit + push
- Skipped: copy "inked" polish (multiple impls, low value); content follow-ups [(value)] alias still a docs-vs-library decision

## P3 polish batch — 2026-06-13

- [x] Agent A chrome: visible breadcrumb, components return link, scroll-top 44px + progress bar
- [x] Agent B pages: figma-console-mcp literal, home jargon, d2c named link, kata code title, accessibility note (FRAMEWORKS order + mcp overflow rerouted to me)
- [x] Agent C data: CDK-leak neutralized, 'Yes, delete' label, vertical-tab pills clarification
- [x] Agent D a11y: gallery filtered-count live region
- [x] Inline (orchestrator): McpExplorer 'Use with AI tools' single-col; tutorial+d2c FRAMEWORKS→Angular-first (match FW_DEFAULT); ComponentDetail duplicate breadcrumb removed; McpExplorer radius mock already fixed prior
- [x] Verify nx lint/build/check:docs clean (58 pages); screenshots (single breadcrumb, progress bar, MCP single-col, home jargon) + commits

### Review
P3 polish batch done, 4 commits. Moot (already fixed earlier): skill version + ref count (derived), kata {framework} (substituted). Skipped: og:image (accepted placeholder). Agent B correctly rejected an inverted premise — FW_DEFAULT is 'angular', so first-component (Angular-first) was already right; tutorial+d2c were the divergent ones (fixed inline). Remaining open: deferred ideas 9-29, content follow-ups (checkbox/toggle [(value)] alias, .panel/.close-btn scoping, McpExplorer tool rename), content-review-1 P3 (figma-console-mcp suffix now done; rest minor).

## UX P2 batch — 2026-06-13

- [x] Agent 1: workshop-track.ts (Schulung→7 steps), BaseLayout (instructor group + MCP label + tocItems API + drawer pad), global.css (.docs-toc-mobile + scroll-fade)
- [x] Agent 2: TOC adoption — 6 pages migrated to tocItems; tokens+schulung gain TOC; schulung manual pager
- [x] Verify: nx lint clean + build 58 pages + screenshots; commits + push

### Review
6 open P2 closed. Verified live (local): tokens/schulung desktop TOC (7/6 sections), mobile "On this page" disclosure visible+expandable, drawer shows For-instructors group and scrolls with 80px bottom clearance, first-component "Step 6 of 7", topbar "MCP playground". One icon note: the instructor-group heading uses `school` (Icon.astro only registers a fixed set; unregistered names crash the build — same constraint hit twice). Still open: UX P3 list (~14), deferred ideas 9-29, content follow-ups (checkbox/toggle [(value)] alias, .panel/.close-btn scoping, McpExplorer tool rename).

## UX Top-5 implementation — 2026-06-12 (eve)

Report: tasks/review-docs-ux-2026-06-12.md · Top-5: track infra, 404, framework-state, checkpoints, search/drawer a11y

- [x] Wave 1A: workshop-track.ts + TrackNav.astro + Checkpoint.astro + BaseLayout (sidebar derive + drawer a11y + 44px targets)
- [x] Wave 1B: branded 404.astro
- [x] Wave 1C: ComponentDetail (import tabs framework-aware + aria-pressed) + McpExplorer (framework-pref + a11y + radius mock)
- [x] Wave 1D: Search.tsx keyboard nav + ARIA combobox + live region
- [x] Wave 2: TrackNav + Checkpoint + step indicator on 7 track pages; first-component {framework}-substituting prompt
- [x] Verify: nx lint (clean) + build (58 pages) + local screenshots + functional asserts
- [x] Commits (5 batches) + push

### Review

Wave-2 page agents hit the session limit mid-run (reset 00:20). State on resume: workshop + figma-token complete; design-to-code build-broken (left a BottomNav ref + renamed PROMPT→prompt(fw) without updating the body); tutorial/patterns/first-component/schulung partial or untouched. Finished all 7 by hand (mechanical, API was clear from the two completed pages).

**Two real bugs the agents introduced, caught at build:**
1. `design-to-code` referenced removed `BottomNav` and an undefined `PROMPT` — fixed by completing the TrackNav swap and per-framework prompt rendering.
2. **TrackNav used `arrow_forward`, which isn't in the Icon registry** (only arrow_back/left/right exist) — it never surfaced in wave 1 because TrackNav renders nothing until placed on a track page, so the bad icon name was only exercised once wave 2 wired it in. Switched to arrow_left/arrow_right.

Verified live (local): first-component shows "Step 7 of 8", prompt contains concrete `storybook-angular`, TrackNav prev=Design to code / next=Patterns; patterns renders prev-only (last step); workshop checkpoint present; schulung "for instructors" note + "Step 2 of 8"; 404 full chrome + studio metaphor; search ArrowDown sets aria-activedescendant + aria-expanded.

**Open (user decision):** Schulung placement — it's now flagged in-page as instructor material, but still sits as numbered step 2 of the participant path. Moving it out of the numbered sequence is a content/IA call.

**Not done (deferred ideas, report ranks 9–29):** framework-aware home routing, interactive token playground, "Edit this page", persisted progress checkmarks, embedded Storybook previews, changelog-from-ADRs, etc.

## Fix docs review findings (P1+P2) — 2026-06-12

Plan: ~/.claude/plans/mach-ein-review-von-delightful-axolotl.md · Report: tasks/review-docs-site-2026-06-12.md

- [x] A: Agent 1 — components.ts per-framework examples + gen-llms-txt.mjs + regen llms
- [x] A2/D2: Agent 2 — ComponentDetail.tsx renderer + Storybook link + H1 class swaps
- [x] C4: Agent 3 — patterns.ts + glossary.ts API-truth fixes
- [x] D0: repro demo-stretch/data-list locally (me) → D0/D1/D2-CSS: Agent 4
- [x] B/F: Agent 5 — build-time derivation (skill-meta.ts, llms.astro, skill pages) + ADR 0021
- [x] C2: Agent 6 — MCP overclaims (index, mcp, design-principles, claude-md, storybook anchor)
- [x] C1/C3/C4/C5: Agent 7 — tokens, install, prompts, figma, accessibility, workshop, first-component, schulung
- [x] A4: framework checker agents (3×) over the 84 examples — 3 Angular fails found & fixed, final 28/28×3
- [x] Final: check:docs/llms/metadata ✓, nx lint docs ✓, nx build docs ✓, re-screenshots ✓
- [x] Commits (conventional, batched) + push main

### Review

All 38 P1/P2 findings fixed across 7 batched commits (247a58a..8525cae). Key outcomes:
- **Root cause of the demo-stretch/data-list P1 was a library bug**, not docs CSS: unscoped
  `.size-*` width rules in `llm-dialog.css` leaked globally in the React/Vue builds and hit
  every `size-*`-classed element. Scoped to `.llm-dialog.size-*` / `dialog > .panel.size-*`
  in all three frameworks (byte-identical). Verified: demo button 576px→96px, data-list
  View 384px→62px, badges inline again.
- Per-framework examples shipped for all 28 components, audited 28/28 per framework against
  spec + exports + stories idioms; llms-full.txt now carries all three usage variants.
- Build-time derivation (ADR-0021) removes the recurring count-drift class; Figma counts
  corrected by hand against the live file (7 pages, 54 UI-tier vars, 27 sets).
- Broken-link warnings for `/storybook-*/?path=/docs/cookbook--*` are checker false
  positives (Storybook deployed separately on same domain; IDs verified in live index.json).

**Open follow-ups (out of scope, flagged by agents):**
- checkbox/toggle prop tables advertise an Angular `[(value)]` alias that the Angular
  adapter never implemented — spec-vs-impl drift, needs a component-trinity/ADR decision.
- `.panel`/`.close-btn` in llm-dialog.css are still generic global classes (no proven
  collision today); Angular's `<dialog>` never receives the `.llm-dialog` class (dead base
  rules). Worth a scoping pass.
- McpExplorer playground still simulates the 5 conceptual tools (now labeled as such);
  renaming them to the real toolset would be the deeper fix.
- P3 findings (15) from the review remain unfixed by decision.

## Review — Personal authorial signature (2026-06-02)

Typography + motion signature on top of Direction A (palette untouched). See ADR-0020.

- **Heading accent:** `Instrument Serif` 400 italic loaded via Astro Fonts API
  (`astro.config` 3rd entry → `--font-accent`; rendered in `BaseLayout`). New
  `--docs-font-accent` token + `.docs-accent` class (teal, serif-italic, inherits heading
  size). `PageHero` + `SectionHead` gained `titleAccent?: string` (first exact substring →
  `<em class="docs-accent">`; plain string otherwise — backward-compatible). Applied to
  `first-component` ("component"), `design-to-code` ("Code"), `tokens` ("tokens"),
  `index` SectionHead ("loop").
- **Motion sweep:** all ~27 hardcoded `transition:` in `docs/src/**` → `var(--ui-transition-*)`
  (`global.css`, `Jargon.astro`, `patterns/[id].astro`, `McpExplorer.tsx`, 3 inline pages).
  No new tokens; 520ms theme-reveal keyframe left as the deliberate one-off.
- **Verified:** `nx lint docs` clean (2 pre-existing warnings); `nx build docs` 57 pages OK;
  `.docs-accent` + Instrument @font-face + 3 woff2 subsets emitted; Astro auto-generated an
  Arial-metric fallback (CLS-safe). Reduced-motion now applies uniformly (all transitions
  derive from `--ui-duration-*`, zeroed under the media query).
- **Remaining manual step:** eyeball serif accent teal in light/dark in a browser.

## Shipped ✅

### Component libraries
- 25+ components across Angular, React, and Vue
- Signal Forms integration (Angular), prop/callback pattern (React), v-model (Vue)
- CSS design tokens, dark mode, accessible by default
- Includes complex components like LlmTable, LlmCombobox, and LlmStepper

### Storybook
- All three frameworks with interactive Controls
- Foundation docs (colors, spacing, typography)
- Welcome / Introduction page per framework
- Showcase story (all components on one page)

### MCP server
- 5 tools: list_components, get_component_docs, search_components, get_stories, get_theming_guide
- Hosted at atelier-ui.netlify.app/storybook-{angular,react,vue}/mcp

### create-atelier-ui-workspace
- CLI with interactive framework selection
- Scaffolds Nx workspace with per-framework apps
- Generates CLAUDE.md with MCP tool reference + framework import patterns
- Injects CSS tokens import into each app's styles.css
- Pre-configures .claude/settings.json with MCP servers
- 19 automated tests for the preset generator

### Docs site (atelier-ui.netlify.app)
- Workshop-first homepage with 3 pillar cards
- Workshop Setup, MCP Playground, Storybook, Installation
- LLM-Optimized APIs page (why the library is structured this way)
- MCP Playground with protocol flow, color legend, workshop tips per tool

### Published packages (v0.0.4)
- @atelier-ui/spec
- @atelier-ui/angular
- @atelier-ui/react
- @atelier-ui/vue
- @atelier-ui/create-workspace
- create-atelier-ui-workspace

## Remaining

- [x] ~~Storybook visual check — light + dark mode, manual pass on key components~~ — covered 2026-04-28 by cookbook P7 (36 light/dark Playwright captures × 6 patterns × 3 frameworks, embedded on per-pattern detail pages) and the docs a11y sweep (axe clean across 22 pages, both themes verified by token swap rules in `BaseLayout` + `:focus-visible` baseline).
- [x] ~~CI pipeline for tests on PRs~~ — shipped (`.github/workflows/ci.yml`: parallel lint/test/build/checks on `nx affected`)
- [x] ~~True CLI e2e test~~ — shipped as `nx run create-atelier-ui-workspace:e2e`, wired into CI as an affected-gated job

## Open — Figma/a11y review follow-ups (2026-04-23)

Snapshot of what's still open after the multi-round review + cleanup work (commits `80f57d0` through `b53ac6e`, releases `v0.0.15` → `v0.0.19`). Grouped by effort so they can be picked up individually.

### Quick wins (each < 30 min)

- [x] ~~**Fix dark-mode `on-primary` inconsistency**~~ — shipped 2026-04-23. `[data-theme="dark"]` block in all 4 tokens.css copies (angular, react, vue, preset) now matches the `@media (prefers-color-scheme: dark)` value `#0f172a`. Affects Checkbox / Stepper / Radio glyphs rendered on `#00d0d0` primary in dark mode.
- [x] ~~**Add `A11y:` block to LlmBadge description**~~ — shipped 2026-04-23. Appended one-line `A11y:` note to component-set `55:22` description via `figma_set_description`. Re-audit: `annotations: 100/100`, `hasA11yNotes: true`, overall score `100/100` with zero recommendations. Note wording covers both differentiators (Unicode glyph `::before` for WCAG 1.4.1 + `role="status"`).
- [x] ~~**Invalid-state icon on LlmTextarea**~~ — shipped 2026-04-23. `✕` glyph via `::before` on a `.textarea-field` wrapper in all 3 frameworks (wrapper needed because `<textarea>` is a replaced element and R/V have an optional label above it). Same pattern as Alert's `.content::before`. Note: LlmInput has the identical latent flag — follow-up.
- [x] ~~**Drop decorative `⌟` corner glyphs**~~ — Figma-only; shipped 2026-04-23. Correction: the glyphs were on the **LlmTextarea** component set (5 variants: default/filled/focus/invalid/disabled), not LlmCombobox as originally written. All 5 text nodes removed via `figma_execute` on Bridge; before/after screenshots confirmed clean bottom-right corners. Component set `55:87`; removed nodes `3:804 / 3:808 / 3:812 / 3:816 / 3:821`.

### Moderate (1–3 h each)

- [x] ~~**Create a type ramp**~~ — reconciled 2026-04-23. The "zero text styles" claim was stale: `figma_get_text_styles` returns **11 styles** (`text/heading-{lg,md,sm}` · `text/body-{md,sm}` · `text/label-{lg,md,sm}` · `text/code-sm` · `text/icon-sm` · `text/icon-display`). Re-running `figma_lint_design --rules=no-text-style` on the Components page now returns only **2 findings**, both the 9 px `"JS"` avatar initials on the `size=xs` variants (`3:935`, `73:387`). Those are already captured under *Marginal / likely won't-fix → sub-12 px text in icon roles* and are visually intentional, so no binding action is warranted.
- [x] ~~**LlmProgress variant explosion**~~ — shipped 2026-04-23. Dropped the `state` variant axis on ComponentSet `420:153`; deleted the 12 `state=indeterminate` nodes; added a BOOLEAN component property `indeterminate` (default `false`) that documents the API in Dev Mode. Remaining variants: 12 (variant × size). Story `design` links in `libs/{angular,react}/src/lib/progress/llm-progress.stories.*` redirected from `420-90` → `420-87`. Trade-off: the static indeterminate visual preview is gone — the animation is CSS-only at runtime anyway, so the Figma snapshot added no information. Description updated to call this out explicitly.
- [x] ~~**LlmTable state property split**~~ — shipped 2026-04-23. Added BOOLEAN component properties `sortable#437:27`, `selectable#437:38`, `stickyHeader#437:49` (all default `false`) on ComponentSet `421:1183`. Deleted variants `421:1002`, `421:1051`, `421:1090` (the `state=sortable/selectable/sticky` entries). Remaining variants: 7 (3 variant × 3 size compacted to only the populated combos, plus `state=empty` at `421:1103` and `state=focus` at `434:1234`). `state` axis now cleanly `default | empty | focus`. Description rewritten to call out the boolean-prop composition. 9 Storybook `design` links redirected from `421-1002/1051/1090` → `421-884` across Angular/React/Vue.
- [x] ~~**Add hover/active/loading variants** to interactive components~~ — shipped 2026-04-23. Extended the `state` axis on all 9 remaining interactive ComponentSets (Button was already done in `d3ee9ac`): Input `129:33`, Select `55:92`, Combobox `421:339`, Checkbox `55:36`, Radio `420:185`, RadioGroup `55:137`, Toggle `55:41`, TabGroup `55:123`, Table `421:1183`. Each now has three additional variants (hover, active, loading) added to a representative sub-variant — not full cross-product, mirroring the Button precedent. Visual treatment by family:
  - **Input family** (Input/Select/Combobox): hover = border→`color/input-border-hover`; active = border→`color/input-border-focus` weight 2 + bg→`color/input-bg-focus`; loading = dimmed text + `⟳` glyph at right edge.
  - **Control family** (Checkbox/Radio/RadioGroup): hover = frame stroke→`color/border-hover`; active = frame fill→`color/input-bg-focus` + stroke→`color/input-border-focus` weight 2; loading = `⟳` centered in frame, label dimmed.
  - **Switch** (Toggle): hover = track fill→`color/border-hover`; active = track→`color/input-border-focus` + knob slid to mid-position; loading = `⟳` overlayed on knob, label dimmed.
  - **Navigation** (TabGroup): hover/active = bg tint on the second (unselected) tab with darker text; loading = `⟳` glyph prepended to tab label with dimmed text.
  - **Table**: hover = tr-1 bg tinted `color/primary-light`; active = tr-1 bg tinted `color/surface-sunken`; loading = primary `⟳` glyph in thead with all tbody rows at opacity 0.6.
  
  All fills/strokes bound to UI Tokens variables (Dark mode follows automatically). Placed new variants in empty Table slots (no set growth), and in second rows for single-row sets (Input, Select, Combobox, Checkbox, Toggle) — set widths unchanged, heights grown minimally. Parent sections resized to contain the grown sets (no overlaps between adjacent sections, verified in all 5 category sections). Also fixed a pre-existing overlap where the `LlmSelect` section's dropdown preview was in the space the new row needed — moved dropdown down 60 px.
- [x] ~~**Replace the remaining ~40 hardcoded hex values**~~ — done implicitly by the 2026-04-27 restructure work. Re-ran `figma_lint_design --rules=hardcoded-colors` on 2026-04-28 across all 7 pages (`Components` 1900 nodes, `Cookbook` 25, `Colors` 105, `Typography` 39, `Spacing & Radius` 52, `Icons` ~40, `📋 Inventory` 993): **0 findings** total. The ~40 count was stale. No remaining hex values to sweep.
- [x] ~~**Move icon indicators from CSS pseudo-elements to the component templates**~~ — shipped 2026-04-23. Badge + Alert across all 3 frameworks now emit `<span class="variant-icon" aria-hidden="true">{glyph}</span>` from the template with a `VARIANT_ICONS` lookup map. CSS retains the styling rules (font-weight / margin / line-height) but targets the `.variant-icon` class instead of `::before`. Consumers can now override the icon and themed mode-swapping becomes possible. Tests stay green (492/492, no test asserted on glyph content). `LlmInput` / `LlmTextarea` still use `::before` for their single invalid-state indicator — deferred as a separate follow-up (different role: validation vs. semantic variant).

### Larger workstreams

- [x] ~~**Adopt an icon system for the component library**~~ — decision recorded 2026-04-28. Current state: Unicode glyphs for the 4 semantic-severity icons (info/success/warning/danger) on Badge + Alert + Input + Textarea — self-labelling for screen readers, no dependency, render correctly in greyscale and high-contrast modes. `@material-symbols/svg-400` is installed in the docs site and is the natural upgrade path **if and when** Menu / Select / nav components need icon slots. No code change today; closing this as a documented architecture choice rather than an open task.
- [x] ~~**Rework `wcag-color-only` remaining flags for Badge/Alert**~~ — declined 2026-04-28 as cosmetic lint-appeasement with zero a11y benefit. The page-level lint heuristic only compares root-level fills and doesn't inspect child SVGs or template-emitted glyph spans. `figma_audit_component_accessibility` correctly reports `colorDifferentiation: 100/100` for both Badge and Alert because the runtime DOM does carry non-color differentiators (Unicode glyph + role="status"). Real WCAG 1.4.1 is satisfied; appeasing the heuristic would require adding dashed/dotted outlines or distinct corner shapes per variant — visual noise without user benefit. Documented here so future audits don't re-open it.

### Marginal / likely won't-fix

- [x] ~~**14 `wcag-text-size` below-12px warnings**~~ — declined 2026-04-28. All flagged text is intentional UI chrome: pagination arrows `▲▼`, font-size labels `xs/sm`, badge `Default` placeholder, Alert `Backdrop (rgba(0,0,0,0.5))` documentation label. None of it is content text. WCAG 1.4.4 *Resize Text* requires supporting 200% zoom without loss of content/functionality, not a specific size floor; code uses `rem`/`em` units throughout so 200% zoom works. Bumping these to ≥12 px to silence the lint would change the visual rhythm of the chrome for no a11y benefit. Documented as accepted.
- [x] ~~**Docs site: resize `docs/src/assets/logo.png` + `docs/public/logo.png`**~~ — shipped 2026-04-23. Both PNGs resized via `sips -Z 224` to 224×214 intrinsic (≈ 4× retina over the 56×54 rendered size). File size dropped 585 KB → 37 KB per file (~15× smaller). `<img>` attributes in `docs/src/layouts/BaseLayout.astro:168` updated from `width={56} height={54}` to `width={224} height={214}` to match new intrinsics for correct CLS aspect-ratio. CSS `.docs-logo-img { height: 28px }` unchanged — rendered size stays the same. `nx build docs` still green (43 pages).
- [x] ~~**Pre-existing lint errors in `docs/.astro/*.d.ts`**~~ — shipped 2026-04-23. Added `'docs/.astro/**'` to the root `eslint.config.mjs:14` ignores array. `nx lint docs` now 0 errors / 0 warnings (was 4 errors / 5 warnings from auto-generated `/// <reference>` directives and `{}` types in `content.d.ts` + `types.d.ts`).

### Pointers back

- All session commits: `git log --oneline 6cf4f74..` (on `main`, from before `v0.0.12` up through `v0.0.19`).
- Figma file: `Atelier` (`QMnDD8uZQPldPrlCwZZ58T`) — `Components` page. Lint via `figma_lint_design`; component audit via `figma_audit_component_accessibility`.
- Session lint deltas (before / after): `wcag-contrast` 25 → 0; `wcag-focus-indicator` 6 → 0; `wcag-disabled-no-context` 8 → 0; `wcag-color-only` 13 → 16* (*page-level heuristic; component-level is clean).

## Review — Figma designs for the last 7 components + parity pass (2026-04-22)

Closed the Figma design gap for the 7 components that existed in code but had no design: `code-block`, `combobox`, `drawer`, `progress`, `radio` (standalone), `stepper`, `table`. All new component sets live on the Atelier `Components` page, bind every fill/stroke/text to UI Tokens so Light + Dark modes render automatically, and are linked back into Storybook via `parameters.design` on the meta and per-named story across Angular, React, and Vue.

**Figma node-ids (captured this run):**

| Component | Section | Component set | Key variants |
|---|---|---|---|
| LlmProgress | `3:875` | `420:153` | default-md-determinate `420:87`, default-md-indeterminate `420:90`, success-md `420:105`, warning-md `420:123`, danger-md `420:141`, size-sm `420:81`, size-lg `420:93` |
| LlmRadio *(new)* | `420:182` | `420:185` | unchecked `420:165`, checked `420:169`, disabled `420:174`, invalid `420:178` |
| LlmCodeBlock *(new)* | `420:283` | `420:286` | default `420:186`, with-filename `420:209`, with-line-numbers `420:232`, no-copy `420:263` |
| LlmCombobox *(new)* | `421:336` | `421:339` | default `421:291`, open `421:295`, filtered `421:313`, selected `421:324`, disabled `421:328`, invalid `421:332` |
| LlmDrawer | `3:1111` | `421:398` | right `421:342`, left `421:356`, top `421:370`, bottom `421:384` |
| LlmStepper *(new)* | `421:404` | `421:505` | default `421:407`, completed `421:427`, error `421:446`, optional `421:465`, vertical `421:485` |
| LlmTable | `158:39` | `421:1183` | default-md `421:884`, striped `421:923`, bordered `421:962`, sortable `421:1002`, selectable `421:1051`, sticky `421:1090`, empty `421:1103`, size-sm `421:1142`, size-lg `421:1181` |

**Files touched — stories (21):** `libs/{angular,react,vue}/src/lib/{progress,radio,code-block,combobox,drawer,stepper,table}/*.stories.{ts,tsx}` — meta + per-story `parameters.design`, `figmaNode()` helper added to files that lacked it (all 7 Vue stories, Combobox/CodeBlock/Table in Angular+React, Stepper+Drawer+Progress in React+Vue).

**Files touched — code (3):** `libs/{angular,react,vue}/src/lib/stepper/llm-stepper.css` — replaced hard-coded `color: #fff` on `.step-item.is-completed .step-circle` with `var(--ui-color-on-primary)` (matches the Figma design-token binding) and on `.is-error` with `var(--ui-color-text-on-danger, #ffffff)` (semantic). All other Progress/Radio/CodeBlock/Combobox/Drawer/Table styles were already 100% token-bound and matched the new designs — no further code changes needed.

**Parity notes (minor, non-blocking):**
- Combobox input text: Figma 14px vs code `--ui-font-size-md` (16). Kept code at 16 to match Input/Select.
- Drawer header font-size: Figma 18px vs code `--ui-font-size-xl` (20). Kept code at 20 for token consistency.
- CodeBlock mono body: Figma 13px vs code `--ui-font-size-sm` (14). Kept code at 14.
- Radio stroke: Figma binds to `color/border` (#E5E7EB); code uses `--ui-color-input-border` (#D1D5DB). Both semantic, different shades.
- Table header tracking: Figma letter-spacing 6% vs code `--ui-letter-spacing-wide` (1%). Kept code using the token.

**Verified:** `nx run-many -t lint,test -p angular,react,vue` all green (3/3 lint, 27/27 test files, 492/492 tests, drawer `play` functions intact).

**Visual polish pass (same day, after user review):** screenshot-verified each of the 7 component sets via the Desktop-Bridge `figma_capture_screenshot` path (REST screenshots 403 without a token) and fixed five layout bugs:
- Combobox `open` / `filtered` variants had invisible dropdown panels — outer component and inner `panel` frame were pinned at h=40 / h=1 because `.resize()` flipped their primary-axis sizing back to FIXED. Toggled both back to AUTO.
- CodeBlock variants were all pinned at h=200 regardless of code length (same root cause). Freed the primary axis, now heights hug content.
- Table inner `LlmTable / *` containers had the same pinning; freed.
- Stepper step circles rendered as narrow vertical pills because switching `layoutMode` to `HORIZONTAL` after `.resize(32, 32)` reverted both axes to AUTO and shrunk-wrapped the text. Set both sizing modes back to FIXED at 32×32.
- Stepper connectors were 2px rectangles placed with counter=MIN, so they sat at the top of the step items instead of aligned with the 32px circle midpoints. Wrapped each connector in a 40×32 (horizontal) / 32×24 (vertical) frame with the bar centered.
- Combobox option rows had `primaryAxisAlignItems='SPACE_BETWEEN'` which centered the single-text rows; switched to `MIN` and gave the "selected option" label `layoutGrow=1` so the ✓ still pushes right.
- Drawer content paragraphs were clipped in the narrow left/right panels (220px); set `textAutoResize='HEIGHT'` with a fixed width so text wraps.
- CodeBlock `no-copy` header had the same single-child SPACE_BETWEEN issue (centered "typescript" label); switched header to `MIN`.

All component sets re-stacked with 40px vertical gaps so sections no longer overlap. Node-ids above are unchanged — only layout properties and a few wrapper frames were added.

**Page alignment**: 7 sections redistributed into the same 3-column grid the existing 20 sections use (col 0 x=0, col 1 x=1588, col 2 x=3200), starting at y=3050 (40px below the last existing section). Final layout — Row 0: Progress | Radio | CodeBlock · Row 1: Combobox | Drawer | Stepper · Row 2: Table. Zero collisions with the existing sections. Node-ids still unchanged.

## Review — CLI e2e + tokens.css packaging fix (2026-04-22)

Shipped a real end-to-end test for `npx create-atelier-ui-workspace` and, in the process, caught a workshop-blocker that the previous unit tests couldn't see.

- `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs` — spins up a local verdaccio registry (via `npx -y verdaccio@5`), publishes the preset and CLI tarballs to it, installs the CLI into a scratch directory like an attendee would, runs it non-interactively, then `nx build`s the scaffolded app. verdaccio proxies to npmjs.org for everything except the two local packages so real `@atelier-ui/*` deps resolve normally.
- CLI got a `--framework=<angular|react|vue>` flag and an `ATELIER_PRESET_SPEC` env override so the e2e can drive it without a TTY. 13/13 jest tests (6 original + 5 new flag/env tests, 2 other pre-existing).
- `nx run create-atelier-ui-workspace:e2e` target added; gated on `^build` + `build`.
- New CI job `cli-e2e` in `.github/workflows/ci.yml` — affected-only, 20-minute timeout. Skips on unrelated pushes because verdaccio startup + 3 npm-install-and-build cycles take ~5 min.

**Bug caught and fixed:** the preset injected `@import '@atelier-ui/<fw>/styles/tokens.css';` but:
- `tokens.css` is not in the published v0.0.4 tarballs — ng-packagr and the react/vue builds only bundle the entry point, not `src/styles/`.
- Even if it were shipped, the dist-generated package.json has a strict `exports` field without a `./styles/*` entry.

Fixed by making the preset own a canonical `tokens.css` at `libs/create-workspace/src/generators/preset/files/styles/tokens.css` and writing it into `<app>/src/styles/tokens.css` during scaffolding. Attendees can edit colors directly in their workspace (no CSS-variable override pattern required for a 90-minute session). `@atelier-ui/<fw>` npm packages are still used for components, just not for tokens.

Verified: e2e green for all three frameworks (angular / react / vue — real `nx build` with styles bundle produced), `nx test create-workspace` 29/29, `nx test create-atelier-ui-workspace` 11/11, `nx affected -t lint` clean.

## Review — Figma Desktop Bridge pivot (2026-04-22)

Primary Figma channel switched from the REST API (`FIGMA_ACCESS_TOKEN`) to the Figma Desktop Bridge plugin shipped by `figma-console-mcp`. Token becomes optional (REST reads only).

- `tools/scripts/preflight.mjs` (and the preset template copy) — `checkFigmaToken()` → `checkFigmaSetup()`: checks `~/.figma-console-mcp/plugin/manifest.json`, probes Bridge ports 9223–9232, treats `FIGMA_ACCESS_TOKEN` as optional.
- `.mcp.json` — `FIGMA_TOKEN_REMOVED` → `${FIGMA_ACCESS_TOKEN:-}` so no token is baked into the committed file.
- `.devcontainer/` (root and preset template) removed — Figma Desktop is required for the Bridge plugin and doesn't run in Codespaces. Preset generator no longer writes the devcontainer; the related test is dropped (28/28 green, was 29).
- `docs/src/pages/figma-token.astro` — rewritten to walk the Desktop Bridge plugin install path; REST token coverage kept as the optional section.
- `docs/src/pages/workshop.astro` — Codespaces prerequisite tab removed; link text points at "Figma Setup".
- `docs/src/layouts/BaseLayout.astro` — sidebar "Figma Token" → "Figma Setup" (icon `key` → `cable`).

Verified: preflight exits 0 (14 ok, 1 warn for optional FIGMA token — expected), `nx test create-workspace` 28/28, `nx build docs` 43 pages, `nx affected -t lint` clean.

## Review — Zero-Friction Setup (2026-04-21)

Shipped for the 90-minute workshop onboarding:

- `tools/scripts/preflight.mjs` — self-check: Node/npm/git, Claude CLI, FIGMA_ACCESS_TOKEN, MCP reachability (reads `.mcp.json`), ports 4200/4201/4202/6006. Color-coded, exit-code on hard fail.
- `npm run preflight` wired into root `package.json` and into the generated workspace via the preset.
- `.devcontainer/devcontainer.json` + `setup.sh` — Codespaces fallback path (Node 20 image, Claude CLI install via `npm i -g @anthropic-ai/claude-code`, port forwards, `FIGMA_ACCESS_TOKEN` injected from user env).
- Preset generator (`libs/create-workspace`) now ships the preflight script + devcontainer inside every scaffolded workspace. CLAUDE.md template gained a Troubleshooting section. 4 new tests, total 29 — all green.
- `docs/src/pages/workshop.astro` — prerequisites block with macOS/Linux/Windows/Codespaces tabs before step 01; step 02 now mentions `npm run preflight`.
- `docs/src/pages/troubleshooting.astro` — 8 common failure modes (MCP unreachable, Claude-Code-config not picked up, Figma 403, Node too old, EACCES, port in use, lost token, Windows paths) each with symptom/cause/3-step-fix.
- `docs/src/pages/figma-token.astro` — Option A (own token) vs. Option B (workshop demo token) vs. Codespaces secret, ending in a preflight verify.
- Sidebar (`docs/src/layouts/BaseLayout.astro`) gained "Figma Token" and "Troubleshooting" under Get Started.

Verified: preflight exits 0 locally (12 ok, 1 warn for missing FIGMA token — expected), docs build succeeds (43 pages), create-workspace test suite passes (29/29).

Out of scope this round (per plan): StackBlitz, challenges, wow-demos, CI pipeline, visual regression, CLI e2e.

## Active — `check:figma` Figma-Konformitäts-Gate (2026-06-01)

Plan: `~/.claude/plans/wir-schlie-en-die-einzige-eager-sun.md` (approved). Closes the
last AI-readiness layer without a drift gate (`plan/ai-readiness.md` §4).

**Decisions (locked via clarification):**
- Committed snapshot (`tools/figma/snapshot.json`) + offline `check:figma`.
- Refresh via figma-console MCP read-tools (spawn stdio client; devDep `@modelcontextprotocol/sdk`).
- Standalone npm script only — NOT in `check:all`, NOT pre-push.
- 5 core checks only; no `figma_lint_design` pass.

**Items:**
- [x] Capture real figma-console MCP output shapes to ground the snapshot schema
- [x] Add `@modelcontextprotocol/sdk` devDependency (`^1.29.0`)
- [x] `tools/scripts/figma-snapshot.mjs` — spawn MCP, probe (fail-loud if no plugin), write snapshot
- [x] Generate committed `tools/figma/snapshot.json` (P0 core: Button, Badge, Card)
- [x] `tools/scripts/check-figma.js` — offline gate, 5 checks, severity→exit, prioritized report
- [x] Extend `tools/scripts/lib/allowlists.js` with `FIGMA_CONFORMANCE_EXCEPTIONS`
- [x] `package.json`: `check:figma` + `figma:snapshot` (NOT in check:all)
- [x] `plan/figma-component-checklist.md`: annotate automated vs manual (+ `plan/ai-readiness.md` §4)
- [x] ADR `plan/adr/0019-figma-conformance-gate.md` + README index row
- [x] Verify: real findings · synthetic drift caught · `check:all` green · lint clean

### Review

Shipped `check:figma`, the drift gate for the last AI-readiness layer that had none.

**Architecture:** committed-snapshot + offline-check, in the repo's `gen-*/--check` idiom.
The only Figma-connected part is the refresh (`figma:snapshot`), which spawns
`figma-console-mcp` as a stdio MCP client; the gate itself reads `tools/figma/snapshot.json`
and is fully offline/deterministic. The snapshot holds Figma *facts* (names, variant axes,
descriptions, `layoutMode`, bound/unbound/raw per node); the gate holds the *rules*.

**Five checks:** name alignment (Blocker), variant-matrix completeness (Blocker), token-link
coverage (Critical), auto-layout (Critical), description congruence (Warning). Blocker+Critical
→ exit 1; Warning → exit 0 (symmetric with the other gates).

**Files:** new `tools/scripts/check-figma.js`, `tools/scripts/figma-snapshot.mjs`,
`tools/figma/snapshot.json`, `plan/adr/0019-figma-conformance-gate.md`; edited
`tools/scripts/lib/allowlists.js` (+`FIGMA_CONFORMANCE_EXCEPTIONS`), `package.json`,
`plan/adr/README.md`, `plan/figma-component-checklist.md`, `plan/ai-readiness.md`.

**Verification (all passed):**
- `npm run check:figma` → 5 real Critical token findings (unbound radii on Badge `9999`/Card
  `12`,`6`; unbound padding across Button/Badge/Card), exit 1. Not an empty pass.
- Allowlist proven: `LlmCardRole` (code-only landmark prop) raised a name Blocker; one
  `LlmCard:name:role` entry suppressed it correctly.
- Synthetic drift: added `'xl'` to `LlmButtonSize` → gate flagged `[BLOCKER] [NAME] LlmButton.size:
  Figma is missing value(s) ['xl']`; reverted clean.
- `npm run check:all` → exit 0 (no regressions). `eslint` on touched scripts → exit 0.

**Decisions worth remembering** (see ADR-0019 for full why):
- Description check is presence + spec-reference, not verbatim `== purpose` (Figma descriptions
  are intentionally richer; verbatim would warn on all 27 — pure noise).
- Component-set names are section-prefixed (`Action/LlmButton`) → compare the leaf.
- Figma's interaction `state` axis has no spec union → ignored by the name check.
- Childless frames (1px dividers) are exempt from the auto-layout check.

**Known follow-ups (documented, not silent):** committed snapshot covers 3 of 27 masters
(run `figma:snapshot` with the bridge for all 27); token/auto-layout sample the default variant;
masters without a spec interface (CodeBlock, Toast) will need allowlist entries on a full
snapshot; a snapshot-freshness check is the prerequisite to ever putting `check:figma` in CI.

**Note on in-session refresh:** `figma:snapshot` could not be executed live because this Claude
Code session already held the figma-console bridge (single-plugin-attachment); the committed
snapshot was built from the same MCP read-tools the generator uses, in the identical schema.

## Follow-ups from post-rename full review — 2026-07-21

Source: high-effort workflow code review of the Llm→Atl rename diff (8
distinct defects, all fixed same day) + repo-health sweep. These are the
items deliberately NOT fixed in that pass:

- [x] **a11y-parity coverage 1 → 5 of 31** (2026-07-22) — `gen:a11y`
      de-hardcoded (now regenerates every `*.a11y.spec.*`); Dialog, Menu,
      Tabs, Alert added across all three frameworks. The new snapshots
      immediately caught and fixed three real adapter bugs: React/Vue
      MenuTrigger exposed no `aria-haspopup`/`aria-expanded` (CDK does this
      automatically in Angular — now both set it on the trigger element),
      Vue's tab panel had `aria-labelledby="undefined"` and no `id` (the
      tab button's `aria-controls` pointed at nothing — groupId is now
      provided through the tab-group context), and the a11y-tree normalizer
      glued adjacent element texts together (element boundaries are now
      word boundaries) plus missed `<hr>`'s implicit `separator` role.
- [x] **a11y-parity batch 2** (2026-07-22) — Input, Checkbox, Toggle,
      RadioGroup, Progress, Breadcrumbs added (11/31 components now
      gated). Found+fixed a real Vue bug (input missing aria-required).
      Normalizer hardened: native checked/required states and label/for
      name association now captured (checkbox checked/unchecked snapshots
      were identical before — the gate compared nothing there).
- [ ] **a11y-parity: Select/Combobox are OUT of the gate by design** —
      React/Vue render a native <select> while Angular is a CDK-overlay
      listbox (ADR-0007); their accessibility trees legitimately differ
      (native options always in the DOM vs overlay panel). Cross-framework
      tree equality would force rebuilding an adapter. If ever revisited:
      either align the implementations or give the gate a
      per-component-scenario exemption mechanism.
- [x] **a11y-parity batch 3** (2026-07-22) — Badge, Avatar, Skeleton,
      Textarea, Card, Icon, Pagination, Stepper, Table, CodeBlock added
      (21/31 gated). Real bug #5 found+fixed: Vue pagination rendered
      buttons directly in <nav> without the list/listitem structure
      Angular+React expose (its .page-list CSS was dead until then).
- [x] **a11y-parity final batch** (2026-07-23) — Tooltip, Drawer, Toast,
      Chat added: 25 of 29 components gated, zero divergences on first pass
      *in the scenarios the specs render*. Out by design: Select/Combobox
      (native vs CDK-overlay adapters, documented above), Radio (covered via
      radio-group scenarios); AvatarGroup and the Menu-/Table-family
      sub-components are not separate component dirs and are covered via
      their parents. The roster is now derived from the component dirs and
      every exemption is recorded in `A11Y_PARITY_EXEMPT`
      (2026-08-26) — which corrected this entry's earlier claim of
      "COMPLETE for all comparable components": **accordion** is comparable,
      ungated, and was invisible while the gate globbed its roster from the
      snapshot directory. It now warns on every run.
- [ ] **Write the accordion a11y specs** — the one `kind: 'gap'` entry in
      `A11Y_PARITY_EXEMPT`. Comparable across all three adapters and the exact
      component ADR-0025 cites as its motivating divergence, so it is the most
      likely place for a real finding. Remove the exemption when the snapshots
      land (the gate errors if an exempt component gains snapshots).
- [ ] **Latent Chat divergence (observation, not gated)** — React's
      AtlChatHeader renders its close button unconditionally while
      Angular/Vue gate it behind variant !== 'inline'. Align React when
      touching Chat next.
- [x] **4 hand-maintained spec→component maps consolidated** (2026-07-22,
      ADR-0031) — metadata/index.ts is the single source; DOCS_PRIMARY_SPECS
      + SUBCOMPONENT_PARENTS moved there declaratively, union→component is
      DERIVED from the registry (verified 24/24 identical) via the new
      tools/scripts/lib/component-map.js reader; the three consumer scripts
      read centrally, adding a component now touches one file.
- [x] **eslint + vitest executors migrated to inferred targets**
      (2026-07-22, `convert-to-inferred` for both). Note: the inferred lint
      target also lints `.storybook/` — the addon-installed check needed
      `packageJsonLocation` pointed at the root package.json. Still
      deprecated (lower urgency): `nxViteTsPaths`, `nxCopyAssetsPlugin`
      (Vite plugins), `@nx/jest:jest` (the two scaffolding-tool projects).
- [x] **jsx-a11y/aria-role warnings resolved** (2026-07-22) —
      `ignoreNonDOM: true` keeps the check for real DOM elements and skips
      custom-component props like `<AtlChatMessage role="user">`.
- [ ] **Breaking batch (collect, ship together)**: AtlChatMessageSpec
      `role` → `messageRole` across all three frameworks (removes the
      ARIA-name collision for good).
- [x] **astro-og-canvas: the TODO was stale** (2026-07-22) — the
      OGImageRoute at docs/src/pages/og/[...slug].ts already exists and
      BaseLayout wires per-page og:image URLs; removed the outdated
      config comment.
- [x] ~~**AtlOption still unstyled** (documented in ADR-0028)~~ — closed 2026-08-27.
      `atl-option.css` now carries the row recipe (`--ui-row-height-sm`, 40px) plus the
      hover / active / selected / disabled states the component had been computing and not
      rendering, and `check:geometry` measures it via an `only: ['angular']` entry.
      **Note for the record:** this was rediscovered while correcting the AtlSelect artboard
      and initially reported as a new find — it had been tracked here and in ADR-0028 since
      the rename. Reading the open list first would have saved the rediscovery.
- [x] **`check:parity` activated & populated** — added to `check:all`;
      27/29 masters now carry a parity record (scores 0.67–1.0, recorded
      2026-07-22 via figma_check_design_parity). AtlToast/AtlCodeBlock are
      untrackable by design (no spec interface — same exemption as the
      check:figma spec-interface allowlist); their MAP warnings are
      non-blocking. Low scores worth a look someday: Textarea 0.67,
      Combobox 0.72, Input 0.72, Checkbox 0.73, Select 0.74 — mostly the
      parity tool not matching Figma #suffix property ids, partly real
      code-only props with no Figma axis.
- [x] **`check:figma` activated in `check:all`** (2026-07-22) — the 77
      findings were resolved: code-only spec axes allowlisted with
      rationale (Input.type, Avatar.status, Table.align,
      Chat.status/messageRole, Toast/CodeBlock spec-interface), stale
      variantMatrix vocab aligned to the Figma axes (Select/Combobox),
      Pagination's illustrative `page` axis renamed to `position`,
      ~2750 token bindings set (colors to UI/Component tier, radius/
      spacing to the primitive scale), primitive radius values pulled
      onto the code scale (r-md 12→10, r-lg 16→14, r-xl 28→20),
      off-scale spacings snapped to the 4px grid, auto-layout enabled on
      Radio/Combobox/AvatarGroup/Toggle frames, and 28 broken
      lineHeight-as-pixels text nodes (1.25px!) repaired. Gate green:
      0 blocker / 0 critical / 3 non-blocking warnings.
- [x] ~~**Figma Toast is designed DARK, code renders LIGHT**~~ — closed 2026-08-28, and
      the answer was already in this file: the 2026-07-22 token-sync entry below records
      *"Toast resolved: the dark drawing WAS the dark rendering — now bound to
      surface-raised/text and correct in both modes."* Verified: `allowlists.js` carries no
      Toast fill exemption, only `toast:variant` (about the imperative default). Two entries
      in the same file disagreed for five weeks because nobody re-read the older one.
- [x] **Figma↔Code token sync landed** (2026-07-22) — new "Library
      Tokens" collection (78 variables, Light+Dark, scoped, 6 in-collection
      aliases) generated 1:1 from tokens.css via
      tools/scripts/gen-figma-library-tokens.mjs; 4398 master bindings
      migrated onto it (including ~3500 that pointed at ZOMBIE variables —
      deleted-but-referenced remnants of the old UI-Tokens structure).
      Component Tokens re-aliased onto the library tier; the docs-brand
      collection renamed to "Docs Brand Tokens"; snapshot/gate now treat
      "Library Tokens" as the semantic tier. Library dark mode previews
      correctly for the first time (verified Button/Input screenshots
      against the code's dark values). Toast resolved: the dark drawing
      WAS the dark rendering — now bound to surface-raised/text and
      correct in both modes; Badge-default's dark pill fixed the same way.
      Follow-ups: typography tokens exist as variables but text nodes are
      not yet bound (audit finding 6); docs-brand collection still holds
      raw literals (finding 5); UI-Tokens zombie cleanup happened
      implicitly (nothing references them anymore).

## Figma workspace — remaining audit items after the Library-Tokens landing (2026-07-22)

- [x] Scopes on the legacy collections (audit finding 4) — 116 variables
      across Docs Brand/Primitive/Effects Tokens scoped by name pattern
      (Library Tokens was scoped at creation).
- [x] Cover page (finding 9) — added 📕 Cover with version band, update
      date, and the two-token-system note.
- [x] **Typography bindings** (finding 6, 2026-07-22) — 648 text nodes
      bound to `font-size/*` (98%; 13 off-scale mockup sizes 9/13/15/26px
      left literal). Deliberately NOT bound: `line-height/*` (Figma binds
      FLOAT as px, the code's 1.25/1.5 are factors — binding would collapse
      text boxes, same bug class as the lineHeight-as-pixels repair) and
      `font/family` (token holds a CSS fallback stack, not a Figma family
      name). `font-weight/*` is not bindable in Figma (fontStyle is a
      string).
- [x] **Docs Brand Tokens alias pass** (finding 5, 2026-07-22) — 14
      mode-values aliased onto exact Primitive steps (including per-mode
      alias-target switches like area/ki-ink Light→ki/800 / Dark→ki/200);
      64 mode-values stay deliberate literals (no exact primitive step
      exists — documented in their descriptions).
- [x] **Generator → full sync script** (2026-07-22) —
      `npm run figma:sync-tokens` (tools/scripts/figma-sync-library-tokens.mjs)
      pushes tokens.css into the Library Tokens collection: idempotent
      upsert (create/update values, scopes, aliases), float32-safe value
      comparison, orphan REPORTING without deletion (removing bound
      variables is a Breaking op). Verified idempotent: second run reports
      78 unchanged.

## Review — the row ladder, run overnight 2026-08-27

Five planned steps, all landed. `check:all` after each; at the end `run-many -t
build --skip-nx-cache`, `-t test` and `-t lint` over every project, all green,
then rebase + one push.

**What shipped.** Table cells 32/42/51 → 40/48/56, the sortable header 43 → 48,
checkbox 26 → 40, radio 32 → 40, toggle 27 → 40, accordion trigger 52 → 56. Every
component root states its own leading (20 of 29 did not). `check:geometry` grew
42 → 73 measurements, 12 → 19 boxes; `check:typeface` gained `[NO-LEADING]`.
ADR-0052 written, ADR-0041 amended. Four artboards corrected.

**Verified, not assumed.** Every box measured before and after in all three
frameworks, in headless chromium against the shipped CSS with no reset supplied.
Both new gate checks negative-tested by breaking what they exist to catch:
removing a cell's `line-height` and a root's leading each fail the gate, and
pass again on restore.

**Three things measurement contradicted.**

1. The decision record said `min-height` throughout. It is not honoured on
   `display: table-cell` — 18.5px against a 48px token — where `height` is
   defined to act as a minimum instead. Verified the cell still grows to 88.5px
   when the value wraps, so the semantics are the ones intended.
2. `* { line-height: 3 }` is the wrong probe for a row. Too strong, because a row
   may host content the app supplies and overriding its metrics is worse than the
   defect; and separately too weak, because 3 × 12–16px text fits inside a
   40–56px row without touching it — it passed a table cell whose line-height I
   had deliberately deleted. Rows now face an absolute 100px inherited leading.
3. My own scope census was wrong twice. Counting font-size rules without a
   line-height gave 148 and was the wrong question; asking the right question by
   hand then missed five components, because I accepted a leading from any rule
   mentioning `font-family` — including `.atl-input input { font-family: inherit }`.

**The unplanned find.** Angular's `<atl-option>` had no styles at all.
`atl-select.css` declares six selectors and none for an option; the rows live in
a separate component that declared none of its own, and emulated encapsulation
stops a parent's stylesheet reaching a child's template. `is-selected`,
`is-active` and `is-disabled` all rendered identically — keyboard navigation moved
a highlight nobody could see. Fixed, on the row ladder, and gated: `check:geometry`
entries can now declare `only: ['angular']`, because the native-vs-custom
divergence is real and not worth designing away.

**The weakest point.** The row/control split is now a judgement each new box has to
make, and nothing enforces which one applies — the gate checks that a box matches
the ladder it *claims*, not that it claims the right one. A row entered as a
control would pass at a wrong-but-consistent height. Breadcrumbs, the four headers,
the pagination button and the stepper circle sit outside both ladders by decision,
and that exclusion list lives in prose in ADR-0052, not in code.

**Also worth knowing.** My measuring harness produced wrong Angular numbers twice
before it produced right ones, and both times they looked plausible. `check:geometry`
had a latent form of the same bug — hostifying per directory rather than per
stylesheet — which was harmless only until `select/` held two components. Lessons in
`tasks/lessons.md`.

## Review — the type nobody was measuring, 2026-08-28

Three agents built in parallel (the snapshot capture, `check:typeface`, `check:figma`),
three skeptics re-derived each independently, and this pass fixed what they found. Nothing
in Figma was mutated at any point: every figure comes from read-only queries and from
`npm run figma:snapshot`. ADR-0080 written; ADR-0078 and ADR-0079 amended in place, because
both were accepted the same morning and both carried a claim the review disproved.

**What shipped.** `check:figma` measures the root type of three form fields for the first
time — `font-size: inherit` produced a `null` that fed a `!== null` guard, so the comparison
had never run once since it was written — and type gets its own cascade table instead of
borrowing the paint table's exclusion list. Four per-TEXT-node checks and `[NO-SIZE]` in
`check:typeface`, all five ratcheted: 206 AUTO leadings, 212 wrong-collection sizes, 257
unstyled nodes, 4 detached overrides, 8 root-type divergences, 15 prose roots with no size.
`tools/figma/text-nodes.json` is new — 566 nodes, 277 records, the family, weight, style
binding and size-variable collection that were captured nowhere before.

**Verified, not assumed.** Every check was proven by breaking what it exists to catch, with
real edits to real files, and restored: a wrong `--ui-font-size` token on `.atl-input` (dead
before the repair at exit 0, blocking after), a substitution inside one master for each of
the four text checks, a `[ROOT-TYPE]` value drifting 16 → 18, `--update-baseline` run with
an unrelated `[SET-CLIPS]` blocker in the tree, a malformed baseline, a deleted `kind`,
`font-size: inherit` on a prose root. `check:all` green, exit 0, 14 pre-existing warnings —
byte-identical to the ones HEAD prints.

**Four things measurement contradicted.**

1. **A count is not a ratchet.** Both baselines first recorded a number per directory or per
   master, and both went **green on a substitution** — fix one root, break another, the
   number never moves and nothing is printed. ADR-0079 had asserted the text checks were
   immune ("presence tests, so a count is faithful"); they were the easiest to break. The
   baselines now record the findings themselves. The file went from ~100 lines to 571, which
   is the price.
2. **The Angular branch was measuring a different population.** `check:typeface` decided a
   root by name in React and Vue and by shape in Angular, so `:host(.atl-card-content)`
   counted where the byte-identical `.atl-card-content` was invisible. `card: 4` was
   `2 + 1 + 1`. Corrected, the count is 15 — three per component, one per framework. The
   symmetry is the evidence; a cross-framework number that is not comparable is worse than
   none.
3. **`font-size: inherit` was accepted as a stated size.** The check's own message defines
   the defect as "renders every line it does not size itself at the consuming page's size",
   which is precisely what `inherit` does — and the gate called it an improvement and invited
   you to lock the deferral into the baseline forever. The same file already knew better one
   axis over (`if (value === 'inherit') continue`), and the headline finding of the analysis
   is the identical `inherit` blindness in the sibling gate.
4. **The address in the generated artifact was not an address.** `text-nodes.json` told
   consumers to key on master + path + chars; 13 keys stand for two or three records, and
   `AtlButton`'s one string `Button “Button”` covers three — one clean, two carrying the
   collection debt. Now master + path + chars + size + weight, which is unique.

**The unplanned find.** `--update-baseline` — the command every ratchet message tells you to
run — called `process.exit(0)` before the report in *both* scripts, so it printed
`✓ baseline updated` over an unrelated blocker and recorded the baseline from the broken
tree. Neither builder noticed; it took a skeptic putting a real `[SET-CLIPS]` defect in the
tree and running the documented remedy.

**Found on the verification pass, after the agents were done.** The two ratchets did not
behave the same. `check:typeface` had been given a no-op guard — an update that changes
nothing prints `baseline unchanged` and does not write — and `check:figma` had not, so every
run of the documented remedy rewrote `generatedAt` and produced a diff over an unchanged
file. Fixed by comparing the would-be `checks` object against the recorded one before
writing. Verified both directions: a no-op leaves the file byte-identical, a real move
(one AUTO leading removed on AtlToast) still writes and reports `125 → 124 (−1)`.

**The weakest point.** The ratchets are only as good as the snapshot, and the snapshot is
only as good as its probe. **Twenty-one of the 43 masters run no `[ROOT-TYPE]` comparison at
all** — for fourteen the CSS resolves an expectation and the comparison is skipped only
because the Figma root has no single direct TEXT child. That is the same defect this whole
pass is named after, one level down, and it is accepted rather than fixed because warning
about all of them would be the unclearable warning ADR-0066 refuses. Two of the fourteen
(AtlMenu at 16px, AtlToast at 14px) state a size in CSS that nothing checks. Secondarily:
571 lines of baseline is a large `--update-baseline` diff to approve without reading, and
nothing forces anybody to read it.

## Open — the reverse direction of `check:dead-selectors` (2026-08-28)

ADR-0081 ships `[DEAD-SELECTOR]` (a class the CSS selects and no template can emit) and
deliberately **does not** ship its mirror, `[UNSTYLED-CLASS]` (a class a template emits and
no stylesheet selects). It was built and measured with the same extractor: **49 rows**, and
they are not one population, which is why no single rule fits them.

- **Deliberate unstyled markup hooks** — `radio-text` (react `atl-radio.tsx:56`, vue
  `atl-radio.vue:64`; Angular projects `<ng-content/>` and emits no such span, so any future
  rule on it silently skips Angular), `radio-input` / `radio-indicator`, `checkbox-label` /
  `input-label` / `textarea-label` / `toggle-label` / `select-label`, `tab-button` /
  `tab-panel` / `tab-panels`, `atl-menu-trigger-wrapper`, `accordion-header-content`.
- **Vestigial** — `is-touched` on seven Angular components, after ADR-0055 dropped `touched`
  from the contract; `is-selectable` on the Angular table; `atl-menu-item-chevron`.
  Whether these are supported consumer hooks or dead weight is undecided, and nothing in the
  ADRs says.
- **Extractor artifacts, not findings** — `status-` (because `AtlAvatarStatus` includes
  `''`), and `asc` / `desc`.

Blocking on that set would demand deleting markup ADR-0007 entitles the adapters to differ
on; warning on it is the unclearable warning ADR-0066 refuses. What would make it gateable is
deciding the middle bucket first — is a class with no rule a public hook or a leftover? —
which is an ADR, not a sweep.

Two findings the gate surfaced and left as `gap` exemptions in `DEAD_SELECTOR_EXEMPT`, both
needing a decision rather than an edit:

- `orientation-vertical` / `orientation-horizontal` are styled in all three radio-group
  stylesheets and emitted only by React, which declares `orientation` in its own props
  interface — `AtlRadioGroupSpec` has no such field. Promote the axis to the spec and
  implement it three times, or drop it from React and delete six rules.
- `angular:table:atl-checkbox` — `atl-table.css:157` centres the select cell via
  `.atl-tr-select-cell .atl-checkbox label`, but Angular renders the child as the element
  `<atl-checkbox>` while React and Vue emit `atl-checkbox` as a class. Give the Angular host
  the class hook, or select the element.

**The state classes are not one population, and one slice is a contract question.** Filing
all 49 as "unstyled markup hooks" undersells it. A cross-framework comparison of `is-*`
emission found `is-checked` emitted by Angular's and React's checkbox and not Vue's,
`is-open` by Angular's and React's dialog and not Vue's, and `is-active` / `is-open` /
`is-selected` by Angular's select alone. Nothing selects any of them, so the gate is right
to be green — but a consumer writing `.atl-checkbox.is-checked` gets three different answers
from three adapters. That is the Vue toggle's defect pointed the other way, with the CSS not
yet written. The decision to take first: **are the `is-*` state classes public contract or
private implementation?** If public, they belong in `libs/spec` and all three adapters emit
them unconditionally; if private, the gate is complete as it stands and the divergence is
free. Nothing in the ADRs says, and `[UNSTYLED-CLASS]` cannot be designed until it does.

## Open — parity drift, after ADR-0082 (2026-08-28)

- [x] ~~**Ten parity records are owed a bridge-backed re-verify**~~ — done 2026-08-28, in the
      session that made the ADR-0081 repair, with the bridge open. AtlInput, AtlMenu,
      AtlCheckbox, AtlToggle, AtlTextarea, AtlRadioGroup, AtlRadio, AtlPagination,
      AtlCombobox, AtlMenuItem: `figma_check_design_parity` per master against a `codeSpec`
      read from the source, then `parity:record`. All ten re-recorded; `npm run check:parity`
      green again. **The verify was not a formality** — it returned twenty divergences, and
      what they are is the section below. A parity stamp says "verified after the files last
      changed" (ADR-0064), not "the two sides agree" — but recording without writing the
      divergences down would have buried fifteen findings.
- [ ] **`inputsHash` cannot tell a rendered file from a test file.**
      `lib/parity-inputs.js` `inputFiles()` walks *every* file under
      `libs/{angular,react,vue}/src/lib/<module>/`, so appending a comment to
      `atl-button.spec.tsx` turns AtlButton into a DRIFT finding — proven, then reverted.
      ADR-0024 §2 describes the set as "implementation, CSS, story, and the component-local
      spec", and a `*.spec.tsx` is none of those. Narrowing it needs a migration, which is
      why it is a task and not a patch: changing the hash function invalidates all 37 records
      at once, so each record's hash has to be recomputed **at its own `verifiedSha`** (old
      definition matching there proves the record was valid; the new definition at that sha
      is then the equivalent) before the current value means anything. Worth doing when
      somebody is next in this file; it clears none of the ten above.

## Open — what the ten-master parity re-verify found (2026-08-28)

Three agents re-ran `figma_check_design_parity` over the ten masters, each against a
`codeSpec` read from the source, and a fourth re-ran the three most consequential itself.
Twenty divergences. The score is deliberately ignored — ADR-0024's amendment records three
runs on one commit returning 70, 52 and 83 — so what follows is the discrepancy list, judged
one item at a time. Everything here is **Figma-side or gate-side**; nothing found argues the
code is wrong, except where said.

**Four gate blind spots, each of which is why one of the groups below went unseen.**

- [ ] **`[ROOT-BOX]`'s gap comparison is unreachable for the four form-row masters.** It sits
      at `check-figma.js:1230`, *inside* `for (const entry of ROOT_PAINT)`, and AtlCheckbox,
      AtlToggle, AtlRadio and AtlRadioGroup are all excluded from `ROOT_PAINT` for the paint
      reason ADR-0079 split type out of. All four bind `spacing/2` (8px) as the root
      itemSpacing while all three stylesheets state `gap: var(--ui-spacing-3)` = 12px. Same
      shape as ADR-0079: an exclusion justified on one axis silently taking another with it.
- [ ] **`[LAYER-PAINT]` never compares a stroke colour when the CSS border is transparent.**
      The layer border block reads `if (!/transparent|none/.test(border)) wantStroke = …`, so
      for `.page-btn { border: var(--ui-border-width) solid transparent }` `wantStroke` stays
      `undefined` and the guard below skips. Six visible `color/border` strokes on
      AtlPagination's page buttons pass because of it. A transparent border is a *declared*
      value, not a missing one — the gate should compare it and expect no paint.
- [ ] **AtlMenu's `ROOT_PAINT` entry has no `{variant}` template** (`check-figma.js:598`,
      `cascade: ['.atl-menu']`), though the mechanism exists and other entries use it. So
      `variant=compact` is compared against the *base* rule's 8px block padding and passes,
      while the rule that actually applies, `.atl-menu.variant-compact`, says 4px.
- [ ] **`AtlRadioGroup`'s parity record hashes the wrong directory — verified by hand.**
      `COMPONENT_METADATA_REGISTRY` maps `AtlRadioGroupSpec → 'radio'`
      (`libs/spec/src/metadata/index.ts:43`), so `computeInputsHash('radio')` backs the
      record. Its `inputs` list contains **no** `radio-group/` path and its `inputsHash` is
      **byte-identical** to AtlRadio's (`sha256:9d625d0c…`, checked after today's re-record).
      Every change under `libs/*/src/lib/radio-group/` is invisible to the gate, including
      today's. Two masters cannot share one hash and both mean something.

**The form-row masters never moved to the row ladder.**

- [ ] **AtlToggle and AtlCheckbox hug at 24px and AtlRadio at 28px (4 + 20 + 4), against a
      code row of `--ui-row-height-sm` = 40px.** ADR-0052's review records the *code* side of
      exactly this — "checkbox 26 → 40, radio 32 → 40, toggle 27 → 40" — and its final
      consequence records only that the row ladder has no Figma Variables yet. That the
      masters were never moved is recorded nowhere, and nothing measures it: `check:geometry`
      is code-only and `[ROOT-BOX]` cannot reach these four (above). AtlRadio also pads 4/4
      (`spacing/1`) where the CSS states `padding-block: 0` and expresses the inset as a
      `min-height` — the same fact seen from the other side.

**Three masters state invalid by hue alone, which ADR-0055 forbids.**

- [ ] **AtlInput, AtlTextarea and AtlCombobox have no non-colour invalid indicator in Figma.**
      `iconInstanceNames` is empty for the first two; AtlCombobox's is
      `[chevron-down, chevron-up, check]` with no `danger`. AtlInput's `state=invalid`
      (129:29) holds three children — `_readonly-surface`, the TEXT node, `_disabled-overlay`
      — and reddens the root stroke. ADR-0055 made the `AtlIcon danger` indicator mandatory
      in all four fields for WCAG 1.4.1, the code carries it in all three frameworks, and
      **AtlInput's own master description already claims it** ("carried by an AtlIcon danger
      inside the field as well as by the border colour"). `[BOOL-INERT]` stays green for
      AtlCombobox because `invalid` does toggle a layer — it just toggles half the treatment.
      Placing it became possible with the Icon masters of ADR-0057.
- [ ] **ADR-0055's "nothing moves when the state flips" does not hold for two of the four.**
      `.atl-input` and `.atl-textarea` change `padding-right` 1rem → 2.25rem with the invalid
      state, so the text box narrows by 20px when it flips — identical in all three
      frameworks. The ADR states the space is reserved unconditionally and says it was
      measured; that holds for AtlSelect and AtlCombobox, whose 56px inline-end slot is
      unconditional, and not for these two. Either reserve it here too, or correct the ADR.

**AtlTextarea's master disagrees with itself.**

- [ ] **`radius/md` (10px) on `state=default` and `radius/sm` (8px) on the other four**, while
      no CSS rule changes the radius. Plus: the hover variant's root stroke is an **unbound
      RAW colour** — the only raw paint on any of the three field masters, the class ADR-0061
      repaired for 34 `_invalid-border` rectangles — and the invalid variant binds
      `color/danger` where AtlInput binds `color/input-border-invalid` and the CSS names the
      latter. Nothing renders differently for the last one
      (`--ui-color-input-border-invalid: var(--ui-color-danger)`), so it is naming drift, but
      "bound is not the same as bound correctly" (ADR-0060) is precisely what `[ROOT-PAINT]`
      exists to catch and it cannot see any of these: it compares `state=default` only and
      warns that it skipped the other four.

**AtlCombobox's panel and AtlPagination's buttons.**

- [ ] **The combobox master stacks its panel 4px below the field; the code uses 8px.** Root
      auto-layout gap 4, bound `spacing/1`, against `top: calc(100% + var(--ui-spacing-2))`
      and `.errors { margin-top: var(--ui-spacing-2) }` in all three. Same layer, four more:
      fill `color/surface` (#ffffff) vs `--ui-color-surface-raised` (#f8fafc), radius
      `radius/sm` (8px) vs `--ui-radius-md` (10px), padding 4px on four sides vs 8px block /
      0 inline, and a 4px row gap the CSS does not have. The panel exists only in
      `state=open`, which is the wholesale skip already recorded above for type — these are
      the paint deltas behind the same skip, recorded nowhere.
- [ ] **AtlPagination: four divergences on the page buttons.** Six of seven draw a visible 1px
      `color/border` stroke where `.page-btn` paints a *transparent* border (which exists to
      reserve the box so `.is-active`'s `border-color` does not shift layout). Number text is
      `color/text-muted` (#475569) against `--ui-color-text` (#0f172a) — invisible to
      `[LAYER-PAINT]`, which compares the named FRAME while the colour lives on the TEXT
      child. Inactive numbers are Regular 400 against `--ui-font-weight-medium` (500); the
      current page is Medium 500 against `--ui-font-weight-semibold` (600).
- [ ] **ADR-0063's page-button fix was half-applied, and its record overstates it.** ADR-0063
      §4 and `tasks/todo.md` both say the 33 divergences were found *and fixed*, naming "the
      page buttons painted a fill and a border where `.page-btn` sets both `transparent`".
      The fill was removed from the six inactive buttons; the stroke was not. Nothing has
      contradicted the record since, because the gate cannot see it (blind spot above).

**Three adapters, three answers — the Vue-toggle defect pointed at other axes.**

- [ ] **Radio groups lay out in a row in Angular and Vue and in a column in React.**
      `.atl-radio-group` / `:host` is `display: flex` with no `flex-direction`, so the default
      is `row`; `flex-direction: column` lives only under `.orientation-vertical`, which only
      React emits (`atl-radio-group.tsx:148`) and whose default in React's own props
      interface is `'vertical'`. A three-option group therefore renders stacked in React and
      side-by-side in the other two. This is the rendered consequence of the
      `orientation-*` `[GAP]` exemption recorded above — that entry frames it as an
      undecided axis; it is also a live divergence today.
- [ ] **Vue's checkbox and toggle still lack `aria-required`.** Angular sets
      `[attr.aria-required]` and no native `required`; React sets both; Vue sets only the
      native `:required` (`atl-checkbox.vue:64`, `atl-toggle.vue:48`). The same bug was found
      and fixed for `atl-input.vue` and recorded in this file; the sibling controls were not
      swept at the time.
- [ ] **AtlRadioGroup's error region is three shapes in ARIA**, even though the class shape
      now matches. Angular: `<div class=errors [id] aria-live=polite>` plus
      `aria-describedby` on the host. React: `role=alert aria-live=polite`, no id, no
      describedby. Vue: `role=alert`, no `aria-live`, no id, no describedby. The element and
      class contract holds; the announcement contract does not.
- [ ] **The three adapters disagree on the menu trigger-to-panel offset, and the ADR-0081
      deletion removed the last place the intent was written.** React and Vue position the
      panel at `top: calc(100% + var(--ui-spacing-2))` — 8px below the trigger. Angular's
      `AtlMenuTrigger` passes no position strategy or offset to `CdkMenuTrigger`, so the CDK
      default applies. Deleting Angular's inert `.atl-menu-panel` rule was correct on its own
      terms (no such element is ever rendered), but it also deleted the only statement of
      what the offset should be. Give the Angular trigger an explicit offset matching the
      other two, or record that the CDK default is the intended answer.

## Open — one semver-major type change, unreleased (2026-08-28)

- [ ] **`AtlRadioGroupContext.invalid` became required.** `libs/angular/src/lib/radio-group/
      atl-radio-group.token.ts` gains `invalid: Signal<boolean>` with no `?`, and the
      interface is exported from the public barrel (`libs/angular/src/index.ts:19`). The only
      in-repo implementor is `AtlRadioGroup`, which already declared `invalid` and needed no
      change — but any outside implementor of the interface breaks. It is the right shape
      (React's and Vue's contexts both require it, and the Angular radio could not read its
      group's invalid state without it), and it is a **breaking change to a published type**
      that needs a semver-major note. Nothing in the diff or the ADRs said so until now.

## Review — the join nobody was checking, 2026-08-28 (second pass)

A builder shipped `check:dead-selectors` and repaired fourteen dead rules; two skeptics
re-derived the whole thing independently; this pass fixed what they found and recorded the
two decisions the work forced. ADR-0082 written, ADR-0081 amended in place (it was accepted
the same morning and carried three claims the review disproved), ADR-0024's §4 annotated.

**What shipped.** `check:parity` splits into two modes: the direct invocation still BLOCKS
on drift, and `check:all` runs `check:parity:report` (`--report`), which prints the banner,
every drifted component and the exact `parity:record` command, and exits 0. The
`check-dead-selectors` cross-directory rescue is rebuilt on the **render relation** — a
class is live from another directory only when one renders the other — which closes a false
positive and a false negative at once. Vue's checkbox and toggle finally associate their
error text (`useId()` + `aria-describedby`), matching what all three Angular and all three
React equivalents already did and what Vue's own input and textarea already did.
`@vue/compiler-sfc` is recorded in `package-lock.json`. The PR template names the one place
the parity blocker is now enforced.

**Verified, not assumed.** `npm run check:all` → exit 0 (29 gates; `check:dead-selectors`
5 GAP warnings over 858 selectors in 89 stylesheets, `check:parity:report` 10 DRIFT
warnings, `check:figma` 14 warnings — the last two byte-comparable to what HEAD prints).
`npx nx run-many -t test --projects=angular,react,vue --skip-nx-cache` → exit 0, 1351 tests
(angular 584, react 439, vue 328). `npx nx run-many -t lint` on the same three → exit 0.
Both gate changes proven by probe and reverted: `.probe-fp-child` styled in
`react/icon/atl-icon.css` and emitted from `atl-input.tsx` was a blocker before and passes
after; `.atl-menu .atl-avatar` appended to `react/menu/atl-menu.css` passed before and is a
blocker after. Real defects still caught: reverting the Vue toggle's `is-checked` binding
and re-breaking the combobox rename each named the exact file and line. `// probe` appended
to `react/button/atl-button.spec.tsx` made AtlButton a DRIFT blocker, then did not.

**Four things measurement contradicted.**

1. **The "only cross-directory rescue" was a tautology.** It asked whether a class is
   another directory's root *and* whether that directory emits it — but a component always
   emits its own root, so the second clause is never false, and every `.atl-*` root was live
   in every directory of its framework. ADR-0081 called it "exactly three cases": that is
   how many it fires on, not how many it can forgive, which is about forty per framework.
2. **The false-positive direction was worse than the false-negative one.** A class a parent
   puts on a child component's element, styled in the child's own sheet, was a **blocker on
   correct markup**, and its remediation text told the author to delete a live rule. It
   fires on nothing here only because all 33 such sites happen to style the hook in the
   emitting component's sheet. Running the gate could never have found it; a constructed
   probe did. A new blocker needs its false positives probed as hard as its false negatives.
3. **`check:parity`'s promotion into `check:all` has never been load-bearing.** Its own
   header still said "Not in `check:all`/CI/pre-push" five weeks after `b8935c8` put it
   there. Of the last four commits touching a component directory, three re-recorded parity
   and the fourth (`64277c3`, 31 libs files, no `parity.json`) passed only because
   `meta.redesignPhase.active` was `true` that day. The switch closed 2026-08-27; this is
   the first change since that could not open the bridge, and it went straight to ten
   unclearable blockers.
4. **The Vue toggle did not regress — it was born broken.** `892ac6f` (2026-03-21, "Add
   vue") shipped `.llm-toggle.is-checked .track` in the stylesheet and a template binding
   only `is-invalid` and `is-disabled`. There is no commit where they agreed. 0.0.5 went out
   two days later and every Vue release through `v0.2.9` shipped a switch that cannot show
   its on state — 160 days — with the unit tests green the whole time, because they asserted
   the native input's `checked` property and never the class the paint hangs on.

**The unplanned find.** `inputsHash` binds every file under the component directory,
`*.spec.*` included, so a unit test can invalidate a design verification for a change the
design cannot see. That is what turned a CSS repair plus its tests into ten DRIFT blockers,
and it is the reason ADR-0082 is a decision about the chain rather than a patch to the hash:
narrowing the hash invalidates all 37 records at once and needs a migration first.

**The weakest point.** ADR-0082 buys a green chain by removing the only automated teeth
design drift had, and replaces them with a line in a pull-request template. A checklist is
not a gate — this repo's own history is a list of things that were true until nobody
checked them — and the compensating control is weaker than what it replaces. The honest
defence is that the teeth it removes could not bite: no CI runner can clear a DRIFT blocker,
so what was lost was a red build, not an enforcement. The real fix is a parity check that
runs without the bridge, and nothing here moves toward one. Secondarily: the render relation
is read from tag names in source text, so a directory that merely *mentions* `<AtlIcon>` in
a comment counts as rendering it — the forgiving direction, unmeasured beyond "the finding
count did not move".

## Open — Schulung: after the B1–B4 repairs (2026-08-29)

The four blockers from tasks/schulung-review-2026-08-28.md §3 are fixed in the
tree (struck through there, each with its fix note).

- [x] ~~**The deploy was dead, and had been since 2026-08-26**~~ — found and fixed
      2026-08-29. The worker fix could not ship because *every* Cloudflare build had
      been failing for three days: the Angular Storybook build died with seven
      `MISSING_EXPORT` errors after `cbef32b` pruned `@angular/animations`
      ("deprecated upstream, zero source imports, optional peer" — all true of this
      repo's source, none true of `@storybook/angular`, whose client dynamic-imports
      `@angular/platform-browser/animations` in a try/catch to warn about
      `BrowserAnimationsModule`). The try/catch protects the runtime and does nothing
      for the build: Rollup walks the dynamic import anyway. Stubbed to an empty
      module in `libs/angular/.storybook/main.ts`; reinstalling the deprecated package
      was rejected. Filtering the entry out of `optimizeDeps.include` — where
      `@analogjs/storybook-angular` also hardcodes it — was measured and does nothing,
      because this is a build-graph import, not pre-bundling.
- [x] ~~**Nothing in the repo could see it**~~ — fixed in the same pass. `build-storybook`
      is an nx target on all three libs and CI ran `-t build` only, so the three
      Storybook builds existed nowhere but the `wrangler.jsonc` build command, whose
      failure surfaces in a Cloudflare log nobody reads. Three days of green CI over a
      dead deploy, and the live site served pre-08-26 content the whole time — which is
      why yesterday's B1–B4 kata fixes never reached a participant. CI now runs
      `-t build,build-storybook`. **This is the reusable lesson, and it is ADR-0080's
      one more time: a build the deploy depends on has to run where somebody sees it
      break.** Worth an ADR if the pattern recurs a third time.
- [x] ~~**Re-verify against production once the build lands**~~ — done 2026-08-29.
      `npm run preflight` in this clone: "All hard checks passed · 14 ok, 0 warning(s)",
      including real JSON-RPC probes of all three hosted storybook endpoints at HTTP 200.
      Live: `list-all-documentation` on the **Angular** endpoint returns 29 components +
      4 MDX docs, and `get-documentation('components-inputs-atltoggle')` returns real
      props. ADR-0083 holds in production.
- [ ] **`@angular/animations` is not the only optional peer a prune could take.** The
      dep-prune reasoning that failed here — "zero source imports" — is sound about our
      code and blind to what a dev-dependency reaches for at build time. No gate checks
      that. Cheap partial answer now that CI builds Storybook: a prune that breaks a
      builder fails the PR. The general case (a tool's guarded dynamic import) has no
      check and probably does not need one; recorded so the next prune's author reads
      this before trusting "zero source imports".


## Open — Schulung: after the M1–M15 pass (2026-08-29)

All 4 blockers and all 15 majors from `tasks/schulung-review-2026-08-28.md` are closed
(three of them *overtaken* rather than fixed — M3, M4, M7 — and recorded that way there,
along with eight defects the repair pass itself introduced or uncovered). Flows 1–7 are
repaired. `npm run check:all` exit 0, `npx nx build docs` 59 pages.

One decision came out of it: **ADR-0084 — two environments, one canonical per audience**
(clone for the two-day cohort, scaffold for the self-serve reader, both documented, an
explicit branch on the pages that serve both). Nothing enforces it; see its Consequences.

### Blocked on a Figma write

- [ ] **The Figma-side Instructions text overstates the token binding.** Node `703:333`
      on 🛠️ Workshop-Templates says "every fill, padding, and radius is bound to a
      UI-Tokens variable". Measured live: `Avatar / Starter` (`703:355`) binds only
      `fills` and `strokes` — no padding, no radius. The four other frames do bind all of
      it. The German docs prose was softened to match reality; the Figma text still
      carries the original claim, and the two now disagree. Either soften the Figma text
      or bind Avatar's corner radius and revert the prose. **A Figma write — out of scope
      for the docs pass that found it.**

### Gate gaps — known, cheap, deliberately not built mid-pass

- [ ] **Nothing cross-checks `snapshot.json.uiTokens`.** Its only guard asserts the prefix
      counts sum to the total, which a *truncated* list satisfies — the pre-fix snapshot
      held 50 names summing cleanly to 50, and the /figma census read wrong-but-consistent
      for as long as nobody looked. `docs/src/lib/figma-snapshot.ts`'s comment ("neither
      number can rot again once it is derived from the snapshot") claims more than the code
      enforces. Cheapest close: assert every `color/*`, `spacing/*`, `radius/*` name has a
      matching `--ui-*` family in `tokens.css`, and ratchet the total the way ADR-0078
      already does. Then run one real `npm run figma:snapshot` through the new paging loop
      — it has still never been exercised end-to-end against live Figma.
- [ ] **The two `preflight.mjs` copies are in sync by hand.** Byte-identical today
      (re-verified), gated by nothing. n14's second half is still open.
- [ ] **Nothing stops a new page hardcoding `workshop-<fw>` again** with no monorepo branch
      beside it — the exact defect ADR-0084 closes by convention. The check is possible and
      was judged not worth its false-positive rate; recorded as the option, not built.

### Unverified — flagged so it is not mistaken for checked

- [ ] **The Vue mount hint has never been confirmed against a real scaffold.**
      `first-component.astro` and `tutorial.astro` both tell a Vue participant to edit
      `workshop-vue/src/views/HomeView.vue` and replace `<NxWelcome />`. `@nx/vue` is not
      in `node_modules`, so this was never read from generator source — unlike the Angular
      and React hints, which were. Scaffold one Vue workspace before the first workshop.
- [ ] **`workshop/` is untracked and unignored.** The whole M12 fix — five files, ~700
      lines — is not in git, and the agenda links to those files by relative path. Commit
      it.

### Still open from the review — unchanged by this pass

- [x] ~~**Minors:** n2, n4, n6, n7, n10, n12~~ — closed in the following pass, together
      with n3, n9, n15 and n16. See the next section for what that pass left behind.
      The gate-failure troubleshooting entry n5 asked for is **still not written**.
- [x] ~~**Presentation debt p3, p4, p5**~~ — closed in the following pass.
- [ ] **Presentation debt p1 and p2 stay open, and no agent pass can close them.** Both
      need real screen captures: p1 wants photographs of Figma's plugin menu, token dialog
      and inspect panel to replace the placeholder SVGs (and, interim, the retired
      `#00BEBE` in `figma.astro:335` fixed); p2 wants a terminal capture of
      `npm run preflight` from a genuinely scaffolded single-framework workspace, because
      the mock's "3 storybook rows / 15 ok" is a run the current script cannot produce.
      n14's prerequisite for p2 is met (the two copies are byte-identical); the run is not.
- [ ] **Claude Design participant katas** stay blocked on the widened per-seat test
      (§2.4 item 1 of the review). Unchanged and deliberately not shipped. **2026-08-29:**
      the two *unblocked* halves shipped around them and did not weaken the blocker — the
      trainer demo is trainer-machine-only precisely because the seat question is open, and
      the agenda says so in the demo's first sentence.
- [x] ~~**Publish the Claude Design track — chapter + trainer demo**~~ (done 2026-08-29,
      ADR-0032 executed, no new decision). `docs/src/pages/claude-design.astro` is the
      Explanation chapter ADR-0032 called for: off the workshop track, beside
      `/design-principles`, `workshop-track.ts` untouched on purpose. Tag 1 Block 04 gained
      the ~12-min "Drei Richtungen" trainer demo in both German files, funded inside the
      block without moving its boundary. The fence runs in the honest direction — hardcode a
      colour in an artboard, `check:artboard-palette` stays **green**, then redden the
      generated sheet and `git checkout` it back.
- [x] ~~**Prerequisites 2 and 3 of review §2.4**~~ (closed 2026-08-29). The
      `atelier-design` skill's token sheet now declares Instrument Sans / Instrument Serif /
      JetBrains Mono and is generated by `sync-tokens.mjs`; `tasks/claude-design-prompt.md`
      reads 29 in both places. Prerequisites 1, 4, 5, 6 and 7 all gate katas and are untouched.


## Open — Schulung: after the minors + presentation-debt pass (2026-08-29)

With this pass `tasks/schulung-review-2026-08-28.md` is **fully closed except p1 and p2**:
4/4 blockers, 15/15 majors, 16/16 minors, and 3 of 5 presentation-debt items. Three more
majors surfaced during the pass and were fixed with it (r9–r11 in that file): the German
curriculum still taught 10.4 as the current release, /workshop's post-setup aside never
linked /design-to-code after the track reorder, and install.astro's new intro over-claimed
what the scaffold writes into `src/styles.css`. Two of the closed minors were closed
*against* the audit rather than with it — n4's and n9's Fix columns were wrong as written,
and following either would have shipped a false instruction; both rows now say so.

Gates: `npm run check:all` exit 0, `npx nx build docs` exit 0 (60 pages),
`npx nx run-many -t test,lint --projects=angular,react,vue` exit 0.

**No ADR was written for this pass**, deliberately: the n4 experiment changed no decision.
Seven Storybook builds on the pinned 10.5.10 confirmed that Angular and Vue emit no
`components.json` under either spelling of the flag and that React emits one even with the
`features` block deleted — so ADR-0083's React-manifest substitution remains necessary and
unchanged, and the config edit is a correctness fix, not a decision. ADR-0084 is untouched.

### Left behind by this pass

- [ ] **No gate typechecks the three `libs/*/.storybook/tsconfig.json` projects.** This is
      the surface that let n4's misspelled `experimentalComponentManifest` survive, and it
      still hides at least one real error: `npx tsc -p libs/react/.storybook/tsconfig.json
      --noEmit` → `atl-stepper.stories.tsx(88,35): TS2322` ("vertical" not assignable to
      "horizontal"). Invisible to `npm run check:all` and to `nx run-many -t test,lint`,
      both green. Close it by adding a typecheck target over the three `.storybook`
      projects — and budget for the story-file errors it surfaces, which is why it was not
      done inside a verification pass.
- [ ] **Decide whether the Netlify deploy target is dead.** `netlify/` + `netlify.toml`
      carry a second, divergent implementation of everything the Cloudflare worker does —
      its `markdown-negotiation` edge function converts HTML to Markdown with regexes at
      the edge and sets the `x-markdown-tokens` header that finding n3 just deleted from
      the docs as phantom, and `netlify/functions/storybook-*-mcp.mts` duplicate the MCP
      endpoints. Production is Cloudflare (`wrangler.jsonc`), no workflow under `.github/`
      references the Netlify config, and no ADR mentions it. Both files now open with a
      `NETLIFY-ONLY` header so the deleted claim cannot be re-derived from them, but the
      real answer is delete-or-keep, which is a deployment decision and wants an ADR line
      either way.
- [ ] **The kata and the tutorial still build the same Figma artifact** (n15's second
      half). `tools/figma/snapshot.json`'s `referencedNodes` holds exactly one
      Settings / Card (`936:2954`) beside four `*/Starter` frames, so giving the kata its
      own target is a **Figma write** — the same class of work as the `703:333` Instructions
      text above. Both pages now say plainly that it is the same frame and that the kata is
      a timed second lap, which is the honest version of the current state.
- [ ] **`libs/create-workspace`'s token-vendoring comment is stale in one clause.**
      `preset.ts:108-110` justifies the vendored copy partly with "those published packages
      don't ship tokens.css" — but `libs/angular/package.json` exports
      `./styles/tokens.css` (via `ng-package.json` assets) and the built React/Vue packages
      carry `styles/tokens.css` too. Reason (b) — that editing colours inside `node_modules`
      is a bad workshop experience — carries the decision on its own. Comment-only; the
      generator's behaviour is right and `/install` now documents both paths.
