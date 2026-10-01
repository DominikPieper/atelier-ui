// (a) unscoped React/Vue rules -> class tokens; who else references them (outside owning component dir)?
const fs=require('fs'),path=require('path'),cp=require('child_process');
const REPO='/Users/dominikpieper/Projects/atelier';
const postcss=require(REPO+'/node_modules/postcss'), sp=require(REPO+'/node_modules/postcss-selector-parser');
const dirs=fs.readdirSync(REPO+'/libs/react/src/lib').filter(d=>fs.existsSync(`${REPO}/libs/react/src/lib/${d}/atl-${d}.css`));
const tokens={}; // token -> {dirs:Set, rules:n}
let total=0;
for(const d of dirs){
  const ast=postcss.parse(fs.readFileSync(`${REPO}/libs/react/src/lib/${d}/atl-${d}.css`,'utf8'));
  ast.walkRules(r=>{ if(r.parent&&r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return;
    r.selectors.forEach(s=>{ if(/\.atl-[a-z-]+/.test(s)||/^:is\(/.test(s))return; total++;
      sp().astSync(s).walkClasses(k=>{(tokens[k.value]=tokens[k.value]||{dirs:new Set(),rules:0}); tokens[k.value].dirs.add(d); tokens[k.value].rules++;});});});
}
console.log('unscoped selectors (React):',total,' distinct class tokens:',Object.keys(tokens).length);
// token shared by >1 component CSS = actual global collision
const coll=Object.entries(tokens).filter(([,v])=>v.dirs.size>1);
console.log('tokens defined by >1 component stylesheet (live collision):',coll.map(([k,v])=>k+':'+[...v.dirs].join('+')).join('  '));
// who references tokens outside the owning dir: grep templates + css across libs/react, libs/vue, docs/src, apps
const targets=[`${REPO}/libs/react/src`,`${REPO}/libs/vue/src`,`${REPO}/docs/src`,`${REPO}/apps`];
const out=[];
for(const [tok,v] of Object.entries(tokens)){
  const re=`(^|[^A-Za-z0-9_-])${tok.replace(/[-]/g,'\\-')}($|[^A-Za-z0-9_-])`;
  for(const t of targets){ if(!fs.existsSync(t))continue;
    const r=cp.spawnSync('grep',['-rnE','--include=*.tsx','--include=*.ts','--include=*.vue','--include=*.css','--include=*.astro','--include=*.mdx','--include=*.md','--exclude-dir=node_modules','--exclude-dir=dist',re,t],{encoding:'utf8',maxBuffer:1<<28});
    for(const line of r.stdout.split('\n').filter(Boolean)){
      const f=line.split(':')[0]; const rel=f.replace(REPO+'/','');
      const owner=[...v.dirs].some(d=>rel.includes(`/lib/${d}/`));
      if(!owner) out.push(`${tok} <- ${rel}:${line.split(':')[1]}  ${line.split(':').slice(2).join(':').trim().slice(0,90)}`);
    } }
}
fs.writeFileSync(__dirname+'/out/sideeffects.txt',out.join('\n'));
console.log('references to leaked tokens outside owning component dir:',out.length);
