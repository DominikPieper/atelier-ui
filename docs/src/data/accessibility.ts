/// <reference types="vite/client" />
/**
 * Accessibility facts for the docs pages, read from the component metadata
 * (libs/spec/src/metadata/*.metadata.ts, the one record that also feeds
 * llms-full.txt and the AI accessibility checks). The metadata files are
 * committed TypeScript data, so the docs build needs no Storybook build.
 *
 * The slug -> metadata module mapping comes from the metadata index itself
 * (DOCS_PRIMARY_SPECS and COMPONENT_METADATA_REGISTRY), so a new component
 * is wired in one place.
 */
import {
  COMPONENT_METADATA_REGISTRY,
  DOCS_PRIMARY_SPECS,
} from '@atelier-ui/spec/metadata/index';
import type { A11yInfo } from './components';
import type { ComponentMetadata } from '@atelier-ui/spec/metadata/types';

const modules = import.meta.glob<{ metadata: ComponentMetadata }>(
  '../../../libs/spec/src/metadata/*.metadata.ts',
  { eager: true },
);

/**
 * The keyboard table and notes of one docs component (slug, e.g.
 * `radio-group`), shaped for the page. Null when the component has no
 * metadata (toast, whose a11y components.ts still carries) or only the prose
 * `keyboardBehavior` and no table.
 */
export function a11yFor(slug: string): A11yInfo | null {
  const spec = Object.keys(DOCS_PRIMARY_SPECS).find(
    (s) => DOCS_PRIMARY_SPECS[s] === slug,
  );
  const file = spec ? COMPONENT_METADATA_REGISTRY[spec] : undefined;
  if (!file) return null;
  const mod = modules[`../../../libs/spec/src/metadata/${file}.metadata.ts`];
  const { role, relatedRoles, keyboard, notes } = mod.metadata.accessibility;
  if (!keyboard) return null;
  return { role: [role, ...(relatedRoles ?? [])].join(' / '), keyboard, notes };
}
