// Step 6Z: verified next initial-hit type is selected at BONUS / ART end.
// Never silently redraw later; audit the single currently outstanding reservation correctly.
import { GameCore } from './game-core.js?v=step6w';
import { NormalSystem } from './normal.js?v=step6w';
import { GoldenTimeSystem } from './golden-time.js?v=step6w';
import { drawNextInitialHit } from './next-initial-hit-profile.js?v=step6w';
import { getSettingProfile } from './setting-profile.js';
import { CZ_LENGTH_TABLE, CZ_SCENARIO_TABLE } from './cz-profile.js?v=step6s';
import { TREASURE_BATTLE_PROFILE } from './treasure-battle-profile.js?v=step6l';
import { LUPIN_RUSH_PROFILE } from './lupin-rush-profile.js?v=step6l';
import { GOLDEN_TIME_PROFILE } from './golden-time-profile.js?v=step6l';
import { ART_STAGE_PROFILE } from './art-stage-profile.js?v=step6l';

function renderIntegrityUi(audit){
  if(typeof document==='undefined'||!audit)return;
  const panel=document.getElementById('nextInitialHitPanel');
  if(!panel)return;
  let el=document.getElementById('nextInitialHitIntegrityState');
  if(!el){el=document.createElement('pre');el.id='nextInitialHitIntegrityState';el.textContent='INTEGRITY NOT RUN';panel.appendChild(el);}
  el.textContent=`INTEGRITY ${audit.status}\nLIVE RESV  ${audit.hasReservation?'YES':'NO'}\nLIVE DRAW  ${audit.currentDrawNo??'---'}\nDRAWS      ${audit.draws}\nCONSUMED   ${audit.consumed}\nDRAW VALID ${audit.currentDrawValid?'YES':'NO'}\nSEQ VALID  ${audit.consumptionSequenceValid?'YES':'NO'}`;
}

function isNonNegativeInteger(value){return typeof value==='number'&&Number.isFinite(value)&&Number.isInteger(value)&&value>=0;}
function isPositiveInteger(value){return isNonNegativeInteger(value)&&value>0;}
function goldenTimeCompletionPreflight(gt){
  if(!gt||gt.state==='IDLE')return true;
  if(gt.state==='LUPIN_RUSH_ACTIVE'){
    return isNonNegativeInteger(gt.rushGameCount)
      &&isPositiveInteger(gt.rushRemainingGames)
      &&gt.rushGameCount<LUPIN_RUSH_PROFILE.games
      &&gt.rushGameCount+gt.rushRemainingGames===LUPIN_RUSH_PROFILE.games;
  }
  if(gt.state==='ACTIVE_SET'){
    const total=GOLDEN_TIME_PROFILE.activeSetGames;
    if(!isNonNegativeInteger(gt.gameInSet)||!isPositiveInteger(gt.remainingGames)||gt.gameInSet>=total||gt.gameInSet+gt.remainingGames!==total)return false;
    if(gt.stage==='IKUKAN'){
      const ikukan=ART_STAGE_PROFILE.stages.IKUKAN;
      if(!isNonNegativeInteger(gt.ikukanGameCount)||!isPositiveInteger(gt.ikukanRemainingGames)||!isNonNegativeInteger(gt.ikukanGuaranteedMinimumAccrued))return false;
      if(gt.ikukanGameCount>=ikukan.durationGames||gt.ikukanGameCount+gt.ikukanRemainingGames!==ikukan.durationGames)return false;
      if(gt.ikukanGuaranteedMinimumAccrued!==gt.ikukanGameCount*ikukan.minimumTreasurePerGame)return false;
    }
    return true;
  }
  if(gt.state==='EXTRA_BONUS_ACTIVE'){
    const values=[gt.extraGameCount,gt.extraRemainingGames,gt.extraTargetGames,gt.extraStockLotteryEvents,gt.extraStockHits];
    if(values.some((value)=>!isNonNegativeInteger(value)))return false;
    if(gt.extraTargetGames<=0||gt.extraRemainingGames<=0||gt.extraGameCount>=gt.extraTargetGames)return false;
    if(gt.extraGameCount+gt.extraRemainingGames!==gt.extraTargetGames)return false;
    if(gt.extraStockLotteryEvents!==gt.extraGameCount||gt.extraStockHits>gt.extraStockLotteryEvents)return false;
    return true;
  }
  if(gt.state==='GOLD_RUSH_ACTIVE')return isNonNegativeInteger(gt.goldRushGameCount)&&isNonNegativeInteger(gt.goldRushStocks);
  if(gt.state==='BATTLE_ACTIVE'){
    return isNonNegativeInteger(gt.battleGameCount)
      &&gt.battleGameCount<TREASURE_BATTLE_PROFILE.totalGames
      &&(gt.battleHiddenOutcome==='WIN'||gt.battleHiddenOutcome==='LOSE');
  }
  return true;
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
    const addedTotal=this.stockAddedTotal;
    if(typeof addedTotal!=='number'||!Number.isFinite(addedTotal)||!Number.isInteger(addedTotal)||addedTotal<0)return 0;
    const source=args[0];
    const sourceCounts=this.stockSourceCounts;
    if(!sourceCounts||typeof sourceCounts!=='object'||Array.isArray(sourceCounts))return 0;
    if(Object.prototype.hasOwnProperty.call(sourceCounts,source)){
      const sourceCount=sourceCounts[source];
      if(typeof sourceCount!=='number'||!Number.isFinite(sourceCount)||!Number.isInteger(sourceCount)||sourceCount<0)return 0;
    }
    return originalRecordStockAdd.call(this,count,...args);
  };

  const originalConsumeStock=GoldenTimeSystem.prototype.consumeStock;
  GoldenTimeSystem.prototype.consumeStock=function consumeStockFailClosed(...args){
    const current=this.guaranteedStocks;
    const consumedTotal=this.stockConsumedTotal;
    if(typeof current!=='number'||!Number.isInteger(current)||current<0)return false;
    if(typeof consumedTotal!=='number'||!Number.isFinite(consumedTotal)||!Number.isInteger(consumedTotal)||consumedTotal<0)return false;
    return originalConsumeStock.apply(this,args);
  };

  const originalExpireStocksAtBattle=GoldenTimeSystem.prototype.expireStocksAtBattle;
  GoldenTimeSystem.prototype.expireStocksAtBattle=function expireStocksAtBattleFailClosed(...args){
    const current=this.guaranteedStocks;
    const expiredTotal=this.stockExpiredOnBattle;
    if(typeof current!=='number'||!Number.isInteger(current)||current<0)return 0;
    if(typeof expiredTotal!=='number'||!Number.isFinite(expiredTotal)||!Number.isInteger(expiredTotal)||expiredTotal<0)return 0;
    return originalExpireStocksAtBattle.apply(this,args);
  };

  const originalStartTreasureBattle=GoldenTimeSystem.prototype.startTreasureBattle;
  GoldenTimeSystem.prototype.startTreasureBattle=function startTreasureBattleFailClosedForInvalidEntry(...args){
    if(this.state!=='ACTIVE_SET')return null;
    const current=this.guaranteedStocks;
    if(typeof current!=='number'||!Number.isInteger(current)||current<0)return null;
    const treasure=this.treasurePoints;
    if(typeof treasure!=='number'||!Number.isFinite(treasure)||!Number.isInteger(treasure)||treasure<0)return null;
    const result=originalStartTreasureBattle.apply(this,args);
    if(this.state==='BATTLE_PENDING_UNVERIFIED_TREASURE_POINT'){
      this.battleGameCount=0;
      this.battlePhase=null;
      this.battleOpponent=null;
      this.battleHiddenOutcome=null;
    }
    return result;
  };

  const originalCompleteBattleGame=GoldenTimeSystem.prototype.completeBattleGame;
  GoldenTimeSystem.prototype.completeBattleGame=function completeBattleGameFailClosedForInvalidState(...args){
    if(this.state!=='BATTLE_ACTIVE')return null;
    const gameCount=this.battleGameCount;
    if(typeof gameCount!=='number'||!Number.isInteger(gameCount)||gameCount<0||gameCount>=TREASURE_BATTLE_PROFILE.totalGames)return null;
    if(this.battleHiddenOutcome!=='WIN'&&this.battleHiddenOutcome!=='LOSE')return null;
    return originalCompleteBattleGame.apply(this,args);
  };

  const originalCompleteExtraGame=GoldenTimeSystem.prototype.completeExtraGame;
  GoldenTimeSystem.prototype.completeExtraGame=function completeExtraGameFailClosedForInvalidState(...args){
    if(this.state!=='EXTRA_BONUS_ACTIVE')return null;
    const gameCount=this.extraGameCount;
    const remaining=this.extraRemainingGames;
    const target=this.extraTargetGames;
    const lotteryEvents=this.extraStockLotteryEvents;
    const stockHits=this.extraStockHits;
    const counters=[gameCount,remaining,target,lotteryEvents,stockHits];
    if(counters.some((value)=>typeof value!=='number'||!Number.isFinite(value)||!Number.isInteger(value)||value<0))return null;
    if(target<=0||remaining<=0||gameCount>=target)return null;
    if(gameCount+remaining!==target)return null;
    if(lotteryEvents!==gameCount)return null;
    if(stockHits>lotteryEvents)return null;
    return originalCompleteExtraGame.apply(this,args);
  };

  const originalCompleteGoldRushGame=GoldenTimeSystem.prototype.completeGoldRushGame;
  GoldenTimeSystem.prototype.completeGoldRushGame=function completeGoldRushGameFailClosedForInvalidState(...args){
    if(this.state!=='GOLD_RUSH_ACTIVE')return null;
    const gameCount=this.goldRushGameCount;
    const stocks=this.goldRushStocks;
    if(typeof gameCount!=='number'||!Number.isFinite(gameCount)||!Number.isInteger(gameCount)||gameCount<0)return null;
    if(typeof stocks!=='number'||!Number.isFinite(stocks)||!Number.isInteger(stocks)||stocks<0)return null;
    return originalCompleteGoldRushGame.apply(this,args);
  };

  const originalCompleteGame=GoldenTimeSystem.prototype.completeGame;
  GoldenTimeSystem.prototype.completeGame=function completeGameFailClosedForInvalidProgressionState(...args){
    if(!goldenTimeCompletionPreflight(this))return null;
    return originalCompleteGame.apply(this,args);
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

  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelFailClosedForInvalidGoldenTime(index,...args){
    const isFinalStop=this.phase==='SPINNING'
      &&Array.isArray(this.reels?.stopped)
      &&this.reels.stopped.filter(Boolean).length===2
      &&Number.isInteger(Number(index))
      &&Number(index)>=0
      &&Number(index)<=2
      &&this.reels.spinning?.[Number(index)]===true
      &&this.reels.stopped[Number(index)]===false;
    if(isFinalStop&&this.goldenTime?.state!=='IDLE'&&!goldenTimeCompletionPreflight(this.goldenTime))return null;
    return originalStopReel.call(this,index,...args);
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
