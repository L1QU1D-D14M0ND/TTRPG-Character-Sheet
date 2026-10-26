// Real-browser walkthrough of the PF1e catalog picker. See
// walkthrough-encyclopedia.mjs for the Chrome/CDP setup this shares.
//
// Guards the fix for the row cap being spent in group order, which hid every
// Advanced Player's Guide spell behind a search until the share was made fair.

const BASE='http://127.0.0.1:9222'
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms))
class S{constructor(ws){this.ws=ws;this.id=0;this.p=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&this.p.has(m.id)){const{resolve,reject}=this.p.get(m.id);this.p.delete(m.id);m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result)}})}
send(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.p.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
async eval(x){const r=await this.send('Runtime.evaluate',{expression:x,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+' :: '+x);return r.result.value}}
const CLICK=(re)=>`(()=>{const b=[...document.querySelectorAll('button')].find(x=>${re}.test(x.textContent.trim()));if(b){b.click();return b.textContent.trim()}return null})()`
const out=[];const ck=(n,p,d)=>{out.push(p);console.log(`${p?'PASS':'FAIL'}  ${n}${d?'  -- '+d:''}`)}
const page=(await(await fetch(`${BASE}/json/list`)).json()).find(t=>t.type==='page')
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r))
const s=new S(ws);await s.send('Runtime.enable')
const errs=[];ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errs.push(m.params.exceptionDetails.text)})
await s.send('Page.navigate',{url:'http://localhost:5173/'});await sleep(2200)
await s.eval(CLICK('/new sheet/i'));await sleep(600)
await s.eval(CLICK('/Pathfinder First Edition/i'));await sleep(1200)
await s.eval(CLICK('/^Spells$/'));await sleep(800)
await s.eval(CLICK('/Add spellcasting/'));await sleep(800)
await s.eval(CLICK('/^Add spell$/'));await sleep(800)
const trig=await s.eval(CLICK('/^Custom$/'));console.log('picker trigger ->',trig);await sleep(900)
const d=await s.eval(`(()=>{const dlg=document.querySelector('[role=dialog]');if(!dlg)return null;
const groups=[...dlg.querySelectorAll('.catalog-picker-group')].map(p=>p.textContent.trim());
const opts=[...dlg.querySelectorAll('.catalog-picker-list button')].map(o=>o.textContent.trim());
const more=[...dlg.querySelectorAll('.catalog-picker-more')].map(p=>p.textContent.trim());
return {groups,count:opts.length,sample:opts.slice(0,3),tail:opts.slice(-3),more}})()`)
console.log('PICKER:',JSON.stringify(d))
if(!d){console.log('FAIL: no dialog');process.exit(1)}
ck('picker shows both book optgroups on open', d.groups.length>=2, JSON.stringify(d.groups))
ck('Advanced Player\u2019s Guide group present without searching', d.groups.some(g=>/Advanced/i.test(g)))
// Confirm an actual APG spell row is listed, not just the heading
const apg=await s.eval(`(()=>{const dlg=document.querySelector('[role=dialog]');
const names=[...dlg.querySelectorAll('.catalog-picker-list button')].map(b=>b.textContent.trim());
return names.filter(n=>/Summon Eidolon|Ant Haul|Unfetter|Rejuvenate Eidolon/.test(n))})()`)
ck('APG spell rows reachable on the first page', apg.length>0, JSON.stringify(apg))
ck('no console errors', errs.length===0, errs.length?JSON.stringify(errs.slice(0,2)):'none')
ws.close()
console.log(`\n${out.filter(Boolean).length}/${out.length} checks passed in real Chrome`)
if(out.some(x=>!x))process.exit(1)
