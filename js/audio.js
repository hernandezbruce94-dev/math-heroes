/* ================= SOUND ENGINE =================
   - Recorded hero + villain voice clips (audio/*.mp3), played with Web Audio so they work after the first tap.
   - Device voice fallback for anything not recorded (custom spelling words, etc.).
   - Sound effects and a looping theme song, generated in code. */
const AUDIO={soundOn:true,musicOn:true,voiceMode:'hero',unlocked:false};
let actx=null, masterGain=null, musicGain=null, voiceGain=null;
const synth=('speechSynthesis' in window)?window.speechSynthesis:null;
const HAS_CLIP=typeof CLIP_KEYS!=='undefined'?new Set(CLIP_KEYS):new Set();
const clipCache=new Map();
let playing=[], speakToken=0;

function getCtx(){
  try{
    if(!actx){
      actx=new (window.AudioContext||window.webkitAudioContext)();
      masterGain=actx.createGain();masterGain.connect(actx.destination);
      musicGain=actx.createGain();musicGain.gain.value=0;musicGain.connect(masterGain);
      voiceGain=actx.createGain();voiceGain.gain.value=1.15;voiceGain.connect(masterGain);
    }
    if(actx.state!=='running')actx.resume();
  }catch(e){}
  return actx;
}
function unlockAudio(){
  // Safari 17+: let Web Audio play even when the ringer switch is on silent
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  const c=getCtx();
  try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);}catch(e){}
  if(!AUDIO.unlocked&&synth){try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;synth.speak(u);}catch(e){}}
  if(!AUDIO.unlocked){AUDIO.unlocked=true;if(AUDIO.musicOn)Music.start();}
}
['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));

async function loadClip(k){
  if(clipCache.has(k))return clipCache.get(k);
  const p=fetch('audio/'+k+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})
    .then(b=>new Promise((res,rej)=>getCtx().decodeAudioData(b,res,rej))).catch(()=>null);
  clipCache.set(k,p);return p;
}
function preload(keys){keys.forEach(k=>{if(HAS_CLIP.has(k))loadClip(k)})}
function numKey(n){return 'n'+n}
function wordKey(w){return 'w_'+String(w).toLowerCase()}
function hasAll(seq){return seq.every(k=>HAS_CLIP.has(k))}
function stopVoice(){
  speakToken++;
  playing.forEach(s=>{try{s.stop()}catch(e){}});playing=[];
  if(synth)try{synth.cancel()}catch(e){}
  Music.duck(false);
}
/* say(seq, text): seq = array of clip keys. Falls back to the device voice reading `text`. */
async function say(seq,text,opts={}){
  if(!AUDIO.soundOn)return;
  if(typeof seq==='string'){text=text||seq;seq=null;}
  stopVoice();const tok=speakToken;
  if(seq&&seq.length&&AUDIO.voiceMode==='hero'&&hasAll(seq)){
    const bufs=await Promise.all(seq.map(loadClip));
    if(tok!==speakToken)return;
    if(bufs.every(Boolean)){
      const c=getCtx();let t=c.currentTime+0.05;
      Music.duck(true);
      bufs.forEach((b,i)=>{const s=c.createBufferSource();s.buffer=b;s.connect(voiceGain);s.start(t);playing.push(s);t+=b.duration+(opts.gap??0.06);
        if(i===bufs.length-1)s.onended=()=>{if(tok===speakToken)Music.duck(false)};});
      return;
    }
  }
  deviceSay(text);
}
function villainSay(key){
  if(!AUDIO.soundOn||AUDIO.voiceMode!=='hero'||!HAS_CLIP.has(key))return;
  loadClip(key).then(b=>{if(!b)return;const c=getCtx();const s=c.createBufferSource();s.buffer=b;const g=c.createGain();g.gain.value=.9;s.connect(g).connect(masterGain);s.start();});
}

/* ---- device voice (fallback / chosen in settings) ---- */
const MALE=[/Andrew/i,/Guy/i,/Christopher/i,/Brian/i,/Davis/i,/Eric/i,/Roger/i,/Steffan/i,/Ryan/i,/Thomas/i,
  /Google UK English Male/i,/Daniel/i,/Aaron/i,/Arthur/i,/Evan/i,/Nathan/i,/\bTom\b/i,/Rishi/i,/Alex\b/i,/David/i,/Mark/i,/Fred/i,/Ralph/i,/\bmale\b/i];
const isMale=v=>MALE.some(r=>r.test(v.name))&&!/female/i.test(v.name);
let voice=null, voiceList=[], userPickedVoice=false, lastUtter=null;
function maleRank(v){const i=MALE.findIndex(r=>r.test(v.name));return i<0?99:i}
function pickVoice(){if(!synth)return;const vs=synth.getVoices().filter(v=>/^en/i.test(v.lang));if(!vs.length)return;
  const males=vs.filter(isMale).sort((a,b)=>maleRank(a)-maleRank(b));
  voiceList=[...males,...vs.filter(v=>!isMale(v))];
  if(!userPickedVoice)voice=voiceList[0];
  if(typeof fillVoicePicker==='function')fillVoicePicker();}
if(synth){pickVoice();synth.onvoiceschanged=pickVoice;setTimeout(pickVoice,500);setTimeout(pickVoice,1500);}
function deviceSay(t){
  if(!synth||!t)return;
  const go=()=>{const u=new SpeechSynthesisUtterance(t);u.lang=voice?voice.lang:'en-US';if(voice)u.voice=voice;
    const male=voice&&isMale(voice);u.rate=male?.9:.88;u.pitch=male?.8:.55;u.volume=1;lastUtter=u;
    u.onstart=()=>Music.duck(true);u.onend=()=>Music.duck(false);synth.speak(u);};
  try{if(synth.paused)synth.resume();if(synth.speaking||synth.pending){synth.cancel();setTimeout(go,80);}else go();}catch(e){}
}

/* ---- sound effects ---- */
function tone(f,d,type='square',v=.08,slide){
  if(!AUDIO.soundOn)return;try{const c=getCtx();const o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,c.currentTime+d);
  g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);
  o.connect(g).connect(masterGain);o.start();o.stop(c.currentTime+d);}catch(e){}
}
function sfx(k){
  if(k==='click')tone(660,.08);
  if(k==='zap')tone(1200,.4,'sawtooth',.06,200);
  if(k==='boom')tone(120,.35,'triangle',.2,40);
  if(k==='wrong')tone(220,.25,'sine',.1,160);
  if(k==='super')[392,523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>tone(f,.15,'square',.06),i*70));
  if(k==='boss')[196,185,175].forEach((f,i)=>setTimeout(()=>tone(f,.3,'sawtooth',.07),i*250));
  if(k==='win')[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.25,'square',.07),i*150));
  if(k==='unlock')[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>tone(f,.2,'triangle',.09),i*110));
  if(k==='level')[523,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.14,'square',.06),i*90));
}

/* ---- theme song: a short heroic loop (lead, bass, drums) ---- */
const Music=(()=>{
  const BPM=126, step=60/BPM/2; // eighth notes
  const N=n=>440*Math.pow(2,(n-69)/12);
  // 32 eighth-note steps. 0 = rest
  const themes={
    normal:{lead:[67,0,67,72,0,74,76,0, 76,74,72,0,74,0,67,0, 69,0,69,72,0,74,77,0, 76,0,74,72,74,0,0,0],
            bass:[48,48,0,48,55,0,48,0, 53,53,0,53,57,0,53,0, 45,45,0,45,52,0,45,0, 55,55,0,55,50,0,55,0]},
    boss:{lead:[64,0,63,64,0,67,0,64, 62,0,60,62,0,64,0,0, 64,0,63,64,0,69,0,67, 66,0,64,62,63,0,0,0],
          bass:[40,40,0,40,40,0,43,0, 38,38,0,38,38,0,41,0, 40,40,0,40,40,0,45,0, 47,47,0,47,46,0,47,0]}
  };
  let theme='normal', timer=null, nextT=0, idx=0, base=.05, ducked=false;
  function note(f,t,d,type,v){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(musicGain);o.start(t);o.stop(t+d+.02);}
  function drum(t,kind){const len=kind==='k'?.12:.05;const b=actx.createBuffer(1,actx.sampleRate*len,actx.sampleRate);const d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,kind==='k'?6:3);
    const s=actx.createBufferSource();s.buffer=b;const f=actx.createBiquadFilter();f.type=kind==='k'?'lowpass':'highpass';f.frequency.value=kind==='k'?180:5000;
    const g=actx.createGain();g.gain.value=kind==='k'?.9:.25;s.connect(f).connect(g).connect(musicGain);s.start(t);}
  function tick(){
    if(!actx)return;
    while(nextT<actx.currentTime+.25){
      const th=themes[theme],i=idx%32;
      if(th.lead[i])note(N(th.lead[i]),nextT,step*.9,'square',.22);
      if(th.bass[i])note(N(th.bass[i]),nextT,step*.95,'triangle',.5);
      if(i%4===0)drum(nextT,'k'); if(i%2===1)drum(nextT,'h');
      nextT+=step;idx++;
    }
  }
  function level(){if(!musicGain)return;const v=AUDIO.musicOn?(ducked?base*.3:base):0;musicGain.gain.setTargetAtTime(v,actx.currentTime,.15);}
  return{
    start(){if(!AUDIO.musicOn||!getCtx())return;if(!timer){nextT=actx.currentTime+.1;idx=0;timer=setInterval(tick,60);}level();},
    stop(){if(timer){clearInterval(timer);timer=null;}level();},
    set(t){if(themes[t]&&t!==theme){theme=t;idx=0;}},
    duck(on){ducked=on;level();},
    refresh(){if(AUDIO.musicOn)this.start();else this.stop();}
  };
})();
