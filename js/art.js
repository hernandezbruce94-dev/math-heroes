/* ================= ART (SVG) ================= */
function emblemSVG(e){
  const st='stroke="#14142b" stroke-width="2"';
  switch(e){
    case 'bolt':return `<path d="M72 92 62 108h8l-4 14 14-18h-8l4-12z" fill="#ffd23f" ${st}/>`;
    case 'plus':return `<path d="M66 98h8v-8h6v8h8v6h-8v8h-6v-8h-8z" fill="#ffd23f" ${st}/>`;
    case 'heart':return `<path d="M75 116c-12-8-15-13-15-18a7 7 0 0 1 15-3 7 7 0 0 1 15 3c0 5-3 10-15 18z" fill="#e63946" ${st}/>`;
    case 'shield':return `<path d="M75 90l12 4v8c0 8-5 13-12 16-7-3-12-8-12-16v-8z" fill="#2a9df4" ${st}/><path d="M75 96v18" stroke="#ffd23f" stroke-width="3"/>`;
    case 'crown':return `<path d="M62 112l-2-16 8 7 7-11 7 11 8-7-2 16z" fill="#ffd23f" ${st}/>`;
    default:return `<path d="M75 90l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#ffd23f" ${st}/>`;
  }
}
function capeFill(c,id){return c==='rainbow'?`url(#rb${id})`:c}
let svgUid=0;
function heroSVG(h,size=140){
  const id=++svgUid;
  return `<svg viewBox="0 0 150 160" width="${size}" height="${size}" aria-hidden="true">
  <defs><linearGradient id="rb${id}" x1="0" x2="1"><stop offset="0" stop-color="#e63946"/><stop offset=".25" stop-color="#ff8c00"/><stop offset=".5" stop-color="#ffd23f"/><stop offset=".75" stop-color="#2ec27e"/><stop offset="1" stop-color="#2a9df4"/></linearGradient></defs>
  <path d="M45 80 20 150h110L105 80z" fill="${capeFill(h.cape,id)}" stroke="#14142b" stroke-width="4"/>
  <rect x="50" y="78" width="50" height="58" rx="14" fill="${h.suit}" stroke="#14142b" stroke-width="4"/>
  <circle cx="75" cy="104" r="16" fill="#fff" stroke="#14142b" stroke-width="3"/>${emblemSVG(h.emblem)}
  <rect x="30" y="84" width="20" height="12" rx="6" fill="${h.suit}" stroke="#14142b" stroke-width="4" transform="rotate(-30 40 90)"/>
  <rect x="100" y="84" width="20" height="12" rx="6" fill="${h.suit}" stroke="#14142b" stroke-width="4" transform="rotate(30 110 90)"/>
  <rect x="56" y="132" width="14" height="20" rx="5" fill="#14142b"/><rect x="80" y="132" width="14" height="20" rx="5" fill="#14142b"/>
  <circle cx="75" cy="50" r="30" fill="${h.skin||'#f6c9a0'}" stroke="#14142b" stroke-width="4"/>
  <path d="M45 46c8-26 52-26 60 0-10-8-50-8-60 0z" fill="${h.hair||'#3b2314'}" stroke="#14142b" stroke-width="3"/>
  <path d="M48 46h54v12c-10 4-17-2-27-2s-17 6-27 2z" fill="${h.mask}" stroke="#14142b" stroke-width="2"/>
  <ellipse cx="63" cy="51" rx="6" ry="4" fill="#fff"/><ellipse cx="87" cy="51" rx="6" ry="4" fill="#fff"/>
  <path d="M64 66q11 9 22 0" fill="none" stroke="#14142b" stroke-width="4" stroke-linecap="round"/></svg>`;
}
function villainSVG(v,w,mega){
  const sz=mega?170:140;
  let head='',chest='';
  if(w==='water'){
    head=`<g stroke="#ff8c00" stroke-width="5" stroke-linecap="round"><path d="M75 4v12M45 14l7 9M105 14l-7 9M30 40h10M110 40h10"/></g>`;
    chest=`<path d="M75 94c-8 10-10 14-10 18a10 10 0 0 0 20 0c0-4-2-8-10-18z" fill="#2a9df4" stroke="#14142b" stroke-width="2"/><path d="M62 96 88 122" stroke="#e63946" stroke-width="5" stroke-linecap="round"/>`;
  } else if(w==='word'){
    head=`<path d="M48 30l8-16 8 14 11-18 11 18 8-14 8 16" fill="#ffd23f" stroke="#14142b" stroke-width="3"/>`;
    chest=`<text x="75" y="114" text-anchor="middle" font-family="Bangers" font-size="22" fill="#ffd23f" stroke="#14142b" stroke-width="1">?!</text>`;
  } else {
    head=`<path d="M45 30q30-30 60 0" fill="none" stroke="#14142b" stroke-width="6"/>`;
    chest=`<rect x="60" y="100" width="30" height="8" rx="4" fill="#e63946" stroke="#14142b" stroke-width="2"/>`;
  }
  const horns=mega?`<path d="M50 28 38 6l20 14M100 28l12-22-20 14" fill="#e63946" stroke="#14142b" stroke-width="3"/>`:'';
  return `<svg viewBox="0 0 150 160" width="${sz}" height="${sz*1.07}" aria-hidden="true">
  <path d="M40 80 22 150h106L110 80z" fill="${v.cape}" stroke="#14142b" stroke-width="4"/>
  <rect x="48" y="78" width="54" height="60" rx="12" fill="${v.suit}" stroke="#14142b" stroke-width="4"/>${chest}
  <rect x="56" y="134" width="14" height="18" rx="5" fill="#14142b"/><rect x="80" y="134" width="14" height="18" rx="5" fill="#14142b"/>
  ${horns}<circle cx="75" cy="48" r="30" fill="${v.skin}" stroke="#14142b" stroke-width="4"/>
  <path d="M52 40l16 6M98 40l-16 6" stroke="#14142b" stroke-width="5" stroke-linecap="round"/>
  <circle cx="63" cy="52" r="5" fill="#e63946"/><circle cx="87" cy="52" r="5" fill="#e63946"/>
  <path d="M62 68q13-8 26 0" fill="none" stroke="#14142b" stroke-width="4" stroke-linecap="round"/>${head}</svg>`;
}
function clockSVG(h,m){
  const ha=((h%12)+m/60)*30, ma=m*6;
  let ticks='';for(let i=1;i<=12;i++){const a=i*30*Math.PI/180;ticks+=`<text x="${100+72*Math.sin(a)}" y="${100-72*Math.cos(a)+8}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#14142b">${i}</text>`;}
  return `<svg viewBox="0 0 200 200" width="190" height="190" role="img" aria-label="Clock">
  <circle cx="100" cy="100" r="94" fill="#fff" stroke="#14142b" stroke-width="7"/>${ticks}
  <line x1="100" y1="100" x2="${100+46*Math.sin(ha*Math.PI/180)}" y2="${100-46*Math.cos(ha*Math.PI/180)}" stroke="#e63946" stroke-width="10" stroke-linecap="round"/>
  <line x1="100" y1="100" x2="${100+68*Math.sin(ma*Math.PI/180)}" y2="${100-68*Math.cos(ma*Math.PI/180)}" stroke="#2a9df4" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="7" fill="#14142b"/></svg>`;
}
function coinSVG(c){
  const r=c.r, s=r*2+8;
  return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" role="img" aria-label="${c.name}">
  <circle cx="${s/2}" cy="${s/2}" r="${r}" fill="${c.fill}" stroke="#14142b" stroke-width="3"/>
  <circle cx="${s/2}" cy="${s/2}" r="${r-6}" fill="none" stroke="#14142b55" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="${s/2}" y="${s/2+7}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="${r>32?20:17}" fill="#14142b">${c.label}</text></svg>`;
}
function blocksHTML(tens,ones){
  let h='<div class="blocks">';
  for(let i=0;i<tens;i++)h+='<div class="rod">'+'<i></i>'.repeat(10)+'</div>';
  h+='<div class="unitcol">'+'<i></i>'.repeat(ones)+'</div></div>';
  return h;
}
const CYCLE_SVG=`<svg class="cycle-svg" viewBox="0 0 520 280" role="img" aria-label="Water cycle: the sun heats water, evaporation, condensation, precipitation, then water collects and the cycle repeats">
<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 8 4 0 8z" fill="#14142b"/></marker></defs>
<rect width="520" height="280" rx="16" fill="#cdeefa"/>
<circle cx="468" cy="44" r="26" fill="#ffd23f" stroke="#14142b" stroke-width="3"/>
<text x="468" y="88" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="13" fill="#14142b">Sun</text>
<path d="M0 210 70 140 140 200 190 170 260 210z" fill="#7cb342" stroke="#14142b" stroke-width="3"/>
<rect x="0" y="210" width="260" height="70" fill="#8d6e63" stroke="#14142b" stroke-width="3"/>
<rect x="260" y="210" width="260" height="70" fill="#2a9df4" stroke="#14142b" stroke-width="3"/>
<g fill="#fff" stroke="#14142b" stroke-width="3"><ellipse cx="90" cy="58" rx="56" ry="22"/><ellipse cx="270" cy="50" rx="52" ry="20"/></g>
<g stroke="#1976d2" stroke-width="4" stroke-linecap="round"><path d="M62 92v14M82 96v14M102 92v14M122 96v14M72 118v12M112 118v12"/></g>
<g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M380 198c-7-10 7-17 0-28s7-17 0-28"/><path d="M410 198c-7-10 7-17 0-28s7-17 0-28"/><path d="M440 198c-7-10 7-17 0-28s7-17 0-28"/></g>
<g fill="none" stroke="#14142b" stroke-width="3" marker-end="url(#ar)">
<path d="M410 128Q390 70 330 56"/><path d="M216 46Q182 34 152 48"/><path d="M180 232Q220 246 290 240"/></g>
<g font-family="Nunito" font-weight="900" fill="#14142b">
<rect x="336" y="98" width="130" height="24" rx="12" fill="#fff" stroke="#14142b" stroke-width="2"/><text x="401" y="115" text-anchor="middle" font-size="14">1. Evaporation</text>
<rect x="202" y="72" width="136" height="24" rx="12" fill="#fff" stroke="#14142b" stroke-width="2"/><text x="270" y="89" text-anchor="middle" font-size="14">2. Condensation</text>
<rect x="132" y="96" width="136" height="24" rx="12" fill="#fff" stroke="#14142b" stroke-width="2"/><text x="200" y="113" text-anchor="middle" font-size="14">3. Precipitation</text>
<text x="130" y="262" text-anchor="middle" font-size="13" fill="#fff">Ground water (fresh)</text>
<text x="390" y="262" text-anchor="middle" font-size="13" fill="#fff">Ocean (salt water)</text></g></svg>`;

/* ---------- v4 art ---------- */
function numberLineSVG(min,max,step,at,labelEvery){
  const W=600,P=30,span=max-min,x=v=>P+(v-min)/span*(W-2*P);
  let t='';for(let v=min;v<=max;v+=step){const big=(v-min)%labelEvery===0;t+=`<line x1="${x(v)}" y1="${big?44:50}" x2="${x(v)}" y2="${big?76:70}" stroke="#14142b" stroke-width="${big?4:2}"/>`;
    if(big&&v!==at)t+=`<text x="${x(v)}" y="104" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#14142b">${v}</text>`;}
  return `<svg viewBox="0 0 ${W} 120" class="nline" role="img" aria-label="Number line from ${min} to ${max}">
  <line x1="${P-14}" y1="60" x2="${W-P+14}" y2="60" stroke="#14142b" stroke-width="5"/>
  <path d="M${P-22} 60l12-9v18zM${W-P+22} 60l-12-9v18z" fill="#14142b"/>${t}
  <path d="M${x(at)} 40l-14-24h28z" fill="#e63946" stroke="#14142b" stroke-width="3"/>
  <text x="${x(at)}" y="104" text-anchor="middle" font-family="Bangers" font-size="30" fill="#e63946">?</text></svg>`;
}
function shapeSVG(id,size=170){
  const st='stroke="#14142b" stroke-width="6"',f='#2a9df4';
  const polys={triangle:'85,18 155,150 15,150',square:'25,25 145,25 145,145 25,145',rectangle:'10,45 160,45 160,125 10,125',
    hexagon:'50,18 120,18 158,85 120,152 50,152 12,85',pentagon:'85,14 160,70 132,154 38,154 10,70'};
  let body='';
  if(polys[id])body=`<polygon points="${polys[id]}" fill="${f}" ${st} stroke-linejoin="round"/>`;
  else if(id==='circle')body=`<circle cx="85" cy="85" r="68" fill="${f}" ${st}/>`;
  else if(id==='oval')body=`<ellipse cx="85" cy="85" rx="76" ry="50" fill="${f}" ${st}/>`;
  else if(id==='cube')body=`<polygon points="30,60 110,60 110,140 30,140" fill="#2a9df4" ${st}/><polygon points="30,60 60,30 140,30 110,60" fill="#7cc4fa" ${st}/><polygon points="110,60 140,30 140,110 110,140" fill="#1b6fb3" ${st}/>`;
  else if(id==='sphere')body=`<circle cx="85" cy="85" r="68" fill="url(#sg)" ${st}/><ellipse cx="85" cy="85" rx="68" ry="20" fill="none" stroke="#14142b55" stroke-width="3" stroke-dasharray="6 6"/>`;
  else if(id==='cone')body=`<path d="M85 14 150 140 A65 18 0 0 1 20 140z" fill="#ff8c00" ${st}/><ellipse cx="85" cy="140" rx="65" ry="18" fill="#ffb04d" ${st}/>`;
  else if(id==='cylinder')body=`<path d="M25 40v95a60 18 0 0 0 120 0V40" fill="#2ec27e" ${st}/><ellipse cx="85" cy="40" rx="60" ry="18" fill="#7be0b0" ${st}/>`;
  return `<svg viewBox="0 0 170 170" width="${size}" height="${size}" role="img" aria-label="shape"><defs><radialGradient id="sg" cx=".35" cy=".35"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#1b6fb3"/></radialGradient></defs>${body}</svg>`;
}
function pencilSVG(len,color='#ffd23f',unit=44,cubes=false){
  const w=len*unit;
  let c='';if(cubes)for(let i=0;i<len;i++)c+=`<rect x="${i*unit+1}" y="44" width="${unit-2}" height="${unit-2}" fill="${i%2?'#2ec27e':'#2a9df4'}" stroke="#14142b" stroke-width="2"/>`;
  return `<svg viewBox="0 0 ${w+4} ${cubes?92:44}" width="${Math.min(w+4,620)}" role="img" aria-label="pencil ${len} long" style="max-width:100%">
  <rect x="2" y="6" width="${w-34}" height="30" rx="4" fill="${color}" stroke="#14142b" stroke-width="3"/>
  <rect x="2" y="6" width="16" height="30" rx="4" fill="#ff9eb5" stroke="#14142b" stroke-width="3"/>
  <path d="M${w-32} 6 L${w+2} 21 L${w-32} 36z" fill="#f6c9a0" stroke="#14142b" stroke-width="3" stroke-linejoin="round"/>
  <path d="M${w-8} 17 L${w+2} 21 L${w-8} 25z" fill="#14142b"/>${c}</svg>`;
}
function petHTML(p,big){
  const pet=PETS.find(x=>x.id===p.id)||PETS[0];
  const st=petStage(p.xp);
  const acc=st.i>=2?'<span class="pet-cape"></span>':'';
  const crown=st.i>=3?'<span class="pet-crown">👑</span>':'';
  return `<span class="pet ${big?'big':''}" style="--ps:${st.scale}" data-pet>${acc}<span class="pet-e">${pet.e}</span>${crown}</span>`;
}
function petStage(xp){let s={i:0,name:PET_STAGES[0][1],scale:PET_STAGES[0][2]};PET_STAGES.forEach((x,i)=>{if(xp>=x[0])s={i,name:x[1],scale:x[2]}});return s;}
