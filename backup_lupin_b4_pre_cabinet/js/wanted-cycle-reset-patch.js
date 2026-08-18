// Reset only the WANTED cycle at verified reset timings.
// Public analysis uses the INITIAL WANTED target table after setting change, LUPIN BONUS end and ART end.
import { GameCore } from './game-core.js?v=step6w';
import { drawWantedInitialTarget } from './wanted-profile.js?v=step6s';

const RESET_SOURCES=new Set([
  'LUPIN_BONUS_END_VERIFIED_TIMING',
  'ART_END_VERIFIED_TIMING',
  'SETTING_CHANGE_DEBUG_REDRAW'
]);

function resetWantedCycle(core,source){
  const normal=core?.normal;
  if(!normal)return null;
  const next=drawWantedInitialTarget(core.rng);
  if(!next)return null;
  normal.wantedCount=0;
  normal.wantedCycle='INITIAL';
  normal.wantedTargetZone=next.zone;
  normal.wantedTargetGame=next.game;
  normal.wantedTargetDistribution=next.distribution;
  normal.wantedHardMaxGame=next.hardMaxGame;
  normal.wantedState='COUNTING';
  normal.wantedEntrySource=`${source}_VERIFIED_INITIAL_TABLE_RESET`;
  normal.wantedChanceGameCount=0;
  normal.wantedChanceRemaining=null;
  normal.wantedChanceFrozen=false;
  normal.wantedChanceResult='UNRESOLVED';
  normal.closeWantedHolds?.();
  normal.lastConsumedHold=null;
  return next;
}

if(!GameCore.prototype.__step6acWantedCycleResetPatched){
  const originalDrawNextInitialHitReservation=GameCore.prototype.drawNextInitialHitReservation;
  GameCore.prototype.drawNextInitialHitReservation=function drawNextInitialHitReservationWithWantedReset(source='BONUS_OR_ART_END',...args){
    const out=originalDrawNextInitialHitReservation.call(this,source,...args);
    if(RESET_SOURCES.has(source))resetWantedCycle(this,source);
    return out;
  };
  GameCore.prototype.__step6acWantedCycleResetPatched=true;
}
