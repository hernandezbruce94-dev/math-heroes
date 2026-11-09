/* ================= v5: READING LAB (decoding, encoding, phonemic awareness, fluency) ================= */
/* Words split into sound chunks (graphemes). Pictures are emoji so they work on every device. */
const LAB_WORDS=[
  // level 1: short vowel CVC + two-sound words
  ['cat','🐱','c a t',1],['dog','🐶','d o g',1],['sun','☀️','s u n',1],['pig','🐷','p i g',1],['bus','🚌','b u s',1],
  ['hat','🎩','h a t',1],['bed','🛏️','b e d',1],['fox','🦊','f o x',1],['map','🗺️','m a p',1],['hen','🐔','h e n',1],
  ['bat','🦇','b a t',1],['bug','🐛','b u g',1],['web','🕸️','w e b',1],['box','📦','b o x',1],['van','🚐','v a n',1],
  ['log','🪵','l o g',1],['pin','📌','p i n',1],['ten','🔟','t e n',1],['cab','🚕','c a b',1],['net','🥅','n e t',1],
  ['egg','🥚','e gg',1],['bee','🐝','b ee',1],['key','🔑','k ey',1],
  // level 2: blends and digraphs
  ['frog','🐸','f r o g',2],['crab','🦀','c r a b',2],['drum','🥁','d r u m',2],['flag','🚩','f l a g',2],['ship','🚢','sh i p',2],
  ['fish','🐟','f i sh',2],['duck','🦆','d u ck',2],['chick','🐥','ch i ck',2],['hand','✋','h a n d',2],['tent','⛺','t e n t',2],
  ['clock','🕰️','c l o ck',2],['star','⭐','s t ar',2],['sled','🛷','s l e d',2],['truck','🚚','t r u ck',2],['brush','🪥','b r u sh',2],
  ['bell','🔔','b e ll',2],['ring','💍','r i ng',2],['milk','🥛','m i l k',2],['gift','🎁','g i f t',2],['swim','🏊','s w i m',2],
  ['nest','🪺','n e s t',2],['plant','🪴','p l a n t',2],['skunk','🦨','s k u n k',2],
  // level 3: three-letter blends and silent letters
  ['splash','💦','s p l a sh',3],['string','🧵','s t r i ng',3],['shrimp','🦐','sh r i m p',3],['squid','🦑','s qu i d',3],
  ['three','3️⃣','th r ee',3],['scrub','🧽','s c r u b',3],['strong','💪','s t r o ng',3],['screen','🖥️','s c r ee n',3],
  ['street','🛣️','s t r ee t',3],['knife','🔪','kn i f e',3],['knee','🦵','kn ee',3],['knot','🪢','kn o t',3],
  ['thumb','👍','th u mb',3],['lamb','🐑','l a mb',3],['sign','🪧','s i gn',3],['wrap','🌯','wr a p',3],['comb','🪮','c o mb',3]
].map(([w,e,ch,lv])=>({w,e,ch:ch.split(' '),lv}));
/* number of sounds = number of chunks, except a silent final e (knife) */
const soundCount=x=>x.ch.filter((c,i)=>!(c==='e'&&i===x.ch.length-1&&x.ch.length>2)).length;

/* Letter–keyword cues (letter names + a picture word), the way many phonics programs teach sounds */
const KEYWORDS={a:'apple',b:'ball',c:'cake',d:'doll',e:'elephant',f:'feather',g:'goat',h:'horse',i:'igloo',j:'jet',k:'kite',l:'leaf',
  m:'moon',n:'nose',o:'octopus',p:'panda',qu:'queen',r:'robot',s:'sock',t:'tiger',u:'umbrella',v:'violin',w:'wagon',x:'ax',y:'yo-yo',z:'zebra',
  sh:'shoe',ch:'cheese',th:'think',ck:'rock',ng:'sing',ee:'tree',ll:'doll',gg:'egg',ar:'car',kn:'knock',wr:'wrist',mb:'comb',gn:'gnat',ey:'monkey'};
const chunkSay=c=>[`ck_${c}`,`${c.toUpperCase().split('').join(' ')}. ${KEYWORDS[c]||''}.`];

/* Made-up "alien" words for decoding practice (short vowels, regular spelling) */
const ALIEN=[
  ['fim','fam','fom'],['gop','gip','gup'],['zub','zab','zeb'],['ret','rit','rot'],['lan','lin','lun'],['dut','dot','dit'],['hob','hab','heb'],['pid','pad','pud'],
  ['blim','blam','plim'],['frap','frip','trap'],['snog','snig','smog'],['trib','trab','drib'],['glet','glot','gret'],['plud','plad','blud'],['crob','crab','grob'],['stup','stip','slup'],
  ['strim','stram','scrim'],['splab','splob','sprab'],['scrut','scrat','strut'],['sprog','sprig','strog'],['thrip','thrap','shrip'],['squeb','squib','squab']
].map((a,i)=>({w:a[0],o:a.slice(1),lv:i<8?1:i<16?2:3}));

/* Blend families */
const BLENDS={1:['bl','cl','cr','dr','fl','fr','gl','pl','sl','sn','st','sw','tr','br'],2:['sh','ch','th','wh'],3:['scr','spr','spl','str','squ','thr','shr']};
const BLEND_WORDS=[
  ['black','bl'],['clock','cl'],['crab','cr'],['drum','dr'],['flag','fl'],['frog','fr'],['glad','gl'],['plant','pl'],['sled','sl'],['snack','sn'],['star','st'],['swim','sw'],['truck','tr'],['brush','br'],
  ['ship','sh'],['shop','sh'],['chick','ch'],['chin','ch'],['thumb','th'],['think','th'],['whale','wh'],['wheel','wh'],
  ['scrub','scr'],['screams','scr'],['scratch','scr'],['scrape','scr'],['screen','scr'],['scribble','scr'],['spread','spr'],['spray','spr'],['spring','spr'],
  ['splash','spl'],['split','spl'],['streak','str'],['strength','str'],['strong','str'],['string','str'],['streamer','str'],['street','str'],
  ['squeak','squ'],['squid','squ'],['three','thr'],['throw','thr'],['thread','thr'],['shrimp','shr']
].map(([w,b])=>({w,b,lv:b.length===3?3:['sh','ch','th','wh'].includes(b)?2:1}));

/* Silent letters: the letter at index i is silent (a silent final e is shown gray, it is not the answer) */
const SILENT=[['knot',0],['knock',0],['knee',0],['knit',0],['knife',0],['wrap',0],['wrong',0],['wrist',0],['wrote',0],['write',0],
  ['sign',2],['lamb',3],['thumb',4],['comb',3],['climb',4],['crumb',4]].map(([w,i])=>({w,i,e:/[^aeiou][aeiou][^aeiou]e$/.test(w)&&w.endsWith('e')}));

/* Syllables: how the word is said slowly, and where it splits */
const SYLL=[
  ['cat',['cat']],['ship',['ship']],['splash',['splash']],['frog',['frog']],
  ['sunset',['sun','set']],['cupcake',['cup','cake']],['picnic',['pic','nic']],['magnet',['mag','net']],['basket',['bas','ket']],['rabbit',['rab','bit']],
  ['napkin',['nap','kin']],['rocket',['rock','et']],['display',['dis','play']],['insect',['in','sect']],['popcorn',['pop','corn']],['backpack',['back','pack']],
  ['sandbox',['sand','box']],['goldfish',['gold','fish']],['streamer',['stream','er']],['scribble',['scrib','ble']],
  ['butterfly',['but','ter','fly']],['banana',['ba','na','na']],['computer',['com','pu','ter']],['dinosaur',['di','no','saur']]
].map(([w,p])=>({w,p}));
const SYLL_SAY={scribble:'scrib. bull.',streamer:'stream. er.',rocket:'rock. it.',dinosaur:'die. no. sore.',banana:'buh. nan. uh.',computer:'com. pew. ter.',butterfly:'but. ter. fly.'};
const syllSay=x=>SYLL_SAY[x.w]||x.p.join('. ')+'.';

/* Flip Fix: b/d/p/q and number reversals */
const FLIP_WORDS=[['bed','b','🛏️'],['bat','b','🦇'],['bus','b','🚌'],['bug','b','🐛'],['ball','b','⚽'],['box','b','📦'],
  ['dog','d','🐶'],['duck','d','🦆'],['drum','d','🥁'],['doll','d','🪆'],['dish','d','🍽️'],
  ['pig','p','🐷'],['pen','p','🖊️'],['pan','p','🍳'],['pin','p','📌'],['queen','q','👸']].map(([w,l,e])=>({w,l,e}));
const FLIP_GLYPHS=['2','3','4','5','6','7','9','b','d','J','S','Z'];

/* Read With Me: short decodable stories, one line at a time, then "who" and "what" questions */
const LSTORIES=[
  {t:'The Big Red Bus',l:['Sam has a big red bus.','The bus can go fast.','It stops at the shop.','Sam gets a hot dog.'],
   q:[{q:'Who has the bus?',a:['Sam','👦'],o:[['a cat','🐱'],['a hen','🐔']]},{q:'What does Sam get?',a:['a hot dog','🌭'],o:[['a cup','🥤'],['a hat','🎩']]}]},
  {t:'Splash!',l:['Liz and Max run to the pond.','Max jumps in. Splash!','A frog hops on a log.','Liz grins at the frog.'],
   q:[{q:'Who jumps in the pond?',a:['Max','👦'],o:[['a frog','🐸'],['a duck','🦆']]},{q:'What hops on the log?',a:['a frog','🐸'],o:[['a crab','🦀'],['a bug','🐛']]}]},
  {t:'The Strong Hero',l:['Captain Bolt is strong.','A truck is stuck in the mud.','He lifts the truck up!','The kids clap and yell.'],
   q:[{q:'Who is strong?',a:['Captain Bolt','🦸'],o:[['a pig','🐷'],['a bus','🚌']]},{q:'What is stuck in the mud?',a:['a truck','🚚'],o:[['a ship','🚢'],['a sled','🛷']]}]},
  {t:'Ned and the Kite',l:['Ned has a red kite.','The wind is strong.','The kite flies up, up, up!','Ned is glad.'],
   q:[{q:'Who has a kite?',a:['Ned','👦'],o:[['a fox','🦊'],['a hen','🐔']]},{q:'How does Ned feel?',a:['glad','😀'],o:[['sad','😢'],['mad','😠']]}]},
  {t:'Fish in a Net',l:['Jen has a net.','She dips it in the pond.','She gets a fish!','She lets the fish swim off.'],
   q:[{q:'Who has a net?',a:['Jen','👧'],o:[['a dog','🐶'],['a duck','🦆']]},{q:'What does Jen get?',a:['a fish','🐟'],o:[['a log','🪵'],['a frog','🐸']]}]},
  {t:'Three Ducks',l:['Three ducks swim in a stream.','A duck spots a bug.','Snap! It gets the bug.','The ducks swim on.'],
   q:[{q:'How many ducks are there?',a:['three','3️⃣'],o:[['two','2️⃣'],['five','5️⃣']]},{q:'What does the duck get?',a:['a bug','🐛'],o:[['a fish','🐟'],['a nut','🥜']]}]}
];

/* This week's spelling list from school (three-letter blends + silent letters) — grown-ups can load it in one tap */
const WEEK_LISTS=[{name:'Three-letter blends',words:['scrubs','screams','scratch','scrape','screen','spread','splash','spray','streak','strength','strong','squeak','three','throw','thread','wrote','knife','sign','streamer','scribble']}];

/* the new world */
MODES.lab=[
  {id:'sounds',name:'Sound Boxes',desc:'How many sounds?'},
  {id:'decode',name:'Read & Find',desc:'Read it, find the picture'},
  {id:'blends',name:'Blend Blasters',desc:'scr, spl, str and more'},
  {id:'alien',name:'Alien Words',desc:'Find the word you hear'},
  {id:'silent',name:'Silent Letter Spy',desc:'Find the quiet letter'},
  {id:'syll',name:'Syllable Split',desc:'Clap and split words'},
  {id:'flip',name:'Flip Fix',desc:'b or d? Which way?'},
  {id:'lread',name:'Read With Me',desc:'One line at a time'},
  {id:'labmix',name:'Lab Mix',desc:'A little of everything'}
];
BOSS.lab={id:'boss',name:'MEGA BOSS: The Mumbler',desc:'Unlock: stars in 3 missions'};
VILLAINS.lab={name:'The Mumbler',skin:'#b8c0ff',suit:'#3d348b',cape:'#1b1464',win:'SOUNDS SAVED!',
  taunts:['Mmm-hmm! I stole the letter sounds!','You cannot sound it out!','Mumble mumble! Try again!','Those letters are all mixed up!'],
  hurt:['Hey! You read that!','My sounds! They escaped!','Grr! You sounded it out!']};
SCENES.lab=[
  {at:'intro',title:'Chapter 1: The Silent Lab',lines:[['n','The Reading Lab is where words get their sounds.'],['v','Mumble mumble! I am The Mumbler! I stole every letter sound!'],['n','Sound out the words to set the sounds free, hero!']]},
  {at:'mid',title:'Chapter 2: Sounds Escape!',lines:[['v','Hey! My sounds are getting away!'],['n','Every word you read sets more sounds free.'],['v','I still have my hardest blends. Scr! Spl! Str!']]},
  {at:'boss',title:'Chapter 3: The Mega Boss',lines:[['n','The Mumbler grabbed every sound and grew huge!'],['v','Now nobody can read! Mumble ha ha!'],['n','Use every reading power you have, hero!']]},
  {at:'end',title:'The End: The Lab Is Saved',lines:[['v','Nooo! You can read everything!'],['n','The sounds are back in the words. The Reading Lab is saved!'],['n','You are a true reading hero!']]}
];
