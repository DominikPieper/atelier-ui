// Docs-site categories → Storybook title categories (lowercased path segments).
// Now a straight lowercase of the docs-site name for every category.
export const STORYBOOK_CATEGORY: Record<string, string> = {
  Inputs: 'inputs',
  Display: 'display',
  Navigation: 'navigation',
  Overlay: 'overlay',
  Feedback: 'feedback',
  AI: 'ai',
};

// Storybook docs IDs follow `components-<category>-<component>--docs`, where
// <component> is the primary selector lowercased (e.g. AtlTabGroup → atltabgroup).
// Toast's docs selector is "AtlToastProvider + useAtlToast" but its Storybook id
// is atltoast.
export function storybookSegment(name: string, selector: string): string {
  if (name === 'toast') return 'atltoast';
  return selector
    .split(' + ')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

/** The story id (`components-inputs-atlbutton`), which is also the manifest key. */
export function storybookComponentId(
  name: string,
  category: string,
  selector: string,
): string {
  const cat = STORYBOOK_CATEGORY[category];
  const segment = storybookSegment(name, selector);
  if (!cat || !segment) {
    throw new Error(
      `No Storybook id for docs component '${name}' (category '${category}', selector '${selector}').`,
    );
  }
  return `components-${cat}-${segment}`;
}
