const fs=require('fs'),path=require('path');const REPO='/Users/dominikpieper/Projects/atelier';const postcss=require(REPO+'/node_modules/postcss');
const files=fw=>{const r={};const w=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())w(p);else if(/^atl-.*\.css$/.test(e.name))r[e.name.slice(0,-4)]=p;}};w(`${REPO}/libs/${fw}/src/lib`);return r;};
// 1. :host-context / :host() / ng-deep occurrences in CODE (comments stripped)
const A=files('angular');let hc=[],nd=[],tot={host:0,hostFn:0,ctx:0};
for(const [n,f] of Object.entries(A)){const ast=postcss.parse(fs.readFileSync(f,'utf8'));ast.walkComments(c=>c.remove());
 ast.walkRules(r=>r.selectors.forEach(s=>{if(/:host-context/.test(s))hc.push(n+': '+s.replace(/\s+/g,' '));if(/::ng-deep|>>>|\/deep\//.test(s))nd.push(n+': '+s);
  if(/:host\(/.test(s))tot.hostFn++;else if(/:host(?!-)/.test(s))tot.host++;}));}
console.log('host-context in code:',hc.length);hc.forEach(x=>console.log('  ',x));console.log('ng-deep:',nd.length,'  :host(...) selectors',tot.hostFn,' bare :host selectors',tot.host);
// 2. unscoped selectors in React/Vue: rules whose every compound lacks an .atl- class or the root
for(const fw of ['react','vue']){const F=files(fw);let bare=[];
 for(const [n,f] of Object.entries(F)){const ast=postcss.parse(fs.readFileSync(f,'utf8'));ast.walkRules(r=>{if(r.parent&&r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return;r.selectors.forEach(s=>{if(!/\.atl-[a-z-]+/.test(s)&&!/^:is\(/.test(s)&&!/^@/.test(s))bare.push(n+': '+s.replace(/\s+/g,' '));});});}
 const byComp={};bare.forEach(b=>{const k=b.split(':')[0];byComp[k]=(byComp[k]||0)+1});
 console.log(`\n${fw}: rules WITHOUT any .atl-* class (globally-scoped):`,bare.length,JSON.stringify(byComp));}
// 3. Vue scoped?
const v=require('child_process').execSync(`grep -rln "<style" ${REPO}/libs/vue/src --include='*.vue' || true`,{encoding:'utf8',shell:'/bin/bash'});console.log('\nvue SFC files with <style>:',v.trim()||'none');
