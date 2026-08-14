// Step 6Z: verified next initial-hit type is selected at BONUS / ART end.
// Never silently redraw later; audit the single currently outstanding reservation correctly.
import { GameCore } from './game-core.js?v=step6w';
import { NormalSystem } from './normal.js?v=step6w';
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { drawNextInitialHit } from './next-initial-hit-profile.js?v=step6w';
import { getSettingProfile } from './setting-profile.js';
import { CZ_LENGTH_TABLE, CZ_SCENARIO_TABLE } from './cz-profile.js?v=step6s';
import { TREASURE_BATTLE_PROFILE } from './treasure-battle-profile.js?v=step6l';

function renderIntegrityUi(audit){
  if(typeof document==='undefined'||!audit)return;
  const panel=document.getElementById('nextInitialHitPanel');
  if(!panel)return;
  let el=document.getElementById('nextInitialHitIntegrityState');
  if(!el){el=document.createElement('pre');el.id='nextInitialHitIntegrityState';el.textContent='INTEGRITY NOT RUN';panel.appendChild(el);}
  el.textContent=`INTEGRITY ${audit.status}\nLIVE RESV  ${audit.hasReservation?'YES':'NO'}\nLIVE DRAW  ${audit.currentDrawNo??'---'}\nDRAWS      ${audit.draws}\nCONSUMED   ${audit.consumed}\nDRAW VALID ${audit.currentDrawValid?'YES':'NO'}\nSEQ VALID  ${audit.consumptionSequenceValid?'YES':'NO'}`;
}

if(!GoldenTimeSystem.prototype.__step6zStartInputGuardPatched){
  const originalSetSetting=GoldenTimeSystem.prototype.setSetting;
  GoldenTimeSystem.prototype.setSetting=function setSettingFailClosed(setting,...args){
    if(!getSettingProfile(setting))return false;
    return originalSetSetting.call(this,setting,...args);
  };

  const originalStart=GoldenTimeSystem.prototype.start;
  GoldenTimeSystem.prototype.start=function startFailClosedForInvalidInputs(options={}){
    const setting=Number(this.setting);
    if(!getSettingProfile(setting))return false;
    const guaranteedStocks=Number(options?.guaranteedStocks??0);
    if(!Number.isInteger(guaranteedStocks)||guaranteedStocks<0)return false;
    return originalStart.call(this,{...options,guaranteedStocks});
  };

  const originalRecordStockAdd=GoldenTimeSystem.prototype.recordStockAdd;
  GoldenTimeSystem.prototype.recordStockAdd=function recordStockAddFailClosed(count,...args){
    if(typeof count!=='number'||!Number.isInteger(count)||count<=0)return 0;
    return originalRecordStockAdd.call(this,count,...args);
  };

  const originalConsumeStock=GoldenTimeSystem.prototype.consumeStock;
  GoldenTimeSystem.prototype.consumeStock=function consumeStockFailClosed(...args){
    const current=this.guaranteedStocks;
    if(typeof current!=='number'||!Number.isInteger(current)||current<0)return false;
    return originalConsumeStock.apply(this,args);
  };

  const originalExpireStocksAtBattle=GoldenTimeSystem.prototype.expireStocksAtBattle;
  GoldenTimeSystem.prototype.expireStocksAtBattle=function expireStocksAtBattleFailClosed(...args){
    const current=this.guaranteedStocks;
    if(typeof current!=='number'||!Number.isInteger(current)||current<0)return 0;
    return originalExpireStocksAtBattle.apply(this,args);
  };

  const originalStartTreasureBattle=GoldenTimeSystem.prototype.startTreasureBattle;
  GoldenTimeSystem.prototype.startTreasureBattle=function startTreasureBattleFailClosedForInvalidEntry(...args){
    if(this.state!=='ACTIVE_SET')return null;
    const current=this.guaranteedStocks;
    if(typeof current!=='number'||!Number.isInteger(current)||current<0)return null;
    const treasure=this.treasurePoints;
    if(typeof treasure!=='number'||!Number.isFinite(treasure)||!Number.isInteger(treasure)||treasure<0)return null;
    return originalStartTreasureBattle.apply(this,args);
  };

  const originalCompleteBattleGame=GoldenTimeSystem.prototype.completeBattleGame;
  GoldenTimeSystem.prototype.completeBattleGame=function completeBattleGameFailClosedForInvalidState(...args){
    if(this.state!=='BATTLE_ACTIVE')return null;
    const gameCount=this.battleGameCount;
    if(typeof gameCount!=='number'||!Number.isInteger(gameCount)||gameCount<0||gameCount>=TREASURE_BATTLE_PROFILE.totalGames)return null;
    if(this.battleHiddenOutcome!=='WIN'&&this.battleHiddenOutcome!=='LOSE')return null;
    return originalCompleteBattleGame.apply(this,args);
  };

  GoldenTimeSystem.prototype.__step6zStartInputGuardPatched=true;
}

if(!NormalSystem.prototype.__step6zCzSettingGuardPatched){
  const originalStartCz=NormalSystem.prototype.startCz;
  NormalSystem.prototype.startCz=function startCzFailClosed(type,...args){
    const setting=Number(this.setting);
    if(!CZ_LENGTH_TABLE[setting]||!CZ_SCENARIO_TABLE[setting])return false;
    return originalStartCz.call(this,type,...args);
  };

  const originalApplyConsumedHold=NormalSystem.prototype.applyConsumedHold;
  NormalSystem.prototype.applyConsumedHold=function applyConsumedHoldFailClosedForCz(hold,...args){
    if(hold?.reservedEvent==='DOROBO_ZONE'||hold?.reservedEvent==='FUJIKO_ZONE'){
      const setting=Number(this.setting);
      if(!CZ_LENGTH_TABLE[setting]||!CZ_SCENARIO_TABLE[setting])return false;
    }
    return originalApplyConsumedHold.call(this,hold,...args);
  };

  NormalSystem.prototype.__step6zCzSettingGuardPatched=true;
}

if(!GameCore.prototype.__step6zNextInitialHitIntegrityPatched){
  GameCore.prototype.drawNextInitialHitReservation=function drawNextInitialHitReservationFailClosed(source='BONUS_OR_ART_END'){
    const draw=drawNextInitialHit(this.setting,this.rng);
    if(!draw){this.nextInitialHit=null;return null;}
    this.nextInitialHit={...draw,reservationSource:source,drawNo:++this.nextInitialHitDraws};
    return this.nextInitialHit;
  };

  const originalSetSetting=GameCore.prototype.setSetting;
  GameCore.prototype.setSetting=function setSettingFailClosed(setting,...args){
    if(!getSettingProfile(setting))return false;
    return originalSetSetting.call(this,setting,...args);
  };

  const originalBet=GameCore.prototype.bet;
  GameCore.prototype.bet=function betFailClosedForUnsupportedSetting(...args){
    if(!this.profile)return false;
    return originalBet.apply(this,args);
  };

  GameCore.prototype.consumeNextInitialHit=function consumeNextInitialHitFailClosed(source){
    if(!this.nextInitialHit){this.lastInitialHitResolution={type:null,consumedBy:source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};return null;}
    const reservation={...this.nextInitialHit};this.nextInitialHit=null;this.nextInitialHitConsumed+=1;this.lastInitialHitResolution={...reservation,consumedBy:source,consumedNo:this.nextInitialHitConsumed};return this.lastInitialHitResolution;
  };

  const originalResolve=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function resolveNormalInitialHitWithIntegrity(...args){const pending=this.normal?.pendingReward;if(pending?.type==='LB_OR_GT'&&!this.nextInitialHit){pending.status='ERROR_MISSING_NEXT_INITIAL_HIT_RESERVATION';this.lastInitialHitResolution={type:null,consumedBy:pending.source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};return null;}return originalResolve.apply(this,args);};

  GameCore.prototype.nextInitialHitIntegritySnapshot=function nextInitialHitIntegritySnapshot(){
    const draws=Number(this.nextInitialHitDraws)||0,consumed=Number(this.nextInitialHitConsumed)||0,hasReservation=!!this.nextInitialHit;
    const currentDrawNo=hasReservation?Number(this.nextInitialHit.drawNo)||null:null;
    const currentDrawValid=!hasReservation||(Number.isInteger(currentDrawNo)&&currentDrawNo>=1&&currentDrawNo<=draws);
    const missingReservation=!hasReservation&&this.normal?.pendingReward?.type==='LB_OR_GT';
    const consumeAheadOfDraw=consumed>draws;
    const lastConsumedNo=Number(this.lastInitialHitResolution?.consumedNo)||0;
    const consumptionSequenceValid=lastConsumedNo===consumed;
    const status=missingReservation?'ERROR_MISSING_RESERVATION':consumeAheadOfDraw?'ERROR_CONSUMED_MORE_THAN_DRAWN':!currentDrawValid?'ERROR_INVALID_LIVE_RESERVATION_DRAW_NO':!consumptionSequenceValid?'ERROR_CONSUMPTION_SEQUENCE':'OK';
    return {status,draws,consumed,hasReservation,currentDrawNo,currentDrawValid,missingReservation,consumeAheadOfDraw,consumptionSequenceValid,replacementRedrawsPossible:true,lastResolution:this.lastInitialHitResolution?{...this.lastInitialHitResolution}:null};
  };

  const originalNextSnapshot=GameCore.prototype.nextInitialHitSnapshot;
  GameCore.prototype.nextInitialHitSnapshot=function nextInitialHitSnapshotWithIntegrity(...args){const integrity=this.nextInitialHitIntegritySnapshot();renderIntegrityUi(integrity);return {...originalNextSnapshot.apply(this,args),integrity};};

  GameCore.prototype.__step6zNextInitialHitIntegrityPatched=true;
}
