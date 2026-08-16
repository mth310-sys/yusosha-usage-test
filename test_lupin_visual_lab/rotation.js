/* =========================================================
   F7 Rotation Proof
   iPhone Safariで回転適用そのものを切り分ける検証。
   非対称役物 + 手動90度ステップ + MOTION2連続回転。
========================================================= */
(function initRotationProof(){
  const machine=document.getElementById('machine');
  const controls=document.querySelector('.test-controls');
  if(!machine||!controls)return;

  const style=document.createElement('style');
  style.textContent=`
    .rotation-proof{
      position:absolute;z-index:70;left:50%;top:33%;width:86px;height:86px;
      margin-left:-43px;margin-top:-43px;pointer-events:none;opacity:0;
      transform:rotate(0deg);
      transform-origin:43px 43px;
      -webkit-transform-origin:43px 43px;
      will-change:transform;
    }
    .rotation-proof.visible{opacity:1}
    .rotation-arrow{
      position:absolute;left:37px;top:5px;width:12px;height:68px;
      background:linear-gradient(#fff5a7,#ffbd19 48%,#8a4100);
      border:2px solid #fff0a0;border-radius:7px;
    }
    .rotation-arrow:before{
      content:"";position:absolute;left:-13px;top:-5px;width:34px;height:34px;
      background:linear-gradient(135deg,#fff6ae,#ffbd19 55%,#713500);
      clip-path:polygon(50% 0,100% 100%,0 100%);
    }
    .rotation-tail{
      position:absolute;left:8px;top:39px;width:31px;height:8px;
      background:#ff6a19;border:2px solid #ffe6a0;border-radius:6px;
    }
    .rotation-core{
      position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;
      border-radius:50%;background:#101114;border:3px solid #ffd54a;color:#ffd54a;
      display:grid;place-items:center;font-size:9px;font-weight:900;z-index:3;
    }
    .rotation-step-btn{border-color:#b56b20!important;color:#ffe1a8!important}
    .rotation-step-btn.active{background:linear-gradient(#71340a,#241006)!important;color:white!important}
    .rotation-readout{position:absolute;z-index:71;left:50%;top:41.5%;transform:translateX(-50%);padding:3px 7px;border-radius:10px;background:#090909dd;border:1px solid #b56b20;color:#ffe19a;font-size:8px;font-weight:900;pointer-events:none;opacity:0}
    .rotation-readout.visible{opacity:1}
  `;
  document.head.appendChild(style);

  const rotor=document.createElement('div');
  rotor.className='rotation-proof';
  rotor.innerHTML='<div class="rotation-arrow"></div><div class="rotation-tail"></div><div class="rotation-core">F7</div>';
  machine.appendChild(rotor);

  const readout=document.createElement('div');
  readout.className='rotation-readout';
  readout.textContent='ROT 0°';
  machine.appendChild(readout);

  const btn=document.createElement('button');
  btn.id='rotationStep';btn.className='rotation-step-btn';btn.type='button';btn.textContent='ROTATE +90°';
  controls.appendChild(btn);

  let angle=0;
  let auto=false;
  let raf=0;
  let last=0;

  function applyAngle(deg){
    angle=((deg%360)+360)%360;
    rotor.style.transform=`rotate(${angle}deg)`;
    rotor.style.webkitTransform=`rotate(${angle}deg)`;
    rotor.classList.add('visible');
    readout.classList.add('visible');
    readout.textContent=`ROT ${Math.round(angle)}°`;
  }

  btn.addEventListener('click',()=>{
    auto=false;
    if(raf){cancelAnimationFrame(raf);raf=0;}
    applyAngle(angle+90);
    btn.classList.add('active');
    setTimeout(()=>btn.classList.remove('active'),180);
  });

  function animate(now){
    if(!auto){raf=0;return;}
    if(!last)last=now;
    const dt=Math.min(50,now-last);last=now;
    applyAngle(angle+dt*0.09); /* 約90度/秒 */
    raf=requestAnimationFrame(animate);
  }

  function syncMotion2(){
    const on=typeof window.motionMode!=='undefined'&&window.motionMode===2;
    if(on&&!auto){auto=true;last=0;rotor.classList.add('visible');readout.classList.add('visible');raf=requestAnimationFrame(animate);}
    if(!on&&auto){auto=false;last=0;if(raf){cancelAnimationFrame(raf);raf=0;}}
    requestAnimationFrame(syncMotion2);
  }
  requestAnimationFrame(syncMotion2);

  applyAngle(0);
})();
