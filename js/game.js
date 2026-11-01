/* ================= GAME ================= */
const $=id=>document.getElementById(id);
let world='math', mode=MODES.math[0], heroId='bolt';
let G=null; // current run
const RANKS=[[0,'Rookie Hero'],[30,'Sidekick'],[80,'Hero'],[150,'Super Hero'],[250,'Mega Hero'],[400,'Legend']];
const rankName=()=>{let r=RANKS[0][1];for(const [n,t] of RANKS)if(SAVE.xp>=n)r=t;return r};

function currentHero(){
  if(heroId==='custom'&&SAVE.custom)return customHero(SAVE.custom);
  return HEROES.find(h=>h.id===heroId)||HEROES[0];
}
function customHero(c){return{id:'custom',name:c.name||'My Hero',power:'Your powers',suit:c.suit,cape:c.cape,mask:c.mask,emblem:c.emblem,skin:c.skin,hair:c.hair,blast:c.blastColor||c.suit,blastFx:c.blast||'normal'}}

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
  $('welcome').textContent=SAVE.kid?`Welcome back, ${SAVE.kid}! Villains are attacking.`:'Villains are attacking. Use your brain power to save the day.';
  $('musicBtn').textContent=AUDIO.musicOn?'Music: On':'Music: Off';$('musicBtn').classList.toggle('on',AUDIO.musicOn);
}
function renderHeroes(){
  const box=$('heroPicks');box.innerHTML='';
  const list=[...HEROES];if(SAVE.custom)list.push(customHero(SAVE.custom));
  list.forEach(h=>{const b=document.createElement('button');b.className='pick'+(h.id===heroId?' sel':'');
    b.innerHTML=heroSVG(h,80)+escapeHTML(h.name)+'<small>'+(h.id==='custom'?'Tap again to edit':h.power)+'</small>';
    b.onclick=()=>{if(h.id==='custom'&&heroId==='custom'){openCreator();return;}heroId=h.id;SAVE.heroId=h.id;persist();renderHeroes();sfx('click');};
    box.appendChild(b);});
  const c=document.createElement('button');c.className='pick create';
  c.innerHTML=`<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><circle cx="40" cy="40" r="30" fill="#ffd23f" stroke="#14142b" stroke-width="4"/><path d="M40 24v32M24 40h32" stroke="#14142b" stroke-width="7" stroke-linecap="round"/></svg>${SAVE.custom?'Edit My Hero':'Create Your Hero'}<small>Your own name & colors</small>`;
  c.onclick=openCreator;box.appendChild(c);
}
function renderWorlds(){document.querySelectorAll('.world').forEach(b=>b.classList.toggle('sel',b.dataset.world===world));setWorldBg(world);}
function renderModes(){
  const box=$('modePicks');box.innerHTML='';
  const list=[...MODES[world],BOSS[world]];
  list.forEach(m=>{
    const b=document.createElement('button');const isBoss=m.id==='boss';const locked=isBoss&&!bossUnlocked(world);
    b.className='pick'+(m===mode?' sel':'')+(isBoss?' boss':'')+(locked?' locked':'');
    const st=missionStars(world,m.id);
    let desc=m.desc;if(m.id==='mylist')desc=SAVE.spell.length?`${SAVE.spell.length} words from a grown-up`:'Grown-ups: add words first';
    if(isBoss&&!locked)desc='12 rounds. All your powers!';
    b.innerHTML=`<span style="font-size:20px">${locked?'🔒 ':''}${m.name}</span><small>${desc}</small><span class="mstars">${'★'.repeat(st)}${'☆'.repeat(3-st)}</span>`;
    b.onclick=()=>{if(locked){toast('Earn stars in 3 missions to unlock the Mega Boss!');sfx('wrong');return;}mode=m;renderModes();sfx('click');};
    box.appendChild(b);
  });
  $('lvlTag').textContent=world==='water'?'':`${world==='math'?'Math':'Word'} level ${SAVE.lv[world]}`;
}
document.querySelectorAll('.world').forEach(b=>b.onclick=()=>{world=b.dataset.world;mode=MODES[world][0];renderWorlds();renderModes();sfx('click');});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(t){const b=$('toast');b.textContent=t;b.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>b.classList.remove('show'),2600)}

/* ---------- run ---------- */
function startGame(opts={}){
  document.querySelectorAll('.confetti').forEach(c=>c.remove());parts.length=0;
  const review=opts.review||null;
  const isBoss=mode.id==='boss'&&!review;
  const w=review?worldOfSpec(review[0]):world;
  G={world:w,mode:review?{id:'review',name:'Review Mission'}:mode,review,isBoss,
     total:review?review.length:isBoss?12:mode.id==='wstory'||mode.id==='wsay'?5:mode.id==='mylist'?Math.min(10,Math.max(4,SAVE.spell.length*2)):10,
     q:0,stars:0,first:0,tries:0,streak:0,best:0,lvl:SAVE.lv[w]||1,lvStreak:0,lvMiss:0,missed:[],learned:[],busy:false,hp:0,startXP:SAVE.xp};
  G.hp=G.total;seen=[];setSuper(false);
  const v=VILLAINS[w],h=currentHero();
  document.documentElement.style.setProperty('--hero',h.blast.startsWith('#')?h.blast:'#c77dff');
  $('heroSvg').innerHTML=heroSVG(h);$('villainSvg').innerHTML=villainSVG(v,w,isBoss);
  $('heroName').textContent=h.name;$('villainName').textContent=(isBoss?'Mega ':'')+(isBoss?v.name.replace(/^The /,''):v.name);
  $('villainHp').style.width='100%';setWorldBg(w);updateCombo();updateHud();
  Music.set(isBoss?'boss':'normal');
  show('battle');
  if(isBoss){showBanner('MEGA BOSS!');sfx('boss');say(['mega_boss'],'Mega boss battle! This is it, hero!');setTimeout(nextQ,2300);}
  else{nextQ(true);}
  setTimeout(()=>{const i=rnd(0,v.taunts.length-1);taunt(v.taunts[i]);},400);
}
function updateHud(){
  $('progress').textContent=`Round ${Math.min(G.q+1,G.total)} of ${G.total}`;
  $('starCount').textContent='★ '+G.stars;
  $('lvlPill').textContent=G.world==='water'||G.review||G.isBoss?(G.isBoss?'BOSS':'Review'):`Level ${G.lvl}`;
  $('lvlPill').style.display=G.world==='water'&&!G.review&&!G.isBoss?'none':'';
}
function genSpec(){
  if(G.review)return G.review[G.q];
  let m=G.mode.id;
  if(G.isBoss){m=pick(BOSS_POOL[G.world]);}
  let s=GEN[m](G.lvl,G.q);
  if(G.q===G.total-1&&!G.isBoss&&G.world!=='water'&&G.lvl<3&&s.t!=='empty'){const s2=GEN[m===('mix')?'mix':m](Math.min(3,G.lvl+1),G.q);if(s2)s=s2;}
  return s;
}
let current=null;
function nextQ(first){
  if(G.q>=G.total)return winGame();
  const spec=genSpec();current=build(spec);G.tries=0;G.busy=false;
  const bossRound=G.q===G.total-1&&!G.isBoss;
  $('qpanel').classList.toggle('boss',bossRound||G.isBoss);
  $('bossTag').textContent=G.isBoss?'MEGA BOSS':'BOSS ROUND';
  updateHud();
  $('qbody').innerHTML=current.html;$('feedback').textContent='';$('feedback').className='feedback';
  const vis=document.createElement('div');vis.className='visual';vis.id='visual';
  if(current.type==='choice'){$('qbody').appendChild(vis);renderChoices();}
  else if(current.type==='spell'){buildSpell();$('qbody').appendChild(vis);}
  else if(current.type==='say'){buildSay();}
  else if(current.type==='empty'){$('qbody').innerHTML=`<div class="prompt">No spelling words yet</div><p style="font-weight:800;font-size:20px;margin:10px 0">Ask a grown-up to tap <b>Grown-ups</b> on the start screen and add this week's spelling words.</p><button class="btn blue" onclick="goHome()">Back to start</button>`;say(current.seq,current.text);return;}
  $('qbody').querySelectorAll('[data-hear]').forEach(b=>b.onclick=()=>speakCurrent());
  $('qbody').querySelectorAll('[data-peek]').forEach(b=>b.onclick=()=>{$('peekWord').textContent=current.ans;b.disabled=true;});
  const delay=bossRound&&!first?2000:first?350:250;
  if(bossRound){showBanner('BOSS ROUND!');sfx('boss');say(['boss_round'],'Boss round!');}
  setTimeout(speakCurrent,delay);
  // warm up the next clips
  preload([...current.seq,...(current.hintSeq||[]),'praise0','praise1','praise2','try0']);
}
function speakCurrent(){if(current)say(current.seq,current.text,{gap:current.gap});}
function renderChoices(){
  const box=document.createElement('div');box.className='answers '+(current.layout||'');
  const lay=current.layout||'';
  current.choices.forEach(c=>{
    const b=document.createElement('button');
    b.className='ans'+(lay.includes('long')?' long':lay.includes('pic')?' pic':lay.includes('coin')?' coinbtn':lay.includes('txt')?' txt':'');
    if(c.html)b.innerHTML=c.html;else b.textContent=c.v;
    b.setAttribute('aria-label',String(c.v));
    b.onclick=()=>answer(c.v,b);box.appendChild(b);
  });
  if(lay.includes('two')&&!lay.includes('long'))box.querySelectorAll('.ans').forEach(b=>b.style.fontSize='72px');
  $('qbody').appendChild(box);
}
const PRAISE=['Super job!','Power up!','Heroic!','You got it!','Amazing!','Way to go, hero!','Boom! Correct!'];
const TRYMSG=['Almost! Try again.','Not quite. You can do it!','Keep going, hero!'];
function answer(v,btn){
  if(G.busy)return;
  if(String(v)===String(current.ans)){
    document.querySelectorAll('.ans').forEach(b=>b.disabled=true);btn.classList.add('right');
    if(current.full&&$('mword'))$('mword').textContent=current.full;
    correct();
  }else{btn.disabled=true;miss(String(v));}
}
function miss(given){
  G.tries++;
  if(G.tries===1){G.streak=0;if(superMode)setSuper(false);updateCombo();
    if(!G.missed.some(m=>m.l===current.label))G.missed.push({w:G.world,s:current.spec,l:current.label});}
  const i=Math.min(G.tries-1,2);
  $('feedback').textContent=TRYMSG[i];$('feedback').className='feedback try';
  sfx('wrong');const v=VILLAINS[G.world];const ti=rnd(0,v.taunts.length-1);taunt(v.taunts[ti]);
  const vb=$('villainBox');vb.classList.remove('bounce');void vb.offsetWidth;vb.classList.add('bounce');
  // hint
  const vis=$('visual');
  if(current.hintFn==='dots')vis.innerHTML=dotsHint(current.hk||current.spec);
  else if(current.hint)vis.innerHTML=`<div class="hintbox">${current.hint}</div>`;
  if(current.spec.t==='place'&&!current.spec.show)vis.innerHTML=blocksHTML(current.spec.tens,current.spec.ones)+`<div class="hintbox">${current.hint}</div>`;
  if(current.hintSeq){say(['try'+i,...current.hintSeq],TRYMSG[i]+' '+current.hint);}
  else if(current.again){say(['try'+i,...current.again],TRYMSG[i]+' '+(current.againText||''));}
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
  if(G.review||G.isBoss||G.world==='water')return null;
  if(firstTry){G.lvStreak++;if(G.lvStreak>=2)G.lvMiss=0;
    if(G.lvStreak>=3&&G.lvl<3){G.lvl++;G.lvStreak=0;return 'up';}}
  else{G.lvStreak=0;G.lvMiss++;if(G.lvMiss>=2&&G.lvl>1){G.lvl--;G.lvMiss=0;return 'down';}}
  return null;
}
function correct(){
  G.busy=true;const firstTry=G.tries===0;
  if(firstTry){G.streak++;G.best=Math.max(G.best,G.streak);G.first++;G.stars+=superMode?2:1;SAVE.xp+=superMode?10:5;}else SAVE.xp+=2;
  if(current.learn&&!G.learned.includes(current.learn))G.learned.push(current.learn);
  const wasSuper=superMode;let voiceSeq=null,voiceText='';
  if(G.streak>=3&&!superMode){setSuper(true);setTimeout(()=>showBanner('SUPER MODE!'),300);sfx('super');voiceSeq=['super_mode'];voiceText='Super mode! Double stars!';}
  const lv=adapt(firstTry);
  if(lv==='up'){setTimeout(()=>showBanner('LEVEL UP!'),700);sfx('level');voiceSeq=['level_up'];voiceText='Level up! Here come tougher ones!';}
  if(lv==='down'){voiceSeq=['level_down'];voiceText='Let\'s power up with some easier ones.';}
  updateCombo();
  const pi=rnd(0,PRAISE.length-1);
  $('feedback').textContent=PRAISE[pi]+(SAVE.kid&&Math.random()<.4?` ${SAVE.kid}!`:'')+(firstTry?(wasSuper?' +2 ★':' +1 ★'):'');$('feedback').className='feedback good';
  if(!voiceSeq){voiceSeq=current.correctSeq?['praise'+pi,...current.correctSeq]:['praise'+pi];voiceText=PRAISE[pi];}
  say(voiceSeq,voiceText);
  const last=G.q===G.total-1;
  attack(last||superMode);
  G.q++;G.hp--;updateHud();
  setTimeout(()=>nextQ(),current.correctSeq?3600:1700);
}
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
    if(word===current.ans){setTimeout(()=>say([W(current.ans)],current.ans),350);setTimeout(correct,900);G.busy=true;}
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
  $('sayList').classList.toggle('grown',grownMode);
  $('micBtn').style.display=grownMode?'none':'';
  $('grownBtn').textContent=grownMode?(SR?'Use the microphone':'Grown-up is checking'):'A grown-up will check';
  $('grownBtn').disabled=!SR&&grownMode;
  $('sayHelp').textContent=grownMode?'Tell a grown-up how the water cycle works. Grown-up: tap each part as it is said.':'Tap TALK and explain the water cycle. Each part lights up when you say it.';
  if(grownMode)say(['say_grownup'],'Tell a grown-up how the water cycle works. They will check off each part.');
}
function markPart(i){
  if(sayDone[i]||G.busy&&G.q>=G.total)return;sayDone[i]=true;
  const li=$('sayList').children[i];li.classList.add('done');li.querySelector('.ck').textContent='✓';
  G.first++;G.stars++;SAVE.xp+=5;G.q++;G.hp--;attack(G.q===G.total);updateHud();
  if(sayDone.every(Boolean)){stopMic();G.busy=true;$('feedback').textContent='You explained every part!';$('feedback').className='feedback good';
    say(['say_great'],'Great explaining, hero! You told every part!');setTimeout(winGame,2600);}
}
function toggleMic(){if(rec){stopMic();return;}startMic();}
function startMic(){
  stopVoice();
  try{rec=new SR();}catch(e){grownMode=true;sayMode();return;}
  rec.lang='en-US';rec.continuous=true;rec.interimResults=true;let full='';
  rec.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript+' ';full=t.toLowerCase();$('heard').textContent='I heard: "'+t.trim()+'"';
    SAY_PARTS.forEach((p,i)=>{if(!sayDone[i]&&p.words.some(w=>full.includes(w)))markPart(i);});};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){$('heard').textContent='The microphone is blocked, so a grown-up can check instead.';grownMode=true;sayMode();}};
  rec.onend=()=>{const was=!!rec;rec=null;$('micBtn').classList.remove('live');$('micBtn').textContent='TALK';
    if(was&&!sayDone.every(Boolean)&&!grownMode){const i=sayDone.findIndex(x=>!x);say([SAY_PARTS[i].tip],'');$('feedback').textContent='Tap TALK to keep going!';$('feedback').className='feedback try';}};
  try{rec.start();$('micBtn').classList.add('live');$('micBtn').textContent='STOP';$('feedback').textContent='';}catch(e){rec=null;}
}
function stopMic(){if(rec){const r=rec;rec=null;try{r.stop()}catch(e){}}const m=$('micBtn');if(m){m.classList.remove('live');m.textContent='TALK';}}

/* ---------- win ---------- */
function winGame(){
  stopMic();show('win');sfx('win');setSuper(false);Music.set('normal');
  const v=VILLAINS[G.world],h=currentHero();
  $('winTitle').textContent=G.isBoss?'MEGA BOSS DEFEATED!':v.win;
  $('winHero').innerHTML=heroSVG(h,160);
  const s=G.first>=G.total*.9?3:G.first>=G.total*.6?2:1;
  $('winStars').innerHTML='★'.repeat(s)+'<span class="off">'+'★'.repeat(3-s)+'</span>';
  const before=SAVE.stars;SAVE.xp+=20;SAVE.stars+=G.stars;
  if(!G.review){const key=G.world+':'+G.mode.id;SAVE.ms[key]=Math.max(SAVE.ms[key]||0,s);if(G.world!=='water'&&!G.isBoss)SAVE.lv[G.world]=G.lvl;}
  recordSession({d:new Date().toISOString().slice(0,16).replace('T',' '),w:G.world,m:G.mode.name,sc:G.first,n:G.total,st:G.stars,mi:G.missed.slice(0,8)});
  $('winText').textContent=`${h.name} defeated ${G.isBoss?'Mega '+v.name.replace(/^The /,''):v.name}! ${SAVE.kid?SAVE.kid+', you':'You'} got ${G.first} of ${G.total} on the first try and earned ${G.stars} stars.`;
  const badges=[];
  if(G.first===G.total)badges.push('Perfect Hero');if(G.best>=3)badges.push('Super Mode Unlocked');if(G.best>=5)badges.push(G.best+' in a row');
  if(G.isBoss)badges.push('Mega Boss Defeated');badges.push(G.mode.name+' Champion');badges.push('Rank: '+rankName());
  if(G.world!=='water'&&!G.review&&!G.isBoss)badges.push('Level '+G.lvl);
  $('badges').innerHTML=badges.map(b=>`<span class="badge">${escapeHTML(b)}</span>`).join('');
  $('learned').innerHTML=G.learned.length?'Words you practiced: '+G.learned.map(w=>`<b>${escapeHTML(w)}</b>`).join(''):'';
  $('explain').innerHTML=G.world==='water'?`<div class="explain"><h3>Explain the water cycle</h3>${CYCLE_SVG}<ol class="story">${STORY.map(x=>`<li>${x}</li>`).join('')}</ol>
    <button class="icon-btn" id="readStory">Read it to me</button><p class="tip">Practice: say the water cycle out loud in your own words, then try writing it down.</p></div>`:'';
  if($('readStory'))$('readStory').onclick=()=>say(STORY.map((x,i)=>'story'+i),STORY.join(' '),{gap:.35});
  const newly=UNLOCKS.filter(u=>u.stars>before&&u.stars<=SAVE.stars);
  $('unlocks').innerHTML=newly.length?`<div class="unlockbox">NEW HERO GEAR UNLOCKED: ${newly.map(u=>`<b>${u.label}</b>`).join(', ')}<br><button class="btn" onclick="openCreator()">Try it on</button></div>`:'';
  const winKey=G.isBoss?'win_'+G.world:'win_'+G.world;
  say(newly.length?[winKey,'unlock']:[winKey],v.win);
  if(newly.length){setTimeout(()=>{showBanner('NEW GEAR!');sfx('unlock');},1500);}
  persist();renderTop();confetti();
}
function confetti(){
  const colors=['#ffd23f','#e63946','#2a9df4','#2ec27e','#7b2cbf'];
  for(let i=0;i<90;i++){const c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=colors[i%5];
    c.style.animationDuration=(2+Math.random()*2)+'s';c.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),5000);}
  for(let i=0;i<4;i++)setTimeout(()=>burst(rnd(100,FW-100),rnd(100,FH/2),pick(colors),50),i*350);
}
function goHome(){stopVoice();stopMic();Music.set('normal');renderAll();show('start');}

/* ---------- hero creator ---------- */
let draft=null;
function openCreator(){
  draft=Object.assign({name:'',suit:'#2a9df4',cape:'#e63946',mask:'#14142b',emblem:'bolt',skin:'#f6c9a0',hair:'#3b2314',blast:'normal'},SAVE.custom||{});
  $('kidName').value=SAVE.kid||'';$('heroNameIn').value=draft.name||'';
  renderCreator();show('creator');
}
function renderCreator(){
  const sw=(id,list,key,kind)=>{const box=$(id);box.innerHTML='';list.forEach(c=>{const lockd=kind&&!isUnlocked(kind,c);const d=document.createElement('button');
    d.className='sw'+(draft[key]===c?' sel':'')+(lockd?' lock':'');d.style.background=c==='rainbow'?'linear-gradient(90deg,#e63946,#ffd23f,#2ec27e,#2a9df4)':c;
    d.setAttribute('aria-label',key+' '+c);d.onclick=()=>{if(lockd){const u=UNLOCKS.find(x=>x.kind===kind&&x.id===c);toast(`Earn ${u.stars} stars to unlock this!`);return;}draft[key]=c;renderCreator();sfx('click');};box.appendChild(d);});};
  sw('swSuit',[...COLORS,'#d4af37','#1b1b1b'],'suit','suit');
  sw('swCape',[...COLORS,'#ff6ec7','rainbow'],'cape','cape');
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
$('saveHero').onclick=()=>{draft.name=$('heroNameIn').value.trim().slice(0,16)||'My Hero';draft.blastColor=draft.suit;SAVE.custom=draft;SAVE.kid=$('kidName').value.trim().slice(0,16);heroId='custom';SAVE.heroId='custom';persist();sfx('unlock');say(['intro'],'Never fear, hero!');goHome();};
$('cancelHero').onclick=goHome;

/* ---------- grown-ups area ---------- */
let gateAns=0;
function openGate(){const a=rnd(6,9),b=rnd(3,9);gateAns=a*b;$('gateQ').textContent=`Grown-ups only: what is ${a} × ${b}?`;$('gateIn').value='';$('gateMsg').textContent='';openModal('gate');setTimeout(()=>$('gateIn').focus(),50);}
$('gateGo').onclick=()=>{if(+$('gateIn').value===gateAns){closeModal('gate');openParent('list');}else{openGate();$('gateMsg').textContent='Not quite. Here is a new one.';}};
$('gateIn').onkeydown=e=>{if(e.key==='Enter')$('gateGo').click();};
function openModal(id){$(id).classList.add('open');}
function closeModal(id){$(id).classList.remove('open');}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{closeModal(b.dataset.close);renderAll();});
function openParent(tab){openModal('parent');parentTab(tab);}
document.querySelectorAll('#ptabs button').forEach(b=>b.onclick=()=>parentTab(b.dataset.tab));
function parentTab(tab){
  document.querySelectorAll('#ptabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
  document.querySelectorAll('.ptab').forEach(p=>p.style.display=p.id==='pt-'+tab?'':'none');
  if(tab==='list')$('spellIn').value=SAVE.spell.join('\n');
  if(tab==='report')renderReport();
  if(tab==='settings')renderSettings();
}
$('saveList').onclick=()=>{
  const words=[...new Set($('spellIn').value.toLowerCase().split(/[\s,;]+/).map(w=>w.replace(/[^a-z]/g,'')).filter(w=>w.length>=1&&w.length<=10))].slice(0,20);
  SAVE.spell=words;persist();$('listMsg').textContent=words.length?`Saved ${words.length} words. Find them in Word World → My Spelling List.`:'List cleared.';renderModes();
};
function renderReport(){
  const ses=[...SAVE.ses].reverse();
  const counts={};const specs={};
  SAVE.ses.forEach(s=>(s.mi||[]).forEach(m=>{counts[m.l]=(counts[m.l]||0)+1;specs[m.l]=m.s;}));
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,14);
  $('repBody').innerHTML=`
   <div class="kv">Total stars: ${SAVE.stars} · Rank: ${rankName()} · Math level ${SAVE.lv.math} · Word level ${SAVE.lv.word}</div>
   <h3 style="margin:12px 0 4px">Needs practice</h3>
   ${top.length?`<div class="chips">${top.map(([l,c])=>`<span class="chip">${escapeHTML(l)}${c>1?` <b>×${c}</b>`:''}</span>`).join('')}</div>
     <div class="btnrow"><button class="btn blue" id="reviewBtn">Start a Review Mission with these</button></div>`:'<p class="note">Nothing missed yet. Great work!</p>'}
   <h3 style="margin:14px 0 4px">Recent missions</h3>
   ${ses.length?`<table class="rep"><tr><th>When</th><th>Mission</th><th>First try</th><th>Stars</th></tr>${ses.map(s=>`<tr><td>${s.d}</td><td>${escapeHTML(s.m)}</td><td>${s.sc} of ${s.n}</td><td>${s.st}</td></tr>`).join('')}</table>`:'<p class="note">No missions played yet.</p>'}`;
  if($('reviewBtn'))$('reviewBtn').onclick=()=>{const list=top.map(([l])=>specs[l]).filter(Boolean).slice(0,10);closeModal('parent');unlockAudio();startGame({review:list});};
}
function renderSettings(){
  $('setVoice').value=AUDIO.voiceMode;$('setMusic').checked=AUDIO.musicOn;fillVoicePicker();
  $('devVoiceRow').style.display=AUDIO.voiceMode==='device'?'':'none';
  $('persistNote').textContent=canPersist?'Progress is saved in this browser on this device. Use a backup code to move it to another device.':'Progress cannot be saved in this preview window. On the published site it saves automatically.';
  $('backupOut').textContent='';$('restoreMsg').textContent='';$('resetBtn').textContent='Reset all progress';
}
function fillVoicePicker(){const sel=$('voicePick');if(!sel)return;
  sel.innerHTML=voiceList.length?voiceList.map((v,i)=>`<option value="${i}" ${v===voice?'selected':''}>${isMale(v)?'Hero: ':''}${v.name.replace(/Microsoft |Online \(Natural\)| - English \(.*\)/g,'').trim()} (${v.lang})</option>`).join(''):'<option>No device voices found</option>';}
$('setVoice').onchange=e=>{AUDIO.voiceMode=e.target.value;SAVE.set.voice=AUDIO.voiceMode;persist();renderSettings();say(['intro'],'Never fear, hero! Let\'s save the day!');};
$('voicePick').onchange=e=>{voice=voiceList[+e.target.value];userPickedVoice=true;deviceSay('Never fear, hero! Let\'s save the day!');};
$('setMusic').onchange=e=>{AUDIO.musicOn=e.target.checked;SAVE.set.music=AUDIO.musicOn;persist();Music.refresh();renderTop();};
$('testSound2').onclick=soundCheck;
$('backupBtn').onclick=()=>{const c=backupCode();$('backupOut').textContent=c;try{navigator.clipboard.writeText(c);$('restoreMsg').textContent='Backup code copied.';}catch(e){}};
$('restoreBtn').onclick=()=>{if(restoreCode($('restoreIn').value)){applySettings();$('restoreMsg').textContent='Progress restored!';renderAll();}else $('restoreMsg').textContent='That code did not work. Check that the whole code was pasted.';};
$('resetBtn').onclick=e=>{if(e.target.dataset.armed){resetSave();applySettings();heroId='bolt';renderAll();e.target.dataset.armed='';e.target.textContent='Progress reset';}else{e.target.dataset.armed='1';e.target.textContent='Tap again to confirm reset';}};

/* ---------- sound check ---------- */
function soundCheck(){
  unlockAudio();AUDIO.soundOn=true;updateSoundBtn();
  [523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.18,'square',.09),i*120));
  setTimeout(()=>say(['soundcheck'],'Never fear, hero! I am here to help you save the day. Can you hear me?'),450);
  const msg=$('soundMsg');msg.textContent='You should hear 3 beeps and the hero voice. No sound? Turn the volume up. On iPhone or iPad, turn off Silent mode.';
}
function updateSoundBtn(){$('soundBtn').textContent=AUDIO.soundOn?'Sound: On':'Sound: Off';}

/* ---------- wiring ---------- */
$('goBtn').onclick=()=>{unlockAudio();sfx('click');if(mode.id==='boss'&&!bossUnlocked(world)){toast('Earn stars in 3 missions to unlock the Mega Boss!');return;}startGame();};
$('againBtn').onclick=()=>{if(G.review)startGame({review:G.review});else startGame();};
$('homeBtn').onclick=goHome;
$('quitBtn').onclick=goHome;
$('soundCheckBtn').onclick=soundCheck;
$('parentBtn').onclick=openGate;
$('musicBtn').onclick=()=>{AUDIO.musicOn=!AUDIO.musicOn;SAVE.set.music=AUDIO.musicOn;persist();unlockAudio();Music.refresh();renderTop();};
$('soundBtn').onclick=()=>{AUDIO.soundOn=!AUDIO.soundOn;if(!AUDIO.soundOn)stopVoice();updateSoundBtn();if(AUDIO.soundOn)speakCurrent();};
$('speakBtn').onclick=()=>{AUDIO.autoMath=true;speakCurrent();};
function applySettings(){AUDIO.voiceMode=SAVE.set.voice||'hero';AUDIO.musicOn=SAVE.set.music!==false;Music.refresh();}
function renderAll(){renderTop();renderHeroes();renderWorlds();renderModes();}

/* ---------- install as an app ---------- */
let deferredInstall=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').classList.add('show');});
$('installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installBtn').classList.remove('show');};
try{
  if(location.protocol==='https:'&&window.top===window.self&&'serviceWorker' in navigator){
    addEventListener('load',()=>{try{navigator.serviceWorker.register('sw.js').catch(()=>{});}catch(e){}});
  }
}catch(e){}

/* ---------- boot ---------- */
const had=loadSave();
heroId=SAVE.heroId&&(SAVE.heroId!=='custom'||SAVE.custom)?SAVE.heroId:'bolt';
applySettings();renderAll();
if(had&&(SAVE.xp>0||SAVE.kid))toast(SAVE.kid?`Welcome back, ${SAVE.kid}!`:'Welcome back, hero!');
