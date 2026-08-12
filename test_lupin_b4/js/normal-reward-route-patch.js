// Step 6Z: normal-mode reward reservations are one-shot routes.
// Once LB/GT actually starts, clear the consumed reward and normalize stale normal submode
// state so ART/BONUS return cannot resume an old CZ/RIZE/WANTED/Legend Gate screen.
import { GameCore } from './game-core.js?v=step6w';
import { NormalSystem } from './normal.js?v=step6w';

const WANTED_POST_SUCCESS_UNRESOLVED='POST_SUCCESS_NEXT_CYCLE_UNRESOLVED';

function normalizeNormalAfterReward(core,pending,destination){
  const normal=core?.normal;if(!normal)return;
  const cameFromWantedSuccess=normal.wantedChanceResult==='SUCCESS_ROUTE'||normal.wantedState==='SUSPENDED'||normal.wantedState==='ACTIVE';
  normal.pendingReward=null;
  normal.mode='NORMAL';
  normal.cz=null;
  normal.rize=null;
  normal.legendGate=null;
  normal.closeWantedHolds?.();
  normal.wantedChanceFrozen=false;
  normal.wantedChanceGameCount=0;
  normal.wantedChanceRemaining=null;
  if(cameFromWantedSuccess){
    // Public data defines the initial WANTED target and the post-WANTED-FAIL target table,
    // but not a post-success target table. Do not reuse the already-consumed target and cause
    // an immediate false WANTED re-entry on the first normal game after BONUS/ART.
    normal.wantedState=WANTED_POST_SUCCESS_UNRESOLVED;
    normal.wantedEntrySource='WANTED_SUCCESS_REWARD_EXIT_NEXT_CYCLE_MODEL_UNRESOLVED';
  }
  normal.transitionSource=`${pending?.source??'NORMAL_REWARD'}_CONSUMED_ONCE_${destination}`;
  normal.lastEvent=cameFromWantedSuccess?`NORMAL_REWARD_EXIT_WANTED_NEXT_CYCLE_UNRESOLVED_${destination}`:`NORMAL_REWARD_EXIT_NORMALIZED_${destination}`;
}

if(!NormalSystem.prototype.__step6zWantedPostSuccessGuardPatched){
  const originalCompleteGame=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function patchedNormalCompleteGame(...args){
    if(this.mode==='NORMAL'&&this.wantedState===WANTED_POST_SUCCESS_UNRESOLVED){
      // Keep ordinary normal-game and Raiun progression alive while suppressing only the stale
      // WANTED target. Restore the published old target metadata after this one call for debug.
      const oldTarget=this.wantedTargetGame;
      this.wantedTargetGame=Number.POSITIVE_INFINITY;
      const out=originalCompleteGame.apply(this,args);
      this.wantedTargetGame=oldTarget;
      this.wantedState=WANTED_POST_SUCCESS_UNRESOLVED;
      if(this.mode==='NORMAL')this.lastEvent=this.lastEvent&&this.lastEvent!=='RAIUN_INITIAL_CALIBRATED'?this.lastEvent:'NORMAL_GAME_WANTED_POST_SUCCESS_CYCLE_UNRESOLVED';
      return this.snapshot();
    }
    return originalCompleteGame.apply(this,args);
  };
  NormalSystem.prototype.__step6zWantedPostSuccessGuardPatched=true;
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
