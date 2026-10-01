const fs=require('fs'),cp=require('child_process');
const REPO='/Users/dominikpieper/Projects/atelier';
const postcss=require(REPO+'/node_modules/postcss'), sp=require(REPO+'/node_modules/postcss-selector-parser');
const dirs=fs.readdirSync(REPO+'/libs/react/src/lib').filter(d=>fs.existsSync(`${REPO}/libs/react/src/lib/${d}/atl-${d}.css`));
const rows=[];
for(const d of dirs){
  const ast=postcss.parse(fs.readFileSync(`${REPO}/libs/react/src/lib/${d}/atl-${d}.css`,'utf8'));
  ast.walkRules(r=>{ if(r.parent&&r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return;
    r.selectors.forEach(s=>{ if(/\.atl-[a-z-]+/.test(s)||/^:is\(/.test(s))return;
      const a=sp().astSync(s); const sel=a.first; let key=null; // first class token or tag of leading compound
      for(const n of sel.nodes){ if(n.type==='combinator')break; if(n.type==='class'){key='.'+n.value;break;} if(n.type==='tag'&&!key)key=n.value; if(n.type==='attribute'&&!key)key=n.toString();}
      rows.push({d,s:s.replace(/\s+/g,' '),key}); });});
}
const keys=[...new Set(rows.map(r=>r.key))];
console.log('unscoped:',rows.length,'distinct leading keys:',keys.length);
const res=[];
for(const k of keys){ if(!k||!k.startsWith('.'))continue; const name=k.slice(1);
  const owners=new Set(rows.filter(r=>r.key===k).map(r=>r.d));
  const re=`(class(Name)?=|class:|:class=|clsx|classNames).*(^|[^A-Za-z0-9_-])${name}($|[^A-Za-z0-9_-])`;
  const r=cp.spawnSync('grep',['-rnE','--include=*.tsx','--include=*.vue','--include=*.ts','--exclude=*.stories.*','--exclude=*.spec.*','--exclude=*.test.*','--exclude-dir=node_modules',re,`${REPO}/libs/react/src/lib`,`${REPO}/libs/vue/src/lib`],{encoding:'utf8'});
  const hits=r.stdout.split('\n').filter(Boolean).map(l=>l.replace(REPO+'/libs/','')).filter(l=>![...owners].some(o=>l.includes(`/lib/${o}/`)));
  res.push({k,owners:[...owners],n:rows.filter(r=>r.key===k).length,outside:hits});
}
for(const x of res) console.log(x.k.padEnd(22),'rules',String(x.n).padEnd(3),'owners',x.owners.join('+').padEnd(22),'outside-template-uses:',x.outside.length, x.outside.slice(0,2).map(h=>h.split(':')[0]).join(' | '));
console.log('\nnon-class leading keys (element/attr selectors):',rows.filter(r=>!r.key||!r.key.startsWith('.')).map(r=>r.d+': '+r.s).join('\n  '));
