// Step 6Z scenario 2/7: exercise the real NORMAL pending-reward resolver with a controlled GT reservation.
export function installNormalGtScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('normalLbScenarioDebugPanel')||document.getElementById('machineScenarioGuidePanel')||document.getElementById('machineScenarioPanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('normalGtScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='normalGtScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 2/7 / NORMAL → GT</h2><p class="note">NORMALの実際のpendingReward→nextInitialHit→GOLDEN TIME開始経路を通す。抽選確率の検証ではなく境界テスト専用。</p><div class="panel-head"><button id="normalGtScenarioRun" type="button">RUN NORMAL → GT</button></div><pre id="normalGtScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('normalGtScenarioRun'),state=document.getElementById('normalGtScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.baseNormalReady()&&core.normal.mode==='NORMAL'&&core.normal.pendingReward==null;
  const render=()=>{if(button)button.disabled=!ready();const audit=core.snapshot()?.lastNormalTransitionIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nGT STATE    ${core.goldenTime?.state??'---'}\nAUDIT       ${audit?.status??'NOT RUN'}\nDESTINATION ${audit?.destination??'---'}\nFAILED      ${audit?.failed?.join(', ')||'NONE'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;core.normal.pendingReward={type:'LB_OR_GT',source:'SCENARIO_2_NORMAL_TO_GT',guarantee:'NORMAL_INITIAL_HIT',status:'SCENARIO_PENDING'};core.normal.transitionSource='SCENARIO_2_NORMAL_TO_GT';core.nextInitialHit={type:'GOLDEN_TIME',setting:core.setting,bonusPct:0,artPct:100,source:'SCENARIO_CONTROLLED_GT_RESERVATION',reservationSource:'SCENARIO_2_NORMAL_TO_GT',drawNo:++core.nextInitialHitDraws,forced:true};core.resolveNormalInitialHitPending();render();onChange();});
  render();return {render};
}
