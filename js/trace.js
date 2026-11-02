/* ================= TRACING =================
   Draws a big dotted letter/number. The child traces it with a finger, mouse, or stylus.
   Checking: how much of the shape was covered and how much ink stayed on the shape.
   (It does not check stroke order.) */
const Trace=(()=>{
  let cv,ctx,mask,maskCtx,glyph='',drawing=false,last=null,ink=[],onDone=null,size=0,startPt=null;
  const FONT=s=>`900 ${s}px Nunito, Arial Rounded MT Bold, Arial, sans-serif`;
  function mount(el,g,done){
    glyph=g;onDone=done;ink=[];
    el.innerHTML=`<div class="tracewrap"><canvas class="tracecv" aria-label="Tracing area for ${g}"></canvas></div>
      <div class="btnrow" style="justify-content:center"><button class="btn ghost" data-tclear>Start over</button><button class="btn" data-tdone>I'm done!</button></div>`;
    cv=el.querySelector('canvas');ctx=cv.getContext('2d');
    el.querySelector('[data-tclear]').onclick=()=>{ink=[];draw();};
    el.querySelector('[data-tdone]').onclick=()=>{const r=score();onDone&&onDone(r);};
    const fit=()=>{const w=Math.min(el.clientWidth||360,420);size=w;const dpr=window.devicePixelRatio||1;
      cv.style.width=w+'px';cv.style.height=w+'px';cv.width=w*dpr;cv.height=w*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);buildMask();draw();};
    (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(fit);fit();
    cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);drawing=true;last=pt(e);ink.push([last]);draw();};
    cv.onpointermove=e=>{if(!drawing)return;e.preventDefault();const p=pt(e);if(Math.hypot(p.x-last.x,p.y-last.y)<2)return;ink[ink.length-1].push(p);last=p;draw();};
    cv.onpointerup=cv.onpointercancel=()=>{drawing=false;};
  }
  function pt(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*size/r.width,y:(e.clientY-r.top)*size/r.height};}
  function fontSize(){return glyph.length>1?size*.62:size*.86;}
  function buildMask(){
    mask=document.createElement('canvas');mask.width=size;mask.height=size;maskCtx=mask.getContext('2d');
    maskCtx.fillStyle='#000';maskCtx.font=FONT(fontSize());maskCtx.textAlign='center';maskCtx.textBaseline='middle';
    maskCtx.fillText(glyph,size/2,size*.54);
    // start dot: first glyph pixel scanning top-left to bottom-right
    const d=maskCtx.getImageData(0,0,size,size).data;startPt=null;
    outer:for(let y=0;y<size;y+=2)for(let x=0;x<size;x+=2){if(d[(y*size+x)*4+3]>128){startPt={x,y:y+size*.03};break outer;}}
  }
  function draw(){
    if(!ctx)return;ctx.clearRect(0,0,size,size);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);
    // guide lines
    ctx.strokeStyle='#cfd8ff';ctx.lineWidth=2;ctx.setLineDash([]);
    [.2,.54,.88].forEach(f=>{ctx.beginPath();ctx.moveTo(10,size*f);ctx.lineTo(size-10,size*f);ctx.stroke();});
    // dotted glyph
    ctx.font=FONT(fontSize());ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#eef1f8';ctx.fillText(glyph,size/2,size*.54);
    ctx.setLineDash([6,8]);ctx.lineWidth=3;ctx.strokeStyle='#8a94b8';ctx.strokeText(glyph,size/2,size*.54);ctx.setLineDash([]);
    if(startPt){ctx.fillStyle='#2ec27e';ctx.beginPath();ctx.arc(startPt.x,startPt.y,11,0,7);ctx.fill();ctx.strokeStyle='#14142b';ctx.lineWidth=3;ctx.stroke();}
    // ink
    ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--hero')||'#2a9df4';
    ctx.lineWidth=Math.max(14,size*.05);ctx.lineCap='round';ctx.lineJoin='round';
    ink.forEach(s=>{ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));if(s.length===1)ctx.lineTo(s[0].x+.1,s[0].y);ctx.stroke();});
  }
  function score(){
    if(!mask)return{ok:false,cover:0,on:0};
    const md=maskCtx.getImageData(0,0,size,size).data;
    const ic=document.createElement('canvas');ic.width=size;ic.height=size;const ix=ic.getContext('2d');
    ix.strokeStyle='#000';ix.lineWidth=Math.max(26,size*.09);ix.lineCap='round';ix.lineJoin='round';
    ink.forEach(s=>{ix.beginPath();s.forEach((p,i)=>i?ix.lineTo(p.x,p.y):ix.moveTo(p.x,p.y));if(s.length===1)ix.lineTo(s[0].x+.1,s[0].y);ix.stroke();});
    const id=ix.getImageData(0,0,size,size).data;
    // thin ink (actual pen width) to measure how much stays on the shape
    const tc=document.createElement('canvas');tc.width=size;tc.height=size;const tx=tc.getContext('2d');
    tx.strokeStyle='#000';tx.lineWidth=6;tx.lineCap='round';
    ink.forEach(s=>{tx.beginPath();s.forEach((p,i)=>i?tx.lineTo(p.x,p.y):tx.moveTo(p.x,p.y));tx.stroke();});
    const td=tx.getImageData(0,0,size,size).data;
    // dilated mask for "on the shape" check
    const dm=document.createElement('canvas');dm.width=size;dm.height=size;const dx=dm.getContext('2d');
    dx.font=FONT(fontSize());dx.textAlign='center';dx.textBaseline='middle';dx.lineWidth=size*.07;dx.lineJoin='round';
    dx.fillText(glyph,size/2,size*.54);dx.strokeText(glyph,size/2,size*.54);
    const dd=dx.getImageData(0,0,size,size).data;
    let g=0,cov=0,t=0,on=0;
    for(let i=3;i<md.length;i+=16){
      if(md[i]>128){g++;if(id[i]>128)cov++;}
      if(td[i]>128){t++;if(dd[i]>128)on++;}
    }
    const cover=g?cov/g:0,onr=t?on/t:0;
    return{ok:cover>=.6&&onr>=.72&&t>20,cover:+cover.toFixed(2),on:+onr.toFixed(2)};
  }
  return{mount,score,_ink:()=>ink,_set:(strokes)=>{ink=strokes;draw();},_size:()=>size};
})();
