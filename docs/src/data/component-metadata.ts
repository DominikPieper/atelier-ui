/// <reference types="vite/client" />
/**
 * Slug -> component metadata, shared by the docs data that reads it
 * (accessibility.ts, the description below). The mapping comes from the
 * metadata index itself (DOCS_PRIMARY_SPECS and COMPONENT_METADATA_REGISTRY),
 * so a new component is wired in one place. The metadata files are committed
 * TypeScript data, so the docs build needs no Storybook build.
 *
 * Server-side only (Astro frontmatter): the result reaches client islands as
 * props, so the metadata does not ship in the client bundle.
 */
import {
  COMPONENT_METADATA_REGISTRY,
  DOCS_PRIMARY_SPECS,
} from '@atelier-ui/spec/metadata/index';
import type { ComponentMetadata } from '@atelier-ui/spec/metadata/types';
import { ALL_COMPONENTS, componentDocs } from './components';

const modules = import.meta.glob<{ metadata: ComponentMetadata }>(
  '../../../libs/spec/src/metadata/*.metadata.ts',
  { eager: true },
);

/** The metadata of one docs component (slug, e.g. `radio-group`), if it has any. */
export function metadataFor(slug: string): ComponentMetadata | undefined {
  const spec = Object.keys(DOCS_PRIMARY_SPECS).find(
    (s) => DOCS_PRIMARY_SPECS[s] === slug,
  );
  const file = spec ? COMPONENT_METADATA_REGISTRY[spec] : undefined;
  if (!file) return undefined;
  return modules[`../../../libs/spec/src/metadata/${file}.metadata.ts`]
    ?.metadata;
}

/**
 * The one-sentence description of a docs component: `metadata.purpose` when
 * the component has metadata, else the hand-written `componentDocs`
 * description (toast and code-block, which have no metadata file). Undefined
 * only if neither exists; callers render nothing then, never an empty string.
 */
export function descriptionFor(slug: string): string | undefined {
  return metadataFor(slug)?.purpose || componentDocs[slug]?.description;
}

/** `descriptionFor` for every docs component, for client islands (the gallery). */
export function allDescriptions(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slug of ALL_COMPONENTS) {
    const d = descriptionFor(slug);
    if (d) out[slug] = d;
  }
  return out;
}
