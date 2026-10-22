// L5 `composition`: which arrangements of components are wrong, from the cookbook patterns. Like
// L1 it is delivered inside `docs-show`, not as a tool: an agent that is about to nest a tab group
// in a tab group has opened the tab group's page, and that page is where the warning has to be.
// A pattern spans several components, so each component's page lists the patterns it appears in.
//
// A component that appears in more than SUBJECT_MAX patterns (AtlButton, AtlCard) is a building
// block, not the subject of any of them; a pattern's warnings do not belong on its page, so it gets
// one index line per pattern. The cut is derived from the data, nothing names a component here.
import { COMPONENT_PAYLOAD } from './layer-purpose.mjs';
import { loadKnowledge } from './knowledge.mjs';
import { SNAPSHOT_ROOT } from './manifest-provider.mjs';

export const SUBJECT_MAX = 2;

export const COMPOSITION_INSTRUCTIONS = `## Composing several components

A component page from docs-show can end with "Composition patterns": the cookbook patterns the component appears in, with "Not for" (layouts the pattern is the wrong choice for, and what to use instead) and "Common mistakes". Read them before you arrange components into a screen. A layout listed under "Not for" is ruled out: use the alternative it names, and say so. Do not nest a component in another of its own kind unless a page shows it.`;

/**
 * @param {{ id: string, title: string, components: string[], whenNotToUse: string[], pitfalls: string[] }} pattern
 * @param {string} name the component whose page is being rendered
 * @param {boolean} detailed
 */
function renderPattern(pattern, name, detailed) {
  const others = pattern.components.filter((component) => component !== name);
  const head = `- **${pattern.title}**${others.length > 0 ? ` (with ${others.join(', ')})` : ''}`;
  if (!detailed) return head;
  const lines = [head];
  if (pattern.whenNotToUse.length > 0)
    lines.push('  Not for:', ...pattern.whenNotToUse.map((s) => `  - ${s}`));
  if (pattern.pitfalls.length > 0)
    lines.push(
      '  Common mistakes:',
      ...pattern.pitfalls.map((s) => `  - ${s}`),
    );
  return lines.join('\n');
}

/**
 * @param {Array<{ id: string, title: string, components: string[], whenNotToUse: string[], pitfalls: string[] }>} patterns
 * @param {string} name component name, for example AtlDialog
 * @returns {string} the block to append, or '' when the component is in no pattern
 */
export function renderComposition(patterns, name) {
  const using = patterns.filter((pattern) => pattern.components.includes(name));
  if (using.length === 0) return '';
  const detailed = using.length <= SUBJECT_MAX;
  return [
    '**Composition patterns** (cookbook patterns this component appears in)',
    ...using.map((pattern) => renderPattern(pattern, name, detailed)),
  ].join('\n');
}

/**
 * @param {{ root?: string }} [options] `root`: snapshot root, a parameter for tests
 */
export function createCompositionLayer({ root = SNAPSHOT_ROOT } = {}) {
  return {
    id: 'composition',
    summary:
      'cookbook patterns, their wrong-choice cases and pitfalls appended to the docs-show page of each component they use (L5)',
    instructions: [COMPOSITION_INSTRUCTIONS],
    transformManifest(manifestPath, text) {
      if (!COMPONENT_PAYLOAD.test(manifestPath)) return text;
      const { patterns } = loadKnowledge(root, 'patterns');
      const shard = JSON.parse(text);
      for (const component of Object.values(shard.components ?? {})) {
        const block = renderComposition(patterns, component.name);
        if (!block) continue;
        component.description = [component.description, block]
          .filter(Boolean)
          .join('\n\n');
      }
      return JSON.stringify(shard);
    },
  };
}
