// Step 6Z scenario 1/7: exercise the real NORMAL pending-reward resolver with a controlled LB reservation.
export function installNormalLbScenarioDebug({core,onChange=()=>{}}={}){
  const anchor=document.getElementById('machineScenarioGuidePanel')||document.getElementById('machineScenarioPanel');
  if(!anchor||!core)return {render:()=>{}};
  let panel=document.getElementById('normalLbScenarioDebugPanel');
  if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='normalLbScenarioDebugPanel';panel.innerHTML='<h2>SCENARIO 1/7 / NORMAL → LB</h2><p class="note">NORMALの実際のpendingReward→nextInitialHit→LB開始経路を通す。抽選確率の検証ではなく境界テスト専用。</p><div class="panel-head"><button id="normalLbScenarioRun" type="button">RUN NORMAL → LB</button></div><pre id="normalLbScenarioState">NOT RUN</pre>';anchor.parentNode.insertBefore(panel,anchor.nextSibling);}
  const button=document.getElementById('normalLbScenarioRun'),state=document.getElementById('normalLbScenarioState');
  const ready=()=>core.phase==='WAIT_BET'&&core.baseNormalReady()&&core.normal.mode==='NORMAL'&&core.normal.pendingReward==null;
  const render=()=>{if(button)button.disabled=!ready();const audit=core.snapshot()?.lastNormalTransitionIntegrity;if(state)state.textContent=`READY       ${ready()?'YES':'NO'}\nLB STATE    ${core.lupinBonus?.state??'---'}\nAUDIT       ${audit?.status??'NOT RUN'}\nDESTINATION ${audit?.destination??'---'}\nFAILED      ${audit?.failed?.join(', ')||'NONE'}`;};
  button?.addEventListener('click',()=>{if(!ready())return;core.normal.pendingReward={type:'LB_OR_GT',source:'SCENARIO_1_NORMAL_TO_LB',guarantee:'NORMAL_INITIAL_HIT',status:'SCENARIO_PENDING'};core.normal.transitionSource='SCENARIO_1_NORMAL_TO_LB';core.nextInitialHit={type:'LUPIN_BONUS',setting:core.setting,bonusPct:100,artPct:0,source:'SCENARIO_CONTROLLED_LB_RESERVATION',reservationSource:'SCENARIO_1_NORMAL_TO_LB',drawNo:++core.nextInitialHitDraws,forced:true};core.resolveNormalInitialHitPending();render();onChange();});
  render();return {render};
}
