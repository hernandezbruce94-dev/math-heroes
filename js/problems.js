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
