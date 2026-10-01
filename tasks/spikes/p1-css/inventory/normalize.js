// Throwaway: Angular Emulated -> class-root transform simulator + diff vs React/Vue.
// usage: node normalize.js [--roots roots.json] ; outputs to ./out/
const path = require('path'), fs = require('fs');
const REPO = '/Users/dominikpieper/Projects/atelier';
const postcss = require(REPO + '/node_modules/postcss');
const prettier = require(REPO + '/node_modules/prettier');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const roots = fs.existsSync(path.join(__dirname, 'roots.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'roots.json'))) : {};
const report = { hostContext: [], ngDeep: [] };

function findFiles(fw) {
  const res = {};
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/^atl-.*\.css$/.test(e.name)) res[e.name.replace(/\.css$/, '')] = p; } };
  walk(`${REPO}/libs/${fw}/src/lib`); return res;
}
// balanced-paren argument reader: s[i] === '(' -> returns [inner, indexAfter]
function readParen(s, i) { let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')') { d--; if (d === 0) break; } } return [s.slice(i + 1, j), j + 1]; }

function transformSelector(sel, root, name) {
  sel = sel.trim();
  // :host-context(Y) rest  ->  Y root rest   (also handles :host-context(Y):host? rare)
  if (sel.startsWith(':host-context(')) {
    const [y, k] = readParen(sel, ':host-context'.length);
    let rest = sel.slice(k).trim();
    report.hostContext.push({ name, selector: sel });
    // rest may begin with ':host' qualifiers; keep descendant semantic
    if (rest.startsWith(':host')) { return `${y} ${transformSelector(rest, root, name)}`; }
    return `${y} ${root}${rest ? ' ' + rest : ''}`.trim();
  }
  if (sel.startsWith(':host(')) {
    const [x, k] = readParen(sel, ':host'.length);
    return transformSelector(':host', root, name).replace(root, root + x) + sel.slice(k);
  }
  if (sel.startsWith(':host')) {
    const rest = sel.slice(':host'.length);
    return root + rest;           // ':host *' -> '.root *'; ':host:hover' -> '.root:hover'
  }
  if (sel.includes('::ng-deep')) report.ngDeep.push({ name, selector: sel });
  return `${root} ${sel}`;       // naive: descendant of root
}

function transformAngular(css, name) {
  const root = roots[name] || `.${name}`;
  const ast = postcss.parse(css);
  ast.walkRules(r => {
    if (r.parent && r.parent.type === 'atrule' && /keyframes$/.test(r.parent.name)) return;
    r.selectors = r.selectors.map(s => transformSelector(s, root, name));
  });
  return ast.toString();
}
function stripComments(css) { const ast = postcss.parse(css); ast.walkComments(c => c.remove()); return ast.toString(); }
async function fmt(css) { return prettier.format(css, { parser: 'css', singleQuote: true }); }

// structured rule map: key = at-rule context + selector; value = {prop: value}
const norm = s => s.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, ' $1 ').replace(/\s+/g, ' ').replace(/"/g, "'").trim();
function ruleMap(css) {
  const m = new Map(); const ast = postcss.parse(css);
  ast.walkRules(r => {
    const ctx = []; for (let p = r.parent; p && p.type === 'atrule'; p = p.parent) ctx.unshift(`@${p.name} ${norm(p.params)}`);
    const k = ctx.join(' | ') + ' || ' + r.selectors.map(norm).join(', ');
    const d = m.get(k) || {};
    r.walkDecls(x => { if (x.parent === r) d[x.prop] = norm(x.value); });
    m.set(k, d);
  });
  return m;
}
const declSig = d => JSON.stringify(Object.entries(d).sort());
function structuredDiff(A, B) {
  const a = ruleMap(A), b = ruleMap(B);
  const out = { same: 0, valueDiff: [], aOnly: [], bOnly: [], renamed: [] };
  for (const [k, da] of a) {
    if (!b.has(k)) { out.aOnly.push([k, da]); continue; }
    const db = b.get(k);
    if (declSig(da) === declSig(db)) { out.same++; continue; }
    const diffs = [];
    for (const p of new Set([...Object.keys(da), ...Object.keys(db)])) if (da[p] !== db[p]) diffs.push({ prop: p, a: da[p] ?? null, b: db[p] ?? null });
    out.valueDiff.push({ key: k, diffs });
  }
  for (const [k, db] of b) if (!a.has(k)) out.bOnly.push([k, db]);
  // pair A-only with B-only having identical declaration set => scoping-shaped rename
  for (const ao of [...out.aOnly]) {
    const i = out.bOnly.findIndex(bo => declSig(bo[1]) === declSig(ao[1]));
    if (i >= 0) { out.renamed.push({ a: ao[0], b: out.bOnly[i][0] }); out.bOnly.splice(i, 1); out.aOnly.splice(out.aOnly.indexOf(ao), 1); }
  }
  return out;
}
function lineDiff(x, y) { // count of differing lines via LCS-lite using `diff`
  fs.writeFileSync(path.join(OUT, '_x'), x); fs.writeFileSync(path.join(OUT, '_y'), y);
  const r = require('child_process').spawnSync('diff', ['-U0', path.join(OUT, '_x'), path.join(OUT, '_y')], { encoding: 'utf8' });
  const lines = r.stdout.split('\n'); let add = 0, del = 0;
  for (const l of lines) { if (l.startsWith('+') && !l.startsWith('+++')) add++; else if (l.startsWith('-') && !l.startsWith('---')) del++; }
  return { add, del, text: r.stdout };
}

(async () => {
  const A = findFiles('angular'), R = findFiles('react'), V = findFiles('vue');
  const summary = {};
  for (const name of Object.keys(A).sort()) {
    const aRaw = fs.readFileSync(A[name], 'utf8');
    const aT = await fmt(stripComments(transformAngular(aRaw, name)));
    const rec = { name, root: roots[name] || `.${name}`, hasReact: !!R[name], hasVue: !!V[name] };
    fs.writeFileSync(path.join(OUT, `${name}.angular.norm.css`), aT);
    if (R[name]) {
      const rT = await fmt(stripComments(fs.readFileSync(R[name], 'utf8')));
      fs.writeFileSync(path.join(OUT, `${name}.react.norm.css`), rT);
      const ld = lineDiff(aT, rT); fs.writeFileSync(path.join(OUT, `${name}.A-vs-R.diff`), ld.text);
      rec.AR = { lines: ld.add + ld.del, aLines: aT.split('\n').length, rLines: rT.split('\n').length, ...structuredDiff(aT, rT) };
    }
    if (V[name] && R[name]) {
      const vT = await fmt(stripComments(fs.readFileSync(V[name], 'utf8')));
      fs.writeFileSync(path.join(OUT, `${name}.vue.norm.css`), vT);
      const rT = fs.readFileSync(path.join(OUT, `${name}.react.norm.css`), 'utf8');
      const ld = lineDiff(rT, vT); fs.writeFileSync(path.join(OUT, `${name}.R-vs-V.diff`), ld.text);
      rec.RV = { lines: ld.add + ld.del, ...structuredDiff(rT, vT) };
    }
    summary[name] = rec;
  }
  fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify({ summary, report }, null, 1));
  console.log('name | root | A-R lines | same | valDiff | renamed | aOnly | bOnly | R-V lines');
  for (const r of Object.values(summary)) {
    const q = r.AR; console.log([r.name, r.root, q ? q.lines : '-', q ? q.same : '-', q ? q.valueDiff.length : '-', q ? q.renamed.length : '-', q ? q.aOnly.length : '-', q ? q.bOnly.length : '-', r.RV ? r.RV.lines : '-'].join(' | '));
  }
  console.log('hostContext', report.hostContext.length, 'ngDeep', report.ngDeep.length);
})();
