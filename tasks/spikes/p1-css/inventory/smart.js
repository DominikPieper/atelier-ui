// "Smart" transform pass: per-component host-class set, tag->class, no descendant prefix (canonicalised on both sides).
const path=require('path'),fs=require('fs');
const REPO='/Users/dominikpieper/Projects/atelier';
const postcss=require(REPO+'/node_modules/postcss');
const OUT=path.join(__dirname,'out');
const ALIAS={ 'atl-drawer':{'.atl-drawer':'.atl-drawer-host'} };
const PRIMARY={ 'atl-accordion':'.atl-accordion-group','atl-drawer':'.atl-drawer-host','atl-tabs':'.atl-tab-group' };
const walkFiles=fw=>{const r={};const w=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())w(p);else if(/^atl-.*\.css$/.test(e.name))r[e.name.slice(0,-4)]=p;}};w(`${REPO}/libs/${fw}/src/lib`);return r;};
const strip=css=>{const a=postcss.parse(css);a.walkComments(c=>c.remove());return a;};
const readParen=(s,i)=>{let d=0,j=i;for(;j<s.length;j++){if(s[j]==='(')d++;else if(s[j]===')'){d--;if(!d)break;}}return [s.slice(i+1,j),j+1];};
const norm=s=>s.replace(/\s+/g,' ').replace(/\s*([>+~,])\s*/g,' $1 ').replace(/\s+/g,' ').replace(/"/g,"'").replace(/\( /g,'(').replace(/ \)/g,')').trim();
const tag2cls=s=>s.replace(/(^|[\s>+~(,])(atl-[a-z-]+)(?![\w-])/g,'$1.$2');

function smartSel(sel,primary,set,log,name){
  sel=sel.trim();
  if(sel.startsWith(':host-context(')){
    const [y,k]=readParen(sel,':host-context'.length);const rest=sel.slice(k).trim();
    log.push({name,selector:sel});
    return tag2cls(y)+' '+(rest.startsWith(':host')?smartSel(rest,primary,set,log,name):(primary+(rest?' '+rest:'')));
  }
  if(sel.startsWith(':host(')){
    const [x,k]=readParen(sel,':host'.length);
    let xc=tag2cls(x.trim()); const al=ALIAS[name]||{}; xc=xc.replace(/^\.[\w-]+/,m=>al[m]||m); const first=(xc.match(/^\.[\w-]+/)||[''])[0];
    const head= set.includes(first)||/^\.atl-/.test(first)&&!x.startsWith('.is-')&&set.includes(first) ? xc : primary+xc;
    const tail=sel.slice(k);
    if(tail.startsWith(':host-context(')){const [y,k2]=readParen(tail,':host-context'.length);log.push({name,selector:sel});return tag2cls(y)+' '+head+tag2cls(tail.slice(k2));}
    return head+tag2cls(tail);
  }
  if(sel.startsWith(':host')) return primary+tag2cls(sel.slice(5));
  return tag2cls(sel);
}
// canonical: drop leading "<anyRootInSet> " descendant prefix
function canonSel(sel,set){ sel=norm(sel); for(const r of set){ if(sel.startsWith(r+' ')&&!/^\s*[>+~]/.test(sel.slice(r.length))){ return sel.slice(r.length+1); } } return sel; }

function ruleMap(ast,set,boxKey){
  const m=new Map();
  ast.walkRules(r=>{
    if(r.parent&&r.parent.type==='atrule'&&/keyframes$/.test(r.parent.name)){ // keyframes: key by name+selector
    }
    const ctx=[];for(let p=r.parent;p&&p.type==='atrule';p=p.parent)ctx.unshift(`@${p.name} ${norm(p.params)}`);
    const decls={};r.walkDecls(x=>{if(x.parent===r)decls[x.prop]=norm(x.value);});
    let sels=r.selectors.map(s=>canonSel(s,set));
    // box-sizing preamble: any selector list made only of :is(...)/ :is(...) * / root,* sets with only box-sizing
    if(Object.keys(decls).join()==='box-sizing'&&/^:is\(|^\.[\w-]+( \*)?$|^\*$/.test(sels[0])&&sels.length<=2&&(sels.some(s=>s.startsWith(':is(')||s==='*'||/ \*$/.test(s))||true)&&!ctx.length){
      const k='[box-sizing preamble]';m.set(k,Object.assign(m.get(k)||{},decls));return;}
    const k=ctx.join(' | ')+' || '+sels.join(', ');
    m.set(k,Object.assign(m.get(k)||{},decls));
  });
  return m;
}
const sig=d=>JSON.stringify(Object.entries(d).sort());
function diffMaps(a,b){
  const o={same:0,valueDiff:[],aOnly:[],bOnly:[]};
  for(const [k,da] of a){ if(!b.has(k)){o.aOnly.push([k,da]);continue;} const db=b.get(k);
    if(sig(da)===sig(db)){o.same++;continue;}
    const diffs=[];for(const p of new Set([...Object.keys(da),...Object.keys(db)]))if(da[p]!==db[p])diffs.push({prop:p,a:da[p]??null,b:db[p]??null});
    o.valueDiff.push({key:k,diffs});}
  for(const [k,db] of b)if(!a.has(k))o.bOnly.push([k,db]);
  o.renamed=[];
  for(const ao of [...o.aOnly]){const i=o.bOnly.findIndex(bo=>sig(bo[1])===sig(ao[1]));if(i>=0){o.renamed.push({a:ao[0],b:o.bOnly[i][0]});o.bOnly.splice(i,1);o.aOnly.splice(o.aOnly.indexOf(ao),1);}}
  return o;
}
const A=walkFiles('angular'),R=walkFiles('react'),V=walkFiles('vue');
const res={},hostCtx=[];
for(const name of Object.keys(A).sort()){
  const rf=R[name];
  // set from the React ':is(...)' preamble, else primary
  let primary=PRIMARY[name]||`.${name}`, set=[primary];
  if(rf){const t=fs.readFileSync(rf,'utf8');const m=t.match(/:is\(([^)]*)\)/);if(m)set=[...new Set([primary,...m[1].split(',').map(s=>s.trim())])];}
  const ast=strip(fs.readFileSync(A[name],'utf8'));
  ast.walkRules(r=>{if(r.parent&&r.parent.type==='atrule'&&/keyframes$/.test(r.parent.name))return;r.selectors=r.selectors.map(s=>smartSel(s,primary,set,hostCtx,name));});
  const am=ruleMap(ast,set);
  if(name==='atl-toast'){ const c=strip(fs.readFileSync(A['atl-toast-container'],'utf8'));
    c.walkRules(r=>{r.selectors=r.selectors.map(x=>smartSel(x,'.atl-toast-container',set,hostCtx,name));});
    for(const [k,d] of ruleMap(c,set)) if(k==='[box-sizing preamble]'){} else am.set(k,Object.assign(am.get(k)||{},d)); }
  const rec={primary,set};
  if(rf){ const rm=ruleMap(strip(fs.readFileSync(rf,'utf8')),set); rec.AR=diffMaps(am,rm);
    if(V[name]){const vm=ruleMap(strip(fs.readFileSync(V[name],'utf8')),set);rec.RV=diffMaps(rm,vm);} }
  rec.aRules=am.size; res[name]=rec;
}
fs.writeFileSync(path.join(OUT,'smart.json'),JSON.stringify({res,hostCtx},null,1));
console.log('name | same | valDiff | renamed | aOnly | bOnly | RV');
for(const [n,r] of Object.entries(res)){const q=r.AR;const v=r.RV;console.log([n,q?q.same:'-',q?q.valueDiff.length:'-',q?q.renamed.length:'-',q?q.aOnly.length:'-',q?q.bOnly.length:'-',v?`${v.valueDiff.length}/${v.aOnly.length}/${v.bOnly.length}`:'-'].join(' | '));}
