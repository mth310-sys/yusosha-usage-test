// Step 6Z: read-only audit for residual state between machine-loop scenarios.
export function scenarioIsolationSnapshot(core){
  const normal=core?.normal;
  const checks={
    waitBet:core?.phase==='WAIT_BET',
    lbIdle:core?.lupinBonus?.state==='IDLE',
    gtIdle:core?.goldenTime?.state==='IDLE',
    revengeIdle:core?.revenge?.state==='IDLE',
    noArtReturnPending:!core?.__artReturnPendingNotification,
    normalMode:normal?.mode==='NORMAL',
    noPendingReward:normal?.pendingReward==null,
    noCz:normal?.cz==null,
    noRize:normal?.rize==null,
    noLegendGate:normal?.legendGate==null,
    holdsClosed:normal?.holdQueue==null&&normal?.holdCapacity==null,
    wantedNotActive:!['ACTIVE','SUSPENDED'].includes(normal?.wantedState)
  };
  const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  return {
    status:failed.length?'BLOCKED_RESIDUAL_SCENARIO_STATE':'READY_FOR_NEXT_SCENARIO',
    checks,failed,
    phase:core?.phase??null,
    normalMode:normal?.mode??null,
    wantedState:normal?.wantedState??null,
    pendingReward:normal?.pendingReward?{...normal.pendingReward}:null,
    lbState:core?.lupinBonus?.state??null,
    gtState:core?.goldenTime?.state??null,
    revengeState:core?.revenge?.state??null,
    artReturnPending:Boolean(core?.__artReturnPendingNotification),
    nextInitialHit:core?.nextInitialHit?{...core.nextInitialHit}:null
  };
}

function ensurePanel(anchor){let p=document.getElementById('scenarioIsolationIntegrityPanel');if(p)return p;if(!anchor)return null;p=document.createElement('section');p.className='panel';p.id='scenarioIsolationIntegrityPanel';p.innerHTML='<h2>SCENARIO ISOLATION / STEP 6Z</h2><p class="note">次シナリオ開始前の残留状態を監査する。NEXT INITIAL HIT予約は正常な持越し情報なので残留エラー扱いにしない。</p><pre id="scenarioIsolationIntegrityState">NOT TESTED</pre>';anchor.parentNode.insertBefore(p,anchor.nextSibling);return p;}

export function renderScenarioIsolationIntegrity(core,anchor){const panel=ensurePanel(anchor);if(!panel)return null;const audit=scenarioIsolationSnapshot(core),el=document.getElementById('scenarioIsolationIntegrityState');if(el)el.textContent=[`OVERALL          ${audit.status}`,`PHASE            ${audit.phase??'---'}`,`NORMAL MODE      ${audit.normalMode??'---'}`,`WANTED STATE     ${audit.wantedState??'---'}`,`PENDING REWARD   ${audit.pendingReward?.type??'NONE'}`,`LB / GT / REV    ${audit.lbState??'---'} / ${audit.gtState??'---'} / ${audit.revengeState??'---'}`,`ART RETURN WAIT  ${audit.artReturnPending?'YES':'NO'}`,`NEXT HIT         ${audit.nextInitialHit?.type??'---'} (allowed)`,`BLOCKERS         ${audit.failed.join(', ')||'NONE'}`].join('\n');return audit;}
