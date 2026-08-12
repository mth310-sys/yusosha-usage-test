// Step 6Z scenario 4/7: prepare LB at its verified final fail boundary; the next real completed game crosses LB -> Revenge pending.
export function installLbFailRevengeScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('lbWinGtScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('lbFailRevengeScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='lbFailRevengeScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 4/7 / LB FAIL → REVENGE</h2><p class="note">LBを最終1G直前のFAIL確定状態へセットする。次の1Gを通常操作で完走するとGameCore本来のLB敗北→Revenge待ちを通る。</p><div class="panel-head"><button id="lbFailRevengeScenarioSetup" type="button">SETUP LB FINAL FAIL</button></div><pre id="lbFailRevengeScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('lbFailRevengeScenarioSetup'),state=document.getElementById('lbFailRevengeScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.goldenTime.state==='IDLE'&&core.revenge.state==='IDLE'&&core.lupinBonus.state==='IDLE';
  const render=()=>{if(button)button.disabled=!ready();const audit=core.snapshot()?.lastMajorReturnBoundaryIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nLB STATE    ${core.lupinBonus?.state??'---'}\nLB GAMES    ${core.lupinBonus?.gameCount??'---'} / REM ${core.lupinBonus?.remainingGames??'---'}\nREVENGE     ${core.revenge?.state??'---'}\nAUDIT       ${audit?.type==='LB_FAIL_TO_REVENGE_PENDING'?audit.status:'NOT RUN'}\nNEXT ACTION ${core.lupinBonus?.state==='ACTIVE'&&core.lupinBonus?.remainingGames===1?'PLAY 1 GAME':'SETUP'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;core.lupinBonus.reset();if(!core.lupinBonus.start('SCENARIO_4_LB_FAIL_TO_REVENGE'))return;const total=Number(core.lupinBonus.remainingGames)||0;core.lupinBonus.gameCount=Math.max(0,total-1);core.lupinBonus.remainingGames=1;core.lupinBonus.phase='ZENIGATA_BATTLE_FINAL_PREP';core.lupinBonus.hiddenOutcome='FAIL';core.lupinBonus.result='HIDDEN';core.lupinBonus.presentationCue='SCENARIO_FINAL_FAIL_BOUNDARY';core.lupinBonus.lastEvent='SCENARIO_4_LB_FINAL_FAIL_READY';render();onChange();});
  render();return {render};
}
