/**
 * a11y-tree.ts — framework-agnostic accessibility-tree normalizer (ADR-0025).
 *
 * Cross-framework parity compares what the three adapters EXPOSE to assistive
 * tech, not the DOM they emit. The DOM legitimately differs — React/Vue render a
 * native `<button>`; Angular renders `<llm-button role="button">` — but the
 * accessibility tree must match. This walks a rendered root and produces a
 * normalized {role, name, states} list so each framework's `*.a11y.spec.*` can
 * write a snapshot that `tools/scripts/check-a11y-parity.js` diffs across adapters.
 *
 * Normalization is the point — it makes semantically-equal renders compare equal:
 *   - native `disabled` and `aria-disabled="true"` both collapse to `disabled:true`
 *     (this is what lets React's native button match Angular's role+aria host),
 *   - `aria-X="false"`/absent are dropped (no false-positive divergence),
 *   - `aria-hidden`/`hidden` subtrees are excluded (not in the a11y tree — e.g. the
 *     loading spinner), and so are their text in the accessible name,
 *   - role-less wrapper elements are skipped but their children are still visited.
 *
 * Dependency-free on purpose: it is co-located in each adapter's `testing/` dir
 * (like behavior.ts) so the spec import stays intra-project and the file ships no
 * runtime dependency. The accessible-name computation is a pragmatic subset of the
 * WAI spec (aria-label → aria-labelledby → visible text) sufficient for these
 * components. NOTE: kept byte-identical across libs/{angular,react,vue}/src/testing
 * — the same triplication trade-off as behavior.ts; a shared `type:testing` lib
 * would single-source it (see the audit's 3-framework-maintenance blind spot).
 */

export interface A11yNode {
  role: string;
  name: string;
  states?: Record<string, string | boolean>;
}

const STATE_ATTRS = [
  'aria-expanded',
  'aria-checked',
  'aria-selected',
  'aria-pressed',
  'aria-current',
  'aria-haspopup',
  'aria-modal',
  'aria-invalid',
  'aria-required',
  'aria-readonly',
] as const;

function implicitRole(el: Element): string | null {
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case 'button':
      return 'button';
    case 'a':
      return el.hasAttribute('href') ? 'link' : null;
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'header':
      return 'banner';
    case 'footer':
      return 'contentinfo';
    case 'aside':
      return 'complementary';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'listitem';
    case 'table':
      return 'table';
    case 'dialog':
      return 'dialog';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'select':
      return 'combobox';
    case 'textarea':
      return 'textbox';
    case 'input': {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'range') return 'slider';
      if (['button', 'submit', 'reset', 'image'].includes(type)) return 'button';
      return 'textbox';
    }
    default:
      return null;
  }
}

function roleOf(el: Element): string | null {
  const explicit = el.getAttribute('role');
  if (explicit) {
    const first = explicit.trim().split(/\s+/)[0];
    if (first === 'presentation' || first === 'none') return null;
    return first;
  }
  return implicitRole(el);
}

function isHidden(el: Element): boolean {
  return el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden');
}

/** Visible text of an element's subtree, excluding aria-hidden/hidden descendants. */
function visibleText(el: Element): string {
  let out = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      out += node.textContent ?? '';
    } else if (node.nodeType === 1) {
      const child = node as Element;
      if (isHidden(child)) return;
      const tag = child.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'template') return;
      out += visibleText(child);
    }
  });
  return out;
}

/** Pragmatic accessible-name: aria-label → aria-labelledby → visible text. */
function accessibleName(el: Element): string {
  const label = el.getAttribute('aria-label');
  if (label && label.trim()) return label.trim();
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    // Global `document` (non-null in every lib.dom config) — avoids el.ownerDocument,
    // whose nullability differs across the three frameworks' TS lib types.
    const text = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) return text;
  }
  return visibleText(el).replace(/\s+/g, ' ').trim();
}

function normalizedStates(el: Element): Record<string, string | boolean> | undefined {
  const states: Record<string, string | boolean> = {};

  // Unify native `disabled` and aria-disabled="true" so a native-button adapter
  // and a role+aria host adapter compare equal.
  const nativeDisabled =
    'disabled' in el
      ? Boolean((el as unknown as { disabled?: boolean }).disabled)
      : el.hasAttribute('disabled');
  if (nativeDisabled || el.getAttribute('aria-disabled') === 'true') states.disabled = true;

  for (const attr of STATE_ATTRS) {
    const v = el.getAttribute(attr);
    if (v === null || v === 'false') continue;
    states[attr.replace(/^aria-/, '')] = v === 'true' ? true : v;
  }

  return Object.keys(states).length ? states : undefined;
}

/** Walk `root` (inclusive) → flat, document-ordered list of role-bearing nodes. */
export function a11yTree(root: Element): A11yNode[] {
  const out: A11yNode[] = [];

  function visit(el: Element): void {
    if (isHidden(el)) return;
    const tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'template') return;
    const role = roleOf(el);
    if (role) {
      const node: A11yNode = { role, name: accessibleName(el) };
      const states = normalizedStates(el);
      if (states) node.states = states;
      out.push(node);
    }
    for (const child of Array.from(el.children)) visit(child);
  }

  visit(root);
  return out;
}
