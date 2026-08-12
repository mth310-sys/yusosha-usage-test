// Step 6Z scenario 3/7: enter LB and force its verified early-battle ART state; the next real completed game crosses LB -> GT.
export function installLbWinGtScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('normalGtScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('lbWinGtScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='lbWinGtScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 3/7 / LB WIN → GT</h2><p class="note">LBの検証済みEARLY BATTLE WIN状態を作る。次の1Gを通常操作で完走するとGameCore本来のLB→GT自動遷移を通る。</p><div class="panel-head"><button id="lbWinGtScenarioSetup" type="button">SETUP LB EARLY WIN</button></div><pre id="lbWinGtScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('lbWinGtScenarioSetup'),state=document.getElementById('lbWinGtScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.goldenTime.state==='IDLE'&&core.revenge.state==='IDLE'&&core.lupinBonus.state==='IDLE';
  const render=()=>{if(button)button.disabled=!ready();const audit=core.snapshot()?.lastMajorReturnBoundaryIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nLB STATE    ${core.lupinBonus?.state??'---'}\nGT STATE    ${core.goldenTime?.state??'---'}\nAUDIT       ${audit?.type==='LB_WIN_TO_GT'?audit.status:'NOT RUN'}\nNEXT ACTION ${core.lupinBonus?.state==='SUCCESS_ART_PENDING_GT'?'PLAY 1 GAME':'SETUP'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;core.lupinBonus.reset();if(!core.lupinBonus.start('SCENARIO_3_LB_WIN_TO_GT'))return;core.lupinBonus.forceVerifiedEarlyBattleWinForTest('BATTLE_WIN');render();onChange();});
  render();return {render};
}
