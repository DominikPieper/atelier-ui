// Server `instructions`: the rules that reach the agent before it calls any tool (the
// `initialize` response). Layers contribute their own sections (see layers.mjs); a version note
// goes first so a mismatch is the first thing read.

/**
 * Hard rules of the base layer. Every claim here was checked against the repo: the tokens import
 * is the one libs/angular/README.md prescribes, component CSS comes in through each component's
 * own `styleUrl`.
 */
export const API_RULES = `## Atelier UI (@atelier-ui/angular)

Fixed rules for the Angular library "@atelier-ui/angular":

1. Include the design tokens once, in the app's global stylesheet: \`@import '@atelier-ui/angular/styles/tokens.css';\`. Components bring their own CSS, but without the tokens they render without colours, spacing and type.
2. Style only with the library's \`--ui-*\` custom properties. Never write raw colour values (hex, rgb, hsl) and never invent a token name; a token that no docs page shows does not exist.
3. Call docs-list and docs-show before writing code that uses a component. Use only the inputs and outputs docs-show lists; never guess ids or props.
4. Write no CSS for Atelier components and invent no CSS classes. Choose a documented variant or size instead.
5. Components are standalone: import the class docs-show names (for example \`AtlButton\`) from "@atelier-ui/angular" into the consuming component's \`imports\`.`;

/**
 * @param {{ versionNote?: string | null, layers: Array<{ instructions?: string[] }> }} input
 * @returns {string}
 */
export function buildInstructions({ versionNote, layers }) {
  const sections = [];
  if (versionNote) sections.push(versionNote);
  for (const layer of layers) sections.push(...(layer.instructions ?? []));
  return sections.join('\n\n');
}
