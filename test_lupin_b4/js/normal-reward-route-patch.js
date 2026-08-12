// Step 6Z: normal-mode reward reservations are one-shot routes.
// Once LB/GT actually starts, clear the consumed reward and normalize stale normal submode
// state so ART/BONUS return cannot resume an old CZ/RIZE/WANTED/Legend Gate screen.
import { GameCore } from './game-core.js?v=step6w';

function normalizeNormalAfterReward(core,pending,destination){
  const normal=core?.normal;if(!normal)return;
  normal.pendingReward=null;
  normal.mode='NORMAL';
  normal.cz=null;
  normal.rize=null;
  normal.legendGate=null;
  normal.closeWantedHolds?.();
  normal.wantedChanceFrozen=false;
  if(normal.wantedState==='SUSPENDED'||normal.wantedState==='ACTIVE'){
    normal.wantedState='COUNTING';
    normal.wantedChanceGameCount=0;
    normal.wantedChanceRemaining=null;
  }
  normal.transitionSource=`${pending?.source??'NORMAL_REWARD'}_CONSUMED_ONCE_${destination}`;
  normal.lastEvent=`NORMAL_REWARD_EXIT_NORMALIZED_${destination}`;
}

if(!GameCore.prototype.__step6zNormalRewardOneShotPatched){
  const originalResolveNormalInitialHitPending=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function patchedResolveNormalInitialHitPending(...args){
    const pending=this.normal?.pendingReward;
    const out=originalResolveNormalInitialHitPending.apply(this,args);
    if(!out)return out;
    normalizeNormalAfterReward(this,pending,out.destination);
    return out;
  };

  const originalStartGoldenTimeFromPending=GameCore.prototype.startGoldenTimeFromPending;
  GameCore.prototype.startGoldenTimeFromPending=function patchedStartGoldenTimeFromPending(...args){
    const pending=this.normal?.pendingReward;
    const ok=originalStartGoldenTimeFromPending.apply(this,args);
    if(!ok)return ok;
    normalizeNormalAfterReward(this,pending,'GOLDEN_TIME');
    return ok;
  };

  GameCore.prototype.__step6zNormalRewardOneShotPatched=true;
}
