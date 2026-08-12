// Step 6Z: non-invasive scenario test guide. Uses existing debug controls; does not synthesize game outcomes.
const STEPS=[
  ['NORMAL → LB','Use a verified NORMAL initial-hit route with NEXT HIT = LUPIN_BONUS, then resolve it.'],
  ['NORMAL → GT','Use a verified NORMAL initial-hit route with NEXT HIT = GOLDEN_TIME, then resolve it.'],
  ['LB WIN → GT','Enter LUPIN BONUS, then use the existing EARLY ART / TYPEWRITER success debug route.'],
  ['LB FAIL → REVENGE','Play LUPIN BONUS to its verified fail boundary and confirm REVENGE pending.'],
  ['GT LOSS → REVENGE','Play GOLDEN TIME through Treasure Battle loss and confirm REVENGE pending.'],
  ['GT RETURN HIT → LB NOTICE','Play the verified ART return-hit branch until LB notification pending is produced.'],
  ['REVENGE FAIL → NORMAL','Enter REVENGE and play/skip the verified fail route back to NORMAL.']
];
function ensurePanel(){let p=document.getElementById('machineScenarioGuidePanel');if(p)return p;const anchor=document.getElementById('machineScenarioPanel')||document.getElementById('machineLoopIntegrityPanel');if(!anchor)return null;p=document.createElement('section');p.className='panel';p.id='machineScenarioGuidePanel';p.innerHTML='<h2>MACHINE LOOP SCENARIO TEST GUIDE / STEP 6Z</h2><p class="note">既存のDEBUG操作だけで7経路を順番に踏むための案内。結果そのものは強制作成しない。</p><pre id="machineScenarioGuideState"></pre>';anchor.parentNode.insertBefore(p,anchor.nextSibling);return p;}
export function renderMachineScenarioTestGuide(){const p=ensurePanel();if(!p)return;const coverage=document.getElementById('machineScenarioPanelState')?.textContent??'';const lines=STEPS.map(([name,guide],i)=>{const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=coverage.match(new RegExp(`${escaped}\\s+(PASS|FAIL|NOT RUN)`));const state=m?.[1]??'NOT RUN';return `${String(i+1).padStart(2,'0')}. ${name.padEnd(24,' ')} ${state}\n    ${guide}`;});const next=STEPS.find(([name])=>!new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\s+PASS`).test(coverage));document.getElementById('machineScenarioGuideState').textContent=[`NEXT             ${next?.[0]??'ALL 7 COMPLETE'}`,...lines].join('\n');}
