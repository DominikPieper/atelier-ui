// Single source of truth for the numbered workshop learning path.
//
// The sidebar WORKSHOP group (BaseLayout.astro), the in-page prev/next pager
// (TrackNav.astro), and any "Step N of M" indicator all derive from this one
// ordered array — so the path's order, labels, and icons stay consistent
// across every surface. Adding/reordering/removing a step here updates them all.
//
// `step` is DERIVED from array position (1-based), never hand-numbered: the
// array below is the order, and the exported `WORKSHOP_TRACK` stamps the badge
// number from each entry's index. So removing the second entry renumbers the
// rest automatically and `TRACK_LENGTH` follows the array length.
//
// Each entry mirrors exactly what the sidebar rendered before this extraction:
// the same href, the same visible label, and the same Material icon name.

export interface TrackStep {
  /** 1-based position in the path, matching the sidebar's numbered badge. */
  step: number;
  /** Route the step links to. */
  href: string;
  /** Visible label, identical across nav surfaces. */
  label: string;
  /** Material icon name (rendered via the Icon component in the sidebar). */
  icon: string;
  /**
   * Optional fuller title for pager cards / hero indicators where the short
   * sidebar `label` reads too terse. Falls back to `label` when omitted.
   */
  title?: string;
}

/** The ordered path, without step numbers — those are derived below. */
const TRACK_ORDER: readonly Omit<TrackStep, 'step'>[] = [
  { href: '/', label: 'Overview', icon: 'dashboard' },
  { href: '/workshop', label: 'Setup', icon: 'build_circle', title: 'Workshop setup' },
  { href: '/figma-token', label: 'Figma access', icon: 'cable' },
  { href: '/tutorial', label: 'Tutorial', icon: 'school' },
  { href: '/design-to-code', label: 'Design to code', icon: 'schema' },
  { href: '/first-component', label: 'First component', icon: 'check_circle' },
  { href: '/patterns', label: 'Patterns', icon: 'menu_book' },
];

export const WORKSHOP_TRACK: readonly TrackStep[] = TRACK_ORDER.map((s, i) => ({
  ...s,
  step: i + 1,
}));

/** Total number of steps — for "Step N of {TRACK_LENGTH}" copy. */
export const TRACK_LENGTH = WORKSHOP_TRACK.length;

/**
 * Normalise a pathname to its track key. Strips a trailing slash (Astro can
 * emit either form) so `/tutorial/` and `/tutorial` both match. The root `/`
 * is preserved as-is.
 */
function normalize(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.replace(/\/$/, '');
}

/**
 * The track step for a pathname, or `undefined` when the page is not on the
 * 1–8 path. Use this to decide whether to render track-only chrome.
 */
export function getTrackStep(pathname: string): TrackStep | undefined {
  const path = normalize(pathname);
  return WORKSHOP_TRACK.find((s) => s.href === path);
}

/**
 * The previous/next steps around a pathname on the track. Returns
 * `{ prev: undefined, next: undefined }` when the page is off-track. The first
 * step has no `prev`; the last has no `next`.
 */
export function getPrevNext(pathname: string): {
  prev: TrackStep | undefined;
  next: TrackStep | undefined;
} {
  const current = getTrackStep(pathname);
  if (!current) return { prev: undefined, next: undefined };
  const i = current.step - 1; // step is 1-based
  return {
    prev: i > 0 ? WORKSHOP_TRACK[i - 1] : undefined,
    next: i < WORKSHOP_TRACK.length - 1 ? WORKSHOP_TRACK[i + 1] : undefined,
  };
}
