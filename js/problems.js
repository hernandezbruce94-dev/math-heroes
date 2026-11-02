/* ================= PROBLEMS =================
   Each mission makes a small "spec" (so missed problems can be replayed in a Review mission),
   and build(spec) turns it into what the screen shows and what the hero voice says. */
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[rnd(0,a.length-1)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const N=n=>numKey(n);
const W=w=>wordKey(w);
let seen=[];
function fresh(list,key=x=>x){const pool=list.filter(x=>!seen.includes(key(x)));const it=pick(pool.length?pool:list);seen.push(key(it));return it;}
function numChoices(ans,max=20,count=4){
  const set=new Set([ans]);const near=shuffle([ans+1,ans-1,ans+2,ans-2,ans+3,ans-3,ans+10,ans-10].filter(n=>n>=0&&n<=max));
  while(set.size<count&&near.length)set.add(near.shift());
  while(set.size<count)set.add(rnd(0,max));
  return shuffle([...set]).map(v=>({v}));
}
const ALL_PIC_WORDS=(()=>{const m=new Map();PICS.forEach(([w,e])=>m.set(w,e));RHYMES.flat().forEach(([w,e])=>m.set(w,e));TEAMS.forEach(([w,e])=>m.set(w,e));return m})();

/* ---------- generators: (mode, level) -> spec ---------- */
const GEN={
  add10(L){ if(L===3&&Math.random()<.4){const a=rnd(1,6),x=rnd(1,10-a);return{t:'arith',k:'m',a,b:a+x};}
    const max=L===1?5:10;const a=rnd(0,max-1),b=rnd(1,max-a);return{t:'arith',k:'+',a,b}; },
  add20(L){ const lo=[6,10,11][L-1],hi=[12,15,20][L-1];const s=rnd(lo,hi);const a=rnd(Math.max(1,s-10),Math.min(10,s-1));return{t:'arith',k:'+',a,b:s-a}; },
  sub10(L){ if(L===3){const a=rnd(11,18),b=rnd(2,9);return{t:'arith',k:'-',a,b};}
    const a=rnd(2,L===1?5:10),b=rnd(1,a);return{t:'arith',k:'-',a,b}; },
  story(L){ const op=L===1?'+':L===2?'-':pick(['+','-']);const max=L===3?20:10;
    const opts=STORIES.map((s,i)=>i).filter(i=>STORIES[i].op===op);const i=pick(opts);
    if(op==='+'){const a=rnd(1,max-1),b=rnd(1,max-a);return{t:'story',i,a,b};}
    const a=rnd(3,max),b=rnd(1,a-1);return{t:'story',i,a,b}; },
  time(L){ const h=rnd(1,12);const m=L===1?0:L===2?pick([0,30]):pick([30,30,0]);return{t:'time',h,m}; },
  coins(L){
    if(L===1)return pick([{t:'coin',k:'name',c:pick(COINS).id},{t:'coin',k:'which',c:pick(COINS).id}]);
    if(L===2){const c=pick(['penny','nickel','dime']);const n=c==='penny'?rnd(2,9):rnd(2,6);return{t:'coin',k:'count',c:Array(n).fill(c)};}
    const kind=pick(['dp','np','qp','dn']);let c=[];
    if(kind==='dp')c=[...Array(rnd(1,4)).fill('dime'),...Array(rnd(1,5)).fill('penny')];
    if(kind==='np')c=[...Array(rnd(1,3)).fill('nickel'),...Array(rnd(1,4)).fill('penny')];
    if(kind==='qp')c=['quarter',...Array(rnd(1,4)).fill('penny')];
    if(kind==='dn')c=[...Array(rnd(1,3)).fill('dime'),...Array(rnd(1,2)).fill('nickel')];
    return{t:'coin',k:'count',c}; },
  place(L){ if(L===1)return{t:'place',tens:rnd(1,3),ones:rnd(0,9),show:1};
    if(L===2)return{t:'place',tens:rnd(2,9),ones:rnd(0,9),show:1};
    return{t:'place',tens:rnd(1,12),ones:rnd(0,9),show:0}; },
  compare(L){ if(L===3){const a=rnd(10,99);const b=Math.random()<.2?a:rnd(10,99);return{t:'cmp',a,b,ask:'sign'};}
    const max=L===1?20:100;let a=rnd(0,max),b=rnd(0,max);while(b===a)b=rnd(0,max);return{t:'cmp',a,b,ask:pick(['big','small'])}; },
  mix(L){ const m=pick(['add10','add20','sub10','story','time','coins','place','compare']);return GEN[m](L); },
  sight(L){ return{t:'sight',w:fresh(SIGHT_LEVELS[L-1].filter(w=>w!=='live')),L}; },
  spell(L){ const list=PICS.filter(p=>p[0].length===(L+2));return{t:'spell',w:fresh(list,p=>p[0])[0],x:L===3?3:2}; },
  missing(L){ const list=PICS.filter(p=>p[0].length===(L+2));const w=fresh(list,p=>p[0])[0];
    let p;if(L===1)p=[...w].findIndex(c=>'aeiou'.includes(c));else p=rnd(0,w.length-1);if(p<0)p=0;return{t:'miss',w,p}; },
  rhyme(L){ const fam=fresh(RHYMES.filter(f=>f.length>=2),f=>f[0][0]);const [t,a]=shuffle(fam);return{t:'rhyme',w:t[0],a:a[0],n:L===1?3:4}; },
  begin(L){ const list=[...ALL_PIC_WORDS.keys()].filter(w=>!/^(sh|ch|th|wh|kn)/.test(w));return{t:'begin',w:fresh(list),n:L===1?3:4}; },
  teams(L){ const list=TEAMS.filter(x=>L>1||x[2]!=='wh');return{t:'team',w:fresh(list,x=>x[0])[0],n:L===1?3:4}; },
  mylist(L,i){ const list=SAVE.spell;if(!list.length)return{t:'empty'};
    const w=list[i%list.length];return i%2===0?{t:'spell',w,x:L===3?3:2,custom:1}:{t:'sight',w,custom:1}; },
  wordmix(L){ const m=pick(['sight','spell','missing','rhyme','begin','teams']);return GEN[m](L); },
  wvocab(){ return{t:'water',m:'wvocab',i:WATER.wvocab.indexOf(fresh(WATER.wvocab,x=>x.q))}; },
  wcycle(){ return{t:'water',m:'wcycle',i:WATER.wcycle.indexOf(fresh(WATER.wcycle,x=>x.q))}; },
  wfacts(){ return{t:'water',m:'wfacts',i:WATER.wfacts.indexOf(fresh(WATER.wfacts,x=>x.q))}; },
  wstory(L,i){ return{t:'wstory',s:i}; },
  wsay(){ return{t:'say'}; }
};
const BOSS_POOL={math:['add10','add20','sub10','story','time','coins','place','compare'],word:['sight','spell','missing','rhyme','begin','teams'],water:['wvocab','wcycle','wfacts']};

/* ---------- builder: spec -> problem ---------- */
const PRE={wvocab:'wv',wcycle:'wc',wfacts:'wf'};
function build(s){
  const P={spec:s,type:'choice',layout:'',seq:[],text:'',hint:'',hintSeq:null};
  switch(s.t){
  case 'arith':{
    const {a,b,k}=s;
    if(k==='+'){P.ans=a+b;P.html=`<div class="problem">${a} + ${b} = <span class="q">?</span></div>`;P.seq=['what_is',N(a),'plus',N(b)];P.text=`What is ${a} plus ${b}?`;P.label=`${a} + ${b}`;}
    else if(k==='-'){P.ans=a-b;P.html=`<div class="problem">${a} − ${b} = <span class="q">?</span></div>`;P.seq=['what_is',N(a),'take_away',N(b)];P.text=`What is ${a} take away ${b}?`;P.label=`${a} − ${b}`;}
    else{P.ans=b-a;P.html=`<div class="problem">${a} + <span class="q">?</span> = ${b}</div>`;P.seq=[N(a),'plus_what_makes',N(b)];P.text=`${a} plus what makes ${b}?`;P.label=`${a} + ? = ${b}`;}
    P.choices=numChoices(P.ans);P.hintFn='dots';break;}
  case 'story':{
    const st=STORIES[s.i];const {a,b}=s;P.ans=st.op==='+'?a+b:a-b;
    const txt=st.text.replace('{A}',a).replace('{B}',b);
    P.html=`<div class="qbox"><div class="pic">${st.pic}</div><div class="storytext">${txt}</div></div>`;
    P.seq=st.pieces.map(x=>x==='A'?N(a):x==='B'?N(b):x);P.text=txt;P.label=`Story: ${a} ${st.op==='+'?'+':'−'} ${b}`;
    P.choices=numChoices(P.ans);P.hintFn='dots';P.hk={a,b,k:st.op};break;}
  case 'time':{
    const lab=(h,m)=>`${h}:${m===0?'00':m}`;P.ans=lab(s.h,s.m);
    const opts=new Set([P.ans]);const h=s.h,m=s.m,wrap=x=>((x+11)%12)+1;
    const cands=shuffle([lab(h,m===0?30:0),lab(wrap(h+1),m),lab(wrap(h-1),m),lab(wrap(h+6),m),lab(wrap(h+2),m)]);
    while(opts.size<4&&cands.length)opts.add(cands.shift());
    P.choices=shuffle([...opts]).map(v=>({v}));P.layout='txt';
    P.html=`<div class="prompt">What time is it?</div>${clockSVG(s.h,s.m)}`;P.seq=['time_q'];P.text='What time does the clock show?';P.label=`Clock ${P.ans}`;
    P.hint=s.m===0?'The short red hand points to the hour. The long blue hand on 12 means o\'clock (:00).':'The long blue hand on 6 means half past (:30). The short hand is between two numbers. Use the smaller one.';break;}
  case 'coin':{
    const C=id=>COINS.find(c=>c.id===id);
    if(s.k==='name'){const c=C(s.c);P.ans=c.name;P.choices=shuffle(COINS.map(x=>({v:x.name})));P.layout='txt';
      P.html=`<div class="prompt">What is this coin called?</div><div class="coins">${coinSVG(c)}</div>`;P.seq=['coin_name_q'];P.text='What is this coin called?';P.label=`Name the ${c.name.toLowerCase()}`;}
    else if(s.k==='which'){const c=C(s.c);P.ans=c.id;P.choices=shuffle(COINS.map(x=>({v:x.id,html:coinSVG(x)})));P.layout='coin';
      P.html=`<div class="prompt">Which coin is worth ${c.cents}¢?</div>`;P.seq=['coin_which','c'+c.cents];P.text=`Which coin is worth ${c.cents} cents?`;P.label=`Coin worth ${c.cents}¢`;}
    else{const total=s.c.reduce((t,id)=>t+C(id).cents,0);P.ans=total+'¢';
      const opts=new Set([total]);shuffle([total+1,total-1,total+5,total-5,total+10,total-10].filter(x=>x>0)).forEach(x=>{if(opts.size<4)opts.add(x)});
      P.choices=shuffle([...opts]).map(v=>({v:v+'¢'}));P.layout='txt';
      const sorted=[...s.c].sort((a,b)=>C(b).cents-C(a).cents);
      P.html=`<div class="prompt">How much money?</div><div class="coins">${sorted.map(id=>coinSVG(C(id))).join('')}</div>`;P.seq=['coin_total_q'];P.text='How much money is this?';P.label=`Count coins = ${total}¢`;}
    P.hint='Penny = 1¢, Nickel = 5¢, Dime = 10¢, Quarter = 25¢. Start with the biggest coin and count on.';break;}
  case 'place':{
    P.ans=s.tens*10+s.ones;
    const opts=new Set([P.ans]);shuffle([s.ones*10+s.tens,P.ans+10,P.ans-10,P.ans+1,P.ans-1].filter(x=>x>=0&&x!==P.ans)).forEach(x=>{if(opts.size<4)opts.add(x)});
    P.choices=shuffle([...opts]).map(v=>({v}));
    if(s.show){P.html=`<div class="prompt">What number do the blocks show?</div>${blocksHTML(s.tens,s.ones)}`;P.seq=['place_q'];P.text='What number do the blocks show?';}
    else{P.html=`<div class="prompt">What number has</div><div class="problem" style="font-size:clamp(40px,9vw,70px)">${s.tens} tens and ${s.ones} ones?</div>`;P.seq=['place_has',N(s.tens),'tens_and',N(s.ones),'ones_q'];P.text=`What number has ${s.tens} tens and ${s.ones} ones?`;}
    P.label=`${s.tens} tens ${s.ones} ones`;P.hint=`Each tall bar is a ten. Count by tens: ${Array.from({length:s.tens},(_,i)=>(i+1)*10).join(', ')}. Then count the ones.`;break;}
  case 'cmp':{
    if(s.ask==='sign'){P.ans=s.a>s.b?'>':s.a<s.b?'<':'=';P.choices=['>','<','='].map(v=>({v}));P.layout='three';
      P.html=`<div class="prompt">Pick the right sign</div><div class="cmp">${s.a} <span class="q">?</span> ${s.b}</div>`;P.seq=['compare_sign'];P.text='Pick the right sign. Greater than, less than, or equal to.';
      P.hint='The open mouth > or < always eats the bigger number. = means they are the same.';}
    else{P.ans=s.ask==='big'?Math.max(s.a,s.b):Math.min(s.a,s.b);P.choices=shuffle([s.a,s.b]).map(v=>({v}));P.layout='two';
      P.html=`<div class="prompt">Which number is ${s.ask==='big'?'BIGGER':'SMALLER'}?</div>`;P.seq=[s.ask==='big'?'compare_big':'compare_small'];P.text=`Which number is ${s.ask==='big'?'bigger':'smaller'}?`;
      P.hint='Look at the tens first. More tens means bigger.';}
    P.label=s.ask==='sign'?`${s.a} ? ${s.b}`:`${s.ask==='big'?'Bigger':'Smaller'}: ${s.a} or ${s.b}`;break;}
  case 'sight':{
    const w=s.w;P.ans=w;P.layout='txt';P.word=true;
    let pool=s.custom?[...SAVE.spell,...SIGHT]:SIGHT;pool=pool.filter(x=>x!==w&&(x[0]===w[0]||Math.abs(x.length-w.length)<=1));
    const d=shuffle([...new Set(pool)]).slice(0,3);while(d.length<3){const x=pick(SIGHT);if(x!==w&&!d.includes(x))d.push(x)}
    P.choices=shuffle([w,...d]).map(v=>({v}));
    P.html=`<div class="prompt">Listen, then tap the word you hear</div><button class="listen" data-hear>HEAR IT</button><button class="listen peek" data-peek>Peek</button><div class="problem word" id="peekWord" style="min-height:1.1em"></div>`;
    P.seq=['find_word',W(w),W(w)];P.text=`Find the word: ${w}. ${w}.`;P.label=`Read "${w}"`;P.again=[W(w)];P.againText=w;P.learn=w;break;}
  case 'spell':{
    const w=s.w;P.type='spell';P.ans=w;const e=ALL_PIC_WORDS.get(w);
    const extras=[];while(extras.length<s.x){const l=pick(ALPHA);if(!w.includes(l)&&!extras.includes(l))extras.push(l)}
    P.tiles=shuffle([...w,...extras]);
    P.html=`<div class="prompt">Spell the word</div>${e&&!s.custom?`<div class="pic">${e}</div>`:'<div class="pic">🔊</div>'}<button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['spell',W(w)];P.text=`Spell ${w}.`;P.label=`Spell "${w}"`;P.learn=w;break;}
  case 'miss':{
    const w=s.w,p=s.p,letter=w[p];P.ans=letter;P.layout='txt';P.word=true;P.full=w;
    const src='aeiou'.includes(letter)?'aeiou':'bcdfghjklmnprstvw';const o=new Set([letter]);while(o.size<4)o.add(pick(src));
    P.choices=shuffle([...o]).map(v=>({v}));
    P.html=`<div class="prompt">Which letter is missing?</div><div class="pic">${ALL_PIC_WORDS.get(w)||''}</div><div class="problem word" id="mword">${[...w].map((c,i)=>i===p?'<span class="blank"></span>':c).join('')}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['missing_q',W(w)];P.text=`Which letter is missing in ${w}?`;P.label=`Missing letter: ${w}`;P.again=[W(w)];P.againText=w;P.learn=w;break;}
  case 'rhyme':{
    const fam=RHYMES.find(f=>f.some(x=>x[0]===s.w));const others=shuffle(RHYMES.filter(f=>f!==fam).map(f=>pick(f))).slice(0,s.n-1);
    const ans=fam.find(x=>x[0]===s.a);P.ans=s.a;P.layout='pic';P.word=true;
    P.choices=shuffle([ans,...others]).map(([v,e])=>({v,html:`<span class="e">${e}</span>${v}`}));
    if(s.n===3)P.layout='pic three';
    P.html=`<div class="prompt">Which word rhymes with…</div><div class="pic">${ALL_PIC_WORDS.get(s.w)||''}</div><div class="problem word">${s.w}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['rhyme_q',W(s.w),...P.choices.map(c=>W(c.v))];P.gap=.25;P.text=`Which word rhymes with ${s.w}? ${P.choices.map(c=>c.v).join(', ')}.`;
    P.label=`Rhymes with "${s.w}"`;P.again=['rhyme_q',W(s.w)];P.againText=`Which word rhymes with ${s.w}?`;break;}
  case 'begin':{
    const w=s.w,l=w[0];P.ans=l;P.layout=s.n===3?'txt three':'txt';P.word=true;
    const o=new Set([l]);while(o.size<s.n)o.add(pick('bcdfghjklmnprstvw'));
    P.choices=shuffle([...o]).map(v=>({v}));
    P.html=`<div class="prompt">What letter does it start with?</div><div class="pic">${ALL_PIC_WORDS.get(w)}</div><div class="problem word"><span class="blank"></span>${w.slice(1)}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['begin_q',W(w)];P.text=`What letter does ${w} start with?`;P.label=`First letter: ${w}`;P.again=[W(w)];P.againText=w;P.full=w;P.fullId='mword2';break;}
  case 'team':{
    const it=TEAMS.find(x=>x[0]===s.w);const [w,e,tm]=it;P.ans=tm;P.layout=s.n===3?'txt three':'txt';P.word=true;
    const opts=s.n===3?['sh','ch','th']:['sh','ch','th','wh'];P.choices=opts.map(v=>({v}));
    const i=w.indexOf(tm);const shown=w.slice(0,i)+'<span class="blank" style="width:1.4em"></span>'+w.slice(i+2);
    P.html=`<div class="prompt">Which letter team do you hear?</div><div class="pic">${e}</div><div class="problem word">${shown}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['teams_q',W(w)];P.text=`Which letter team do you hear in ${w}?`;P.label=`Letter team: ${w}`;P.again=[W(w)];P.againText=w;break;}
  case 'water':{
    const it=WATER[s.m][s.i];const pre=PRE[s.m];P.ans=it.a;P.layout='long';
    P.choices=shuffle([it.a,...it.o]).map(v=>({v}));if(it.o.length===1)P.layout='long two';
    P.html=`<div class="qbox"><div class="pic">${it.pic}</div><div class="qtext">${it.q}</div></div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=[pre+s.i];P.text=it.q.replace('…',' blank.');P.hint=it.h;P.hintSeq=[pre+'h'+s.i];P.label=it.q.length>38?it.q.slice(0,36)+'…':it.q;break;}
  case 'wstory':{
    const step=s.s,ans=STORY[step];P.ans=ans;P.layout='long';
    const later=STORY.filter((x,i)=>i>step);const o=new Set([ans]);if(later.length)o.add(pick(later));while(o.size<3)o.add(pick(STORY_WRONG));
    P.choices=shuffle([...o]).map(v=>({v}));
    P.html=`<div class="prompt">${step===0?'How does the water cycle start?':'What happens next?'}</div>${step?`<ol class="story">${STORY.slice(0,step).map(x=>`<li>${x}</li>`).join('')}</ol>`:''}<button class="listen" data-hear>HEAR IT</button>`;
    P.seq=[step===0?'story_start':'story_next'];P.text=step===0?'How does the water cycle start?':'What happens next?';
    P.hint=['The sun powers the water cycle.','Evaporation comes after the sun heats the water.','Condensation makes clouds.','Precipitation is rain, snow, sleet, or hail.','The water cycle never ends.'][step];P.hintSeq=['sh'+step];
    P.label=`Water cycle step ${step+1}`;P.correctSeq=['story'+step];break;}
  case 'say':{P.type='say';P.seq=['say_prompt'];P.text='Tell me how the water cycle works! Tap the microphone and start talking.';P.label='Explain the water cycle';break;}
  case 'empty':{P.type='empty';P.seq=['mylist_empty'];P.text='Ask a grown-up to add your spelling words.';P.label='';break;}
  }
  return P;
}
function worldOfSpec(s){
  if(['arith','story','time','coin','place','cmp'].includes(s.t))return 'math';
  if(['water','wstory','say'].includes(s.t))return 'water';
  return 'word';
}

/* ================= v4 problems ================= */
Object.assign(GEN,{
  skip(L){
    const step=L===1?10:L===2?5:pick([2,5,10]);const n=5;
    const maxStart=Math.max(0,Math.floor((100-step*(n-1))/step));
    const st=L===1?step*rnd(0,5):L===2?step*rnd(0,Math.min(10,maxStart)):step*rnd(0,Math.min(L===3&&step===2?20:8,maxStart));
    const miss=L===1?n-1:rnd(1,n-1);return{t:'skip',st,step,n,miss};},
  nline(L){
    if(L===3){let at=10*rnd(1,9);if(at===50)at=40;return{t:'nline',min:0,max:100,step:10,lab:50,at};}
    const max=L===1?10:20;let at=rnd(1,max-1);while(at%5===0)at=rnd(1,max-1);return{t:'nline',min:0,max,step:1,lab:5,at};},
  shapes(L){
    const list=SHAPES.filter(s=>s.lv<=L);const sh=fresh(list,s=>s.id);
    const ask=!sh.solid&&sh.sides&&L>=2&&Math.random()<.5?'sides':'name';return{t:'shape',id:sh.id,ask};},
  measure(L){
    if(L===1){let a=rnd(3,11),b=rnd(3,11);while(Math.abs(a-b)<2)b=rnd(3,11);return{t:'measure',k:pick(['long','short']),a,b};}
    return{t:'measure',k:'units',a:rnd(2,L===2?6:10)};},
  doubles(L){
    if(L===3&&Math.random()<.5){const a=rnd(2,9);return{t:'arith',k:'+',a,b:a+1,dbl:1};}
    const a=rnd(1,L===1?5:10);return{t:'arith',k:'+',a,b:a,dbl:1};},
  ffam(L){const max=L===1?10:20;const a=rnd(1,Math.min(9,max-2)),b=rnd(1,Math.min(10,max-a));return{t:'ffam',a,b,q:L===3?pick(['sub','sub2','swap']):pick(['sub','sub2'])};},
  tracen(L){return{t:'trace',k:'n',g:L===3?String(rnd(10,20)):String(rnd(0,9))};},
  tracel(L){const g=L===1?pick('LTIEFHOCUVXZ'.split('')):L===2?pick('aceimnorsuvwxz'.split('')):pick(ALPHA.split(''));return{t:'trace',k:'l',g};},
  sentence(L){const pool=SENTENCES.map((s,i)=>i).filter(i=>L>1||SENTENCES[i].m==='.');return{t:'sent',i:fresh(pool,i=>'s'+i)};}
});
const _mix=GEN.mix,_wmix=GEN.wordmix;
GEN.mix=L=>{const m=pick(['add10','add20','sub10','story','time','coins','place','compare','skip','nline','shapes','measure','doubles','ffam']);return GEN[m](L);};
GEN.wordmix=L=>{const m=pick(['sight','spell','missing','rhyme','begin','teams','sentence']);return GEN[m](L);};
BOSS_POOL.math.push('skip','nline','shapes','measure','doubles','ffam');BOSS_POOL.word.push('sentence');

const _build=build;
build=function(s){
  const P={spec:s,type:'choice',layout:'',seq:[],text:'',hint:'',hintSeq:null};
  switch(s.t){
  case 'skip':{
    const vals=Array.from({length:s.n},(_,i)=>s.st+i*s.step);P.ans=vals[s.miss];
    const o=new Set([P.ans]);shuffle([P.ans+s.step,P.ans-s.step,P.ans+1,P.ans-1,P.ans+2*s.step].filter(x=>x>=0&&x<=100&&x!==P.ans)).forEach(x=>{if(o.size<4)o.add(x)});
    P.choices=shuffle([...o]).map(v=>({v}));
    P.html=`<div class="prompt">Count by ${s.step}s</div><div class="skiprow">${vals.map((v,i)=>i===s.miss?'<span class="sk q">?</span>':`<span class="sk">${v}</span>`).join('')}</div>`;
    const ask=s.miss===s.n-1?'skip_next':'skip_missing';
    P.seq=[...vals.map((v,i)=>i===s.miss?null:N(v)).filter(Boolean),ask];P.gap=.18;
    P.text=`${vals.map((v,i)=>i===s.miss?'blank':v).join(', ')}. ${s.miss===s.n-1?'What number comes next?':'Which number is missing?'}`;
    P.label=`Count by ${s.step}s: ${vals.map((v,i)=>i===s.miss?'?':v).join(', ')}`;P.hint=`Each number is ${s.step} more than the one before it.`;break;}
  case 'nline':{
    P.ans=s.at;P.choices=numChoices(s.at,s.max).map(c=>({v:s.max===100?Math.round(c.v/10)*10||10:c.v}));
    const uniq=[...new Set(P.choices.map(c=>c.v))];while(uniq.length<4){const x=s.max===100?10*rnd(1,9):rnd(1,s.max-1);if(!uniq.includes(x))uniq.push(x);}
    if(!uniq.includes(s.at))uniq[0]=s.at;P.choices=shuffle(uniq).map(v=>({v}));
    P.html=`<div class="prompt">What number is the arrow pointing to?</div>${numberLineSVG(s.min,s.max,s.step,s.at,s.lab)}`;
    P.seq=['nline_q'];P.text='What number is the arrow pointing to?';P.label=`Number line: arrow at ${s.at}`;
    P.hint=s.max===100?'Each mark is 10 more. Count by tens from 0.':'Find a number you know, like 5 or 10, then count the marks.';break;}
  case 'shape':{
    const sh=SHAPES.find(x=>x.id===s.id);
    if(s.ask==='sides'){P.ans=sh.sides;P.choices=shuffle([3,4,5,6]).map(v=>({v}));P.seq=['sides_q'];P.text='How many sides does this shape have?';
      P.html=`<div class="prompt">How many sides?</div><div class="shapebox">${shapeSVG(sh.id)}</div>`;P.label=`Sides of a ${sh.name.toLowerCase()}`;P.hint='Touch and count each straight side.';}
    else{P.ans=sh.name;const clash={square:'rectangle',rectangle:'square',circle:'oval',oval:'circle'};const same=SHAPES.filter(x=>x.id!==sh.id&&x.id!==clash[sh.id]&&!!x.solid===!!sh.solid);P.choices=shuffle([sh,...shuffle(same).slice(0,3)]).map(x=>({v:x.name}));P.layout='txt';
      P.html=`<div class="prompt">What shape is this?</div><div class="shapebox">${shapeSVG(sh.id)}</div>`;P.seq=['shape_q'];P.text='What shape is this?';P.label=`Name the ${sh.name.toLowerCase()}`;
      P.hint={circle:'Round with no corners.',oval:'Like a stretched circle, egg-shaped.',square:'4 sides that are all the same length.',rectangle:'4 sides: 2 long and 2 short.',triangle:'3 sides and 3 corners.',hexagon:'6 sides, like a honeycomb.',pentagon:'5 sides, like a house shape.',cube:'Like a block or a box with square faces.',sphere:'Round like a ball.',cone:'Like an ice cream cone or a party hat.',cylinder:'Like a can of soup.'}[sh.id];}
    P.again=['sh_'+sh.id];P.againText=sh.name;break;}
  case 'measure':{
    if(s.k==='units'){P.ans=s.a;P.choices=numChoices(s.a,12).map(c=>({v:Math.max(1,c.v)}));P.choices=[...new Map(P.choices.map(c=>[c.v,c])).values()];while(P.choices.length<4){const x=rnd(1,12);if(!P.choices.some(c=>c.v===x))P.choices.push({v:x});}P.choices=shuffle(P.choices);
      P.html=`<div class="prompt">How many cubes long is the pencil?</div><div class="mbox">${pencilSVG(s.a,'#ffd23f',48,true)}</div>`;P.seq=['measure_units'];P.text='How many cubes long is the pencil?';P.label=`Pencil ${s.a} cubes long`;P.hint='Count the cubes under the pencil from one end to the other.';}
    else{const longer=s.a>s.b?'A':'B';P.ans=s.k==='long'?longer:(longer==='A'?'B':'A');P.choices=[{v:'A'},{v:'B'}];P.layout='two';
      P.html=`<div class="prompt">Which pencil is ${s.k==='long'?'LONGER':'SHORTER'}?</div><div class="mbox"><div class="mrow"><b>A</b>${pencilSVG(s.a,'#e63946',40)}</div><div class="mrow"><b>B</b>${pencilSVG(s.b,'#2a9df4',40)}</div></div>`;
      P.seq=[s.k==='long'?'measure_long':'measure_short'];P.text=`Which one is ${s.k==='long'?'longer':'shorter'}?`;P.label=`Which pencil is ${s.k==='long'?'longer':'shorter'}`;P.hint='Line up the ends. The one that sticks out farther is longer.';}
    break;}
  case 'ffam':{
    const {a,b}=s,c=a+b;let eq,ans,seq;
    if(s.q==='sub'){eq=`${c} − ${b} = <span class="q">?</span>`;ans=a;seq=[N(c),'take_away',N(b),'equals_what'];}
    else if(s.q==='sub2'){eq=`${c} − ${a} = <span class="q">?</span>`;ans=b;seq=[N(c),'take_away',N(a),'equals_what'];}
    else{eq=`${b} + ${a} = <span class="q">?</span>`;ans=c;seq=[N(b),'plus',N(a),'equals_what'];}
    P.ans=ans;P.choices=numChoices(ans);
    P.html=`<div class="prompt">Fact family</div><div class="ffam"><svg viewBox="0 0 160 120" width="150" aria-hidden="true"><polygon points="80,8 150,112 10,112" fill="#fff7d6" stroke="#14142b" stroke-width="5" stroke-linejoin="round"/>
      <text x="80" y="52" text-anchor="middle" font-family="Bangers" font-size="30" fill="#e63946">${c}</text><text x="45" y="100" text-anchor="middle" font-family="Bangers" font-size="28">${a}</text><text x="115" y="100" text-anchor="middle" font-family="Bangers" font-size="28">${b}</text></svg>
      <div><div class="problem small">${a} + ${b} = ${c}</div><div class="problem small">so ${eq}</div></div></div>`;
    P.seq=[N(a),'plus',N(b),'equals',N(c),'so',...seq];P.gap=.08;P.text=`${a} plus ${b} equals ${c}. So ${eq.replace(/<[^>]+>\?<\/span>/,'what').replace('−','minus')}?`;
    P.label=`${a}, ${b}, ${c} family: ${eq.replace(/<[^>]+>/g,'').replace('?','?')}`;P.hint=`The same three numbers, ${a}, ${b}, and ${c}, make every fact in the family.`;break;}
  case 'trace':{
    P.type='trace';P.ans=s.g;const isL=s.k==='l';
    P.html=`<div class="prompt">Trace the ${isL?'letter':'number'} <b class="tg">${s.g}</b></div><div id="traceBox"></div>`;
    const nk=isL?['l_'+s.g.toLowerCase()]:(+s.g<=100?[N(+s.g)]:[]);
    P.seq=[isL?'trace_letter':'trace_number',...nk,'trace_start'];P.text=`Trace the ${isL?'letter':'number'} ${s.g}. Start at the green dot.`;
    P.label=`Trace ${isL?'letter':'number'} ${s.g}`;break;}
  case 'sent':{
    const se=SENTENCES[s.i];P.type='sentence';P.ans=se.w.join(' ');P.words=se.w;P.mark=se.m;P.e=se.e;
    P.html=`<div class="prompt">Build the sentence</div><div class="pic">${se.e}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['build_sentence','sent'+s.i];P.gap=.3;const full=se.w.join(' ');P.full=full[0].toUpperCase()+full.slice(1)+se.m;
    P.text='Put the words in order to make a sentence. '+P.full;P.label=`Sentence: ${P.full}`;break;}
  case 'read':{
    const r=READS[s.i];P.type='read';P.ans='read';
    P.html=`<div class="prompt">${r.title}</div><img class="comic" src="img/story-${s.i}.webp" alt="Comic: ${r.title}">
      <ol class="captions">${r.p.map((t,j)=>`<li data-cap="${j}"><span class="pn">${j+1}</span><span>${t.split(' ').map(w=>`<span class="rw" data-w="${w.replace(/[^A-Za-z']/g,'').toLowerCase()}">${w}</span>`).join(' ')}</span></li>`).join('')}</ol>
      <div class="btnrow" style="justify-content:center"><button class="listen" data-readall>READ TO ME</button><button class="btn" data-readdone>I read it! Questions →</button></div>`;
    P.seq=['rd'+s.i+'_t','read_prompt'];P.text=r.title+'. Let\'s read the story! Tap any word to hear it.';P.label=`Read: ${r.title}`;break;}
  case 'rq':{
    const r=READS[s.i],q=r.q[s.j];P.ans=q.a;P.layout='long';P.choices=shuffle([q.a,...q.o]).map(v=>({v}));
    P.html=`<div class="qbox"><img class="comic thumb" src="img/story-${s.i}.webp" alt=""><div class="qtext">${q.q}</div></div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['rd'+s.i+'_q'+s.j];P.text=q.q;P.hint=`Look back at the story: "${r.p[s.j]}"`;P.hintSeq=['rd'+s.i+'_p'+s.j];P.label=`${r.title}: ${q.q}`;break;}
  default:{
    const B=_build(s);
    if(s.dbl){B.hintSeq=['doubles_hint'];B.hint='Doubles! Add the number to itself.';B.label='Doubles: '+B.label;}
    return B;}
  }
  return P;
};
const _wos=worldOfSpec;
worldOfSpec=function(s){
  if(['skip','nline','shape','measure','ffam'].includes(s.t))return 'math';
  if(s.t==='trace')return s.k==='n'?'math':'word';
  if(['sent','read','rq'].includes(s.t))return 'word';
  return _wos(s);
};
