/**
 * Docgen-provider worker (Angular and Vue, which run Storybook's docgen server):
 * puts the owned `purpose` in front of each component's description. Loaded by
 * Storybook in a separate thread through an `experimental_docgenProvider`
 * descriptor, so it must be plain .mjs and take structured-clone-able options.
 * The join lives in tools/scripts/lib/purpose-description.js (R-221).
 */
import { createRequire } from 'node:module';

const { withPurpose } = createRequire(import.meta.url)(
  '../scripts/lib/purpose-description.js',
);

/** @param {{ purposes: Record<string, string> }} options */
export function createDocgenProvider({ purposes }) {
  return (next) => async (input) => {
    const payload = await next(input);
    if (!payload || typeof payload.name !== 'string') return payload;
    const description = withPurpose(
      purposes,
      payload.name,
      payload.description,
    );
    return description === payload.description
      ? payload
      : { ...payload, description };
  };
}
