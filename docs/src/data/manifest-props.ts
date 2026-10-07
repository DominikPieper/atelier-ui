/**
 * Build-time prop tables, read from the three Storybook docgen manifests
 * (`dist/storybook/<fw>/manifests/components.json`) instead of being written
 * out by hand in components.ts (ADR-0121: props, defaults and descriptions are
 * generated from the manifest; ADR-0149: no silent empty table).
 *
 * Node-only (fs/path): import from `.astro` frontmatter, never from client
 * code. The extraction and the slug -> manifest-entry resolution live in
 * tools/scripts/lib/manifest-props.js, so the docs, `gen-llms-txt.mjs`,
 * `check-defaults.js` and the `check:storybook-manifests` gate all read the
 * manifests the same way.
 *
 * Fails the build — it never returns an empty table — when a manifest is
 * missing, or when a documented component has no entry in it. The only
 * declared gaps are MANIFEST_GAPS in that library file.
 */
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { componentDocs } from './components';
import { storybookComponentId } from '../lib/storybook-id';

export type Framework = 'angular' | 'react' | 'vue';
export const FRAMEWORKS: readonly Framework[] = ['angular', 'react', 'vue'];

export type ManifestRowKind = 'input' | 'output' | 'event' | 'slot' | 'prop';

export interface ManifestRow {
  name: string;
  type: string;
  default: string;
  description: string;
  required: boolean;
  kind: ManifestRowKind;
}

/** What one framework's manifest says about one documented component. */
export interface ComponentApi {
  /** The component's own rows, or null for a declared MANIFEST_GAPS component. */
  props: ManifestRow[] | null;
  /**
   * Rows per composition part (`AtlOption`, `AtlTd`, ...), keyed by part name.
   * null where the part is not a story's `meta.component` in this framework,
   * so the manifest has no entry for it: the caller falls back to the rows
   * that components.ts still carries for that part.
   */
  parts: Record<string, ManifestRow[] | null>;
}

interface ManifestLib {
  docsApi(
    fw: Framework,
    root: string,
    docs: typeof componentDocs,
    idOf: typeof storybookComponentId,
  ): Record<string, ComponentApi>;
}

function findRepoRoot(start: string): string {
  let dir = start;
  while (!existsSync(join(dir, 'nx.json'))) {
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(
        `manifest-props: repo root (nx.json) not found walking up from ${start}`,
      );
    }
    dir = parent;
  }
  return dir;
}

// Resolved from the repo root (found via nx.json), not import.meta.url: Astro
// bundles this module into a prerender chunk at a different directory depth.
const root = findRepoRoot(process.cwd());
const lib = createRequire(join(root, 'package.json'))(
  './tools/scripts/lib/manifest-props.js',
) as ManifestLib;

let all: Record<Framework, Record<string, ComponentApi>> | undefined;

/** The manifest API of one docs component (slug, e.g. `radio-group`), all frameworks. */
export function manifestApiFor(slug: string): Record<Framework, ComponentApi> {
  if (!all) {
    try {
      all = {
        angular: lib.docsApi(
          'angular',
          root,
          componentDocs,
          storybookComponentId,
        ),
        react: lib.docsApi('react', root, componentDocs, storybookComponentId),
        vue: lib.docsApi('vue', root, componentDocs, storybookComponentId),
      };
    } catch (e) {
      throw new Error(`manifest-props: ${(e as Error).message}`);
    }
  }
  if (!(slug in componentDocs)) {
    throw new Error(`manifest-props: no docs component '${slug}'.`);
  }
  return {
    angular: all.angular[slug],
    react: all.react[slug],
    vue: all.vue[slug],
  };
}
