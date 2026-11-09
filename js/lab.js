/* ================= v5: Reading Lab question types ================= */
const labWord=w=>LAB_WORDS.find(x=>x.w===w);
const byLv=(arr,L)=>{const a=arr.filter(x=>x.lv===L);return a.length?a:arr.filter(x=>x.lv<=L);};
Object.assign(GEN,{
  sounds(L){const pool=byLv(LAB_WORDS.filter(x=>!/x|qu/.test(x.w)),L);return{t:'snd',w:fresh(pool,x=>x.w).w};},
  decode(L){const pool=byLv(LAB_WORDS,L);const x=fresh(pool,y=>y.w);
    const others=shuffle(LAB_WORDS.filter(y=>y.w!==x.w&&y.e!==x.e&&Math.abs(y.lv-x.lv)<=1)).slice(0,2).map(y=>y.w);return{t:'dec',w:x.w,o:others};},
  blends(L){const x=fresh(byLv(BLEND_WORDS,L),y=>y.w);return{t:'bln',w:x.w,b:x.b};},
  alien(L){const pool=byLv(ALIEN,L);const x=fresh(pool,y=>y.w);return{t:'aln',i:ALIEN.indexOf(x)};},
  silent(L){const x=fresh(SILENT,y=>y.w);return{t:'sil',i:SILENT.indexOf(x)};},
  syll(L){if(L===1){const x=fresh(SYLL,y=>y.w);return{t:'syl',i:SYLL.indexOf(x),k:'n'};}
    const pool=SYLL.filter(y=>y.p.length>1&&(L===3||y.p.length===2));const x=fresh(pool,y=>y.w);return{t:'syl',i:SYLL.indexOf(x),k:Math.random()<.35?'n':'s'};},
  flip(L){if(L===3&&Math.random()<.5)return{t:'flp',k:'g',g:pick(FLIP_GLYPHS)};
    const pool=FLIP_WORDS.filter(x=>L===1?'bd'.includes(x.l):true);const x=fresh(pool,y=>y.w);return{t:'flp',k:'w',i:FLIP_WORDS.indexOf(x),set:L===1?'bd':'bdpq'};},
  labmix(L){const m=pick(['sounds','decode','blends','alien','silent','syll','flip']);return GEN[m](L);}
});
BOSS_POOL.lab=['sounds','decode','blends','alien','silent','syll','flip'];
const picOf=w=>{const x=labWord(w);if(x)return x.e;const f=FLIP_WORDS.find(y=>y.w===w);return f?f.e:(ALL_PIC_WORDS.get(w)||'');};
const chunkTiles=x=>`<div class="chunks">${x.ch.map((c,i)=>`<button class="chunk${c==='e'&&i===x.ch.length-1&&x.ch.length>2?' quiet':''}" data-chunk="${c}" aria-label="${c}">${c}</button>`).join('')}</div>`;

const inR=(i,arr)=>Number.isInteger(i)&&i>=0&&i<arr.length;
/* a saved or synced question that doesn't match the lists is replaced with a fresh one */
function labValid(s){switch(s.t){
  case 'snd':return !!labWord(s.w);
  case 'dec':return !!labWord(s.w)&&Array.isArray(s.o);
  case 'bln':return typeof s.w==='string'&&typeof s.b==='string'&&Object.values(BLENDS).flat().includes(s.b)&&s.w.startsWith(s.b);
  case 'aln':return inR(s.i,ALIEN);case 'sil':return inR(s.i,SILENT);case 'syl':return inR(s.i,SYLL)&&(s.k==='n'||s.k==='s');
  case 'flp':return s.k==='g'?FLIP_GLYPHS.includes(s.g):inR(s.i,FLIP_WORDS)&&(s.set==='bd'||s.set==='bdpq');
  case 'lrd':return inR(s.i,LSTORIES);case 'lq':return inR(s.i,LSTORIES)&&inR(s.j,LSTORIES[s.i].q);}
  return true;}
const _build5=build;
build=function(s){
  if(['snd','dec','bln','aln','sil','syl','flp','lrd','lq'].includes(s.t)&&!labValid(s))s=s.t==='lrd'||s.t==='lq'?{t:'lq',i:0,j:0}:GEN.labmix(1);
  const P={spec:s,type:'choice',layout:'',seq:[],text:'',hint:'',hintSeq:null};
  switch(s.t){
  case 'snd':{const x=labWord(s.w);const n=soundCount(x);P.ans=n;
    const base=n<=2?[1,2,3,4]:n>=5?[3,4,5,6]:[2,3,4,5];P.choices=base.map(v=>({v}));P.layout='three';if(base.length===4)P.layout='';
    P.html=`<div class="prompt">How many sounds do you hear?</div><div class="pic">${x.e}</div><button class="listen" data-hear>HEAR IT</button><div class="sboxes" id="sboxes">${x.ch.map(()=>'<span class="sbx"></span>').join('')}</div>`;
    P.seq=['snd_q',W(x.w),W(x.w)];P.gap=.35;P.text=`How many sounds do you hear in ${x.w}? ${x.w}.`;P.label=`Sounds in "${x.w}"`;
    P.onRight=()=>{const b=$('sboxes');if(b)b.innerHTML=x.ch.map((c,i)=>`<span class="sbx f${c==='e'&&i===x.ch.length-1&&x.ch.length>2?' quiet':''}">${c}</span>`).join('');};
    P.correctSeq=[W(x.w)];P.learn=x.w;break;}
  case 'dec':{const x=labWord(s.w);P.ans=x.w;P.layout='pic three';P.word=true;
    P.choices=shuffle([x.w,...s.o.filter(o=>labWord(o))]).map(v=>({v,html:`<span class="e big">${labWord(v).e}</span>`}));
    P.html=`<div class="prompt">Read the word. Then tap its picture.</div>${chunkTiles(x)}<p class="tiny">Tap a letter to hear its clue.</p>`;
    P.seq=['dec_q'];P.text='Read the word. Then tap the picture that matches. Tap a letter to hear its clue.';P.label=`Read "${x.w}"`;P.correctSeq=[W(x.w)];P.learn=x.w;break;}
  case 'bln':{const w=s.w,b=s.b,L=b.length===3?3:['sh','ch','th','wh'].includes(b)?2:1;
    const pool=BLENDS[L].filter(y=>y!==b);const opts=shuffle([b,...shuffle(pool).slice(0,L===2?3:3)]);
    P.ans=b;P.choices=opts.map(v=>({v}));P.layout='txt';P.word=true;P.full=w;
    const e=picOf(w);
    P.html=`<div class="prompt">Which letters start the word?</div><div class="pic">${e||'🔊'}</div><div class="problem word" id="mword"><span class="blank" style="width:${b.length*0.7}em"></span>${w.slice(b.length)}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['bln_q',W(w),W(w)];P.gap=.35;P.text=`Which letters start the word ${w}? ${w}.`;P.label=`Blend: ${w}`;P.again=[W(w)];P.againText=w;P.learn=w;break;}
  case 'aln':{const a=ALIEN[s.i];P.ans=a.w;P.choices=shuffle([a.w,...a.o]).map(v=>({v}));P.layout='txt three';P.word=true;
    P.html=`<div class="prompt">The alien says a made-up word. Which one?</div><div class="pic">👽</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['aln_q','al_'+a.w,'al_'+a.w];P.gap=.4;P.text=`The alien says: ${a.w}. ${a.w}.`;P.label=`Alien word "${a.w}"`;P.again=['al_'+a.w];P.againText=a.w;break;}
  case 'sil':{const it=SILENT[s.i],w=it.w;P.ans=String(it.i);P.layout='txt';P.word=true;
    const idx=[...w].map((c,i)=>i).filter(i=>!(it.e&&i===w.length-1));
    P.choices=idx.map(i=>({v:String(i),html:w[i]}));
    P.html=`<div class="prompt">Which letter is silent? You can't hear it.</div><div class="problem word" id="silword">${[...w].map((c,i)=>`<span class="${it.e&&i===w.length-1?'quiet':''}">${c}</span>`).join('')}</div><button class="listen" data-hear>HEAR IT</button>${it.e?'<p class="tiny">The gray e at the end is a magic e. It is quiet too.</p>':''}`;
    P.seq=['sil_q',W(w),W(w)];P.gap=.35;P.text=`Which letter is silent in ${w}? ${w}.`;P.label=`Silent letter: ${w}`;
    P.onRight=()=>{const el=$('silword');if(el)el.children[it.i].classList.add('quiet','cross');};P.again=[W(w)];P.againText=w;P.learn=w;break;}
  case 'syl':{const x=SYLL[s.i];
    if(s.k==='n'){P.ans=x.p.length;P.choices=[1,2,3].map(v=>({v}));P.layout='three';
      P.html=`<div class="prompt">How many syllables? Clap it out!</div><div class="problem word">${x.w}</div><button class="listen" data-hear>HEAR IT</button>`;
      P.seq=['syl_q','sy_'+x.w];P.text=`Clap the syllables: ${syllSay(x)}`;P.label=`Syllables in "${x.w}"`;}
    else{P.ans=x.p.join(' | ');const w=x.w;const cuts=new Set([P.ans]);
      for(let k=1;k<w.length&&cuts.size<3;k++){const c=w.slice(0,k)+' | '+w.slice(k);if(Math.abs(k-x.p[0].length)>=1&&Math.random()<.6)cuts.add(c);}
      for(let k=1;k<w.length&&cuts.size<3;k++)cuts.add(w.slice(0,k)+' | '+w.slice(k));
      P.choices=shuffle([...cuts]).map(v=>({v}));P.layout='txt three';P.word=true;
      P.html=`<div class="prompt">Where does the word break into syllables?</div><div class="problem word">${w}</div><button class="listen" data-hear>HEAR IT</button>`;
      P.seq=['syl_split_q','sy_'+w];P.text=`Where does ${w} break apart? ${syllSay(x)}`;P.label=`Split "${w}"`;}
    P.hint='Say it slowly and clap. Each clap is one syllable.';P.learn=x.w;break;}
  case 'flp':{
    if(s.k==='g'){const g=s.g;P.ans='ok';P.choices=shuffle([{v:'ok',html:`<span class="glyph">${g}</span>`},{v:'mirror',html:`<span class="glyph mir">${g}</span>`}]);P.layout='two';
      P.html=`<div class="prompt">Which one faces the right way?</div><div class="problem small">${g}</div>`;
      P.seq=['flp_g_q'];P.text='Which one is written the right way?';P.label=`Right way: ${g}`;P.hint='Check your letter and number chart. Start at the top.';}
    else{const f=FLIP_WORDS[s.i];P.ans=f.l;P.choices=s.set.split('').map(v=>({v}));P.layout=s.set.length===2?'two':'';P.word=true;P.full=f.w;
      P.html=`<div class="prompt">Which letter starts the word?</div><div class="pic">${f.e}</div><div class="problem word" id="mword"><span class="blank"></span>${f.w.slice(1)}</div><button class="listen" data-hear>HEAR IT</button>`;
      P.seq=['flp_q',W(f.w),W(f.w)];P.gap=.35;P.text=`Which letter starts ${f.w}? ${f.w}.`;P.label=`b, d, p or q: ${f.w}`;P.again=[W(f.w)];P.againText=f.w;}
    break;}
  case 'lrd':{const st=LSTORIES[s.i];P.type='lread';P.ans='read';
    P.html=`<div class="prompt">${st.t}</div><div class="pic">📖</div><ol class="lines" id="lines">${st.l.map((t,j)=>`<li data-ln="${j}" class="${j===0?'cur':'later'}">${t.split(' ').map(w=>`<span class="rw" data-w="${w.replace(/[^A-Za-z']/g,'').toLowerCase()}">${w}</span>`).join(' ')}</li>`).join('')}</ol>
      <div class="btnrow" style="justify-content:center"><button class="listen" data-lineplay>READ IT TO ME</button><button class="btn" data-linenext>I read it! ➜</button></div>`;
    P.seq=['ls'+s.i+'_t','lread_prompt'];P.text=st.t+'. Let\'s read one line at a time. Listen first, then you read it.';P.label=`Read: ${st.t}`;break;}
  case 'lq':{const st=LSTORIES[s.i],q=st.q[s.j];P.ans=q.a[0];P.layout='pic three';
    P.choices=shuffle([q.a,...q.o]).map(([v,e])=>({v,html:`<span class="e">${e}</span>${v}`}));
    P.html=`<div class="prompt">${st.t}</div><div class="qtext big">${q.q}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['lq'+s.i+'_'+s.j];P.text=q.q;P.label=`${st.t}: ${q.q}`;break;}
  default:return _build5(s);
  }
  return P;
};
const _wos5=worldOfSpec;
worldOfSpec=function(s){if(['snd','dec','bln','aln','sil','syl','flp','lrd','lq'].includes(s.t))return 'lab';return _wos5(s);};

/* ---- choice speech + help for the lab ---- */
const _cs5=choiceSpeech;
choiceSpeech=function(P,c){
  const t=P.spec.t,v=c.v;
  if(t==='dec')return {seq:[W(v)],text:String(v)};
  if(t==='bln'){return {seq:['bl_'+v],text:v.toUpperCase().split('').join(' ')};}
  if(t==='sil'){const l=SILENT[P.spec.i].w[+v];return {seq:['l_'+l],text:l};}
  if(t==='flp')return {seq:['l_'+v],text:v};
  if(t==='lq')return {seq:[textKey('ch_',v)],text:v};
  return _cs5(P,c);
};
const _rco5=readsChoicesOK;
/* hearing the choices would give the answer away for these */
readsChoicesOK=function(P){if(!P||!P.spec)return false;const t=P.spec.t;if(t==='aln'||(t==='syl'&&P.spec.k==='s')||(t==='flp'&&P.spec.k==='g'))return false;return _rco5(P);};
Object.assign(HELP,{
  snd:[{v:()=>`<div class="pic">☀️</div><div class="sboxes"><span class="sbx f">s</span><span class="sbx f">u</span><span class="sbx f">n</span></div>`,
    s:["Say the word slowly, like you are stretching a rubber band.","Sun. Listen for the first sound, the middle sound, and the last sound.","Put one finger up for each sound. Sun has 3 sounds.","Some sounds use two letters, like S H in ship. That is still one sound."]}],
  dec:[{v:()=>`<div class="chunks"><span class="chunk">c</span><span class="chunk">a</span><span class="chunk">t</span></div><div class="pic">🐱</div>`,
    s:["Tap each letter to hear its clue.","Say the sound for each letter, from left to right.","Then push the sounds together, faster and faster, until it sounds like a word.","C, a, t makes cat. Find the picture of a cat."]}],
  bln:[{v:()=>`<div class="problem word"><span class="hl">str</span>ing</div><div class="pic">🧵</div>`,
    s:["A blend is two or three letters at the start of a word. You can hear every letter.","Say the word slowly: string.","At the start you hear the S, then the T, then the R.","So string starts with S T R."]}],
  aln:[{v:()=>`<div class="pic">👽</div><div class="problem word">b l i m</div>`,
    s:["Alien words are made up, but you can still read them.","Look at each letter and say its sound, from left to right.","Push the sounds together.","Then pick the word that matches what the alien said."]}],
  sil:[{v:()=>`<div class="problem word"><span class="quiet cross">k</span>not</div>`,
    s:["Some letters are quiet. You see them, but you don't hear them.","Knot starts with the N sound. The K is silent.","K N, W R, G N, and M B often have a quiet letter."]}],
  syl:[{v:()=>`<div class="problem word">sun | set</div>`,
    s:["Put your hand under your chin and say the word slowly.","Each time your chin drops, that's one syllable.","Sun, set. Two claps, so sunset has 2 syllables.","Split the word between the claps: sun, then set."]}],
  flp:[{v:()=>`<div class="bedtrick"><b>b</b><span>e</span><b>d</b></div><div class="pic">✊👍 👍✊</div>`,
    s:["Here's the bed trick. Make two fists with your thumbs up.","Your left hand makes a b. Your right hand makes a d.","Together they make a bed. B comes first, then d.","For numbers, start at the top and check your number chart."]}]
});
const _hid5=helpId;
helpId=function(P){const t=P.spec&&P.spec.t;if(['snd','dec','bln','aln','sil','syl','flp'].includes(t))return t;if(t==='lq')return 'lq';if(t==='lrd')return null;return _hid5(P);};
const _hex5=helpExample;
helpExample=function(P){
  if(helpId(P)==='lq'){const st=LSTORIES[P.spec.i];if(!st)return null;const line=st.l.find(l=>l.toLowerCase().includes(String(P.ans).replace(/^a /,'').toLowerCase()))||st.l[0];const j=st.l.indexOf(line);
    return {id:'lq',v:`<p class="helpcap">"${line}"</p>`,steps:[{k:'hp_rq_0',t:'Look back at the story. This part of the story has the answer.'},{k:'ls'+P.spec.i+'_'+j,t:line}]};}
  return _hex5(P);
};

/* ---- tap a letter chunk to hear its clue ---- */
function wireChunks(){
  $('qbody').querySelectorAll('[data-chunk]').forEach(b=>b.onclick=()=>{const [k,t]=chunkSay(b.dataset.chunk);b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),700);say([k],t);});
}

/* ---- Read With Me: one line at a time with a line reader ---- */
let lineIdx=0,lineRun=0;
function wireLread(){
  lineIdx=0;const q=$('qbody');
  q.querySelectorAll('.rw').forEach(w=>w.onclick=()=>{const k=w.dataset.w;w.classList.add('lit');setTimeout(()=>w.classList.remove('lit'),600);say(k?[W(k)]:[],w.textContent.replace(/[^A-Za-z']/g,''));});
  q.querySelector('[data-lineplay]').onclick=()=>playLine(lineIdx);
  q.querySelector('[data-linenext]').onclick=nextLine;
  setTimeout(()=>{if(current&&current.type==='lread'&&lineIdx===0)playLine(0);},5200);
}
function setLine(j){[...$('lines').children].forEach((li,i)=>{li.className=i<j?'done':i===j?'cur':'later';});}
async function playLine(j){
  if(!current||current.type!=='lread')return;
  const i=current.spec.i,key='ls'+i+'_'+j,run=++lineRun;
  const li=$('lines').children[j];if(!li)return;const words=[...li.querySelectorAll('.rw')];
  stopVoice();const b=HAS_CLIP.has(key)&&AUDIO.voiceMode==='hero'?await loadClip(key):null;
  const dur=b?b.duration:Math.max(1.5,LSTORIES[i].l[j].length*0.075);
  // light each word in turn, timed by word length, so the reader's eyes can follow along
  const wts=words.map(w=>w.textContent.replace(/[^A-Za-z]/g,'').length+1.5);const tot=wts.reduce((a,c)=>a+c,0);
  let t=0.12;words.forEach((w,k)=>{const at=t;setTimeout(()=>{if(run!==lineRun)return;words.forEach(x=>x.classList.remove('lit'));w.classList.add('lit');},at*1000);t+=wts[k]/tot*(dur-0.25);});
  setTimeout(()=>{if(run===lineRun)words.forEach(x=>x.classList.remove('lit'));},dur*1000+150);
  await sayWait([key],LSTORIES[i].l[j]);
  if(run!==lineRun||!current||current.type!=='lread')return;
  $('feedback').textContent='Now you read it out loud!';$('feedback').className='feedback';
  say(['your_turn'],'Now you read it!');
}
function nextLine(){
  if(G.busy||!current||current.type!=='lread')return;lineRun++;stopVoice();sfx('click');
  const st=LSTORIES[current.spec.i];lineIdx++;
  if(lineIdx>=st.l.length){setLine(st.l.length);correct({seq:['read_done'],text:'Great reading! Now let\'s answer some questions.',msg:'Great reading!',wait:2600});return;}
  setLine(lineIdx);$('feedback').textContent='';G.xpLine=(G.xpLine||0)+1;
  setTimeout(()=>playLine(lineIdx),300);
}

/* ================= READING SUPPORTS ================= */
function applyReadingSupports(){
  const s=FAM.set;document.body.classList.toggle('easyread',!!s.easyRead);document.body.classList.toggle('calm',!!s.calm);
  document.body.classList.toggle('bigtext',!!s.bigText);
}

/* ================= RED/GREEN GLASSES MODE =================
   Standard red/green training glasses: RED lens over the RIGHT eye, GREEN lens over the LEFT eye.
   On the game's white question panel, red ink is seen by the LEFT eye (green lens) and
   green ink is seen by the RIGHT eye (red lens). The training eye gets the important
   content at full strength; the other eye gets lighter ink so both eyes have to work. */
const RED_SHADES=['#ff0000','#ff2020','#ff3b3b','#f00a0a','#e60000','#ff4d4d','#ff6b6b'];
const GREEN_SHADES=['#00ff00','#00f040','#33ff33','#00e05a','#00ff80','#5aff5a','#00d000'];
let glassOn=false,glassStart=0,glassTurn=0,glassTimer=null;
const GL=()=>FAM.set.glasses||(FAM.set.glasses=cleanGlasses({}));
function mixWhite(hex,s){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,f=x=>Math.round(255-(255-x)*s);return `rgb(${f(r)},${f(g)},${f(b)})`;}
function glassColors(){
  const g=GL(),red=RED_SHADES[g.red]||RED_SHADES[0],green=GREEN_SHADES[g.green]||GREEN_SHADES[0];
  let eye=g.eye;if(eye==='both')eye=glassTurn%2?'right':'left';
  const weak=eye==='left'?red:green,strong=eye==='left'?green:red;
  return {weak,strong:mixWhite(strong,g.strong/100),eye};
}
function paintGlasses(){
  const r=document.documentElement.style;if(!glassOn){document.body.classList.remove('glasses','glass-team');return;}
  const c=glassColors();r.setProperty('--gw',c.weak);r.setProperty('--gs',c.strong);
  document.body.classList.add('glasses');document.body.classList.toggle('glass-team',GL().mode==='team');
}
/* "team up" mode: split the letters of the big word between both eyes */
function teamSplit(){
  if(!glassOn||GL().mode!=='team')return;
  $('qbody').querySelectorAll('.problem.word, .chunks, .ans.txt, .lines li.cur').forEach(el=>{let k=0;
    const walk=n=>{[...n.childNodes].forEach(ch=>{if(ch.nodeType===3&&ch.textContent.trim()){const frag=document.createDocumentFragment();
      for(const c of ch.textContent){const s=document.createElement('span');s.textContent=c;if(c.trim()){s.className=k++%2?'gs':'gw';}frag.appendChild(s);}ch.replaceWith(frag);}
      else if(ch.nodeType===1&&!ch.classList.contains('blank'))walk(ch);});};walk(el);});
}
function glassesMinsLeft(){return glassOn?Math.max(0,Math.ceil(GL().mins-(Date.now()-glassStart)/60000)):0;}
function startGlasses(){
  if(!GL().cal){openEyeSetup();return;}
  glassOn=true;glassStart=Date.now();glassTurn=0;paintGlasses();renderGlassChip();
  clearInterval(glassTimer);glassTimer=setInterval(()=>{renderGlassChip();if(glassesMinsLeft()<=0){glassTimeUp=true;clearInterval(glassTimer);}},15000);
  $('glassOnArt').innerHTML=glassesSVG();openModal('glassOnModal');say(['glasses_on'],'Put on your hero glasses! Red lens on your right eye, green lens on your left eye.');
}
let glassTimeUp=false;
function stopGlasses(done){
  if(glassOn){const used=Math.round((Date.now()-glassStart)/60000);const t=todayStr();if(!SAVE.eye||SAVE.eye.d!==t)SAVE.eye={d:t,m:0};SAVE.eye.m=Math.min(600,SAVE.eye.m+used);persist();}
  glassOn=false;glassTimeUp=false;clearInterval(glassTimer);paintGlasses();renderGlassChip();
  if(done){openModal('glassDoneModal');say(['glasses_off'],'Great eye training, hero! You can take your glasses off now.');}
}
function checkGlassTime(){if(glassOn&&glassTimeUp)stopGlasses(true);}
function renderGlassChip(){const b=$('glassChip');if(!b)return;
  if(!GL().enabled){b.style.display='none';return;}b.style.display='';
  b.textContent=glassOn?`👓 Glasses on · ${glassesMinsLeft()} min`:'👓 Glasses time';b.classList.toggle('on',glassOn);}
/* per question: alternate eyes in "both" mode, then repaint */
function glassesForQuestion(){if(!glassOn)return;glassTurn++;paintGlasses();teamSplit();}

/* ---- grown-up setup ---- */
let eyeStep=0,eyeDraft=null;
function openEyeSetup(){eyeDraft=JSON.parse(JSON.stringify(GL()));eyeStep=0;renderEyeStep();openModal('eyeModal');}
function renderEyeStep(){
  const d=eyeDraft,box=$('eyeBody');
  const steps=[
    ()=>`<h3>1. Put the glasses on</h3>${glassesSVG()}<p>Wear the red and green glasses the standard way: <b>red lens over the RIGHT eye, green lens over the LEFT eye</b>.</p><p class="note">This is extra practice inside the game. It does not replace a prescribed vision program. Ask your child's eye doctor before adding glasses time, and follow the doctor's time limits.</p>`,
    ()=>`<h3>2. Tune the red</h3><div class="calbox"><span class="calstar" style="color:${RED_SHADES[d.red]}">★</span><span class="calword" style="color:${RED_SHADES[d.red]}">HERO</span></div>
      <p>Cover the <b>LEFT</b> eye so he looks only through the <b>red</b> lens. The red star should almost disappear. Slide until it is the faintest.</p>
      <input type="range" min="0" max="${RED_SHADES.length-1}" value="${d.red}" id="calRed" aria-label="Red shade">`,
    ()=>`<h3>3. Tune the green</h3><div class="calbox"><span class="calstar" style="color:${GREEN_SHADES[d.green]}">★</span><span class="calword" style="color:${GREEN_SHADES[d.green]}">HERO</span></div>
      <p>Cover the <b>RIGHT</b> eye so he looks only through the <b>green</b> lens. The green star should almost disappear. Slide until it is the faintest.</p>
      <input type="range" min="0" max="${GREEN_SHADES.length-1}" value="${d.green}" id="calGreen" aria-label="Green shade">`,
    ()=>`<h3>4. Training settings</h3>
      <label class="field" for="eyePick">Which eye is the eye doctor training?</label>
      <select class="inp" id="eyePick"><option value="left">Left eye</option><option value="right">Right eye</option><option value="both">Both eyes (take turns)</option></select>
      <label class="field" for="eyeMode">Style</label>
      <select class="inp" id="eyeMode"><option value="spot">Spotlight: the training eye sees the words and answers</option><option value="team">Team up: letters are split, so both eyes must work together</option></select>
      <label class="field" for="eyeStrong">Strength for the other eye: <b id="eyeStrongV">${d.strong}%</b></label>
      <input type="range" min="15" max="100" step="5" value="${d.strong}" id="eyeStrong" aria-label="Other eye strength">
      <label class="field" for="eyeMins">Glasses time per session</label>
      <select class="inp" id="eyeMins"><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option></select>
      <p class="note">Many glasses programs use 15-minute sessions. Use what the eye doctor recommends.</p>`,
    ()=>`<h3>5. Quick check</h3><div class="calbox duo"><span style="color:${RED_SHADES[d.red]}">LEFT</span><span style="color:${GREEN_SHADES[d.green]}">RIGHT</span></div>
      <p>With glasses on, cover the right eye: your child should read <b>LEFT</b>. Cover the left eye: they should read <b>RIGHT</b>. If both words show for one eye, go back and tune again.</p>`
  ];
  box.innerHTML=steps[eyeStep]();
  $('eyeBack').style.visibility=eyeStep?'visible':'hidden';$('eyeNext').textContent=eyeStep===steps.length-1?'Save':'Next';
  if($('calRed'))$('calRed').oninput=e=>{d.red=+e.target.value;renderEyeStep();};
  if($('calGreen'))$('calGreen').oninput=e=>{d.green=+e.target.value;renderEyeStep();};
  if($('eyePick')){$('eyePick').value=d.eye;$('eyePick').onchange=e=>d.eye=e.target.value;$('eyeMode').value=d.mode;$('eyeMode').onchange=e=>d.mode=e.target.value;
    $('eyeStrong').oninput=e=>{d.strong=+e.target.value;$('eyeStrongV').textContent=d.strong+'%';};$('eyeMins').value=String(d.mins);$('eyeMins').onchange=e=>d.mins=+e.target.value;}
  $('eyeNext').dataset.last=eyeStep===steps.length-1?'1':'';
}
function eyeNext(){if($('eyeNext').dataset.last){eyeDraft.cal=true;eyeDraft.enabled=true;FAM.set.glasses=cleanGlasses(eyeDraft);persist();closeModal('eyeModal');renderGlassChip();if(typeof renderSettings==='function')renderSettings();return;}eyeStep++;renderEyeStep();}
function glassesSVG(){return `<svg viewBox="0 0 300 110" width="300" role="img" aria-label="Glasses with the red lens on the right eye and the green lens on the left eye, as seen by the person wearing them">
  <text x="70" y="16" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="14">LEFT eye</text><text x="230" y="16" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="14">RIGHT eye</text>
  <circle cx="70" cy="62" r="42" fill="#00c040" fill-opacity=".75" stroke="#14142b" stroke-width="8"/><circle cx="230" cy="62" r="42" fill="#e00000" fill-opacity=".75" stroke="#14142b" stroke-width="8"/>
  <path d="M112 56q38-22 76 0" fill="none" stroke="#14142b" stroke-width="8"/><text x="70" y="68" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="16" fill="#fff">GREEN</text>
  <text x="230" y="68" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="16" fill="#fff">RED</text><text x="150" y="106" text-anchor="middle" font-family="Nunito" font-size="12">as he wears them</text></svg>`;}
