'use strict';
/**
 * Single source of truth for the gates' hand-maintained EXCEPTIONS — the
 * "yes, this really is fine" entries that would otherwise be scattered across
 * check-variants.js, check-defaults.js, and check-story-descriptions.js. Keep
 * every entry short and justified; each is re-verified when its component
 * changes. (NON_COMPONENT_SPECS is intentionally NOT here — it is spec data,
 * co-located with the metadata registry in libs/spec/src/metadata/index.ts.)
 */

/**
 * Literals that deliberately do NOT bind to the token whose value they equal, or
 * to the family their property would normally draw from. (check-token-bypass)
 *
 * Keyed `component:property:value`. Two kinds, same as the other allowlists here:
 *   kind 'design' — the value means something other than the token that shares it,
 *                   so binding would be wrong. Silent.
 *   kind 'gap'    — it should bind and has not yet. Warns on every run.
 */
const TOKEN_BYPASS_EXEMPT = {
  // 0.5 here is "half-visible because the animation is off", not "disabled". The
  // shared value is a coincidence; binding it would tie a reduced-motion fallback
  // to the disabled scale.
  'progress:opacity:0.5': {
    kind: 'design',
    why: 'reduced-motion stand-in for the indeterminate animation, unrelated to --ui-opacity-disabled',
  },
  // Graphic devices drawn with border-width, not border weights: the accent bar
  // down a toast's leading edge, and the radio's inner dot.
  'toast:border-left:4px': { kind: 'design', why: 'accent bar, not a border weight' },
  'radio:border-width:6px': { kind: 'design', why: 'draws the inner dot, not a border weight' },
  // A gutter wide enough for three digits. It equals the sm control height by
  // coincidence; line numbers are not a control.
  'code-block:min-width:2rem': { kind: 'design', why: 'line-number gutter, not a control width' },
};

/**
 * `framework:union:member` triples that intentionally have no CSS class — the
 * axis is realised by a non-class mechanism in that framework, or the member
 * is not a paint state at all. Same two kinds as the other allowlists here:
 * `design` is a closed question and stays silent; `gap` would warn on every
 * run (none needed yet — every entry below is a settled `design` call).
 * (check-variants)
 */
const VARIANT_AXIS_EXCEPTIONS = new Map([
  // Angular tooltip positions via the CDK overlay's flexible-connected
  // position strategy (inline transforms), not .position-* CSS classes.
  // React/Vue use CSS classes, so they stay enforced.
  ...['above', 'below', 'left', 'right'].map((member) => [
    `angular:AtlTooltipPosition:${member}`,
    { kind: 'design', reason: "realised via the CDK overlay's inline transforms, not a .position-* class" },
  ]),
  // AtlChatStatus.idle/.error carry no paint of their own — status-driven
  // behaviour swaps the input footer's Send button for a Stop button
  // (isStreaming in atl-chat.tsx / the Angular and Vue equivalents), it does
  // not repaint the chat surface. Only 'streaming' has a CSS rule
  // (.status-streaming) in all three frameworks; idle and error are the
  // component's resting states and legitimately have no .status-idle /
  // .status-error rule to match. Unlike AtlAvatarStatus (a genuine,
  // CSS-backed paint axis, now enforced), this union is behavioural state,
  // not a variant axis — see tasks/todo.md.
  ...['angular', 'react', 'vue'].flatMap((fw) =>
    ['idle', 'error'].map((member) => [
      `${fw}:AtlChatStatus:${member}`,
      {
        kind: 'design',
        reason:
          "AtlChatStatus drives a control swap (Send → Stop button), not paint — only 'streaming' has a " +
          "CSS rule (.status-streaming) in any framework; 'idle' and 'error' are resting states with no class " +
          'to match.',
      },
    ])
  ),
]);

/**
 * Unions whose `'default'` member is the unmodified base style (styled on the
 * component root, e.g. `.atl-table { … }`) with only non-default variants
 * getting a `.variant-<x>` modifier — so `.variant-default` legitimately does
 * not exist. (badge / toast / accordion DO style `default` explicitly and are
 * intentionally absent here, so their `default` stays enforced.) (check-variants)
 */
const DEFAULT_IS_BASE = new Set([
  'AtlTabGroupVariant',
  'AtlMenuVariant',
  'AtlProgressVariant',
  'AtlTableVariant',
]);

/**
 * `component:prop` axis props whose default is set by a non-component-prop
 * mechanism, so the default-value extraction does not apply (the values do
 * still agree — verified). (check-defaults)
 */
const DEFAULT_PROP_EXCEPTIONS = new Set([
  // Toast is imperative: the variant default lives in the show() options merge
  // (`options.variant ?? 'default'`) in React/Vue, not a component prop default.
  // All three adapters default to 'default'.
  'toast:variant',
]);

/**
 * Component dirs that intentionally have no metadata file, so the story
 * description gate skips them: toast (service + container, documented manually),
 * code-block (docs-site widget), showcase (composite docs sandbox).
 * (check-story-descriptions)
 */
const STORY_DESCRIPTION_SKIP_DIRS = new Set(['toast', 'code-block', 'showcase']);

/**
 * Builds a content-addressed key for SCAFFOLD_PORT_EXEMPT (ADR-0119): the
 * repo-relative file path, the trimmed text of the non-blank source line
 * immediately before a 6006 citation, and the trimmed text of the citing
 * line itself — not a line number.
 *
 * Two lines of context, not one, because a single citing line is not always
 * unique within a file: docs/src/pages/workshop.astro renders the exact same
 * `Port 6006 ... free` span in two different preflight-mockup panels ("the
 * successful run" and "the failed run"). What differs between them is the
 * line just above — port 4200 reads free in one panel and in-use (with a fix
 * hint) in the other — so that line is what disambiguates.
 *
 * Why content instead of `file:line`: a line number shifts on any edit above
 * it anywhere in the file, including one made by someone else entirely. That
 * turns an unrelated, purely additive edit into a false [PORT-6006] failure
 * that names the file holding the (unmoved, still-correct) citation, not the
 * file whose edit actually moved it — the citation itself never changed. A
 * content key does not have this failure mode: it keeps matching regardless
 * of how many lines move above it. It intentionally breaks when the citing
 * line or its immediate predecessor is itself edited — that is exactly the
 * case where a human should re-read the exemption, per the same
 * re-verify-on-change discipline [STALE-EXEMPTION] applies elsewhere.
 *
 * @param {string} file repo-relative path, e.g. 'docs/src/pages/workshop.astro'
 * @param {string} prevLine the non-blank line immediately above the citation
 * @param {string} line the citing line itself
 * @returns {string}
 */
function scaffoldPortKey(file, prevLine, line) {
  return `${file}\n${prevLine.trim()}\n${line.trim()}`;
}

/**
 * Lines that may cite Storybook's scaffold-only port 6006 inside
 * docs/src/pages/** (check-docs-sync's [PORT-6006]). ADR-0084 makes the
 * cloned atelier monorepo canonical for the two-day cohort — its Storybook
 * binds 4400 (angular) / 4401 (react) / 4402 (vue) and the docs app binds
 * 4300 — while 6006 belongs only to the `create-atelier-ui-workspace`
 * scaffold. A page describing the clone that still says 6006 is the exact
 * defect the ADR's 2026-09-05 amendment records.
 *
 * Keyed by content via scaffoldPortKey() (ADR-0119), not by line number —
 * see that function's doc comment for why.
 */
const SCAFFOLD_PORT_EXEMPT_ENTRIES = [
  [
    scaffoldPortKey(
      'docs/src/pages/workshop.astro',
      '<span class="pre-ok">✓</span> Port 4200<span class="pre-muted"> — free</span>',
      '<span class="pre-ok">✓</span> Port 6006<span class="pre-muted"> — free</span>',
    ),
    "Static preflight terminal mockup for the create-atelier-ui-workspace scaffold — its own Storybook binds 6006, unlike the clone's 4400/4401/4402 (ADR-0084).",
  ],
  [
    scaffoldPortKey(
      'docs/src/pages/workshop.astro',
      '<span class="pre-muted">→</span> Run <span class="pre-cmd">`lsof -ti :4200 | xargs kill`</span> (macOS/Linux)',
      '<span class="pre-ok">✓</span> Port 6006<span class="pre-muted"> — free</span>',
    ),
    'Same scaffold preflight mockup, the "failed run" tab (ADR-0084).',
  ],
  [
    scaffoldPortKey(
      'docs/src/pages/storybook.astro',
      'terminal that started it. A scaffolded workspace ships only one framework, and its Storybook',
      'binds the single port <code>6006</code>.',
    ),
    "States, by name, that a scaffolded workspace's single Storybook binds 6006 — the sentence exists to contrast it with the clone's 4400/4401/4402 (ADR-0084).",
  ],
  [
    scaffoldPortKey(
      'docs/src/pages/troubleshooting.astro',
      "id: 'port-in-use',",
      "title: 'Port 4200 / 4300 / 4400–4402 / 6006 already in use',",
    ),
    "Entry title enumerating every port a participant in EITHER environment might find stuck; 6006 is the scaffold's, named beside the clone's 4200/4300/4400–4402 (ADR-0084).",
  ],
];

// A `new Map([...])` literal silently keeps the LAST entry on a duplicate
// key — two exemptions that happen to compute the same scaffoldPortKey()
// (identical file, identical two lines of context) would drop the first one
// with no error, no warning, just one exemption quietly gone. Guard it here
// so that collision is a loud crash at require-time, not a mysteriously
// unexempted citation discovered later by a gate run.
{
  const seen = new Set();
  for (const [key] of SCAFFOLD_PORT_EXEMPT_ENTRIES) {
    if (seen.has(key)) {
      throw new Error(
        'SCAFFOLD_PORT_EXEMPT: two entries computed the same scaffoldPortKey() — same file, same ' +
          'two lines of context. The Map literal would silently keep only the later one. Add more ' +
          "distinguishing context, or merge the two entries if they're genuinely the same citation.\n" +
          `Colliding key:\n${key}`
      );
    }
    seen.add(key);
  }
}
const SCAFFOLD_PORT_EXEMPT = new Map(SCAFFOLD_PORT_EXEMPT_ENTRIES);

/**
 * `selector:check:detail` triples that the Figma conformance gate (check-figma)
 * should treat as intentional — a known, justified divergence between the Figma
 * master and the spec. Same exact-string `.has()` idiom as VARIANT_AXIS_EXCEPTIONS.
 *
 * `check` is one of: name | variant | token | autolayout | desc | root-paint |
 * root-type | root-size | layer-size. `detail` is the gate's per-finding key:
 *   name      → `<axisProp>=<value>`        (e.g. 'AtlButton:name:size=xl')
 *   variant   → comma-joined axis row       (e.g. 'AtlDialog:variant:size=full')
 *   token     → `color:<node>` | `radius:<node>` | `spacing:<node>` | `nonsemantic:<token>`
 *   autolayout→ `<node name>`
 *   desc      → 'spec-ref'
 *   root-paint/root-type → the property name (`fill` | `stroke` | `radius` | ...)
 *   root-size/layer-size → `width` | `height`
 *
 * Empty by design — the gate is meant to surface the real backlog of unbound
 * spacing/radii in the Figma library, not pre-suppress it. Add an entry only
 * when a finding is a genuine, documented false-positive. (check-figma)
 */
const FIGMA_CONFORMANCE_EXCEPTIONS = new Set([
  // AtlCardSpec.role (AtlCardRole: article | region | section) is a code-only
  // landmark prop — deliberately NOT a Figma variant axis (adding a landmark to
  // every card pollutes the page outline). The AtlCard Figma description marks it
  // "code-only: role". So the missing "role" variant axis is expected, not drift.
  'AtlCard:name:role',
  // AtlCombobox's field padding is 9px 56px 9px 16px and only ONE side can be bound:
  // 16px is --ui-spacing-4, 9px is ADR-0041's derived block padding
  // ((40 - 1.25 x 16) / 2 - 1), and 56px is a composed dimension — the inline padding
  // plus room for the chevron and clear buttons. Two of four sides have no token to
  // bind, so [TOKEN] would demand a binding that cannot exist. The values themselves
  // are checked by [LAYER-PAINT]'s box comparison against .atl-combobox-input, which
  // is the reading that matters (ADR-0077).
  'AtlCombobox:token:spacing:input',
  // The only page-level glyph that is not standing in for a drawing: the arrow in the
  // AtlAvatar caption "fallback: image\u2192initials\u2192icon" is punctuation inside
  // prose, not a pictogram a component renders (ADR-0069). Keyed on the character,
  // because a caption has no master description to write an exemption into.
  'page:glyph:\u2192',
  // Seven entries were deleted here on 2026-08-27 because [STALE-EXEMPTION] showed
  // they suppressed nothing (ADR-0068): AtlInput:name:type, AtlAvatar:name:status,
  // AtlChat:name:status, AtlChat:name:messageRole, AtlToast:name:spec-interface,
  // AtlCodeBlock:name:spec-interface and AtlCodeBlock:token:radius:Rectangle.
  // Removing all seven produced no finding. The two that carried an open DESIGN
  // question — an axis owed for AtlAvatarStatus and AtlChatStatus — moved to
  // tasks/todo.md, because an allowlist is a poor place to keep a follow-up: it is
  // read only when something fails.
  // AtlTableAlign is a per-cell prop (AtlTh/AtlTd), not a set-level visual
  // variant of the table master. Code-only.
  'AtlTable:name:align',
  // AtlOptionSpec and AtlSelectSpec share the `select` metadata module BY DESIGN:
  // `specNames: ['AtlSelectSpec', 'AtlOptionSpec']`, and DOCS_PRIMARY_SPECS records
  // that one docs entry documents one primary interface. So the module's
  // `variantMatrix` describes AtlSelect's trigger (default | filled | hover | focus |
  // open) and AtlOption's own axis is default | hover | active | selected. The
  // exemption is not a deferred fix — it is the shape of the data: nothing in
  // `ComponentMetadata` says which spec a variantMatrix is about, so the gate applies
  // it to every spec sharing the module. Giving the type that field would remove this
  // entry; it is one entry, and the type change reaches check-metadata and
  // gen-llms-txt (ADR-0066).
  'AtlOption:variant:state=filled',
  // .step-description and .step-optional are separated by `margin-top: 2px` — a raw
  // literal in the CSS, off the spacing scale, so no variable can bind it. The fix is
  // in the CSS (the off-scale spacing sweep in tasks/todo.md), not in Figma: drawing
  // 4px here to satisfy the gate would make the master diverge from the component.
  'AtlStep:token:spacing:step-text',
  // AtlButton's sm/md inline padding is a raw 0.875rem/1.125rem (14px/18px) — off
  // the 0.25rem scale itself, so no spacing/* Variable can hold it. The master is
  // NOT stale: it is bound to spacing/4 and spacing/5, the nearest steps that
  // actually exist (16/20px). Left open by ADR-0107 ("Three things this surfaced"):
  // bring the code onto the scale, or accept the off-scale value and say so.
  // Delete this entry the day that decision lands — [STALE-EXEMPTION] will flag it
  // unused the moment either happens.
  'AtlButton:root-paint:padding-off-scale',
  'AtlChat:token:radius:Rectangle',
  // The Chat drawer variant embeds a miniature APP MOCKUP (page header,
  // content blocks, dividers, message bubbles) as illustrative context.
  // Those fills are illustration, not chat chrome — exempt per node.
  'AtlChat:token:color:variant=drawer',
  'AtlChat:token:color:app-header',
  'AtlChat:token:color:app-title',
  'AtlChat:token:color:content-block-1',
  'AtlChat:token:color:content-block-2',
  'AtlChat:token:color:content-block-3',
  'AtlChat:token:color:content-block-4',
  'AtlChat:token:color:header-divider',
  'AtlChat:token:color:avatar-glyph',
  'AtlChat:token:color:drawer-title',
  'AtlChat:token:color:close-bg',
  // msg-asst-2 is the one bubble still DRAWN rather than instanced: it wraps the
  // AtlCodeBlock instance, and an instance cannot host free content, so composing it
  // from AtlChatMessage would drop the code block (ADR-0068). The three simple bubbles
  // became instances and their exemptions are gone.
  'AtlChat:token:color:msg-asst-2',
  'AtlChat:token:color:msg-asst-2-text',
  'AtlChat:token:color:footer-divider',
]);

/**
 * Component dirs that ship no cross-framework a11y snapshot, and why
 * (check-a11y-parity). The gate builds its roster from the component dirs, so
 * every uncovered component must be named here or the gate fails — without
 * this, a component with zero snapshots was simply absent from a roster built
 * by globbing the snapshot directory: no comparison, no warning, exit 0.
 *
 * Two kinds, and the difference is the point:
 *   - `design` — legitimately not comparable. Silent; this is a closed
 *     question.
 *   - `gap`    — comparable, just not written yet. Printed as a warning on
 *     every run so it keeps nagging instead of dissolving into the roster.
 *
 * An entry that names a dir which does not exist, or one that *does* have
 * snapshots, is itself an error: allowlists rot, and this one is load-bearing.
 */
const A11Y_PARITY_EXEMPT = new Map([
  [
    'select',
    {
      kind: 'design',
      reason:
        'React/Vue render a native <select>; Angular is a CDK-overlay listbox (ADR-0007). ' +
        'The trees legitimately differ (native options always in the DOM vs an overlay panel), ' +
        'so tree equality would force rebuilding an adapter.',
    },
  ],
  [
    'combobox',
    {
      kind: 'design',
      reason: 'Same native-vs-CDK-overlay split as select (ADR-0007).',
    },
  ],
  [
    'radio',
    {
      kind: 'design',
      reason:
        'A radio is only reachable through its group; the accessible tree is asserted by the ' +
        'atl-radio-group scenarios, which render the children.',
    },
  ],
  [
    'accordion',
    {
      kind: 'gap',
      reason:
        'Comparable across all three adapters (no native-vs-CDK split) and the exact component ' +
        'ADR-0025 cites as its motivating divergence, but no *.a11y.spec.* was ever written. ' +
        'It was invisible while the roster came from the snapshot directory. ' +
        'Tracked in tasks/review-state-2026-08-26.md.',
    },
  ],
]);

/**
 * Components whose `metadata.accessibility.role` does not appear in their
 * committed a11y baselines (check-metadata). Same two-kind convention as
 * A11Y_PARITY_EXEMPT: `design` is a closed question and stays silent, `gap`
 * is an unresolved defect and warns on every run.
 *
 * Without this cross-check the gate only asserted that `role` is a non-empty
 * string, so metadata could claim `progressbar` for a component that renders
 * a tablist — and did.
 *
 * An entry for a module that has no metadata file, or one whose role now DOES
 * appear in the baselines, is an error: the exception has outlived its reason.
 */
// Empty by design: AtlChat (2026-09-06, added a `log` container around its
// listitems, matching the metadata's claim), AtlStepper (corrected twice the
// same day: 'progressbar' to 'tablist' to match the code, then — once the
// markup itself changed to an ol/li/button list, ADR-0101 — 'tablist' to
// 'list' to match that) and AtlSkeleton (2026-08-26, commit 57a24b1) were the
// three components ever exempted here. All three now match their committed
// a11y baselines, so the hygiene check below would error on a stale entry
// for any of them.
const METADATA_ROLE_EXCEPTIONS = new Map([]);

/**
 * Tokens component CSS must NOT reference directly, and what to use instead
 * (check-primitives). ADR-0018 tiers tokens primitive -> semantic -> component;
 * a component reaching past the semantic tier into a primitive re-decides, in
 * one stylesheet, something the token layer already decided for everyone.
 *
 * `match` is tested against the full custom-property name.
 */
const PRIMITIVE_TOKENS = [
  {
    match: /^--ui-color-teal-\d{2,3}$/,
    label: 'teal ramp step',
    useInstead:
      'the semantic that aliases it (--ui-color-primary / -hover / -active), so the mode picks the step',
    why: 'ADR-0038: the ramp is the primitive tier; each theme aliases a different step of it.',
  },
  {
    match: /^--ui-font-display$/,
    label: 'display font stack',
    useInstead: '--ui-type-display',
    why:
      'ADR-0036: the role carries "serif, italic, never bolded" as one token. Naming the family ' +
      'directly is how a synthesised fake bold gets shipped.',
  },
  {
    match: /^--ui-font-mono$/,
    label: 'monospace font stack',
    useInstead: '--ui-type-code',
    why: 'ADR-0036: the code role pairs the family with the size and line-height that suit it.',
  },
];

/**
 * `<component-dir>:<token>` pairs that may reference a primitive anyway.
 * Same two kinds as the other allowlists: `design` is a closed question and
 * stays silent, `gap` is an unresolved migration and warns on every run.
 */
const PRIMITIVE_EXEMPTIONS = new Map([
  [
    'code-block:--ui-font-mono',
    {
      kind: 'gap',
      reason:
        'The one remaining consumer is .code-block-label — the language tag — at mono/xs/semibold. ' +
        'No --ui-type-* role says that: code is mono/sm/normal. One occurrence is not a role ' +
        '(rule of three), so the longhands stay and the axis token is named directly here. ' +
        '.code-block-pre, the other consumer, migrated to font: var(--ui-type-code) in ADR-0073.',
    },
  ],
]);

/**
 * `framework:dir:class` triples a stylesheet selects on that its own directory's
 * templates cannot emit, and that are not payable by an edit. (check-dead-selectors)
 *
 * Three parts, not four, because the gate compares per DIRECTORY — pairing a class
 * to one stylesheet would be precision the check does not have (four Angular
 * components ship no styleUrl at all).
 *
 * Same two kinds as the other allowlists here, and every entry below is `gap` on
 * purpose: each one is a real cross-framework divergence that warns on every run
 * until somebody decides it, rather than a closed question. An entry whose class IS
 * emitted now is an error — see [STALE-EXEMPTION].
 */
const DEAD_SELECTOR_EXEMPT = new Map([
  // React declares `orientation` in its OWN props interface (atl-radio-group.tsx:73)
  // and emits `.orientation-${orientation}`; libs/spec has no orientation on
  // AtlRadioGroupSpec at all (line 183 is AtlStepperSpec's). So all three stylesheets
  // carry the two rules and only one adapter can reach them. The remedy is a spec
  // decision — promote the axis to AtlRadioGroupSpec and implement it twice, or drop
  // it from React and delete six rules — not an edit either way.
  ...['angular', 'vue'].flatMap((fw) =>
    ['vertical', 'horizontal'].map((member) => [
      `${fw}:radio-group:orientation-${member}`,
      {
        kind: 'gap',
        reason:
          'the orientation axis exists only in React, which declares it in its own props ' +
          'interface rather than in libs/spec — promote it to AtlRadioGroupSpec and implement ' +
          'it in all three, or drop it from React and delete the rules from all three sheets. ' +
          'Unresolved: see tasks/todo.md',
      },
    ])
  ),
  [
    'angular:table:atl-checkbox',
    {
      kind: 'gap',
      reason:
        'atl-table.css:157 centres the select cell via `.atl-tr-select-cell .atl-checkbox label`, ' +
        'but Angular renders the child as the ELEMENT <atl-checkbox> and its host binding emits ' +
        'only is-checked/is-disabled/is-invalid/is-touched — React and Vue emit `atl-checkbox` as ' +
        'a class. Either give the Angular host the class hook the other two expose, or select the ' +
        'element here; both are cross-framework decisions about what the class contract is. ' +
        'Unresolved: see tasks/todo.md',
    },
  ],
]);

/**
 * `<ClassName>:<attr>` pairs that intentionally skip the host-attribute guard
 * (check-host-attr-guards, ADR-0091). Keyed by Angular class, not component
 * dir — several files declare more than one `@Component` (e.g. `atl-dialog.ts`
 * holds four), and the gate grades per class, so an exemption must too.
 *
 * Same two kinds as the other allowlists here: `design` is a closed question
 * and stays silent, `gap` is an unresolved instance of the defect and warns
 * on every run. Empty by design — every alias/id found when this gate was
 * built (Input, Textarea, Select, Dialog, Table) got the real guard added
 * instead of an exemption; this Map exists for the next component that earns
 * one, not as a parking lot for today's backlog.
 *
 * An entry naming a class/attr pair that doesn't exist, or one the host now
 * DOES guard, is itself an error — same [STALE] hygiene rule as the other
 * allowlists.
 */
const HOST_ATTR_GUARD_EXEMPT = new Map();

/**
 * `<SpecName>:<prop>:<framework>` triples that intentionally diverge between
 * `libs/spec/src/index.ts` and one adapter's declared prop surface
 * (check-prop-surface). Same two kinds as the other allowlists here: `design`
 * is a closed question and stays silent, `gap` is an unresolved, measured
 * divergence and warns on every run — every entry below is `gap`, seeded when
 * the gate was built so the backlog nags instead of blocking. Fixing any of
 * them is a separate task; this Map exists so day one is green.
 *
 * An entry naming a triple this gate's current run does not find is itself an
 * error: allowlists rot, and PROP_SURFACE_EXEMPT is load-bearing — EXCEPT for
 * a `<prop>` the spec never declares at all (see check-prop-surface.js § 9's
 * own comment): that class is structurally invisible to check:props (spec-
 * keyed, ADR-0093 Consequences) and is instead kept honest by
 * check-manifest-parity.mjs, which reads this SAME map (its own header
 * comment) but diffs the three adapters against EACH OTHER rather than
 * against the spec. Those entries are tagged below with the fact and a
 * pointer at tasks/todo.md's "Cross-framework gaps found by
 * check:manifest-parity" entry rather than at a check:props rule, since
 * check:props never asks the question they answer.
 */
const PROP_SURFACE_EXEMPT = new Map([
  // `errors` — validation messages — is a real prop on all three adapters of
  // every form control, but AtlFormFieldSpec never grew one: Angular types it
  // `WithOptionalFieldTree<ValidationError>[]` (Signal Forms' own error shape),
  // React and Vue take `string[]`. Agreeing a shared type is a contract
  // change with its own ADR, not a one-line fix.
  ...['AtlCheckboxSpec', 'AtlToggleSpec', 'AtlInputSpec', 'AtlTextareaSpec', 'AtlRadioGroupSpec', 'AtlSelectSpec', 'AtlComboboxSpec'].flatMap(
    (spec) =>
      ['angular', 'react', 'vue'].map((fw) => [
        `${spec}:errors:${fw}`,
        {
          kind: 'gap',
          reason:
            "'errors' is declared by all three adapters but AtlFormFieldSpec has no matching prop — Angular's " +
            "WithOptionalFieldTree<ValidationError>[] vs React/Vue's string[] means a shared type is a contract " +
            'change with its own ADR, not this gate. Unresolved: see tasks/todo.md.',
        },
      ])
  ),
  // AtlDialogSpec never grew aria-label/aria-labelledby, but this is no
  // longer an allowlist entry: `id`/`aria-label`/`aria-labelledby`/
  // `aria-describedby`/`type` are native passthrough attributes React
  // receives for free through `{...rest}` on the native element, so an
  // Angular `input()` or Vue prop of the same name is the other two adapters
  // reaching the same public surface, not drift — see NATIVE_PASSTHROUGH in
  // check-prop-surface.js. Dialog's aria-label/aria-labelledby (Angular,
  // React) and aria-label (Vue, camelCase `ariaLabel` — Vue hardcodes its own
  // headerId as the aria-labelledby target instead of exposing a prop for it)
  // are silenced structurally there now, not here.
  // Angular computes "is this the last item" internally via a registration
  // token (ATL_BREADCRUMBS) and never exposes it as a prop — the spec, React,
  // and Vue all model it as a settable `current`. Making Angular's internal
  // computation an explicit input (or dropping `current` from the other two
  // in favour of always-auto-detect) is a real API decision, not this gate.
  [
    'AtlBreadcrumbItemSpec:current:angular',
    {
      kind: 'gap',
      reason:
        'AtlBreadcrumbItem computes "is this the last item" internally via the ATL_BREADCRUMBS registration token ' +
        'and never exposes it as an input — the spec, React, and Vue all model `current` as a settable prop. ' +
        'Unresolved: see tasks/todo.md.',
    },
  ],
  // AtlTr.rowId: declared in the spec, and in Angular's own input() (single
  // occurrence in libs/angular/src/lib/table/atl-table.ts — verified), and
  // inherited into React's AtlTrProps via `extends AtlTrSpec` but never
  // destructured, never referenced, and never let through via a `{...rest}`
  // spread onto the <tr> — inherited-but-dropped. Both are real dead props;
  // wiring them up (or dropping rowId from the spec) is an implementation
  // task, not this gate.
  [
    'AtlTrSpec:rowId:angular',
    {
      kind: 'gap',
      reason:
        "rowId is declared ('readonly rowId = input<string | undefined>(undefined);') but referenced nowhere " +
        'else in atl-table.ts — dead on arrival. Unresolved: see tasks/todo.md.',
    },
  ],
  [
    'AtlTrSpec:rowId:react',
    {
      kind: 'gap',
      reason:
        'AtlTrProps extends AtlTrSpec so rowId is part of the type, but AtlTr destructures a fixed prop list with ' +
        'no `...rest` and never mentions rowId — inherited but never wired to anything, dead on arrival. ' +
        'Unresolved: see tasks/todo.md.',
    },
  ],
  // AtlChatMessage.id/.content and AtlChatSuggestion.id: the spec models
  // these as data fields, but all three adapters render content as
  // children/slot and never take id/content as a prop at all — a spec bug
  // (the shape doesn't match how any adapter actually renders), not framework
  // drift, since all three agree with each other.
  ...['angular', 'react', 'vue'].flatMap((fw) =>
    ['id', 'content'].map((prop) => [
      `AtlChatMessageSpec:${prop}:${fw}`,
      {
        kind: 'gap',
        reason:
          `AtlChatMessageSpec.${prop} is spec-only — all three adapters render message content as ` +
          "children/slot and never take '" +
          prop +
          "' as a prop. A spec bug (the shape doesn't match how any adapter renders), not framework drift. " +
          'Unresolved: see tasks/todo.md.',
      },
    ])
  ),
  ...['angular', 'react', 'vue'].map((fw) => [
    `AtlChatSuggestionSpec:id:${fw}`,
    {
      kind: 'gap',
      reason:
        "AtlChatSuggestionSpec.id is spec-only — all three adapters key suggestions by label/hint alone and " +
        "never take 'id' as a prop. A spec bug, not framework drift. Unresolved: see tasks/todo.md.",
    },
  ]),
  // React's radio-group declares its own `orientation` prop with no spec
  // entry at all; DEAD_SELECTOR_EXEMPT above already records the same open
  // spec decision (promote to AtlRadioGroupSpec, or drop it from React) from
  // the CSS side — cross-reference rather than restate it.
  [
    'AtlRadioGroupSpec:orientation:react',
    {
      kind: 'gap',
      reason:
        "React declares 'orientation' in its own AtlRadioGroupProps with no entry in AtlRadioGroupSpec — the same " +
        'open spec decision DEAD_SELECTOR_EXEMPT already records from the CSS side ' +
        "('angular:radio-group:orientation-*' / 'vue:radio-group:orientation-*' above). Unresolved: see tasks/todo.md.",
    },
  ],
  // AtlFormFieldSpec declares `onValueChange`, so the contract DOES model
  // change callbacks — it just models exactly one and leaves every other
  // component's events undeclared, while all three adapters implement them
  // consistently anyway (Angular output(), React callback prop, Vue emit).
  // Deciding the event contract (which components get a declared callback,
  // and its name) is a spec change with its own ADR, not gate work. One
  // shared reason for all 13 — this is one decision, not thirteen.
  ...[
    ['AtlAlertSpec', 'dismissed', 'angular'],
    ['AtlAlertSpec', 'onDismissed', 'react'],
    ['AtlChatSpec', 'onOpenChange', 'react'],
    ['AtlChatSuggestionSpec', 'selected', 'angular'],
    ['AtlChatSuggestionSpec', 'onSelected', 'react'],
    ['AtlDrawerSpec', 'onOpenChange', 'react'],
    ['AtlMenuItemSpec', 'onTriggered', 'react'],
    ['AtlPaginationSpec', 'onPageChange', 'react'],
    ['AtlStepperSpec', 'onActiveStepChange', 'react'],
    ['AtlThSpec', 'sort', 'angular'],
    ['AtlThSpec', 'onSort', 'react'],
    ['AtlTrSpec', 'selectedChange', 'angular'],
    ['AtlTrSpec', 'onSelectedChange', 'react'],
  ].map(([spec, prop, fw]) => [
    `${spec}:${prop}:${fw}`,
    {
      kind: 'gap',
      reason:
        "AtlFormFieldSpec declares 'onValueChange', so the contract DOES model change callbacks — it just models " +
        "exactly one and leaves every other component's events undeclared, while all three adapters implement " +
        'them consistently (Angular output(), React callback prop, Vue emit). Deciding the event contract is a ' +
        'spec change with its own ADR, not gate work. Unresolved: see tasks/todo.md.',
    },
  ]),
  // AtlButtonSpec REQUIRES 'aria-label' when the button has no visible label
  // (icon-only buttons) — the spec's own doc comment says Angular and Vue
  // "log a dev-mode warning" instead of binding a prop. That is the contract
  // being unmet on two of three adapters, not a spec gap: an icon-only
  // <atl-button> in Angular or Vue has no compiler-enforced way to require
  // the accessible name the spec promises.
  ...['angular', 'vue'].map((fw) => [
    `AtlButtonSpec:aria-label:${fw}`,
    {
      kind: 'gap',
      reason:
        "AtlButtonSpec requires 'aria-label' when the button has no visible label — the spec's own doc comment " +
        'says this adapter only logs a dev-mode warning instead of binding a prop, so an icon-only button here has ' +
        'no compiler-enforced way to satisfy the requirement. The contract being unmet, not a spec gap. ' +
        'Unresolved: see tasks/todo.md.',
    },
  ]),
  // AtlTrSpec:rowId, the third framework: cross-reference the angular/react
  // entries above (dead in Angular, dropped in React) — Vue is the third,
  // different way to fail the same prop: atl-tr.vue never declares rowId at
  // all, so it is plain MISSING there rather than dead. All three adapters
  // are wrong, in three different shapes.
  [
    'AtlTrSpec:rowId:vue',
    {
      kind: 'gap',
      reason:
        'rowId is dead in Angular and dropped in React (see AtlTrSpec:rowId:angular / :react above); Vue is a ' +
        "third, different failure — atl-tr.vue's Props interface never declares rowId at all, so it is plain " +
        'MISSING here, not dead. Unresolved: see tasks/todo.md.',
    },
  ],
  [
    'AtlTbodySpec:emptyContent:react',
    {
      kind: 'gap',
      reason:
        "React-only convenience prop ('emptyContent', rendered inside the empty-state row) with no entry in " +
        'AtlTbodySpec. Unresolved: see tasks/todo.md.',
    },
  ],
  // AtlRadioGroupSpec:name is NOT dead (ADR-0093 fixed the gate's own false
  // positive here): AtlRadioGroup provides itself as ATL_RADIO_GROUP via
  // `useExisting`, and AtlRadioGroupContext (atl-radio-group.token.ts)
  // declares `name` — AtlRadio (a sibling class, atl-radio.ts) reads it via
  // `this.group?.name()`. check-prop-surface.js now resolves that DI-context
  // case instead of only reading the providing class's own file, so this
  // entry no longer triggers and was removed rather than kept as a stale
  // exemption.
  [
    'AtlSelectSpec:name:angular',
    {
      kind: 'gap',
      reason:
        "declared ('readonly name = input('');') and never bound — AtlSelect renders a <button> trigger rather " +
        "than a native form control, so honouring 'name' means deciding whether to emit a hidden input for form " +
        'submission. A design question with its own ADR, not a binding to add here. Unresolved: see tasks/todo.md.',
    },
  ],
  // AtlAccordionGroupSpec:multi: found once ADR-0093 switched Angular's [DEAD]
  // check from a bare-word text match to matching the signal's CALL — the
  // old bare-word match was satisfied by the string literal 'multi' inside
  // `hostDirectives: [{ directive: CdkAccordion, inputs: ['multi'] }]`
  // (atl-accordion.ts), which is real Angular wiring but not a use of THIS
  // declared signal: hostDirectives forwards the public `multi` binding
  // straight to CdkAccordion's own `multi` @Input (verified against
  // node_modules/@angular/cdk's accordion.d.ts — CdkAccordion, not
  // AtlAccordionGroup, owns the `multi` boolean that actually gates
  // multi-expand behaviour), so `readonly multi = input(false);` never
  // receives a value and is never read — 'multi' the FEATURE works
  // (atl-accordion.spec.ts's multi-expand test proves it), but this specific
  // declared prop does not. Same class of bug as AtlSelect.name, found by
  // testing the rule fix rather than reported in the original brief — flagged
  // here rather than fixed, since fixing it means editing atl-accordion.ts
  // (out of scope for this gate change) or deciding whether hostDirectives
  // forwarding should count as its own [DEAD] exemption mechanism (a gate
  // design question, not a one-line fix). Unresolved: see tasks/todo.md.
  [
    'AtlAccordionGroupSpec:multi:angular',
    {
      kind: 'gap',
      reason:
        "declared ('readonly multi = input(false);') but `hostDirectives: [{ directive: CdkAccordion, inputs: " +
        "['multi'] }]` forwards the public 'multi' binding straight to CdkAccordion's own 'multi' @Input, which is " +
        "what actually gates multi-expand behaviour (verified against @angular/cdk's accordion.d.ts and exercised " +
        "by atl-accordion.spec.ts's multi-expand test) — the class's own input() never receives a value and is " +
        'never read. Unresolved: see tasks/todo.md.',
    },
  ],
  // readOnly (React's own HTML casing) vs the spec's `readonly`
  // (AtlReadonlySpec, lowercase): NOT a case of the spec spelling doing
  // nothing in React (that was this entry's original, wrong reason) — all
  // three of AtlInput/AtlTextarea/AtlRadioGroup destructure BOTH spellings
  // and merge them (e.g. atl-input.tsx:53-54,61: `readOnly: reactReadOnly`,
  // `readonly: specReadOnly`, then `const readOnly = reactReadOnly ??
  // specReadOnly ?? false`), so `<AtlInput readonly>` works today — `readonly`
  // is a real, working fallback that a passed `readOnly` shadows. Two public
  // spellings for one prop; the spec's `readonly` is authoritative and only
  // the React spelling is covered by tests (atl-input.spec.tsx:52-55,
  // atl-textarea.spec.tsx:55-58 assert the class via `readOnly`, not the DOM
  // attribute, and nothing exercises the lowercase path at all). Consolidating
  // to one spelling is a breaking rename with its own ADR, not this gate's
  // job. One shared reason — this is one decision, not three.
  ...['AtlInputSpec', 'AtlTextareaSpec', 'AtlRadioGroupSpec'].map((spec) => [
    `${spec}:readOnly:react`,
    {
      kind: 'gap',
      reason:
        "two public spellings for one prop: the spec's 'readonly' (AtlReadonlySpec, lowercase) is authoritative, " +
        "and React destructures BOTH 'readOnly' and 'readonly', merging them with 'readOnly ?? readonly ?? false' " +
        "— so the spec spelling works as a fallback that a passed 'readOnly' shadows. Only the React spelling " +
        '(readOnly) is covered by tests; nothing exercises the lowercase path. Consolidating to one spelling is a ' +
        'breaking rename with its own ADR, not this gate. Unresolved: see tasks/todo.md.',
    },
  ]),
  // Cross-framework gaps `check:manifest-parity` found and `check:props`
  // structurally cannot: the spec declares NEITHER side of each prop below,
  // so check:props' spec-keyed rules — [MISSING] walks the spec's own prop
  // list, [EXTRA]/[DEAD] only fire for a prop an adapter has that the spec
  // does not — have no question to ask about a prop absent from ONE adapter
  // while another adapter has it. ADR-0093 Consequences named the AtlDialog
  // instance of this blind spot when the gate shipped; the rest were found
  // the same way, once check-manifest-parity.mjs existed to look. See
  // tasks/todo.md, "Cross-framework gaps found by check:manifest-parity (S6a,
  // 2026-09-10)" for the full list and next steps.
  [
    'AtlDialogSpec:aria-labelledby:vue',
    {
      kind: 'gap',
      reason:
        "AtlDialogSpec declares no 'aria-labelledby' at all. Vue's AtlDialog hardcodes its own headerId " +
        "(useId()) as the aria-labelledby target and exposes no prop to override it, while Angular " +
        "('aria-labelledby' input alias, atl-dialog.ts:96) and React ('aria-labelledby' prop, atl-dialog.tsx:52, " +
        'falling back to headerId) both accept one. ADR-0093 Consequences named exactly this blind spot when the ' +
        "gate shipped. Unresolved: see tasks/todo.md, 'Cross-framework gaps found by check:manifest-parity (S6a, " +
        "2026-09-10)'.",
    },
  ],
  [
    'AtlButtonSpec:type:angular',
    {
      kind: 'gap',
      reason:
        "AtlButtonSpec declares no 'type' at all. Angular's <atl-button> (atl-button.ts) renders a custom " +
        'role="button" element with no `type` input and no native-attribute passthrough to receive one, while ' +
        "React ('type' reaches the underlying <button> via {...rest}) and Vue (its own 'type' prop, " +
        "atl-button.vue) both let a caller ask for a submit button — impossible in Angular today. Unresolved: " +
        "see tasks/todo.md, 'Cross-framework gaps found by check:manifest-parity (S6a, 2026-09-10)'.",
    },
  ],
  [
    'AtlCheckboxSpec:id:angular',
    {
      kind: 'gap',
      reason:
        "AtlCheckboxSpec declares no 'id' at all. Angular's AtlCheckbox generates its own internal id " +
        "('atl-checkbox-${nextId++}', atl-checkbox.ts:85) with no public input to override it, while React and " +
        "Vue both accept an 'id' prop — matters for an external <label for>. Unresolved: see tasks/todo.md, " +
        "'Cross-framework gaps found by check:manifest-parity (S6a, 2026-09-10)'.",
    },
  ],
  [
    'AtlToggleSpec:id:angular',
    {
      kind: 'gap',
      reason:
        "AtlToggleSpec declares no 'id' at all. Angular's AtlToggle generates its own internal id " +
        "('atl-toggle-${nextId++}', atl-toggle.ts:85) with no public input to override it, while React and Vue " +
        "both accept an 'id' prop — matters for an external <label for>. Unresolved: see tasks/todo.md, " +
        "'Cross-framework gaps found by check:manifest-parity (S6a, 2026-09-10)'.",
    },
  ],
  [
    'AtlAlertSpec:dismissed:vue',
    {
      kind: 'gap',
      reason:
        "the react-vs-vue side of the same fact AtlAlertSpec:dismissed:angular and :onDismissed:react (above) " +
        "already record: AtlAlertSpec models no dismiss event at all, so Vue's own 'dismissed' emit " +
        "(atl-alert.vue) is exactly as unkeyed as Angular's 'dismissed' output — it was simply never flagged " +
        'here, because check:props never compares Vue emits for EXTRA at all (GENERIC_EXTRA_IGNORE above has no ' +
        "Vue entry for exactly this reason — see that constant's own comment). Same fact, now recorded on the " +
        "side check:props cannot see. Unresolved: see tasks/todo.md, 'Cross-framework gaps found by " +
        "check:manifest-parity (S6a, 2026-09-10)'.",
    },
  ],
]);

/**
 * `<component-id>:figma` entries exempt from check-category-alignment.js's
 * [FIGMA-CATEGORY] — components.ts's category disagreeing with the section its
 * Figma master sits in.
 *
 * Empty by design (2026-09-10, ADR-0120). The eight entries that lived here
 * (button, input, textarea, checkbox, toggle, radio-group, select, combobox)
 * carried a real three-way disagreement discovered while building this gate
 * (2026-09-09): Figma filed Button under its own `Action` Section and the
 * other seven form controls under `Form`, while docs/src/data/components.ts
 * and every Storybook `title:` agreed on one flat `Inputs` category. The
 * owner resolved it the direction ADR-0118's tie-break dictates (two
 * agreeing sources outrank one): Figma's `Action` and `Form` Sections were
 * merged into one `Inputs` Section, and all nine masters (AtlButton plus the
 * eight Form controls, AtlRadio included for consistency) were renamed from
 * their old `Action/` / `Form/` prefix to `Inputs/`. [FIGMA-CATEGORY] now
 * agrees for all eight without an exemption; deleting them here — rather
 * than leaving them unused — is the proof the split is closed, per
 * [STALE-EXEMPTION] hygiene.
 */
const CATEGORY_ALIGNMENT_EXEMPT = new Map([]);

/**
 * `<A>:<B>` ADR-number pairs where B's frontmatter/title claims to revise, correct
 * or supersede A, but no dated correction belongs on A — because A was never
 * actually wrong. (check-adr-refs, [ADR-CORRECTION])
 *
 * Same two kinds as the other allowlists here: `design` is a closed question and
 * stays silent; `gap` would be an acknowledged-but-unwritten correction that warns
 * on every run (none needed yet — every other pair this gate found got a written
 * correction instead of an entry here).
 */
const ADR_CORRECTION_EXEMPT = new Map([
  [
    '0047:0060',
    {
      kind: 'design',
      reason: `ADR-0060's own sources line calls ADR-0047 "the gate this corrects — it asks
whether, not which", but ADR-0060's Consequences say the opposite outright:
"[TOKEN] was never wrong; it answered exactly the question it was built to
answer." ADR-0060 adds a new, complementary check ([ROOT-PAINT]) rather than
fixing a false statement in ADR-0047 — "corrects" in the sources line is a
looser use of the word than the other pairs this gate found (ADR-0034/0019,
ADR-0011/0009, ADR-0035/0020, ADR-0043/0042, ADR-0050/0046, ADR-0058/0056,
ADR-0074/0070), all of which got a written correction. No factual correction
is owed on ADR-0047.`,
    },
  ],
]);

/**
 * `skills/<name>` directories that deliberately do NOT get mirrored to the
 * public discovery index (docs/public/.well-known/agent-skills/index.json),
 * keyed by skill name with the reason it's held back. Every OTHER directory
 * under skills/ that ships a SKILL.md must have an index.json entry whose
 * digest matches a fresh sha256 of that file. The two generic skills are
 * distributed; the repo-bound one below is not. (check-skill-discovery,
 * and sync-skill-discovery's no-argument form skips these names)
 */
const UNDISTRIBUTED_SKILLS = {
  // Repo-bound: names libs/spec (the framework-agnostic contract), this
  // repo's gates (parity:record, check:figma), and the Atelier Figma file
  // (QMnDD8uZQPldPrlCwZZ58T) — none of which exist in a scaffolded
  // workspace outside this monorepo, unlike the generic skills already on
  // the discovery endpoint. A scaffolded-workspace profile for it is a
  // decision deferred to plan/design-skills-blueprint.md § 8 (decision 7).
  'design-to-code': {
    reason:
      'repo-bound — names libs/spec, parity:record, check:figma and the Atelier file key; a scaffolded workspace gets a profile later (plan/design-skills-blueprint.md § 8 decision 7)',
  },
  // Repo-bound: names the two Atelier Claude Design project ids
  // (7a6a2f19-9a3c-4dd9-9828-65c7cc67766c "Atelier" and
  // 019de217-489c-7441-8275-2efe020086b5 "Atelier Design System"), the
  // artboard registry (tools/design/artboards.json), the palette generator
  // (tools/scripts/gen-artboard-palette.mjs), and the design-status gate
  // (check:design-status) — none of which exist in a scaffolded workspace
  // outside this monorepo. Carries ADR-0032 governance specific to this
  // organisation (trainer-machine-only Publish; DSB/ISB stop rule for
  // client/employer design systems).
  'artboard-bridge': {
    reason:
      'repo-bound — names the two Atelier Claude Design project ids, the artboard registry (tools/design/artboards.json), the palette generator and the design-status gate; carries ADR-0032 governance specific to this organisation',
  },
};

/**
 * Builds a content-addressed key for COMPONENT_COUNT_EXEMPT: the repo-relative
 * file path, the trimmed text of the non-blank source line immediately above
 * a hand-typed component-count citation, and the trimmed text of the citing
 * line itself — not a line number. Same idiom as scaffoldPortKey() above
 * (ADR-0119) and for the same reason: a line number shifts on any edit above
 * it anywhere in the file, including one made by someone else entirely, and a
 * content key does not have that failure mode.
 *
 * @param {string} file repo-relative path, e.g. 'README.md'
 * @param {string} prevLine the non-blank line immediately above the citation
 * @param {string} line the citing line itself
 * @returns {string}
 */
function componentCountKey(file, prevLine, line) {
  return `${file}\n${prevLine.trim()}\n${line.trim()}`;
}

/**
 * Lines in participant-facing material that cite a bare, hand-typed
 * "<number> component(s)" with no matching COMPONENT_COUNT_EXEMPT entry
 * (check-component-count's [BARE-COUNT]). Four different numbers — 31, 29,
 * 28, 8 — were each correct for a different thing (README's directory count
 * including foundation/showcase, design-status.md's Figma-master count, the
 * docs catalog's composite-API count, its Inputs category) and nothing said
 * which was which; this gate and allowlist are the fix (tasks/todo.md,
 * 2026-09-10).
 *
 * Keyed by content via componentCountKey(), not file:line — see that
 * function's doc comment for why. Every entry here is one of two legitimate
 * cases, stated in its own reason:
 *   - a DATED historical record (a past event, not a live claim — must not be
 *     "corrected" when the current catalog count changes), or
 *   - a number LABELLED with what it counts and a citation to the live
 *     source, where the citing file has no build step of its own to derive
 *     the number instead (verified per-entry, not assumed).
 * A generated file (one that opens with a "GENERATED by" marker, e.g.
 * plan/design-status.md) is not in this Map at all — check-component-count.js
 * skips such files outright rather than allowlisting every line in them; see
 * its own header comment.
 */
const COMPONENT_COUNT_EXEMPT_ENTRIES = [
  [
    componentCountKey(
      'README.md',
      '## Components',
      '28 components are catalogued in the docs site — one entry per composite API, per `COMPONENT_CATEGORIES` in [`docs/src/data/components.ts`](docs/src/data/components.ts) — and ship in all three libraries with identical prop names, identical variant unions, and the same `--ui-*` CSS token system.',
    ),
    "This task's own fix (2026-09-10): states what it counts (COMPONENT_CATEGORIES in docs/src/data/components.ts, one entry per composite API) and cites the source inline, rather than a bare number. README.md has no build step of its own to derive it live (verified: nothing under tools/scripts/ or package.json references README.md), so a labelled bare number — not a derived one — is the correct, permanent outcome here.",
  ],
  [
    componentCountKey(
      'docs/src/pages/accessibility.astro',
      'detail:',
      "'Median Figma component-a11y score 94 → 100, worst 77 → 92, 22 of 28 component-sets now perfect. Triangulated audit across axe-core (DOM-time), figma_audit_component_accessibility (design-time), and a static spec read (API-time); 8 P-critical findings landed across 4 phases. Headlines: AtlProgress gained a label prop, AtlAccordionItem gained headingLevel, AtlButton gained a discriminated-union aria-label requirement, AtlTable wrapper got tabindex=0 + role=region, --ui-color-text-muted darkened past the protanopia AA threshold, and AtlButton danger picked up a 1px darker border for non-color differentiation.',",
    ),
    "Dated historical record: one entry in RECENT_A11Y tagged release: '2026-04-26 audit' — a snapshot of that day's Figma audit score, not a live claim about today's catalog size. Must not be updated when the current component count changes.",
  ],
  [
    componentCountKey(
      'docs/src/pages/claude-design.astro',
      'Claude Design turns a prompt into a canvas of artboards. On 2026-08-26 and 27, this',
      'library’s own 29 components were redesigned through 31 of them over two days, and those',
    ),
    'Dated historical record: the 2026-08-26/27 Claude Design exercise — the same event the Proof section below restates with its own date. The 2026-09-10 fix added the date inline to this sentence, making explicit what was already true (this is a record of that exercise, not a live claim about the current catalog size).',
  ],
  [
    componentCountKey(
      'docs/src/pages/claude-design.astro',
      'On 2026-08-26 and 27 this library was redesigned <em>through</em> the canvas.',
      '<strong style="color: var(--ui-color-text)">31 artboards</strong> — 29 component sheets plus',
    ),
    'Dated historical record: same 2026-08-26/27 exercise, dated by the sentence immediately above in the same paragraph.',
  ],
  [
    componentCountKey(
      'docs/src/pages/claude-design.astro',
      '<strong style="color: var(--ui-color-text)">31 artboards</strong> — 29 component sheets plus',
      'two studies — covering <strong style="color: var(--ui-color-text)">29 of 29 components</strong>.',
    ),
    'Dated historical record: continuation of the same 2026-08-26/27 paragraph as the entry above.',
  ],
  [
    componentCountKey(
      'skills/atelier-design/references/brand-guide.md',
      '3. **AI + MCP** — Claude reads both via Model Context Protocol and writes the code',
      'The repo ships an Astro 5 docs site + three parallel component libraries (`@atelier-ui/{angular,react,vue}`) of 28 catalogued components each (`docs/src/data/components.ts`) with identical APIs, all enforced by a framework-agnostic `@atelier-ui/spec` TypeScript layer.',
    ),
    "This task's own fix (2026-09-10): replaced a stale '~27' with the docs catalog's real count, stated with what it counts and a citation — same reasoning as the README.md entry above. This skill's references/ have no build step of their own either (only sync-skill-discovery.mjs mirrors the file verbatim to docs/public).",
  ],
  [
    componentCountKey(
      'skills/atelier-design/ui_kits/docs-site/README.md',
      '4. **MCP setup** — split row. Left: copy + checklist. Right: full `claude_desktop_config.json` snippet with copy button.',
      '5. **Components grid** — category pills (All / Inputs / Display / Navigation / Overlay), framework switcher (Angular / React / Vue), 27 component cards each tagged with three framework dots.',
    ),
    "Verified accurate, not stale (2026-09-10): describes a self-contained static mockup (landing.jsx in the same directory), whose own hardcoded card array has exactly 27 entries — verified by counting its 'name:' entries. Several of those (AtlSwitch, AtlPopover, AtlDropdown, AtlSlider, AtlDivider) are not even real Atelier components. This documents the mockup's own fixed content, not a live claim about Atelier's catalog size, so it does not drift with the real count and there is nothing to derive it from.",
  ],
  [
    componentCountKey(
      'plan/big-picture.md',
      '# Atelier UI — Full API Reference',
      '> Complete component API for LLM consumption. 28 accessible components for Angular,',
    ),
    'Quoted excerpt of the generated docs/public/llms-full.txt inside a fenced code block. The surrounding prose, two lines above the excerpt, already explicitly caveats this: "component count and package version inside this quote are the file\'s own words as of this rewrite, not a fact this document is asserting on its own account." Already labelled by the document itself.',
  ],
];

// Same collision guard as SCAFFOLD_PORT_EXEMPT above: a `new Map([...])`
// literal silently keeps the LAST entry on a duplicate key, which would drop
// an earlier exemption with no error. Fail loudly at require-time instead.
{
  const seen = new Set();
  for (const [key] of COMPONENT_COUNT_EXEMPT_ENTRIES) {
    if (seen.has(key)) {
      throw new Error(
        'COMPONENT_COUNT_EXEMPT: two entries computed the same componentCountKey() — same file, same ' +
          'two lines of context. The Map literal would silently keep only the later one. Add more ' +
          "distinguishing context, or merge the two entries if they're genuinely the same citation.\n" +
          `Colliding key:\n${key}`
      );
    }
    seen.add(key);
  }
}
const COMPONENT_COUNT_EXEMPT = new Map(COMPONENT_COUNT_EXEMPT_ENTRIES);

module.exports = {
  DEAD_SELECTOR_EXEMPT,
  VARIANT_AXIS_EXCEPTIONS,
  DEFAULT_IS_BASE,
  DEFAULT_PROP_EXCEPTIONS,
  STORY_DESCRIPTION_SKIP_DIRS,
  SCAFFOLD_PORT_EXEMPT,
  scaffoldPortKey,
  FIGMA_CONFORMANCE_EXCEPTIONS,
  A11Y_PARITY_EXEMPT,
  METADATA_ROLE_EXCEPTIONS,
  PRIMITIVE_TOKENS,
  PRIMITIVE_EXEMPTIONS,
  TOKEN_BYPASS_EXEMPT,
  HOST_ATTR_GUARD_EXEMPT,
  PROP_SURFACE_EXEMPT,
  UNDISTRIBUTED_SKILLS,
  ADR_CORRECTION_EXEMPT,
  CATEGORY_ALIGNMENT_EXEMPT,
  COMPONENT_COUNT_EXEMPT,
  componentCountKey,
};
