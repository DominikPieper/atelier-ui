// P1.1 spike: generate class-rooted CSS (React/Vue shape) from Angular :host CSS + small per-component config.
// usage: node gen.js [dir ...]   -> writes out/<dir>.css, prints metrics
const fs = require('fs'), path = require('path');
const REPO = '/Users/dominikpieper/Projects/atelier';
const postcss = require(REPO + '/node_modules/postcss');
const sp = require(REPO + '/node_modules/postcss-selector-parser');
const prettier = require(REPO + '/node_modules/prettier');
const CONFIG_ALL = require('./config.js');
const NODOM = process.env.NODOM === '1';
const CONFIG = Object.fromEntries(Object.entries(CONFIG_ALL).map(([k, v]) => [k, NODOM ? { ...v, ops: (v.ops || []).filter(o => !o.dom) } : v]));
const OUT = path.join(__dirname, 'out');
const OPTS = { scope: process.env.SCOPE || 'prefix', merge: process.env.MERGE !== '0' };

const lib = (fw, dir) => `${REPO}/libs/${fw}/src/lib/${dir}`;
const readCss = f => fs.readFileSync(f, 'utf8');

// ---------- selector transform (GENERIC RULES live here) ----------
function makeCtx(dir, cfg) {
  // G0 default root = the component's own element selector (`selector: 'atl-tab-group'` -> `.atl-tab-group`)
  let derived = `.atl-${dir}`;
  try { const m = fs.readFileSync(`${REPO}/libs/angular/src/lib/${dir}/atl-${dir}.ts`, 'utf8').match(/selector:\s*'(atl-[a-z-]+)'/); if (m) derived = '.' + m[1]; } catch (e) {}
  const root = cfg.root || derived;
  const ops = cfg.ops || [];
  const renames = {}, tagMap = {}, ctxMap = {};
  for (const o of ops) {
    if (o.t === 'rename' || o.t === 'hostAlias') renames[o.from.replace(/^\./, '')] = o.to.replace(/^\./, '');
    if (o.t === 'tag') tagMap[o.from] = o.to;
    if (o.t === 'ctx') ctxMap[o.from] = o.to;
  }
  const own = ops.filter(o => o.t === 'own').map(o => o.cls.replace(/^\./, ''));
  const rootName = root.replace(/^\./, '');
  const DIRS = fs.readdirSync(`${REPO}/libs/angular/src/lib`).filter(d => fs.existsSync(`${REPO}/libs/angular/src/lib/${d}/atl-${d}.css`));
  const isForeign = n => DIRS.some(d => d !== dir && (n === 'atl-' + d || n.startsWith('atl-' + d + '-'))) && !(n === rootName || n.startsWith(rootName + '-')) && !own.includes(n);
  const isOwn = n => !isForeign(n);
  const scopeSel = ops.filter(o => o.t === 'scopeSel');
  return { root, renames, tagMap, ctxMap, isOwn, scopeSel: process.env.FORCEPREFIX ? [] : scopeSel, scope: process.env.FORCEPREFIX ? 'prefix' : (cfg.scope || OPTS.scope) };
}

function transformSelectorList(selStr, c) {
  const ast = sp().astSync(selStr);
  const outs = [];
  ast.each(sel => outs.push(transformOne(sel, c)));
  return outs.join(', ');
}

function normalizeNames(sel, c) {
  // G6 tag -> class (default: same name), renames on classes (incl. inside :host(...) args)
  sel.walkTags(t => {
    if (/^atl-/.test(t.value)) {
      const m = c.tagMap[t.value];
      if (m && !m.startsWith('.')) t.replaceWith(sp.tag({ value: m }));
      else t.replaceWith(sp.className({ value: m ? m.slice(1) : t.value }));
    }
  });
  sel.walkClasses(k => { if (c.renames[k.value]) k.value = c.renames[k.value]; });
}

function transformOne(sel, c) {
  normalizeNames(sel, c);
  const nodes = sel.nodes;
  let i = 0; while (i < nodes.length && nodes[i].type !== 'combinator') i++;
  const first = nodes.slice(0, i), rest = nodes.slice(i);
  const restStr = rest.map(String).join('');
  const hostP = first.find(n => n.type === 'pseudo' && n.value === ':host');
  const ctxP = first.filter(n => n.type === 'pseudo' && n.value === ':host-context');
  const others = first.filter(n => !(n.type === 'pseudo' && (n.value === ':host' || n.value === ':host-context')));
  const othersStr = others.map(String).join('');
  const ctxStr = n => { const y = n.nodes[0].toString().trim(); return c.ctxMap[y] ? c.ctxMap[y] : y; };
  if (hostP || ctxP.length) {
    let host;
    if (hostP && hostP.nodes.length) {            // G3 :host(X)
      const x = hostP.nodes[0].toString().trim();
      const lead = hostP.nodes[0].nodes[0];
      const isHostClass = lead && lead.type === 'class' && /^atl-/.test(lead.value);
      host = isHostClass ? x : c.root + x;
    } else host = c.root;                         // G2 :host
    host += othersStr;
    if (ctxP.length) {
      const anc = ctxP.map(ctxStr).join(' ');
      // G4 compound :host(X):host-context(Y) -> strict `<root>Y X`; G5 bare :host-context(Y) -> `Y <root>`
      if (hostP && hostP.nodes.length) host = `${c.root}${anc} ${host}`;
      else host = `${anc} ${host}`;
    }
    return host.replace(/\s+/g, ' ') + restStr;
  }
  // non-host selector (G7 scope policy)
  const ss = c.scopeSel.find(o => new RegExp(o.match).test(sel.toString().trim())); if (ss && ss.root === '') return sel.toString().trim();
  const lead = first[0];
  let rooted = false; sel.walkClasses(k => { if (/^atl-/.test(k.value) && c.isOwn(k.value)) rooted = true; });
  const leadForeign = lead && lead.type === 'class' && /^atl-/.test(lead.value) && !c.isOwn(lead.value);
  if (leadForeign && lead.type !== 'combinator') return `${c.root} ${sel.toString().trim()}`;
  const s = sel.toString().trim();
  if (c.scope === 'prefix' && !rooted && lead && lead.type !== 'combinator') return `${c.root} ${s}`;
  return s;
}

// ---------- file level ----------
function inlineStyles(tsFile) {
  const t = fs.readFileSync(tsFile, 'utf8');
  const m = t.match(/styles:\s*`([\s\S]*?)`/);
  return m ? m[1] : '';
}

function leadingAtlClasses(css) {              // same derivation as tools/scripts/gen-box-sizing.mjs
  const found = new Set();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const rule of clean.matchAll(/(^|[};])\s*([^{};@][^{}]*?)\{/g))
    for (const selector of rule[2].split(',')) { const m = selector.trim().match(/^\.(atl-[a-z0-9-]+)/); if (m) found.add(m[1]); }
  return [...found].sort();
}

function transformAst(css, c, dropHost) {
  const ast = postcss.parse(css);
  ast.walkRules(r => {
    if (r.parent && r.parent.type === 'atrule' && /keyframes$/.test(r.parent.name)) return;
    if (r.selector.replace(/\s+/g, ' ') === ':host, :host *') { r.__pre = true; return; }
    if (dropHost && r.selector.trim() === ':host') { r.remove(); return; }
    r.selector = transformSelectorList(r.selector, c);
  });
  return ast;
}
function generate(dir) {
  const cfg = CONFIG[dir] || {};
  const c = makeCtx(dir, cfg);
  const ops = cfg.ops || [];
  const angDir = lib('angular', dir);
  const ast = transformAst(readCss(`${angDir}/atl-${dir}.css`), c, false);
  const pre = ast.nodes.find(n => n.type === 'rule' && n.__pre);
  for (const o of ops) {
    if (o.t !== 'mergeFile' && o.t !== 'inlineStyles') continue;
    const css = o.t === 'mergeFile' ? readCss(`${angDir}/${o.file}`) : inlineStyles(`${angDir}/${o.file}`);
    // fold-ins are other Angular components' styles: own :host root, own preamble dropped
    const sub = transformAst(css, { ...c, root: o.root || c.root }, !!o.dropHost);
    sub.walkRules(r => { if (r.__pre) r.remove(); });
    const nodes = sub.nodes.map(n => n.clone());
    if (o.at === 'start' && pre) { let ref = pre; for (const n of nodes) { ref.after(n); ref = n; } }
    else for (const n of nodes) ast.append(n);
  }
  // escape hatches (counted as config entries): whole-selector rewrite, raw extra css, extra declaration
  for (const o of ops) {
    if (o.t === 'sel') ast.walkRules(r => { r.selector = r.selector.split(',').map(x => { x = x.trim(); return new RegExp(o.re).test(x) ? x.replace(new RegExp(o.re), o.to) : x; }).join(', '); });
    if (o.t === 'addCss') for (const n of postcss.parse(o.css).nodes) ast.append(n);
    if (o.t === 'addDecl') ast.walkRules(r => { if (r.selector === o.selector) r.append({ prop: o.prop, value: o.value }); });
  }
  if (OPTS.merge) mergeAdjacent(ast);
  let out = ast.toString();
  const roots = leadingAtlClasses(out.replace(/:host,\s*:host \*/, ''));
  let sel;
  if (!roots.length) sel = c.root; else if (roots.length === 1) sel = '.' + roots[0]; else sel = `:is(${roots.map(r => '.' + r).join(', ')})`;
  out = out.replace(/:host,\s*:host \*/, `${sel},\n${sel} *`);
  return out;
}
function mergeAdjacent(ast) {                  // G8 merge directly adjacent rules with the same selector
  ast.walkRules(r => {
    let prev = r.prev(); while (prev && prev.type === 'comment') prev = prev.prev();
    if (prev && prev.type === 'rule' && prev.selector === r.selector && !prev.__pre) { r.each(d => prev.append(d.clone())); r.remove(); }
  });
}

// ---------- measurement ----------
const strip = css => { const a = postcss.parse(css); a.walkComments(x => x.remove()); return a.toString(); };
const noBlank = t => t.replace(/\n\s*\n/g, '\n');
async function fmt(css, file) { const o = (await prettier.resolveConfig(file)) || {}; return prettier.format(css, { ...o, parser: 'css', plugins: [] }); }
function lineDiff(a, b) {
  fs.writeFileSync(OUT + '/_a', a); fs.writeFileSync(OUT + '/_b', b);
  const r = require('child_process').spawnSync('diff', ['-U0', OUT + '/_a', OUT + '/_b'], { encoding: 'utf8' });
  let n = 0; for (const l of r.stdout.split('\n')) if ((l[0] === '+' || l[0] === '-') && !/^(\+\+\+|---)/.test(l)) n++;
  return { n, text: r.stdout };
}
const normS = x => x.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, ' $1 ').replace(/\s+/g, ' ').replace(/"/g, "'").trim();
function ruleMap(css) {
  const m = new Map(); const ast = postcss.parse(strip(css));
  ast.walkRules(r => {
    const ctx = []; for (let p = r.parent; p && p.type === 'atrule'; p = p.parent) ctx.unshift('@' + p.name + ' ' + normS(p.params));
    const k = ctx.join('|') + '||' + r.selectors.map(normS).sort().join(',');
    const d = m.get(k) || {}; r.walkDecls(x => { if (x.parent === r) d[x.prop] = normS(x.value); }); m.set(k, d);
  }); return m;
}
function semDiff(a, b) {   // number of rule keys that differ (missing either side or different declarations)
  const A = ruleMap(a), B = ruleMap(b); let n = 0; const det = [];
  for (const [k, d] of A) { if (!B.has(k)) { n++; det.push('G-only ' + k); } else if (JSON.stringify(Object.entries(d).sort()) !== JSON.stringify(Object.entries(B.get(k)).sort())) { n++; det.push('value ' + k); } }
  for (const k of B.keys()) if (!A.has(k)) { n++; det.push('R-only ' + k); }
  return { n, det };
}
const comments = css => { const s = []; postcss.parse(css).walkComments(x => s.push(x.text.replace(/\s+/g, ' ').trim())); return s; };
function countEntries(dir) {
  const cfg = CONFIG[dir] || {}; const r = { total: 0, inherent: 0, accidental: 0, byOp: {} };
  const add = (kind, t) => { r.total++; r[kind]++; (r.byOp[t] = r.byOp[t] || []).push(kind); };
  if (cfg.root) add(cfg.rootKind || 'accidental', 'root');
  if (cfg.scope === 'bare') add(cfg.scopeKind || 'accidental', 'scope-bare');
  for (const o of cfg.ops || []) add(o.kind, o.t);
  return r;
}

module.exports = { semDiff, generate, strip, fmt, lineDiff, comments, countEntries, REPO, lib, OUT, OPTS };

if (require.main === module) (async () => {
  const dirs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(`${REPO}/libs/react/src/lib`).filter(d => fs.existsSync(`${lib('react', d)}/atl-${d}.css`)).sort();
  console.log('dir | byteEq | residual | semResidualRules | entries(inh/acc) | commentsMissingInGen | angularIsmComments');
  for (const dir of dirs) {
    const gen = generate(dir); const rf = `${lib('react', dir)}/atl-${dir}.css`;
    fs.writeFileSync(`${OUT}/${dir}.css`, await fmt(gen, rf));
    const g = noBlank(await fmt(strip(gen), rf)), r = noBlank(await fmt(strip(readCss(rf)), rf));
    const ld = lineDiff(g, r); fs.writeFileSync(`${OUT}/${dir}.diff`, ld.text);
    const e = countEntries(dir);
    const ISMS = /:host|<atl-|host element|ViewEncapsulation|Emulated|ng-deep/; const contaminated = comments(gen).filter(x => ISMS.test(x)).length;
    const gc = new Set(comments(gen)), rc = comments(readCss(rf)); const missing = rc.filter(x => !gc.has(x)).length;
    const sd = semDiff(g, r); fs.writeFileSync(`${OUT}/${dir}.sem`, sd.det.join('\n'));
    console.log([dir, ld.n === 0, ld.n, sd.n, `${e.total}(${e.inherent}/${e.accidental})`, `${missing}/${rc.length}`, contaminated].join(' | '));
  }
})();
