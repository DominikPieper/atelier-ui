#!/usr/bin/env node
/**
 * behavior-coverage — typed, AST-driven behavior-coverage parity gate.
 *
 * Supersedes the generic `marker-coverage.mjs` for Atelier's TypeScript spec
 * files. Instead of grepping a `// @behavior <id>` comment (which proves only
 * that a STRING exists somewhere in the joined files — it can sit above the
 * wrong test, in dead code, or be mistyped silently), this gate parses each
 * spec file and reads the `covers('<subject>', '<id>')(…)` CALL EXPRESSIONS
 * that bind a behavior id to the test covering it. The id is a typed argument
 * (`BehaviorId<Subject>`), so a typo is already a compile error; this gate
 * additionally enforces cross-framework coverage parity against behaviors.json.
 *
 * Like marker-coverage it is a static check — it never runs the tests. The
 * tagged tests prove correctness; this proves every (subject, id, framework)
 * triple is bound.
 *
 * Usage:  node tools/parity/behavior-coverage.mjs <config.mjs>
 * Config default-exports:
 *   {
 *     manifestPath: string,                 // JSON: { subject: [{ id }, …], $comment? }
 *     implementations: { [name]: string },  // dir template with `{subject}` token
 *     filePattern: RegExp,                   // which files in the dir to scan
 *     binder?: string,                       // call identifier to scan for (default 'covers')
 *     label?: string,                        // for the summary line
 *   }
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * A binding only counts when the `covers('s','id')` call is actually invoked as
 * a test — `covers('s','id')(name, fn)` or `covers('s','id').each(cases)(…)` —
 * not left as a bare statement and not chained through `.skip`/`.only`/`.todo`
 * (which would claim coverage for a test that never runs). Walks up the parent
 * chain: reaching an invoking CallExpression confirms it runs; `.each` is the
 * only property access allowed on the way.
 */
function isInvokedBinding(node) {
  let cur = node;
  let parent = node.parent;
  while (parent) {
    if (ts.isCallExpression(parent) && parent.expression === cur) {
      return true; // cur is being called: covers(...)(…) or .each(cases)(…)
    }
    if (ts.isPropertyAccessExpression(parent) && parent.expression === cur) {
      if (parent.name.text !== 'each') return false; // .skip/.only/.todo/etc. → not live
      cur = parent;
      parent = parent.parent;
      continue;
    }
    return false; // bare statement, assignment, argument, … → not a live test
  }
  return false;
}

/**
 * Collect every invoked `<binder>('<a>', '<b>')(…)` call in a source file as
 * [a, b] pairs. Walks the syntactic AST only (no type program) so it is fast.
 * The curried and `.each`-chained forms both contain the inner
 * `<binder>('<a>','<b>')` CallExpression, so matching the inner call (and
 * confirming it is invoked) catches both.
 */
function findBinderCalls(filePath, binder) {
  const text = readFileSync(filePath, 'utf-8');
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, scriptKind);
  const pairs = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === binder &&
      node.arguments.length === 2 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      ts.isStringLiteralLike(node.arguments[1]) &&
      isInvokedBinding(node)
    ) {
      pairs.push([node.arguments[0].text, node.arguments[1].text]);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return pairs;
}

async function main() {
  const configArg = process.argv[2];
  if (!configArg) {
    console.error('usage: behavior-coverage.mjs <config.mjs>');
    process.exit(2);
  }
  const config = (await import(pathToFileURL(resolve(ROOT, configArg)).href)).default;
  const { manifestPath, implementations, filePattern, label } = config;
  const binder = config.binder || 'covers';

  const manifest = JSON.parse(readFileSync(resolve(ROOT, manifestPath), 'utf-8'));
  const implNames = Object.keys(implementations);
  const errors = [];
  let checks = 0;
  let subjects = 0;

  for (const [subject, entries] of Object.entries(manifest)) {
    if (subject.startsWith('$')) continue; // $comment etc.
    subjects++;
    const validIds = new Set(entries.map((e) => e.id));

    for (const implName of implNames) {
      const dir = resolve(ROOT, implementations[implName].replace('{subject}', subject));
      let files;
      try {
        files = readdirSync(dir).filter((f) => filePattern.test(f));
      } catch {
        errors.push(`[NO-DIR] ${implName}/${subject}: ${dir.replace(ROOT + '/', '')} not found`);
        continue;
      }

      // Build the covered set for this (subject, framework) from the AST.
      const covered = new Set();
      for (const f of files) {
        for (const [s, id] of findBinderCalls(join(dir, f), binder)) {
          if (s !== subject) {
            errors.push(
              `[WRONG-SUBJECT] ${implName}/${subject}/${f}: ${binder}('${s}', …) bound under the ${subject} directory`
            );
            continue;
          }
          if (!validIds.has(id)) {
            errors.push(
              `[UNKNOWN-ID] ${implName}/${subject}/${f}: ${binder}('${s}', '${id}') is not an id in ${manifestPath}`
            );
            continue;
          }
          covered.add(id);
        }
      }

      for (const { id } of entries) {
        checks++;
        if (!covered.has(id)) {
          errors.push(`[UNCOVERED] ${subject}/${id} not bound in ${implName}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`✗ ${e}`));
    console.error(
      `\n${errors.length} coverage gap(s). Bind the covering test with ` +
        `\`${binder}('<subject>', '<id>')('<title>', fn)\`, or extend ${manifestPath}.`
    );
    process.exit(1);
  }
  console.log(
    `✓ ${label || 'behavior'} coverage in sync (${checks} checks across ${subjects} subjects × ${implNames.length} implementations)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
