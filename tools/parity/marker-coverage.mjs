#!/usr/bin/env node
/**
 * marker-coverage — generic, repo-agnostic coverage-parity gate.
 *
 * The pattern: a manifest maps each SUBJECT to a list of behaviour IDs that
 * every IMPLEMENTATION must cover, and each implementation declares coverage by
 * tagging a source file with `<marker> <id>` (e.g. `// @behavior loading-spinner`).
 * This tool fails when any (subject, id, implementation) triple is untagged.
 *
 * It is a dumb token check on purpose: it enforces coverage *parity* across
 * implementations, not correctness — the tagged tests prove correctness. The
 * idea generalises far beyond UI components: API handlers, DB migrations,
 * plugin adapters — anywhere N implementations must each cover the same set of
 * behaviours.
 *
 * Usage:  node tools/parity/marker-coverage.mjs <config.mjs>
 * The config default-exports:
 *   {
 *     manifestPath: string,                  // JSON: { subject: [{ id }, …], $comment? }
 *     marker: string,                         // e.g. '@behavior'
 *     implementations: { [name]: string },    // dir template with `{subject}` token
 *     filePattern: RegExp,                     // which files in the dir to scan
 *     label?: string,                          // for the summary line
 *   }
 *
 * Repo-agnostic: no Atelier paths are baked in here — they all live in the
 * config. Copy this file + write a config to adopt it in another repo.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

async function main() {
  const configArg = process.argv[2];
  if (!configArg) {
    console.error('usage: marker-coverage.mjs <config.mjs>');
    process.exit(2);
  }
  const config = (await import(pathToFileURL(resolve(ROOT, configArg)).href)).default;
  const { manifestPath, marker, implementations, filePattern, label } = config;

  const manifest = JSON.parse(readFileSync(resolve(ROOT, manifestPath), 'utf-8'));
  const implNames = Object.keys(implementations);
  const errors = [];
  let checks = 0;
  let subjects = 0;

  for (const [subject, entries] of Object.entries(manifest)) {
    if (subject.startsWith('$')) continue; // $comment etc.
    subjects++;
    for (const implName of implNames) {
      const dir = resolve(ROOT, implementations[implName].replace('{subject}', subject));
      let files;
      try {
        files = readdirSync(dir).filter((f) => filePattern.test(f));
      } catch {
        errors.push(`[NO-DIR] ${implName}/${subject}: ${dir.replace(ROOT + '/', '')} not found`);
        continue;
      }
      const src = files.map((f) => readFileSync(join(dir, f), 'utf-8')).join('\n');
      for (const { id } of entries) {
        checks++;
        // Whole-token match so `open` cannot satisfy `open-on-trigger`.
        const re = new RegExp(`${escapeRe(marker)}\\s+${escapeRe(id)}(?![\\w-])`);
        if (!re.test(src)) {
          errors.push(`[UNCOVERED] ${subject}/${id} not tagged in ${implName}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`✗ ${e}`));
    console.error(
      `\n${errors.length} coverage gap(s). Add a \`${marker} <id>\` marker above the ` +
        `covering test, or extend ${manifestPath}.`
    );
    process.exit(1);
  }
  console.log(
    `✓ ${label || 'marker'} coverage in sync (${checks} checks across ${subjects} subjects × ${implNames.length} implementations)`
  );
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
