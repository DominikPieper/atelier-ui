'use strict';

/**
 * storybook-version-lockstep
 *
 * Every package in the Storybook family — `storybook` itself, every
 * `@storybook/*` package, and `eslint-plugin-storybook` — must be pinned to
 * the exact same version in the workspace root `package.json`.
 *
 * Why this matters (measured 2026-09-12): `storybook automigrate` fires an
 * `addon-mcp` fix whenever it detects an AI coding agent in the environment,
 * and that fix bumps the addon to `latest` even when it is already correctly
 * pinned — confirmed by running `automigrate --dry-run` against this
 * already-current, exact-pinned repo. Nothing before this rule guarded the
 * pinning at all: 12 packages of the family, 11 pinned exactly at the same
 * version, and no gate or rule asserted it. This repo already has scar
 * tissue for exactly this failure shape — one package of a family moving
 * without the rest — see ADR-0053, and the `@nx/eslint@23.1.2` /
 * `@nx/devkit@23.1.1` mismatch documented in
 * `libs/create-workspace/src/generators/preset/preset.ts`, "measured, and it
 * broke CI the day 23.1.2 was published".
 *
 * What this rule checks, on `package.json`'s `dependencies` and
 * `devDependencies` sections:
 *   1. Every Storybook-family entry's version is EXACT — no `^`, `~`, `x`,
 *      `*`, a range, a URL, or a tag like `latest`. A non-exact entry can
 *      drift on its own, silently, on the next `npm install` or the next
 *      automigrate run — reported as `notExact`.
 *   2. Among the exact entries, all must agree on ONE version — the most
 *      common one across the family (ties broken by the lexicographically
 *      smaller version, so the choice is deterministic). Any entry that
 *      disagrees is reported as `lockstepMismatch`, naming both its own
 *      version and the version the rest of the family is pinned to.
 *
 * The family is DERIVED from the file — matched by name (`storybook`,
 * `eslint-plugin-storybook`, or a `@storybook/` prefix) — not hardcoded as a
 * list of the current 12, so a 13th package added tomorrow is covered
 * without touching this rule.
 *
 * `exempt` is a rule option, not a hardcoded name, for the same reason
 * `story-description-source`'s `sourceProperty` is an option (see that
 * rule's header): `@storybook/addon-designs` sits at a different, newer
 * major version legitimately — it is a third-party addon on its own release
 * line, not part of Storybook core's release train — and a workspace that
 * gains a second such addon shouldn't need this file edited to exempt it
 * too.
 *
 * Only the root `package.json` carries Storybook dependencies today (no
 * `libs/*\/package.json` does — checked directly), so this rule is wired up
 * only in the root `eslint.config.mjs`, scoped with a per-config `basePath`
 * so its `files: ['package.json']` glob still means "the workspace root's
 * package.json" even when that config object is spread into a library's own
 * `eslint.config.mjs` (each library's own config uses a different implicit
 * basePath — its own directory).
 */

const { ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator(
  (name) => `tools/eslint-rules/${name}.js`,
);

const DEPENDENCY_SECTIONS = Object.freeze(['dependencies', 'devDependencies']);

const DEFAULT_EXEMPT = Object.freeze(['@storybook/addon-designs']);

// An exact version is a bare semver triple (optional prerelease/build
// metadata), nothing else. `^10.6.0`, `~10.6.0`, `10.x`, `*`, `>=10.6.0`,
// `latest`, and a git/tarball URL spec all fail this on purpose — any of
// them lets a package drift away from the rest of the family on its own,
// which is exactly the failure this rule exists to catch (see file header).
const EXACT_VERSION_RE =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;

/** Is `name` in the Storybook family — `storybook` itself, `eslint-plugin-storybook`, or any `@storybook/*` package? */
function isStorybookFamily(name) {
  return (
    name === 'storybook' ||
    name === 'eslint-plugin-storybook' ||
    name.startsWith('@storybook/')
  );
}

/** The static string key of a `JSONProperty` — an identifier (`{ foo: … }`) or a string literal key (`{ "foo": … }`), which is how every package.json property is actually shaped. `undefined` for anything else. */
function getKeyName(property) {
  const key = property.key;
  if (key.type === 'JSONIdentifier') return key.name;
  if (key.type === 'JSONLiteral' && typeof key.value === 'string')
    return key.value;
  return undefined;
}

/** The static string value of a `JSONLiteral` node, or `undefined` for anything else (a version is always a string literal in valid JSON). */
function getStringValue(node) {
  return node && node.type === 'JSONLiteral' && typeof node.value === 'string'
    ? node.value
    : undefined;
}

/** The `JSONProperty` keyed `name` in `objectExpression.properties`, or `undefined`. */
function getProperty(objectExpression, name) {
  if (!objectExpression || objectExpression.type !== 'JSONObjectExpression')
    return undefined;
  return objectExpression.properties.find(
    (property) => getKeyName(property) === name,
  );
}

/** The most frequent version among `entries` (all already confirmed exact), ties broken by the lexicographically smaller version — deterministic regardless of property order in the file. */
function pickMajorityVersion(entries) {
  const counts = new Map();
  for (const entry of entries) {
    counts.set(entry.version, (counts.get(entry.version) ?? 0) + 1);
  }
  let best;
  for (const [version, count] of counts) {
    if (
      !best ||
      count > best.count ||
      (count === best.count && version < best.version)
    ) {
      best = { version, count };
    }
  }
  return best?.version;
}

module.exports = createRule({
  name: 'storybook-version-lockstep',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Every Storybook-family package (`storybook`, every `@storybook/*`, ' +
        '`eslint-plugin-storybook`) in package.json must be pinned to the same ' +
        'exact version — nothing else in this repo guards that pin, and ' +
        '`storybook automigrate` has been measured bumping one of them to ' +
        '`latest` even on an already-correctly-pinned repo.',
    },
    messages: {
      notExact:
        "'{{name}}' is pinned to '{{version}}', which is not an exact version " +
        '(no ^, ~, x, *, range, URL, or tag) — every Storybook-family ' +
        'package must be pinned exactly so the whole family moves together on ' +
        'purpose, never by a stray `npm install` or automigrate run.',
      lockstepMismatch:
        "'{{name}}' is pinned to '{{version}}', but the rest of the Storybook " +
        "family is pinned to '{{expected}}' — the whole family must move in " +
        'lockstep.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          exempt: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Package names exempted from the family lockstep — a third-party ' +
              'addon on its own release line rather than part of the Storybook ' +
              "core release train (default: ['@storybook/addon-designs']).",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ exempt: [...DEFAULT_EXEMPT] }],
  create(context, [options]) {
    const exempt = new Set(options.exempt ?? DEFAULT_EXEMPT);

    return {
      Program(node) {
        const statement = node.body[0];
        const root =
          statement && statement.type === 'JSONExpressionStatement'
            ? statement.expression
            : undefined;
        if (!root || root.type !== 'JSONObjectExpression') return;

        const entries = [];
        for (const sectionName of DEPENDENCY_SECTIONS) {
          const section = getProperty(root, sectionName);
          const sectionObject =
            section && section.value.type === 'JSONObjectExpression'
              ? section.value
              : undefined;
          if (!sectionObject) continue;

          for (const property of sectionObject.properties) {
            const name = getKeyName(property);
            if (!name || !isStorybookFamily(name) || exempt.has(name)) continue;
            const version = getStringValue(property.value);
            if (version === undefined) continue;
            entries.push({ name, version, node: property.value });
          }
        }

        const exactEntries = [];
        for (const entry of entries) {
          if (!EXACT_VERSION_RE.test(entry.version)) {
            context.report({
              node: entry.node,
              messageId: 'notExact',
              data: { name: entry.name, version: entry.version },
            });
            continue;
          }
          exactEntries.push(entry);
        }

        if (exactEntries.length < 2) return;

        const majority = pickMajorityVersion(exactEntries);
        for (const entry of exactEntries) {
          if (entry.version !== majority) {
            context.report({
              node: entry.node,
              messageId: 'lockstepMismatch',
              data: {
                name: entry.name,
                version: entry.version,
                expected: majority,
              },
            });
          }
        }
      },
    };
  },
});
