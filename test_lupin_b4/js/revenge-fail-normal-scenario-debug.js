// Step 6Z scenario 7/7: prepare ordinary Revenge Chance at its final game; the next real completed game expires to NORMAL.
export function installRevengeFailNormalScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('gtReturnHitScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('revengeFailNormalScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='revengeFailNormalScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 7/7 / REVENGE FAIL → NORMAL</h2><p class="note">通常Revenge Chanceを最終1G直前へセットする。次の1Gを通常操作で完走し、10G消化失敗→GameCoreのNORMAL復帰を実際に通す。</p><div class="panel-head"><button id="revengeFailNormalScenarioSetup" type="button">SETUP REVENGE FINAL FAIL</button></div><pre id="revengeFailNormalScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('revengeFailNormalScenarioSetup'),state=document.getElementById('revengeFailNormalScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.lupinBonus.state==='IDLE'&&core.goldenTime.state==='IDLE'&&core.revenge.state==='IDLE'&&!core.__artReturnPendingNotification;
  const render=()=>{if(button)button.disabled=!ready();const rv=core.revenge,audit=core.snapshot()?.lastMajorReturnBoundaryIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nREVENGE     ${rv?.state??'---'}\nREV GAMES   ${rv?.gameCount??'---'} / REM ${rv?.remainingGames??'---'}\nNORMAL MODE ${core.normal?.mode??'---'}\nAUDIT       ${audit?.type==='REVENGE_FAIL_TO_NORMAL'?audit.status:'NOT RUN'}\nNEXT ACTION ${rv?.state==='ACTIVE'&&rv?.remainingGames===1?'PLAY 1 GAME':'SETUP'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;const rv=core.revenge;rv.reset();if(!rv.offer('SCENARIO_7_REVENGE_FAIL_TO_NORMAL'))return;if(!rv.startForTest())return;const total=Number(rv.remainingGames)||10;rv.gameCount=Math.max(0,total-1);rv.remainingGames=1;rv.result='UNRESOLVED';rv.destination=null;rv.guaranteedDestination=null;rv.lastEvent='SCENARIO_7_REVENGE_FINAL_FAIL_READY';render();onChange();});
  render();return {render};
}
