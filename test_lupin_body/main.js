(()=>{
const cabinet=document.getElementById('cabinet'),stage=document.querySelector('.machine-stage'),dotGrid=document.getElementById('dotGrid'),ring=document.getElementById('ring'),sideUnits=document.getElementById('prismMechanism'),sideToggle=document.getElementById('sideToggle'),ledLayer=document.getElementById('upperMicroLedLayer'),patternControls=document.getElementById('upperLedPatternControls');let sideOpen=false;const BASE_BODY_HEIGHT=528;
const fitCabinet=()=>{const available=stage.clientWidth,scale=Math.min(1,available/390),viewportHeight=window.visualViewport?.height||window.innerHeight,targetDesignHeight=viewportHeight/scale,lowerShift=Math.max(0,targetDesignHeight-BASE_BODY_HEIGHT);cabinet.style.setProperty('--body-scale',String(scale));cabinet.style.setProperty('--body-height',`${targetDesignHeight}px`);cabinet.style.setProperty('--lower-shift',`${lowerShift}px`);stage.style.height=`${viewportHeight}px`};fitCabinet();requestAnimationFrame(fitCabinet);window.addEventListener('resize',fitCabinet,{passive:true});window.visualViewport?.addEventListener('resize',fitCabinet,{passive:true});
const n=15,c=(n-1)/2;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=x-c,dy=y-c,r=Math.hypot(dx,dy),on=r<1.5||((Math.abs(dx)===Math.abs(dy)||dx===0||dy===0)&&r<5.4),i=document.createElement('i');i.className='f9-dot'+(on?' on':'');dotGrid.appendChild(i)}for(let i=0;i<34;i++){const a=i/34*Math.PI*2,d=document.createElement('i');d.className='f9-ring-dot';d.style.left=`${50+Math.cos(a)*50}%`;d.style.top=`${50+Math.sin(a)*50}%`;d.style.animationDelay=`${i/34*1.8}s`;ring.appendChild(d)}
const setPattern=num=>{if(num!==2&&num!==3)return;ledLayer.className=`upper-micro-led-layer led-mode-${num}`;patternControls.querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.pattern)===num))};patternControls?.addEventListener('click',e=>{const b=e.target.closest('button[data-pattern]');if(b)setPattern(Number(b.dataset.pattern))});setPattern(2);
const topColors=[['#ff4d72','#8b0c2a'],['#ff9c35','#883900'],['#ffe34f','#7a6000']],midColors=[['#4ff2c0','#046d55'],['#43a8ff','#0a3e95'],['#7c82ff','#34217f']];const makeUnit=(side,zone,colors)=>{const mech=document.createElement('div');mech.className=`f9-side-mech ${side} ${zone}`;const leds=colors.map(([c1,c2])=>`<i class="f9-big-led" style="--c1:${c1};--c2:${c2}"></i>`).join('');mech.innerHTML=`<div class="f9-mech-housing"><div class="f9-mech-prism"><div class="f9-mech-face cover"><i class="f9-led-bar"></i><i class="f9-prism-ridge"></i></div><div class="f9-mech-face leds">${leds}</div></div></div>`;sideUnits.appendChild(mech)};makeUnit('left','upper',topColors);makeUnit('right','upper',topColors);makeUnit('left','middle',midColors);makeUnit('right','middle',midColors);
const applySideState=open=>{sideOpen=Boolean(open);document.querySelectorAll('.f9-side-mech').forEach(el=>el.classList.toggle('open',sideOpen));sideToggle.textContent=sideOpen?'SIDE CLOSE':'SIDE OPEN'};
sideToggle.addEventListener('click',()=>applySideState(!sideOpen));
new MutationObserver(()=>{const state=sideUnits.dataset.state;if(state==='reveal')applySideState(true);else if(state==='closed')applySideState(false)}).observe(sideUnits,{attributes:true,attributeFilter:['data-state']});

// BODY is the canonical cabinet. Map its physical controls to the integrated ZERO system.
const bodyControls=[...document.querySelectorAll('.control-button')];
const zeroSelectors=['#maxBetBtn','#startBtn','#stop1','#stop2','#stop3'];
const roles=['MAX_BET','START','STOP_1','STOP_2','STOP_3'];
const forward=(selector)=>{const target=document.querySelector(selector);if(!(target instanceof HTMLButtonElement)||target.disabled)return false;target.click();return true};
if(bodyControls.length>=5){
 bodyControls.slice(0,5).forEach((button,index)=>{button.dataset.bodyRole=roles[index];button.addEventListener('click',()=>forward(zeroSelectors[index]))});
 const syncControls=()=>bodyControls.slice(0,5).forEach((button,index)=>{const target=document.querySelector(zeroSelectors[index]);const ready=target instanceof HTMLButtonElement&&!target.disabled;button.classList.toggle('is-ready',ready);button.setAttribute('aria-disabled',ready?'false':'true')});
 const integration=document.getElementById('systemIntegration');
 if(integration)new MutationObserver(syncControls).observe(integration,{subtree:true,attributes:true,attributeFilter:['disabled'],childList:true,characterData:true});
 syncControls();cabinet.dataset.systemIntegration='connected';
}else cabinet.dataset.systemIntegration='control-map-missing';
})();
