import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// The Day 2 component briefs. The single source is `workshop/briefs/*.md` at the
// repo root (also read by the trainer, the design-to-code skill and GitHub);
// the docs site renders those files in place instead of keeping a copy.
const briefs = defineCollection({
  loader: glob({ pattern: '*.md', base: '../workshop/briefs' }),
});

export const collections = { briefs };
