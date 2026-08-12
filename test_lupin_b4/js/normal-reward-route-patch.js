// Step 6Z: normal-mode reward reservations are one-shot routes.
// Once LB/GT (or direct GT stocks) is actually started, clear NormalSystem.pendingReward so
// returning from BONUS/ART cannot accidentally consume another NEXT INITIAL HIT reservation.
import { GameCore } from './game-core.js?v=step6w';

if(!GameCore.prototype.__step6zNormalRewardOneShotPatched){
  const originalResolveNormalInitialHitPending=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function patchedResolveNormalInitialHitPending(...args){
    const pending=this.normal?.pendingReward;
    const out=originalResolveNormalInitialHitPending.apply(this,args);
    if(!out)return out;
    if(pending&&this.normal?.pendingReward===pending){
      this.normal.pendingReward=null;
      this.normal.transitionSource=`${pending.source}_CONSUMED_ONCE_${out.destination}`;
      this.normal.lastEvent=`NORMAL_PENDING_REWARD_CONSUMED_ONCE_${out.destination}`;
    }
    return out;
  };

  const originalStartGoldenTimeFromPending=GameCore.prototype.startGoldenTimeFromPending;
  GameCore.prototype.startGoldenTimeFromPending=function patchedStartGoldenTimeFromPending(...args){
    const pending=this.normal?.pendingReward;
    const ok=originalStartGoldenTimeFromPending.apply(this,args);
    if(!ok)return ok;
    if(pending&&this.normal?.pendingReward===pending){
      this.normal.pendingReward=null;
      this.normal.transitionSource=`${pending.source}_CONSUMED_ONCE_GOLDEN_TIME`;
      this.normal.lastEvent='NORMAL_PENDING_GT_REWARD_CONSUMED_ONCE';
    }
    return ok;
  };

  GameCore.prototype.__step6zNormalRewardOneShotPatched=true;
}
