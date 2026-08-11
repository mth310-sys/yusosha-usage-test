import { TREASURE_RUSH_PROFILE, isSupportedTreasureRushDuration, validateTreasureRushManualAward } from './treasure-rush-profile.js?v=step6z-tr1';

const MAX_DISPLAY_TREASURE = 1000000;

function freshDebugState() {
  return {
    active:false,
    targetGames:null,
    gameCount:0,
    totalAwardPoints:0,
    baseTreasurePoints:0,
    displayedTreasurePoints:0,
    carryoverPoints:0,
    lastAwardPoints:null,
    result:'IDLE',
    source:null
  };
}

function debugSnapshot(gt) {
  const x=gt.__treasureRushDebug ?? freshDebugState();
  return {
    ...x,
    profile:TREASURE_RUSH_PROFILE,
    policy:'DEBUG_MANUAL_ONLY_NO_SYNTHETIC_DURATION_OR_AWARD_DISTRIBUTION'
  };
}

function installCoreHooks(gt) {
  if (gt.__treasureRushDebugInstalled) return;
  gt.__treasureRushDebugInstalled=true;
  gt.__treasureRushDebug=freshDebugState();

  const originalSnapshot=gt.snapshot.bind(gt);
  gt.snapshot=()=>({ ...originalSnapshot(), treasureRushDebug:debugSnapshot(gt) });

  const originalReset=gt.reset.bind(gt);
  gt.reset=(...args)=>{
    const out=originalReset(...args);
    gt.__treasureRushDebug=freshDebugState();
    return out;
  };

  const originalFinishExtra=gt.finishExtraToGuaranteedNextSet?.bind(gt);
  if (originalFinishExtra) {
    gt.finishExtraToGuaranteedNextSet=(...args)=>{
      const carry=Math.max(0,Number(gt.__treasureRushDebug?.carryoverPoints)||0);
      const out=originalFinishExtra(...args);
      if (carry>0) {
        gt.treasurePoints=Math.min(MAX_DISPLAY_TREASURE,carry);
        gt.__treasureRushDebug.carryoverPoints=Math.max(0,carry-MAX_DISPLAY_TREASURE);
        gt.__treasureRushDebug.displayedTreasurePoints=gt.treasurePoints;
        gt.__treasureRushDebug.result=carry>=MAX_DISPLAY_TREASURE
          ? 'CARRYOVER_REACHED_1M_NEXT_SET_EXTRA_CHAIN_PENDING_DEBUG'
          : 'CARRYOVER_APPLIED_TO_NEXT_SET';
        gt.lastEvent=carry>=MAX_DISPLAY_TREASURE
          ? `TREASURE_RUSH_CARRYOVER_${carry}_NEXT_SET_1M_CHAIN_PENDING`
          : `TREASURE_RUSH_CARRYOVER_${carry}_APPLIED_NEXT_SET`;
      }
      return gt.snapshot();
    };
  }

  gt.startTreasureRushForTest=(duration,source='DEBUG_MANUAL_TREASURE_RUSH')=>{
    const games=Number(duration);
    if (gt.state!=='ACTIVE_SET'||!isSupportedTreasureRushDuration(games)) return false;
    gt.__treasureRushDebug={
      active:true,
      targetGames:games,
      gameCount:0,
      totalAwardPoints:0,
      baseTreasurePoints:Number(gt.treasurePoints)||0,
      displayedTreasurePoints:Number(gt.treasurePoints)||0,
      carryoverPoints:0,
      lastAwardPoints:null,
      result:'ACTIVE',
      source
    };
    gt.state='TREASURE_RUSH_DEBUG_ACTIVE';
    gt.lastEvent=`TREASURE_RUSH_DEBUG_START_${games}G`;
    return gt.snapshot();
  };

  gt.applyTreasureRushAwardForTest=(points)=>{
    const x=gt.__treasureRushDebug;
    if (gt.state!=='TREASURE_RUSH_DEBUG_ACTIVE'||!x?.active) return false;
    const gameIndex=x.gameCount+1;
    const award=Number(points);
    if (!validateTreasureRushManualAward(award,gameIndex)) return false;

    x.gameCount=gameIndex;
    x.lastAwardPoints=award;
    x.totalAwardPoints+=award;
    const rawTotal=x.baseTreasurePoints+x.totalAwardPoints;
    x.displayedTreasurePoints=Math.min(MAX_DISPLAY_TREASURE,rawTotal);
    x.carryoverPoints=Math.max(0,rawTotal-MAX_DISPLAY_TREASURE);
    gt.treasurePoints=x.displayedTreasurePoints;
    gt.lastEvent=`TREASURE_RUSH_DEBUG_G${gameIndex}_PLUS_${award}`;

    if (x.gameCount>=x.targetGames) {
      x.active=false;
      if (rawTotal>=MAX_DISPLAY_TREASURE) {
        x.result='END_1M_GOLD_CHANCE_PENDING';
        gt.goldChanceBaseRemainingGames=gt.remainingGames;
        gt.state='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION';
        gt.lastEvent=`TREASURE_RUSH_DEBUG_END_1M_CARRYOVER_${x.carryoverPoints}_GOLD_CHANCE_PENDING`;
      } else {
        x.result='END_RETURN_ACTIVE_SET';
        gt.state='ACTIVE_SET';
        gt.lastEvent=`TREASURE_RUSH_DEBUG_END_${rawTotal}_RETURN_ACTIVE_SET`;
      }
    }
    return gt.snapshot();
  };
}

export function installTreasureRushDebug({core,onChange=()=>{}}={}) {
  const gt=core?.goldenTime;
  if (!gt) return { render:()=>{} };
  installCoreHooks(gt);

  const gameLog=document.getElementById('log')?.closest('.panel');
  if (!gameLog) return { render:()=>{} };

  let panel=document.getElementById('treasureRushDebugPanel');
  if (!panel) {
    panel=document.createElement('section');
    panel.className='panel';
    panel.id='treasureRushDebugPanel';
    panel.innerHTML=`<h2>TREASURE RUSH / STEP 6Z MANUAL</h2>
      <p class="note">4〜9Gの作業モデルと公開済み上乗せ範囲だけを使用。継続G数振り分け・上乗せ振り分け・自然突入率は未回収のため自動抽選しない。</p>
      <div class="panel-head">
        <select id="treasureRushDuration"><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option></select>
        <button id="treasureRushStart" type="button">START MANUAL RUSH</button>
      </div>
      <div class="panel-head">
        <input id="treasureRushAward" type="number" min="50000" step="50000" value="50000" inputmode="numeric">
        <button id="treasureRushAwardApply" type="button" disabled>APPLY NEXT G AWARD</button>
      </div>
      <pre id="treasureRushDebugState">NOT RUN</pre>`;
    gameLog.parentNode.insertBefore(panel,gameLog);
  }

  const duration=document.getElementById('treasureRushDuration');
  const award=document.getElementById('treasureRushAward');
  const start=document.getElementById('treasureRushStart');
  const apply=document.getElementById('treasureRushAwardApply');
  const state=document.getElementById('treasureRushDebugState');

  const render=()=>{
    const x=gt.snapshot().treasureRushDebug;
    const canStart=core.phase==='WAIT_BET'&&gt.state==='ACTIVE_SET';
    const canApply=core.phase==='WAIT_BET'&&gt.state==='TREASURE_RUSH_DEBUG_ACTIVE'&&x.active;
    if(start)start.disabled=!canStart;
    if(apply)apply.disabled=!canApply;
    if(state)state.textContent=`CORE STATE    ${gt.state}\nTARGET        ${x.targetGames??'---'}G\nRUSH GAME     ${x.gameCount}/${x.targetGames??'---'}\nBASE TREASURE ${x.baseTreasurePoints}\nLAST AWARD    ${x.lastAwardPoints??'---'}\nRUSH AWARD    ${x.totalAwardPoints}\nDISPLAY       ${x.displayedTreasurePoints}\nCARRYOVER     ${x.carryoverPoints}\nRESULT        ${x.result}\nAUTO ENTRY    DISABLED\nAUTO DURATION DISABLED\nAUTO AWARD    DISABLED`;
  };

  start?.addEventListener('click',()=>{
    gt.startTreasureRushForTest(Number(duration.value));
    render();onChange();
  });
  apply?.addEventListener('click',()=>{
    gt.applyTreasureRushAwardForTest(Number(award.value));
    render();onChange();
  });

  render();
  return { render };
}
