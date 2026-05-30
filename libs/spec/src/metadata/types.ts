/**
 * Component metadata — the agent-readable context layer for every spec
 * interface in libs/spec/src/index.ts.
 *
 * Why this exists: `LlmButtonSpec` tells the type checker what shape the
 * props have; it does not tell an LLM agent *why* the component exists,
 * *when* to reach for it, or *when not to*. Without that context the agent
 * reverse-engineers it from source or — worse — invents it. A co-located
 * metadata file gives every agent the same starting context a senior
 * developer carries in their head.
 *
 * The fields are not optional. `tools/scripts/check-metadata.js` fails the
 * build when any spec interface lacks a populated metadata file. The
 * generator at `tools/scripts/gen-llms-txt.mjs` merges these fields into
 * `docs/public/llms-full.txt` so the public LLM index carries the same
 * intent as the codebase.
 *
 * Stories source `parameters.docs.description.component` from
 * `metadata.purpose` so Storybook's UI, the generated llms.txt, and the
 * codebase never drift apart.
 */
export interface ComponentMetadata {
  /** Spec interface names covered by this metadata file. Most components
   *  have a single spec (`['LlmButtonSpec']`); compound components
   *  cover several (`['LlmTableSpec', 'LlmTbodySpec', 'LlmTrSpec',
   *  'LlmThSpec', 'LlmTdSpec']`). Every name must exactly match an
   *  exported interface in `libs/spec/src/index.ts`. */
  specNames: string[];

  /** One sentence describing what the component does. Becomes the story
   *  description and the leading line in the component's llms.txt block. */
  purpose: string;

  /** Concrete situations in which this component is the right reach. */
  whenToUse: string[];

  /** Anti-patterns: situations where an agent might be tempted to use
   *  this component but shouldn't. `useInstead` names the correct
   *  component or pattern. */
  antiPatterns: { pattern: string; useInstead: string }[];

  /** Spec interface names this component composes with or pairs with.
   *  Helps agents discover related components without scanning the
   *  entire library. */
  relatedComponents: string[];

  /** Supported variant combinations. Each entry is an axis -> value map
   *  (e.g. `{ variant: 'primary', size: 'md' }`). The drift-gate verifies
   *  that every member of every axis union tracked in
   *  `tools/scripts/lib/component-axes.js` appears at least once. */
  variantMatrix: Record<string, string | number | boolean>[];

  /** ARIA role and keyboard behavior summary for AI-driven accessibility
   *  checks. `role` is the canonical ARIA role (or `'none'` for
   *  decorative components). `keyboardBehavior` is a short prose
   *  description of how the component responds to keys. */
  accessibility: { role: string; keyboardBehavior: string };
}
