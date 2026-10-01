const fs=require('fs'),path=require('path');const REPO='/Users/dominikpieper/Projects/atelier';
const walk=(d,o=[])=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(e.name!=='node_modules')walk(p,o);}else if(/\.(ts|tsx|vue|html)$/.test(e.name))o.push(p);}return o;};
const esc=s=>s.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&');
function count(name,dir,fw){
  const files=walk(`${REPO}/libs/${fw}/src/lib/${dir}`); const w=`(?<![\\w-])${esc(name)}(?![\\w-])`;
  const ctx=new RegExp(`(class(Name|List|Names)?\\b|:class|\\[class\\.|clsx|classes?\\()[^\\n]*${w}|['"\`][^'"\`\\n]*\\.${w}[^'"\`\\n]*['"\`]|\\[class\\.${w}\\]`);
  let src=0,test=0,story=0;
  for(const f of files){const t=fs.readFileSync(f,'utf8').split('\n');for(const l of t){ if(!ctx.test(l))continue; if(/\.(spec|test)\./.test(f))test++;else if(/\.stories\./.test(f))story++;else src++; }}
  return {src,test,story,total:src+test+story};}
const pairs=[
 ['avatar','group','atl-avatar-group'],
 ...[['combobox-wrapper','atl-combobox-wrapper'],['combobox-input','atl-combobox-input'],['combobox-icon','atl-combobox-icon'],['panel','atl-combobox-panel'],['option','atl-combobox-option'],['option-check','atl-combobox-check'],['no-results','atl-combobox-no-results'],['errors','atl-combobox-errors'],['error-message','atl-combobox-error-message']].map(p=>['combobox',...p]),
 ['breadcrumbs','list','breadcrumbs-list'],
 ['drawer','atl-drawer','atl-drawer-host'],
];
const f=x=>`${x.total} (src ${x.src}, test ${x.test}, story ${x.story})`;
let aSum=0,rvSum=0;
for(const [dir,a,r] of pairs){
  const A=count(a,dir,'angular'),R=count(r,dir,'react'),V=count(r,dir,'vue');
  // reverse costs: renaming Angular to r  => occurrences of `a` in Angular; renaming React/Vue to a => occurrences of `r` in React+Vue
  aSum+=A.total; rvSum+=R.total+V.total;
  console.log(`${dir.padEnd(12)} ${a.padEnd(18)} -> ${r.padEnd(30)} | rename in ANGULAR (uses '${a}'): ${f(A)} | rename in REACT+VUE (use '${r}'): R ${f(R)} / V ${f(V)}`);
}
console.log('TOTAL angular side',aSum,' react+vue side',rvSum);
