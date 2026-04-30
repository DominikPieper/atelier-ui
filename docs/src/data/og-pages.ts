// Registry consumed by both src/pages/og/[...slug].png.ts (which renders the
// Open Graph card per slug) and src/layouts/BaseLayout.astro (which sets
// <meta property="og:image"> only when a slug is present in this map).
//
// Slug is the URL path with the leading slash stripped. The homepage uses
// "index" because OGImageRoute can't param-match an empty string.

export const OG_PAGES = {
  index: {
    title: 'Atelier',
    description:
      'Build UIs with AI, Storybook, and Figma. Framework-agnostic components for Angular, React, and Vue.',
  },
  workshop: {
    title: 'Workshop Setup',
    description:
      'Set up the Atelier workshop end-to-end — monorepo, dependencies, Storybook, and AI tooling.',
  },
  install: {
    title: 'Installation',
    description:
      'Install Atelier UI for Angular, React, or Vue — npm, pnpm, and yarn commands plus tokens and components.',
  },
  mcp: {
    title: 'MCP Playground',
    description:
      'Explore the Model Context Protocol servers that power AI-assisted Atelier development.',
  },
  figma: {
    title: 'Figma',
    description:
      'Figma as the design source of truth — component frames, design tokens, and the design-to-code workflow.',
  },
  'figma-token': {
    title: 'Figma Setup',
    description:
      'Connect Figma to the Atelier workflow — personal access token, figma-console MCP, and design tokens.',
  },
  storybook: {
    title: 'Storybook',
    description:
      'Storybook as a live component explorer — stories per framework, MCP-backed docs, and visual tests.',
  },
  components: {
    title: 'Components',
    description:
      'Atelier UI component library — buttons, inputs, dialogs, and more with framework-agnostic APIs.',
  },
  patterns: {
    title: 'Cookbook Patterns',
    description:
      'Reusable Atelier UI patterns — form layouts, data tables, dialogs, and other multi-component recipes.',
  },
  tutorial: {
    title: 'Figma to Code Tutorial',
    description:
      'Step-by-step tutorial for turning a Figma component into framework-agnostic Atelier UI code.',
  },
  'first-component': {
    title: 'First Component (kata)',
    description:
      'A 15-minute kata. Open the Figma frame, paste the prompt, save the output, compare.',
  },
  'agent-skills': {
    title: 'Agent Skills',
    description:
      'Claude Code agent skills for Atelier UI — framework-specific Storybook skills.',
  },
  'claude-md': {
    title: 'CLAUDE.md Template',
    description:
      'A drop-in CLAUDE.md template for Atelier UI projects — primes Claude Code to use the library correctly.',
  },
  prompts: {
    title: 'Prompt Templates',
    description:
      'Battle-tested prompt templates for building Atelier UI components with Claude.',
  },
  llms: {
    title: 'llms.txt',
    description:
      'Machine-readable llms.txt for Atelier UI — structured context AI assistants can load without scraping HTML.',
  },
  'design-principles': {
    title: 'LLM-Optimized APIs',
    description:
      'API shapes that help language models generate correct, idiomatic component code on the first try.',
  },
  tokens: {
    title: 'Design Tokens',
    description:
      'The Atelier UI design token system — colors, spacing, radii, and typography from Figma to component.',
  },
  accessibility: {
    title: 'Accessibility',
    description:
      'Accessibility stance for Atelier UI — WCAG 2.1 AA, non-color indicators, keyboard maps, and screen readers.',
  },
  'a11y-workflow': {
    title: 'Accessibility Audit Workflow',
    description:
      'Three-source a11y audit loop using axe-core, Figma a11y audit, and a static spec read — coordinated through MCPs.',
  },
  troubleshooting: {
    title: 'Troubleshooting',
    description:
      'Fixes for common Atelier setup issues — MCP servers, Figma tokens, Storybook wiring, and workflow gotchas.',
  },
} as const satisfies Record<string, { title: string; description: string }>;

export type OgSlug = keyof typeof OG_PAGES;

export function slugFromPath(currentPath: string): string {
  if (currentPath === '/') return 'index';
  return currentPath.replace(/^\//, '').replace(/\/$/, '');
}

export function isOgSlug(slug: string): slug is OgSlug {
  return slug in OG_PAGES;
}
