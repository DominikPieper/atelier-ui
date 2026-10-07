/**
 * Prop tables for the docs pages, read from the committed props projection
 * (props.generated.json). tools/scripts/gen-props-projection.mjs writes it from
 * the three Storybook docgen manifests (ADR-0121: props, defaults and
 * descriptions are generated from the manifest; ADR-0149: no silent empty
 * table), and `check:props-projection` keeps it in step with them. The docs
 * build reads the JSON only, so it needs no Storybook build.
 *
 * Never returns an empty table: an unknown slug throws. A null `props` is the
 * declared MANIFEST_GAPS case (toast), where components.ts keeps the rows.
 */
import projection from './props.generated.json';

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

const all = projection as unknown as Record<
  string,
  Record<Framework, ComponentApi>
>;

/** The manifest API of one docs component (slug, e.g. `radio-group`), all frameworks. */
export function manifestApiFor(slug: string): Record<Framework, ComponentApi> {
  const api = all[slug];
  if (!api) {
    throw new Error(
      `manifest-props: no '${slug}' in props.generated.json. Run \`npm run gen:props-projection\`.`,
    );
  }
  return api;
}
