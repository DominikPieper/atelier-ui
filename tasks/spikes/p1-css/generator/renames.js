const cp=require('child_process'),fs=require('fs');const REPO='/Users/dominikpieper/Projects/atelier';
const CONFIG=require('./config.js');
function count(cls, dir, fw){ // occurrences of class token in non-css files under libs/<fw>/src/lib/<dir>, split src/test/stories
  const base=`${REPO}/libs/${fw}/src/lib/${dir}`; const name=cls.replace(/^\./,'');
  const re=`(^|[^A-Za-z0-9_-])${name}($|[^A-Za-z0-9_-])`;
  const r=cp.spawnSync('grep',['-rnE','--include=*.ts','--include=*.tsx','--include=*.vue','--include=*.html',re,base],{encoding:'utf8'});
  const lines=r.stdout.split('\n').filter(Boolean); let src=0,test=0,story=0;
  for(const l of lines){const f=l.split(':')[0]; if(/\.(spec|test)\./.test(f))test++; else if(/\.stories\./.test(f))story++; else src++;}
  return {src,test,story,total:src+test+story};
}
function elsewhere(cls){ // docs / tools / workshop / apps
  const name=cls.replace(/^\./,''); const re=`(^|[^A-Za-z0-9_-])${name}($|[^A-Za-z0-9_-])`; let n=0;
  for(const t of ['docs/src','tools','apps','workshop','libs/spec']){ if(!fs.existsSync(`${REPO}/${t}`))continue;
    const r=cp.spawnSync('grep',['-rlE','--include=*.ts','--include=*.js','--include=*.mjs','--include=*.json','--include=*.astro','--include=*.mdx','--include=*.tsx','--exclude-dir=node_modules',re,`${REPO}/${t}`],{encoding:'utf8'}); n+=r.stdout.split('\n').filter(Boolean).length; }
  return n; }
const rows=[];
for(const [dir,cfg] of Object.entries(CONFIG)){
  for(const o of cfg.ops||[]){
    if(o.t==='rename'||o.t==='hostAlias'){
      const a=count(o.from,dir,'angular'), r=count(o.to,dir,'react'), v=count(o.to,dir,'vue');
      // cost to rename ANGULAR side to match React = occurrences of o.from in angular ; cost to rename REACT+VUE to match Angular = occurrences of o.to in react+vue
      const aN = count(o.from,dir,'angular'), rvOld = count(o.to===o.from?o.from:o.from,dir,'react'); 
      rows.push({dir,from:o.from,to:o.to,angularHasFrom:aN,reactHasTo:r,vueHasTo:v,reactHasFrom:count(o.from,dir,'react').total,vueHasFrom:count(o.from,dir,'vue').total,angularHasTo:count(o.to,dir,'angular').total,docsToolsFrom:elsewhere(o.from),docsToolsTo:elsewhere(o.to)});
    }
  }
}
const f=x=>`${x.total}(s${x.src}/t${x.test}/st${x.story})`;
console.log('dir | angular-name -> react-name | ANGULAR uses angular-name | REACT uses react-name | VUE uses react-name | (cross-check: A uses react-name / R uses angular-name) | docs+tools files(A-name/R-name)');
for(const r of rows) console.log(`${r.dir} | ${r.from} -> ${r.to} | ${f(r.angularHasFrom)} | ${f(r.reactHasTo)} | ${f(r.vueHasTo)} | ${r.angularHasTo}/${r.reactHasFrom}+${r.vueHasFrom} | ${r.docsToolsFrom}/${r.docsToolsTo}`);
