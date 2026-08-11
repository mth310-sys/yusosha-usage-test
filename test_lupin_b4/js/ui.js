const spinTimers = [null,null,null];
const spinSymbols = ['LUPIN','JIGEN','GOEMON','BAR','CHERRY','COIN','REPLAY'];

export function startReelAnimation(){document.querySelectorAll('.reel-cell').forEach((cell,index)=>{clearInterval(spinTimers[index]);let p=index;spinTimers[index]=setInterval(()=>{p=(p+1)%spinSymbols.length;cell.textContent=spinSymbols[p];},70+index*12);cell.classList.add('spinning');});}
export function stopReelAnimation(index,symbol){clearInterval(spinTimers[index]);spinTimers[index]=null;const cell=document.querySelector(`.reel-cell[data-reel="${index}"]`);if(!cell)return;cell.textContent=symbol;cell.classList.remove('spinning');}
function renderHolds(holds){const root=document.getElementById('holdQueue');if(!root)return;if(!holds.length){root.textContent='---';return;}root.textContent=holds.map((hold,index)=>`${index+1}:${hold.type}#${hold.id}`).join('  ');}
export function renderState(core,logger){
  const s=core.snapshot();
  const cz=s.normal.cz;
  document.getElementById('game').textContent=`#${String(s.gameNo).padStart(6,'0')}`;
  document.getElementById('setting').textContent=String(s.setting);
  document.getElementById('phase').textContent=s.phase;
  document.getElementById('mode').textContent=s.normal.mode;
  document.getElementById('normalGames').textContent=String(s.normal.gameCount);
  document.getElementById('wanted').textContent=String(s.normal.wantedCount);
  document.getElementById('wantedTarget').textContent=`${s.normal.wantedTargetZone.min}-${s.normal.wantedTargetZone.max}G`;
  document.getElementById('wantedState').textContent=s.normal.wantedState;
  document.getElementById('wantedChanceGames').textContent=String(s.normal.wantedChanceGameCount);
  document.getElementById('holdCapacity').textContent=s.normal.holdCapacity==null?'---':String(s.normal.holdCapacity);
  document.getElementById('consumedHold').textContent=s.normal.lastConsumedHold?`${s.normal.lastConsumedHold.type}#${s.normal.lastConsumedHold.id}`:'---';
  document.getElementById('pendingReward').textContent=s.normal.pendingReward?`${s.normal.pendingReward.type} / ${s.normal.pendingReward.status}`:'---';
  document.getElementById('transitionSource').textContent=s.normal.transitionSource??'---';
  document.getElementById('czType').textContent=cz?.type??'---';
  document.getElementById('czState').textContent=cz?.state??'---';
  document.getElementById('czGames').textContent=cz?String(cz.gameCount):'---';
  document.getElementById('czRemain').textContent=cz?String(cz.remainingGames):'---';
  document.getElementById('czTotal').textContent=cz?String(cz.totalGames):'---';
  renderHolds(s.normal.holdQueue);
  document.getElementById('credit').textContent=String(s.credit);
  document.getElementById('bet').textContent=String(s.bet);
  document.getElementById('payout').textContent=String(s.payout);
  document.getElementById('role').textContent=s.role;
  document.getElementById('betButton').disabled=s.phase!=='WAIT_BET'||!core.creditSystem.canBet();
  document.getElementById('leverButton').disabled=s.phase!=='WAIT_LEVER';
  document.getElementById('settingSelect').disabled=s.phase!=='WAIT_BET';
  document.getElementById('wantedSeek').disabled=s.phase!=='WAIT_BET'||s.normal.mode!=='NORMAL';
  document.getElementById('holdInject').disabled=s.phase!=='WAIT_BET'||s.normal.mode!=='WANTED_CHANCE';
  document.getElementById('holdTypeSelect').disabled=s.normal.mode!=='WANTED_CHANCE';
  document.querySelectorAll('[data-stop]').forEach(button=>{const i=Number(button.dataset.stop);button.disabled=s.phase!=='SPINNING'||s.reels.stopped[i];});
  document.getElementById('stopOrder').textContent=s.reels.stopOrder.length?s.reels.stopOrder.map(i=>['L','C','R'][i]).join(' → '):'---';
  document.getElementById('log').textContent=logger.toText();
}
