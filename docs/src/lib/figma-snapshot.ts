/**
 * Build-time facts about the Atelier UI Figma file, read from
 * `tools/figma/snapshot.json` — the same artifact `check:figma` asserts against.
 *
 * Why this module exists: /figma used to state the token census and the component
 * matrix as prose literals, and both rotted. The 2026-08-28 review found "54 UI-tier
 * variables: 28 color…" against a live 78, and a component table still organised by
 * the P0/P1/P2 sections the file retired (the live sections are Action / Form /
 * Display / Overlay / Navigation / Feedback / AI) claiming "23 more…" for 39. Neither
 * number can rot again once it is derived from the snapshot at build time.
 *
 * Node-only (fs/path): import from `.astro` frontmatter, never from client code.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './skill-meta';

interface SnapshotComponent {
  /** `Section/Selector`, e.g. `Action/AtlButton`. */
  name: string;
  selector: string;
  variantAxes: Record<string, string[]>;
  /** Figma component properties; VARIANT entries duplicate `variantAxes`. */
  properties: Record<string, string>;
}

interface Snapshot {
  uiTokens: string[];
  components: SnapshotComponent[];
}

const snapshot: Snapshot = JSON.parse(
  readFileSync(join(repoRoot, 'tools/figma/snapshot.json'), 'utf-8'),
);

/**
 * The `Library Tokens` collection, counted by name prefix. This is the whole
 * collection, not the subset the masters happen to reference — `figma:snapshot`
 * pages the variable read explicitly so the count is a census.
 */
export const tokenCensus = (() => {
  const startsWith = (p: string) => snapshot.uiTokens.filter((n) => n.startsWith(p)).length;
  const census = {
    total: snapshot.uiTokens.length,
    color: startsWith('color/'),
    spacing: startsWith('spacing/'),
    radius: startsWith('radius/'),
    typography: snapshot.uiTokens.filter((n) =>
      /^(font|font-size|font-weight|line-height)\//.test(n),
    ).length,
    opacity: startsWith('opacity/'),
  };
  const covered =
    census.color + census.spacing + census.radius + census.typography + census.opacity;
  if (covered !== census.total) {
    throw new Error(
      `figma-snapshot: the token census covers ${covered} of ${census.total} variables — ` +
        `snapshot.json carries a name prefix this module does not know.`,
    );
  }
  return census;
})();

/** Figma section (`Action`, `Form`, …) in the order the snapshot first lists them. */
export const sections: string[] = [
  ...new Set(snapshot.components.map((c) => c.name.split('/')[0])),
];

export const masterCount: number = snapshot.components.length;

/** `padding: [none, sm, md, lg]` reads as "4 padding levels", not "4 paddings". */
const AXIS_NOUN: Record<string, string> = {
  variant: 'variants',
  size: 'sizes',
  state: 'states',
  padding: 'padding levels',
};

export interface MasterRow {
  selector: string;
  section: string;
  /** e.g. `4 variants (primary / secondary / outline / danger) × 3 sizes` */
  axes: string;
  /** Non-variant Figma properties, `#nodeId` suffix stripped. */
  booleans: string[];
}

function row(selector: string): MasterRow {
  const c = snapshot.components.find((x) => x.selector === selector);
  if (!c) {
    throw new Error(
      `figma-snapshot: no master named ${selector} in tools/figma/snapshot.json — ` +
        `/figma names a component the Figma file no longer has.`,
    );
  }
  return {
    selector: c.selector,
    section: c.name.split('/')[0],
    axes: Object.entries(c.variantAxes)
      .map(([axis, values]) => {
        const noun = AXIS_NOUN[axis] ?? `${axis}s`;
        return `${values.length} ${noun} (${values.join(' / ')})`;
      })
      .join(' × '),
    booleans: Object.entries(c.properties)
      .filter(([, kind]) => kind === 'BOOLEAN')
      .map(([name]) => name.split('#')[0]),
  };
}

/** The four masters /figma shows in full; every other master is counted, not listed. */
export const featuredRows: MasterRow[] = ['AtlButton', 'AtlInput', 'AtlCard', 'AtlBadge'].map(row);

export const remainingCount: number = masterCount - featuredRows.length;

/** A readable sample of what the counted remainder contains. */
export const remainingSample: string = snapshot.components
  .filter((c) => !featuredRows.some((f) => f.selector === c.selector))
  .slice(0, 9)
  .map((c) => c.selector.replace(/^Atl/, ''))
  .join(', ');
