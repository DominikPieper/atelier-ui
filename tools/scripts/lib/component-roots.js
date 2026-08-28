'use strict';
/**
 * component-roots.js — which CSS class is a component ROOT, per lib directory.
 *
 * A gate that says "declare this on the root" has to know what the root is, and
 * the structural answer — "one compound selector with no combinator" — accepts
 * every slot wrapper the library ships. `.atl-dialog-content`, `.atl-card-header`
 * and `.atl-combobox-input` have no combinator either, so check:typeface counted
 * them as roots and let two comboboxes past [DESCENDANT]; the apology sat in a
 * comment above its own counter.
 *
 * The name-based answer is a rule plus a short exception list:
 *
 *   the rule        a directory's root is `.atl-<dir>`. Right for 26 of the 29.
 *   the exceptions  the directories that render a differently-named root, or more
 *                   than one root because they ship a child master too (ADR-0062).
 *
 * Every exception below except the last three is also recorded in check-figma.js's
 * ROOT_PAINT, whose `cascade[0]` leads with the root class — that is what its own
 * `rootSelectorFor()` extracts. This module deliberately does not read that table:
 * ROOT_PAINT describes the PAINTED box and only incidentally names the root
 * (`AtlInput`'s cascade is `.atl-input input`), and it excludes thirteen masters for
 * a paint reason that has nothing to do with type. Folding the two together is
 * worth doing the next time check-figma.js is opened; until then this list is the
 * one to keep current, and check-figma.js's is the one to reconcile against.
 */

/**
 * Roots the `.atl-<dir>` rule does not produce, keyed by lib directory. Adding a
 * component root that is neither `.atl-<dir>` nor listed here makes check:typeface
 * read it as a descendant, so a new root inside an existing directory belongs here.
 * @type {Record<string, string[]>}
 */
const EXTRA_ROOTS = {
  // Recorded in check-figma.js's ROOT_PAINT too: a root whose class is not the
  // directory name, or a child master that is a root in its own right (ADR-0062).
  accordion: ['.atl-accordion-group', '.atl-accordion-item'],
  breadcrumbs: ['.atl-breadcrumb-item'],
  chat: ['.atl-chat-message', '.atl-chat-suggestion', '.atl-chat-typing'],
  drawer: ['.atl-drawer-host'],
  menu: ['.atl-menu-item'],
  stepper: ['.step-item'],
  tabs: ['.atl-tab-group'],
  // Named nowhere else in the repo. AtlAvatarGroup has a spec but no entry in any
  // map; AtlToast and AtlTooltip wrap themselves in a positioning container that no
  // master corresponds to. Each one really is a second root inside a shared
  // directory, and each one declares the typeface, so leaving it out turns six
  // correct declarations into [DESCENDANT] blockers.
  avatar: ['.atl-avatar-group'],
  toast: ['.atl-toast-container'],
  tooltip: ['.atl-tooltip-wrapper'],
};

/**
 * Every root class a lib directory renders: `.atl-<dir>` plus its exceptions.
 * @param {string} dir lib directory name, e.g. 'drawer'
 * @returns {Set<string>}
 */
function rootsFor(dir) {
  return new Set([`.atl-${dir}`, ...(EXTRA_ROOTS[dir] || [])]);
}

module.exports = { EXTRA_ROOTS, rootsFor };
