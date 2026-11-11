/* ================= Market Town: goods, services, consumers, producers and resources =================
   Missions: Learn the Words (flash cards), Good or Service?, Producer or Consumer?, Resource Sort,
   Word Match (matching game), Fill in the Blank, What Does It Mean?, Make It! (3 resources), Quiz Practice, Mega Boss. */

const ECON_TERMS={
  good:{w:'good',e:'🧸',d:'Goods are things people make or use to meet needs and wants. You can touch a good.',m:'A thing you can touch that people make or use',ex:'🍎 👟 📚 🚲'},
  service:{w:'service',e:'💇',d:'Services are jobs people do for others to meet needs and wants.',m:'A job someone does for you',ex:'💇 🩺 🚒 📬'},
  consumer:{w:'consumer',e:'🛒',d:'A consumer is a person who buys or uses goods and services.',m:'A person who buys or uses goods and services',ex:'🛒 🍦 🚌'},
  producer:{w:'producer',e:'👩‍🌾',d:'A producer is a person who makes goods or gives services.',m:'A person who makes goods or gives services',ex:'👩‍🌾 🧑‍🍳 🧑‍🚒'},
  natural:{w:'natural resource',e:'🌳',d:'Natural resources come from nature, like water, soil, trees, and coal.',m:'Something that comes from nature',ex:'💧 🌳 🪨 ☀️'},
  capital:{w:'capital resource',e:'🔨',d:'Capital resources are tools, machines, and buildings that people make and use to make goods and services.',m:'A tool, machine, or building used to make goods or services',ex:'🔨 🚜 💻 🏫'},
  human:{w:'human resource',e:'👷',d:'Human resources are people working to make goods and give services.',m:'A person working to make goods or give services',ex:'👷 👩‍🏫 🧑‍⚕️ 🧑‍🔧'}
};
const ECON_ORDER=['good','service','consumer','producer','natural','capital','human'];

/* good or service */
const GS_ITEMS=[
  ['an apple','🍎','good'],['shoes','👟','good'],['a book','📚','good'],['a pizza','🍕','good'],['a bike','🚲','good'],
  ['a pencil','✏️','good'],['a shirt','👕','good'],['a soccer ball','⚽','good'],['milk','🥛','good'],['bread','🍞','good'],
  ['crayons','🖍️','good'],['a backpack','🎒','good'],['cookies','🍪','good'],['a teddy bear','🧸','good'],['a toy car','🚗','good'],
  ['a haircut','💇','service'],['a doctor checkup','🩺','service'],['a teacher teaching','👩‍🏫','service'],['a firefighter putting out a fire','🚒','service'],
  ['a mail carrier bringing mail','📬','service'],['fixing a car','🔧','service'],['a dentist cleaning teeth','🦷','service'],['a bus driver driving kids to school','🚌','service'],
  ['a police officer keeping us safe','👮','service'],['a vet caring for a sick dog','🐶','service'],['picking up the trash','🗑️','service'],['a waiter bringing your food','🍽️','service'],
  ['a nurse giving a shot','💉','service'],['a coach teaching soccer','🥅','service']
];
/* producer or consumer */
const PC_ITEMS=[
  ['Ana buys a toy at the store.','🧸','consumer'],['A farmer grows corn.','🌽','producer'],['Max eats an apple.','🍎','consumer'],
  ['A baker makes bread.','🍞','producer'],['Dad gets a haircut.','💇','consumer'],['A barber cuts hair.','💈','producer'],
  ['A doctor helps a sick child.','🩺','producer'],['Liz reads a library book.','📖','consumer'],['A builder builds a house.','🏠','producer'],
  ['Sam rides the bus to school.','🚌','consumer'],['A teacher teaches the class.','👩‍🏫','producer'],['Jen buys a cup of lemonade.','🍋','consumer'],
  ['Kids make and sell lemonade.','🥤','producer'],['Mom buys milk at the store.','🥛','consumer'],['A firefighter puts out a fire.','🚒','producer'],
  ['Grandpa gets his car fixed.','🚗','consumer']
];
/* natural, capital or human */
const RES_ITEMS=[
  ['water','💧','natural'],['trees','🌳','natural'],['wood','🪵','natural'],['soil','🟫','natural'],['coal','🪨','natural'],
  ['sunlight','☀️','natural'],['fish in the sea','🐟','natural'],['sand','🏖️','natural'],
  ['a hammer','🔨','capital'],['a tractor','🚜','capital'],['a truck','🚚','capital'],['a computer','💻','capital'],['a saw','🪚','capital'],
  ['scissors','✂️','capital'],['a school building','🏫','capital'],['a ladder','🪜','capital'],['a wrench','🔧','capital'],
  ['a farmer','👩‍🌾','human'],['a baker','🧑‍🍳','human'],['a builder','👷','human'],['a teacher','👩‍🏫','human'],['a doctor','🧑‍⚕️','human'],
  ['a firefighter','🧑‍🚒','human'],['a mechanic','🧑‍🔧','human']
];
/* make it: three resources for one product */
const MAKE_ITEMS=[
  {p:'bread',e:'🍞',natural:['wheat','🌾'],capital:['an oven','🔥'],human:['the baker','🧑‍🍳']},
  {p:'a wooden table',e:'🪑',natural:['trees','🌳'],capital:['a saw','🪚'],human:['the carpenter','👷']},
  {p:'a house',e:'🏠',natural:['wood','🪵'],capital:['a hammer','🔨'],human:['the builder','👷']},
  {p:'corn',e:'🌽',natural:['soil','🟫'],capital:['a tractor','🚜'],human:['the farmer','👩‍🌾']},
  {p:'lemonade',e:'🥤',natural:['lemons','🍋'],capital:['a pitcher','🫖'],human:['the kids','🧒']},
  {p:'a fish dinner',e:'🍽️',natural:['fish','🐟'],capital:['a fishing boat','🚤'],human:['the cook','🧑‍🍳']},
  {p:'cookies',e:'🍪',natural:['eggs','🥚'],capital:['a mixer','🥣'],human:['the baker','🧑‍🍳']},
  {p:'apple juice',e:'🧃',natural:['apples','🍎'],capital:['a juice machine','⚙️'],human:['the worker','👷']}
];
/* fill in the blank: [sentence with ___, answer key, family] */
const FILL_ITEMS=[
  ['A ___ is a thing you can touch, like a ball.','good','gs'],
  ['A ___ is a job someone does for you, like a haircut.','service','gs'],
  ['A person who buys or uses goods and services is a ___.','consumer','pc'],
  ['A person who makes goods or gives services is a ___.','producer','pc'],
  ['Water, trees, and soil are ___ resources.','natural','res'],
  ['Tools and machines, like a tractor, are ___ resources.','capital','res'],
  ['People working, like a farmer or a teacher, are ___ resources.','human','res'],
  ['When Mom buys milk, she is a ___.','consumer','pc'],
  ['The farmer who grows apples is a ___.','producer','pc'],
  ['A doctor checking your ears gives a ___.','service','gs'],
  ['A new bike is a ___.','good','gs'],
  ['A hammer is a ___ resource.','capital','res'],
  ['Wood comes from trees, so wood is a ___ resource.','natural','res'],
  ['The baker making bread is a ___ resource.','human','res'],
  ['A dentist cleaning your teeth gives a ___.','service','gs'],
  ['A pizza is a ___.','good','gs'],
  ['When you buy a ticket and ride the bus, you are a ___.','consumer','pc'],
  ['A school building is a ___ resource.','capital','res']
];
const FAMS={gs:['good','service'],pc:['consumer','producer'],res:['natural','capital','human']};
const BLANK_WORD={good:'good',service:'service',consumer:'consumer',producer:'producer',natural:'natural',capital:'capital',human:'human'};
const ECON_EXPLAIN={good:'You can touch it, so it is a good.',service:'Someone does it for you, so it is a service.',
  consumer:'They buy or use it, so they are a consumer.',producer:'They make it or do the job, so they are a producer.',
  natural:'It comes from nature, so it is a natural resource.',capital:'It is a tool, machine, or building people made, so it is a capital resource.',
  human:'It is a person working, so it is a human resource.'};
const RES_CHOICE={natural:['Natural','🌳'],capital:['Capital','🔨'],human:['Human','👷']};

/* ---------- generators ---------- */
const ecIdx=(list,key)=>list.indexOf(fresh(list,key));
Object.assign(GEN,{
  gs(){return{t:'egs',i:ecIdx(GS_ITEMS,x=>'gs'+x[0])};},
  pc(){return{t:'epc',i:ecIdx(PC_ITEMS,x=>'pc'+x[0])};},
  res(L){return L>=3&&Math.random()<.4?{t:'emake',i:rnd(0,MAKE_ITEMS.length-1),k:pick(['natural','capital','human'])}:{t:'eres',i:ecIdx(RES_ITEMS,x=>'rs'+x[0])};},
  make(){return{t:'emake',i:ecIdx(MAKE_ITEMS,x=>'mk'+x.p),k:pick(['natural','capital','human'])};},
  fill(){return{t:'efill',i:ecIdx(FILL_ITEMS,x=>'fl'+x[0])};},
  edef(L){const k=fresh(ECON_ORDER,x=>'df'+x);return{t:'edef',k,r:L>1&&Math.random()<.5?1:0};},
  ematch(L,i){const n=i||0;let keys;
    const r=n%3;if(r===0)keys=['good','service','consumer','producer'];else if(r===1)keys=['natural','capital','human',pick(['good','service','consumer','producer'])];
    else keys=shuffle(ECON_ORDER.slice()).slice(0,4);return{t:'ematch',ks:keys};},
  econmix(L){const m=pick(['gs','gs','pc','res','fill','edef','make']);return GEN[m](L);},
  equiz(L,i){const n=i||0;return n%5===0?GEN.ematch(L,n/5):pick([GEN.gs,GEN.gs,GEN.fill,GEN.edef,GEN.pc,GEN.res])(L);}
});
MODES.market=[
  {id:'elearn',name:'Learn the Words',desc:'7 word cards to hear and see'},
  {id:'gs',name:'Good or Service?',desc:'Can you touch it?'},
  {id:'pc',name:'Producer or Consumer?',desc:'Make it or buy it?'},
  {id:'ematch',name:'Word Match',desc:'Match words to meanings'},
  {id:'fill',name:'Fill in the Blank',desc:'Pick the missing word'},
  {id:'edef',name:'What Does It Mean?',desc:'Words and meanings'},
  {id:'res',name:'Resource Sort',desc:'Natural, capital or human?'},
  {id:'make',name:'Make It!',desc:'3 resources make one thing'},
  {id:'equiz',name:'Quiz Practice',desc:'Practice for the quiz'}
];
BOSS.market={id:'boss',name:'MEGA BOSS: Professor Mix-Up',desc:'Unlock: stars in 3 missions'};
BOSS_POOL.market=['gs','pc','fill','edef','res','make'];
VILLAINS.market={name:'Professor Mix-Up',skin:'#ffd6a5',suit:'#d7263d',cape:'#5f0f40',win:'MARKET SAVED!',
  taunts:['Ha! I mixed up the goods and services!','A haircut is a toy! Ha ha!','You will never sort my mess!','Producers, consumers, all mixed up!'],
  hurt:['Hey! You sorted that!','Oh no, you know your words!','Grr! Un-mixed again!']};
SCENES.market=[
  {at:'intro',title:'Chapter 1: Trouble in Market Town',lines:[['n','Market Town is where people make, sell, and buy things.'],['v','Ha ha! I am Professor Mix-Up! I mixed up all the goods and services!'],['n','Sort them back out to save the town, hero!']]},
  {at:'mid',title:'Chapter 2: The Shops Open Again',lines:[['v','Hey! The bakery is open again!'],['n','Every right answer puts a shop back in order.'],['v','You still cannot sort my resources! Natural! Capital! Human!']]},
  {at:'boss',title:'Chapter 3: The Mega Boss',lines:[['n','Professor Mix-Up grabbed every word and grew huge!'],['v','Now nobody knows a good from a service! Ha ha!'],['n','Use everything you learned, hero!']]},
  {at:'end',title:'The End: Market Town Is Saved',lines:[['v','Nooo! You know every word!'],['n','The shops are open and everything is in the right place.'],['n','You are a true Market Town hero!']]}
];

/* ---------- villain look ---------- */
const _villainSVG7=villainSVG;
villainSVG=function(v,w,mega){let s=_villainSVG7(v,w,mega);
  if(w==='market')s=s.replace('</svg>','<g><circle cx="75" cy="112" r="11" fill="#ffd23f" stroke="#14142b" stroke-width="2"/><text x="75" y="117" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="14" fill="#14142b">$</text></g></svg>');
  return s;};

/* ---------- builders ---------- */
const ecPic=(e,cls='')=>`<div class="pic ec${cls}">${e}</div>`;
const _build7=build;
build=function(s){
  if(!s||typeof s.t!=='string'||s.t[0]!=='e'||!['egs','epc','eres','emake','efill','edef','ematch','ecard'].includes(s.t))return _build7(s);
  const P={spec:s,type:'choice',layout:'',seq:[],text:'',hint:'',hintSeq:null};
  const bad=()=>build(GEN.gs());
  if(['egs','epc','eres','emake','efill'].includes(s.t)&&!Number.isInteger(s.i))return bad();
  const explain=k=>{P.correctSeq=[textKey('ex_',ECON_EXPLAIN[k])];P.onRight=()=>{const q=$('qbody');if(q&&!q.querySelector('.ecwhy')){const d=document.createElement('div');d.className='ecwhy';d.textContent=ECON_EXPLAIN[k];q.querySelector('.answers')?.after(d);}};};
  const clue=t=>{P.hint=t;P.hintSeq=[textKey('eh_',t)];};
  switch(s.t){
  case 'ecard':{const k=ECON_ORDER[SAFE.num(s.i,0,6)];const T=ECON_TERMS[k];P.type='ecard';P.ans='ok';
    P.html=`<div class="eccard"><div class="ecbig">${T.e}</div><div class="ecword">${T.w}</div><div class="ecdef">${T.d}</div><div class="ecex">${T.ex}</div>
      <div class="btnrow" style="justify-content:center"><button class="listen" data-hear>HEAR IT</button><button class="btn big green" id="ecGot">I got it!</button></div></div>`;
    P.seq=[textKey('ew_',T.w),textKey('ed_',T.d)];P.gap=.4;P.text=`${T.w}. ${T.d}`;P.label=`Word card: ${T.w}`;break;}
  case 'egs':{const x=GS_ITEMS[s.i];if(!x)return bad();P.ans=x[2];P.layout='pic two';
    P.choices=[{v:'good',html:'<span class="e">🧸</span>Good'},{v:'service',html:'<span class="e">💇</span>Service'}];
    P.html=`<div class="prompt">Is it a good or a service?</div>${ecPic(x[1])}<div class="qtext big">${x[0]}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['egs_q',textKey('ei_',x[0])];P.gap=.3;P.text=`Is it a good or a service? ${x[0]}.`;P.label=`Good or service: ${x[0]}`;
    explain(x[2]);break;}
  case 'epc':{const x=PC_ITEMS[s.i];if(!x)return bad();P.ans=x[2];P.layout='pic two';
    P.choices=[{v:'producer',html:'<span class="e">👩‍🌾</span>Producer'},{v:'consumer',html:'<span class="e">🛒</span>Consumer'}];
    P.html=`<div class="prompt">Producer or consumer?</div>${ecPic(x[1])}<div class="qtext big">${x[0]}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=[textKey('ep_',x[0]),'epc_q'];P.gap=.3;P.text=`${x[0]} Producer or consumer?`;P.label=`Producer or consumer: ${x[0]}`;
    explain(x[2]);break;}
  case 'eres':{const x=RES_ITEMS[s.i];if(!x)return bad();P.ans=x[2];P.layout='pic three';
    P.choices=['natural','capital','human'].map(k=>({v:k,html:`<span class="e">${RES_CHOICE[k][1]}</span>${RES_CHOICE[k][0]}`}));
    P.html=`<div class="prompt">What kind of resource is it?</div>${ecPic(x[1])}<div class="qtext big">${x[0]}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['eres_q',textKey('ei_',x[0])];P.gap=.3;P.text=`What kind of resource is it? ${x[0]}.`;P.label=`Resource: ${x[0]}`;
    explain(x[2]);break;}
  case 'emake':{const x=MAKE_ITEMS[s.i];const k=['natural','capital','human'].includes(s.k)?s.k:null;if(!x||!k)return bad();
    P.ans=x[k][0];P.layout='pic three';
    P.choices=shuffle(['natural','capital','human'].map(r=>({v:x[r][0],html:`<span class="e">${x[r][1]}</span>${x[r][0]}`})));
    const name={natural:'natural resource',capital:'capital resource',human:'human resource'}[k];
    P.html=`<div class="prompt">To make ${x.p}:</div>${ecPic(x.e)}<div class="qtext big">Which one is the <b>${name}</b>?</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=[textKey('em_','To make '+x.p+'.'),textKey('eq_','Which one is the '+name+'?')];P.gap=.3;P.text=`To make ${x.p}. Which one is the ${name}?`;P.label=`Make ${x.p}: ${name}`;
    clue(ECON_TERMS[k].d);P.correctSeq=[textKey('ex_',ECON_EXPLAIN[k])];
    P.onRight=()=>{const q=$('qbody');if(q&&!q.querySelector('.ecwhy')){const d=document.createElement('div');d.className='ecwhy';d.textContent=ECON_EXPLAIN[k];q.querySelector('.answers')?.after(d);}};break;}
  case 'efill':{const x=FILL_ITEMS[s.i];if(!x)return bad();const fam=FAMS[x[2]];
    const others=ECON_ORDER.filter(k=>!fam.includes(k));
    const opts=shuffle([...fam,...(fam.length<3?shuffle(others).slice(0,3-fam.length):[])]);
    P.ans=x[1];P.layout='txt three';P.choices=opts.map(k=>({v:k,html:BLANK_WORD[k]}));
    const parts=x[0].split('___');
    P.html=`<div class="prompt">Fill in the blank</div><div class="qtext big ecfill">${parts[0]}<span class="ecblank" id="ecBlank">?</span>${parts[1]||''}</div><button class="listen" data-hear>HEAR IT</button>`;
    P.seq=['efill_q',textKey('ef_',x[0].replace('___','blank'))];P.gap=.3;P.text=`Fill in the blank. ${x[0].replace('___','blank')}`;P.label=`Fill in: ${x[0]}`;
    P.onRight=()=>{const b=$('ecBlank');if(b){b.textContent=BLANK_WORD[x[1]];b.classList.add('done');}};P.correctSeq=[textKey('ef_',x[0].replace('___',BLANK_WORD[x[1]]))];
    clue(ECON_TERMS[x[1]].d);break;}
  case 'edef':{const k=ECON_ORDER.includes(s.k)?s.k:null;if(!k)return bad();const T=ECON_TERMS[k];
    const fam=Object.values(FAMS).find(f=>f.includes(k));
    const pool=shuffle([...new Set([...fam,...shuffle(ECON_ORDER.slice())])].filter(x=>x!==k)).slice(0,2);
    const opts=shuffle([k,...pool]);P.ans=k;
    if(s.r){P.layout='long';P.choices=opts.map(o=>({v:o,html:ECON_TERMS[o].m}));
      P.html=`<div class="prompt">What does it mean?</div>${ecPic(T.e)}<div class="problem word ecterm">${T.w}</div><button class="listen" data-hear>HEAR IT</button>`;
      P.seq=['edef_q2',textKey('ew_',T.w)];P.text=`What does ${T.w} mean?`;P.label=`Meaning of ${T.w}`;}
    else{P.layout='txt three';P.choices=opts.map(o=>({v:o,html:ECON_TERMS[o].w}));
      P.html=`<div class="prompt">Which word matches?</div><div class="qtext big">${T.m}</div><button class="listen" data-hear>HEAR IT</button>`;
      P.seq=['edef_q',textKey('em2_',T.m)];P.gap=.3;P.text=`Which word matches? ${T.m}.`;P.label=`Word for: ${T.m}`;}
    clue(T.d);P.correctSeq=[textKey('ew_',T.w),textKey('ed_',T.d)];break;}
  case 'ematch':{const ks=(Array.isArray(s.ks)?s.ks:[]).filter(k=>ECON_ORDER.includes(k));if(ks.length<3)return bad();
    P.type='ematch';P.ans='all';P.keys=[...new Set(ks)];
    const left=shuffle(P.keys.slice()),right=shuffle(P.keys.slice());
    P.html=`<div class="prompt">Match each word to what it means</div><div class="tiny">Tap a word, then tap its meaning.</div>
      <div class="ecmatch"><div class="eccol">${left.map(k=>`<button class="ecm ecw" data-k="${k}"><span class="e">${ECON_TERMS[k].e}</span>${ECON_TERMS[k].w}</button>`).join('')}</div>
      <div class="eccol">${right.map(k=>`<button class="ecm ecd" data-k="${k}">${ECON_TERMS[k].m}</button>`).join('')}</div></div>`;
    P.seq=['ematch_q'];P.text='Match each word to what it means. Tap a word, then tap its meaning.';P.label=`Match: ${P.keys.join(', ')}`;
    clue('Start with the word you know best. Tap the word to hear it, then find the meaning that fits.');break;}
  }
  return P;
};
const _wos7=worldOfSpec;
worldOfSpec=function(s){if(s&&['egs','epc','eres','emake','efill','edef','ematch','ecard'].includes(s.t))return 'market';return _wos7(s);};
const _cs7=choiceSpeech;
choiceSpeech=function(P,c){const t=P.spec&&P.spec.t;
  if(t==='egs'||t==='epc')return {seq:[textKey('ch_',c.v)],text:String(c.v)};
  if(t==='eres')return {seq:[textKey('ch_',RES_CHOICE[c.v][0])],text:RES_CHOICE[c.v][0]};
  if(t==='emake')return {seq:[textKey('ch_',c.v)],text:String(c.v)};
  if(t==='efill')return {seq:[textKey('ch_',BLANK_WORD[c.v])],text:BLANK_WORD[c.v]};
  if(t==='edef'){const T=ECON_TERMS[c.v];return P.spec.r?{seq:[textKey('em2_',T.m)],text:T.m}:{seq:[textKey('ew_',T.w)],text:T.w};}
  return _cs7(P,c);};

/* ---------- Raise my hand help ---------- */
Object.assign(HELP,{
  ecgs:[{v:()=>`<div class="teamguide"><div>🧸 <b>Good</b> = a thing you can touch</div><div>💇 <b>Service</b> = a job someone does for you</div></div>`,
    s:['A good is a thing you can touch, like a ball or an apple.','A service is a job someone does for you, like a haircut.','Ask yourself: can I hold it in my hands? If yes, it is a good.']}],
  ecpc:[{v:()=>`<div class="teamguide"><div>👩‍🌾 <b>Producer</b> = makes it or does the job</div><div>🛒 <b>Consumer</b> = buys it or uses it</div></div>`,
    s:['A producer makes goods or gives services, like a farmer growing corn.','A consumer buys or uses goods and services, like you buying ice cream.','Look at what the person is doing. Making or buying?']}],
  ecres:[{v:()=>`<div class="teamguide"><div>🌳 <b>Natural</b> = comes from nature</div><div>🔨 <b>Capital</b> = tools, machines, buildings</div><div>👷 <b>Human</b> = people working</div></div>`,
    s:['Natural resources come from nature, like water, trees, and soil.','Capital resources are tools and machines people made, like a hammer or a tractor.','Human resources are people working, like a farmer or a baker.']}],
  ecdef:[{v:()=>`<div class="teamguide">${ECON_ORDER.map(k=>`<div>${ECON_TERMS[k].e} <b>${ECON_TERMS[k].w}</b> = ${ECON_TERMS[k].m.toLowerCase()}</div>`).join('')}</div>`,
    s:['Listen to the clue again.','Think about which word fits the clue.','You can play Learn the Words to hear all of the words again.']}]
});
const _hid7=helpId;
helpId=function(P){const t=P.spec&&P.spec.t;
  if(t==='egs')return 'ecgs';if(t==='epc')return 'ecpc';if(t==='eres'||t==='emake')return 'ecres';if(t==='efill'||t==='edef'||t==='ematch')return 'ecdef';
  if(t==='ecard')return null;return _hid7(P);};

/* ---------- custom wiring: flash cards and matching ---------- */
function wireEcon(){
  if(!current)return;
  if(current.type==='ecard'){const b=$('ecGot');if(b)b.onclick=()=>{if(G.busy)return;G.tries=0;correct({seq:['ecard_ok'],text:'Great! On to the next word.',wait:900});};}
  if(current.type==='ematch'){let pickW=null,done=0;const P=current;const box=$('qbody');
    const ws=[...box.querySelectorAll('.ecw')],ds=[...box.querySelectorAll('.ecd')];
    const colors=['#7bdff2','#b2f7ef','#f7aef8','#c3f584','#ffb4a2','#cdb4db','#ffe5a8'];
    ws.forEach(b=>b.onclick=()=>{if(G.busy||b.disabled)return;ws.forEach(x=>x.classList.remove('sel'));b.classList.add('sel');pickW=b;
      say([textKey('ew_',ECON_TERMS[b.dataset.k].w)],ECON_TERMS[b.dataset.k].w);});
    ds.forEach(b=>b.onclick=()=>{if(G.busy||b.disabled)return;
      if(!pickW){say([textKey('em2_',ECON_TERMS[b.dataset.k].m)],ECON_TERMS[b.dataset.k].m);b.classList.add('peek');setTimeout(()=>b.classList.remove('peek'),600);return;}
      if(b.dataset.k===pickW.dataset.k){const c=colors[done%colors.length];[b,pickW].forEach(x=>{x.disabled=true;x.classList.remove('sel');x.classList.add('matched');x.style.background=c;});
        done++;sfx('click');pickW=null;
        if(done>=P.keys.length){G.busy=true;setTimeout(()=>correct({seq:['ematch_ok'],text:'You matched them all!',msg:'All matched!'}),500);}
        else say(['ematch_yes'],'Yes! That matches.');}
      else{b.classList.add('nope');setTimeout(()=>b.classList.remove('nope'),500);miss(b.dataset.k,{msg:'Not a match. Try another meaning.',seq:['ematch_no']});}});}
}

/* ---------- Learn the Words mission is a list of word cards ---------- */
function econLearnList(){return ECON_ORDER.map((k,i)=>({t:'ecard',i}));}

/* warm up the Market Town voice clips as soon as the world is picked, so questions speak right away */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.world.market');if(!b)return;
  preload(['egs_q','epc_q','eres_q','efill_q','edef_q','edef_q2','ematch_q','ematch_yes','ematch_no','ematch_ok','ecard_ok','plan_q',
    ...ECON_ORDER.map(k=>textKey('ew_',ECON_TERMS[k].w)),...['good','service','producer','consumer'].map(v=>textKey('ch_',v)),...['Natural','Capital','Human'].map(v=>textKey('ch_',v))]);},true);

/* read every word and meaning in the matching game, lighting each one up as it is read */
async function readMatch(){
  const P=current;if(!P||P.type!=='ematch')return;const run=++choiceRun;
  const items=[...$('qbody').querySelectorAll('.ecw'),...$('qbody').querySelectorAll('.ecd')];
  for(const b of items){
    if(run!==choiceRun||current!==P||G.busy)break;
    if(b.disabled)continue;
    const T=ECON_TERMS[b.dataset.k];const isW=b.classList.contains('ecw');
    b.classList.add('speaking');
    const ok=await sayWait([textKey(isW?'ew_':'em2_',isW?T.w:T.m)],isW?T.w:T.m);
    b.classList.remove('speaking');
    if(!ok)break;await pause(200);
  }
}
