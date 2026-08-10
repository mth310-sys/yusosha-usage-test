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
let bet=0,credit=99,isSpinning=false,fullLoad=false,displayHeavy=false,ledOn=true,longTasks=0;

function setMessage(text){message.textContent=text;}
function setBet(v){bet=Math.max(0,Math.min(3,v));document.getElementById('bet').textContent=bet;}
function spinAll(fast=false){isSpinning=true;reels.forEach(r=>{r.classList.add('spinning');r.classList.toggle('fast',fast);});setMessage(fast?'FULL LOAD SPIN':'SPINNING');}
function stopReel(i){reels[i].classList.remove('spinning','fast');if(reels.every(r=>!r.classList.contains('spinning'))){isSpinning=false;setMessage('STOP COMPLETE');displayText.innerHTML='F7<br><span>RESULT CHECK</span>';}}
function stopAll(){reels.forEach((_,i)=>stopReel(i));}

function measureInput(){const t=performance.now();requestAnimationFrame(()=>{inputEl.textContent=`${(performance.now()-t).toFixed(1)} ms`;});}
document.addEventListener('pointerdown',measureInput,{passive:true});

document.getElementById('maxBet').addEventListener('click',()=>{if(credit<=0)return;setBet(3);setMessage('MAX BET');});
document.getElementById('start').addEventListener('click',()=>{if(bet===0)setBet(3);if(!isSpinning){spinAll(fullLoad);displayText.innerHTML='GO<br><span>REEL DRIVE</span>';}});
stops.forEach((b,i)=>b.addEventListener('click',()=>stopReel(i)));

document.getElementById('ledToggle').addEventListener('click',()=>{ledOn=!ledOn;machine.classList.toggle('led-off',!ledOn);setMessage(ledOn?'LED ON':'LED OFF');});
document.getElementById('displayLoad').addEventListener('click',()=>{displayHeavy=!displayHeavy;machine.classList.toggle('display-heavy',displayHeavy);setMessage(displayHeavy?'DISPLAY LOAD ON':'DISPLAY LOAD OFF');});
document.getElementById('reelLoad').addEventListener('click',()=>{if(isSpinning)stopAll();else spinAll(true);});
document.getElementById('resetTest').addEventListener('click',()=>{fullLoad=false;displayHeavy=false;ledOn=true;machine.className='machine';fullLoadBtn.classList.remove('active');stopAll();setBet(0);modeEl.textContent='NORMAL';displayText.innerHTML='F7<br><span>PERFORMANCE TEST</span>';setMessage('READY');});

fullLoadBtn.addEventListener('click',()=>{
  fullLoad=!fullLoad;
  fullLoadBtn.classList.toggle('active',fullLoad);
  machine.classList.toggle('full-load',fullLoad);
  machine.classList.toggle('display-heavy',fullLoad||displayHeavy);
  modeEl.textContent=fullLoad?'FULL':'NORMAL';
  if(fullLoad){ledOn=true;machine.classList.remove('led-off');spinAll(true);displayText.innerHTML='MAX<br><span>FULL LOAD</span>';setMessage('MAXIMUM LOAD');}
  else{stopAll();machine.classList.toggle('display-heavy',displayHeavy);displayText.innerHTML='F7<br><span>PERFORMANCE TEST</span>';setMessage('NORMAL LOAD');}
});

// DOM要素数は構造負荷の目安。SVG要素も含む。
domEl.textContent=document.querySelectorAll('*').length;

// FPS / frame time: 1秒窓で実測。
let frames=0,last=performance.now(),prev=last,frameSum=0;
function tick(now){
  frames++;
  frameSum+=now-prev;
  prev=now;
  if(now-last>=1000){
    const elapsed=now-last;
    const fps=frames*1000/elapsed;
    fpsEl.textContent=fps.toFixed(1);
    frameMsEl.textContent=`${(frameSum/frames).toFixed(2)} ms`;
    frames=0;frameSum=0;last=now;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Long Tasks APIはSafari等で未対応の場合がある。その場合は0のままではなくN/A表示。
if('PerformanceObserver' in window){
  try{
    const observer=new PerformanceObserver(list=>{longTasks+=list.getEntries().length;longEl.textContent=longTasks;});
    observer.observe({entryTypes:['longtask']});
  }catch(e){longEl.textContent='N/A';}
}else{longEl.textContent='N/A';}

window.addEventListener('load',()=>{
  const nav=performance.getEntriesByType('navigation')[0];
  if(nav){setTimeout(()=>{message.title=`Load ${Math.round(nav.loadEventEnd-nav.startTime)} ms / Transfer ${nav.transferSize||0} B`;},0);}
});
