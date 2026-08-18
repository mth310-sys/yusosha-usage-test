// Step 6Z scenario 3/7: prepare LB at its verified final ART-win boundary; the next real completed game crosses LB -> GT.
export function installLbWinGtScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('normalGtScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('lbWinGtScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='lbWinGtScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 3/7 / LB WIN → GT</h2><p class="note">LBを最終1G直前のART勝利確定状態へセットする。次の1Gを通常操作で完走するとGameCore本来のLB→GT自動遷移を通る。</p><div class="panel-head"><button id="lbWinGtScenarioSetup" type="button">SETUP LB FINAL WIN</button></div><pre id="lbWinGtScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('lbWinGtScenarioSetup'),state=document.getElementById('lbWinGtScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.goldenTime.state==='IDLE'&&core.revenge.state==='IDLE'&&core.lupinBonus.state==='IDLE';
  const render=()=>{if(button)button.disabled=!ready();const audit=core.snapshot()?.lastMajorReturnBoundaryIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nLB STATE    ${core.lupinBonus?.state??'---'}\nLB GAMES    ${core.lupinBonus?.gameCount??'---'} / REM ${core.lupinBonus?.remainingGames??'---'}\nGT STATE    ${core.goldenTime?.state??'---'}\nAUDIT       ${audit?.type==='LB_WIN_TO_GT'?audit.status:'NOT RUN'}\nNEXT ACTION ${core.lupinBonus?.state==='ACTIVE'&&core.lupinBonus?.remainingGames===1?'PLAY 1 GAME':'SETUP'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;core.lupinBonus.reset();if(!core.lupinBonus.start('SCENARIO_3_LB_WIN_TO_GT'))return;const total=Number(core.lupinBonus.remainingGames)||0;core.lupinBonus.gameCount=Math.max(0,total-1);core.lupinBonus.remainingGames=1;core.lupinBonus.phase='ZENIGATA_BATTLE_FINAL_PREP';core.lupinBonus.hiddenOutcome='ART';core.lupinBonus.result='HIDDEN';core.lupinBonus.presentationCue='SCENARIO_FINAL_WIN_BOUNDARY';core.lupinBonus.lastEvent='SCENARIO_3_LB_FINAL_WIN_READY';render();onChange();});
  render();return {render};
}
