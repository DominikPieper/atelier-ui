// The briefs in `workshop/briefs/` link to each other as plain relative files
// (`README.md#done-when`, `toast.md`) so they read correctly on GitHub. On the
// docs site the same links have to land on the rendered routes. This rewrites
// exactly those links, and nothing else, at render time (and wraps tables, below) — the .md files stay the
// one source and carry no site-specific URLs.
const BRIEF_LINK = /^(README|toast|tagchip|statcard|avatar)\.md(#.*)?$/;

function walk(node, visit) {
  visit(node);
  if (node.children) for (const child of node.children) walk(child, visit);
}

// A wide table must scroll inside its own box, not widen the page, and a
// scrollable box has to be reachable from the keyboard. role=group, not region:
// a page with five tables would otherwise carry five identically named landmarks.
function wrapTables(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    wrapTables(child);
    if (child.type !== 'element' || child.tagName !== 'table') return child;
    return {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['brief-table-wrap'],
        role: 'group',
        ariaLabel: 'Table (scrolls sideways on narrow screens)',
        tabIndex: 0,
      },
      children: [child],
    };
  });
}

export default function rehypeBriefLinks() {
  return (tree) => {
    wrapTables(tree);
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (typeof href !== 'string') return;
      const m = BRIEF_LINK.exec(href);
      if (!m) return;
      const [, name, hash = ''] = m;
      node.properties.href =
        (name === 'README' ? '/briefs' : `/briefs/${name}`) + hash;
    });
  };
}
