/* B4 F9 cabinet adapter.
   Presentation only: forwards input to existing core controls and mirrors core reel/status DOM.
   It does not own lotteries, probabilities, state transitions or payouts. */
(function(){
  function dots(){
    const n=15,c=(n-1)/2,out=[];
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const dx=x-c,dy=y-c,r=Math.hypot(dx,dy);
      const on=r<1.5||((Math.abs(dx)===Math.abs(dy)||dx===0||dy===0)&&r<5.4);
      out.push(`<i class="b4-dot ${on?'on':''}"></i>`);
    }
    return out.join('');
  }
  function ring(count=34){
    return Array.from({length:count},(_,i)=>{const a=i/count*Math.PI*2,x=50+Math.cos(a)*50,y=50+Math.sin(a)*50;return `<i class="b4-ring-dot" style="left:${x}%;top:${y}%;animation-delay:${i/count*1.8}s"></i>`}).join('');
  }
  function side(side,zone,colors){
    const leds=colors.map(c=>`<i class="b4-big-led" style="--c1:${c[0]};--c2:${c[1]}"></i>`).join('');
    return `<div class="b4-side-mech ${side} ${zone}"><div class="b4-mech-housing"><div class="b4-mech-prism"><div class="b4-mech-face cover"><i class="b4-led-bar"></i></div><div class="b4-mech-face leds">${leds}</div></div></div></div>`;
  }
  function mount(){
    if(document.querySelector('.b4-cabinet-stage')) return;
    const head=document.querySelector('.head');
    if(!head) return;
    const stage=document.createElement('section');
    stage.className='b4-cabinet-stage';
    stage.innerHTML=`<div class="b4-cabinet-label"><b>B4 CABINET PORT / PHASE 1</b><span>CORE LOGIC BRIDGE</span></div><div class="b4-cabinet" aria-label="Lupin B4 cabinet integrated core test">
      <div class="b4-body"></div><div class="b4-spine"></div>
      <section class="b4-top"><div class="b4-speaker left"></div><div class="b4-speaker right"></div><div class="b4-crown"></div><div class="b4-mesh left"></div><div class="b4-mesh center"></div><div class="b4-dot-circle"><div class="b4-dot-grid">${dots()}</div><div class="b4-ring">${ring()}</div></div><div class="b4-reel-box"><div class="b4-reel" data-b4-reel="0">---</div><div class="b4-reel" data-b4-reel="1">---</div><div class="b4-reel" data-b4-reel="2">---</div></div></section>
      <section class="b4-main-display"><div class="b4-screen"><strong id="b4VisualMode">NORMAL</strong><small id="b4VisualPhase">WAIT_BET</small></div></section>
      <section class="b4-deck"><div class="b4-deck-lip"></div><div class="b4-left-controls"><button class="b4-maxbet" type="button" aria-label="MAX BET"></button><button class="b4-start" type="button" aria-label="START"><i class="b4-start-knob"></i></button></div><div class="b4-stops"><button class="b4-stop" data-b4-stop="0" type="button"></button><button class="b4-stop" data-b4-stop="1" type="button"></button><button class="b4-stop" data-b4-stop="2" type="button"></button></div></section>
      <section class="b4-lower"><div class="b4-lower-led left"></div><div class="b4-lower-frame"><div class="b4-lower-art"></div></div><div class="b4-lower-led right"></div></section>
      <div class="b4-shell"><div class="b4-shoulder left"></div><div class="b4-shoulder right"></div><div class="b4-mid-shell left"></div><div class="b4-mid-shell right"></div><div class="b4-waist left"></div><div class="b4-waist right"></div><div class="b4-lower-shell left"></div><div class="b4-lower-shell right"></div>${side('left','upper',[["#ff4d72","#8b0c2a"],["#ff9c35","#883900"],["#ffe34f","#7a6000"]])}${side('right','upper',[["#ff4d72","#8b0c2a"],["#ff9c35","#883900"],["#ffe34f","#7a6000"]])}${side('left','middle',[["#4ff2c0","#046d55"],["#43a8ff","#0a3e95"],["#7c82ff","#34217f"]])}${side('right','middle',[["#4ff2c0","#046d55"],["#43a8ff","#0a3e95"],["#7c82ff","#34217f"]])}</div>
      <button class="b4-side-toggle" type="button">SIDE OPEN</button>
    </div>`;
    head.insertAdjacentElement('afterend',stage);

    const betSrc=document.getElementById('betButton');
    const startSrc=document.getElementById('leverButton');
    const stopSrc=[...document.querySelectorAll('.stop-controls [data-stop]')];
    const betBtn=stage.querySelector('.b4-maxbet');
    const startBtn=stage.querySelector('.b4-start');
    const stopBtns=[...stage.querySelectorAll('[data-b4-stop]')];
    betBtn.addEventListener('click',()=>{if(betSrc&&!betSrc.disabled)betSrc.click()});
    startBtn.addEventListener('click',()=>{if(startSrc&&!startSrc.disabled)startSrc.click()});
    stopBtns.forEach((b,i)=>b.addEventListener('click',()=>{const src=stopSrc[i];if(src&&!src.disabled)src.click()}));

    let open=false;
    const sideToggle=stage.querySelector('.b4-side-toggle');
    sideToggle.addEventListener('click',()=>{open=!open;stage.querySelectorAll('.b4-side-mech').forEach(el=>el.classList.toggle('open',open));sideToggle.textContent=open?'SIDE CLOSE':'SIDE OPEN'});

    const sourceReels=[...document.querySelectorAll('.reel-cell[data-reel]')];
    const visualReels=[...stage.querySelectorAll('[data-b4-reel]')];
    const mode=document.getElementById('mode'),phase=document.getElementById('phase');
    function sync(){
      visualReels.forEach((el,i)=>{const src=sourceReels[i];el.textContent=src?src.textContent.trim():'---';el.classList.toggle('spinning',!!src&&/SPIN|RUN|>>>|---/.test(src.textContent.trim()))});
      if(mode) document.getElementById('b4VisualMode').textContent=mode.textContent.trim()||'NORMAL';
      if(phase) document.getElementById('b4VisualPhase').textContent=phase.textContent.trim()||'WAIT_BET';
      betBtn.disabled=!betSrc||betSrc.disabled;startBtn.disabled=!startSrc||startSrc.disabled;stopBtns.forEach((b,i)=>b.disabled=!stopSrc[i]||stopSrc[i].disabled);
    }
    const obs=new MutationObserver(sync);
    [mode,phase,...sourceReels,betSrc,startSrc,...stopSrc].filter(Boolean).forEach(el=>obs.observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled']}));
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
