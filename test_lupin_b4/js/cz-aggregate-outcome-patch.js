// Step 6AA: resolve DOROBO/FUJIKO CZ only at the verified aggregate end boundary.
// Published setting-specific total expectations are used as one aggregate draw.
// The real per-game hit mechanism and the success LB/GT destination split remain unresolved.
import './ceiling-runtime-patch.js?v=step6ab-ceiling1';
import './wanted-cycle-reset-patch.js?v=step6ac-wanted-reset1';
import './normal-stage-runtime-patch.js?v=step6ad-normal-stage1';
import { NormalSystem } from './normal.js?v=step6w';
import { rollCzAggregateSuccess } from './cz-profile.js?v=step6aa-cz1';

const SUPPORTED=new Set(['DOROBO_ZONE','FUJIKO_ZONE']);

if(!NormalSystem.prototype.__step6aaCzAggregateOutcomePatched){
  const originalCompleteGame=NormalSystem.prototype.completeGame;
  NormalSystem.prototype.completeGame=function completeGameWithCzAggregateOutcome(...args){
    const out=originalCompleteGame.apply(this,args);
    const cz=this.cz;
    if(!SUPPORTED.has(this.mode)||!cz||cz.state!=='END_PENDING_VERIFIED_SUCCESS_MODEL')return out;

    const success=rollCzAggregateSuccess(cz.type,this.setting,this.rng);
    if(success==null){
      cz.result='UNRESOLVED';
      cz.resultSource='MISSING_VERIFIED_AGGREGATE_SUCCESS_ROW';
      this.lastEvent=`${cz.type}_END_PENDING_AGGREGATE_ROW`;
      return this.snapshot();
    }

    cz.result=success?'SUCCESS':'FAIL';
    cz.resultSource='VERIFIED_SETTING_AGGREGATE_EXPECTATION_END_BOUNDARY';
    cz.remainingGames=0;
    if(success){
      cz.state='SUCCESS_PENDING_DESTINATION';
      this.pendingReward={
        type:'LB_OR_GT',
        source:`${cz.type}_AGGREGATE_SUCCESS`,
        guarantee:'LB_OR_GT',
        status:'PENDING_DESTINATION_UNRESOLVED'
      };
      this.lastEvent=`${cz.type}_AGGREGATE_SUCCESS_PENDING_LB_OR_GT`;
    }else{
      cz.state='FAIL_PENDING_RETURN';
      this.pendingReward=null;
      this.lastEvent=`${cz.type}_AGGREGATE_FAIL_PENDING_RETURN`;
    }
    return this.snapshot();
  };
  NormalSystem.prototype.__step6aaCzAggregateOutcomePatched=true;
}
