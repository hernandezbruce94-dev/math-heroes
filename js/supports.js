/* ================= v6: learning-plan supports =================
   Goal tracker, fluency + letter-speed checks, mission plan + token board, nudges, math tools,
   regrouping, story order, who/what/why, spelling by sound, letter-formation guides, test countdown. */

/* ---------- skills tracked for the goal chart ---------- */
const SKILLS={snd:'Counting sounds',dec:'Reading real words',aln:'Reading made-up words',bln:'Blends',sil:'Silent letters',syl:'Syllables',
  enc:'Spelling by sound',lsnd:'Letter sounds and rhymes',flp:'b/d and reversals',spell:'Spelling words',sight:'Sight words',comp:'Understanding stories',
  math:'Math',rgp:'Regrouping',econ:'Goods, services and resources'};
const PHONICS=['snd','dec','aln','bln','sil','syl','enc','lsnd'];
function skillOf(s){if(!s)return null;const t=s.t;
  if(['snd','dec','aln','bln','sil','syl','enc','flp','rgp'].includes(t))return t;
  if(['miss','begin','team','rhyme'].includes(t))return 'lsnd';
  if(['egs','epc','eres','emake','efill','edef','ematch'].includes(t))return 'econ';
  if(t==='spell')return 'spell';if(t==='sight')return 'sight';
  if(['rq','lq','www','seq'].includes(t))return 'comp';
  if(['arith','story','time','coin','place','cmp','skip','nline','shape','measure','ffam'].includes(t))return 'math';
  return null;}
const monthStr=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
function logSkill(spec,firstTry){const k=skillOf(spec);if(!k)return;SAVE.sk=SAVE.sk||{};const m=monthStr();
  const s=SAVE.sk[k]=SAVE.sk[k]||{};const v=s[m]=s[m]||[0,0];v[1]++;if(firstTry)v[0]++;}

/* ---------- new content ---------- */
const FLU=[
  {t:'Bolt and the Bus',x:'Captain Bolt sat on a big red bus. The bus went up a hill. Then it went down fast. A cat ran in the street. The bus had to stop! Bolt got off the bus. He held the cat and set it on the grass. The kids on the bus clapped. Bolt waved and got back on.'},
  {t:'The Frog Pond',x:'Max and Liz went to the pond. A frog sat on a log. It had big eyes and long legs. Max said, "Look at the frog!" The frog did a big jump. Splash! It swam to the end of the pond. Liz and Max ran to see it. The frog sat on a rock in the sun.'},
  {t:'A Strong Wind',x:'The wind was strong. It made the trees bend. Jen held her red hat. The wind got the hat! It went up and up. Jen ran and ran. The hat fell on a bush. Jen got it and put it back on. She went home and had a hot drink.'},
  {t:'The Lost Pup',x:'Ned had a pup named Spot. One day Spot ran off. Ned looked in the shed. He looked in the tent. Then he heard a yip. Spot was in a box in the back yard! He had a stick and a sock. Ned hugged Spot. Spot licked Ned on the chin.'}
];
const WWW=[
  {k:'who',e:'🦸📖',x:'Captain Bolt is reading a book.',q:'Who is reading?',a:['Captain Bolt','🦸'],o:[['a dog','🐶'],['a fish','🐟']]},
  {k:'what',e:'🦸📖',x:'Captain Bolt is reading a book.',q:'What is Captain Bolt doing?',a:['reading','📖'],o:[['swimming','🏊'],['sleeping','😴']]},
  {k:'who',e:'🐶⚽',x:'The dog kicks the ball.',q:'Who kicks the ball?',a:['the dog','🐶'],o:[['the cat','🐱'],['the frog','🐸']]},
  {k:'what',e:'🐶⚽',x:'The dog kicks the ball.',q:'What is the dog doing?',a:['kicking a ball','⚽'],o:[['eating','🍽️'],['sleeping','😴']]},
  {k:'who',e:'👧🎨',x:'Liz paints a picture.',q:'Who paints a picture?',a:['Liz','👧'],o:[['Max','👦'],['a hen','🐔']]},
  {k:'what',e:'👧🎨',x:'Liz paints a picture.',q:'What is Liz doing?',a:['painting','🎨'],o:[['running','🏃'],['reading','📖']]},
  {k:'who',e:'🐱😴',x:'The cat sleeps on the bed.',q:'Who is sleeping?',a:['the cat','🐱'],o:[['the pig','🐷'],['the bus','🚌']]},
  {k:'what',e:'👦🚲',x:'Max rides his bike to the park.',q:'What is Max doing?',a:['riding a bike','🚲'],o:[['swimming','🏊'],['painting','🎨']]},
  {k:'what',e:'🦆🏊',x:'The duck swims in the pond.',q:'What is the duck doing?',a:['swimming','🏊'],o:[['flying a kite','🪁'],['eating cake','🍰']]},
  {k:'why',e:'👦🧥❄️',x:'It was cold and snowy. Max put on his coat.',q:'Why did Max put on his coat?',a:['It was cold','🥶'],o:[['It was hot','🥵'],['He was hungry','🍕']]},
  {k:'why',e:'👧🍎',x:'Jen was hungry. She ate an apple.',q:'Why did Jen eat an apple?',a:['She was hungry','😋'],o:[['She was sleepy','😴'],['She was cold','🥶']]},
  {k:'why',e:'🐶🛁',x:'Spot rolled in the mud. Ned gave him a bath.',q:'Why did Spot need a bath?',a:['He was muddy','🟫'],o:[['He was hungry','🍖'],['It was his birthday','🎂']]},
  {k:'why',e:'👦☂️🌧️',x:'It started to rain. Sam opened his umbrella.',q:'Why did Sam open his umbrella?',a:['It was raining','🌧️'],o:[['It was dark','🌙'],['He was sad','😢']]},
  {k:'why',e:'🦸🐱🌳',x:'A cat was stuck in a tree. Captain Bolt flew up to help.',q:'Why did Captain Bolt fly up the tree?',a:['To help the cat','🐱'],o:[['To get an apple','🍎'],['To take a nap','😴']]},
  {k:'why',e:'👧😴🌙',x:'It was late at night. Liz went to bed.',q:'Why did Liz go to bed?',a:['It was late','🌙'],o:[['It was lunch time','🥪'],['She was wet','💧']]},
  {k:'why',e:'👦🏆😀',x:'Max won the race. He jumped and cheered.',q:'Why did Max cheer?',a:['He won the race','🏆'],o:[['He lost his hat','🎩'],['He was sick','🤒']]}
];
const SEQS=[
  {t:'Making a sandwich',s:[['Get two slices of bread.','🍞'],['Spread the jam.','🍓'],['Eat the sandwich.','🥪']]},
  {t:'Planting a seed',s:[['Put a seed in the dirt.','🌰'],['Give it water.','💧'],['A plant grows.','🌱']]},
  {t:'Getting ready for bed',s:[['Put on pajamas.','👕'],['Brush your teeth.','🪥'],['Go to sleep.','😴']]},
  {t:'Rain',s:[['Clouds fill the sky.','☁️'],['Rain falls down.','🌧️'],['There are puddles.','💦']]},
  {t:'A hero rescue',s:[['A cat gets stuck in a tree.','🌳'],['Captain Bolt flies up.','🦸'],['The cat is safe.','🐱']]},
  {t:'Baking a cake',s:[['Mix the batter.','🥣'],['Bake it in the oven.','🔥'],['Eat the cake.','🍰']]},
  {t:'Building a snowman',s:[['Roll a big snowball.','⚪'],['Stack the snowballs.','⛄'],['Add a hat and a nose.','🥕']]},
  {t:'A chick hatches',s:[['There is an egg.','🥚'],['The egg cracks.','🐣'],['A chick comes out.','🐥']]}
];
/* how to write it: SVG paths (viewBox 0 0 100 140), drawn in order with an arrow at the start */
const STROKES={
  '0':['M50 20C20 20 18 120 50 120C82 120 80 20 50 20'],
  '1':['M38 34L54 20L54 120'],
  '2':['M24 44C24 14 78 14 76 46C74 70 34 96 22 120L80 120'],
  '3':['M26 30C40 12 78 16 74 44C72 62 52 66 44 68C60 68 80 76 78 98C76 126 34 128 22 108'],
  '4':['M62 20L20 90L84 90','M62 50L62 122'],
  '5':['M76 20L32 20L28 64C48 52 80 58 78 90C76 122 36 126 22 106'],
  '6':['M72 24C40 10 22 50 24 88C26 126 78 128 78 92C78 60 34 62 26 92'],
  '7':['M22 20L80 20L40 122'],
  '8':['M50 68C24 60 24 20 50 20C76 20 76 60 50 68C20 76 20 120 50 120C80 120 80 76 50 68'],
  '9':['M76 50C76 14 24 14 24 48C24 80 76 82 76 50L76 122'],
  'b':['M30 14L30 124','M30 96C30 62 78 62 78 96C78 130 30 130 30 96'],
  'd':['M70 14L70 124','M70 96C70 62 22 62 22 96C22 130 70 130 70 96'],
  'p':['M30 62L30 136','M30 82C30 52 78 52 78 82C78 114 30 114 30 82'],
  'q':['M70 62L70 136','M70 82C70 52 22 52 22 82C22 114 70 114 70 82']
};
function strokeSVG(g){const ps=STROKES[g];if(!ps)return '';
  return `<svg class="strokesvg" viewBox="0 0 100 140" aria-label="How to write ${g}">${ps.map((d,i)=>`<path d="${d}" class="ghost"/>`).join('')}
  ${ps.map((d,i)=>`<path d="${d}" class="ink" style="animation-delay:${i*1.4}s"/>`).join('')}
  ${ps.map((d,i)=>{const m=d.match(/M\s*([\d.]+)\s+([\d.]+)/);return m?`<circle cx="${m[1]}" cy="${m[2]}" r="6" class="startdot"/><text x="${+m[1]+9}" y="${+m[2]-6}" class="stepnum">${i+1}</text>`:'';}).join('')}</svg>`;}

/* ---------- generators ---------- */
Object.assign(GEN,{
  regroup(L){if(L===1){const t=rnd(1,4),o=rnd(10,16);return{t:'rgp',k:'trade',a:t,b:o};}
    if(L===2){const ao=rnd(3,9),bo=rnd(10-ao,9);return{t:'rgp',k:'add',a:rnd(1,4)*10+ao,b:bo};}
    const ao=rnd(3,9),bo=rnd(10-ao,9);return{t:'rgp',k:'add',a:rnd(1,4)*10+ao,b:rnd(1,3)*10+bo};},
  enc(L){const pool=byLv(LAB_WORDS.filter(x=>!x.ch.includes('e')||x.ch[x.ch.length-1]!=='e'),L);return{t:'enc',w:fresh(pool,x=>x.w).w};},
  seq(L){const i=SEQS.indexOf(fresh(SEQS,x=>x.t));return{t:'seq',i};},
  www(L){const pool=WWW.map((x,i)=>i).filter(i=>L>1||WWW[i].k!=='why');return{t:'www',i:fresh(pool,i=>'w'+i)};}
});
MODES.math.splice(MODES.math.findIndex(m=>m.id==='mix'),0,{id:'regroup',name:'Trade Ten',desc:'Regrouping with blocks'});
const _labmixAt=MODES.lab.findIndex(m=>m.id==='labmix');
MODES.lab.splice(_labmixAt,0,{id:'enc',name:'Sound Spelling',desc:'Spell it one sound at a time'},{id:'seq',name:'Story Order',desc:'First, next, last'},
  {id:'www',name:'Who, What, Why',desc:'Picture questions'},{id:'flu',name:'Fluency Check',desc:'Weekly 1-minute read'},{id:'ran',name:'Letter Speed',desc:'Name letters fast'});
BOSS_POOL.math.push('regroup');BOSS_POOL.lab.push('enc','www');
const _labmix6=GEN.labmix;GEN.labmix=L=>Math.random()<.3?GEN[pick(['enc','www','seq'])](L):_labmix6(L);
const _mix6=GEN.mix;GEN.mix=L=>Math.random()<.08?GEN.regroup(L):_mix6(L);

/* ---------- builders ---------- */
const _build6=build;
build=function(s){
  const P={spec:s,type:'choice',layout:'',seq:[],text:'',hint:'',hintSeq:null};
  const bad=()=>_build6(GEN.labmix(1));
  switch(s.t){
  case 'rgp':{const a=SAFE.num(s.a,0,99),b=SAFE.num(s.b,0,99);
    if(s.k==='trade'){P.ans=a*10+b;P.choices=numChoices(P.ans,99).map(c=>({v:c.v}));
      P.html=`<div class="prompt">Trade 10 ones for 1 ten. What number is it?</div><div class="rgpwrap" id="rgpBlocks">${blocksHTML(a,b)}</div><div class="tiny">${a} tens and ${b} ones</div>`;
      P.seq=['rgp_trade_q',N(a),'tens_and',N(b),'ones_q'];P.text=`Trade 10 ones for 1 ten. What number has ${a} tens and ${b} ones?`;P.label=`${a} tens ${b} ones`;
      P.onRight=()=>{const el=$('rgpBlocks');if(el){el.innerHTML=blocksHTML(a+1,b-10);el.classList.add('traded');}};
      P.hint=`Count 10 of the ones. They make 1 more ten. ${a} tens plus 1 ten is ${a+1} tens.`;}
    else{P.ans=a+b;P.choices=numChoices(P.ans,99);
      P.html=`<div class="problem small">${a} + ${b} = <span class="q">?</span></div><div class="rgpwrap two" id="rgpBlocks"><div>${blocksHTML(Math.floor(a/10),a%10)}</div><span class="op">+</span><div>${blocksHTML(Math.floor(b/10),b%10)}</div></div>`;
      P.seq=['what_is',N(a),'plus',N(b)];P.text=`What is ${a} plus ${b}?`;P.label=`${a} + ${b} (regroup)`;
      const t=Math.floor(a/10)+Math.floor(b/10),o=a%10+b%10;
      P.onRight=()=>{const el=$('rgpBlocks');if(el){el.className='rgpwrap traded';el.innerHTML=blocksHTML(t+Math.floor(o/10),o%10);}};
      P.hint=`Put the ones together: ${a%10} + ${b%10} = ${o}. Trade 10 ones for a ten. Then count the tens.`;}
    break;}
  case 'enc':{const x=labWord(s.w);if(!x)return bad();P.type='enc';P.ans=x.w;P.word=x;
    const extra=shuffle(['a','e','i','o','u','sh','ch','th','ck','s','t','p','b','d','m','n','r','l'].filter(c=>!x.ch.includes(c))).slice(0,3);
    P.tiles=shuffle([...x.ch,...extra]);
    P.html=`<div class="prompt">Spell it one sound at a time</div><div class="pic">${x.e}</div><button class="listen" data-hear>HEAR IT</button>
      <div class="sboxes enc" id="encBoxes">${x.ch.map((c,i)=>`<span class="sbx" data-i="${i}"></span>`).join('')}</div><div class="chunks enctiles" id="encTiles">${P.tiles.map((c,i)=>`<button class="chunk" data-ti="${i}">${c}</button>`).join('')}</div>`;
    P.seq=['enc_q',W(x.w),W(x.w)];P.gap=.35;P.text=`Spell ${x.w}, one sound at a time. ${x.w}.`;P.label=`Sound spelling: ${x.w}`;P.learn=x.w;break;}
  case 'seq':{const q=SEQS[s.i];if(!q)return bad();P.type='seq';P.ans='order';P.items=q.s;
    const order=shuffle(q.s.map((_,i)=>i));
    P.html=`<div class="prompt">${q.t}: tap what happens first, next, and last</div><div class="seqcards" id="seqCards">${order.map(i=>`<button class="seqcard" data-si="${i}"><span class="e">${q.s[i][1]}</span><span class="st">${q.s[i][0]}</span><b class="num"></b></button>`).join('')}</div>`;
    P.seq=['seq_q'];P.text='Tap what happens first, next, and last.';P.label=`Story order: ${q.t}`;break;}
  case 'www':{const q=WWW[s.i];if(!q)return bad();P.ans=q.a[0];P.layout='pic three';
    P.choices=shuffle([q.a,...q.o]).map(([v,e])=>({v,html:`<span class="e">${e}</span>${v}`}));
    P.html=`<div class="pic">${q.e}</div><div class="qtext big">${q.x}</div><div class="prompt wq">${q.q}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=[textKey('wx_',q.x),textKey('wq_',q.q)];P.gap=.5;P.text=`${q.x} ${q.q}`;P.label=`${q.k}: ${q.q}`;break;}
  case 'flu':{const q=FLU[s.i];if(!q)return bad();P.type='flu';P.ans='done';
    const words=q.x.split(' ');
    P.html=`<div class="prompt">Fluency Check: ${q.t}</div>
      <div class="flunote" id="fluNote">Grown-up: tap <b>Start</b>, then have your child read out loud for 1 minute. Tap any word read wrong or skipped. When time is up, tap the last word read.</div>
      <div class="flutext" id="fluText">${words.map((w,i)=>`<span class="fw" data-fi="${i}">${w}</span>`).join(' ')}</div>
      <div class="btnrow" style="justify-content:center;align-items:center"><span class="fluclock" id="fluClock">1:00</span><button class="btn" id="fluStart">Start</button><button class="btn ghost" id="fluStop" disabled>Finished early</button></div>`;
    P.seq=['flu_q'];P.text='Fluency check! Read the story out loud. A grown-up will help.';P.label=`Fluency: ${q.t}`;break;}
  case 'ran':{P.type='ran';P.ans='done';
    P.html=`<div class="prompt">Letter Speed: say each letter out loud!</div>
      <div class="flunote">Grown-up: tap <b>Start</b>. Tap ✓ when your child names the letter right, ✗ if not. It runs for 1 minute.</div>
      <div class="ranletter" id="ranL">?</div>
      <div class="btnrow" style="justify-content:center;align-items:center"><span class="fluclock" id="ranClock">1:00</span><button class="btn" id="ranStart">Start</button></div>
      <div class="btnrow" style="justify-content:center"><button class="btn green big" id="ranOk" disabled aria-label="Right">✓</button><button class="btn red big" id="ranNo" disabled aria-label="Missed">✗</button></div>`;
    P.seq=['ran_q'];P.text='Letter speed! Say each letter out loud, as fast as you can.';P.label='Letter speed';break;}
  default:return _build6(s);
  }
  return P;
};
const _wos6=worldOfSpec;
worldOfSpec=function(s){if(s.t==='rgp')return 'math';if(['enc','seq','www','flu','ran'].includes(s.t))return 'lab';return _wos6(s);};
const _cs6=choiceSpeech;
choiceSpeech=function(P,c){if(P.spec.t==='www')return {seq:[textKey('ch_',c.v)],text:String(c.v)};return _cs6(P,c);};
Object.assign(HELP,{
  rgp:[{v:()=>`<div class="rgpwrap">${blocksHTML(2,12)}</div><div class="problem small hx">2 tens 12 ones = 3 tens 2 ones = 32</div>`,
    s:["When you have 10 or more ones, trade 10 ones for 1 ten.","Here there are 2 tens and 12 ones.","Count 10 ones and trade them for a ten. Now there are 3 tens and 2 ones.","3 tens and 2 ones make 32."]}],
  enc:[{v:()=>`<div class="pic">🚢</div><div class="sboxes"><span class="sbx f">sh</span><span class="sbx f">i</span><span class="sbx f">p</span></div>`,
    s:["Say the word slowly and listen for each sound.","Ship. The first sound is S H. The middle sound is I. The last sound is P.","Put one sound in each box, in order."]}],
  seq:[{v:()=>`<div class="seqcards help"><div class="seqcard"><span class="e">🥚</span><b class="num">1</b></div><div class="seqcard"><span class="e">🐣</span><b class="num">2</b></div><div class="seqcard"><span class="e">🐥</span><b class="num">3</b></div></div>`,
    s:["Think about what has to happen first.","First there is an egg. Next the egg cracks. Last a chick comes out.","Ask yourself: what happens before this? What happens after?"]}],
  www:[{v:()=>`<div class="teamguide"><div><b>Who</b> = a person or animal</div><div><b>What</b> = what they are doing</div><div><b>Why</b> = the reason</div></div>`,
    s:["Who means a person or an animal.","What doing means the action, like running or reading.","Why means the reason. Listen for words like because, or what happened first.","Look at the picture and listen to the sentence again."]}]
});
const _hid6=helpId;
helpId=function(P){const t=P.spec&&P.spec.t;if(['rgp','enc','seq','www'].includes(t))return t;if(t==='flu'||t==='ran')return null;return _hid6(P);};

/* ---------- custom question types ---------- */
let encPos=0,encMiss=0;
function wireEnc(){encPos=0;encMiss=0;const x=current.word;
  $('encTiles').querySelectorAll('[data-ti]').forEach(b=>b.onclick=()=>{if(G.busy||b.disabled)return;const c=b.textContent;const [k,t]=chunkSay(c);
    if(c===x.ch[encPos]){b.disabled=true;const box=$('encBoxes').children[encPos];box.textContent=c;box.classList.add('f');encPos++;say([k],t);
      if(encPos>=x.ch.length){G.busy=true;setTimeout(()=>say([W(x.w)],x.w),500);setTimeout(()=>correct({seq:[W(x.w)],text:x.w}),1100);}}
    else{b.classList.add('nope');setTimeout(()=>b.classList.remove('nope'),500);encMiss++;miss(c,{msg:'Listen again. Which sound comes next?',seq:['try0',W(x.w)]});
      if(encMiss>=2){const want=[...$('encTiles').children].find(t=>!t.disabled&&t.textContent===x.ch[encPos]);if(want){want.classList.add('lit');}}}});}
let seqPos=0;
function wireSeq(){seqPos=0;const P=current;
  $('seqCards').querySelectorAll('[data-si]').forEach(b=>b.onclick=()=>{if(G.busy||b.disabled)return;const i=+b.dataset.si;
    const key=textKey('sq_',P.items[i][0]);say([key],P.items[i][0]);
    if(i===seqPos){b.disabled=true;b.querySelector('.num').textContent=seqPos+1;b.classList.add('done');seqPos++;
      if(seqPos>=P.items.length){G.busy=true;setTimeout(()=>correct({seq:['seq_good'],text:'First, next, last! You got the order!',msg:'Great order!'}),900);}}
    else{b.classList.add('nope');setTimeout(()=>b.classList.remove('nope'),500);miss('order',{msg:seqPos===0?'What happens first?':seqPos===1?'What happens next?':'What happens last?',seq:['try0',seqPos===0?'seq_first':seqPos===1?'seq_next':'seq_last']});}});}
let fluT=null;
function wireFlu(){const P=current;let errs=new Set(),running=false,ended=false,left=60,startAt=0;
  const words=[...$('fluText').querySelectorAll('.fw')];
  const finish=lastIdx=>{clearInterval(fluT);running=false;ended=true;
    const attempted=lastIdx+1,correctW=Math.max(0,attempted-[...errs].filter(i=>i<=lastIdx).length);const secs=Math.max(10,Math.min(60,(Date.now()-startAt)/1000));
    const wcpm=Math.round(correctW*60/secs),acc=attempted?Math.round(correctW/attempted*100):0;
    SAVE.flu=SAVE.flu||[];SAVE.flu.push({d:todayStr(),i:P.spec.i,w:wcpm,a:acc});if(SAVE.flu.length>60)SAVE.flu.shift();persist();
    $('fluNote').innerHTML=`<b>${wcpm} words correct per minute</b> · ${acc}% accurate (${correctW} of ${attempted} words). Saved to the Goals tab.`;
    G.tries=0;correct({seq:['flu_done'],text:'Great reading, hero! You finished the fluency check!',msg:'Fluency check done!',wait:3500});};
  words.forEach((w,i)=>w.onclick=()=>{if(ended)return;if(running){w.classList.toggle('err');errs.has(i)?errs.delete(i):errs.add(i);}else if(left<=0||startAt){finish(i);}});
  $('fluStart').onclick=()=>{if(running||ended)return;running=true;startAt=Date.now();stopVoice();$('fluStart').disabled=true;$('fluStop').disabled=false;
    fluT=setInterval(()=>{if(!$('fluClock')){clearInterval(fluT);return;}left=60-Math.floor((Date.now()-startAt)/1000);$('fluClock').textContent=`0:${String(Math.max(0,left)).padStart(2,'0')}`;
      if(left<=0){clearInterval(fluT);running=false;sfx('level');$('fluNote').innerHTML='<b>Time!</b> Now tap the last word your child read.';$('fluStop').disabled=true;}},250);};
  $('fluStop').onclick=()=>{clearInterval(fluT);running=false;$('fluStop').disabled=true;$('fluNote').innerHTML='Tap the last word your child read.';};}
let ranT=null;
function wireRan(){let n=0,e=0,left=60,startAt=0,running=false;const L='abcdefghijklmnoprstuwy'.split('');let cur='';
  const next=()=>{let c;do{c=pick(L);}while(c===cur);cur=c;$('ranL').textContent=Math.random()<.5?c:c.toUpperCase();};
  const end=()=>{clearInterval(ranT);running=false;$('ranOk').disabled=$('ranNo').disabled=true;
    SAVE.ran=SAVE.ran||[];SAVE.ran.push({d:todayStr(),n,e});if(SAVE.ran.length>60)SAVE.ran.shift();persist();
    $('ranL').innerHTML=`<span class="ranres">${n} letters</span>`;G.tries=0;correct({seq:['ran_done'],text:'Super speed! You named so many letters!',msg:`${n} letters in 1 minute!`,wait:3500});};
  $('ranStart').onclick=()=>{if(running)return;running=true;startAt=Date.now();stopVoice();$('ranStart').disabled=true;$('ranOk').disabled=$('ranNo').disabled=false;next();
    ranT=setInterval(()=>{if(!$('ranClock')){clearInterval(ranT);running=false;return;}left=60-Math.floor((Date.now()-startAt)/1000);$('ranClock').textContent=`0:${String(Math.max(0,left)).padStart(2,'0')}`;if(left<=0)end();},250);};
  $('ranOk').onclick=()=>{if(!running)return;n++;sfx('click');next();};$('ranNo').onclick=()=>{if(!running)return;e++;next();};}
function wireSupports(){
  if(!current)return;
  if(current.type==='enc')wireEnc();else if(current.type==='seq')wireSeq();else if(current.type==='flu')wireFlu();else if(current.type==='ran')wireRan();
  if(current.type==='trace'&&STROKES[current.ans]){const tb=$('traceBox');if(tb){const d=document.createElement('div');d.className='strokebox';
    d.innerHTML=`<div class="tiny">Watch how to write it:</div>${strokeSVG(current.ans)}<button class="sm-btn" data-replay>Show me again</button>`;tb.before(d);
    d.querySelector('[data-replay]').onclick=()=>{const svg=d.querySelector('svg');const c=svg.cloneNode(true);svg.replaceWith(c);};}}
}

/* ---------- mission plan + token board ---------- */
const DEFAULT_REWARDS=['Watch my pet do a trick','Dance party','Pick a sticker','5-minute break'];
const rewards=()=>(FAM.set.rewards&&FAM.set.rewards.length?FAM.set.rewards:DEFAULT_REWARDS);
let planReward=null;
function showPlan(go){
  const n=missionLength();
  $('planBody').innerHTML=`<div class="plansteps"><div><b>1</b><span>🎧</span>Listen</div><div><b>2</b><span>👆</span>Answer ${n} questions</div><div><b>3</b><span>⭐</span>Get stars</div></div>
    <h3>Then I get:</h3><div class="rewardpicks">${rewards().map((r,i)=>`<button class="pick rwd${i===0?' sel':''}" data-r="${i}">${escapeHTML(r)}</button>`).join('')}</div>`;
  planReward=rewards()[0];
  $('planBody').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{$('planBody').querySelectorAll('[data-r]').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');planReward=rewards()[+b.dataset.r];sfx('click');});
  $('planGo').onclick=()=>{closeModal('planModal');go();};
  openModal('planModal');say(['plan_q'],'Here is your mission plan. First, answer the questions. Then, you get your reward! Pick one.');
}
function missionLength(){return FAM.set.short?5:10;}
function renderTokens(){const el=$('tokens');if(!el||!G)return;if(FAM.set.plan===false||G.total>12||G.kind==='read'&&['flu','ran'].includes(G.mode.id)){el.innerHTML='';return;}
  el.innerHTML=Array.from({length:G.total},(_,i)=>`<span class="tok${i<G.q?' on':''}">${i<G.q?'⭐':''}</span>`).join('')+(G.reward?`<span class="tokgoal">➜ ${escapeHTML(G.reward)}</span>`:'');}

/* ---------- raise my hand + gentle nudges when a player gets stuck ---------- */
const HAND_TYPES=['choice','spell','sentence','enc','seq','trace','ematch'];
function canRaiseHand(P){return !!P&&(hasHelp(P)||HAND_TYPES.includes(P.type));}
function raiseHand(){
  if(!current||G.busy)return;clearTimeout(idleT1);clearTimeout(idleT2);
  document.querySelectorAll('#qbody .handbtn').forEach(b=>{b.classList.remove('pulse');b.classList.add('raised');});
  sfx('click');G.hands=(G.hands||0)+1;
  if(hasHelp(current)){say(['hand_yes'],'Great job raising your hand! Let me show you how.');setTimeout(openHelp,1600);return;}
  // no worked example for this question: read it again and take away one wrong answer
  const wrong=[...document.querySelectorAll('#qbody .ans:not([disabled])')].filter(b=>String(b.dataset.v)!==String(current.ans));
  if(wrong.length>1){const w=pick(wrong);w.disabled=true;w.classList.add('quiet');}
  say(['hand_hint'],'Great job raising your hand! Let\'s listen again. I took away one answer to help you.');
  setTimeout(()=>{if(current&&!G.busy)speakCurrent();},3200);}
let idleT1=null,idleT2=null;
function nudgeMs(){const n=+FAM.set.nudgeSec;return ([15,20,30,45,60].includes(n)?n:20)*1000;}
function armNudge(){clearTimeout(idleT1);clearTimeout(idleT2);
  if(FAM.set.nudge===false||!current||!canRaiseHand(current))return;
  const P=current,ms=nudgeMs();
  const ok=()=>current===P&&!G.busy&&!document.querySelector('.modal.open')&&$('battle').classList.contains('active');
  const flag=()=>document.querySelectorAll('#qbody .handbtn').forEach(b=>{b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');});
  idleT1=setTimeout(()=>{if(!ok())return;say(['nudge0'],'Take your time, hero. If you don\'t know, press Raise my hand, and I will explain it.');flag();},ms);
  idleT2=setTimeout(()=>{if(!ok())return;say(['nudge1'],'Still thinking? That\'s okay! Press the Raise my hand button, and I will help you.');flag();},ms*2+5000);}
document.addEventListener('pointerdown',e=>{if(current&&$('battle')&&$('battle').classList.contains('active')&&!e.target.closest('.handbtn'))armNudge();},true);

/* ---------- math tool tray (like classroom desk tools) ---------- */
let blkBusy=false,toolTab='line',nlPos=0,blk={t:0,o:0},coinsIn=[];
function openTools(){openModal('toolsModal');renderTool();}
function renderTool(){
  document.querySelectorAll('#toolTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tool===toolTab));
  const box=$('toolBody');
  if(toolTab==='chart'){box.innerHTML=`<div class="chart120">${Array.from({length:120},(_,i)=>`<button data-n="${i+1}">${i+1}</button>`).join('')}</div><p class="tiny">Tap numbers to light them up. Tap again to clear.</p>`;
    box.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{b.classList.toggle('lit');if(b.classList.contains('lit'))say([N(+b.dataset.n)],b.dataset.n);});}
  if(toolTab==='line'){const c=countPlan();
    box.innerHTML=`<div class="nlwrap"><div class="nl" id="nl">${Array.from({length:21},(_,i)=>`<div class="nlt${i===nlPos?' at':''}" data-n="${i}"><span>${i}</span></div>`).join('')}</div></div>
      <div class="btnrow" style="justify-content:center"><button class="btn ghost" id="nlBack">◀ Back 1</button><button class="btn ghost" id="nlFwd">Forward 1 ▶</button>${c?`<button class="btn blue" id="nlCount">${c.label}</button>`:''}</div>
      <p class="tiny" id="nlMsg">Tap a number to start there. Then hop forward to count on, or back to count back.</p>`;
    box.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{nlPos=+b.dataset.n;markNL();say([N(nlPos)],String(nlPos));});
    $('nlBack').onclick=()=>{if(nlPos>0){nlPos--;markNL(true);say([N(nlPos)],String(nlPos));}};
    $('nlFwd').onclick=()=>{if(nlPos<20){nlPos++;markNL(true);say([N(nlPos)],String(nlPos));}};
    if(c)$('nlCount').onclick=()=>countOn(c);}
  if(toolTab==='blocks'){box.innerHTML=`<div class="blkshow" id="blkShow"></div><div class="problem small" id="blkNum"></div>
      <div class="btnrow" style="justify-content:center"><button class="btn blue" id="addTen">+ Ten</button><button class="btn" id="addOne">+ One</button><button class="btn ghost" id="subOne">− One</button><button class="btn ghost" id="blkClear">Clear</button></div>
      <p class="tiny">When you get 10 ones, they trade for 1 ten.</p>`;drawBlk();
    $('addTen').onclick=()=>{if(blk.t<9){blk.t++;drawBlk();}};$('addOne').onclick=()=>{if(blkBusy)return;if(blk.o>=9&&blk.t>=9)return;blk.o++;if(blk.o>=10){blkBusy=true;drawBlk(true);setTimeout(()=>{blkBusy=false;blk.o=Math.max(0,blk.o-10);blk.t=Math.min(9,blk.t+1);if($('blkShow'))drawBlk();sfx('level');},700);}else drawBlk();};
    $('subOne').onclick=()=>{if(blk.o>0)blk.o--;else if(blk.t>0){blk.t--;blk.o=9;}drawBlk();};$('blkClear').onclick=()=>{blk={t:0,o:0};drawBlk();};}
  if(toolTab==='coins'){box.innerHTML=`<div class="coins coinpick">${COINS.map(c=>`<button data-c="${c.id}" aria-label="${c.name}">${coinSVG(c)}<b>${c.name}</b></button>`).join('')}</div>
      <div class="coins cointray" id="coinTray"></div><div class="problem small" id="coinTot">0¢</div><div class="btnrow" style="justify-content:center"><button class="btn ghost" id="coinClear">Clear</button></div>`;drawCoins();
    box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(coinsIn.length<12){coinsIn.push(b.dataset.c);drawCoins(true);}});$('coinClear').onclick=()=>{coinsIn=[];drawCoins();};}
  if(toolTab==='board'){box.innerHTML=`<canvas id="wb" class="wb"></canvas><div class="btnrow" style="justify-content:center"><button class="btn ghost" id="wbClear">Clear</button></div>`;wireBoard();}
}
function markNL(hop){document.querySelectorAll('#nl .nlt').forEach((t,i)=>{t.classList.toggle('at',i===nlPos);if(hop&&i===nlPos){t.classList.remove('hop');void t.offsetWidth;t.classList.add('hop');}});}
function countPlan(){if(!current||!current.spec)return null;const s=current.spec;let a,b,k;
  if(s.t==='arith'&&(s.k==='+'||s.k==='-')){a=s.a;b=s.b;k=s.k;}else if(s.t==='story'){a=s.a;b=s.b;k=STORIES[s.i].op;}else return null;
  if(k==='+'){const big=Math.max(a,b),sm=Math.min(a,b);if(big+sm>20)return null;return{start:big,steps:sm,dir:1,label:`Count on from ${big}`};}
  if(a>20)return null;return{start:a,steps:b,dir:-1,label:`Count back from ${a}`};}
async function countOn(c){nlPos=c.start;markNL(true);$('nlMsg').textContent=c.dir>0?`Start at ${c.start}. Hop ${c.steps} times.`:`Start at ${c.start}. Hop back ${c.steps} times.`;
  await sayWait([N(c.start)],String(c.start));
  for(let i=0;i<c.steps;i++){await pause(450);if(!$('toolsModal').classList.contains('open'))return;nlPos+=c.dir;markNL(true);await sayWait([N(nlPos)],String(nlPos));}
  $('nlMsg').textContent=`You landed on ${nlPos}.`;}
function drawBlk(full){$('blkShow').innerHTML=blocksHTML(blk.t,blk.o);$('blkShow').classList.toggle('full',!!full);$('blkNum').textContent=`${blk.t} tens + ${blk.o} ones = ${blk.t*10+blk.o}`;}
function drawCoins(add){const C=id=>COINS.find(c=>c.id===id);$('coinTray').innerHTML=coinsIn.map(id=>coinSVG(C(id))).join('');const tot=coinsIn.reduce((t,id)=>t+C(id).cents,0);$('coinTot').textContent=tot+'¢';if(add)say([N(tot),'cents'],tot+' cents');}
function wireBoard(){const cv=$('wb'),w=Math.min(560,$('toolBody').clientWidth||320),h=Math.round(w*.62),dpr=window.devicePixelRatio||1;cv.style.width=w+'px';cv.style.height=h+'px';cv.width=w*dpr;cv.height=h*dpr;
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle='#fff';x.fillRect(0,0,w,h);x.lineWidth=5;x.lineCap='round';x.strokeStyle='#14142b';let dn=false,l=null;
  const p=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);dn=true;l=p(e);};cv.onpointermove=e=>{if(!dn)return;const q=p(e);x.beginPath();x.moveTo(l.x,l.y);x.lineTo(q.x,q.y);x.stroke();l=q;};
  cv.onpointerup=cv.onpointercancel=()=>dn=false;$('wbClear').onclick=()=>{x.fillStyle='#fff';x.fillRect(0,0,w,h);};}

/* ---------- test countdown + spread-out practice ---------- */
const TEST_KINDS={spelling:'Spelling list',math:'Math',word:'Reading and words',lab:'Phonics',water:'Water cycle',market:'Goods and services'};
const daysUntil=d=>{const t=new Date(todayStr()+'T00:00:00'),x=new Date(d+'T00:00:00');return Math.round((x-t)/86400000);};
function upcomingTests(){return (SAVE.tests||[]).filter(t=>daysUntil(t.d)>=0).sort((a,b)=>a.d<b.d?-1:1);}
function testQuestions(t,n){const L=SAVE.lv;const out=[];
  for(let i=0;i<n;i++){
    if(t.k==='spelling')out.push(SAVE.spell.length?GEN.mylist?GEN.mylist(L.word,i):GEN.spell(L.word):GEN.spell(L.word));
    else if(t.k==='math')out.push(GEN.mix(L.math));else if(t.k==='word')out.push(GEN.wordmix(L.word));
    else if(t.k==='lab')out.push(GEN.labmix(L.lab||1));else if(t.k==='market')out.push(GEN.equiz(1,i+1));else out.push(GEN[pick(['wvocab','wcycle','wfacts'])]());}
  return out;}
function renderTestBox(){const box=$('testBox');if(!box)return;const t=upcomingTests()[0];
  if(!t){box.style.display='none';return;}box.style.display='';const d=daysUntil(t.d);const did=(t.p||[]).includes(todayStr());
  box.innerHTML=`<div><div class="daily-t">${escapeHTML(t.n)}</div><div class="daily-s">${d===0?'The test is TODAY. You are ready!':d===1?'Test is tomorrow!':`Test in ${d} days`} · practiced ${(t.p||[]).length} day${(t.p||[]).length===1?'':'s'}${did?' · done for today ✓':''}</div>
    <div class="cal">${Array.from({length:Math.min(7,d+1)},(_,i)=>`<span class="cd${i===0&&did?' on':''}${i===0?' today':''}">${i===d?'🏁':''}</span>`).join('')}</div></div>
    <button class="btn" id="testGo">${did?'Practice more':'Practice (5 min)'}</button>`;
  $('testGo').onclick=()=>{const list=testQuestions(t,t.k==='spelling'?Math.min(8,Math.max(5,SAVE.spell.length)):8);G_testId=t.id;startGame({list,kind:'test',name:t.n+' practice'});};}
let G_testId=null;
function markTestPractice(){if(!G_testId)return;const t=(SAVE.tests||[]).find(x=>x.id===G_testId);G_testId=null;if(!t)return;t.p=[...new Set([...(t.p||[]),todayStr()])].slice(-60);persist();}
function renderTests(){const box=$('testBody');const list=[...(SAVE.tests||[])].sort((a,b)=>a.d<b.d?-1:1);
  box.innerHTML=`<p class="note">Add a test date and the game spreads practice across the days before it, a few minutes a day instead of the night before. Upcoming tests also add 3 questions to the Daily Mission.</p>
    ${list.length?`<table class="rep"><tr><th>Test</th><th>Date</th><th>Topic</th><th>Days practiced</th><th></th></tr>${list.map(t=>`<tr><td>${escapeHTML(t.n)}</td><td>${t.d}</td><td>${TEST_KINDS[t.k]}</td><td>${(t.p||[]).length}</td><td><button class="btn red" data-tdel="${t.id}">Remove</button></td></tr>`).join('')}</table>`:'<p class="note">No tests yet.</p>'}
    <h3 style="margin:12px 0 4px">Add a test</h3>
    <label class="field" for="tName">Name</label><input type="text" id="tName" maxlength="30" placeholder="Spelling test">
    <label class="field" for="tDate">Date</label><input type="date" id="tDate" class="inp" style="max-width:220px">
    <label class="field" for="tKind">Topic</label><select class="inp" id="tKind">${Object.entries(TEST_KINDS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
    <p class="note">For a spelling test, put the words in the Spelling list tab first.</p>
    <div class="btnrow"><button class="btn blue" id="tAdd">Add test</button></div><p class="note" id="tMsg"></p>`;
  box.querySelectorAll('[data-tdel]').forEach(b=>b.onclick=()=>{SAVE.tests=(SAVE.tests||[]).filter(t=>t.id!==b.dataset.tdel);persist();renderTests();renderTestBox();});
  $('tAdd').onclick=()=>{const n=$('tName').value.trim().replace(/[<>"'`&\\]/g,'').slice(0,30)||'Test',d=$('tDate').value,k=$('tKind').value;
    if(!/^\d{4}-\d\d-\d\d$/.test(d)||daysUntil(d)<0){$('tMsg').textContent='Pick a date today or later.';return;}
    SAVE.tests=[...(SAVE.tests||[]),{id:Math.random().toString(36).slice(2,9),n,d,k,p:[]}].slice(-10);persist();renderTests();renderTestBox();};}

/* ---------- goal tracker ---------- */
function monthsBack(n){const out=[];const d=new Date();d.setDate(1);for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push(monthStr(x));}return out;}
const pct=v=>v&&v[1]?Math.round(v[0]/v[1]*100):null;
function phonicsMonth(m){let r=0,t=0;PHONICS.forEach(k=>{const v=(SAVE.sk||{})[k]?.[m];if(v){r+=v[0];t+=v[1];}});return t?[r,t]:null;}
function lineChart(points,target,maxY,unit){ // points: [{x:label,y:number|null}]
  const W=560,H=200,pl=40,pr=28,pt=22,pb=30,n=points.length;const X=i=>pl+(n<=1?0:(W-pl-pr)*i/(n-1)),Y=v=>pt+(H-pt-pb)*(1-v/maxY);
  const pts=points.map((p,i)=>p.y==null?null:[X(i),Y(p.y)]);const path=pts.reduce((a,p)=>p?a+(a?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1):a,'');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart">${[0,.25,.5,.75,1].map(f=>`<line x1="${pl}" x2="${W-pr}" y1="${Y(maxY*f)}" y2="${Y(maxY*f)}" class="grid"/><text x="${pl-6}" y="${Y(maxY*f)+4}" text-anchor="end">${Math.round(maxY*f)}${unit}</text>`).join('')}
    ${target!=null?`<line x1="${pl}" x2="${W-pr}" y1="${Y(target)}" y2="${Y(target)}" class="target"/><text x="${W-pr}" y="${Y(target)-5}" text-anchor="end" class="tlab">Goal ${target}${unit}</text>`:''}
    <path d="${path}" class="ln"/>${pts.map(p=>p?`<circle cx="${p[0]}" cy="${p[1]}" r="5" class="pt"/>`:'').join('')}
    ${points.map((p,i)=>`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${p.x}</text>`).join('')}</svg>`;}
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monLabel=m=>MON[+m.slice(5)-1];
function renderGoals(){const g=FAM.set.goal||{pct:80,d:''};const box=$('goalBody');const ms=monthsBack(6),cur=ms[ms.length-1];
  const ph=phonicsMonth(cur),php=pct(ph);
  const rows=Object.keys(SKILLS).map(k=>{const s=(SAVE.sk||{})[k]||{};const vals=ms.slice(-3).map(m=>s[m]);if(vals.every(v=>!v))return '';
    return `<tr><td>${SKILLS[k]}${PHONICS.includes(k)?' <span class="badge hot">phonics</span>':''}</td>${vals.map(v=>{const p=pct(v);return `<td class="${p==null?'':p>=g.pct?'met':'notyet'}">${p==null?'–':p+'%'} <small>${v?`(${v[1]})`:''}</small></td>`;}).join('')}</tr>`;}).join('');
  const flu=(SAVE.flu||[]).slice(-8),ran=(SAVE.ran||[]).slice(-8);
  box.innerHTML=`<div class="goalset"><label class="field" for="gPct">Goal: first-try accuracy on phonics and syllable patterns of</label>
      <select class="inp" id="gPct">${[70,75,80,85,90].map(v=>`<option value="${v}">${v}%</option>`).join('')}</select>
      <label class="field" for="gDate">by</label><input type="date" class="inp" id="gDate" style="max-width:220px"></div>
    <div class="kv"><b>This month:</b> ${php==null?'No phonics practice yet this month.':`${php}% on the first try (${ph[1]} questions)`} ${php!=null?`<div class="gbar"><div style="width:${php}%"></div><span style="left:${g.pct}%"></span></div>`:''}</div>
    ${g.d?`<div class="kv">${daysUntil(g.d)>=0?`${daysUntil(g.d)} days until the goal date.`:'The goal date has passed.'}</div>`:''}
    <h3 style="margin:12px 0 4px">Phonics accuracy by month</h3>${lineChart(ms.map(m=>({x:monLabel(m),y:pct(phonicsMonth(m))})),g.pct,100,'%')}
    <h3 style="margin:12px 0 4px">Skills (last 3 months, first-try accuracy)</h3>
    ${rows?`<table class="rep"><tr><th>Skill</th>${ms.slice(-3).map(m=>`<th>${monLabel(m)}</th>`).join('')}</tr>${rows}</table><p class="note">Green = at or above the goal. The number in parentheses is how many questions.</p>`:'<p class="note">Play some missions to see skills here.</p>'}
    <h3 style="margin:12px 0 4px">Fluency checks (words correct per minute)</h3>
    ${flu.length?lineChart(flu.map(f=>({x:f.d.slice(5),y:f.w})),null,Math.max(40,...flu.map(f=>f.w))+10,''):'<p class="note">Do a Fluency Check in the Reading Lab once a week.</p>'}
    <h3 style="margin:12px 0 4px">Letter speed (letters per minute)</h3>
    ${ran.length?lineChart(ran.map(f=>({x:f.d.slice(5),y:f.n})),null,Math.max(40,...ran.map(f=>f.n))+10,''):'<p class="note">Try Letter Speed in the Reading Lab.</p>'}
    <h3 style="margin:12px 0 4px">Monthly summary to share with the teacher</h3>
    <textarea id="sumOut" readonly rows="9"></textarea>
    <div class="btnrow"><button class="btn blue" id="sumCopy">Copy summary</button>${navigator.share?'<button class="btn ghost" id="sumShare">Share</button>':''}</div><p class="note" id="sumMsg"></p>`;
  $('gPct').value=String(g.pct);$('gDate').value=g.d||'';
  $('gPct').onchange=e=>{FAM.set.goal={pct:+e.target.value,d:(FAM.set.goal||{}).d||''};persist();renderGoals();};
  $('gDate').onchange=e=>{const d=e.target.value;FAM.set.goal={pct:(FAM.set.goal||{pct:80}).pct,d:/^\d{4}-\d\d-\d\d$/.test(d)?d:''};persist();renderGoals();};
  $('sumOut').value=monthlySummary();
  $('sumCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('sumOut').value);$('sumMsg').textContent='Copied. Paste it into an email or message.';}catch(e){$('sumOut').select();$('sumMsg').textContent='Select the text and copy it.';}};
  if($('sumShare'))$('sumShare').onclick=()=>navigator.share({title:'Math Heroes monthly summary',text:$('sumOut').value}).catch(()=>{});}
function monthlySummary(){const g=FAM.set.goal||{pct:80,d:''};const m=monthStr(),d=new Date();const ph=phonicsMonth(m);
  const ses=SAVE.ses.filter(s=>{const x=new Date(s.d);return !isNaN(x)&&x.getMonth()===d.getMonth()&&x.getFullYear()===d.getFullYear();});
  const lines=[`Math Heroes home practice summary: ${MON[d.getMonth()]} ${d.getFullYear()}${SAVE.kid?` (${SAVE.kid})`:''}`,
    `Goal: ${g.pct}% first-try accuracy on phonics and syllable patterns${g.d?` by ${g.d}`:''}.`,
    `Phonics this month: ${ph?`${pct(ph)}% first try over ${ph[1]} questions`:'no practice logged yet'}.`];
  Object.keys(SKILLS).forEach(k=>{const v=(SAVE.sk||{})[k]?.[m];if(v)lines.push(`- ${SKILLS[k]}: ${pct(v)}% (${v[1]} questions)`);});
  const f=(SAVE.flu||[]).filter(x=>x.d.startsWith(m));if(f.length)lines.push(`Fluency checks: ${f.map(x=>`${x.w} WCPM (${x.a}% accurate, ${x.d.slice(5)})`).join('; ')}.`);
  const r=(SAVE.ran||[]).filter(x=>x.d.startsWith(m));if(r.length)lines.push(`Letter naming speed: ${r.map(x=>`${x.n} per minute (${x.d.slice(5)})`).join('; ')}.`);
  const days=new Set(SAVE.daily.days.filter(x=>x.startsWith(m))).size;lines.push(`Days with a Daily Mission: ${days}. Missions played this month: ${ses.length}.`);
  const help=ses.reduce((t,s)=>t+(s.h||0),0);if(help)lines.push(`Times "Need help" was used: ${help}.`);
  if(SAVE.eye&&SAVE.eye.d&&SAVE.eye.d.startsWith(m))lines.push(`Glasses practice in the game (latest day): about ${SAVE.eye.m} minutes.`);
  lines.push('Accuracy is first-try answers in the game, not a school assessment.');
  return lines.join('\n');}
