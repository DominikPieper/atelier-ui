'use strict';
/**
 * A recorded input hash for a built Storybook (`dist/storybook/<fw>`), and the check
 * that compares it with the source as it is now.
 *
 * `check:paint` renders the BUILT Storybook, not the source, so it can pass or fail
 * on a component's old CSS without anyone noticing. The build writes this stamp when
 * it finishes (`tools/scripts/storybook-build.mjs`, which every `build-storybook`
 * target runs); `check:paint` verifies it before it measures anything. A hash, not
 * an mtime: a `git checkout`, a rebase or a touch changes an mtime without changing
 * a byte, and an edit that restores the old mtime changes bytes without a mtime.
 *
 * The inputs are the same kind of thing `parity-inputs.js` hashes for the parity
 * record (and the hash function is the same one): the framework's own sources,
 * stories and overrides, the shared `libs/styles` sheets every framework imports,
 * the spec the stories import, and the framework's `.storybook` config. Spec/test
 * files are skipped, as there: Storybook never renders them.
 */

const fs = require('fs');
const path = require('path');
const { ROOT, hashFiles, walkFiles } = require('./parity-inputs');

/** Where the stamp sits: inside the build, so a rebuild replaces it and a deleted build takes it along. */
function stampPath(fw) {
  return path.join(ROOT, 'dist/storybook', fw, '.atelier-inputs.json');
}

/** Sorted repo-relative paths of everything the framework's Storybook build reads from source. */
function storybookInputFiles(fw) {
  const abs = [];
  for (const dir of [
    `libs/${fw}/src`,
    `libs/${fw}/.storybook`,
    'libs/styles/src',
    'libs/spec/src',
  ]) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full)) walkFiles(full, abs);
  }
  return abs
    .map((a) => path.relative(ROOT, a).split(path.sep).join('/'))
    .sort();
}

/** `{ hash, files }`: the overall hash and a per-file one, so a stale build can name what changed. */
function computeStamp(fw) {
  const inputs = storybookInputFiles(fw);
  const files = {};
  for (const rel of inputs) files[rel] = hashFiles([rel]).slice(7, 19);
  return { fw, hash: hashFiles(inputs), files };
}

function writeStamp(fw, stamp) {
  fs.writeFileSync(stampPath(fw), JSON.stringify(stamp) + '\n');
}

/**
 * Compare the stamp the build recorded with the source now. Returns null when they
 * agree, otherwise a `[STALE]` message naming the newest changed input.
 */
function staleReason(fw) {
  const rel = path.relative(ROOT, path.join(ROOT, 'dist/storybook', fw));
  const rebuild =
    `Rebuild it: \`nx run ${fw}:build-storybook\` ` +
    '(or `npm run check:storybook-manifests`, which builds all three).';
  const file = stampPath(fw);
  if (!fs.existsSync(file)) {
    return (
      `[STALE] ${rel} has no input stamp (${path.relative(ROOT, file)}), so nothing says which source it was ` +
      `built from — it predates the stamp or was not built by the \`build-storybook\` target. ${rebuild}`
    );
  }
  let recorded;
  try {
    recorded = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return `[STALE] ${rel}'s input stamp is not valid JSON. ${rebuild}`;
  }
  const now = computeStamp(fw);
  if (recorded.hash === now.hash) return null;
  const was = recorded.files || {};
  const changed = [
    ...Object.keys(now.files).filter((f) => was[f] !== now.files[f]),
    ...Object.keys(was).filter((f) => !(f in now.files)),
  ];
  const mtime = (f) => {
    try {
      return fs.statSync(path.join(ROOT, f)).mtimeMs;
    } catch {
      return 0; // removed since the build
    }
  };
  changed.sort((a, b) => mtime(b) - mtime(a) || a.localeCompare(b));
  const newest = changed[0];
  const when = mtime(newest)
    ? ` (modified ${new Date(mtime(newest)).toISOString()})`
    : ' (removed)';
  return (
    `[STALE] ${rel} was built from different source than the tree holds now: ${changed.length} input(s) ` +
    `changed since, newest ${newest}${when}` +
    (changed.length > 1
      ? `; also ${changed
          .slice(1, 4)
          .join(', ')}${changed.length > 4 ? ', …' : ''}`
      : '') +
    `. check:paint measures the build, not the source, so its result would describe the old one. ${rebuild}`
  );
}

module.exports = { stampPath, computeStamp, writeStamp, staleReason };
