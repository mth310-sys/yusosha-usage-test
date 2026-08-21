(()=>{
  const cabinet=document.getElementById('cabinet');
  const stage=document.querySelector('.machine-stage');
  const dotGrid=document.getElementById('dotGrid');
  const ring=document.getElementById('ring');
  const sideUnits=document.getElementById('sideUnits');
  const sideToggle=document.getElementById('sideToggle');
  let sideOpen=false;

  /*
   * Fixed cabinet design geometry.
   * Safari and Home Screen may report different viewport heights, but that
   * must never change distances between cabinet parts. Only the whole cabinet
   * scale is allowed to change.
   */
  const DESIGN_WIDTH=390;
  const DESIGN_HEIGHT=844;
  const FIXED_LOWER_SHIFT=DESIGN_HEIGHT-528;

  const fitCabinet=()=>{
    const viewportWidth=stage.clientWidth||window.innerWidth;
    const viewportHeight=window.visualViewport?.height||window.innerHeight;
    const scale=Math.min(1,viewportWidth/DESIGN_WIDTH,viewportHeight/DESIGN_HEIGHT);

    cabinet.style.setProperty('--body-scale',String(scale));
    cabinet.style.setProperty('--body-height',`${DESIGN_HEIGHT}px`);
    cabinet.style.setProperty('--lower-shift',`${FIXED_LOWER_SHIFT}px`);
    stage.style.height=`${viewportHeight}px`;
  };
  fitCabinet();
  requestAnimationFrame(fitCabinet);
  window.addEventListener('resize',fitCabinet,{passive:true});
  window.visualViewport?.addEventListener('resize',fitCabinet,{passive:true});

  const n=15,c=(n-1)/2;
  for(let y=0;y<n;y++) for(let x=0;x<n;x++){
    const dx=x-c,dy=y-c,r=Math.hypot(dx,dy);
    const on=r<1.5||((Math.abs(dx)===Math.abs(dy)||dx===0||dy===0)&&r<5.4);
    const i=document.createElement('i');
    i.className='f9-dot'+(on?' on':'');
    dotGrid.appendChild(i);
  }
  for(let i=0;i<34;i++){
    const a=i/34*Math.PI*2;
    const dot=document.createElement('i');
    dot.className='f9-ring-dot';
    dot.style.left=`${50+Math.cos(a)*50}%`;
    dot.style.top=`${50+Math.sin(a)*50}%`;
    dot.style.animationDelay=`${i/34*1.8}s`;
    ring.appendChild(dot);
  }

  const topColors=[['#ff4d72','#8b0c2a'],['#ff9c35','#883900'],['#ffe34f','#7a6000']];
  const midColors=[['#4ff2c0','#046d55'],['#43a8ff','#0a3e95'],['#7c82ff','#34217f']];
  const makeUnit=(side,zone,colors)=>{
    const mech=document.createElement('div');
    mech.className=`f9-side-mech ${side} ${zone}`;
    const leds=colors.map(([c1,c2])=>`<i class="f9-big-led" style="--c1:${c1};--c2:${c2}"></i>`).join('');
    mech.innerHTML=`<div class="f9-mech-housing"><div class="f9-mech-prism"><div class="f9-mech-face cover"><i class="f9-led-bar"></i><i class="f9-prism-ridge"></i></div><div class="f9-mech-face leds">${leds}</div></div></div>`;
    sideUnits.appendChild(mech);
  };
  makeUnit('left','upper',topColors);makeUnit('right','upper',topColors);
  makeUnit('left','middle',midColors);makeUnit('right','middle',midColors);

  sideToggle.addEventListener('click',()=>{
    sideOpen=!sideOpen;
    document.querySelectorAll('.f9-side-mech').forEach(el=>el.classList.toggle('open',sideOpen));
    sideToggle.textContent=sideOpen?'SIDE CLOSE':'SIDE OPEN';
  });
})();
