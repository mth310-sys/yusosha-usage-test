const spinTimers = [null,null,null];
const spinSymbols = ['LUPIN','JIGEN','GOEMON','BAR','CHERRY','COIN','REPLAY'];

export function startReelAnimation(){document.querySelectorAll('.reel-cell').forEach((cell,index)=>{clearInterval(spinTimers[index]);let p=index;spinTimers[index]=setInterval(()=>{p=(p+1)%spinSymbols.length;cell.textContent=spinSymbols[p];},70+index*12);cell.classList.add('spinning');});}
export function stopReelAnimation(index,symbol){clearInterval(spinTimers[index]);spinTimers[index]=null;const cell=document.querySelector(`.reel-cell[data-reel="${index}"]`);if(!cell)return;cell.textContent=symbol;cell.classList.remove('spinning');}
function renderHolds(holds){const root=document.getElementById('holdQueue');if(!root)return;if(!holds.length){root.textContent='---';return;}root.textContent=holds.map((hold,index)=>`${index + 1}:${hold.type}#${hold.id}`).join('  ');}

export function renderState(core,logger){
  const s=core.snapshot(), cz=s.normal.cz, rize=s.normal.rize, raiun=s.normal.raiun;
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set('game',`#${String(s.gameNo).padStart(6,'0')}`); set('setting',String(s.setting)); set('phase',s.phase); set('mode',s.normal.mode);
  set('normalGames',String(s.normal.gameCount)); set('wanted',String(s.normal.wantedCount)); set('wantedTarget',`${s.normal.wantedTargetZone.min}-${s.normal.wantedTargetZone.max}G`); set('wantedState',s.normal.wantedState); set('wantedChanceGames',String(s.normal.wantedChanceGameCount));
  set('holdCapacity',s.normal.holdCapacity==null?'---':String(s.normal.holdCapacity)); set('consumedHold',s.normal.lastConsumedHold?`${s.normal.lastConsumedHold.type}#${s.normal.lastConsumedHold.id}`:'---'); set('pendingReward',s.normal.pendingReward?`${s.normal.pendingReward.type} / ${s.normal.pendingReward.status}`:'---'); set('transitionSource',s.normal.transitionSource??'---');
  set('czType',cz?.type??'---'); set('czState',cz?.state??'---'); set('czScenario',cz?.scenario??'---'); set('czResult',cz?.result??'---'); set('czGames',cz?.gameCount==null?'---':String(cz.gameCount)); set('czRemain',cz?.remainingGames==null?'---':String(cz.remainingGames)); set('czTotal',cz?.totalGames==null?'---':String(cz.totalGames));
  set('rizeVariant',rize?.variant??'---'); set('rizeState',rize?.state??'---'); set('rizeBackground',rize?.background??'---'); set('rizeConfidence',rize?.backgroundConfidence==null?'---':`${rize.backgroundConfidence}%`); set('rizeResult',rize?.result??'---');
  set('raiunPoints',raiun?`${raiun.points}/${raiun.targetPoints}`:'---'); set('raiunState',raiun?.state??'---'); set('raiunHighLevel',raiun?.highLevel??'---'); set('raiunHighGames',raiun?.highRemainingGames==null?'---':`${raiun.highGameCount}/${raiun.highRemainingGames}`); set('raiunVariant',raiun?.variant??'---'); set('raiunModeGames',raiun?.variant?`${raiun.modeGameCount}/${raiun.modeRemainingGames??'∞'}`:'---'); set('raiunResult',raiun?.result??'---');
  renderHolds(s.normal.holdQueue);
  set('credit',String(s.credit)); set('bet',String(s.bet)); set('payout',String(s.payout)); set('role',s.role);

  document.getElementById('betButton').disabled=s.phase!=='WAIT_BET'||!core.creditSystem.canBet();
  document.getElementById('leverButton').disabled=s.phase!=='WAIT_LEVER';
  document.getElementById('settingSelect').disabled=s.phase!=='WAIT_BET';
  document.getElementById('wantedSeek').disabled=s.phase!=='WAIT_BET'||s.normal.mode!=='NORMAL';
  document.getElementById('holdInject').disabled=s.phase!=='WAIT_BET'||s.normal.mode!=='WANTED_CHANCE'; document.getElementById('holdTypeSelect').disabled=s.normal.mode!=='WANTED_CHANCE';
  const czReady=s.phase==='WAIT_BET'&&['DOROBO_ZONE','FUJIKO_ZONE'].includes(s.normal.mode)&&!!cz; document.getElementById('czSuccess').disabled=!czReady; document.getElementById('czFail').disabled=!czReady;
  const normalReady=s.phase==='WAIT_BET'&&s.normal.mode==='NORMAL'; document.getElementById('rizeEnter').disabled=!normalReady; document.getElementById('shinRizeEnter').disabled=!normalReady;
  const rizeReady=s.phase==='WAIT_BET'&&s.normal.mode==='RIZE_ZONE'&&!!rize; document.getElementById('rizeBackgroundSelect').disabled=!rizeReady; document.getElementById('rizeBackgroundSet').disabled=!rizeReady; document.getElementById('rizeSuccess').disabled=!rizeReady; document.getElementById('rizeFail').disabled=!rizeReady;
  document.getElementById('raiunLevelSelect').disabled=!normalReady; document.getElementById('raiunSeek').disabled=!normalReady; document.getElementById('raiunEnter').disabled=!normalReady; document.getElementById('shinRaiunEnter').disabled=!normalReady;
  const raiunReady=s.phase==='WAIT_BET'&&s.normal.mode==='RAIUN_MODE'; document.getElementById('raiunSuccess').disabled=!raiunReady; document.getElementById('raiunFail').disabled=!raiunReady||raiun?.variant==='SHIN_RAIUN';
  document.querySelectorAll('[data-stop]').forEach(button=>{const i=Number(button.dataset.stop);button.disabled=s.phase!=='SPINNING'||s.reels.stopped[i];});
  set('stopOrder',s.reels.stopOrder.length?s.reels.stopOrder.map(i=>['L','C','R'][i]).join(' → '):'---'); set('log',logger.toText());
}
