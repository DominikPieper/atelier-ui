const {chromium}=require('/Users/dominikpieper/Projects/atelier/node_modules/playwright');
const fs=require('fs');const css=fs.readFileSync('/Users/dominikpieper/Projects/atelier/libs/vue/src/lib/drawer/atl-drawer.css','utf8');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [name,html] of [
 ['react-shape','<div class="atl-drawer-host position-right size-md"><dialog><div class="panel">PANEL</div></dialog></div>'],
 ['vue-shape','<dialog class="atl-drawer-host position-right size-md"><div class="panel">PANEL</div></dialog>']]){
 await p.setContent(`<style>${css}</style><body>${html}</body>`);
 const r=await p.evaluate(()=>{const d=document.querySelector('dialog');const pn=document.querySelector('.panel');const cs=getComputedStyle(d);return {dialogDisplay:cs.display,dialogPos:cs.position,panelVisibleRect:pn.getBoundingClientRect().height>0}});
 await p.evaluate(()=>document.querySelector('dialog').showModal());
 const r2=await p.evaluate(()=>{const d=document.querySelector('dialog');const cs=getComputedStyle(d);const rc=d.getBoundingClientRect();return {open_display:cs.display,pos:cs.position,bg:cs.backgroundColor,w:rc.width,x:rc.x}});
 console.log(name,JSON.stringify(r),JSON.stringify(r2));}
await b.close();})();
