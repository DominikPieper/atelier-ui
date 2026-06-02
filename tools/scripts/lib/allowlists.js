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
  'angular:LlmTooltipPosition:above',
  'angular:LlmTooltipPosition:below',
  'angular:LlmTooltipPosition:left',
  'angular:LlmTooltipPosition:right',
]);

/**
 * Unions whose `'default'` member is the unmodified base style (styled on the
 * component root, e.g. `.llm-table { … }`) with only non-default variants
 * getting a `.variant-<x>` modifier — so `.variant-default` legitimately does
 * not exist. (badge / toast / accordion DO style `default` explicitly and are
 * intentionally absent here, so their `default` stays enforced.) (check-variants)
 */
const DEFAULT_IS_BASE = new Set([
  'LlmTabGroupVariant',
  'LlmMenuVariant',
  'LlmProgressVariant',
  'LlmTableVariant',
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
 *   name      → `<axisProp>=<value>`        (e.g. 'LlmButton:name:size=xl')
 *   variant   → comma-joined axis row       (e.g. 'LlmDialog:variant:size=full')
 *   token     → `color:<node>` | `radius:<node>` | `spacing:<node>` | `nonsemantic:<token>`
 *   autolayout→ `<node name>`
 *   desc      → 'spec-ref'
 *
 * Empty by design — the gate is meant to surface the real backlog of unbound
 * spacing/radii in the Figma library, not pre-suppress it. Add an entry only
 * when a finding is a genuine, documented false-positive. (check-figma)
 */
const FIGMA_CONFORMANCE_EXCEPTIONS = new Set([
  // LlmCardSpec.role (LlmCardRole: article | region | section) is a code-only
  // landmark prop — deliberately NOT a Figma variant axis (adding a landmark to
  // every card pollutes the page outline). The LlmCard Figma description marks it
  // "code-only: role". So the missing "role" variant axis is expected, not drift.
  'LlmCard:name:role',
]);

module.exports = {
  VARIANT_AXIS_EXCEPTIONS,
  DEFAULT_IS_BASE,
  DEFAULT_PROP_EXCEPTIONS,
  STORY_DESCRIPTION_SKIP_DIRS,
  FIGMA_CONFORMANCE_EXCEPTIONS,
};
