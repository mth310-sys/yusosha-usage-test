// Step 6Z scenario 6/7: use the existing ART-return implementation, but make the return draw deterministic for this boundary test.
export function installGtReturnHitScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('gtLossRevengeScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('gtReturnHitScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='gtReturnHitScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 6/7 / GT RETURN HIT → LB NOTICE</h2><p class="note">既存ART RETURN処理をそのまま使い、引き戻し抽選だけをテスト用に当選確定。Treasure Battle最終Gは通常操作で完走する。</p><div class="panel-head"><button id="gtReturnHitScenarioSetup" type="button">SETUP GT RETURN HIT</button></div><pre id="gtReturnHitScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('gtReturnHitScenarioSetup'),state=document.getElementById('gtReturnHitScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.lupinBonus.state==='IDLE'&&core.revenge.state==='IDLE'&&core.goldenTime.state==='IDLE'&&!core.__artReturnPendingNotification;
  const render=()=>{if(button)button.disabled=!ready();const pending=core.__artReturnPendingNotification,audit=core.snapshot()?.lastMajorReturnBoundaryIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nGT STATE    ${core.goldenTime?.state??'---'}\nBATTLE G    ${core.goldenTime?.battleGameCount??'---'}\nRETURN HIT  ${pending?'PENDING NOTICE':'---'}\nAUDIT       ${audit?.type==='GT_RETURN_HIT_PENDING_NOTIFICATION'?audit.status:'NOT RUN'}\nNEXT ACTION ${core.goldenTime?.state==='BATTLE_ACTIVE'?'PLAY 1 GAME':pending?'NOTICE ROUTE READY':'SETUP'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;const gt=core.goldenTime;gt.start({source:'SCENARIO_6_GT_RETURN_HIT'});gt.state='BATTLE_ACTIVE';gt.result='UNRESOLVED';gt.battleContinuationPct=0;gt.battleResult='HIDDEN';gt.battleSource='SCENARIO_VERIFIED_RETURN_HIT_BOUNDARY';gt.battleGameCount=3;gt.battlePhase='ATTACK_3';gt.battleHiddenOutcome='LOSE';gt.treasurePoints=100000;gt.lastEvent='SCENARIO_6_GT_BATTLE_G4_RETURN_HIT_READY';render();onChange();});
  render();return {render};
}
