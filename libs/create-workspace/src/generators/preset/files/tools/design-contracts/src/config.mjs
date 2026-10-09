/**
 * Shared settings resolution for the `check-contracts` and
 * `figma-snapshot-contracts` bins.
 *
 * Every setting comes from a CLI flag or from `contracts.config.json` in the
 * current working directory — nothing is derived from where this package is
 * installed. A relative path in the config (or on the command line) is
 * relative to the working directory. A missing required setting is a usage
 * error: the caller prints the message and exits 2.
 */
import fs from 'node:fs';
import path from 'node:path';

export const CONFIG_FILE_NAME = 'contracts.config.json';

/** The frameworks whose docgen this package knows how to read. */
export const FRAMEWORKS = ['angular', 'react', 'vue'];

/** Print a usage/configuration error and exit 2 (the "could not run" code, distinct from 1 = findings). */
export function die(message) {
  console.error(message);
  process.exit(2);
}

/** Parsed `contracts.config.json` from `cwd`, or `null` when there is none. Invalid JSON exits 2. */
export function readConfigFile(cwd) {
  const configPath = path.join(cwd, CONFIG_FILE_NAME);
  if (!fs.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    return die(`${configPath}: invalid JSON (${e.message})`);
  }
}

/**
 * A path-list setting that is either one list for every framework
 * (`["src"]`) or a map per framework (`{ "angular": ["libs/a/src"] }`).
 * Returns the absolute directories for `fw`, or `null` when the setting is
 * absent / has nothing for that framework.
 */
export function dirsFor(setting, fw, cwd) {
  if (setting == null) return null;
  const list = Array.isArray(setting) ? setting : setting[fw];
  if (!Array.isArray(list) || list.length === 0) return null;
  return list.map((d) => path.resolve(cwd, d));
}

/** The settings the check needs that no flag exists for, validated once. */
export function readSharedPropsSetting(fileConfig, cwd) {
  const s = fileConfig?.sharedPropsInterface;
  if (s == null) return null;
  if (
    typeof s !== 'object' ||
    typeof s.file !== 'string' ||
    typeof s.name !== 'string'
  ) {
    return die(
      `${CONFIG_FILE_NAME}: "sharedPropsInterface" must be { "file": "<path>", "name": "<interface>" }`,
    );
  }
  return { file: path.resolve(cwd, s.file), name: s.name };
}
