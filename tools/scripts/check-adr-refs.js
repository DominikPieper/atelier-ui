#!/usr/bin/env node
'use strict';
/**
 * check-adr-refs.js
 *
 * The ADR log is the project's memory, and a cross-reference that points at a file
 * which does not exist degrades it silently — nobody follows a link in a markdown
 * file until they need it, by which time the reason it was written is gone.
 *
 * Six such references had accumulated across 65 ADRs, and the same wrong filename
 * appeared twice independently: a reader guesses the path from the TITLE
 * (`0035-instrument-sans-and-serif.md`) while the file is named something else
 * (`0035-typography-instrument-pair.md`). That is a mistake the author cannot catch
 * by re-reading, which is exactly what a gate is for.
 *
 * Checks, over plan/adr/ and the docs that link into it:
 *   [REF]        a `plan/adr/NNNN-....md` reference whose file does not exist
 *   [INDEX]      an ADR file with no row in plan/adr/README.md
 *   [ORPHAN]     a README row pointing at a file that does not exist
 *   [SELF]       an ADR citing itself
 *   [ADR-CORRECTION] an ADR (B) whose frontmatter or title claims to revise, correct
 *                or supersede an older ADR (A), where A carries no matching correction
 *
 * The last check exists because ADR-0034 made exactly this claim about ADR-0019 §5
 * and ADR-0024 §4 — both frontmatter and title said so — and neither target ADR ever
 * received the correction: a reader opening ADR-0019 saw a stale claim with no signal
 * it was false. AGENTS.md's ADR convention requires the correction to land in the
 * older ADR, in the same commit as the claim; this is that requirement, enforced.
 */
const fs = require('fs');
const path = require('path');
const { ADR_CORRECTION_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const ADR_DIR = path.join(ROOT, 'plan/adr');
const README = path.join(ADR_DIR, 'README.md');
// Every place that links into plan/adr/ — a broken pointer is as bad from a task file.
// CLAUDE.md now imports AGENTS.md (`@AGENTS.md`), which holds the ADR conventions text
// and its references, so AGENTS.md is scanned alongside it — not instead of it.
const EXTRA_SOURCES = [
  'AGENTS.md',
  'CLAUDE.md',
  'plan/figma.md',
  'plan/big-picture.md',
  'plan/roadmap.md',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const errors = [];
const fail = (tag, msg) => errors.push(`✗ [${tag}] ${msg}`);

const adrFiles = fs
  .readdirSync(ADR_DIR)
  .filter((f) => /^\d{4}-[a-z0-9-]+\.md$/.test(f))
  .sort();
const existing = new Set(adrFiles);

const sources = [
  ...adrFiles.map((f) => path.join('plan/adr', f)),
  ...EXTRA_SOURCES.filter((f) => fs.existsSync(path.join(ROOT, f))),
];

for (const rel of sources) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const seen = new Set();
  // The reference must be a whole path segment. Without the boundary this matched
  // the date tail of `tasks/design-findings-2026-07-22.md` as if it were ADR 2026.
  for (const m of text.matchAll(
    /(?:plan\/adr\/|\(\.\/)(\d{4}-[a-z0-9-]+\.md)/g,
  )) {
    const target = m[1];
    if (seen.has(target)) continue;
    seen.add(target);
    if (!existing.has(target)) {
      const stem = target.slice(0, 4);
      const actual = adrFiles.find((f) => f.startsWith(stem));
      fail(
        'REF',
        `${rel} references ${target}, which does not exist.${actual ? ` Did you mean ${actual}?` : ''}`,
      );
    } else if (rel.endsWith(target)) {
      fail('SELF', `${rel} cites itself.`);
    }
  }
}

const readme = fs.readFileSync(README, 'utf8');
for (const f of adrFiles) {
  if (f === 'README.md') continue;
  if (!readme.includes(f))
    fail(
      'INDEX',
      `${f} has no row in plan/adr/README.md. Every ADR is indexed (CLAUDE.md step 4).`,
    );
}
for (const m of readme.matchAll(/\((\d{4}-[a-z0-9-]+\.md)\)/g)) {
  if (!existing.has(m[1]))
    fail(
      'ORPHAN',
      `plan/adr/README.md points at ${m[1]}, which does not exist.`,
    );
}

// [ADR-CORRECTION]: a newer ADR (B) claiming to revise/correct/supersede an older
// one (A) must leave A carrying evidence of it — a dated Corrected marker at or
// after B's date, or A simply naming B. Only `supersedes:` generates this
// obligation; `superseded-by:` is self-referential (the file already names the
// ADR that supersedes it) and needs no further check.
// Exact conjugated forms only — NOT stems like `correct\w*`/`amend\w*`, which false-
// -matched "bound *correctly*" (a filename slug) and "the *amendment* that gated root
// typography" (A described as an amendment, not B claiming to amend A).
const TRIGGER_WORDS =
  /\b(revises|revised|corrects|corrected|amends|amended|supersedes|superseded)\b/i;
const fileText = new Map(
  adrFiles.map((f) => [f, fs.readFileSync(path.join(ADR_DIR, f), 'utf8')]),
);

function adrNumbersIn(str, excludeNum) {
  const nums = new Set();
  for (const m of str.matchAll(/ADR-(\d{4})/gi))
    if (m[1] !== excludeNum) nums.add(m[1]);
  for (const m of str.matchAll(/(\d{4})-[a-z0-9-]+\.md/g))
    if (m[1] !== excludeNum) nums.add(m[1]);
  return nums;
}

const claims = new Map(); // `${a}:${b}` -> { a, b, bFile, bDate }
for (const bFile of adrFiles) {
  const text = fileText.get(bFile);
  const bNum = bFile.slice(0, 4);
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  const front = fm ? fm[1] : '';
  const dateMatch = front.match(/^date:\s*(.+)$/m);
  const bDate = dateMatch
    ? dateMatch[1].trim().replace(/^["']|["']$/g, '')
    : null;

  const record = (str) => {
    for (const a of adrNumbersIn(str, bNum))
      claims.set(`${a}:${bNum}`, { a, b: bNum, bFile, bDate });
  };

  // frontmatter `supersedes: <value>` — the reverse field, `superseded-by:`, is
  // self-referential and deliberately not scanned here.
  const supersedesMatch = front.match(/^supersedes:\s*(.+)$/m);
  if (supersedesMatch) record(supersedesMatch[1]);

  // frontmatter `sources:` list entries, e.g.
  // `  - plan/adr/0042-....md (the gate this corrects)`. The referenced ADR number
  // comes from the path segment; the trigger words are checked ONLY inside the
  // parenthetical, never against the cited file's own name (a filename slug like
  // `...-bound-correctly.md` is not a claim about that file).
  const sourcesMatch = front.match(/^sources:\n((?:[ \t]+-.*(?:\n|$))+)/m);
  if (sourcesMatch) {
    const lineRe = /(\d{4})-[a-z0-9-]+\.md"?\s*\(([^)]*)\)/g;
    for (const m of sourcesMatch[1].matchAll(lineRe)) {
      const [, aNum, paren] = m;
      if (aNum !== bNum && TRIGGER_WORDS.test(paren))
        claims.set(`${aNum}:${bNum}`, { a: aNum, b: bNum, bFile, bDate });
    }
  }

  // the H1 title line, e.g. `# ADR-0034: ... (revises ADR-0019 §5 and ADR-0024 §4)` —
  // titles always spell the target out as `ADR-NNNN`, never a bare filename, so the
  // filename-slug false-positive above does not apply here.
  const titleMatch = text.match(/^# ADR-\d{4}:.*$/m);
  if (titleMatch && TRIGGER_WORDS.test(titleMatch[0])) record(titleMatch[0]);
}

for (const { a, b, bFile, bDate } of claims.values()) {
  if (ADR_CORRECTION_EXEMPT.has(`${a}:${b}`)) continue;
  const aFile = adrFiles.find((f) => f.startsWith(a));
  if (!aFile) continue; // a dangling target is already reported as [REF]
  const aText = fileText.get(aFile);
  const bDateValid = bDate && /^\d{4}-\d{2}-\d{2}$/.test(bDate);

  let corrected = false;
  if (bDateValid) {
    for (const m of aText.matchAll(/Corrected\s+(\d{4}-\d{2}-\d{2})/gi)) {
      if (m[1] >= bDate) {
        corrected = true;
        break;
      }
    }
  }
  const named =
    new RegExp(`ADR-${b}\\b`).test(aText) ||
    new RegExp(`${b}-[a-z0-9-]+\\.md`).test(aText);

  if (!corrected && !named) {
    fail(
      'ADR-CORRECTION',
      `${bFile} claims to revise/correct/supersede ADR-${a} (dated ${bDate || 'undated'}), but plan/adr/${aFile} ` +
        `has no dated Corrected marker on or after that date and does not name ADR-${b}.`,
    );
  }
}

if (errors.length) {
  for (const e of errors) console.error(e);
  console.error(
    `\n${errors.length} ADR reference issue(s) across ${adrFiles.length} ADRs.`,
  );
  process.exit(1);
}
console.log(
  `✓ ADR references resolve (${adrFiles.length} ADRs, ${sources.length} source file(s) scanned).`,
);
