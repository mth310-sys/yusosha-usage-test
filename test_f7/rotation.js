/* =========================================================
   F7 HTML Rotation Proof
   Safariで確実に見える回転役物。MOTION2時のみ動作。
========================================================= */
(function initHtmlRotationProof(){
  const machine=document.getElementById('machine');
  if(!machine)return;

  const style=document.createElement('style');
  style.textContent=`
    .rotation-proof{
      position:absolute;z-index:46;left:50%;top:33%;width:70px;height:70px;
      margin-left:-35px;margin-top:-35px;pointer-events:none;opacity:0;
      transform:translate3d(0,0,0) rotate(0deg) scale(.7);
      transform-origin:50% 50%;
    }
    .rotation-proof::before,.rotation-proof::after{
      content:"";position:absolute;inset:0;margin:auto;background:linear-gradient(135deg,#fff3a0,#ffbd19 42%,#713500 72%,#ffe16a);
      border:2px solid #fff0a0;
    }
    .rotation-proof::before{width:18px;height:70px;border-radius:8px}
    .rotation-proof::after{width:70px;height:18px;border-radius:8px}
    .rotation-proof-core{
      position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;
      border-radius:50%;background:#111;border:3px solid #ffd54a;color:#ffd54a;
      display:grid;place-items:center;font-size:10px;font-weight:900;z-index:2;
    }
    .machine.motion-role .rotation-proof{
      opacity:1;
      animation:f7HtmlRotor 2.2s cubic-bezier(.2,.8,.2,1) infinite;
      will-change:transform,opacity;
    }
    @keyframes f7HtmlRotor{
      0%,8%,92%,100%{transform:translate3d(0,0,0) rotate(0deg) scale(.72);opacity:.25}
      22%{transform:translate3d(0,-4px,0) rotate(45deg) scale(.9);opacity:.8}
      42%{transform:translate3d(0,-8px,0) rotate(135deg) scale(1.08);opacity:1}
      62%{transform:translate3d(0,-8px,0) rotate(225deg) scale(1.08);opacity:1}
      78%{transform:translate3d(0,-3px,0) rotate(315deg) scale(.9);opacity:.75}
    }
    @media(prefers-reduced-motion:reduce){.machine.motion-role .rotation-proof{animation:none}}
  `;
  document.head.appendChild(style);

  const role=document.createElement('div');
  role.className='rotation-proof';
  role.innerHTML='<div class="rotation-proof-core">F7</div>';
  machine.appendChild(role);
})();
