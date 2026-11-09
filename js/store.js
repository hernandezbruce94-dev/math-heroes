/* ================= SAVED PROGRESS =================
   v4: several kid profiles. Saved in this browser (Cache Storage, with a small cookie fallback).
   Optional family sync code keeps devices in step through the game's own small server.
   No accounts; nothing is shared with anyone else. */
const newProfile=(name='')=>({id:Math.random().toString(36).slice(2,9),kid:name,heroId:'bolt',custom:null,stars:0,xp:0,
  lv:{math:1,word:1,water:1,lab:1},ms:{},spell:[],ses:[],rq:[],daily:{days:[],streak:0,best:0},
  pet:null,scenes:{},sk:{},flu:[],ran:[],tests:[],updated:Date.now()});
const DEFAULT_FAMILY=()=>{const p=newProfile();return{v:4,active:p.id,profiles:{[p.id]:p},
  set:{voice:'hero',music:true,breakMin:0},sync:null,updated:Date.now()};};
let FAM=DEFAULT_FAMILY(), SAVE=FAM.profiles[FAM.active], canPersist=false, storeKind='none';
const CACHE_NAME='mh-save', CACHE_KEY='/__mh_save_v4';
const CK='__Host-mh', CHUNK=3000, MAXC=6;

/* ---- cookie helpers (v3 save + fallback) ---- */
function cookieGet(){let s='';for(let i=0;i<MAXC;i++){const m=document.cookie.match(new RegExp('(?:^|; )'+CK.replace(/-/g,'\\-')+i+'=([^;]*)'));if(!m)break;s+=m[1];}return s?decodeURIComponent(s):'';}
function cookieSet(str){const enc=encodeURIComponent(str);const parts=[];for(let i=0;i<enc.length;i+=CHUNK)parts.push(enc.slice(i,i+CHUNK));
  if(parts.length>MAXC)return false;
  for(let i=0;i<MAXC;i++){if(i<parts.length)document.cookie=`${CK}${i}=${parts[i]}; Max-Age=63072000; Path=/; Secure; SameSite=Lax`;
    else document.cookie=`${CK}${i}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;}return true;}
function cookieClear(){for(let i=0;i<MAXC;i++)document.cookie=`${CK}${i}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;}

function migrate(d){
  if(!d)return null;
  if(d.v===4&&d.profiles)return d;
  if(d.v===3){ // single save from v3 → first profile
    const p=Object.assign(newProfile(d.kid||''),d);delete p.v;delete p.set;delete p.seenUnlock;
    p.rq=p.rq||[];p.daily=p.daily||{days:[],streak:0,best:0};p.scenes=p.scenes||{};p.id=p.id||Math.random().toString(36).slice(2,9);
    return{v:4,active:p.id,profiles:{[p.id]:p},set:Object.assign({voice:'hero',music:true,breakMin:0},d.set||{}),sync:null,updated:Date.now()};
  }
  return null;
}
/* ---- clean every save (local, restored, or synced) so only expected, safe values are kept ---- */
const SAFE={
  num:(v,lo=0,hi=1e7)=>{v=Math.round(Number(v));return Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):lo;},
  str:(v,n=40)=>typeof v==='string'?v.replace(/[<>"'`&\\]/g,'').slice(0,n):'',
  key:(v,re)=>typeof v==='string'&&re.test(v)?v:null,
  color:v=>typeof v==='string'&&(/^#[0-9a-f]{3,8}$/i.test(v)||/^[a-z]{1,12}$/.test(v))?v:null,
};
function cleanVal(v,depth){ // problem specs: plain numbers, short safe strings, small arrays/objects
  if(typeof v==='number')return Number.isFinite(v)?v:0;
  if(typeof v==='boolean')return v;
  if(typeof v==='string')return /^[A-Za-z0-9 +\-?.,!=:_×−÷]{0,40}$/.test(v)?v:'';
  if(depth>2||v===null||typeof v!=='object')return null;
  if(Array.isArray(v))return v.slice(0,30).map(x=>cleanVal(x,depth+1));
  const o={};for(const k of Object.keys(v).slice(0,20))if(/^[a-z0-9_]{1,12}$/i.test(k))o[k]=cleanVal(v[k],depth+1);return o;
}
const cleanSpec=s=>{const c=cleanVal(s,0);return c&&typeof c==='object'&&!Array.isArray(c)&&typeof c.t==='string'?c:null;};
function cleanProfile(p,id){
  const b=newProfile();b.id=id;if(!p||typeof p!=='object')return b;
  b.kid=SAFE.str(p.kid,16);b.heroId=SAFE.key(p.heroId,/^[a-z0-9_-]{1,16}$/)||'bolt';
  if(p.custom&&typeof p.custom==='object'){const c=p.custom,o={name:SAFE.str(c.name,16)};
    for(const k of ['suit','cape','mask','emblem','skin','hair','blast','blastColor']){const v=SAFE.color(c[k]);if(v)o[k]=v;}
    b.custom=Object.assign({suit:'#2a9df4',cape:'#e63946',mask:'#14142b',emblem:'bolt',skin:'#f6c9a0',hair:'#3b2314',blast:'normal'},o);}
  b.stars=SAFE.num(p.stars);b.xp=SAFE.num(p.xp);
  for(const w of ['math','word','water','lab'])b.lv[w]=SAFE.num((p.lv||{})[w]||1,1,3);
  for(const [k,v] of Object.entries(p.ms||{}).slice(0,200))if(/^[a-z]{1,10}:[a-z0-9]{1,12}$/.test(k))b.ms[k]=SAFE.num(v,0,3);
  b.spell=(Array.isArray(p.spell)?p.spell:[]).filter(w=>typeof w==='string'&&/^[a-z' -]{1,20}$/i.test(w)).slice(0,40);
  b.ses=(Array.isArray(p.ses)?p.ses:[]).slice(-15).filter(x=>x&&typeof x==='object').map(x=>({d:SAFE.str(x.d,20).replace(/[^0-9 :-]/g,''),w:SAFE.key(x.w,/^(math|word|water|lab)$/)||'math',
    m:SAFE.str(x.m,60),sc:SAFE.num(x.sc,0,100),n:SAFE.num(x.n,0,100),st:SAFE.num(x.st,0,1000),h:SAFE.num(x.h,0,100),
    mi:(Array.isArray(x.mi)?x.mi:[]).slice(0,8).map(m=>({w:SAFE.key(m&&m.w,/^(math|word|water|lab)$/)||'math',s:cleanSpec(m&&m.s),l:SAFE.str(m&&m.l,60)}))}));
  b.rq=(Array.isArray(p.rq)?p.rq:[]).slice(-40).map(x=>x&&({s:cleanSpec(x.s),l:SAFE.str(x.l,60),due:SAFE.num(x.due,0,1e13),b:SAFE.num(x.b,0,3)})).filter(x=>x&&x.s);
  const d=p.daily||{};b.daily={days:(Array.isArray(d.days)?d.days:[]).filter(x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)).slice(-90),streak:SAFE.num(d.streak,0,9999),best:SAFE.num(d.best,0,9999)};
  if(p.pet&&typeof p.pet==='object'){const pid=SAFE.key(p.pet.id,/^[a-z]{1,12}$/);if(pid&&(typeof PETS==='undefined'||PETS.some(x=>x.id===pid)))b.pet={id:pid,name:SAFE.str(p.pet.name,14)||'Buddy',xp:SAFE.num(p.pet.xp)};}
  for(const k of Object.keys(p.scenes||{}).slice(0,40))if(/^[a-z]{1,10}:[a-z]{1,10}$/.test(k))b.scenes[k]=1;
  b.rd=(Array.isArray(p.rd)?p.rd:[]).map(x=>SAFE.num(x,0,99)).slice(0,50);
  if(p.eye&&typeof p.eye==='object'&&/^\d{4}-\d\d-\d\d$/.test(p.eye.d))b.eye={d:p.eye.d,m:SAFE.num(p.eye.m,0,600)};
  const DATE=/^\d{4}-\d\d-\d\d$/;
  if(p.sk&&typeof p.sk==='object')for(const k of Object.keys(p.sk).slice(0,20)){if(!/^(snd|dec|aln|bln|sil|syl|enc|lsnd|flp|spell|sight|comp|math|rgp)$/.test(k))continue;const o={};
    for(const [m,v] of Object.entries(p.sk[k]||{}).slice(-24))if(/^\d{4}-\d\d$/.test(m)&&Array.isArray(v))o[m]=[SAFE.num(v[0],0,1e5),SAFE.num(v[1],0,1e5)];b.sk[k]=o;}
  b.flu=(Array.isArray(p.flu)?p.flu:[]).slice(-60).filter(x=>x&&DATE.test(x.d)).map(x=>({d:x.d,i:SAFE.num(x.i,0,20),w:SAFE.num(x.w,0,400),a:SAFE.num(x.a,0,100)}));
  b.ran=(Array.isArray(p.ran)?p.ran:[]).slice(-60).filter(x=>x&&DATE.test(x.d)).map(x=>({d:x.d,n:SAFE.num(x.n,0,300),e:SAFE.num(x.e,0,300)}));
  b.tests=(Array.isArray(p.tests)?p.tests:[]).slice(-10).filter(x=>x&&DATE.test(x.d)).map(x=>({id:SAFE.key(x.id,/^[a-z0-9]{1,12}$/)||Math.random().toString(36).slice(2,9),n:SAFE.str(x.n,30)||'Test',d:x.d,
    k:SAFE.key(x.k,/^(spelling|math|word|lab|water)$/)||'spelling',p:(Array.isArray(x.p)?x.p:[]).filter(y=>typeof y==='string'&&DATE.test(y)).slice(-60)}));
  b.updated=SAFE.num(p.updated,0,1e13);
  return b;
}
function cleanGlasses(g){g=g&&typeof g==='object'?g:{};return{enabled:!!g.enabled,cal:!!g.cal,eye:SAFE.key(g.eye,/^(left|right|both)$/)||'left',mode:SAFE.key(g.mode,/^(spot|team)$/)||'spot',
  strong:SAFE.num(g.strong||50,15,100),mins:[10,15,20,30].includes(+g.mins)?+g.mins:15,red:SAFE.num(g.red,0,6),green:SAFE.num(g.green,0,6)};}
function normalize(f){
  const set=f.set||{};
  f.set={voice:SAFE.key(set.voice,/^(hero|device)$/)||'hero',music:set.music!==false,readChoices:set.readChoices!==false,easyRead:!!set.easyRead,plan:set.plan!==false,nudge:set.nudge!==false,nudgeSec:[15,20,30,45,60].includes(+set.nudgeSec)?+set.nudgeSec:20,short:!!set.short,
    rewards:(Array.isArray(set.rewards)?set.rewards:[]).map(x=>SAFE.str(x,30)).filter(Boolean).slice(0,8),
    goal:{pct:[70,75,80,85,90].includes(+(set.goal||{}).pct)?+set.goal.pct:80,d:set.goal&&/^\d{4}-\d\d-\d\d$/.test(set.goal.d)?set.goal.d:''},calm:!!set.calm,bigText:!!set.bigText,glasses:cleanGlasses(set.glasses),breakMin:[0,15,20,30].includes(+set.breakMin)?+set.breakMin:0};
  const profs={};
  for(const [id,p] of Object.entries(f.profiles||{}).slice(0,5)){const cid=SAFE.key(id,/^[a-z0-9]{1,12}$/);if(cid)profs[cid]=cleanProfile(p,cid);}
  if(!Object.keys(profs).length){const p=newProfile();profs[p.id]=p;}
  f.profiles=profs;f.gone=(Array.isArray(f.gone)?f.gone:[]).filter(x=>typeof x==='string'&&/^[a-z0-9]{1,12}$/.test(x)).slice(-50);
  f.sync=f.sync&&typeof f.sync==='object'&&SAFE.key(f.sync.code,/^[A-HJ-NP-Z2-9]{10}$/)?{code:f.sync.code,at:SAFE.num(f.sync.at,0,1e13)}:null;
  f.updated=SAFE.num(f.updated,0,1e13);
  if(!f.profiles[f.active])f.active=Object.keys(f.profiles)[0];
  return f;
}
async function loadSave(){
  let d=null;
  try{
    if(window.caches&&window.isSecureContext){
      const c=await caches.open(CACHE_NAME);const r=await c.match(CACHE_KEY);
      storeKind='cache';canPersist=true;
      if(r)d=await r.json();
    }
  }catch(e){storeKind='none';canPersist=false;}
  try{
    const ck=cookieGet();
    if(!d&&ck)d=JSON.parse(ck);
    if(storeKind!=='cache'){document.cookie=`${CK}t=1; Max-Age=60; Path=/; Secure; SameSite=Lax`;if(/__Host-mht=1/.test(document.cookie)){storeKind='cookie';canPersist=true;}}
  }catch(e){}
  const m=migrate(d);
  if(m){FAM=normalize(m);SAVE=FAM.profiles[FAM.active];}
  if(storeKind==='cache'&&cookieGet()){await persistNow();cookieClear();}
  return !!m;
}
let persistTimer=null;
function persist(){SAVE.updated=Date.now();FAM.updated=Date.now();clearTimeout(persistTimer);persistTimer=setTimeout(()=>{persistNow();Sync.push();},250);}
async function persistNow(){
  if(!canPersist)return;
  try{
    if(storeKind==='cache'){const c=await caches.open(CACHE_NAME);await c.put(CACHE_KEY,new Response(JSON.stringify(FAM),{headers:{'Content-Type':'application/json'}}));}
    else if(storeKind==='cookie'){
      // cookies are small: keep only the active profile's recent history
      const slim=JSON.parse(JSON.stringify(FAM));for(const p of Object.values(slim.profiles)){p.ses=p.ses.slice(-4);p.rq=p.rq.slice(-12);p.daily.days=p.daily.days.slice(-20);}
      cookieSet(JSON.stringify(slim));
    }
  }catch(e){}
}
function switchProfile(id){if(!FAM.profiles[id])return;FAM.active=id;SAVE=FAM.profiles[id];persist();}
function addProfile(name){if(Object.keys(FAM.profiles).length>=5)return null;const p=newProfile(name);FAM.profiles[p.id]=p;persist();return p;}
function deleteProfile(id){if(Object.keys(FAM.profiles).length<=1)return false;delete FAM.profiles[id];FAM.gone=[...new Set([...(FAM.gone||[]),id])].slice(-50);if(FAM.active===id)FAM.active=Object.keys(FAM.profiles)[0];SAVE=FAM.profiles[FAM.active];persist();return true;}
function backupCode(){return btoa(unescape(encodeURIComponent(JSON.stringify(FAM))));}
function restoreCode(code){
  try{const d=migrate(JSON.parse(decodeURIComponent(escape(atob(code.trim())))));if(!d)return false;
    const keepSync=FAM.sync;FAM=normalize(d);FAM.sync=keepSync;SAVE=FAM.profiles[FAM.active];persist();return true;}catch(e){return false;}
}
function resetSave(){const keepSync=FAM.sync;FAM=DEFAULT_FAMILY();FAM.sync=keepSync;SAVE=FAM.profiles[FAM.active];persist();}
function missionStars(w,m){return SAVE.ms[w+':'+m]||0}
function bossUnlocked(w){return MODES[w].filter(m=>missionStars(w,m.id)>0).length>=3}
function isUnlocked(kind,id){const u=UNLOCKS.find(x=>x.kind===kind&&x.id===id);return !u||SAVE.stars>=u.stars}
function recordSession(rec){SAVE.ses.push(rec);if(SAVE.ses.length>15)SAVE.ses.shift();persist();}

/* ---- spaced review: missed problems come back after 1, 3, then 7 days ---- */
const DAY=86400000, todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const REVIEWABLE=s=>s&&!['say','empty','read','rq','wstory','lrd','lq','flu','ran','seq'].includes(s.t);
function rqMiss(spec,label){
  if(!REVIEWABLE(spec)||!label)return;
  let it=SAVE.rq.find(x=>x.l===label);
  if(!it){it={l:label,s:spec,b:0,due:Date.now()+DAY*0.5};SAVE.rq.push(it);if(SAVE.rq.length>40)SAVE.rq.shift();}
  else{it.b=0;it.due=Date.now()+DAY*0.5;}
}
function rqRight(label){
  const i=SAVE.rq.findIndex(x=>x.l===label);if(i<0)return;
  const it=SAVE.rq[i];it.b++;if(it.b>=3){SAVE.rq.splice(i,1);return;}
  it.due=Date.now()+DAY*[1,3,7][it.b];
}
function rqDue(n){return SAVE.rq.filter(x=>x.due<=Date.now()).sort((a,b)=>a.due-b.due).slice(0,n);}

/* ---- cross-device sync ---- */
const Sync=(()=>{
  const raw=window.__API_BASE__||'';const unresolved=raw.startsWith('__PORT_');
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  const API=unresolved?(local?'http://localhost:8000':null):raw;
  let pushing=false,again=false,status='';
  const available=()=>!!API;
  async function call(method,path,body){
    const r=await fetch(`${API}/api/sync${path}`,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});
    if(!r.ok){const e=new Error('HTTP '+r.status);e.status=r.status;throw e;}return r.json();
  }
  function packed(){const f=JSON.parse(JSON.stringify(FAM));delete f.sync;return f;}
  function mergeRemote(remote){
    // keep the newest copy of each profile
    let m=migrate(remote);if(!m)return false;const keep=m.sync;m=normalize(m);let changed=false;
    const gone=new Set([...(FAM.gone||[]),...(m.gone||[])]);FAM.gone=[...gone].slice(-50);
    for(const id of gone)if(FAM.profiles[id]&&Object.keys(FAM.profiles).length>1){delete FAM.profiles[id];changed=true;}
    for(const [id,rp] of Object.entries(m.profiles)){if(gone.has(id))continue;const lp=FAM.profiles[id];if(!lp||(rp.updated||0)>(lp.updated||0)){FAM.profiles[id]=rp;changed=true;}}
    if((m.updated||0)>(FAM.updated||0)){FAM.set=Object.assign(FAM.set,m.set||{});}
    FAM=normalize(FAM);SAVE=FAM.profiles[FAM.active];return changed;
  }
  async function create(){
    const r=await call('POST','',{data:packed()});FAM.sync={code:r.code,at:Date.now()};await persistNow();status='Synced just now';return r.code;
  }
  async function link(code){
    code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    const r=await call('GET','/'+code);
    // a brand-new player on this device (no name, no stars) is dropped so the family list stays clean
    const remoteIds=Object.keys((migrate(r.data)||{profiles:{}}).profiles);
    if(remoteIds.length)for(const [id,p] of Object.entries(FAM.profiles))if(!p.kid&&!p.stars&&!p.xp&&!(p.ses||[]).length&&!remoteIds.includes(id)){delete FAM.profiles[id];}
    if(!FAM.profiles[FAM.active])FAM.active=remoteIds[0];
    mergeRemote(r.data);FAM.sync={code,at:Date.now()};await persistNow();await push(true);status='Synced just now';return true;
  }
  async function pull(){
    if(!API||!FAM.sync)return false;
    try{const r=await call('GET','/'+FAM.sync.code);const ch=mergeRemote(r.data);FAM.sync.at=Date.now();await persistNow();status='Synced just now';return ch;}
    catch(e){if(e.status===404){await push(true);}status='Sync paused (offline)';return false;}
  }
  async function push(force){
    if(!API||!FAM.sync)return;
    if(pushing){again=true;return;}pushing=true;
    try{await call('PUT','/'+FAM.sync.code,{data:packed()});FAM.sync.at=Date.now();status='Synced just now';}
    catch(e){status='Sync paused (offline)';}
    pushing=false;if(again){again=false;push();}
  }
  function unlink(){FAM.sync=null;persistNow();status='';}
  return{available,create,link,pull,push,unlink,status:()=>status,code:()=>FAM.sync&&FAM.sync.code};
})();
