// L2 `tokens`: the `--ui-*` tokens with their intent, and the styling rules a consumer's CSS is
// linted against. A token is not part of any component's page, so this layer is a tool the agent
// searches (`tokens-search`), plus an instructions section that says when to call it and lists the
// stylelint rules (short, and the one thing an agent cannot find out by searching).
import * as v from 'valibot';

import { loadKnowledge } from './knowledge.mjs';
import { SNAPSHOT_ROOT } from './manifest-provider.mjs';

export const TOOL_NAME = 'tokens-search';
const MAX_DETAILED = 15;

const words = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((word) => word.length >= 2);

function renderToken(token) {
  const lines = [
    `### ${token.name}`,
    `light: ${token.light ?? '(not declared)'}`,
  ];
  if (token.dark !== undefined && token.dark !== token.light)
    lines.push(`dark: ${token.dark}`);
  if (token.intent) lines.push(`Intent: ${token.intent}`);
  if (token.constraints?.length)
    lines.push('Constraints:', ...token.constraints.map((c) => `- ${c}`));
  return lines.join('\n');
}

/** Every token name, grouped by family (the segment after `--ui-`). */
function renderIndex(tokens) {
  const families = new Map();
  for (const { name } of tokens) {
    const family = name.replace(/^--ui-/, '').split('-')[0];
    families.set(family, [...(families.get(family) ?? []), name]);
  }
  return [
    `${tokens.length} tokens. Search by what you need for details; names only:`,
    ...[...families].map(
      ([family, names]) => `- ${family}: ${names.join(' ')}`,
    ),
  ].join('\n');
}

/**
 * @param {Array<{ name: string, intent?: string, constraints?: string[] }>} tokens
 * @param {string | undefined} query
 */
export function searchTokens(tokens, query) {
  const terms = words(query ?? '');
  if (terms.length === 0) return renderIndex(tokens);
  const scored = tokens
    .map((token) => {
      const name = token.name.toLowerCase();
      const rest =
        `${token.intent ?? ''} ${(token.constraints ?? []).join(' ')}`.toLowerCase();
      const score = terms.reduce(
        (sum, term) =>
          sum + (name.includes(term) ? 3 : 0) + (rest.includes(term) ? 1 : 0),
        0,
      );
      return { token, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.token.name.localeCompare(b.token.name),
    );
  if (scored.length === 0)
    return `No token matches "${query}". Try other words for the job (for example focus, disabled, height, transition, border, shadow), or call ${TOOL_NAME} without a query to list every token name. A token not listed does not exist.`;
  const shown = scored.slice(0, MAX_DETAILED);
  const more = scored.length - shown.length;
  return [
    ...shown.map(({ token }) => renderToken(token)),
    ...(more > 0 ? [`${more} more match; narrow the query to see them.`] : []),
  ].join('\n\n');
}

function renderRules(rules) {
  const lines = rules.map(
    ({ id, codes, summary }) =>
      `- \`${id}\`${codes.length ? ` (messages ${codes.map((c) => `[${c}]`).join(' ')})` : ''}: ${summary}`,
  );
  return lines.join('\n');
}

/**
 * @param {{ root?: string }} [options] `root`: snapshot root, a parameter for tests
 */
export function createTokensLayer({ root = SNAPSHOT_ROOT } = {}) {
  return {
    id: 'tokens',
    summary: `${TOOL_NAME} over the --ui-* tokens, and the stylelint rules for consumer CSS (L2)`,
    get instructions() {
      const { rules } = loadKnowledge(root, 'tokens');
      return [
        `## Styling next to Atelier components

Before you write any CSS of your own for colour, spacing, size, borders, focus, disabled state, shadow or motion, call ${TOOL_NAME} with words for the job (for example "focus", "disabled", "height", "transition") and bind the tokens it returns. It gives each token's light and dark value, what it is for, and the constraints on using it. A token it does not return does not exist; never invent one.

A workspace scaffolded for Atelier lints its CSS with these stylelint rules, so CSS that breaks them fails the build:

${renderRules(rules)}`,
      ];
    },
    register(server) {
      server.tool(
        {
          name: TOOL_NAME,
          description:
            'Search the Atelier --ui-* design tokens by what they are for (focus ring, disabled state, control height, transition, border, shadow, spacing, text colour...). Returns each matching token with its light and dark value, its intent and the constraints on using it. Call this before writing any CSS of your own next to Atelier components; with no query it lists every token name.',
          schema: v.object({
            query: v.optional(
              v.pipe(
                v.string(),
                v.description(
                  'Words for the job or the token name, for example "focus ring" or "disabled".',
                ),
              ),
            ),
          }),
        },
        async ({ query }) => {
          const { tokens } = loadKnowledge(root, 'tokens');
          return {
            content: [{ type: 'text', text: searchTokens(tokens, query) }],
          };
        },
      );
    },
  };
}
