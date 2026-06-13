// Single source of truth for the numbered 1–8 workshop learning path.
//
// The sidebar WORKSHOP group (BaseLayout.astro), the in-page prev/next pager
// (TrackNav.astro), and any "Step N of 8" indicator all derive from this one
// ordered array — so the path's order, labels, and icons stay consistent
// across every surface. Adding/reordering a step here updates them all.
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

export const WORKSHOP_TRACK: readonly TrackStep[] = [
  { step: 1, href: '/', label: 'Overview', icon: 'dashboard' },
  { step: 2, href: '/schulung', label: 'Schulung (2 Tage)', icon: 'schedule' },
  { step: 3, href: '/workshop', label: 'Setup', icon: 'build_circle', title: 'Workshop setup' },
  { step: 4, href: '/figma-token', label: 'Figma access', icon: 'cable' },
  { step: 5, href: '/tutorial', label: 'Tutorial', icon: 'school' },
  { step: 6, href: '/design-to-code', label: 'Design to code', icon: 'schema' },
  { step: 7, href: '/first-component', label: 'First component', icon: 'check_circle' },
  { step: 8, href: '/patterns', label: 'Patterns', icon: 'menu_book' },
];

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
