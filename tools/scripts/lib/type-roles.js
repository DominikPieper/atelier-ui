'use strict';
/**
 * type-roles.js — the `--ui-type-*` roles, read from tokens.css, in CSS terms.
 *
 * check-figma.js has its own parser for the same tokens, but it produces
 * FIGMA-shaped facts (style names, px, leading as a percentage) because it
 * compares them to text styles. This one produces the CSS-shaped facts a
 * stylesheet gate needs: which family token and which line-height token a role
 * names, so `font: var(--ui-type-body-sm)` can be recognised as supplying both.
 *
 * Why that matters: ADR-0036 says component CSS should reference a ROLE rather
 * than the axes. check:typeface only ever looked for the `font-family` and
 * `line-height` LONGHANDS, so a component doing what ADR-0036 asks tripped
 * [NO-TYPEFACE] and [NO-LEADING] — the gate blocked the correct change, which
 * is why nothing consumed the roles (ADR-0073).
 */
const fs = require('fs');
const path = require('path');

const TOKENS_FILE = path.resolve(
  __dirname,
  '../../../libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);

/** `font:` values that are exactly one role reference, e.g. `var(--ui-type-body-sm)`. */
const ROLE_REF = /^var\(\s*(--ui-type-[a-z0-9-]+)\s*\)$/;

/**
 * @returns {Map<string, {family: string, lineHeight: string, size: string, weight: string, italic: boolean}>}
 *          keyed by the full token name (`--ui-type-body-sm`), values are token NAMES.
 */
function typeRoles(file = TOKENS_FILE) {
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const roles = new Map();
  for (const m of css.matchAll(/(--ui-type-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    let body = m[2].replace(/\s+/g, ' ').trim();
    const italic = body.startsWith('italic ');
    if (italic) body = body.slice('italic '.length);
    const weight = /(--ui-font-weight-[a-z]+)\)/.exec(body);
    const size = /(--ui-font-size-[a-z0-9]+)\)/.exec(body);
    const lh = /(--ui-line-height-[a-z]+)\)/.exec(body);
    const fam = /(--ui-font-(?:family|display|mono))\)/.exec(body);
    if (!weight || !size || !lh || !fam) continue; // not the expected shorthand
    roles.set(m[1], {
      family: fam[1],
      lineHeight: lh[1],
      size: size[1],
      weight: weight[1],
      italic,
    });
  }
  return roles;
}

/**
 * The role a `font:` shorthand references, or null.
 * A shorthand that is anything other than one bare role reference is not
 * recognised — deliberately, so a hand-assembled `font: 600 15px/1.25 X` still
 * has to answer to the longhand rules.
 */
function roleOfFontShorthand(value, roles) {
  const m = ROLE_REF.exec(String(value).trim());
  return m && roles.has(m[1]) ? m[1] : null;
}

module.exports = { typeRoles, roleOfFontShorthand, TOKENS_FILE };
