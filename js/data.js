/* ================= CONTENT ================= */
const HEROES=[
  {id:'bolt',name:'Captain Bolt',power:'Lightning',suit:'#2a9df4',cape:'#e63946',mask:'#14142b',emblem:'bolt',blast:'#2a9df4',hair:'#3b2314',skin:'#f6c9a0'},
  {id:'blaze',name:'Blaze Girl',power:'Fire',suit:'#e63946',cape:'#ffd23f',mask:'#14142b',emblem:'star',blast:'#ff5a1f',hair:'#3b2314',skin:'#f6c9a0'},
  {id:'rex',name:'Iron Rex',power:'Super Strength',suit:'#2ec27e',cape:'#7b2cbf',mask:'#14142b',emblem:'plus',blast:'#2ec27e',hair:'#3b2314',skin:'#f6c9a0'},
  {id:'nova',name:'Star Nova',power:'Starlight',suit:'#7b2cbf',cape:'#2a9df4',mask:'#ffd23f',emblem:'star',blast:'#c77dff',hair:'#3b2314',skin:'#f6c9a0'}
];
/* Unlockable hero gear: earned with total stars */
const UNLOCKS=[
  {stars:0,  kind:'emblem',id:'bolt',  label:'Lightning emblem'},
  {stars:0,  kind:'emblem',id:'star',  label:'Star emblem'},
  {stars:0,  kind:'emblem',id:'plus',  label:'Plus emblem'},
  {stars:15, kind:'emblem',id:'heart', label:'Heart emblem'},
  {stars:30, kind:'emblem',id:'shield',label:'Shield emblem'},
  {stars:45, kind:'cape',  id:'#ff6ec7',label:'Pink cape'},
  {stars:60, kind:'blast', id:'rainbow',label:'Rainbow blast'},
  {stars:80, kind:'suit',  id:'#d4af37',label:'Gold suit'},
  {stars:100,kind:'cape',  id:'rainbow',label:'Rainbow cape'},
  {stars:130,kind:'emblem',id:'crown', label:'Crown emblem'},
  {stars:160,kind:'blast', id:'cosmic',label:'Cosmic blast'},
  {stars:200,kind:'suit',  id:'#1b1b1b',label:'Shadow suit'}
];
const COLORS=['#2a9df4','#e63946','#2ec27e','#7b2cbf','#ff8c00','#ffd23f','#14142b','#00b3a4'];
const SKINS=['#f6c9a0','#e0ac69','#c68642','#8d5524','#5c3a1e'];
const HAIRS=['#3b2314','#14142b','#a0522d','#e8c36a','#d9480f'];

const MODES={
  math:[
    {id:'add10',name:'Adding to 10',desc:'Like 3 + 4'},
    {id:'add20',name:'Adding to 20',desc:'Like 8 + 7'},
    {id:'sub10',name:'Taking Away',desc:'Like 9 − 3'},
    {id:'story',name:'Word Problems',desc:'Hero math stories'},
    {id:'time', name:'Telling Time',desc:'Hour & half hour'},
    {id:'coins',name:'Counting Coins',desc:'Penny, nickel, dime, quarter'},
    {id:'place',name:'Tens & Ones',desc:'Build big numbers'},
    {id:'compare',name:'Bigger or Smaller',desc:'Greater than, less than'},
    {id:'mix',  name:'Super Mix',desc:'A little of everything'}
  ],
  word:[
    {id:'sight',name:'Sight Word Spotter',desc:'Hear a word, find it'},
    {id:'spell',name:'Spell It!',desc:'Build the word with letters'},
    {id:'mylist',name:'My Spelling List',desc:'This week\'s words'},
    {id:'missing',name:'Missing Letter',desc:'Fix the broken word'},
    {id:'rhyme',name:'Rhyme Time',desc:'Words that sound alike'},
    {id:'begin',name:'First Sounds',desc:'What letter does it start with?'},
    {id:'teams',name:'Letter Teams',desc:'sh, ch, th, wh'},
    {id:'wordmix',name:'Word Mix',desc:'A little of everything'}
  ],
  water:[
    {id:'wvocab',name:'Water Words',desc:'Evaporation, lake, reservoir…'},
    {id:'wcycle',name:'Cycle Steps',desc:'What happens next?'},
    {id:'wfacts',name:'Fresh or Salt?',desc:'Kinds of water & Chesapeake'},
    {id:'wstory',name:'Tell the Story',desc:'Explain the water cycle'},
    {id:'wsay',name:'Say It Out Loud',desc:'Explain it with your voice'}
  ]
};
const BOSS={math:{id:'boss',name:'MEGA BOSS: Dr. Minus',desc:'Unlock: stars in 3 missions'},word:{id:'boss',name:'MEGA BOSS: The Scrambler',desc:'Unlock: stars in 3 missions'},water:{id:'boss',name:'MEGA BOSS: Dr. Drought',desc:'Unlock: stars in 3 missions'}};
const VILLAINS={
  math:{name:'Dr. Minus',skin:'#9be564',suit:'#5a189a',cape:'#3a0b4f',win:'CITY SAVED!',
    taunts:['Ha! Numbers are MY weapon!','You will never add it up!','Try again, little hero!','My math is too tricky!'],
    hurt:['Ouch! My numbers!','Nooo! You counted right!','Grr! Lucky guess!']},
  word:{name:'The Scrambler',skin:'#ff9ecd',suit:'#0f7173',cape:'#06393a',win:'WORDS SAVED!',
    taunts:['I mixed up all the letters!','You cannot read my tricks!','Try again, word hero!','Hee hee, spell THAT!'],
    hurt:['Ack! You read it!','My letters! Unscrambled!','Grr! Super spelling!']},
  water:{name:'Dr. Drought',skin:'#f4a259',suit:'#8c5a2b',cape:'#4a2c12',win:'WATER SAVED!',
    taunts:['I will dry up all the water!','No more rain for you!','Ha! Think again, hero!','My heat is too strong!'],
    hurt:['Splash! Not the water!','Nooo! You know the cycle!','Grr! Too smart!']}
};

/* Dolch sight words: pre-primer (level 1), primer (level 2), first grade (level 3) */
const SIGHT_LEVELS=[
  ['and','away','big','blue','can','come','down','find','for','funny','go','help','here','in','is','it','jump','little','look','make','me','my','not','one','play','red','run','said','see','the','three','to','two','up','we','where','yellow','you'],
  ['all','am','are','at','ate','be','black','brown','but','came','did','do','eat','four','get','good','have','he','into','like','must','new','no','now','on','our','out','please','pretty','ran','ride','saw','say','she','so','soon','that','there','they','this','too','under','want','was','well','went','what','white','who','will','with','yes'],
  ['after','again','an','any','as','ask','by','could','every','fly','from','give','going','had','has','her','him','his','how','just','know','let','live','may','of','old','once','open','over','put','round','some','stop','take','thank','them','then','think','walk','were','when']
];
const SIGHT=SIGHT_LEVELS.flat();

/* Picture words for spelling, by level */
const PICS=[
  ['cat','🐱'],['dog','🐶'],['sun','☀️'],['pig','🐷'],['bus','🚌'],['bed','🛏️'],['fox','🦊'],['bug','🐛'],
  ['hen','🐔'],['box','📦'],['hat','🎩'],['map','🗺️'],['cup','🥤'],['web','🕸️'],['bat','🦇'],['egg','🥚'],
  ['ant','🐜'],['net','🥅'],['pen','🖊️'],['van','🚐'],
  ['fish','🐟'],['frog','🐸'],['duck','🦆'],['star','⭐'],['ship','🚢'],['moon','🌙'],['tree','🌳'],['ball','⚽'],
  ['book','📖'],['cake','🎂'],['milk','🥛'],['crab','🦀'],['drum','🥁'],['nest','🪺'],['sock','🧦'],['king','🤴'],
  ['ring','💍'],['bell','🔔'],['hand','✋'],['lamp','💡'],
  ['snake','🐍'],['train','🚆'],['plant','🪴'],['truck','🚚'],['clock','🕐'],['sheep','🐑'],['skunk','🦨'],['smile','😀'],['chair','🪑']
];
const PIC_EMOJI=Object.fromEntries(PICS);
/* Rhyme families with pictures */
const RHYMES=[
  [['cat','🐱'],['hat','🎩'],['bat','🦇']],
  [['dog','🐶'],['frog','🐸'],['log','🪵']],
  [['bug','🐛'],['mug','☕'],['hug','🤗']],
  [['cake','🎂'],['snake','🐍'],['lake','🏞️']],
  [['bee','🐝'],['tree','🌳'],['key','🔑']],
  [['car','🚗'],['star','⭐'],['jar','🫙']],
  [['ring','💍'],['king','🤴'],['sing','🎤']],
  [['bell','🔔'],['shell','🐚']],
  [['fish','🐟'],['dish','🍽️']],
  [['boat','⛵'],['goat','🐐'],['coat','🧥']],
  [['moon','🌙'],['spoon','🥄']],
  [['hen','🐔'],['ten','🔟'],['pen','🖊️']],
  [['box','📦'],['fox','🦊'],['socks','🧦']],
  [['mouse','🐭'],['house','🏠']],
  [['bear','🐻'],['chair','🪑'],['pear','🍐']],
  [['clock','🕐'],['rock','🪨'],['sock','🧦']]
];
/* Letter teams */
const TEAMS=[
  ['ship','🚢','sh'],['sheep','🐑','sh'],['shell','🐚','sh'],['shoe','👟','sh'],['fish','🐟','sh'],['brush','🪥','sh'],
  ['chick','🐥','ch'],['cheese','🧀','ch'],['chair','🪑','ch'],['cherry','🍒','ch'],['lunch','🥪','ch'],
  ['thumb','👍','th'],['three','3️⃣','th'],['tooth','🦷','th'],['bath','🛁','th'],
  ['whale','🐳','wh'],['wheel','🛞','wh'],['whistle','📯','wh']
];
const ALPHA='abcdefghijklmnopqrstuvwxyz';

/* Word problem templates. Each piece is a clip key or a number. */
const STORIES=[
  {op:'+',pieces:['wp_there_are','A','wp_birds_tree','wp_then','B','wp_more_birds','wp_how_many_birds'],
   text:'There are {A} birds in a tree. Then {B} more birds fly in. How many birds are there now?',pic:'🐦'},
  {op:'+',pieces:['wp_hero_has','A','wp_apples','wp_she_gets','B','wp_more','wp_how_many_apples'],
   text:'A hero has {A} apples. She gets {B} more. How many apples does she have now?',pic:'🍎'},
  {op:'-',pieces:['wp_there_are','A','wp_balloons','B','wp_float_away','wp_how_many_balloons'],
   text:'There are {A} balloons. {B} balloons float away. How many balloons are left?',pic:'🎈'},
  {op:'-',pieces:['wp_villain_has','A','wp_cookies','wp_he_eats','B','wp_how_many_cookies'],
   text:'The villain has {A} cookies. He eats {B}. How many cookies are left?',pic:'🍪'}
];
const COINS=[
  {id:'penny',name:'Penny',cents:1,r:30,fill:'#c87533',label:'1¢'},
  {id:'nickel',name:'Nickel',cents:5,r:36,fill:'#b8bcc2',label:'5¢'},
  {id:'dime',name:'Dime',cents:10,r:27,fill:'#d6d9de',label:'10¢'},
  {id:'quarter',name:'Quarter',cents:25,r:42,fill:'#c9ccd1',label:'25¢'}
];

/* Water cycle questions, taken from the class Water Cycle Study Guide */
const WATER={
  wvocab:[
    {q:'Water is heated up and turns into water vapor (gas). What is it called?',a:'Evaporation',o:['Condensation','Precipitation','Reservoir'],pic:'♨️',h:'Evaporation: water is heated up and turns into water vapor (gas).'},
    {q:'Water vapor (gas) cools and turns back into tiny water drops (liquid). What is it called?',a:'Condensation',o:['Evaporation','Precipitation','Cycle'],pic:'☁️',h:'Condensation: the gas turns back into a liquid and forms clouds.'},
    {q:'Water falls down as rain, snow, sleet, or hail. What is it called?',a:'Precipitation',o:['Evaporation','Condensation','Ground water'],pic:'🌧️',h:'Precipitation: water falls down as rain, snow, sleet, or hail.'},
    {q:'A body of water that is completely surrounded by land.',a:'Lake',o:['Ocean','River','Cloud'],pic:'🏞️',h:'A lake is completely surrounded by land. It has fresh water.'},
    {q:'Flowing water that can empty into the ocean.',a:'River',o:['Lake','Puddle','Ground water'],pic:'🌊',h:'Rivers and streams flow and can empty into the ocean.'},
    {q:'The largest body of water on earth. It covers about 75% of the earth.',a:'Ocean',o:['Lake','River','Pond'],pic:'🌍',h:'The ocean is the largest body of water. It is salt water.'},
    {q:'Water that is under the ground, between rock layers.',a:'Ground water',o:['Ocean water','Rain','Clouds'],pic:'🪨',h:'Ground water (well water) is underground, between rock layers.'},
    {q:'A place where water is collected on earth, like a lake, pond, or puddle.',a:'Reservoir',o:['Cycle','Condensation','Evaporation'],pic:'💧',h:'A reservoir is a place where water is collected. It can be man made or natural.'},
    {q:'Something that repeats over and over again.',a:'Cycle',o:['Lake','Reservoir','Ocean'],pic:'🔄',h:'A cycle is continuous. It repeats over and over again.'},
    {q:'What powers the water cycle?',a:'The sun',o:['The moon','The wind','The ocean'],pic:'☀️',h:'The sun powers the water cycle by causing evaporation.'},
    {q:'Clouds, fog, and a foggy mirror after a hot shower are examples of…',a:'Condensation',o:['Evaporation','Precipitation','Ground water'],pic:'🌫️',h:'Clouds, fog, and water on the side of a cold glass are condensation.'},
    {q:'Rain, hail, snow, and sleet are kinds of…',a:'Precipitation',o:['Evaporation','Condensation','Reservoirs'],pic:'🌨️',h:'Rain, hail, snow, and sleet are precipitation.'},
    {q:'Lakes, ponds, the ocean, ground water, and puddles are all…',a:'Reservoirs',o:['Clouds','Cycles','Water vapor'],pic:'🏞️',h:'Lakes, ponds, ocean, ground water, and puddles are reservoirs.'},
    {q:'Which one is a cycle?',a:'The seasons',o:['A rock','A chair','A pencil'],pic:'🍂',h:'The water cycle, life cycle, seasons, and day and night are cycles.'}
  ],
  wcycle:[
    {q:'The sun heats the water. What happens first?',a:'Evaporation',o:['Precipitation','Condensation','Nothing'],pic:'☀️',h:'The sun heats water and it evaporates into water vapor.'},
    {q:'After evaporation, the water vapor cools and makes clouds. What is that?',a:'Condensation',o:['Precipitation','Evaporation','Ground water'],pic:'☁️',h:'Condensation: the gas cools and turns back into a liquid and forms clouds.'},
    {q:'After condensation, the drops get heavy and fall. What is that?',a:'Precipitation',o:['Evaporation','Condensation','Reservoir'],pic:'🌧️',h:'Precipitation: the drops get heavy and fall as rain, snow, sleet, or hail.'},
    {q:'Rain falls into a lake. What happens next?',a:'The sun heats it again',o:['The cycle ends','The water turns to rock','The lake flies away'],pic:'🔄',h:'The water cycle has no end. It keeps going over and over.'},
    {q:'What pulls the heavy water drops down to the earth?',a:'Gravity',o:['The wind','The moon','The clouds'],pic:'⬇️',h:'The drops get heavy and gravity pulls the water toward the earth.'},
    {q:'Evaporation turns liquid water into…',a:'Water vapor (gas)',o:['Ice','Rocks','Salt'],pic:'♨️',h:'Evaporation changes liquid water into water vapor (gas).'},
    {q:'Condensation turns water vapor (gas) back into…',a:'Tiny water drops (liquid)',o:['Sunshine','Sand','Wind'],pic:'💧',h:'Condensation turns water vapor back into tiny water drops (liquid).'},
    {q:'Does the water cycle have a beginning or an end?',a:'No, it keeps going',o:['Yes, it ends at night','Yes, it ends in winter','Yes, it starts on Monday'],pic:'🔄',h:'The water cycle does not have a beginning or an end. It happens all over the earth at the same time.'},
    {q:'Where does the water cycle happen?',a:'All over the earth',o:['Only in Chesapeake','Only at the beach','Only in the sky'],pic:'🌍',h:'The water cycle is happening all over the earth, all at the same time.'},
    {q:'What does the sun\'s energy make that warms the earth?',a:'Heat',o:['Snow','Clouds','Rocks'],pic:'☀️',h:'The sun\'s energy produces heat that warms the earth.'}
  ],
  wfacts:[
    {q:'Is a lake fresh water or salt water?',a:'Fresh water',o:['Salt water'],pic:'🏞️',h:'Lakes have fresh water.'},
    {q:'Is a river fresh water or salt water?',a:'Fresh water',o:['Salt water'],pic:'🌊',h:'Rivers and streams have fresh water.'},
    {q:'Is the ocean fresh water or salt water?',a:'Salt water',o:['Fresh water'],pic:'🐳',h:'The ocean is salt water.'},
    {q:'Is ground water fresh water or salt water?',a:'Fresh water',o:['Salt water'],pic:'🪨',h:'Ground water (well water) is fresh water.'},
    {q:'Can we drink ocean water?',a:'No, it is salt water',o:['Yes, it is fresh water'],pic:'🐟',h:'Ocean water is salt water. It is not used for drinking.'},
    {q:'Where is ground water?',a:'Below ground',o:['Above ground','In the clouds','On the moon'],pic:'⬇️',h:'Ground water is below ground.'},
    {q:'Where is ocean water?',a:'Above ground',o:['Below ground','In the clouds','Inside rocks'],pic:'🌊',h:'Ocean water is above ground.'},
    {q:'How are ground water and ocean water the same?',a:'Both are water',o:['Both are salty','Both are underground','Both are clouds'],pic:'💧',h:'Ground water and ocean water are both water.'},
    {q:'Chesapeake gets its water from…',a:'Lake Gaston',o:['The moon','A volcano','The Pacific Ocean'],pic:'🚰',h:'Chesapeake gets water from Lake Gaston, the Northwest River, and deep wells.'},
    {q:'Which river gives Chesapeake water?',a:'The Northwest River',o:['The Moon River','The Candy River','The Rainbow River'],pic:'🏞️',h:'Chesapeake gets water from the Northwest River.'},
    {q:'Chesapeake also gets water from deep…',a:'Wells',o:['Clouds','Caves','Volcanoes'],pic:'🪣',h:'Chesapeake gets water from deep wells around Chesapeake.'},
    {q:'Why is water important?',a:'We need it to survive',o:['It is only for fun','We do not need it','Only fish need it'],pic:'💧',h:'People, plants, and animals all need water to survive.'},
    {q:'How can animals get water?',a:'Drinking from lakes',o:['Eating rocks','From the moon','From the wind'],pic:'🦌',h:'Animals get water by eating plants, eating other animals, and drinking from lakes and rivers.'},
    {q:'The water cycle gives the earth a…',a:'Continuous supply of water',o:['Lot of sand','Big rainbow','Pile of rocks'],pic:'🌍',h:'The water cycle provides the earth with a continuous supply of water.'}
  ]
};
const STORY=[
  'The sun heats the water in lakes, rivers, and oceans.',
  'The water turns into water vapor (gas) and goes up. This is evaporation.',
  'The water vapor cools and turns into tiny drops that make clouds. This is condensation.',
  'The drops get heavy, and gravity pulls them down as rain, snow, sleet, or hail. This is precipitation.',
  'The water collects in lakes, rivers, oceans, and ground water. Then the cycle starts again. It never ends.'
];
const STORY_WRONG=['The clouds turn into rocks and stay in the sky.','The water cycle stops and never starts again.','The moon heats the water and makes it salty.','The water turns into sand and blows away.'];
/* Say It Out Loud: key ideas to listen for */
const SAY_PARTS=[
  {label:'The sun heats the water',words:['sun','heat','hot','warm'],tip:'say_tip_sun'},
  {label:'Evaporation: water turns into vapor (gas) and goes up',words:['evaporat','vapor','gas','steam','goes up','rise'],tip:'say_tip_evap'},
  {label:'Condensation: vapor cools and makes clouds',words:['condens','cloud','cool','fog'],tip:'say_tip_cond'},
  {label:'Precipitation: rain, snow, sleet, or hail falls',words:['precipitat','rain','snow','sleet','hail','fall'],tip:'say_tip_prec'},
  {label:'Water collects, and the cycle starts again',words:['collect','lake','ocean','river','again','repeat','over and over','never end','ground'],tip:'say_tip_again'}
];
