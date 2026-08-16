/* =========================================================
   F7 Motion Test
   MOTION 1: 軽量せり出し
   MOTION 2: 複合役物 + Safari対応SVGネイティブ回転
========================================================= */
(function initF7MotionTest(){
  const machine=document.getElementById('machine');
  const controls=document.querySelector('.test-controls');
  const jewelsGroup=machine?.querySelector('.jewels');
  if(!machine||!controls||!jewelsGroup)return;

  /* 各ジュエルをSVG <g>で包む。外側g=回転、内側polygon=移動/拡縮。 */
  const originalPolygons=[...jewelsGroup.querySelectorAll(':scope > polygon')];
  const rotors=[];
  originalPolygons.forEach((poly,i)=>{
    const box=poly.getBBox();
    const rotor=document.createElementNS('http://www.w3.org/2000/svg','g');
    rotor.classList.add('jewel-rotor',i%2===0?'rotor-left':'rotor-right');
    rotor.dataset.index=String(i);
    rotor.dataset.cx=String(box.x+box.width/2);
    rotor.dataset.cy=String(box.y+box.height/2);
    poly.classList.add('motion-jewel',i%2===0?'jewel-left':'jewel-right',`jewel-step-${Math.floor(i/2)+1}`);
    jewelsGroup.insertBefore(rotor,poly);
    rotor.appendChild(poly);
    rotors.push(rotor);
  });

  const fins=[...machine.querySelectorAll('.fins path')];
  fins.forEach((p,i)=>p.classList.add(i%2===0?'fin-left':'fin-right'));

  const style=document.createElement('style');
  style.textContent=`
    .motion-test-btn{border-color:#7e5f13!important;color:#fff0a0!important}
    .motion-test-btn.active{background:linear-gradient(#70450b,#211300)!important;color:#fff!important;box-shadow:inset 0 0 8px #000!important}
    .motion-role-btn{border-color:#9b4f16!important;color:#ffe0ad!important}
    .motion-role-btn.active{background:linear-gradient(#7a2607,#241006)!important;color:#fff!important;box-shadow:inset 0 0 8px #000!important}
    .motion-jewel,.fins path{transform-box:fill-box;transform-origin:center;will-change:transform,opacity}

    /* MOTION 1 */
    .machine.motion-test .jewel-left{animation:f7JewelLeft 3.6s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-test .jewel-right{animation:f7JewelRight 3.6s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-test .jewel-step-2{animation-delay:.12s}.machine.motion-test .jewel-step-3{animation-delay:.24s}
    .machine.motion-test .jewel-step-4{animation-delay:.36s}.machine.motion-test .jewel-step-5{animation-delay:.48s}.machine.motion-test .jewel-step-6{animation-delay:.60s}
    .machine.motion-test .fin-left{animation:f7FinLeft 3.6s ease-in-out infinite}.machine.motion-test .fin-right{animation:f7FinRight 3.6s ease-in-out infinite}
    .machine.motion-test .display-window,.machine.motion-test .reel-window{will-change:transform;animation:f7DepthPulse 3.6s ease-in-out infinite}.machine.motion-test .reel-window{animation-delay:.12s}

    @keyframes f7JewelLeft{0%,10%,88%,100%{transform:translate3d(0,0,0) scale(1);opacity:.86}28%,58%{transform:translate3d(8px,0,0) scale(1.055);opacity:1}70%{transform:translate3d(3px,0,0) scale(1.02);opacity:.96}}
    @keyframes f7JewelRight{0%,10%,88%,100%{transform:translate3d(0,0,0) scale(1);opacity:.86}28%,58%{transform:translate3d(-8px,0,0) scale(1.055);opacity:1}70%{transform:translate3d(-3px,0,0) scale(1.02);opacity:.96}}
    @keyframes f7FinLeft{0%,14%,86%,100%{transform:translate3d(0,0,0)}32%,60%{transform:translate3d(3px,0,0)}}
    @keyframes f7FinRight{0%,14%,86%,100%{transform:translate3d(0,0,0)}32%,60%{transform:translate3d(-3px,0,0)}}
    @keyframes f7DepthPulse{0%,14%,86%,100%{transform:translate3d(0,0,0) scale(1)}34%,58%{transform:translate3d(0,-1px,0) scale(1.012)}}

    /* MOTION 2: polygon側は移動/拡縮。rotateはJSで外側gへ適用。 */
    .machine.motion-role .jewel-left{animation:f7RoleLeft 5.2s cubic-bezier(.18,.8,.22,1) infinite}
    .machine.motion-role .jewel-right{animation:f7RoleRight 5.2s cubic-bezier(.18,.8,.22,1) infinite}
    .machine.motion-role .jewel-step-2{animation-delay:.10s}.machine.motion-role .jewel-step-3{animation-delay:.20s}
    .machine.motion-role .jewel-step-4{animation-delay:.30s}.machine.motion-role .jewel-step-5{animation-delay:.40s}.machine.motion-role .jewel-step-6{animation-delay:.50s}
    .machine.motion-role .fin-left{animation:f7RoleFinLeft 5.2s ease-in-out infinite}.machine.motion-role .fin-right{animation:f7RoleFinRight 5.2s ease-in-out infinite}
    .machine.motion-role .display-window{will-change:transform,opacity;animation:f7RoleDisplay 5.2s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-role .reel-window{will-change:transform;animation:f7RoleReel 5.2s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-role .lower-panel{will-change:transform;animation:f7RoleLower 5.2s ease-in-out infinite}
    .machine.motion-role .display-led,.machine.motion-role .reel-led{will-change:transform,opacity;animation:f7RoleBezel 5.2s ease-in-out infinite}

    @keyframes f7RoleLeft{0%,8%,92%,100%{transform:translate3d(0,0,0) scale(1);opacity:.82}20%{transform:translate3d(-3px,0,0) scale(1.02);opacity:.92}36%,52%{transform:translate3d(12px,-1px,0) scale(1.085);opacity:1}65%{transform:translate3d(7px,2px,0) scale(1.055);opacity:1}78%{transform:translate3d(3px,0,0) scale(1.025);opacity:.95}}
    @keyframes f7RoleRight{0%,8%,92%,100%{transform:translate3d(0,0,0) scale(1);opacity:.82}20%{transform:translate3d(3px,0,0) scale(1.02);opacity:.92}36%,52%{transform:translate3d(-12px,-1px,0) scale(1.085);opacity:1}65%{transform:translate3d(-7px,-2px,0) scale(1.055);opacity:1}78%{transform:translate3d(-3px,0,0) scale(1.025);opacity:.95}}
    @keyframes f7RoleFinLeft{0%,12%,90%,100%{transform:translate3d(0,0,0) rotate(0deg)}32%,58%{transform:translate3d(5px,0,0) rotate(5deg)}68%{transform:translate3d(2px,1px,0) rotate(-3deg)}}
    @keyframes f7RoleFinRight{0%,12%,90%,100%{transform:translate3d(0,0,0) rotate(0deg)}32%,58%{transform:translate3d(-5px,0,0) rotate(-5deg)}68%{transform:translate3d(-2px,-1px,0) rotate(3deg)}}
    @keyframes f7RoleDisplay{0%,18%,88%,100%{transform:translate3d(0,0,0) scale(1);opacity:1}38%,56%{transform:translate3d(0,-3px,0) scale(1.026)}66%{transform:translate3d(0,1px,0) scale(1.012);opacity:.98}}
    @keyframes f7RoleReel{0%,22%,88%,100%{transform:translate3d(0,0,0) scale(1)}42%,60%{transform:translate3d(0,-2px,0) scale(1.022)}70%{transform:translate3d(0,1px,0) scale(1.01)}}
    @keyframes f7RoleLower{0%,24%,88%,100%{transform:translate3d(0,0,0) scale(1)}46%,62%{transform:translate3d(0,2px,0) scale(1.015)}}
    @keyframes f7RoleBezel{0%,18%,88%,100%{transform:scale(1);opacity:.72}40%,60%{transform:scale(1.025);opacity:1}70%{transform:scale(1.01);opacity:.88}}

    @media(prefers-reduced-motion:reduce){.machine.motion-test .motion-jewel,.machine.motion-test .fins path,.machine.motion-test .display-window,.machine.motion-test .reel-window,.machine.motion-role .motion-jewel,.machine.motion-role .fins path,.machine.motion-role .display-window,.machine.motion-role .reel-window,.machine.motion-role .lower-panel,.machine.motion-role .display-led,.machine.motion-role .reel-led{animation:none!important}}
  `;
  document.head.appendChild(style);

  const btn1=document.createElement('button');btn1.id='motionTest';btn1.className='motion-test-btn';btn1.type='button';btn1.textContent='MOTION 1';
  const btn2=document.createElement('button');btn2.id='motionRole';btn2.className='motion-role-btn';btn2.type='button';btn2.textContent='MOTION 2';
  controls.appendChild(btn1);controls.appendChild(btn2);

  window.motionActive=false;window.motionMode=0;
  let rafId=0,roleStart=0;

  function roleRotationFrame(now){
    if(window.motionMode!==2){rafId=0;return;}
    if(!roleStart)roleStart=now;
    const cycle=5200;
    const t=((now-roleStart)%cycle)/cycle;
    /* 0→展開→最大回転→反転→復帰。最大約11度。 */
    let envelope=0;
    if(t<.18)envelope=0;
    else if(t<.36)envelope=(t-.18)/.18;
    else if(t<.54)envelope=1;
    else if(t<.68)envelope=1-1.45*((t-.54)/.14); /* 少し逆振り */
    else if(t<.82)envelope=-.45+(t-.68)/.14*.45;
    else envelope=0;
    rotors.forEach((g,i)=>{
      const step=Math.floor(i/2);
      const delayed=Math.max(0,Math.min(1,envelope-(step*.045)));
      const sign=i%2===0?1:-1;
      const angle=sign*11*delayed;
      const cx=g.dataset.cx,cy=g.dataset.cy;
      g.setAttribute('transform',`rotate(${angle.toFixed(2)} ${cx} ${cy})`);
    });
    rafId=requestAnimationFrame(roleRotationFrame);
  }

  function resetRotorTransforms(){rotors.forEach(g=>g.removeAttribute('transform'));roleStart=0;if(rafId){cancelAnimationFrame(rafId);rafId=0;}}

  function setMotion(mode){
    window.motionMode=mode;window.motionActive=mode!==0;
    machine.classList.toggle('motion-test',mode===1);machine.classList.toggle('motion-role',mode===2);
    btn1.classList.toggle('active',mode===1);btn2.classList.toggle('active',mode===2);
    btn1.textContent=mode===1?'MOTION 1 ON':'MOTION 1';btn2.textContent=mode===2?'MOTION 2 ON':'MOTION 2';
    resetRotorTransforms();if(mode===2)rafId=requestAnimationFrame(roleRotationFrame);
    if(typeof setMessage==='function')setMessage(mode===1?'FRAME MOTION 1':mode===2?'ROLE MOTION 2 + SVG ROTATE':'FRAME MOTION OFF');
    const modeEl=document.getElementById('mode');if(modeEl&&typeof fullLoad!=='undefined'&&!fullLoad)modeEl.textContent=mode===1?'MOTION1':mode===2?'MOTION2':'NORMAL';
  }

  btn1.addEventListener('click',()=>setMotion(window.motionMode===1?0:1));
  btn2.addEventListener('click',()=>setMotion(window.motionMode===2?0:2));
})();
