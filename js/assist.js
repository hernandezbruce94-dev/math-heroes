/* ================= ASSIST: read the answer choices aloud + "Need help?" worked examples =================
   Every line here has a recorded hero clip (see CLIP_KEYS). Anything missing falls back to the device voice. */

/* ---- stable key for a long text line ---- */
function textKey(pre,t){let h=5381;for(const c of String(t))h=((h<<5)+h+c.charCodeAt(0))>>>0;return pre+h.toString(36);}

/* ---- what to say for one answer choice ---- */
const SIGN_SAY={'>':['sign_gt','greater than'],'<':['sign_lt','less than'],'=':['sign_eq','equal to']};
const TEAM_SAY={sh:['team_sh','S H, shh'],ch:['team_ch','C H, ch'],th:['team_th','T H, th'],wh:['team_wh','W H, wuh']};
function timeKey(v){const [h,m]=String(v).split(':');return ['tm_'+(+h)+'_'+m, m==='00'?`${+h} o'clock`:`${+h} thirty`];}
function choiceSpeech(P,c){
  const v=c.v,t=P.spec.t;
  if(typeof v==='number')return {seq:[N(v)],text:String(v)};
  switch(t){
    case 'cmp':{const s=SIGN_SAY[v];return s?{seq:[s[0]],text:s[1]}:{seq:[N(+v)],text:String(v)};}
    case 'time':{const [k,tx]=timeKey(v);return {seq:[k],text:tx};}
    case 'coin':{
      if(/¢$/.test(v)){const n=parseInt(v,10);return {seq:[N(n),'cents'],text:n+' cents'};}
      const c2=COINS.find(x=>x.id===v||x.name===v);return {seq:['coin_'+c2.id],text:c2.name};}
    case 'miss':case 'begin':return {seq:['l_'+String(v).toLowerCase()],text:String(v)};
    case 'team':{const s=TEAM_SAY[v];return {seq:[s[0]],text:s[1]};}
    case 'measure':return {seq:['l_'+String(v).toLowerCase()],text:String(v)};
    case 'shape':{const sh=SHAPES.find(x=>x.name===v);return {seq:['sh_'+sh.id],text:v};}
    case 'sight':case 'rhyme':return {seq:[W(v)],text:String(v)};
    default:return {seq:[textKey('ch_',v)],text:String(v)};
  }
}
/* Hearing the choices would give the answer away when the skill IS recognizing the word by sight. */
function readsChoicesOK(P){return P&&P.type==='choice'&&P.spec.t!=='sight';}

/* ---- awaitable speech: resolves true when finished, false if something else interrupted it ---- */
function sayWait(seq,text,opts={}){
  return new Promise(async res=>{
    if(!AUDIO.soundOn)return res(true);
    stopVoice();const tok=speakToken;
    if(seq&&seq.length&&AUDIO.voiceMode==='hero'&&hasAll(seq)){
      const bufs=await Promise.all(seq.map(loadClip));
      if(tok!==speakToken)return res(false);
      if(bufs.every(Boolean)){
        const c=getCtx();let t=c.currentTime+0.05;Music.duck(true);
        bufs.forEach((b,i)=>{const s=c.createBufferSource();s.buffer=b;s.connect(voiceGain);s.start(t);playing.push(s);t+=b.duration+(opts.gap??0.06);
          if(i===bufs.length-1)s.onended=()=>{const ok=tok===speakToken;if(ok)Music.duck(false);res(ok);};});
        return;
      }
    }
    if(!synth||!text){return setTimeout(()=>res(tok===speakToken),400);}
    deviceSay(text);
    // device voices don't report reliably on every browser, so also estimate the length
    const est=Math.max(900,String(text).length*70);
    const poll=setInterval(()=>{if(tok!==speakToken){clearInterval(poll);res(false);}else if(!synth.speaking&&!synth.pending){clearInterval(poll);res(true);}},150);
    setTimeout(()=>{clearInterval(poll);res(tok===speakToken);},est+4000);
  });
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));

/* ---- read each answer choice, lighting up the button as it is read ---- */
let choiceRun=0;
async function readChoices(){
  if(!current||!readsChoicesOK(current))return;
  const run=++choiceRun,P=current;
  const btns=[...$('qbody').querySelectorAll('.answers .ans')];
  for(const b of btns){
    if(run!==choiceRun||current!==P||G.busy)break;
    if(b.disabled)continue;
    const c=P.choices.find(x=>String(x.v)===b.getAttribute('aria-label'));if(!c)continue;
    const sp=choiceSpeech(P,c);
    b.classList.add('speaking');
    const ok=await sayWait(sp.seq,sp.text);
    b.classList.remove('speaking');
    if(!ok)break;
    await pause(220);
  }
  btns.forEach(b=>b.classList.remove('speaking'));
}
function stopChoices(){choiceRun++;document.querySelectorAll('.ans.speaking').forEach(b=>b.classList.remove('speaking'));}

/* ================= HELP: a worked example of the same skill ================= */
const dotsRow=(n,cls='')=>'<div class="dots">'+Array.from({length:n},()=>`<span class="dot ${cls}"></span>`).join('')+'</div>';
const eqHTML=t=>`<div class="problem small hx">${t}</div>`;
const HELP={
  add_s:[
    {v:()=>`<div class="hrow">${dotsRow(4)}<span class="op">+</span>${dotsRow(3,'b')}</div>`+eqHTML('4 + 3 = 7'),
     s:["Let's try 4 plus 3.","Start with the bigger number, 4. Put it in your head.","Now count on 3 more: 5, 6, 7.","So 4 plus 3 equals 7."]},
    {v:()=>`<div class="hrow">${dotsRow(5)}<span class="op">+</span>${dotsRow(2,'b')}</div>`+eqHTML('5 + 2 = 7'),
     s:["Let's try 5 plus 2.","Start with the bigger number, 5.","Now count on 2 more: 6, 7.","So 5 plus 2 equals 7."]}],
  add_b:[
    {v:()=>`<div class="hrow">${dotsRow(9)}<span class="op">+</span>${dotsRow(4,'b')}</div>`+eqHTML('9 + 4 = 13'),
     s:["Let's try 9 plus 4.","Start with the bigger number, 9.","Count on 4 more: 10, 11, 12, 13.","So 9 plus 4 equals 13."]},
    {v:()=>`<div class="hrow">${dotsRow(8)}<span class="op">+</span>${dotsRow(5,'b')}</div>`+eqHTML('8 + 5 = 13'),
     s:["Let's try 8 plus 5.","Start with the bigger number, 8.","Count on 5 more: 9, 10, 11, 12, 13.","So 8 plus 5 equals 13."]}],
  sub:[
    {v:()=>`<div class="dots">${Array.from({length:7},(_,i)=>`<span class="dot ${i>=4?'x':''}"></span>`).join('')}</div>`+eqHTML('7 − 3 = 4'),
     s:["Let's try 7 take away 3.","Start with 7 dots.","Cross out 3 of them.","Count the dots that are left: 1, 2, 3, 4.","So 7 take away 3 equals 4."]},
    {v:()=>`<div class="dots">${Array.from({length:8},(_,i)=>`<span class="dot ${i>=6?'x':''}"></span>`).join('')}</div>`+eqHTML('8 − 2 = 6'),
     s:["Let's try 8 take away 2.","Start at 8 and count back 2: 7, 6.","So 8 take away 2 equals 6."]}],
  sub_b:[
    {v:()=>eqHTML('12 − 3 = 9'),s:["Let's try 12 take away 3.","Start at 12 and count back 3: 11, 10, 9.","So 12 take away 3 equals 9."]},
    {v:()=>eqHTML('14 − 5 = 9'),s:["Let's try 14 take away 5.","Start at 14 and count back 5: 13, 12, 11, 10, 9.","So 14 take away 5 equals 9."]}],
  missing:[
    {v:()=>`<div class="hrow">${dotsRow(5)}<span class="op">+</span>${dotsRow(3,'b')}</div>`+eqHTML('5 + <span class="q">3</span> = 8'),
     s:["Let's try 5 plus what makes 8.","Start at 5. Count up until you get to 8: 6, 7, 8.","You counted 3 times.","So 5 plus 3 makes 8. The missing number is 3."]},
    {v:()=>eqHTML('3 + <span class="q">4</span> = 7'),
     s:["Let's try 3 plus what makes 7.","Start at 3. Count up to 7: 4, 5, 6, 7.","You counted 4 times, so the missing number is 4."]}],
  doubles:[
    {v:()=>`<div class="hrow">${dotsRow(4)}<span class="op">+</span>${dotsRow(4,'b')}</div>`+eqHTML('4 + 4 = 8'),
     s:["Doubles are two of the same number.","4 plus 4 is like two hands with 4 fingers up.","Count them all: 8. So 4 plus 4 equals 8."]},
    {v:()=>eqHTML('3 + 3 = 6'),s:["Doubles are two of the same number.","3 plus 3: count 3, then 3 more: 4, 5, 6.","So 3 plus 3 equals 6."]}],
  neardouble:[
    {v:()=>eqHTML('4 + 4 = 8')+eqHTML('4 + 5 = 9'),
     s:["Use a double you know.","4 plus 4 is 8.","4 plus 5 is just one more, so it's 9."]}],
  story_add:[
    {v:()=>`<div class="pic">⭐⭐⭐ + ⭐⭐</div>`+eqHTML('3 + 2 = 5'),
     s:["Here's a story. A hero has 3 stars and gets 2 more.","Gets more means add.","3 plus 2 equals 5. The hero has 5 stars."]}],
  story_sub:[
    {v:()=>`<div class="pic">🐦🐦🐦🐦<span style="opacity:.35">🐦🐦</span></div>`+eqHTML('6 − 2 = 4'),
     s:["Here's a story. There are 6 birds. 2 fly away.","Fly away means take away.","6 take away 2 equals 4. There are 4 birds left."]}],
  time_00:[
    {v:()=>clockSVG(4,0),s:["The short hand tells the hour. It points to 4.","The long hand points straight up to 12. That means o'clock.","So the time is 4 o'clock. We write it 4:00."]},
    {v:()=>clockSVG(9,0),s:["The short hand tells the hour. It points to 9.","The long hand is on 12, so it's o'clock.","The time is 9 o'clock. We write it 9:00."]}],
  time_30:[
    {v:()=>clockSVG(7,30),s:["The long hand points down to 6. That means 30, or half past.","The short hand is between 7 and 8. Use the smaller number, 7.","So the time is 7 thirty. We write it 7:30."]},
    {v:()=>clockSVG(2,30),s:["The long hand is on 6. That means 30.","The short hand is between 2 and 3. Use the smaller number, 2.","The time is 2 thirty. We write it 2:30."]}],
  coin_id:[
    {v:()=>`<div class="coins helpcoins">${COINS.map(c=>`<div>${coinSVG(c)}<b>${c.name}</b><span>${c.cents}¢</span></div>`).join('')}</div>`,
     s:["Here are the coins.","A penny is brown. It is worth 1 cent.","A nickel is big and silver. It is worth 5 cents.","A dime is the smallest coin. It is worth 10 cents.","A quarter is the biggest coin. It is worth 25 cents."]}],
  coin_total:[
    {v:()=>`<div class="coins">${['dime','nickel','penny','penny'].map(id=>coinSVG(COINS.find(c=>c.id===id))).join('')}</div>`+eqHTML('10, 15, 16, 17 → 17¢'),
     s:["Start with the coin worth the most. The dime is 10.","Count on 5 for the nickel: 15.","Count on 1 for each penny: 16, 17.","So it's 17 cents."]},
    {v:()=>`<div class="coins">${['quarter','dime','penny'].map(id=>coinSVG(COINS.find(c=>c.id===id))).join('')}</div>`+eqHTML('25, 35, 36 → 36¢'),
     s:["Start with the quarter. That's 25.","Count on 10 for the dime: 35.","Count on 1 for the penny: 36. So it's 36 cents."]}],
  place:[
    {v:()=>blocksHTML(3,4)+eqHTML('3 tens + 4 ones = 34'),
     s:["Each tall bar is a ten. Count them by tens: 10, 20, 30.","Each small cube is a one. Count on: 31, 32, 33, 34.","3 tens and 4 ones make 34."]},
    {v:()=>blocksHTML(5,2)+eqHTML('5 tens + 2 ones = 52'),
     s:["Count the tall bars by tens: 10, 20, 30, 40, 50.","Then count the small cubes: 51, 52.","5 tens and 2 ones make 52."]}],
  sign:[
    {v:()=>`<div class="cmp">5 <span class="q">&lt;</span> 8</div>`,
     s:["The sign is like a hungry mouth. It always opens toward the bigger number.","8 is bigger than 5, so the mouth opens toward 8.","5 is less than 8."]}],
  bigsmall:[
    {v:()=>`<div class="cmp">42 <span class="op">and</span> 24</div>`,
     s:["Look at the tens first.","42 has 4 tens. 24 has only 2 tens.","So 42 is bigger, and 24 is smaller."]}],
  skip10:[{v:()=>`<div class="skiprow">${[10,20,30,40].map(x=>`<span class="sk">${x}</span>`).join('')}<span class="sk q">50</span></div>`,
     s:["When we count by tens, each number is 10 more.","10, 20, 30, 40.","10 more than 40 is 50."]}],
  skip5:[{v:()=>`<div class="skiprow">${[5,10,15,20].map(x=>`<span class="sk">${x}</span>`).join('')}<span class="sk q">25</span></div>`,
     s:["When we count by fives, each number is 5 more.","5, 10, 15, 20.","5 more than 20 is 25."]}],
  skip2:[{v:()=>`<div class="skiprow">${[2,4,6,8].map(x=>`<span class="sk">${x}</span>`).join('')}<span class="sk q">10</span></div>`,
     s:["When we count by twos, each number is 2 more.","2, 4, 6, 8.","2 more than 8 is 10."]}],
  nline10:[
    {v:()=>numberLineSVG(0,10,1,7,5),s:["Find a number you know. The 5 is in the middle.","The arrow is 2 marks past 5. Count on: 6, 7.","So the arrow points to 7."]},
    {v:()=>numberLineSVG(0,10,1,3,5),s:["Start at 0 and count the marks: 1, 2, 3.","So the arrow points to 3."]}],
  nline20:[{v:()=>numberLineSVG(0,20,1,13,5),s:["Find a number you know, like 10.","The arrow is 3 marks past 10. Count on: 11, 12, 13.","So the arrow points to 13."]}],
  nline100:[{v:()=>numberLineSVG(0,100,10,30,50),s:["On this number line, each mark is 10 more.","Count by tens from 0: 10, 20, 30.","So the arrow points to 30."]}],
  shape_name:[
    {v:()=>`<div class="shapeguide">${['circle','oval','triangle','square','rectangle','pentagon','hexagon'].map(id=>`<div>${shapeSVG(id)}<b>${SHAPES.find(s=>s.id===id).name}</b></div>`).join('')}</div>`,
     s:["Look at the sides and corners.","A circle is round with no corners. An oval is a stretched circle, like an egg.","A triangle has 3 sides.","A square has 4 sides that are all the same length.","A rectangle has 4 sides: 2 long and 2 short.","A pentagon has 5 sides, like a house shape.","A hexagon has 6 sides, like a honeycomb."]}],
  shape_solid:[
    {v:()=>`<div class="shapeguide">${['cube','sphere','cone','cylinder'].map(id=>`<div>${shapeSVG(id)}<b>${SHAPES.find(s=>s.id===id).name}</b></div>`).join('')}</div>`,
     s:["These shapes are solid, like real things you can hold.","A cube is like a block or a box.","A sphere is round like a ball.","A cone is like an ice cream cone or a party hat.","A cylinder is like a can of soup."]}],
  sides:[
    {v:()=>`<div class="shapebox">${shapeSVG('square')}</div>`,s:["Touch each straight side and count.","1, 2, 3, 4.","A square has 4 sides."]},
    {v:()=>`<div class="shapebox">${shapeSVG('triangle')}</div>`,s:["Touch each straight side and count.","1, 2, 3.","A triangle has 3 sides."]}],
  longshort:[
    {v:()=>`<div class="mbox"><div class="mrow"><b>A</b>${pencilSVG(9,'#e63946',34)}</div><div class="mrow"><b>B</b>${pencilSVG(5,'#2a9df4',34)}</div></div>`,
     s:["Line up the ends on one side.","Look at the other end. Pencil A sticks out farther.","So pencil A is longer, and pencil B is shorter."]}],
  units:[
    {v:()=>`<div class="mbox">${pencilSVG(3,'#ffd23f',40,true)}</div>`,
     s:["Count the cubes under the pencil, from one end to the other.","1, 2, 3.","The pencil is 3 cubes long."]}],
  ffam:[
    {v:()=>`<div class="ffam">${eqHTML('2 + 5 = 7')}${eqHTML('5 + 2 = 7')}${eqHTML('7 − 5 = 2')}${eqHTML('7 − 2 = 5')}</div>`,
     s:["A fact family uses the same three numbers. Let's use 2, 5, and 7.","2 plus 5 is 7, and 5 plus 2 is 7.","7 take away 5 is 2, and 7 take away 2 is 5.","If you know the adding fact, you know the take away facts too."]},
    {v:()=>`<div class="ffam">${eqHTML('3 + 6 = 9')}${eqHTML('9 − 6 = 3')}${eqHTML('9 − 3 = 6')}</div>`,
     s:["Let's use 3, 6, and 9.","3 plus 6 is 9.","So 9 take away 6 is 3, and 9 take away 3 is 6."]}],
  sight:[
    {v:()=>`<div class="problem word"><span class="hl">c</span>an</div>`,
     s:["Tap Hear It and listen to the word.","Say the word slowly. What sound does it start with?","For the word can, look for a word that starts with the letter C.","Then check the other letters too."]}],
  spell:[
    {v:()=>`<div class="slots helpslots">${'cat'.split('').map(l=>`<div class="slot f">${l}</div>`).join('')}</div>`,
     s:["Say the word slowly and listen for each sound.","Cat. C, a, t.","Find the letter for each sound, in order."]},
    {v:()=>`<div class="slots helpslots">${'dog'.split('').map(l=>`<div class="slot f">${l}</div>`).join('')}</div>`,
     s:["Say the word slowly and listen for each sound.","Dog. D, o, g.","Find the letter for each sound, in order."]}],
  miss:[
    {v:()=>`<div class="problem word">d<span class="hl">o</span>g</div>`,
     s:["Say the whole word slowly.","Dog. D, o, g.","The middle sound is o. So the missing letter is O."]}],
  rhyme:[
    {v:()=>`<div class="problem word">c<span class="hl">at</span> · h<span class="hl">at</span> · b<span class="hl">at</span></div>`,
     s:["Rhyming words sound the same at the end.","Cat, hat, and bat all end with at.","Listen for the word with the same ending sound."]}],
  begin:[
    {v:()=>`<div class="pic">⚽</div><div class="problem word"><span class="hl">b</span>all</div>`,
     s:["Say the word and listen to the very first sound.","Ball. Buh, buh, ball.","Ball starts with the letter B."]}],
  team:[
    {v:()=>`<div class="teamguide"><div><b>sh</b> 🚢 ship</div><div><b>ch</b> 🐥 chick</div><div><b>th</b> 👍 thumb</div><div><b>wh</b> 🐋 whale</div></div>`,
     s:["A letter team is two letters that make one sound.","S H says shh, like ship.","C H says ch, like chick.","T H says th, like thumb.","W H says wuh, like whale."]}],
  sentence:[
    {v:()=>`<div class="problem small hx"><span class="hl">T</span>he dog can run<span class="hl">.</span></div>`,
     s:["A sentence is words in an order that makes sense. The dog can run.","The first word gets a capital letter.","Telling sentences end with a period. Asking sentences end with a question mark.","Exciting sentences end with an exclamation mark."]}],
  trace:[
    {v:()=>`<div class="pic">🟢 ➜ ✏️</div>`,
     s:["Put your finger on the green dot.","Follow the dotted line. Try not to lift your finger.","Keep going all the way to the end, then tap I'm done."]}],
  water:[
    {v:()=>`<ol class="story helpstory">${STORY.map(x=>`<li>${x}</li>`).join('')}</ol>`,
     s:["Here's how the water cycle works.","The sun heats the water in lakes, rivers, and oceans.","The water turns into water vapor and goes up. This is evaporation.","The water vapor cools and makes clouds. This is condensation.","Rain, snow, sleet, or hail falls down. This is precipitation.","The water collects in lakes, rivers, and oceans, and the cycle starts again."]}],
  waterfacts:[
    {v:()=>`<div class="teamguide"><div>🏞️ Lakes and rivers: <b>fresh water</b></div><div>🪨 Ground water: <b>fresh water</b>, below ground</div><div>🐳 Ocean: <b>salt water</b>, above ground</div><div>🚰 Chesapeake: Lake Gaston, the Northwest River, and deep wells</div></div>`,
     s:["Lakes, rivers, and ground water are fresh water.","Ground water is below the ground. We get it from wells.","The ocean is salt water. We don't drink it.","Chesapeake gets its water from Lake Gaston, the Northwest River, and deep wells."]}]
};
/* pick the example set for the current problem, avoiding an example that matches the real question */
function helpId(P){
  const s=P.spec;
  switch(s.t){
    case 'arith':{
      if(s.dbl)return s.b===s.a?'doubles':'neardouble';
      if(s.k==='+')return s.a+s.b>10?'add_b':'add_s';
      if(s.k==='-')return s.a>10?'sub_b':'sub';
      return 'missing';}
    case 'story':return STORIES[s.i].op==='+'?'story_add':'story_sub';
    case 'time':return s.m===0?'time_00':'time_30';
    case 'coin':return s.k==='name'||s.k==='which'?'coin_id':'coin_total';
    case 'place':return 'place';
    case 'cmp':return s.ask==='sign'?'sign':'bigsmall';
    case 'skip':return 'skip'+s.step;
    case 'nline':return s.max===100?'nline100':s.max===20?'nline20':'nline10';
    case 'shape':{const sh=SHAPES.find(x=>x.id===s.id);return s.ask==='sides'?'sides':sh.solid?'shape_solid':'shape_name';}
    case 'measure':return s.k==='units'?'units':'longshort';
    case 'ffam':return 'ffam';
    case 'sight':return 'sight';case 'spell':return 'spell';case 'miss':return 'miss';
    case 'rhyme':return 'rhyme';case 'begin':return 'begin';case 'team':return 'team';
    case 'sent':return 'sentence';case 'trace':return 'trace';
    case 'water':return s.m==='wfacts'?'waterfacts':'water';
    case 'wstory':return 'water';
    case 'rq':return 'rq';
  }
  return null;
}
function hasHelp(P){try{return !!(P&&P.spec&&helpId(P)&&helpExample(P));}catch(e){return false;}}
function helpExample(P){
  const id=helpId(P);if(!id)return null;
  if(id==='rq'){const r=READS[P.spec.i];if(!r||!r.p[P.spec.j])return null;
    return {id,v:`<img class="comic thumb" src="img/story-${P.spec.i}.webp" alt=""><p class="helpcap">"${r.p[P.spec.j]}"</p>`,
      steps:[{k:'hp_rq_0',t:'Look back at the story. This part of the story has the answer.'},{k:'rd'+P.spec.i+'_p'+P.spec.j,t:r.p[P.spec.j]}]};}
  const list=HELP[id];
  // don't use the example if it is the same as the real question
  const nums=t=>(String(t).match(/\d+/g)||[]).map(Number);
  const qn=nums(P.label);
  const same=e=>{const en=nums(e.s[0]);return en.length>0&&en.every(x=>qn.includes(x));};
  const i=list.length>1&&same(list[0])?1:0;
  const ex=list[i];
  const extra=P.hintSeq&&P.hint&&(id==='water'||id==='waterfacts')?[{k:'hp_clue',t:'Here is a clue for this question.'},{k:P.hintSeq[0],t:P.hint}]:[];
  return {id,v:ex.v(),steps:[...ex.s.map((t,j)=>({k:`hp_${id}_${i}_${j}`,t})),...extra]};
}
let helpRun=0;
function openHelp(){
  if(!current||!hasHelp(current))return;
  stopChoices();stopVoice();
  const ex=helpExample(current);if(!ex)return;
  G.helps=(G.helps||0)+1;
  $('hpVis').innerHTML=ex.v;
  $('hpSteps').innerHTML=ex.steps.map((s,i)=>`<li data-st="${i}">${escapeHTML(s.t)}</li>`).join('');
  openModal('helpModal');
  playHelp(ex);
  $('hpAgain').onclick=()=>playHelp(ex);
}
async function playHelp(ex){
  const run=++helpRun;const lis=[...$('hpSteps').children];
  await pause(250);
  for(let i=0;i<ex.steps.length;i++){
    if(run!==helpRun||!$('helpModal').classList.contains('open'))break;
    lis.forEach((l,j)=>l.classList.toggle('reading',j===i));
    const ok=await sayWait([ex.steps[i].k],ex.steps[i].t);
    if(!ok)break;await pause(300);
  }
  lis.forEach(l=>l.classList.remove('reading'));
}
function closeHelp(){helpRun++;stopVoice();closeModal('helpModal');if(current&&!G.busy)setTimeout(()=>{speakCurrent();},250);}
