const fs=require('fs');const REPO='/Users/dominikpieper/Projects/atelier';const postcss=require(REPO+'/node_modules/postcss');
const css=d=>postcss.parse(fs.readFileSync(`${REPO}/libs/react/src/lib/${d}/atl-${d}.css`,'utf8'));
function props(d,test){const m={};css(d).walkRules(r=>{if(r.parent&&r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return;r.selectors.forEach(s=>{if(test(s.replace(/\s+/g,' ').trim()))r.walkDecls(x=>{if(x.parent===r)m[x.prop]=x.value;});});});return m;}
function cmp(name,leakDir,leakTest,vicDir,vicTest){const L=props(leakDir,leakTest),V=props(vicDir,vicTest);
 const only=Object.keys(L).filter(p=>!(p in V)); const diff=Object.keys(L).filter(p=>p in V&&V[p]!==L[p]);
 console.log(`${name}: leaked rule(s) in ${leakDir} set ${Object.keys(L).length} props; victim ${vicDir} sets ${Object.keys(V).length}; props ONLY from leak: [${only.join(', ')}]; overridden-by-different-value: [${diff.join(', ')}]`);}
const bareClass=c=>s=>s===c||s.startsWith(c+':');
cmp('close-btn dialog->chat','dialog',bareClass('.close-btn'),'chat',s=>/\.close-btn/.test(s)&&!/hover|focus/.test(s));
cmp('close-btn drawer->chat','drawer',bareClass('.close-btn'),'chat',s=>/\.close-btn/.test(s)&&!/hover|focus/.test(s));
cmp('.panel dialog->drawer','dialog',s=>s==='.panel','drawer',s=>/(^| )\.panel$/.test(s)||/\.panel$/.test(s));
cmp('.track progress->toggle','progress',bareClass('.track'),'toggle',s=>/(^| )\.track$/.test(s));
