/* ================= GAME (v4) ================= */
const $=id=>document.getElementById(id);
let world='math', mode=MODES.math[0];
let G=null, current=null;
const TP={on:false,names:['Player 1','Player 2'],hard:false};
let sessionPlay=0, breakDue=false;
const RANKS=[[0,'Rookie Hero'],[30,'Sidekick'],[80,'Hero'],[150,'Super Hero'],[250,'Mega Hero'],[400,'Legend']];
const rankName=()=>{let r=RANKS[0][1];for(const [n,t] of RANKS)if(SAVE.xp>=n)r=t;return r};
const heroId=()=>SAVE.heroId&&(SAVE.heroId!=='custom'||SAVE.custom)?SAVE.heroId:'bolt';
function currentHero(){if(heroId()==='custom')return customHero(SAVE.custom);return HEROES.find(h=>h.id===heroId())||HEROES[0];}
function customHero(c){return{id:'custom',name:c.name||'My Hero',power:'Your powers',suit:c.suit,cape:c.cape,mask:c.mask,emblem:c.emblem,skin:c.skin,hair:c.hair,blast:c.blastColor||c.suit,blastFx:c.blast||'normal'}}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(t){const b=$('toast');b.textContent=t;b.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>b.classList.remove('show'),2800)}

/* ---------- background FX canvas ---------- */
const cv=$('fx'),cx=cv.getContext('2d');let FW,FH,starsBg=[],parts=[],superMode=false;
function resize(){FW=cv.width=innerWidth;FH=cv.height=innerHeight;starsBg=Array.from({length:Math.floor(FW*FH/9000)},()=>({x:Math.random()*FW,y:Math.random()*FH,z:Math.random()*2+.4}));}
addEventListener('resize',resize);resize();
function burst(x,y,color,n=30){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*7+2;
  const c=color==='rainbow'?pick(['#e63946','#ff8c00','#ffd23f','#2ec27e','#2a9df4','#c77dff']):color==='cosmic'?pick(['#c77dff','#ffffff','#7b2cbf','#2a9df4']):(Math.random()<.5?color:'#ffd23f');
  parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,c,r:Math.random()*5+3});}}
(function loop(){
  cx.clearRect(0,0,FW,FH);const speed=superMode?6:.4;
  for(const s of starsBg){s.x-=s.z*speed;if(s.x<0){s.x=FW;s.y=Math.random()*FH;}
    cx.fillStyle=`rgba(255,255,255,${.25+s.z*.25})`;if(superMode)cx.fillRect(s.x,s.y,s.z*10,1.5);else cx.fillRect(s.x,s.y,s.z,s.z);}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life-=.022;if(p.life<=0){parts.splice(i,1);continue}
    cx.globalAlpha=p.life;cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,p.r*p.life,0,7);cx.fill();cx.globalAlpha=1;}
  requestAnimationFrame(loop);
})();

/* ---------- start screen ---------- */
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));window.scrollTo(0,0)}
function setWorldBg(w){document.body.classList.remove('math-world','word-world','water-world');document.body.classList.add(w+'-world')}
function renderTop(){
  $('rankTag').textContent=`${rankName()} · ${SAVE.xp} XP`;
  $('starTag').textContent=`★ ${SAVE.stars}`;
  $('playerChip').textContent=SAVE.kid?`Playing: ${SAVE.kid}`:'Who\'s playing?';
  $('welcome').textContent=SAVE.kid?`Welcome back, ${SAVE.kid}! Villains are attacking.`:'Villains are attacking. Use your brain power to save the day.';
  $('musicBtn').textContent=AUDIO.musicOn?'Music: On':'Music: Off';$('musicBtn').classList.toggle('on',AUDIO.musicOn);
  $('tpBtn').textContent=TP.on?`2 Players: ${TP.names[0]} & ${TP.names[1]}`:'2 Players';$('tpBtn').classList.toggle('on',TP.on);
}
function renderHeroes(){
  const box=$('heroPicks');box.innerHTML='';
  const list=[...HEROES];if(SAVE.custom)list.push(customHero(SAVE.custom));
  list.forEach(h=>{const b=document.createElement('button');b.className='pick'+(h.id===heroId()?' sel':'');
    b.innerHTML=heroSVG(h,80)+escapeHTML(h.name)+'<small>'+(h.id==='custom'?'Tap again to edit':h.power)+'</small>';
    b.onclick=()=>{if(h.id==='custom'&&heroId()==='custom'){openCreator();return;}SAVE.heroId=h.id;persist();renderHeroes();sfx('click');};
    box.appendChild(b);});
  const c=document.createElement('button');c.className='pick create';
  c.innerHTML=`<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><circle cx="40" cy="40" r="30" fill="#ffd23f" stroke="#14142b" stroke-width="4"/><path d="M40 24v32M24 40h32" stroke="#14142b" stroke-width="7" stroke-linecap="round"/></svg>${SAVE.custom?'Edit My Hero':'Create Your Hero'}<small>Your own name & colors</small>`;
  c.onclick=openCreator;box.appendChild(c);
}
function renderWorlds(){document.querySelectorAll('.world').forEach(b=>b.classList.toggle('sel',b.dataset.world===world));setWorldBg(world);}
function renderModes(){
  const box=$('modePicks');box.innerHTML='';
  [...MODES[world],BOSS[world]].forEach(m=>{
    const b=document.createElement('button');const isBoss=m.id==='boss';const locked=isBoss&&!bossUnlocked(world);
    b.className='pick'+(m===mode?' sel':'')+(isBoss?' boss':'')+(locked?' locked':'');
    const st=missionStars(world,m.id);
    let desc=m.desc;if(m.id==='mylist')desc=SAVE.spell.length?`${SAVE.spell.length} words from a grown-up`:'Grown-ups: add words first';
    if(isBoss&&!locked)desc='12 rounds. All your powers!';
    b.innerHTML=`<span style="font-size:20px">${locked?'🔒 ':''}${m.name}</span><small>${desc}</small><span class="mstars">${'★'.repeat(st)}${'☆'.repeat(3-st)}</span>`;
    b.onclick=()=>{if(locked){toast('Earn stars in 3 missions to unlock the Mega Boss!');sfx('wrong');return;}mode=m;renderModes();sfx('click');};
    box.appendChild(b);
  });
  const done=SCENES[world].filter(s=>SAVE.scenes[world+':'+s.at]).length;
  $('lvlTag').textContent=(world==='water'?'':`${world==='math'?'Math':'Word'} level ${SAVE.lv[world]} · `)+`Story ${done}/4`;
}
document.querySelectorAll('.world').forEach(b=>b.onclick=()=>{world=b.dataset.world;mode=MODES[world][0];renderWorlds();renderModes();sfx('click');});

/* ---------- daily mission panel ---------- */
function streakNow(){
  const d=SAVE.daily;if(!d.days.length)return 0;
  const set=new Set(d.days);let n=0;const t=new Date();
  if(!set.has(todayStr())){t.setDate(t.getDate()-1);}
  for(;;){const s=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');if(set.has(s)){n++;t.setDate(t.getDate()-1);}else break;}
  return n;
}
function renderDaily(){
  const done=SAVE.daily.days.includes(todayStr()),st=streakNow(),due=rqDue(99).length;
  const set=new Set(SAVE.daily.days);let cal='';
  for(let i=13;i>=0;i--){const t=new Date();t.setDate(t.getDate()-i);const s=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
    cal+=`<span class="cd ${set.has(s)?'on':''} ${i===0?'today':''}" title="${s}">${'SMTWTFS'[t.getDay()]}</span>`;}
  $('dailyBox').innerHTML=`<div class="daily-l"><div class="daily-t">DAILY MISSION</div>
     <div class="daily-s">🔥 ${st} day streak${SAVE.daily.best>1?` · best ${SAVE.daily.best}`:''}${due?` · ${due} review${due>1?'s':''} waiting`:''}</div>
     <div class="cal">${cal}</div></div>
   <button class="btn ${done?'ghost':''}" id="dailyBtn">${done?'Done today ✓ Play again':'Start (5 min)'}</button>`;
  $('dailyBtn').onclick=()=>{unlockAudio();startDaily();};
}

/* ---------- pet panel ---------- */
function renderPet(){
  const box=$('petBox');
  if(!SAVE.pet){box.innerHTML=`<div class="pet-empty">🥚</div><div><div class="daily-t" style="font-size:24px">Get a sidekick!</div><div class="note">Your sidekick grows and learns tricks as you earn stars.</div></div><button class="btn" id="adoptBtn">Choose one</button>`;
    $('adoptBtn').onclick=openPetChooser;return;}
  const p=SAVE.pet,pet=PETS.find(x=>x.id===p.id),st=petStage(p.xp);
  const tricks=PET_TRICKS.filter(t=>p.xp>=t[0]),next=PET_TRICKS.find(t=>p.xp<t[0]);
  box.innerHTML=`${petHTML(p,true)}<div style="flex:1;min-width:160px"><div class="daily-t" style="font-size:24px">${escapeHTML(p.name)} <small class="stage">${st.name} ${pet.name.toLowerCase()==='bolt bot'?'robot':''}</small></div>
    <div class="note">Tricks: ${tricks.map(t=>t[2]).join(', ')}${next?` · next trick at ${next[0]} ★ (${next[0]-p.xp} to go)`:' · all tricks learned!'}</div>
    <div class="pbar"><div style="width:${next?Math.min(100,(p.xp-(tricks[tricks.length-1]||[0])[0])/(next[0]-(tricks[tricks.length-1]||[0])[0])*100):100}%"></div></div></div>
    <button class="btn ghost" id="trickBtn">Do a trick!</button>`;
  const doTrick=()=>{const t=pick(tricks);const el=box.querySelector('[data-pet]');el.className=el.className.replace(/ trick-\w+/g,'');void el.offsetWidth;el.classList.add('trick-'+t[1]);sfx('level');if(t[1]==='sparkle'||t[1]==='zoom'){const r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,'rainbow',40);}};
  $('trickBtn').onclick=doTrick;box.querySelector('[data-pet]').onclick=doTrick;
}
function openPetChooser(){
  let sel=PETS[0].id;
  $('petPicks').innerHTML=PETS.map(p=>`<button class="pick petpick ${p.id===sel?'sel':''}" data-id="${p.id}"><span style="font-size:56px">${p.e}</span>${p.name}</button>`).join('');
  $('petName').value='';
  $('petPicks').querySelectorAll('.petpick').forEach(b=>b.onclick=()=>{sel=b.dataset.id;$('petPicks').querySelectorAll('.petpick').forEach(x=>x.classList.toggle('sel',x===b));sfx('click');});
  $('petSave').onclick=()=>{const pet=PETS.find(p=>p.id===sel);SAVE.pet={id:sel,name:($('petName').value.trim()||pet.name).slice(0,14),xp:0};persist();closeModal('petModal');renderPet();say(['pet_hello'],'Meet your new sidekick!');sfx('unlock');};
  openModal('petModal');
}

/* ---------- profiles ---------- */
function openProfiles(){
  const list=Object.values(FAM.profiles);
  $('profList').innerHTML=list.map(p=>{const h=p.heroId==='custom'&&p.custom?customHero(p.custom):(HEROES.find(x=>x.id===p.heroId)||HEROES[0]);
    return `<button class="pick ${p.id===FAM.active?'sel':''}" data-id="${p.id}">${heroSVG(h,70)}${escapeHTML(p.kid||'Hero')}<small>★ ${p.stars}</small></button>`;}).join('')+
    (list.length<5?`<button class="pick create" id="profAdd"><span style="font-size:48px">＋</span>Add player<small>Up to 5</small></button>`:'');
  $('profList').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{switchProfile(b.dataset.id);applyProfile();closeModal('profModal');toast(`Hi ${SAVE.kid||'hero'}!`);});
  if($('profAdd'))$('profAdd').onclick=()=>{$('profNewRow').style.display='';$('profNew').focus();};
  $('profNewRow').style.display='none';$('profNew').value='';
  $('profCreate').onclick=()=>{const n=$('profNew').value.trim().slice(0,16);if(!n){$('profNew').focus();return;}const p=addProfile(n);if(p){switchProfile(p.id);applyProfile();closeModal('profModal');toast(`Welcome, ${n}! Create your hero or pick one.`);}};
  openModal('profModal');say(['whos_playing'],'Who\'s playing today?');
}
function applyProfile(){world='math';mode=MODES.math[0];renderAll();}

/* ---------- two players ---------- */
function openTwoP(){
  $('tpName1').value=TP.on?TP.names[0]:(SAVE.kid||'');$('tpName2').value=TP.on?TP.names[1]:'';$('tpHard').checked=TP.hard;
  $('tpOn').onclick=()=>{TP.on=true;TP.names=[$('tpName1').value.trim().slice(0,12)||'Player 1',$('tpName2').value.trim().slice(0,12)||'Player 2'];TP.hard=$('tpHard').checked;closeModal('tpModal');renderTop();sfx('click');};
  $('tpOff').onclick=()=>{TP.on=false;closeModal('tpModal');renderTop();};
  openModal('tpModal');
}

/* ---------- runs ---------- */
function startDaily(){
  const list=rqDue(3).map(x=>x.s);
  const L=SAVE.lv;const plan=['mix','wordmix','mix','wordmix','water','mix','wordmix','mix'];
  seen=[];
  for(const p of plan){if(list.length>=8)break;
    if(p==='water')list.push(GEN[pick(['wvocab','wcycle','wfacts'])]());else list.push(GEN[p](p==='mix'?L.math:L.word));}
  startGame({list:shuffle(list),kind:'daily',name:'Daily Mission'});
}
function startGame(opts={}){
  document.querySelectorAll('.confetti').forEach(c=>c.remove());parts.length=0;stopVoice();
  let list=opts.list||null,kind=opts.kind||null;
  if(!list&&mode.id==='read'){const unread=READS.map((r,i)=>i).filter(i=>!(SAVE.rd||[]).includes(i));const i=unread.length?pick(unread):rnd(0,READS.length-1);
    list=[{t:'read',i},{t:'rq',i,j:0},{t:'rq',i,j:1},{t:'rq',i,j:2}];kind='read';}
  const isBoss=mode.id==='boss'&&!list;
  // story scene before the first mission or the boss
  if(!opts.skipScene&&!list){const at=isBoss?'boss':'intro';if(!SAVE.scenes[world+':'+at]){playScene(world,at,()=>startGame(Object.assign({},opts,{skipScene:true})));return;}}
  const w=list?worldOfSpec(list[0]):world;
  const total=list?list.length:isBoss?12:mode.id==='wstory'||mode.id==='wsay'?5:mode.id==='mylist'?Math.min(10,Math.max(4,SAVE.spell.length*2)):10;
  G={world:w,homeWorld:world,mode:list?{id:kind||'review',name:opts.name||(kind==='read'?'Hero Stories':'Review Mission')}:mode,list,kind,isBoss,mixed:!!list&&kind!=='read',
     total,q:0,stars:0,first:0,tries:0,streak:0,best:0,lvl:SAVE.lv[w]||1,lvStreak:0,lvMiss:0,missed:[],learned:[],busy:false,hp:total,started:Date.now(),
     tp:TP.on?{turn:0,stars:[0,0],first:[0,0]}:null};
  if(kind==='read'&&mode.id==='read')G.mode=mode;
  seen=[];setSuper(false);
  const v=VILLAINS[w],h=currentHero();
  document.documentElement.style.setProperty('--hero',h.blast.startsWith('#')?h.blast:'#c77dff');
  $('heroSvg').innerHTML=heroSVG(h);setVillain(w,isBoss);
  $('heroName').textContent=TP.on?`${TP.names[0]} & ${TP.names[1]}`:h.name;
  $('petSlot').innerHTML=SAVE.pet?petHTML(SAVE.pet,false):'';
  $('villainHp').style.width='100%';updateCombo();updateHud();
  Music.set(isBoss?'boss':'normal');
  show('battle');
  if(isBoss){showBanner('MEGA BOSS!');sfx('boss');say(['mega_boss'],'Mega boss battle! This is it, hero!');setTimeout(nextQ,2300);}
  else if(kind==='daily'){showBanner('DAILY MISSION!');say(['daily_intro'],'Daily mission!');setTimeout(()=>nextQ(true),2400);}
  else if(kind==='review'){say(['review_intro'],'Review time!');setTimeout(()=>nextQ(true),2400);}
  else nextQ(true);
  setTimeout(()=>taunt(pick(VILLAINS[w].taunts)),400);
}
function setVillain(w,mega){const v=VILLAINS[w];$('villainSvg').innerHTML=villainSVG(v,w,mega);$('villainName').textContent=mega?'Mega '+v.name.replace(/^The /,''):v.name;setWorldBg(w);}
function updateHud(){
  $('progress').textContent=`Round ${Math.min(G.q+1,G.total)} of ${G.total}`;
  $('starCount').textContent=G.tp?`${TP.names[0]} ★${G.tp.stars[0]} · ${TP.names[1]} ★${G.tp.stars[1]}`:'★ '+G.stars;
  const showLv=!(G.world==='water'||G.list||G.isBoss);
  $('lvlPill').textContent=G.isBoss?'BOSS':G.kind==='daily'?'Daily':G.kind==='read'?'Story':G.list?'Review':`Level ${G.tp&&G.tp.turn===1&&TP.hard?3:G.lvl}`;
  $('lvlPill').style.display=showLv||G.isBoss||G.list?'':'none';
}
function genSpec(){
  if(G.list)return G.list[G.q];
  let m=G.mode.id;if(G.isBoss)m=pick(BOSS_POOL[G.world]);
  const L=G.tp&&G.tp.turn===1&&TP.hard?3:G.lvl;
  let s=GEN[m](L,G.q);
  if(G.q===G.total-1&&!G.isBoss&&G.world!=='water'&&L<3&&s.t!=='empty'){const s2=GEN[m](Math.min(3,L+1),G.q);if(s2)s=s2;}
  return s;
}
function nextQ(first){
  if(G.q>=G.total)return winGame();
  if(G.tp)G.tp.turn=G.q%2;
  const spec=genSpec();current=build(spec);G.tries=0;G.busy=false;
  if(G.mixed){const w=worldOfSpec(spec);if(w!==G.world){G.world=w;setVillain(w,false);}}
  const bossRound=G.q===G.total-1&&!G.isBoss&&G.kind!=='read';
  $('qpanel').classList.toggle('boss',bossRound||G.isBoss);
  $('bossTag').textContent=G.isBoss?'MEGA BOSS':'BOSS ROUND';
  $('qpanel').classList.toggle('p2',!!(G.tp&&G.tp.turn===1));
  updateHud();
  $('qbody').innerHTML=(G.tp?`<div class="turnchip p${G.tp.turn+1}">${escapeHTML(TP.names[G.tp.turn])}'s turn</div>`:'')+current.html;
  $('feedback').textContent='';$('feedback').className='feedback';
  const vis=document.createElement('div');vis.className='visual';vis.id='visual';
  if(current.type==='choice'){$('qbody').appendChild(vis);renderChoices();}
  else if(current.type==='spell'){buildSpell();$('qbody').appendChild(vis);}
  else if(current.type==='say'){buildSay();}
  else if(current.type==='trace'){Trace.mount($('traceBox'),current.ans,traceDone);$('qbody').appendChild(vis);}
  else if(current.type==='sentence'){buildSentence();$('qbody').appendChild(vis);}
  else if(current.type==='read'){wireRead();}
  else if(current.type==='empty'){$('qbody').innerHTML=`<div class="prompt">No spelling words yet</div><p style="font-weight:800;font-size:20px;margin:10px 0">Ask a grown-up to tap <b>Grown-ups</b> on the start screen and add this week's spelling words.</p><button class="btn blue" onclick="goHome()">Back to start</button>`;say(current.seq,current.text);return;}
  if(readsChoicesOK(current)||hasHelp(current)){const row=document.createElement('div');row.className='helprow';
    row.innerHTML=(readsChoicesOK(current)?'<button class="sm-btn" data-hearch>🔊 Hear the answers</button>':'')+(hasHelp(current)?'<button class="sm-btn helpbtn" data-help>Need help?</button>':'');
    const ansBox=$('qbody').querySelector('.answers');if(ansBox)ansBox.before(row);else $('qbody').appendChild(row);
    row.querySelectorAll('[data-hearch]').forEach(b=>b.onclick=()=>{stopChoices();readChoices();});
    row.querySelectorAll('[data-help]').forEach(b=>b.onclick=openHelp);}
  $('qbody').querySelectorAll('[data-hear]').forEach(b=>b.onclick=()=>speakCurrent());
  $('qbody').querySelectorAll('[data-peek]').forEach(b=>b.onclick=()=>{$('peekWord').textContent=current.ans;b.disabled=true;});
  let delay=bossRound&&!first?2000:first?350:250;
  if(bossRound){showBanner('BOSS ROUND!');sfx('boss');say(['boss_round'],'Boss round!');}
  if(G.tp){const k=G.tp.turn?'p2_turn':'p1_turn';setTimeout(()=>{showBanner(`${TP.names[G.tp.turn]}'s turn!`);say([k],`${TP.names[G.tp.turn]}, you're up!`);},bossRound?1700:0);delay+=1500;}
  setTimeout(speakCurrent,delay);
  preload([...current.seq,...(current.hintSeq||[]),'praise0','praise1','praise2','try0']);
}
async function speakCurrent(){
  if(!current)return;const P=current;stopChoices();
  const auto=FAM.set.readChoices!==false&&readsChoicesOK(P);
  // rhyme questions name the choices in the question; when choices are read separately, skip that part
  const seq=auto&&P.spec.t==='rhyme'?P.seq.slice(0,2):P.seq;
  const ok=await sayWait(seq,auto&&P.spec.t==='rhyme'?`Which word rhymes with ${P.spec.w}?`:P.text,{gap:P.gap});
  if(ok&&auto&&current===P&&!G.busy){await pause(350);if(current===P&&!G.busy)readChoices();}
}
function renderChoices(){
  const box=document.createElement('div');const lay=current.layout||'';box.className='answers '+lay;
  current.choices.forEach(c=>{
    const b=document.createElement('button');
    b.className='ans'+(lay.includes('long')?' long':lay.includes('pic')?' pic':lay.includes('coin')?' coinbtn':lay.includes('txt')?' txt':'');
    if(c.html)b.innerHTML=c.html;else b.textContent=c.v;b.setAttribute('aria-label',String(c.v));
    b.onclick=()=>answer(c.v,b);box.appendChild(b);
  });
  if(lay.includes('two')&&!lay.includes('long'))box.querySelectorAll('.ans').forEach(b=>b.style.fontSize='72px');
  $('qbody').appendChild(box);
}
const PRAISE=['Super job!','Power up!','Heroic!','You got it!','Amazing!','Way to go, hero!','Boom! Correct!'];
const TRYMSG=['Almost! Try again.','Not quite. You can do it!','Keep going, hero!'];
function answer(v,btn){
  if(G.busy)return;stopChoices();
  if(String(v)===String(current.ans)){document.querySelectorAll('.ans').forEach(b=>b.disabled=true);btn.classList.add('right');if(current.full&&$('mword'))$('mword').textContent=current.full;correct();}
  else{btn.disabled=true;miss(String(v));}
}
const isP1=()=>!G.tp||G.tp.turn===0;
function miss(given,opts={}){
  G.tries++;
  if(G.tries===1){G.streak=0;if(superMode)setSuper(false);updateCombo();
    if(isP1()){if(!G.missed.some(m=>m.l===current.label))G.missed.push({w:G.world,s:current.spec,l:current.label});rqMiss(current.spec,current.label);}}
  const i=Math.min(G.tries-1,2);
  $('feedback').textContent=opts.msg||TRYMSG[i];$('feedback').className='feedback try';
  sfx('wrong');taunt(pick(VILLAINS[G.world].taunts));
  const vb=$('villainBox');vb.classList.remove('bounce');void vb.offsetWidth;vb.classList.add('bounce');
  const vis=$('visual');
  if(vis){
    if(current.hintFn==='dots')vis.innerHTML=dotsHint(current.hk||current.spec);
    else if(current.hint)vis.innerHTML=`<div class="hintbox">${current.hint}</div>`;
    if(current.spec.t==='place'&&!current.spec.show)vis.innerHTML=blocksHTML(current.spec.tens,current.spec.ones)+`<div class="hintbox">${current.hint}</div>`;
  }
  if(opts.seq)say(opts.seq,opts.msg);
  else if(current.hintSeq)say(['try'+i,...current.hintSeq],TRYMSG[i]+' '+current.hint);
  else if(current.again)say(['try'+i,...current.again],TRYMSG[i]+' '+(current.againText||''));
  else say(['try'+i],TRYMSG[i]);
}
function dotsHint(p){
  const d=(n,c='')=>'<div class="dots">'+Array.from({length:n},()=>`<span class="dot ${c}"></span>`).join('')+'</div>';
  const a=p.a,b=p.b,k=p.k;
  if(k==='+')return d(a)+'<span class="op">+</span>'+d(b,'b');
  if(k==='-')return '<div class="dots">'+Array.from({length:a},(_,i)=>`<span class="dot ${i>=a-b?'x':''}"></span>`).join('')+'</div>';
  return d(a)+'<span class="op">+ ? =</span>'+d(b,'b');
}
function adapt(firstTry){
  if(G.list||G.isBoss||G.world==='water'||!isP1())return null;
  if(firstTry){G.lvStreak++;if(G.lvStreak>=2)G.lvMiss=0;if(G.lvStreak>=3&&G.lvl<3){G.lvl++;G.lvStreak=0;return 'up';}}
  else{G.lvStreak=0;G.lvMiss++;if(G.lvMiss>=2&&G.lvl>1){G.lvl--;G.lvMiss=0;return 'down';}}
  return null;
}
function correct(opts={}){
  G.busy=true;const firstTry=G.tries===0;
  if(firstTry){G.streak++;G.best=Math.max(G.best,G.streak);G.first++;const add=superMode?2:1;G.stars+=add;
    if(G.tp){G.tp.stars[G.tp.turn]+=add;G.tp.first[G.tp.turn]++;}
    if(isP1()){SAVE.xp+=superMode?10:5;rqRight(current.label);}}
  else if(isP1())SAVE.xp+=2;
  if(current.learn&&!G.learned.includes(current.learn))G.learned.push(current.learn);
  const wasSuper=superMode;let voiceSeq=opts.seq||null,voiceText=opts.text||'';
  if(G.streak>=3&&!superMode){setSuper(true);setTimeout(()=>showBanner('SUPER MODE!'),300);sfx('super');voiceSeq=['super_mode'];voiceText='Super mode! Double stars!';petDo('spin');}
  const lv=adapt(firstTry);
  if(lv==='up'){setTimeout(()=>showBanner('LEVEL UP!'),700);sfx('level');voiceSeq=['level_up'];voiceText='Level up! Here come tougher ones!';}
  if(lv==='down'){voiceSeq=['level_down'];voiceText='Let\'s power up with some easier ones.';}
  updateCombo();
  const pi=rnd(0,PRAISE.length-1);const who=G.tp?TP.names[G.tp.turn]:SAVE.kid;
  $('feedback').textContent=(opts.msg||PRAISE[pi])+(who&&Math.random()<.4?` ${who}!`:'')+(firstTry?(wasSuper?' +2 ★':' +1 ★'):'');$('feedback').className='feedback good';
  if(!voiceSeq){voiceSeq=current.correctSeq?['praise'+pi,...current.correctSeq]:['praise'+pi];voiceText=PRAISE[pi];}
  say(voiceSeq,voiceText);petDo('jump');
  attack(G.q===G.total-1||superMode);
  G.q++;G.hp--;updateHud();
  setTimeout(()=>nextQ(),current.correctSeq?3600:opts.wait||1700);
}
function petDo(t){const el=document.querySelector('#petSlot [data-pet]');if(!el)return;el.className=el.className.replace(/ trick-\w+/g,'');void el.offsetWidth;el.classList.add('trick-'+t);}
function setSuper(on){superMode=on;$('battle').classList.toggle('super-on',on);$('combo').classList.toggle('super',on)}
function updateCombo(){$('comboBar').style.width=(superMode?100:Math.min(G?G.streak:0,3)/3*100)+'%';$('comboLbl').textContent=superMode?'SUPER MODE! 2x ★':G&&G.streak?`${G.streak} in a row!`:'Get 3 in a row';}
function taunt(t){const b=$('bubble');b.textContent=t;b.classList.add('show');clearTimeout(taunt.t);taunt.t=setTimeout(()=>b.classList.remove('show'),1800)}
function showBanner(t){const b=$('banner');b.textContent=t;b.classList.remove('show');void b.offsetWidth;b.classList.add('show')}
function attack(mega){
  const h=currentHero();const blast=$('blast'),arena=$('arena'),vb=$('villainBox'),hb=$('heroBox');
  blast.className='blast'+(mega?' mega':'')+(h.blastFx==='rainbow'?' rainbow':h.blastFx==='cosmic'?' cosmic':'');
  blast.style.setProperty('--dist',arena.clientWidth-(mega?320:300));void blast.offsetWidth;blast.classList.add('go');
  hb.classList.remove('bounce');void hb.offsetWidth;hb.classList.add('bounce');sfx('zap');
  setTimeout(()=>{
    vb.classList.remove('shake');void vb.offsetWidth;vb.classList.add('shake');
    const boom=$('boom');boom.textContent=mega?pick(['KA-BOOM!','MEGA POW!','SUPER ZAP!']):pick(['POW!','ZAP!','BAM!','KAPOW!','WHAM!']);
    boom.classList.remove('show');void boom.offsetWidth;boom.classList.add('show');
    $('villainHp').style.width=(Math.max(0,G.hp)/G.total*100)+'%';
    const r=vb.getBoundingClientRect();burst(r.left+r.width/2,r.top+70,h.blastFx&&h.blastFx!=='normal'?h.blastFx:h.blast,mega?70:30);
    if(mega){const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');const m=$('main');m.classList.remove('shakeall');void m.offsetWidth;m.classList.add('shakeall');}
    sfx('boom');
    if(G.hp>0&&Math.random()<.35){const v=VILLAINS[G.world];const hi=rnd(0,v.hurt.length-1);taunt(v.hurt[hi]);setTimeout(()=>villainSay(`v_${G.world}_h${hi}`),900);}
  },480);
}

/* ---------- spelling tiles ---------- */
let spelled=[],locked=0;
function buildSpell(){
  spelled=[];locked=0;const q=$('qbody');
  const slots=document.createElement('div');slots.className='slots';slots.id='slots';
  for(let i=0;i<current.ans.length;i++){const s=document.createElement('div');s.className='slot';slots.appendChild(s)}
  const tiles=document.createElement('div');tiles.className='tiles';tiles.id='tiles';
  current.tiles.forEach(l=>{const t=document.createElement('button');t.className='tile';t.textContent=l;t.onclick=()=>tapTile(t);tiles.appendChild(t)});
  const undo=document.createElement('button');undo.className='icon-btn undo';undo.textContent='Undo';undo.onclick=undoTile;
  q.append(slots,tiles,undo);
}
function drawSlots(){[...$('slots').children].forEach((s,i)=>{s.textContent=spelled[i]?spelled[i].l:'';s.className='slot'+(spelled[i]?' f':'')+(i<locked?' lock':'')})}
function tapTile(t){
  if(G.busy)return;spelled.push({l:t.textContent,el:t});t.disabled=true;sfx('click');say(['l_'+t.textContent],t.textContent);drawSlots();
  if(spelled.length===current.ans.length){
    const word=spelled.map(s=>s.l).join('');
    if(word===current.ans){setTimeout(()=>say([W(current.ans)],current.ans),350);G.busy=true;setTimeout(correct,900);}
    else{
      $('slots').classList.add('bad');miss(word);
      $('feedback').textContent=G.tries===1?'Almost! Listen to the sounds.':'Keep going! I gave you a letter.';
      setTimeout(()=>{$('slots').classList.remove('bad');locked=Math.min(G.tries,current.ans.length-1);
        spelled.forEach(s=>s.el.disabled=false);spelled=[];
        const tiles=[...$('tiles').children];
        for(let i=0;i<locked;i++){const t=tiles.find(x=>!x.disabled&&x.textContent===current.ans[i]);t.disabled=true;spelled.push({l:t.textContent,el:t})}
        drawSlots();say([W(current.ans),...[...current.ans].map(l=>'l_'+l)],current.ans+'. '+[...current.ans].join(', '),{gap:.12});
      },900);
    }
  }
}
function undoTile(){if(G.busy||spelled.length<=locked)return;const s=spelled.pop();s.el.disabled=false;drawSlots();}

/* ---------- tracing ---------- */
function traceDone(r){
  if(G.busy)return;
  if(r.ok){say(['trace_good'],'Great tracing, hero!');correct({seq:['trace_good'],text:'Great tracing!',msg:'Great tracing!'});return;}
  if(G.tries>=2){G.tries++;correct({seq:['trace_good'],text:'Good effort!',msg:'Good effort!'});return;}
  miss('trace',{msg:r.cover<.6?'Trace the whole shape, from start to finish.':'Try to stay on the dotted line.',seq:['trace_try']});
  const vis=$('visual');if(vis)vis.innerHTML='';
}

/* ---------- sentence builder ---------- */
let sb=null;
function buildSentence(){
  sb={order:[],phase:'order',errs:0};
  const q=$('qbody');
  const line=document.createElement('div');line.className='sline';line.id='sline';
  const tiles=document.createElement('div');tiles.className='tiles stiles';tiles.id='stiles';
  shuffle(current.words.map((w,i)=>({w,i}))).forEach(o=>{const t=document.createElement('button');t.className='wtile';t.textContent=o.w;t.dataset.i=o.i;t.onclick=()=>sbTap(t,o);tiles.appendChild(t);});
  const undo=document.createElement('button');undo.className='icon-btn undo';undo.textContent='Undo';undo.onclick=sbUndo;undo.id='sbUndo';
  q.append(line,tiles,undo);drawSentence();
}
function drawSentence(){
  const ws=sb.order.map(o=>o.w);
  let html=ws.map((w,i)=>`<span class="sw ${i===0&&sb.phase==='cap'?'tapme':''} ${i===0&&sb.cap?'capd':''}" data-k="${i}">${i===0&&sb.cap?w[0].toUpperCase()+w.slice(1):w}</span>`).join(' ');
  html+=sb.mark?`<span class="sw mark">${sb.mark}</span>`:(sb.phase==='mark'?'<span class="sw blankmark">?</span>':'');
  for(let i=ws.length;i<current.words.length;i++)html+=' <span class="sw empty"></span>';
  $('sline').innerHTML=html;
  const first=$('sline').querySelector('[data-k="0"]');
  if(first&&sb.phase==='cap')first.onclick=()=>{sb.cap=true;sfx('click');drawSentence();sbAsk('mark');};
}
function sbTap(t,o){
  if(G.busy||sb.phase!=='order')return;sb.order.push({...o,el:t});t.disabled=true;sfx('click');say([W(o.w)],o.w);drawSentence();
  if(sb.order.length===current.words.length){
    const ok=sb.order.every((x,i)=>x.w===current.words[i]);
    if(ok){sbAsk('cap');}
    else{sb.errs++;miss('order',{msg:'Not quite. Listen and try again!',seq:['try0','sent'+current.spec.i]});
      setTimeout(()=>{sb.order.forEach(x=>x.el.disabled=false);sb.order=[];
        // hint: lock the first word in place
        const first=[...$('stiles').children].find(x=>x.textContent===current.words[0]&&!x.disabled);if(first){first.disabled=true;sb.order.push({w:current.words[0],i:0,el:first});}
        drawSentence();},900);}
  }
}
function sbUndo(){if(G.busy||sb.phase!=='order'||sb.order.length<=0)return;const o=sb.order.pop();o.el.disabled=false;drawSentence();}
function sbAsk(ph){
  sb.phase=ph;drawSentence();
  if(ph==='cap'){$('stiles').innerHTML='';$('sbUndo').style.display='none';$('feedback').textContent='Tap the first word to give it a capital letter.';$('feedback').className='feedback';say(['tap_capital'],'Now tap the first word to give it a capital letter.');}
  if(ph==='mark'){const box=$('stiles');box.innerHTML='';
    [['.','m_period'],['?','m_question'],['!','m_exclaim']].forEach(([m,k])=>{const b=document.createElement('button');b.className='wtile markbtn';b.textContent=m;b.setAttribute('aria-label',m==='.'?'period':m==='?'?'question mark':'exclamation mark');
      b.onclick=()=>{if(G.busy)return;say([k],b.getAttribute('aria-label'));
        if(m===current.mark){sb.mark=m;drawSentence();if(sb.errs)G.tries=Math.max(G.tries,1);correct({seq:['sentence_good','sent'+current.spec.i],text:'That\'s a super sentence! '+current.full,msg:'Super sentence!',wait:3400});}
        else{b.disabled=true;sb.errs++;miss('mark',{msg:current.mark==='?'?'Is it asking something? Try again.':current.mark==='!'?'Is it exciting? Try again.':'Is it telling something? Try again.'});}};box.appendChild(b);});
    $('feedback').textContent='How should the sentence end?';$('feedback').className='feedback';say(['pick_mark'],'How should the sentence end? Pick the right mark.');}
}

/* ---------- comic reading ---------- */
function wireRead(){
  const q=$('qbody');
  q.querySelectorAll('.rw').forEach(w=>w.onclick=()=>{const k=w.dataset.w;w.classList.add('lit');setTimeout(()=>w.classList.remove('lit'),600);say(k?[W(k)]:[],w.textContent.replace(/[^A-Za-z']/g,''));});
  q.querySelector('[data-readall]').onclick=readAll;
  q.querySelector('[data-readdone]').onclick=()=>{if(G.busy)return;stopVoice();SAVE.rd=[...new Set([...(SAVE.rd||[]),current.spec.i])];
    correct({seq:['read_done'],text:'Great reading! Now let\'s answer some questions.',msg:'Great reading!',wait:2600});};
}
async function readAll(){
  const i=current.spec.i,caps=[...$('qbody').querySelectorAll('[data-cap]')];
  stopVoice();const tok=speakToken;
  for(let j=0;j<caps.length;j++){
    if(tok!==speakToken||!current||current.type!=='read')break;
    caps.forEach(c=>c.classList.toggle('reading',c===caps[j]));
    const key='rd'+i+'_p'+j;const b=HAS_CLIP.has(key)&&AUDIO.voiceMode==='hero'?await loadClip(key):null;
    if(b){await new Promise(res=>{const c=getCtx();const s=c.createBufferSource();s.buffer=b;s.connect(voiceGain);s.onended=res;s.start();playing.push(s);});}
    else{deviceSay(READS[i].p[j]);await new Promise(r=>setTimeout(r,READS[i].p[j].length*75));}
    await new Promise(r=>setTimeout(r,350));
  }
  caps.forEach(c=>c.classList.remove('reading'));
}

/* ---------- Say It Out Loud ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,sayDone=[],grownMode=false;
function buildSay(){
  sayDone=SAY_PARTS.map(()=>false);grownMode=!SR;
  $('qbody').innerHTML=`<div class="prompt">Explain the water cycle!</div>
   <p style="font-weight:800;margin-bottom:8px" id="sayHelp"></p>
   <ul class="saylist" id="sayList">${SAY_PARTS.map((p,i)=>`<li data-i="${i}"><span class="ck">${i+1}</span>${p.label}</li>`).join('')}</ul>
   <div class="btnrow" style="justify-content:center;align-items:center"><button class="mic" id="micBtn">TALK</button><button class="btn ghost" id="grownBtn"></button><button class="listen" data-hear>HEAR IT</button></div>
   <div class="heard" id="heard"></div>`;
  $('micBtn').onclick=toggleMic;$('grownBtn').onclick=()=>{grownMode=!grownMode;sayMode();};
  $('sayList').querySelectorAll('li').forEach(li=>li.onclick=()=>{if(grownMode)markPart(+li.dataset.i);});
  sayMode();
}
function sayMode(){
  $('sayList').classList.toggle('grown',grownMode);$('micBtn').style.display=grownMode?'none':'';
  $('grownBtn').textContent=grownMode?(SR?'Use the microphone':'Grown-up is checking'):'A grown-up will check';$('grownBtn').disabled=!SR&&grownMode;
  $('sayHelp').textContent=grownMode?'Tell a grown-up how the water cycle works. Grown-up: tap each part as it is said.':'Tap TALK and explain the water cycle. Each part lights up when you say it.';
  if(grownMode)say(['say_grownup'],'Tell a grown-up how the water cycle works. They will check off each part.');
}
function markPart(i){
  if(sayDone[i]||G.q>=G.total)return;sayDone[i]=true;
  const li=$('sayList').children[i];li.classList.add('done');li.querySelector('.ck').textContent='✓';
  G.first++;G.stars++;if(G.tp)G.tp.stars[0]++;SAVE.xp+=5;G.q++;G.hp--;attack(G.q===G.total);updateHud();petDo('jump');
  if(sayDone.every(Boolean)){stopMic();G.busy=true;$('feedback').textContent='You explained every part!';$('feedback').className='feedback good';say(['say_great'],'Great explaining, hero! You told every part!');setTimeout(winGame,2600);}
}
function toggleMic(){if(rec){stopMic();return;}startMic();}
function startMic(){
  stopVoice();try{rec=new SR();}catch(e){grownMode=true;sayMode();return;}
  rec.lang='en-US';rec.continuous=true;rec.interimResults=true;let full='';
  rec.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript+' ';full=t.toLowerCase();$('heard').textContent='I heard: "'+t.trim()+'"';
    SAY_PARTS.forEach((p,i)=>{if(!sayDone[i]&&p.words.some(w=>full.includes(w)))markPart(i);});};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){$('heard').textContent='The microphone is blocked, so a grown-up can check instead.';grownMode=true;sayMode();}};
  rec.onend=()=>{const was=!!rec;rec=null;const m=$('micBtn');if(m){m.classList.remove('live');m.textContent='TALK';}
    if(was&&!sayDone.every(Boolean)&&!grownMode){const i=sayDone.findIndex(x=>!x);say([SAY_PARTS[i].tip],'');$('feedback').textContent='Tap TALK to keep going!';$('feedback').className='feedback try';}};
  try{rec.start();$('micBtn').classList.add('live');$('micBtn').textContent='STOP';$('feedback').textContent='';}catch(e){rec=null;}
}
function stopMic(){if(rec){const r=rec;rec=null;try{r.stop()}catch(e){}}const m=$('micBtn');if(m){m.classList.remove('live');m.textContent='TALK';}}

/* ---------- win ---------- */
function winGame(){
  stopMic();show('win');sfx('win');setSuper(false);Music.set('normal');
  sessionPlay+=Date.now()-G.started;
  if(FAM.set.breakMin>0&&sessionPlay>=FAM.set.breakMin*60000)breakDue=true;
  const w=G.mixed?G.homeWorld:G.world;const v=VILLAINS[G.world],h=currentHero();
  const bossBefore=bossUnlocked(G.homeWorld);
  $('winTitle').textContent=G.isBoss?'MEGA BOSS DEFEATED!':G.kind==='daily'?'DAILY MISSION COMPLETE!':v.win;
  $('winHero').innerHTML=heroSVG(h,150)+(SAVE.pet?petHTML(SAVE.pet,true):'');
  const s=G.first>=G.total*.9?3:G.first>=G.total*.6?2:1;
  $('winStars').innerHTML='★'.repeat(s)+'<span class="off">'+'★'.repeat(3-s)+'</span>';
  const p1Stars=G.tp?G.tp.stars[0]:G.stars;
  const before=SAVE.stars;SAVE.xp+=20;
  let extra=[],seqs=[];
  // daily streak
  if(G.kind==='daily'){
    const t=todayStr();if(!SAVE.daily.days.includes(t)){SAVE.daily.days.push(t);if(SAVE.daily.days.length>90)SAVE.daily.days.shift();
      SAVE.stars+=5;extra.push('+5 daily bonus stars');const st=streakNow();SAVE.daily.streak=st;SAVE.daily.best=Math.max(SAVE.daily.best,st);
      seqs.push(st===7||st%7===0?'streak7':st===3?'streak3':'daily_done');extra.push(`🔥 ${st} day streak!`);}
    else seqs.push('daily_done');
  }
  SAVE.stars+=p1Stars;
  if(!G.list||G.kind==='read'){const key=G.world+':'+G.mode.id;SAVE.ms[key]=Math.max(SAVE.ms[key]||0,s);if(G.world!=='water'&&!G.isBoss&&!G.list)SAVE.lv[G.world]=G.lvl;}
  // pet growth
  if(SAVE.pet){const px=SAVE.pet.xp,nx=px+p1Stars;SAVE.pet.xp=nx;
    const newT=PET_TRICKS.filter(t=>t[0]>px&&t[0]<=nx),grew=petStage(nx).i>petStage(px).i;
    if(grew){extra.push(`${SAVE.pet.name} grew to ${petStage(nx).name}!`);seqs.push('pet_grow');}
    if(newT.length){extra.push(`${SAVE.pet.name} learned: ${newT.map(t=>t[2]).join(', ')}`);if(!grew)seqs.push('pet_trick');}}
  recordSession({d:new Date().toISOString().slice(0,16).replace('T',' '),w:G.world,m:G.mode.name+(G.tp?' (2 players)':''),sc:G.tp?G.tp.first[0]:G.first,n:G.tp?Math.ceil(G.total/2):G.total,st:p1Stars,mi:G.missed.slice(0,8),h:G.helps||0});
  const vName=G.isBoss?'Mega '+v.name.replace(/^The /,''):G.mixed?'the villains':v.name;
  if(G.tp){const [a,b]=G.tp.stars;$('winText').innerHTML=`Team hero defeated ${vName}!<br>${escapeHTML(TP.names[0])}: ★${a} &nbsp; ${escapeHTML(TP.names[1])}: ★${b}`;seqs.unshift('team_win');}
  else $('winText').textContent=`${h.name} defeated ${vName}! ${SAVE.kid?SAVE.kid+', you':'You'} got ${G.first} of ${G.total} on the first try and earned ${G.stars} stars.`;
  const badges=[];
  if(G.first===G.total)badges.push('Perfect Hero');if(G.best>=3)badges.push('Super Mode Unlocked');if(G.best>=5)badges.push(G.best+' in a row');
  if(G.isBoss)badges.push('Mega Boss Defeated');badges.push(G.mode.name+' Champion');badges.push('Rank: '+rankName());
  if(G.world!=='water'&&!G.list&&!G.isBoss)badges.push('Level '+G.lvl);
  $('badges').innerHTML=[...extra.map(x=>`<span class="badge hot">${escapeHTML(x)}</span>`),...badges.map(b=>`<span class="badge">${escapeHTML(b)}</span>`)].join('');
  $('learned').innerHTML=G.learned.length?'Words you practiced: '+G.learned.map(x=>`<b>${escapeHTML(x)}</b>`).join(''):'';
  $('explain').innerHTML=G.world==='water'&&!G.mixed?`<div class="explain"><h3>Explain the water cycle</h3>${CYCLE_SVG}<ol class="story">${STORY.map(x=>`<li>${x}</li>`).join('')}</ol>
    <button class="icon-btn" id="readStory">Read it to me</button><p class="tip">Practice: say the water cycle out loud in your own words, then try writing it down.</p></div>`:'';
  if($('readStory'))$('readStory').onclick=()=>say(STORY.map((x,i)=>'story'+i),STORY.join(' '),{gap:.35});
  const newly=UNLOCKS.filter(u=>u.stars>before&&u.stars<=SAVE.stars);
  $('unlocks').innerHTML=newly.length?`<div class="unlockbox">NEW HERO GEAR UNLOCKED: ${newly.map(u=>`<b>${u.label}</b>`).join(', ')}<br><button class="btn" onclick="openCreator()">Try it on</button></div>`:'';
  if(newly.length)seqs.push('unlock');
  say([G.kind==='daily'?'daily_done':'win_'+G.world,...seqs.filter(x=>x!=='daily_done')],v.win,{gap:.3});
  if(newly.length)setTimeout(()=>{showBanner('NEW GEAR!');sfx('unlock');},1500);
  persist();renderTop();confetti();
  // story scenes
  G.afterScene=null;
  if(G.isBoss&&!SAVE.scenes[G.homeWorld+':end'])G.afterScene=[G.homeWorld,'end'];
  else if(!G.list&&!bossBefore&&bossUnlocked(G.homeWorld)&&!SAVE.scenes[G.homeWorld+':mid'])G.afterScene=[G.homeWorld,'mid'];
  if(G.afterScene)setTimeout(()=>{if($('win').classList.contains('active')&&G.afterScene){const [sw,at]=G.afterScene;G.afterScene=null;playScene(sw,at,()=>{});}},4200);
}
function confetti(){
  const colors=['#ffd23f','#e63946','#2a9df4','#2ec27e','#7b2cbf'];
  for(let i=0;i<90;i++){const c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=colors[i%5];
    c.style.animationDuration=(2+Math.random()*2)+'s';c.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),5000);}
  for(let i=0;i<4;i++)setTimeout(()=>burst(rnd(100,FW-100),rnd(100,FH/2),pick(colors),50),i*350);
}
function goHome(){stopVoice();stopChoices();helpRun++;closeModal('helpModal');stopMic();Music.set('normal');if(G&&G.afterScene){const [sw,at]=G.afterScene;G.afterScene=null;playScene(sw,at,goHome);return;}
  if(breakDue){startBreak(goHome);return;}renderAll();show('start');}

/* ---------- story scenes ---------- */
function playScene(w,at,done){
  const sc=SCENES[w].find(s=>s.at===at);const i=SCENES[w].indexOf(sc);if(!sc){done();return;}
  SAVE.scenes[w+':'+at]=1;persist();setWorldBg(w);
  let j=-1;const v=VILLAINS[w],h=currentHero();
  $('scTitle').textContent=sc.title;
  const step=()=>{
    j++;if(j>=sc.lines.length){closeModal('sceneModal');stopVoice();done();return;}
    const [who,t]=sc.lines[j];
    $('scArt').innerHTML=who==='v'?villainSVG(v,w,at==='boss'):who==='h'?heroSVG(h,150):`<div class="sc-duo">${heroSVG(h,120)}${who==='n'&&j===0?villainSVG(v,w,at==='boss'||at==='end'):''}</div>`;
    $('scWho').textContent=who==='v'?(at==='boss'?'Mega ':'')+v.name:who==='h'?h.name:'Narrator';
    $('scText').textContent=t;$('scPanel').className='panel scene '+(who==='v'?'villain':'');
    say([...(j===0?[`sc_${w}_${i}_t`]:[]),`sc_${w}_${i}_${j}`],t,{gap:.4});
    $('scNext').textContent=j===sc.lines.length-1?(at==='end'?'The End!':'Let\'s go!'):'Next';
  };
  $('scNext').onclick=step;$('scSkip').onclick=()=>{j=sc.lines.length;step();};
  openModal('sceneModal');step();
}
function openStoryLog(){
  const w=world;const list=SCENES[w];
  $('scTitle').textContent='Story so far';
  toast('Tap a chapter to watch it again');
  const seen=list.filter(s=>SAVE.scenes[w+':'+s.at]);
  if(!seen.length){toast('Play a mission to start the story!');return;}
  playScene(w,seen[seen.length-1].at,()=>{renderAll();show('start');});
}

/* ---------- break reminders ---------- */
let breakTimer=null;
const STRETCH=['Reach up to the sky like you are flying! ✈️','Do 10 superhero jumping jacks! 🦸','Touch your toes, then stand tall! 🙆','March in place like a hero on patrol! 🥾','Take 3 big breaths: in through your nose, out through your mouth. 🌬️','Get a drink of water! 💧'];
function startBreak(after){
  breakDue=false;sessionPlay=0;show('breakScr');stopVoice();Music.duck(true);
  say(['break_time'],'Great work, hero! Time for a power break. Stand up, stretch, and get some water!');
  let left=180,k=0;$('brkTip').textContent=STRETCH[0];$('brkDone').disabled=true;
  const tick=()=>{$('brkClock').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
    if(left%20===0){$('brkTip').textContent=STRETCH[k++%STRETCH.length];}
    if(left<=0){clearInterval(breakTimer);$('brkDone').disabled=false;$('brkClock').textContent='Ready!';say(['break_over'],'Break\'s over! Ready to save the day?');sfx('win');}left--;};
  clearInterval(breakTimer);tick();breakTimer=setInterval(tick,1000);
  $('brkDone').onclick=()=>{clearInterval(breakTimer);Music.duck(false);renderAll();show('start');};
  $('brkSkip').onclick=()=>{gateThen(()=>{clearInterval(breakTimer);Music.duck(false);renderAll();show('start');});};
}

/* ---------- hero creator ---------- */
let draft=null;
function openCreator(){
  draft=Object.assign({name:'',suit:'#2a9df4',cape:'#e63946',mask:'#14142b',emblem:'bolt',skin:'#f6c9a0',hair:'#3b2314',blast:'normal'},SAVE.custom||{});
  $('kidName').value=SAVE.kid||'';$('heroNameIn').value=draft.name||'';renderCreator();show('creator');
}
function renderCreator(){
  const sw=(id,list,key,kind)=>{const box=$(id);box.innerHTML='';list.forEach(c=>{const lockd=kind&&!isUnlocked(kind,c);const d=document.createElement('button');
    d.className='sw'+(draft[key]===c?' sel':'')+(lockd?' lock':'');d.style.background=c==='rainbow'?'linear-gradient(90deg,#e63946,#ffd23f,#2ec27e,#2a9df4)':c;
    d.setAttribute('aria-label',key+' '+c);d.onclick=()=>{if(lockd){const u=UNLOCKS.find(x=>x.kind===kind&&x.id===c);toast(`Earn ${u.stars} stars to unlock this!`);return;}draft[key]=c;renderCreator();sfx('click');};box.appendChild(d);});};
  sw('swSuit',[...COLORS,'#d4af37','#1b1b1b'],'suit','suit');sw('swCape',[...COLORS,'#ff6ec7','rainbow'],'cape','cape');
  sw('swMask',COLORS,'mask');sw('swSkin',SKINS,'skin');sw('swHair',HAIRS,'hair');
  const opt=(id,list,key,kind)=>{const box=$(id);box.innerHTML='';list.forEach(([v,label])=>{const lockd=kind&&!isUnlocked(kind,v);const b=document.createElement('button');
    b.className='opt'+(draft[key]===v?' sel':'')+(lockd?' lock':'');b.textContent=(lockd?'🔒 ':'')+label;
    b.onclick=()=>{if(lockd){const u=UNLOCKS.find(x=>x.kind===kind&&x.id===v);toast(`Earn ${u.stars} stars to unlock this!`);return;}draft[key]=v;renderCreator();sfx('click');};box.appendChild(b);});};
  opt('optEmblem',[['bolt','Lightning'],['star','Star'],['plus','Plus'],['heart','Heart'],['shield','Shield'],['crown','Crown']],'emblem','emblem');
  opt('optBlast',[['normal','Hero blast'],['rainbow','Rainbow blast'],['cosmic','Cosmic blast']],'blast','blast');
  draft.name=$('heroNameIn').value.trim().slice(0,16);
  $('creatorPrev').innerHTML=heroSVG(customHero(draft),190)+`<div class="name" style="color:var(--ink)">${escapeHTML(draft.name||'My Hero')}</div>`;
  $('gearList').innerHTML=UNLOCKS.filter(u=>u.stars>0).map(u=>`<div class="${SAVE.stars>=u.stars?'':'lock'}">${SAVE.stars>=u.stars?'✓':'🔒'} ${u.label}<br><small>${u.stars} ★</small></div>`).join('');
  $('gearStars').textContent=`You have ${SAVE.stars} stars.`;
}
$('heroNameIn').oninput=()=>renderCreator();
$('saveHero').onclick=()=>{draft.name=$('heroNameIn').value.trim().slice(0,16)||'My Hero';draft.blastColor=draft.suit;SAVE.custom=draft;SAVE.kid=$('kidName').value.trim().slice(0,16);SAVE.heroId='custom';persist();sfx('unlock');say(['intro'],'Never fear, hero!');goHome();};
$('cancelHero').onclick=goHome;

/* ---------- grown-ups area ---------- */
let gateAns=0,gateNext=null;
function gateThen(fn){gateNext=fn;const a=rnd(6,9),b=rnd(3,9);gateAns=a*b;$('gateQ').textContent=`Grown-ups only: what is ${a} × ${b}?`;$('gateIn').value='';openModal('gate');setTimeout(()=>$('gateIn').focus(),50);}
function openGate(){$('gateMsg').textContent='';gateThen(()=>openParent('list'));}
$('gateGo').onclick=()=>{if(+$('gateIn').value===gateAns){closeModal('gate');const f=gateNext;gateNext=null;f&&f();}else{const f=gateNext;gateThen(f);$('gateMsg').textContent='Not quite. Here is a new one.';}};
$('gateIn').onkeydown=e=>{if(e.key==='Enter')$('gateGo').click();};
function openModal(id){$(id).classList.add('open');}
function closeModal(id){$(id).classList.remove('open');}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{closeModal(b.dataset.close);if(b.dataset.close==='parent')renderAll();});
$('hpClose').onclick=closeHelp;
function openParent(tab){openModal('parent');parentTab(tab);}
document.querySelectorAll('#ptabs button').forEach(b=>b.onclick=()=>parentTab(b.dataset.tab));
function parentTab(tab){
  document.querySelectorAll('#ptabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  document.querySelectorAll('.ptab').forEach(p=>p.style.display=p.id==='pt-'+tab?'':'none');
  $('pWho').textContent=SAVE.kid?`for ${SAVE.kid}`:'';
  if(tab==='list')$('spellIn').value=SAVE.spell.join('\n');
  if(tab==='report')renderReport();
  if(tab==='players')renderPlayers();
  if(tab==='settings')renderSettings();
}
$('saveList').onclick=()=>{
  const words=[...new Set($('spellIn').value.toLowerCase().split(/[\s,;]+/).map(w=>w.replace(/[^a-z]/g,'')).filter(w=>w.length>=1&&w.length<=10))].slice(0,20);
  SAVE.spell=words;persist();$('listMsg').textContent=words.length?`Saved ${words.length} words. Find them in Word World → My Spelling List.`:'List cleared.';renderModes();
};
function renderReport(){
  const ses=[...SAVE.ses].reverse();const counts={},specs={};
  SAVE.ses.forEach(s=>(s.mi||[]).forEach(m=>{counts[m.l]=(counts[m.l]||0)+1;specs[m.l]=m.s;}));
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,14);
  const due=rqDue(99).length;
  $('repBody').innerHTML=`
   <div class="kv">Total stars: ${SAVE.stars} · Rank: ${rankName()} · Math level ${SAVE.lv.math} · Word level ${SAVE.lv.word}</div>
   <div class="kv">Daily streak: ${streakNow()} days (best ${SAVE.daily.best}) · Review queue: ${SAVE.rq.length} (${due} due now)${SAVE.pet?` · Sidekick: ${escapeHTML(SAVE.pet.name)}`:''}</div>
   <h3 style="margin:12px 0 4px">Needs practice</h3>
   ${top.length?`<div class="chips">${top.map(([l,c])=>`<span class="chip">${escapeHTML(l)}${c>1?` <b>×${c}</b>`:''}</span>`).join('')}</div>
     <div class="btnrow"><button class="btn blue" id="reviewBtn">Start a Review Mission with these</button></div>
     <p class="note">Missed problems also come back on their own in the Daily Mission after 1, 3, and 7 days.</p>`:'<p class="note">Nothing missed yet. Great work!</p>'}
   <h3 style="margin:14px 0 4px">Recent missions</h3>
   ${ses.length?`<table class="rep"><tr><th>When</th><th>Mission</th><th>First try</th><th>Stars</th><th>Help used</th></tr>${ses.map(s=>`<tr><td>${s.d}</td><td>${escapeHTML(s.m)}</td><td>${s.sc} of ${s.n}</td><td>${s.st}</td><td>${s.h||0}</td></tr>`).join('')}</table>`:'<p class="note">No missions played yet.</p>'}`;
  if($('reviewBtn'))$('reviewBtn').onclick=()=>{const list=top.map(([l])=>specs[l]).filter(Boolean).slice(0,10);closeModal('parent');unlockAudio();startGame({list,kind:'review'});};
}
function renderPlayers(){
  const list=Object.values(FAM.profiles);
  $('plBody').innerHTML=list.map(p=>`<div class="plrow"><input type="text" value="${escapeHTML(p.kid||'')}" data-rename="${p.id}" maxlength="16" placeholder="Name" aria-label="Player name">
    <span class="note">★ ${p.stars}${p.id===FAM.active?' · playing now':''}</span>
    ${list.length>1?`<button class="btn red" data-del="${p.id}">Delete</button>`:''}</div>`).join('')+
    (list.length<5?`<div class="btnrow"><button class="btn blue" id="plAdd">Add a player</button></div>`:'<p class="note">Up to 5 players.</p>');
  $('plBody').querySelectorAll('[data-rename]').forEach(i=>i.onchange=()=>{FAM.profiles[i.dataset.rename].kid=i.value.trim().slice(0,16);FAM.profiles[i.dataset.rename].updated=Date.now();persist();renderTop();});
  $('plBody').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(b.dataset.armed){deleteProfile(b.dataset.del);renderPlayers();renderAll();}else{b.dataset.armed='1';b.textContent='Tap again to delete';}});
  if($('plAdd'))$('plAdd').onclick=()=>{addProfile('New player');renderPlayers();};
}
function renderSettings(){
  $('setVoice').value=AUDIO.voiceMode;$('setMusic').checked=AUDIO.musicOn;$('setReadCh').checked=FAM.set.readChoices!==false;$('setBreak').value=String(FAM.set.breakMin||0);fillVoicePicker();
  $('devVoiceRow').style.display=AUDIO.voiceMode==='device'?'':'none';
  $('persistNote').textContent=canPersist?'Progress is saved in this browser on this device.':'Progress cannot be saved in this preview window. On the published site it saves automatically.';
  $('backupOut').textContent='';$('restoreMsg').textContent='';$('resetBtn').textContent='Reset all progress';
  renderSync();
}
function renderSync(){
  const box=$('syncBox');
  if(!Sync.available()){box.innerHTML='<p class="note">Sync works on the published site.</p>';return;}
  if(Sync.code()){
    const c=Sync.code();box.innerHTML=`<p class="kv">This device is synced. Family sync code:</p><div class="synccode">${c.slice(0,5)}-${c.slice(5)}</div>
      <p class="note">Enter this code on another device (Grown-ups → Settings → Sync) to share progress. Keep it private, like a password. ${escapeHTML(Sync.status())}</p>
      <div class="btnrow"><button class="btn" id="syncNow">Sync now</button><button class="btn ghost" id="syncOff">Stop syncing on this device</button></div>`;
    $('syncNow').onclick=async()=>{await Sync.pull();await Sync.push();applyProfile();renderSync();toast('Synced!');};
    $('syncOff').onclick=()=>{Sync.unlink();renderSync();};
  }else{
    box.innerHTML=`<p class="note">Keep progress the same on every device (like an iPad and a computer). Progress is stored on the game's server under a private code. Only someone with the code can see it.</p>
      <div class="btnrow"><button class="btn blue" id="syncCreate">Turn on sync</button></div>
      <label class="field" for="syncIn">Already have a code from another device?</label>
      <div class="btnrow" style="margin-top:0"><input type="text" id="syncIn" placeholder="ABCDE-FGHJK" maxlength="11" style="max-width:220px;text-transform:uppercase" autocomplete="off"><button class="btn" id="syncLink">Use this code</button></div>
      <p class="note" id="syncMsg"></p>`;
    $('syncCreate').onclick=async()=>{try{await Sync.create();say(['sync_on'],'Your hero is now saved in the cloud!');renderSync();}catch(e){$('syncMsg').textContent='Could not reach the sync server. Try again later.';}};
    $('syncLink').onclick=async()=>{try{await Sync.link($('syncIn').value);applyProfile();renderSync();toast('Synced! Progress loaded.');}catch(e){$('syncMsg').textContent=e.status===404?'That code was not found. Check it and try again.':'Could not reach the sync server. Try again later.';}};
  }
}
function fillVoicePicker(){const sel=$('voicePick');if(!sel)return;
  sel.innerHTML=voiceList.length?voiceList.map((v,i)=>`<option value="${i}" ${v===voice?'selected':''}>${isMale(v)?'Hero: ':''}${v.name.replace(/Microsoft |Online \(Natural\)| - English \(.*\)/g,'').trim()} (${v.lang})</option>`).join(''):'<option>No device voices found</option>';}
$('setVoice').onchange=e=>{AUDIO.voiceMode=e.target.value;FAM.set.voice=AUDIO.voiceMode;persist();renderSettings();say(['intro'],'Never fear, hero! Let\'s save the day!');};
$('voicePick').onchange=e=>{voice=voiceList[+e.target.value];userPickedVoice=true;deviceSay('Never fear, hero! Let\'s save the day!');};
$('setReadCh').onchange=e=>{FAM.set.readChoices=e.target.checked;persist();};
$('setMusic').onchange=e=>{AUDIO.musicOn=e.target.checked;FAM.set.music=AUDIO.musicOn;persist();Music.refresh();renderTop();};
$('setBreak').onchange=e=>{FAM.set.breakMin=+e.target.value;persist();};
$('testSound2').onclick=soundCheck;
$('backupBtn').onclick=()=>{const c=backupCode();$('backupOut').textContent=c;try{navigator.clipboard.writeText(c);$('restoreMsg').textContent='Backup code copied.';}catch(e){}};
$('restoreBtn').onclick=()=>{if(restoreCode($('restoreIn').value)){applySettings();$('restoreMsg').textContent='Progress restored!';renderAll();}else $('restoreMsg').textContent='That code did not work. Check that the whole code was pasted.';};
$('resetBtn').onclick=e=>{if(e.target.dataset.armed){resetSave();applySettings();renderAll();e.target.dataset.armed='';e.target.textContent='Progress reset';}else{e.target.dataset.armed='1';e.target.textContent='Tap again to reset ALL players';}};

/* ---------- sound check ---------- */
function soundCheck(){
  unlockAudio();AUDIO.soundOn=true;updateSoundBtn();
  [523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.18,'square',.09),i*120));
  setTimeout(()=>say(['soundcheck'],'Never fear, hero! I am here to help you save the day. Can you hear me?'),450);
  $('soundMsg').textContent='You should hear 3 beeps and the hero voice. No sound? Turn the volume up. On iPhone or iPad, turn off Silent mode.';
}
function updateSoundBtn(){$('soundBtn').textContent=AUDIO.soundOn?'Sound: On':'Sound: Off';}

/* ---------- wiring ---------- */
$('goBtn').onclick=()=>{unlockAudio();sfx('click');if(mode.id==='boss'&&!bossUnlocked(world)){toast('Earn stars in 3 missions to unlock the Mega Boss!');return;}if(breakDue){startBreak(()=>{});return;}startGame();};
$('againBtn').onclick=()=>{if(breakDue){startBreak(()=>{});return;}if(G.kind==='daily')startDaily();else if(G.list&&G.kind!=='read')startGame({list:G.list,kind:G.kind});else{world=G.homeWorld;startGame({skipScene:true});}};
$('homeBtn').onclick=goHome;$('quitBtn').onclick=()=>{if(G)G.afterScene=null;goHome();};
$('soundCheckBtn').onclick=soundCheck;$('parentBtn').onclick=openGate;
$('playerChip').onclick=openProfiles;$('tpBtn').onclick=openTwoP;$('storyBtn').onclick=openStoryLog;
$('musicBtn').onclick=()=>{AUDIO.musicOn=!AUDIO.musicOn;FAM.set.music=AUDIO.musicOn;persist();unlockAudio();Music.refresh();renderTop();};
$('soundBtn').onclick=()=>{AUDIO.soundOn=!AUDIO.soundOn;if(!AUDIO.soundOn)stopVoice();updateSoundBtn();if(AUDIO.soundOn)speakCurrent();};
$('speakBtn').onclick=()=>{if(current&&current.type==='read')readAll();else speakCurrent();};
function applySettings(){AUDIO.voiceMode=FAM.set.voice||'hero';AUDIO.musicOn=FAM.set.music!==false;Music.refresh();}
function renderAll(){renderTop();renderDaily();renderPet();renderHeroes();renderWorlds();renderModes();}

/* ---------- install as an app ---------- */
let deferredInstall=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').classList.add('show');});
$('installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').classList.remove('show');};
try{if(location.protocol==='https:'&&window.top===window.self&&'serviceWorker' in navigator){addEventListener('load',()=>{try{navigator.serviceWorker.register('sw.js').catch(()=>{});}catch(e){}});}}catch(e){}

/* ---------- boot ---------- */
(async()=>{
  renderAll();
  const had=await loadSave();
  applySettings();renderAll();
  if(FAM.sync){const ch=await Sync.pull();if(ch){applySettings();renderAll();}}
  if(had&&(SAVE.xp>0||SAVE.kid))toast(SAVE.kid?`Welcome back, ${SAVE.kid}!`:'Welcome back, hero!');
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&FAM.sync)Sync.pull().then(ch=>{if(ch&&$('start').classList.contains('active'))renderAll();});});
})();
