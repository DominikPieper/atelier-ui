process.env.FORCEPREFIX='1';
const fs=require('fs');const g=require('./gen.js');const postcss=require(g.REPO+'/node_modules/postcss');
const norm=x=>x.replace(/\s+/g,' ').replace(/\s*([>+~,])\s*/g,' $1 ').replace(/\s+/g,' ').replace(/"/g,"'").trim();
function map(css,roots,canon){const m=new Map();postcss.parse(g.strip(css)).walkRules(r=>{
  const ctx=[];for(let p=r.parent;p&&p.type==='atrule';p=p.parent)ctx.unshift('@'+p.name+' '+norm(p.params));
  let sels=r.selectors.map(norm); if(canon) sels=sels.map(s=>{for(const x of roots) if(s.startsWith(x+' ')) return s.slice(x.length+1); return s;});
  const k=ctx.join('|')+'||'+sels.sort().join(','); const d=m.get(k)||{};r.walkDecls(y=>{if(y.parent===r)d[y.prop]=norm(y.value)});m.set(k,d);});return m;}
(async()=>{
 const dirs=fs.readdirSync(`${g.REPO}/libs/react/src/lib`).filter(d=>fs.existsSync(`${g.lib('react',d)}/atl-${d}.css`)).sort();
 let tot={raw:0,canon:0,prefixOnly:0};
 for(const d of dirs){const gen=await g.fmt(g.generate(d),`${g.lib('react',d)}/atl-${d}.css`);const r=fs.readFileSync(`${g.lib('react',d)}/atl-${d}.css`,'utf8');
  const roots=[...new Set((gen+r).match(/\.atl-[a-z-]+(?= )/g)||[])];
  const cnt=(c)=>{const A=map(gen,roots,c),B=map(r,roots,c);let n=0;for(const [k,v] of A){if(!B.has(k)||JSON.stringify(Object.entries(v).sort())!==JSON.stringify(Object.entries(B.get(k)).sort()))n++;}for(const k of B.keys())if(!A.has(k))n++;return n;};
  const raw=cnt(false),canon=cnt(true); tot.raw+=raw;tot.canon+=canon;
  if(raw||canon) console.log(d.padEnd(12),'rule keys differing raw:',raw,' after dropping leading root prefix:',canon);}
 console.log('TOTAL',tot);
})();
