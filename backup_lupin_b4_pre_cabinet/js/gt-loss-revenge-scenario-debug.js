// Step 6Z scenario 5/7: prepare GT Treasure Battle at G4 with a verified lose outcome; the next real completed game crosses GT -> Revenge pending.
export function installGtLossRevengeScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('lbFailRevengeScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('gtLossRevengeScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='gtLossRevengeScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 5/7 / GT LOSS → REVENGE</h2><p class="note">GT Treasure Battleを最終G直前・LOSE確定へセットする。次の1Gを通常操作で完走すると本来のART終了→Revenge待ちを通る。</p><div class="panel-head"><button id="gtLossRevengeScenarioSetup" type="button">SETUP GT BATTLE FINAL LOSS</button></div><pre id="gtLossRevengeScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('gtLossRevengeScenarioSetup'),state=document.getElementById('gtLossRevengeScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.lupinBonus.state==='IDLE'&&core.revenge.state==='IDLE'&&core.goldenTime.state==='IDLE';
  const render=()=>{if(button)button.disabled=!ready();const gt=core.goldenTime,audit=core.snapshot()?.lastMajorReturnBoundaryIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nGT STATE    ${gt?.state??'---'}\nBATTLE G    ${gt?.battleGameCount??'---'}\nOUTCOME     ${gt?.battleHiddenOutcome??'---'}\nREVENGE     ${core.revenge?.state??'---'}\nAUDIT       ${audit?.type==='GT_LOSS_TO_REVENGE_PENDING'?audit.status:'NOT RUN'}\nNEXT ACTION ${gt?.state==='BATTLE_ACTIVE'&&gt?.battleGameCount===3?'PLAY 1 GAME':'SETUP'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;const gt=core.goldenTime;gt.start({source:'SCENARIO_5_GT_LOSS_TO_REVENGE'});gt.state='BATTLE_ACTIVE';gt.result='UNRESOLVED';gt.battleContinuationPct=0;gt.battleResult='HIDDEN';gt.battleSource='SCENARIO_VERIFIED_BATTLE_FINAL_BOUNDARY';gt.battleGameCount=3;gt.battlePhase='ATTACK_3';gt.battleHiddenOutcome='LOSE';gt.lastEvent='SCENARIO_5_GT_BATTLE_G4_LOSS_READY';render();onChange();});
  render();return {render};
}
