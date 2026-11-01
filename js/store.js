/* ================= SAVED PROGRESS =================
   Saved in this browser with cookies (no account, nothing sent to a server).
   A backup code lets a grown-up copy progress to another device. */
const DEFAULT_SAVE=()=>({v:3,kid:'',heroId:'bolt',custom:null,stars:0,xp:0,
  lv:{math:1,word:1,water:1},ms:{},spell:[],ses:[],seenUnlock:0,
  set:{voice:'hero',music:true}});
let SAVE=DEFAULT_SAVE(), canPersist=false;
const CK='__Host-mh', CHUNK=3000, MAXC=6;

function cookieGet(){
  let s='';for(let i=0;i<MAXC;i++){const m=document.cookie.match(new RegExp('(?:^|; )'+CK.replace(/[-]/g,'\\-')+i+'=([^;]*)'));if(!m)break;s+=m[1];}
  return s?decodeURIComponent(s):'';
}
function cookieSet(str){
  const enc=encodeURIComponent(str);const parts=[];for(let i=0;i<enc.length;i+=CHUNK)parts.push(enc.slice(i,i+CHUNK));
  if(parts.length>MAXC)return false;
  for(let i=0;i<MAXC;i++){
    if(i<parts.length)document.cookie=`${CK}${i}=${parts[i]}; Max-Age=63072000; Path=/; Secure; SameSite=Lax`;
    else document.cookie=`${CK}${i}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;
  }
  return true;
}
function loadSave(){
  try{
    document.cookie;canPersist=true;
    const s=cookieGet();
    if(s){const d=JSON.parse(s);SAVE=Object.assign(DEFAULT_SAVE(),d);SAVE.lv=Object.assign({math:1,word:1,water:1},d.lv||{});SAVE.set=Object.assign({voice:'hero',music:true},d.set||{});return true;}
    // test write
    document.cookie=`${CK}t=1; Max-Age=60; Path=/; Secure; SameSite=Lax`;
    canPersist=/__Host-mht=1/.test(document.cookie);
  }catch(e){canPersist=false;}
  return false;
}
function persist(){
  if(!canPersist)return;
  try{
    // keep the save small: trim history first if needed
    let str=JSON.stringify(SAVE);
    while(str.length>CHUNK*MAXC*0.8&&SAVE.ses.length>2){SAVE.ses.shift();str=JSON.stringify(SAVE);}
    cookieSet(str);
  }catch(e){}
}
function backupCode(){return btoa(unescape(encodeURIComponent(JSON.stringify(SAVE))));}
function restoreCode(code){
  try{const d=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));if(!d||d.v!==3)return false;
    SAVE=Object.assign(DEFAULT_SAVE(),d);persist();return true;}catch(e){return false;}
}
function resetSave(){SAVE=DEFAULT_SAVE();persist();}
function missionStars(w,m){return SAVE.ms[w+':'+m]||0}
function bossUnlocked(w){return MODES[w].filter(m=>missionStars(w,m.id)>0).length>=3}
function unlockedGear(){return UNLOCKS.filter(u=>SAVE.stars>=u.stars)}
function isUnlocked(kind,id){const u=UNLOCKS.find(x=>x.kind===kind&&x.id===id);return !u||SAVE.stars>=u.stars}
function recordSession(rec){
  SAVE.ses.push(rec);if(SAVE.ses.length>12)SAVE.ses.shift();
  persist();
}
