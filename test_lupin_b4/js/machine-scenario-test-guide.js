// Step 6Z: scenario guide plus controlled boundary-test controls.
import { installNormalLbScenarioDebug } from './normal-lb-scenario-debug.js?v=step6z-normal-lb-scenario1';
import { installNormalGtScenarioDebug } from './normal-gt-scenario-debug.js?v=step6z-normal-gt-scenario1';
import { installLbWinGtScenarioDebug } from './lb-win-gt-scenario-debug.js?v=step6z-lb-win-gt-scenario1';
import { installLbFailRevengeScenarioDebug } from './lb-fail-revenge-scenario-debug.js?v=step6z-lb-fail-revenge-scenario1';
import { installGtLossRevengeScenarioDebug } from './gt-loss-revenge-scenario-debug.js?v=step6z-gt-loss-revenge-scenario1';
import { installGtReturnHitScenarioDebug } from './gt-return-hit-scenario-debug.js?v=step6z-gt-return-hit-scenario1';
const STEPS=[
  ['NORMAL → LB','Use SCENARIO 1/7 to pass the real NORMAL pendingReward resolver into LUPIN BONUS.'],
  ['NORMAL → GT','Use SCENARIO 2/7 to pass the real NORMAL pendingReward resolver into GOLDEN TIME.'],
  ['LB WIN → GT','Use SCENARIO 3/7 to set the verified LB early-win state, then play one real game to cross into GT.'],
  ['LB FAIL → REVENGE','Use SCENARIO 4/7 to set LB at its final verified fail boundary, then play one real game into Revenge pending.'],
  ['GT LOSS → REVENGE','Use SCENARIO 5/7 to set Treasure Battle at G4 lose, then play one real game into Revenge pending.'],
  ['GT RETURN HIT → LB NOTICE','Use SCENARIO 6/7 to set Treasure Battle at a guaranteed ART-return hit boundary, then play one real game.'],
  ['REVENGE FAIL → NORMAL','Enter REVENGE and play/skip the verified fail route back to NORMAL.']
];
let scenario1=null,scenario2=null,scenario3=null,scenario4=null,scenario5=null,scenario6=null;
function ensurePanel(){let p=document.getElementById('machineScenarioGuidePanel');if(p)return p;const anchor=document.getElementById('machineScenarioPanel')||document.getElementById('machineLoopIntegrityPanel');if(!anchor)return null;p=document.createElement('section');p.className='panel';p.id='machineScenarioGuidePanel';p.innerHTML='<h2>MACHINE LOOP SCENARIO TEST GUIDE / STEP 6Z</h2><p class="note">実際の境界処理を通して7経路を順番に検証する。確率抽選そのものをPASS扱いにはしない。</p><pre id="machineScenarioGuideState"></pre>';anchor.parentNode.insertBefore(p,anchor.nextSibling);return p;}
export function renderMachineScenarioTestGuide(core){const p=ensurePanel();if(!p)return;if(core&&!scenario1)scenario1=installNormalLbScenarioDebug({core,onChange:()=>{}});if(core&&!scenario2)scenario2=installNormalGtScenarioDebug({core,onChange:()=>{}});if(core&&!scenario3)scenario3=installLbWinGtScenarioDebug({core,onChange:()=>{}});if(core&&!scenario4)scenario4=installLbFailRevengeScenarioDebug({core,onChange:()=>{}});if(core&&!scenario5)scenario5=installGtLossRevengeScenarioDebug({core,onChange:()=>{}});if(core&&!scenario6)scenario6=installGtReturnHitScenarioDebug({core,onChange:()=>{}});scenario1?.render();scenario2?.render();scenario3?.render();scenario4?.render();scenario5?.render();scenario6?.render();const coverage=document.getElementById('machineScenarioPanelState')?.textContent??'';const lines=STEPS.map(([name,guide],i)=>{const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=coverage.match(new RegExp(`${escaped}\\s+(PASS|FAIL|NOT RUN)`));const state=m?.[1]??'NOT RUN';return `${String(i+1).padStart(2,'0')}. ${name.padEnd(24,' ')} ${state}\n    ${guide}`;});const next=STEPS.find(([name])=>!new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+PASS`).test(coverage));document.getElementById('machineScenarioGuideState').textContent=[`NEXT             ${next?.[0]??'ALL 7 COMPLETE'}`,...lines].join('\n');}
