/* F9 cabinet mechanism port from yusosha-design-lab.
   Existing Visual Lab game/reel system remains authoritative. */
(()=>{
  const machine=document.getElementById('machine');
  if(!machine)return;
  machine.classList.add('f9-port');

  const topColors=[['#ff4d72','#8b0c2a'],['#ff9c35','#883900'],['#ffe34f','#7a6000']];
  const midColors=[['#4ff2c0','#046d55'],['#43a8ff','#0a3e95'],['#7c82ff','#34217f']];
  const unit=(side,zone,colors)=>`<div class="f9-side-mech ${side} ${zone}"><div class="f9-mech-housing"><div class="f9-mech-prism"><div class="f9-mech-face cover"><i class="f9-led-bar"></i><i class="f9-prism-ridge"></i></div><div class="f9-mech-face leds">${colors.map(c=>`<i class="f9-big-led" style="--c1:${c[0]};--c2:${c[1]}"></i>`).join('')}</div></div></div></div>`;

  const shell=document.createElement('div');
  shell.className='f9-shell-port';
  shell.innerHTML=`
    <div class="f9-shoulder left"><i></i><b></b></div><div class="f9-shoulder right"><i></i><b></b></div>
    <div class="f9-mid-shell left"><i></i><b></b></div><div class="f9-mid-shell right"><i></i><b></b></div>
    <div class="f9-waist left"></div><div class="f9-waist right"></div>
    <div class="f9-lower-shell left"><i></i></div><div class="f9-lower-shell right"><i></i></div>
    ${unit('left','upper',topColors)}${unit('right','upper',topColors)}
    ${unit('left','middle',midColors)}${unit('right','middle',midColors)}
    <div class="f9-lower-led left"></div><div class="f9-lower-led right"></div>
    <button type="button" class="f9-side-toggle">SIDE OPEN</button>`;
  machine.appendChild(shell);

  let open=false;
  const toggle=shell.querySelector('.f9-side-toggle');
  toggle.addEventListener('click',()=>{
    open=!open;
    shell.querySelectorAll('.f9-side-mech').forEach(el=>el.classList.toggle('open',open));
    toggle.textContent=open?'SIDE CLOSE':'SIDE OPEN';
  });

  /* Reuse the existing game controls; only their visual form is replaced. */
  const maxBet=document.getElementById('maxBet');
  const start=document.getElementById('start');
  if(maxBet)maxBet.classList.add('f9-maxbet-port');
  if(start)start.classList.add('f9-start-port');
  document.querySelectorAll('.stop').forEach(el=>el.classList.add('f9-stop-port'));
})();
