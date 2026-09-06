# Archive — 2026-07: defect batch, H1 acute fixes, Figma audit

> ## Status of this document — read first (2026-09-06)
>
> This is a **verbatim historical copy**, cut from `tasks/todo.md` during the
> 2026-09-06 restructure. Every checkbox below is **frozen**: it describes what was
> open (or done) at the time this section was written, not what is open now. Do not
> tick, strip, or otherwise edit the boxes below — the point of this archive is the
> unaltered text, for the reasoning it carries.
>
> **The live backlog is `tasks/todo.md`.** This file is the exception among the five
> archive files: the "H1 acute fixes" section below is not fully closed — it still
> carries unchecked boxes. Those still-open items were read out of this frozen copy
> and carried forward into the restructured `tasks/todo.md` (individually, or folded
> into a merge/collector there — see that file's reconciliation table for exactly
> which). They are **not** also open work here; treat every unchecked box in this
> file as historical record of what was open at the time, already accounted for
> elsewhere, not as a second copy of the live backlog.

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
      2026-08-26, ADR-0039: `check:token-tiers` scans 2654 token references across 88
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
      `check:icon-duplication` counts 25 names, identical sets — so this is gate work against a
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

