/// <reference types="vite/client" />
/**
 * Accessibility facts for the docs pages, read from the component metadata
 * (libs/spec/src/metadata/*.metadata.ts, the one record that also feeds
 * llms-full.txt and the AI accessibility checks). The metadata files are
 * committed TypeScript data, so the docs build needs no Storybook build.
 *
 * The slug -> metadata lookup is shared with the descriptions
 * (component-metadata.ts).
 */
import type { A11yInfo } from './components';
import { metadataFor } from './component-metadata';

/**
 * The keyboard table and notes of one docs component (slug, e.g.
 * `radio-group`), shaped for the page. Null when the component has no
 * metadata (toast, whose a11y components.ts still carries) or only the prose
 * `keyboardBehavior` and no table.
 */
export function a11yFor(slug: string): A11yInfo | null {
  const metadata = metadataFor(slug);
  if (!metadata) return null;
  const { role, relatedRoles, keyboard, notes } = metadata.accessibility;
  if (!keyboard) return null;
  return { role: [role, ...(relatedRoles ?? [])].join(' / '), keyboard, notes };
}
