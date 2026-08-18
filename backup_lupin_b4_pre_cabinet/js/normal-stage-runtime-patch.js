// Apply the verified normal-stage selection table only when the RIZE premonition route ends in failure.
// Do not generalize this table to CZ or RAIUN exits whose visible-stage return semantics are not verified.
import './normal-failure-return-patch.js?v=step6ad-normal-stage-dependency1';
import { NormalSystem } from './normal.js?v=step6w';
import { drawNormalStageAfterPremonition, NORMAL_STAGE_PROFILE } from './normal-stage-profile.js?v=step6ad-stage1';

if(!NormalSystem.prototype.__step6adNormalStagePatched){
  const originalComplete=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function completeGameWithRizeReturnStage(...args){
    const rizeFailedBefore=this.mode==='RIZE_ZONE'&&this.rize?.state==='FAIL_PENDING_RETURN';
    const selectedStage=rizeFailedBefore?drawNormalStageAfterPremonition(this.setting,this.rng):null;
    const out=originalComplete.apply(this,args);
    if(rizeFailedBefore&&selectedStage){
      this.normalStage=selectedStage;
      this.normalStageSource='VERIFIED_PREMONITION_END_SETTING_TABLE_RIZE_FAILURE';
      this.lastEvent=`RIZE_FAILURE_RETURN_${selectedStage}_STAGE`;
      return this.snapshot();
    }
    return out;
  };

  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function snapshotWithNormalStage(...args){
    const snap=originalSnapshot.apply(this,args);
    return {
      ...snap,
      normalStage:this.normalStage??null,
      normalStageSource:this.normalStageSource??null,
      normalStageProfile:NORMAL_STAGE_PROFILE
    };
  };

  NormalSystem.prototype.__step6adNormalStagePatched=true;
}
