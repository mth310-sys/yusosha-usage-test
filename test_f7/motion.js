/* =========================================================
   F7 Motion Test
   MOTION 1: 軽量せり出し
   MOTION 2: 複合役物（展開・回転・疑似前進）
   transform + opacity中心の軽量方式。
========================================================= */
(function initF7MotionTest(){
  const machine=document.getElementById('machine');
  const controls=document.querySelector('.test-controls');
  if(!machine||!controls)return;

  const style=document.createElement('style');
  style.textContent=`
    .motion-test-btn{border-color:#7e5f13!important;color:#fff0a0!important}
    .motion-test-btn.active{background:linear-gradient(#70450b,#211300)!important;color:#fff!important;box-shadow:inset 0 0 8px #000!important}
    .motion-role-btn{border-color:#9b4f16!important;color:#ffe0ad!important}
    .motion-role-btn.active{background:linear-gradient(#7a2607,#241006)!important;color:#fff!important;box-shadow:inset 0 0 8px #000!important}

    .jewels polygon,.fins path{transform-box:fill-box;transform-origin:center;will-change:transform,opacity}

    /* =====================================================
       MOTION 1 : 左右ジュエルの軽量せり出し
    ====================================================== */
    .machine.motion-test .jewels polygon:nth-child(odd){animation:f7JewelLeft 3.6s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-test .jewels polygon:nth-child(even){animation:f7JewelRight 3.6s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-test .jewels polygon:nth-child(3),.machine.motion-test .jewels polygon:nth-child(4){animation-delay:.12s}
    .machine.motion-test .jewels polygon:nth-child(5),.machine.motion-test .jewels polygon:nth-child(6){animation-delay:.24s}
    .machine.motion-test .jewels polygon:nth-child(7),.machine.motion-test .jewels polygon:nth-child(8){animation-delay:.36s}
    .machine.motion-test .jewels polygon:nth-child(9),.machine.motion-test .jewels polygon:nth-child(10){animation-delay:.48s}
    .machine.motion-test .jewels polygon:nth-child(11),.machine.motion-test .jewels polygon:nth-child(12){animation-delay:.60s}
    .machine.motion-test .fins path:nth-child(odd){animation:f7FinLeft 3.6s ease-in-out infinite}
    .machine.motion-test .fins path:nth-child(even){animation:f7FinRight 3.6s ease-in-out infinite}
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

    /* =====================================================
       MOTION 2 : 複合役物
       1) 上段から順に開く
       2) 内側へ回転しながら寄る
       3) 液晶/リールが手前へ出る
       4) 左右非対称の二段目動作
       5) 復帰
    ====================================================== */
    .machine.motion-role .jewels polygon:nth-child(odd){animation:f7RoleLeft 5.2s cubic-bezier(.18,.8,.22,1) infinite}
    .machine.motion-role .jewels polygon:nth-child(even){animation:f7RoleRight 5.2s cubic-bezier(.18,.8,.22,1) infinite}
    .machine.motion-role .jewels polygon:nth-child(3),.machine.motion-role .jewels polygon:nth-child(4){animation-delay:.10s}
    .machine.motion-role .jewels polygon:nth-child(5),.machine.motion-role .jewels polygon:nth-child(6){animation-delay:.20s}
    .machine.motion-role .jewels polygon:nth-child(7),.machine.motion-role .jewels polygon:nth-child(8){animation-delay:.30s}
    .machine.motion-role .jewels polygon:nth-child(9),.machine.motion-role .jewels polygon:nth-child(10){animation-delay:.40s}
    .machine.motion-role .jewels polygon:nth-child(11),.machine.motion-role .jewels polygon:nth-child(12){animation-delay:.50s}

    .machine.motion-role .fins path:nth-child(odd){animation:f7RoleFinLeft 5.2s ease-in-out infinite}
    .machine.motion-role .fins path:nth-child(even){animation:f7RoleFinRight 5.2s ease-in-out infinite}

    .machine.motion-role .display-window{will-change:transform,opacity;animation:f7RoleDisplay 5.2s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-role .reel-window{will-change:transform;animation:f7RoleReel 5.2s cubic-bezier(.2,.8,.2,1) infinite}
    .machine.motion-role .lower-panel{will-change:transform;animation:f7RoleLower 5.2s ease-in-out infinite}
    .machine.motion-role .display-led,.machine.motion-role .reel-led{will-change:transform,opacity;animation:f7RoleBezel 5.2s ease-in-out infinite}

    @keyframes f7RoleLeft{
      0%,8%,92%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(1);opacity:.82}
      20%{transform:translate3d(-3px,0,0) rotate(-3deg) scale(1.02);opacity:.92}
      36%,52%{transform:translate3d(12px,-1px,0) rotate(9deg) scale(1.085);opacity:1}
      65%{transform:translate3d(7px,2px,0) rotate(-5deg) scale(1.055);opacity:1}
      78%{transform:translate3d(3px,0,0) rotate(2deg) scale(1.025);opacity:.95}
    }
    @keyframes f7RoleRight{
      0%,8%,92%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(1);opacity:.82}
      20%{transform:translate3d(3px,0,0) rotate(3deg) scale(1.02);opacity:.92}
      36%,52%{transform:translate3d(-12px,-1px,0) rotate(-9deg) scale(1.085);opacity:1}
      65%{transform:translate3d(-7px,-2px,0) rotate(5deg) scale(1.055);opacity:1}
      78%{transform:translate3d(-3px,0,0) rotate(-2deg) scale(1.025);opacity:.95}
    }
    @keyframes f7RoleFinLeft{
      0%,12%,90%,100%{transform:translate3d(0,0,0) rotate(0deg)}
      32%,58%{transform:translate3d(5px,0,0) rotate(5deg)}
      68%{transform:translate3d(2px,1px,0) rotate(-3deg)}
    }
    @keyframes f7RoleFinRight{
      0%,12%,90%,100%{transform:translate3d(0,0,0) rotate(0deg)}
      32%,58%{transform:translate3d(-5px,0,0) rotate(-5deg)}
      68%{transform:translate3d(-2px,-1px,0) rotate(3deg)}
    }
    @keyframes f7RoleDisplay{
      0%,18%,88%,100%{transform:translate3d(0,0,0) scale(1);opacity:1}
      38%,56%{transform:translate3d(0,-3px,0) scale(1.026);opacity:1}
      66%{transform:translate3d(0,1px,0) scale(1.012);opacity:.98}
    }
    @keyframes f7RoleReel{
      0%,22%,88%,100%{transform:translate3d(0,0,0) scale(1)}
      42%,60%{transform:translate3d(0,-2px,0) scale(1.022)}
      70%{transform:translate3d(0,1px,0) scale(1.01)}
    }
    @keyframes f7RoleLower{
      0%,24%,88%,100%{transform:translate3d(0,0,0) scale(1)}
      46%,62%{transform:translate3d(0,2px,0) scale(1.015)}
    }
    @keyframes f7RoleBezel{
      0%,18%,88%,100%{transform:scale(1);opacity:.72}
      40%,60%{transform:scale(1.025);opacity:1}
      70%{transform:scale(1.01);opacity:.88}
    }

    @media(prefers-reduced-motion:reduce){
      .machine.motion-test .jewels polygon,.machine.motion-test .fins path,.machine.motion-test .display-window,.machine.motion-test .reel-window,
      .machine.motion-role .jewels polygon,.machine.motion-role .fins path,.machine.motion-role .display-window,.machine.motion-role .reel-window,.machine.motion-role .lower-panel,.machine.motion-role .display-led,.machine.motion-role .reel-led{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  const btn1=document.createElement('button');
  btn1.id='motionTest';
  btn1.className='motion-test-btn';
  btn1.type='button';
  btn1.textContent='MOTION 1';

  const btn2=document.createElement('button');
  btn2.id='motionRole';
  btn2.className='motion-role-btn';
  btn2.type='button';
  btn2.textContent='MOTION 2';

  controls.appendChild(btn1);
  controls.appendChild(btn2);

  window.motionActive=false;
  window.motionMode=0;

  function setMotion(mode){
    window.motionMode=mode;
    window.motionActive=mode!==0;
    machine.classList.toggle('motion-test',mode===1);
    machine.classList.toggle('motion-role',mode===2);
    btn1.classList.toggle('active',mode===1);
    btn2.classList.toggle('active',mode===2);
    btn1.textContent=mode===1?'MOTION 1 ON':'MOTION 1';
    btn2.textContent=mode===2?'MOTION 2 ON':'MOTION 2';
    if(typeof setMessage==='function'){
      setMessage(mode===1?'FRAME MOTION 1':mode===2?'ROLE MOTION 2':'FRAME MOTION OFF');
    }
    const modeEl=document.getElementById('mode');
    if(modeEl&&typeof fullLoad!=='undefined'&&!fullLoad){
      modeEl.textContent=mode===1?'MOTION1':mode===2?'MOTION2':'NORMAL';
    }
  }

  btn1.addEventListener('click',()=>setMotion(window.motionMode===1?0:1));
  btn2.addEventListener('click',()=>setMotion(window.motionMode===2?0:2));
})();
