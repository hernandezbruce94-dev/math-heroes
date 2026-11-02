/* ================= v4 CONTENT ================= */
MODES.math.splice(MODES.math.length-1,0,
  {id:'skip',name:'Skip Counting',desc:'Count by 2s, 5s, 10s'},
  {id:'nline',name:'Number Line',desc:'Where is the arrow?'},
  {id:'shapes',name:'Shapes',desc:'Names & sides'},
  {id:'measure',name:'Measuring',desc:'Longer, shorter, how long'},
  {id:'doubles',name:'Doubles',desc:'Like 6 + 6'},
  {id:'ffam',name:'Fact Families',desc:'3 + 4 = 7, so 7 − 4 = ?'},
  {id:'tracen',name:'Trace Numbers',desc:'Write with your finger'}
);
MODES.word.splice(MODES.word.length-1,0,
  {id:'read',name:'Hero Stories',desc:'Read a comic & answer'},
  {id:'sentence',name:'Sentence Builder',desc:'Words, capitals, end marks'},
  {id:'tracel',name:'Trace Letters',desc:'Write with your finger'}
);

/* Comic reading stories: 3 panels, 3 questions each. Image: img/story-N.webp (3 panels left to right) */
const READS=[
  {title:'Captain Bolt and the Lost Cat',hero:'bolt',
   p:['A little cat is up in a big tree.','Captain Bolt can fly. He flies up to the cat.','He brings the cat down. The girl says, "Thank you!"'],
   q:[{q:'Where is the cat?',a:'Up in a tree',o:['In a box','On a bus']},
      {q:'Who helps the cat?',a:'Captain Bolt',o:['Dr. Minus','A dog']},
      {q:'What does the girl say?',a:'Thank you!',o:['Go away!','Good night!']}]},
  {title:'Blaze Girl and the Rain',hero:'blaze',
   p:['It is hot. The plants are dry and sad.','Blaze Girl sees a big gray cloud.','Rain falls down. Now the plants are happy.'],
   q:[{q:'Why are the plants sad?',a:'They are dry',o:['They are cold','They are wet']},
      {q:'What does Blaze Girl see?',a:'A big gray cloud',o:['A red car','A fish']},
      {q:'How do the plants feel at the end?',a:'Happy',o:['Sad','Mad']}]},
  {title:'Iron Rex and the Big Rock',hero:'rex',
   p:['A big rock is on the road.','The bus can not go. The kids are stuck.','Iron Rex lifts the rock. The bus can go!'],
   q:[{q:'What is on the road?',a:'A big rock',o:['A cat','A cake']},
      {q:'Who is stuck?',a:'The kids on the bus',o:['The dog','The king']},
      {q:'What does Iron Rex do?',a:'He lifts the rock',o:['He eats lunch','He goes to sleep']}]},
  {title:'Star Nova at Night',hero:'nova',
   p:['It is night. The town is dark.','A boy is lost. He can not see.','Star Nova makes a bright light. The boy finds his way home.'],
   q:[{q:'When does the story happen?',a:'At night',o:['In the morning','At lunch']},
      {q:'What is wrong?',a:'A boy is lost',o:['A cat is in a tree','It is raining']},
      {q:'How does Star Nova help?',a:'She makes a bright light',o:['She sings a song','She runs away']}]},
  {title:'Dr. Minus Takes the Apples',hero:'bolt',
   p:['Dr. Minus takes ten apples from the shop.','The heroes count. Ten take away ten is zero!','Captain Bolt gets the apples back. The shop has ten again.'],
   q:[{q:'What does Dr. Minus take?',a:'Apples',o:['Hats','Books']},
      {q:'How many apples does he take?',a:'Ten',o:['Two','Five']},
      {q:'Who gets the apples back?',a:'Captain Bolt',o:['The Scrambler','A cat']}]},
  {title:'The Scrambler Mixes the Signs',hero:'rex',
   p:['The Scrambler mixes up the letters on the signs.','The STOP sign says POTS! The cars do not stop.','The heroes fix the sign. Now it says STOP again.'],
   q:[{q:'Who mixes up the letters?',a:'The Scrambler',o:['Iron Rex','A dog']},
      {q:'What does the mixed-up sign say?',a:'POTS',o:['CATS','DOGS']},
      {q:'What do the heroes do?',a:'They fix the sign',o:['They eat the sign','They hide']}]}
];

/* Sentence builder */
const SENTENCES=[
  {w:['the','cat','can','run'],m:'.',e:'🐱'},
  {w:['we','see','a','big','dog'],m:'.',e:'🐶'},
  {w:['the','sun','is','hot'],m:'.',e:'☀️'},
  {w:['my','hat','is','red'],m:'.',e:'🎩'},
  {w:['the','frog','can','jump'],m:'.',e:'🐸'},
  {w:['he','has','a','blue','ball'],m:'.',e:'⚽'},
  {w:['she','likes','to','read'],m:'.',e:'📖'},
  {w:['the','bus','is','big'],m:'.',e:'🚌'},
  {w:['can','you','see','the','moon'],m:'?',e:'🌙'},
  {w:['is','the','fish','red'],m:'?',e:'🐟'},
  {w:['do','you','like','cake'],m:'?',e:'🎂'},
  {w:['where','is','my','sock'],m:'?',e:'🧦'},
  {w:['look','at','the','big','fish'],m:'!',e:'🐠'},
  {w:['we','won','the','game'],m:'!',e:'🏆'},
  {w:['the','duck','can','swim'],m:'.',e:'🦆'},
  {w:['what','is','in','the','box'],m:'?',e:'📦'}
];
const SHAPES=[
  {id:'circle',name:'Circle',sides:0,lv:1},{id:'square',name:'Square',sides:4,lv:1},{id:'triangle',name:'Triangle',sides:3,lv:1},
  {id:'rectangle',name:'Rectangle',sides:4,lv:1},{id:'hexagon',name:'Hexagon',sides:6,lv:2},{id:'oval',name:'Oval',sides:0,lv:2},
  {id:'pentagon',name:'Pentagon',sides:5,lv:2},{id:'cube',name:'Cube',lv:3,solid:1},{id:'sphere',name:'Sphere',lv:3,solid:1},
  {id:'cone',name:'Cone',lv:3,solid:1},{id:'cylinder',name:'Cylinder',lv:3,solid:1}
];
const NUMWORD=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

/* Story mode: comic scenes. who: 'n' narrator (hero voice), 'v' villain, 'h' hero */
const SCENES={
  math:[
    {at:'intro',title:'Chapter 1: Trouble in Math City',lines:[['n','Math City is a happy place where everyone loves numbers.'],['v','Ha ha! I am Dr. Minus! I will take away all the numbers!'],['n','Only a hero with brain power can stop him. Let\'s go!']]},
    {at:'mid',title:'Chapter 2: Dr. Minus Gets Mad',lines:[['v','Grr! You keep solving my problems!'],['n','The city is cheering. Dr. Minus is building a giant number machine.'],['v','Next time, I will use ALL my tricks!']]},
    {at:'boss',title:'Chapter 3: The Mega Boss',lines:[['n','Dr. Minus has turned into Mega Dr. Minus!'],['v','Now I am too big to beat! Mwa ha ha!'],['n','Use every power you have, hero. The city needs you!']]},
    {at:'end',title:'The End: Math City Is Saved',lines:[['v','Nooo! You know too much math!'],['n','The numbers are back where they belong. Math City is saved!'],['n','You are a true math hero!']]}
  ],
  word:[
    {at:'intro',title:'Chapter 1: The Scrambled Town',lines:[['n','In Word World, words help everyone read signs and books.'],['v','Hee hee! I am The Scrambler! I will mix up every letter!'],['n','Read and spell to fix the words, hero!']]},
    {at:'mid',title:'Chapter 2: The Scrambler Strikes Back',lines:[['v','You keep fixing my scrambled words!'],['n','The books are glowing again. But The Scrambler has a new plan.'],['v','I will scramble the biggest book of all!']]},
    {at:'boss',title:'Chapter 3: The Mega Boss',lines:[['n','The Scrambler has become the Mega Scrambler!'],['v','No one can read my mega mix-up!'],['n','You can, hero. Show him your reading power!']]},
    {at:'end',title:'The End: Word World Is Saved',lines:[['v','Ack! You un-scrambled everything!'],['n','Every sign and every book is easy to read again.'],['n','You are a true word hero!']]}
  ],
  water:[
    {at:'intro',title:'Chapter 1: The Big Dry',lines:[['n','Water World needs the water cycle to keep everything alive.'],['v','I am Dr. Drought! I will dry up every lake and river!'],['n','Learn the water cycle to stop him, hero!']]},
    {at:'mid',title:'Chapter 2: Dr. Drought Turns Up the Heat',lines:[['v','You keep bringing back the rain!'],['n','The clouds are coming back. But Dr. Drought is getting stronger.'],['v','I will stop the whole water cycle!']]},
    {at:'boss',title:'Chapter 3: The Mega Boss',lines:[['n','Dr. Drought has become Mega Dr. Drought!'],['v','Not one drop of rain will fall!'],['n','The water cycle never ends, hero. Prove it!']]},
    {at:'end',title:'The End: Water World Is Saved',lines:[['v','Splash! My heat is gone!'],['n','The rain falls, the lakes fill up, and the cycle keeps going.'],['n','You are a true water hero!']]}
  ]
};
/* Sidekick pets */
const PETS=[
  {id:'dog',name:'Pup',e:'🐶'},{id:'cat',name:'Kitty',e:'🐱'},{id:'dragon',name:'Sparky',e:'🐲'},{id:'robot',name:'Bolt Bot',e:'🤖'},{id:'owl',name:'Hoot',e:'🦉'},{id:'dino',name:'Rexy',e:'🦖'}
];
const PET_STAGES=[[0,'Baby',.8],[25,'Kid',1],[75,'Super',1.2],[150,'Mega',1.4]];
const PET_TRICKS=[[0,'jump','Jump'],[10,'spin','Spin'],[25,'flip','Flip'],[45,'dance','Dance'],[70,'fly','Fly'],[100,'zoom','Zoom'],[140,'sparkle','Sparkle']];
