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
  // The Figma Toast is drawn as a DARK notification card (#1e293b/#334155)
  // while the code renders a light surface-raised toast — a real, OPEN
  // design decision (align Figma to code or redesign the code toast), not
  // a mechanical binding fix. Tracked in tasks/todo.md; unblock the gate
  // until a designer resolves it.
  'AtlToast:token:color:variant=default, position=top-right',
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

module.exports = {
  VARIANT_AXIS_EXCEPTIONS,
  DEFAULT_IS_BASE,
  DEFAULT_PROP_EXCEPTIONS,
  STORY_DESCRIPTION_SKIP_DIRS,
  FIGMA_CONFORMANCE_EXCEPTIONS,
};
