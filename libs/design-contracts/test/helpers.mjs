import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const BIN_DIR = resolve(HERE, '../bin');
export const FIXTURE_DIR = join(HERE, 'fixture');
export const GOLDEN_DIR = join(HERE, 'golden');

/**
 * Run a bin as a child process with `cwd` as its working directory, the way a
 * consumer does. The result is `{ status, stdout, stderr }`, never a throw.
 */
export function runBin(bin, args, { cwd, env = {} } = {}) {
  const res = spawnSync(
    process.execPath,
    [join(BIN_DIR, `${bin}.mjs`), ...args],
    { cwd, encoding: 'utf8', env: { ...process.env, ...env } },
  );
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

/**
 * A scratch copy of the fixture design system, created next to it (not in the
 * OS temp dir) so the Storybook docgen worker still resolves from the repo's
 * `node_modules` by walking up. Call `.remove()` in a `finally`/`after`.
 */
export function copyFixture() {
  const dir = mkdtempSync(join(HERE, '.work-'));
  cpSync(FIXTURE_DIR, dir, { recursive: true });
  return {
    dir,
    remove: () => rmSync(dir, { recursive: true, force: true }),
    readJson: (rel) => JSON.parse(readFileSync(join(dir, rel), 'utf8')),
    writeJson: (rel, value) =>
      writeFileSync(join(dir, rel), JSON.stringify(value, null, 2) + '\n'),
  };
}

/** Golden files live in `test/golden`; `UPDATE_GOLDEN=1` rewrites them (review the diff). */
export function readGolden(name) {
  return readFileSync(join(GOLDEN_DIR, name), 'utf8');
}
export function goldenPath(name) {
  return join(GOLDEN_DIR, name);
}

/**
 * The name-pairing rule of figma-console-mcp's `figma_check_design_parity`
 * (`compareComponentAPI`, dist/core/design-code-tools.js, v1.40.0): a code prop
 * and a Figma property pair when their names match lower-cased with everything
 * outside [a-z0-9] removed; a paired VARIANT also compares its values
 * (lower-cased). Returns the discrepancies that function would report, as
 * `"<severity>: <what>"` strings. Figma properties come from a snapshot master
 * (its `properties` keys carry the `#id` suffix, like the REST API's).
 */
export function parityDiscrepancies(master, props) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const figma = Object.entries(master.properties).map(([name, type]) => ({
    name,
    type,
    values: type === 'VARIANT' ? master.variantAxes[name] : [],
  }));
  const out = [];
  for (const code of props) {
    const match = figma.find((f) => norm(f.name) === norm(code.name));
    if (!match) {
      out.push(`minor: code prop ${code.name} has no Figma property`);
    } else if (match.type === 'VARIANT' && code.values) {
      const fv = match.values.map((v) => v.toLowerCase());
      const cv = code.values.map((v) => v.toLowerCase());
      for (const v of cv.filter((v) => !fv.includes(v)))
        out.push(`major: ${match.name} value ${v} is not in Figma`);
      for (const v of fv.filter((v) => !cv.includes(v)))
        out.push(`info: ${match.name} value ${v} is not in code`);
    }
  }
  for (const f of figma) {
    if (!props.some((c) => norm(c.name) === norm(f.name)))
      out.push(`info: Figma property ${f.name} has no code prop`);
  }
  return out;
}
