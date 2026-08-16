const machine=document.getElementById('machine');
const reels=[...document.querySelectorAll('.reel')];
const stops=[...document.querySelectorAll('.stop')];
const fpsEl=document.getElementById('fps');
const frameMsEl=document.getElementById('frameMs');
const domEl=document.getElementById('domCount');
const longEl=document.getElementById('longTasks');
const inputEl=document.getElementById('inputLag');
const modeEl=document.getElementById('mode');
const message=document.getElementById('message');
const displayText=document.getElementById('displayText');
const fullLoadBtn=document.getElementById('fullLoad');
const bonusMeter=document.getElementById('bonusMeter');
const bonusGetEl=document.getElementById('bonusGet');
const payoutEl=document.getElementById('payout');
const creditEl=document.getElementById('credit');

/* Side LED V6: segmented BLOCK | CIRCLE | BLOCK, covered by a clear faceted lens. */
const ledStudyStyle=document.createElement('style');
ledStudyStyle.textContent=`
.shell-svg g[fill="#111"] path{
  fill:rgba(28,34,38,.22)!important;
  stroke:url(#lpChrome)!important;
  stroke-width:5!important;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.9))!important;
}
.shell-svg g[fill="url(#lpLamp)"] circle{
  transform-box:fill-box;
  transform-origin:center;
  transform:scale(.62)!important;
  stroke:rgba(245,250,255,.92)!important;
  stroke-width:2.2!important;
  opacity:.96!important;
}
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(1),
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(7){fill:#d9509c!important}
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(2),
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(8){fill:#ef713d!important}
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(3),
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(9){fill:#f6c83f!important}
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(4),
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(10){fill:#7d9cd1!important}
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(5),
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(11){fill:#48b8c8!important}
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(6),
.shell-svg g[fill="url(#lpLamp)"] circle:nth-child(12){fill:#3c9ee9!important}

.machine::after{
  content:"";
  position:absolute;
  inset:0;
  z-index:24;
  pointer-events:none;
  background:
    /* clear covers */
    linear-gradient(105deg,rgba(255,255,255,.20),rgba(206,229,238,.05) 32%,rgba(255,255,255,.16) 50%,rgba(194,220,233,.04) 72%,rgba(255,255,255,.18)) 15px 110px/46px 108px no-repeat,
    linear-gradient(75deg,rgba(255,255,255,.18),rgba(194,220,233,.04) 28%,rgba(255,255,255,.16) 50%,rgba(206,229,238,.05) 68%,rgba(255,255,255,.20)) 329px 110px/46px 108px no-repeat,
    linear-gradient(105deg,rgba(255,255,255,.16),rgba(185,222,241,.05) 32%,rgba(255,255,255,.14) 50%,rgba(165,211,237,.05) 72%,rgba(255,255,255,.16)) 13px 219px/49px 137px no-repeat,
    linear-gradient(75deg,rgba(255,255,255,.16),rgba(165,211,237,.05) 28%,rgba(255,255,255,.14) 50%,rgba(185,222,241,.05) 68%,rgba(255,255,255,.16)) 328px 219px/49px 137px no-repeat,

    /* upper left: BLOCK | circle | BLOCK */
    repeating-linear-gradient(to bottom,#ffffff 0 18px,transparent 18px 33px) 20px 127px/7px 92px no-repeat,
    repeating-linear-gradient(to bottom,#ffffff 0 18px,transparent 18px 33px) 49px 127px/7px 92px no-repeat,
    /* upper right */
    repeating-linear-gradient(to bottom,#ffffff 0 18px,transparent 18px 33px) 334px 127px/7px 92px no-repeat,
    repeating-linear-gradient(to bottom,#ffffff 0 18px,transparent 18px 33px) 363px 127px/7px 92px no-repeat,

    /* lower left */
    repeating-linear-gradient(to bottom,#7fd1fb 0 20px,transparent 20px 41px) 18px 237px/8px 123px no-repeat,
    repeating-linear-gradient(to bottom,#7fd1fb 0 20px,transparent 20px 41px) 50px 237px/8px 123px no-repeat,
    /* lower right */
    repeating-linear-gradient(to bottom,#7fd1fb 0 20px,transparent 20px 41px) 332px 237px/8px 123px no-repeat,
    repeating-linear-gradient(to bottom,#7fd1fb 0 20px,transparent 20px 41px) 364px 237px/8px 123px no-repeat;
  filter:drop-shadow(0 0 3px rgba(225,246,255,.48));
  opacity:.94;
}
.machine:not(.led-off)::after{animation:sideBlockPulse 2s ease-in-out infinite alternate}
@keyframes sideBlockPulse{to{filter:drop-shadow(0 0 5px rgba(220,244,255,.78));opacity:1}}
.machine.led-off::after{opacity:.13;filter:none;animation:none}
.machine.led-off .shell-svg g[fill="url(#lpLamp)"] circle{opacity:.16!important;filter:none!important;fill:#596269!important}
`;
document.head.appendChild(ledStudyStyle);

const SYMBOLS=['seven','bell','cherry','replay','bar'];
const SMALL=['bell','cherry','replay','bar'];
const LABEL={seven:'7',bell:'BELL',cherry:'CHERRY',replay:'REPLAY',bar:'BAR'};
let bet=0,credit=99,isSpinning=false,fullLoad=false,displayHeavy=false,ledOn=true,longTasks=0;
let bonusActive=false,bonusGet=0,payout=0,currentOutcome=['bar','seven','bell'];
let reelStopped=[true,true,true];

function symbolSvg(type){
  if(type==='seven')return `<svg viewBox="0 0 100 70" aria-label="7"><defs><linearGradient id="s7" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff5a0"/><stop offset=".35" stop-color="#ff3434"/><stop offset="1" stop-color="#8b0000"/></linearGradient></defs><path d="M18 10H87L79 26 51 62H25L57 27H12Z" fill="url(#s7)" stroke="#6b0000" stroke-width="3"/><path d="M25 16H73" stroke="#fff" stroke-width="4" opacity=".75"/></svg>`;
  if(type==='bell')return `<svg viewBox="0 0 100 70" aria-label="ベル"><path d="M28 48h44l-7-9V27c0-11-6-18-15-18s-15 7-15 18v12Z" fill="#ffd83d" stroke="#9a5a00" stroke-width="3"/><path d="M39 52h22c-2 8-6 11-11 11s-9-3-11-11Z" fill="#ff9f00"/><ellipse cx="50" cy="25" rx="10" ry="7" fill="#fff4a2" opacity=".7"/></svg>`;
  if(type==='cherry')return `<svg viewBox="0 0 100 70" aria-label="チェリー"><path d="M49 27C54 14 62 8 76 8M51 28C45 16 37 12 29 11" fill="none" stroke="#16843a" stroke-width="5" stroke-linecap="round"/><path d="M57 15c8-9 17-9 24-4-6 7-14 10-24 4Z" fill="#2fb24e"/><circle cx="34" cy="45" r="16" fill="#e91d32" stroke="#87000f" stroke-width="3"/><circle cx="66" cy="45" r="16" fill="#f32a3d" stroke="#87000f" stroke-width="3"/><circle cx="29" cy="39" r="5" fill="#ff9aa5" opacity=".8"/><circle cx="61" cy="39" r="5" fill="#ff9aa5" opacity=".8"/></svg>`;
  if(type==='replay')return `<svg viewBox="0 0 100 70" aria-label="リプレイ"><circle cx="50" cy="35" r="25" fill="#e8f7ff" stroke="#1786d2" stroke-width="4"/><path d="M67 28A19 19 0 1 0 66 45" fill="none" stroke="#1777d2" stroke-width="7" stroke-linecap="round"/><path d="M66 19l17 9-17 10Z" fill="#1777d2"/><circle cx="50" cy="35" r="7" fill="#8bd3ff"/></svg>`;
  return `<svg viewBox="0 0 100 70" aria-label="BAR"><defs><linearGradient id="sb" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#444"/><stop offset=".5" stop-color="#080808"/><stop offset="1" stop-color="#555"/></linearGradient></defs><rect x="9" y="17" width="82" height="36" rx="6" fill="url(#sb)" stroke="#c9c9c9" stroke-width="3"/><text x="50" y="43" text-anchor="middle" font-size="25" font-weight="900" fill="#fff" font-family="Arial,sans-serif">BAR</text></svg>`;
}
function randomSymbol(exclude=null){const pool=exclude?SYMBOLS.filter(s=>s!==exclude):SYMBOLS;return pool[Math.floor(Math.random()*pool.length)];}
function renderReel(i,center){const cells=Array.from({length:9},()=>randomSymbol());cells[4]=center;reels[i].innerHTML=`<div class="reel-strip">${cells.map(s=>`<div class="symbol-cell">${symbolSvg(s)}</div>`).join('')}</div>`;}
function renderAll(outcome=currentOutcome){outcome.forEach((s,i)=>renderReel(i,s));updateDomCount();}
function updateDomCount(){domEl.textContent=document.querySelectorAll('*').length;}
function setMessage(text){message.textContent=text;}
function setBet(v){bet=Math.max(0,Math.min(3,v));document.getElementById('bet').textContent=bet;}
function setPayout(v){payout=v;payoutEl.textContent=v;}
function setCredit(v){credit=Math.max(0,v);creditEl.textContent=credit;}
function setBonusGet(v){bonusGet=Math.min(240,Math.max(0,v));bonusGetEl.textContent=bonusGet;}
function chooseOutcome(){if(bonusActive){const win=SMALL[Math.floor(Math.random()*SMALL.length)];return [win,win,win];}const r=Math.random();if(r<.10)return ['seven','seven','seven'];if(r<.45){const win=SMALL[Math.floor(Math.random()*SMALL.length)];return [win,win,win];}let out=[randomSymbol(),randomSymbol(),randomSymbol()];while(out[0]===out[1]&&out[1]===out[2])out=[randomSymbol(),randomSymbol(),randomSymbol()];return out;}
function updateDisplayIdle(){if(bonusActive){displayText.innerHTML='BONUS<br><span>3 COIN AWARD</span>';return;}if(fullLoad){displayText.innerHTML='MAX<br><span>FULL LOAD</span>';return;}displayText.innerHTML='F7<br><span>PERFORMANCE TEST</span>';}
function enterBonus(){bonusActive=true;setBonusGet(0);setPayout(0);machine.classList.add('bonus-mode');bonusMeter.hidden=false;displayText.innerHTML='777<br><span>BONUS START</span>';setMessage('777 BONUS START');}
function endBonus(){bonusActive=false;machine.classList.remove('bonus-mode');bonusMeter.hidden=true;displayText.innerHTML='240 GET<br><span>BONUS END</span>';setMessage('BONUS END / 240 GET');}
function evaluateOutcome(){const [a,b,c]=currentOutcome;const win=a===b&&b===c;if(bonusActive){if(win){setPayout(3);setCredit(credit+3);setBonusGet(bonusGet+3);setMessage(`${LABEL[a]} 入賞 +3 / ${bonusGet} GET`);}else{setPayout(0);setMessage('BONUS MISS');}if(bonusGet>=240)endBonus();else updateDisplayIdle();return;}if(win&&a==='seven'){setPayout(0);enterBonus();return;}if(win){setPayout(0);setMessage(`${LABEL[a]} 入賞 / PAY 0`);displayText.innerHTML=`${LABEL[a]}<br><span>SMALL ROLE / PAY 0</span>`;return;}setPayout(0);setMessage('MISS / PAY 0');displayText.innerHTML='MISS<br><span>NO PAYOUT</span>';}
function spinAll(fast=false){if(isSpinning)return;currentOutcome=chooseOutcome();reelStopped=[false,false,false];isSpinning=true;setPayout(0);reels.forEach((r,i)=>{renderReel(i,randomSymbol());r.classList.add('spinning');r.classList.toggle('fast',fast);});setMessage(fast?'FULL LOAD SPIN':'SPINNING');displayText.innerHTML=bonusActive?'BONUS<br><span>REEL DRIVE</span>':'GO<br><span>REEL DRIVE</span>';}
function stopReel(i,evaluate=true){if(!isSpinning||reelStopped[i])return;reelStopped[i]=true;reels[i].classList.remove('spinning','fast');renderReel(i,currentOutcome[i]);if(reelStopped.every(Boolean)){isSpinning=false;if(evaluate)evaluateOutcome();}}
function stopAll(evaluate=false){if(!isSpinning)return;reelStopped.forEach((stopped,i)=>{if(!stopped){reelStopped[i]=true;reels[i].classList.remove('spinning','fast');renderReel(i,currentOutcome[i]);}});isSpinning=false;if(evaluate)evaluateOutcome();}
function measureInput(){const t=performance.now();requestAnimationFrame(()=>{inputEl.textContent=`${(performance.now()-t).toFixed(1)} ms`;});}
document.addEventListener('pointerdown',measureInput,{passive:true});
document.getElementById('maxBet').addEventListener('click',()=>{if(credit<=0)return;setBet(3);setMessage('MAX BET');});
document.getElementById('start').addEventListener('click',()=>{if(bet===0)setBet(3);if(!isSpinning)spinAll(fullLoad);});
stops.forEach((b,i)=>b.addEventListener('click',()=>stopReel(i,true)));
document.getElementById('ledToggle').addEventListener('click',()=>{ledOn=!ledOn;machine.classList.toggle('led-off',!ledOn);setMessage(ledOn?'LED ON':'LED OFF');});
document.getElementById('displayLoad').addEventListener('click',()=>{displayHeavy=!displayHeavy;machine.classList.toggle('display-heavy',displayHeavy||fullLoad);setMessage(displayHeavy?'DISPLAY LOAD ON':'DISPLAY LOAD OFF');});
document.getElementById('reelLoad').addEventListener('click',()=>{if(isSpinning)stopAll(false);else spinAll(true);});
document.getElementById('resetTest').addEventListener('click',()=>{fullLoad=false;displayHeavy=false;ledOn=true;bonusActive=false;setBonusGet(0);setPayout(0);setCredit(99);setBet(0);machine.className='machine';bonusMeter.hidden=true;fullLoadBtn.classList.remove('active');stopAll(false);modeEl.textContent='NORMAL';currentOutcome=['bar','seven','bell'];renderAll();displayText.innerHTML='F7<br><span>PERFORMANCE TEST</span>';setMessage('READY');});
fullLoadBtn.addEventListener('click',()=>{fullLoad=!fullLoad;fullLoadBtn.classList.toggle('active',fullLoad);machine.classList.toggle('full-load',fullLoad);machine.classList.toggle('display-heavy',fullLoad||displayHeavy);modeEl.textContent=fullLoad?'FULL':'NORMAL';if(fullLoad){ledOn=true;machine.classList.remove('led-off');if(!isSpinning)spinAll(true);setMessage('MAXIMUM LOAD');}else{stopAll(false);machine.classList.toggle('display-heavy',displayHeavy);updateDisplayIdle();setMessage(bonusActive?'BONUS LOAD':'NORMAL LOAD');}});
renderAll();setCredit(credit);setBonusGet(0);
let frames=0,last=performance.now(),prev=last,frameSum=0;
function tick(now){frames++;frameSum+=now-prev;prev=now;if(now-last>=1000){const elapsed=now-last;const fps=frames*1000/elapsed;fpsEl.textContent=fps.toFixed(1);frameMsEl.textContent=`${(frameSum/frames).toFixed(2)} ms`;frames=0;frameSum=0;last=now;}requestAnimationFrame(tick);}
requestAnimationFrame(tick);
if('PerformanceObserver' in window){try{const observer=new PerformanceObserver(list=>{longTasks+=list.getEntries().length;longEl.textContent=longTasks;});observer.observe({entryTypes:['longtask']});}catch(e){longEl.textContent='N/A';}}else{longEl.textContent='N/A';}
window.addEventListener('load',()=>{updateDomCount();const nav=performance.getEntriesByType('navigation')[0];if(nav){setTimeout(()=>{message.title=`Load ${Math.round(nav.loadEventEnd-nav.startTime)} ms / Transfer ${nav.transferSize||0} B`;},0);}});
