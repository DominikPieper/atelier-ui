/**
 * Maps a docs route (`currentPath`) to the GitHub blob URL of the Astro source
 * page that renders it, so each page can offer an "Edit this page" link.
 *
 * Build-time only: the mapping mirrors `docs/src/pages/` file-based routing.
 * Dynamic routes (`/components/<name>/`, `/patterns/<id>/`) link the *template*
 * (`[name].astro`, `[id].astro`) rather than a per-instance file — there is no
 * source file per generated page.
 *
 * Robustness: any path that can't be confidently mapped (notably 404 / unknown
 * routes) returns `null` so the caller renders no link instead of a 404 GitHub
 * URL.
 */

const REPO_BLOB_BASE =
  'https://github.com/DominikPieper/atelier-ui/blob/main/docs/src/pages';

/**
 * Source pages whose `pages/<seg>.astro` form exists. Listing the flat
 * single-segment routes explicitly keeps the generic fallback (which otherwise
 * guesses `<seg>/index.astro`) from emitting wrong URLs. Derived from the
 * `docs/src/pages/` tree.
 */
const FLAT_PAGES = new Set<string>([
  'a11y-workflow',
  'accessibility',
  'agent-skills',
  'claude-md',
  'design-principles',
  'design-to-code',
  'figma-token',
  'figma',
  'first-component',
  'install',
  'llms',
  'mcp',
  'patterns',
  'prompts',
  'schulung',
  'storybook',
  'tokens',
  'troubleshooting',
  'tutorial',
  'workshop',
]);

/**
 * Dynamic route templates, keyed by their first path segment. The mapped value
 * is the repo-relative template path to link.
 */
const DYNAMIC_TEMPLATES: Record<string, string> = {
  components: 'components/[name].astro',
  patterns: 'patterns/[id].astro',
};

/**
 * Routes that should never expose an edit link (no meaningful single source, or
 * not user-editable content).
 */
const EXCLUDED = new Set<string>(['404']);

/**
 * Resolve the repo-relative source path (under `docs/src/pages/`) for a route,
 * or `null` when it can't be mapped.
 */
function sourcePathFor(currentPath: string): string | null {
  const segments = currentPath.split('/').filter(Boolean);

  // Home: `/` → index.astro
  if (segments.length === 0) return 'index.astro';

  const [first, second] = segments;

  if (EXCLUDED.has(first)) return null;

  // Dynamic routes: link the template, not a per-instance file.
  if (DYNAMIC_TEMPLATES[first]) {
    // A second segment means an instance page (`/components/button/`) → template.
    if (second) return DYNAMIC_TEMPLATES[first];
    // No second segment means the section index (`/components/`) → index.astro.
    return `${first}/index.astro`;
  }

  // Single-segment flat page (`/workshop/` → workshop.astro).
  if (segments.length === 1) {
    return FLAT_PAGES.has(first) ? `${first}.astro` : null;
  }

  // Nested known case: `/skills/figma-workspace-architect/`.
  // General rule: prefer `pages/<path>.astro`, else `pages/<path>/index.astro`.
  // We can't stat the filesystem here, so only emit a link for the nested
  // routes we actually ship (skills/* are flat files under their folder).
  if (first === 'skills' && second) {
    return `skills/${second}.astro`;
  }

  // Unknown nested route — don't guess (avoids dead GitHub links).
  return null;
}

/**
 * Full GitHub blob URL for the source page that renders `currentPath`, or
 * `null` when no link should be shown.
 */
export function sourceUrlFor(currentPath: string): string | null {
  const rel = sourcePathFor(currentPath);
  return rel ? `${REPO_BLOB_BASE}/${rel}` : null;
}
