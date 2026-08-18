// Attach verified setting-confirmation metadata only to POST_WC_FAILURE WANTED cycles.
import { NormalSystem } from './normal.js?v=step6w';
import { GameCore } from './game-core.js?v=step6w';
import { WANTED_SETTING_HINT_PROFILE, getWantedSettingHintForTarget } from './wanted-setting-hint-profile.js?v=step6aj-wanted-hint1';

if(!NormalSystem.prototype.__wantedSettingHintPatched){
  const originalResetAfterWantedFailure=NormalSystem.prototype.resetAfterWantedFailure;
  NormalSystem.prototype.resetAfterWantedFailure=function resetAfterWantedFailureWithSettingHint(...args){
    const out=originalResetAfterWantedFailure.apply(this,args);
    this.wantedTargetSettingHint=getWantedSettingHintForTarget(this.wantedTargetGame,this.wantedCycle);
    return out;
  };

  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function snapshotWithWantedSettingHint(...args){
    const snap=originalSnapshot.apply(this,args);
    return {
      ...snap,
      wantedTargetSettingHint:this.wantedTargetSettingHint?{...this.wantedTargetSettingHint}:null,
      wantedSettingHintProfile:WANTED_SETTING_HINT_PROFILE
    };
  };

  NormalSystem.prototype.__wantedSettingHintPatched=true;
}

if(!GameCore.prototype.__wantedSettingHintResultPatched){
  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithWantedSettingHint(index){
    const out=originalStopReel.call(this,index);
    if(out?.complete&&out.result){
      const hint=this.normal.snapshot().wantedTargetSettingHint;
      out.result.wantedTargetSettingHint=hint?{...hint}:null;
    }
    return out;
  };
  GameCore.prototype.__wantedSettingHintResultPatched=true;
}
