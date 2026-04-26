/**
 * Central glossary for the Jargon tooltip.
 * Keys are the canonical term names — use them as the `term` prop.
 */
export interface GlossaryEntry {
  /** Short, human definition (1–2 sentences, used inside the tooltip). */
  definition: string;
  /** Optional concrete example or "where to find it" hint. */
  hint?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  MCP: {
    definition:
      'Model Context Protocol — a JSON-RPC standard that lets AI assistants call structured tools on external servers, instead of guessing from training data.',
    hint: 'In this workshop: three Storybook MCP servers expose component props to Claude Code.',
  },

  'node ID': {
    definition:
      'The unique identifier of a Figma layer, e.g. 695:313. You pass it to the figma-console MCP so Claude can read that exact component.',
    hint: 'Find it in the Figma URL after ?node-id= — or right-click a frame → Copy/Paste → Copy link.',
  },

  boundVariables: {
    definition:
      'A field in the figma-console MCP response that lists every design property of a frame (fills, padding, radius, …) mapped to its Figma variable name.',
    hint: 'Each Figma variable name is identical to the CSS custom property in Atelier — no translation needed.',
  },

  'CLAUDE.md': {
    definition:
      'A project-root file that Claude Code loads automatically at the start of every session — like a README written specifically for the AI.',
    hint: 'Put MCP server names, design token conventions, and project-specific guardrails here.',
  },

  'llms.txt': {
    definition:
      'A proposed web standard (short index file at /llms.txt) that tells LLM agents where to find machine-readable docs for a site.',
    hint: 'Analogous to robots.txt, but for AI crawlers instead of search engines.',
  },

  'well-known file': {
    definition:
      'A URL at a predictable path (usually under /.well-known/…) that machines check for metadata, following RFC 8615.',
    hint: 'Examples: /.well-known/security.txt, /.well-known/mcp/server-card.json.',
  },

  'tree-shakeable': {
    definition:
      'A package where the bundler can statically remove unused exports from your final bundle — so importing only LlmButton does not pull in LlmDialog code.',
    hint: 'Requires ES module imports (`import { … } from`). CommonJS `require` usually defeats it.',
  },

  'signal input': {
    definition:
      'Angular’s modern reactive input primitive — `input()` returns a signal that components can `.read()` reactively. Replaces @Input() + getters.',
    hint: 'Part of Angular’s signal-based reactivity, introduced in v17 and stabilized in later versions.',
  },

  'composition API': {
    definition:
      'Vue 3’s function-based component API using `<script setup>`, `ref()`, `computed()`, and `defineProps()` — replaces the Options API.',
    hint: 'Atelier Vue components assume composition API throughout.',
  },

  'flat API': {
    definition:
      'An API where each component exposes a small, flat set of props (no deep nesting, no required context providers) so an LLM can reason about it in one prompt.',
    hint: 'Trade-off: you sometimes repeat props across related components instead of sharing via context.',
  },

  'JSON-RPC': {
    definition:
      'A lightweight remote-procedure-call protocol that sends JSON-formatted method names and arguments over HTTP.',
    hint: 'MCP servers speak JSON-RPC: the client sends `{ method: "tools/call", params: { … } }` and gets a typed result back.',
  },

  'design tokens': {
    definition:
      'Named design values (colors, spacings, radii, type scales) stored as variables — so "primary color" has one canonical name instead of a hex code copy-pasted everywhere.',
    hint: 'In Atelier, tokens live as CSS custom properties like `--ui-color-primary`, and they mirror the variable names in the Figma file 1:1.',
  },
};
