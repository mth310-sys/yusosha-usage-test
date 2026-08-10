/* =========================================================
   F7 Motion Test
   筐体PARTS可動検証。transform + opacity中心の軽量方式。
========================================================= */
(function initF7MotionTest(){
  const machine=document.getElementById('machine');
  const controls=document.querySelector('.test-controls');
  if(!machine||!controls)return;

  const style=document.createElement('style');
  style.textContent=`
    .motion-test-btn{border-color:#7e5f13!important;color:#fff0a0!important}
    .motion-test-btn.active{background:linear-gradient(#70450b,#211300)!important;color:#fff!important;box-shadow:inset 0 0 8px #000!important}

    .jewels polygon,.fins path{transform-box:fill-box;transform-origin:center;will-change:transform,opacity}

    /* 左右ジュエルを一段ずつ中央へせり出す */
    .machine.motion-test .jewels polygon:nth-child(odd){animation:f7JewelLeft 3.6s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-test .jewels polygon:nth-child(even){animation:f7JewelRight 3.6s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-test .jewels polygon:nth-child(3),.machine.motion-test .jewels polygon:nth-child(4){animation-delay:.12s}
    .machine.motion-test .jewels polygon:nth-child(5),.machine.motion-test .jewels polygon:nth-child(6){animation-delay:.24s}
    .machine.motion-test .jewels polygon:nth-child(7),.machine.motion-test .jewels polygon:nth-child(8){animation-delay:.36s}
    .machine.motion-test .jewels polygon:nth-child(9),.machine.motion-test .jewels polygon:nth-child(10){animation-delay:.48s}
    .machine.motion-test .jewels polygon:nth-child(11),.machine.motion-test .jewels polygon:nth-child(12){animation-delay:.60s}

    /* クロームフィンも少し連動させて、外装全体が展開している感を作る */
    .machine.motion-test .fins path:nth-child(odd){animation:f7FinLeft 3.6s ease-in-out infinite}
    .machine.motion-test .fins path:nth-child(even){animation:f7FinRight 3.6s ease-in-out infinite}

    /* ベゼルをわずかに前へ出す疑似Z */
    .machine.motion-test .display-window,.machine.motion-test .reel-window{will-change:transform;animation:f7DepthPulse 3.6s ease-in-out infinite}
    .machine.motion-test .reel-window{animation-delay:.12s}

    @keyframes f7JewelLeft{
      0%,10%,88%,100%{transform:translate3d(0,0,0) scale(1);opacity:.86}
      28%,58%{transform:translate3d(8px,0,0) scale(1.055);opacity:1}
      70%{transform:translate3d(3px,0,0) scale(1.02);opacity:.96}
    }
    @keyframes f7JewelRight{
      0%,10%,88%,100%{transform:translate3d(0,0,0) scale(1);opacity:.86}
      28%,58%{transform:translate3d(-8px,0,0) scale(1.055);opacity:1}
      70%{transform:translate3d(-3px,0,0) scale(1.02);opacity:.96}
    }
    @keyframes f7FinLeft{
      0%,14%,86%,100%{transform:translate3d(0,0,0)}
      32%,60%{transform:translate3d(3px,0,0)}
    }
    @keyframes f7FinRight{
      0%,14%,86%,100%{transform:translate3d(0,0,0)}
      32%,60%{transform:translate3d(-3px,0,0)}
    }
    @keyframes f7DepthPulse{
      0%,14%,86%,100%{transform:translate3d(0,0,0) scale(1)}
      34%,58%{transform:translate3d(0,-1px,0) scale(1.012)}
    }

    @media(prefers-reduced-motion:reduce){
      .machine.motion-test .jewels polygon,.machine.motion-test .fins path,.machine.motion-test .display-window,.machine.motion-test .reel-window{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  const btn=document.createElement('button');
  btn.id='motionTest';
  btn.className='motion-test-btn';
  btn.type='button';
  btn.textContent='MOTION TEST';
  controls.appendChild(btn);

  window.motionActive=false;
  btn.addEventListener('click',()=>{
    window.motionActive=!window.motionActive;
    machine.classList.toggle('motion-test',window.motionActive);
    btn.classList.toggle('active',window.motionActive);
    btn.textContent=window.motionActive?'MOTION ON':'MOTION TEST';
    if(typeof setMessage==='function')setMessage(window.motionActive?'FRAME MOTION ON':'FRAME MOTION OFF');
    const mode=document.getElementById('mode');
    if(mode&&!window.fullLoad)mode.textContent=window.motionActive?'MOTION':'NORMAL';
  });
})();
