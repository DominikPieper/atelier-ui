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
 * `framework:union:member` triples that intentionally have no CSS class — the
 * axis is realised by a non-class mechanism in that framework. (check-variants)
 */
const VARIANT_AXIS_EXCEPTIONS = new Set([
  // Angular tooltip positions via the CDK overlay's flexible-connected
  // position strategy (inline transforms), not .position-* CSS classes.
  // React/Vue use CSS classes, so they stay enforced.
  'angular:AtlTooltipPosition:above',
  'angular:AtlTooltipPosition:below',
  'angular:AtlTooltipPosition:left',
  'angular:AtlTooltipPosition:right',
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
 * `selector:check:detail` triples that the Figma conformance gate (check-figma)
 * should treat as intentional — a known, justified divergence between the Figma
 * master and the spec. Same exact-string `.has()` idiom as VARIANT_AXIS_EXCEPTIONS.
 *
 * `check` is one of: name | variant | token | autolayout | desc. `detail` is the
 * gate's per-finding key:
 *   name      → `<axisProp>=<value>`        (e.g. 'AtlButton:name:size=xl')
 *   variant   → comma-joined axis row       (e.g. 'AtlDialog:variant:size=full')
 *   token     → `color:<node>` | `radius:<node>` | `spacing:<node>` | `nonsemantic:<token>`
 *   autolayout→ `<node name>`
 *   desc      → 'spec-ref'
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
  // AtlInputSpec.type (text | email | password | …) changes input behaviour,
  // not chrome — every type renders identically, so there is no visual axis
  // to mirror in Figma. Code-only.
  'AtlInput:name:type',
  // AtlAvatarStatus is illustrated as sibling frames on the Components page
  // but not yet a variant axis — the AtlAvatar Figma description documents
  // this as a design follow-up. Allowlisted until the axis lands.
  'AtlAvatar:name:status',
  // AtlTableAlign is a per-cell prop (AtlTh/AtlTd), not a set-level visual
  // variant of the table master. Code-only.
  'AtlTable:name:align',
  // AtlChatStatus (idle | streaming | error) is illustrated as sibling
  // mockup frames pending a follow-up variant axis (documented in the
  // AtlChat Figma description); AtlChatMessageRole shapes the message
  // sub-component, not the chat master's own variant surface.
  'AtlChat:name:status',
  'AtlChat:name:messageRole',
  // Toast is options-based (AtlToastVariant/AtlToastOptions, ADR-0008) and
  // CodeBlock has no spec contract — neither has an Atl*Spec interface, by
  // design, so the masters are exempt from the interface-existence check.
  'AtlToast:name:spec-interface',
  'AtlCodeBlock:name:spec-interface',
  // Decorative "code line" rectangles inside the CodeBlock/Chat mockups —
  // 2px illustration bars, not component chrome.
  'AtlCodeBlock:token:radius:Rectangle',
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
  'AtlChat:token:color:msg-asst-1',
  'AtlChat:token:color:msg-asst-1-text',
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
const METADATA_ROLE_EXCEPTIONS = new Map([
  [
    'chat',
    {
      kind: 'gap',
      reason:
        "declares role 'log', but no adapter renders it — the implementations expose dialog / " +
        'listitem / status only, and the listitems have no list container. Either the log ' +
        'container is missing from the code or the metadata claims a pattern that was never ' +
        'built. Unresolved: see tasks/todo.md.',
    },
  ],
  [
    'stepper',
    {
      kind: 'gap',
      reason:
        "declares role 'progressbar', all three adapters render tablist/tab(/tabpanel), and the " +
        "Figma master description claims a third pattern (ol with aria-current=\"step\"). Three " +
        'sources, three answers — picking one is an ADR, not a typo fix. Unresolved: see ' +
        'tasks/todo.md.',
    },
  ],
]);

module.exports = {
  VARIANT_AXIS_EXCEPTIONS,
  DEFAULT_IS_BASE,
  DEFAULT_PROP_EXCEPTIONS,
  STORY_DESCRIPTION_SKIP_DIRS,
  FIGMA_CONFORMANCE_EXCEPTIONS,
  A11Y_PARITY_EXEMPT,
  METADATA_ROLE_EXCEPTIONS,
};
