/**
 * Maintainer-only pages (owner decision 2026-10-10): rendered by `astro dev`,
 * absent from `astro build`.
 *
 * The page files live under docs/src/pages/_maintainer/. Astro ignores
 * underscore-prefixed paths when it scans src/pages, so they are not routes by
 * themselves; this integration injects each one at its public URL, and only
 * when the command is `dev`. In a production build the route never exists, so
 * there is no HTML, no sitemap entry, no pagefind or llms output for it.
 * Gates that read docs/src/pages recursively still see the source text.
 *
 * Adding a maintainer page: put it in src/pages/_maintainer/, add one entry
 * below, and guard every link to it with `import.meta.env.DEV` (see
 * BaseLayout's nav). Block-level content inside a public page uses
 * components/MaintainerOnly.astro instead.
 */
const MAINTAINER_PAGES = [
  { pattern: '/runbook', entrypoint: './src/pages/_maintainer/runbook.astro' },
];

export default function maintainerPages() {
  return {
    name: 'atelier-maintainer-pages',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        for (const page of MAINTAINER_PAGES) injectRoute(page);
      },
    },
  };
}
