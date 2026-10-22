// L1 `purpose`: when to use which component. Delivered by enriching the description that
// `docs-show` already prints, not by a new tool: the agent has to open a component's page before
// it writes code with it (API_RULES, rule 3), and that is the moment the "not for this" matters.
// The enrichment happens one level below `@storybook/mcp`, in the manifest provider: the docgen
// shard a component's page is built from gets a guidance block appended to its description. The
// first lines (what `docs-list` shows, and the purpose from ADR-0176) stay where they were.
import { loadKnowledge } from './knowledge.mjs';
import { SNAPSHOT_ROOT } from './manifest-provider.mjs';

export const PURPOSE_INSTRUCTIONS = `## Choosing a component

Each component page from docs-show ends its description with "When to use", "When not to use" and "Related". Read these before you pick a component for a role in the UI. A "when not to use" entry outranks a name or an input list that looks like a fit: if the role you need is listed there, use what it names instead, or plain HTML, and say so. Do not bend a component to a job its page rules out.`;

// Both carry `{ components: { <id>: { name, description } } }`, and `@storybook/mcp` lets the
// manifest entry's description win over the docgen shard's, so both must be enriched.
export const COMPONENT_PAYLOAD =
  /(?:services\/core\/docgen\/[^/]+|manifests\/components)\.json$/;

/** @param {{ whenToUse: string[], whenNotToUse: Array<{ statement: string, useInstead?: string }>, related: string[] }} entry */
export function renderGuidance(entry) {
  const sections = [];
  if (entry.whenToUse.length > 0) {
    sections.push(
      ['**When to use**', ...entry.whenToUse.map((item) => `- ${item}`)].join(
        '\n',
      ),
    );
  }
  if (entry.whenNotToUse.length > 0) {
    sections.push(
      [
        '**When not to use**',
        ...entry.whenNotToUse.map(
          ({ statement, useInstead }) =>
            `- ${statement}${useInstead ? ` Use instead: ${useInstead}` : ''}`,
        ),
      ].join('\n'),
    );
  }
  if (entry.related.length > 0)
    sections.push(`**Related:** ${entry.related.join(', ')}`);
  return sections.join('\n\n');
}

/**
 * @param {{ root?: string }} [options] `root`: snapshot root, a parameter for tests
 */
export function createPurposeLayer({ root = SNAPSHOT_ROOT } = {}) {
  return {
    id: 'purpose',
    summary:
      'when-to-use, anti-patterns and related components appended to each docs-show page (L1)',
    instructions: [PURPOSE_INSTRUCTIONS],
    transformManifest(manifestPath, text) {
      if (!COMPONENT_PAYLOAD.test(manifestPath)) return text;
      const knowledge = loadKnowledge(root, 'components');
      const shard = JSON.parse(text);
      for (const component of Object.values(shard.components ?? {})) {
        const entry = knowledge[component.name];
        if (!entry) continue;
        const guidance = renderGuidance(entry);
        if (!guidance) continue;
        component.description = [component.description, guidance]
          .filter(Boolean)
          .join('\n\n');
      }
      return JSON.stringify(shard);
    },
  };
}
