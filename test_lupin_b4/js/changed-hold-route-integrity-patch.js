// Step 6Z: audit changed WANTED holds route exactly once to their verified destination contract.
import './major-return-boundary-integrity-patch.js?v=step6z-major-return-boundary1';
import { NormalSystem } from './normal.js?v=step6w';
import { CZ_LENGTH_TABLE, CZ_SCENARIO_TABLE } from './cz-profile.js?v=step6s';

const DIRECT=new Set(['DOROBO_ZONE','FUJIKO_ZONE','SEVEN_ZONE']);
const DIRECT_CZ=new Set(['DOROBO_ZONE','FUJIKO_ZONE']);

if(!NormalSystem.prototype.__step6zChangedHoldRouteIntegrityPatched){
  const originalApply=NormalSystem.prototype.applyConsumedHold;
  NormalSystem.prototype.applyConsumedHold=function(hold,...args){
    const before={mode:this.mode,pending:this.pendingReward,transitionSource:this.transitionSource,wantedChanceResult:this.wantedChanceResult,holdCapacity:this.holdCapacity,holdQueue:this.holdQueue};
    const event=hold?.reservedEvent;
    if(event&&DIRECT_CZ.has(event)){
      const setting=Number(this.setting);
      if(!CZ_LENGTH_TABLE[setting]||!CZ_SCENARIO_TABLE[setting]){
        this.lastChangedHoldRouteIntegrity={status:'ERROR_UNSUPPORTED_CZ_SETTING_FAIL_CLOSED',holdType:hold.type,reservedEvent:event,direct:true,checks:{routed:false,stateUnchanged:true},failed:['unsupportedSetting'],modeAfter:this.mode,pendingReward:this.pendingReward?{...this.pendingReward}:null,transitionSource:this.transitionSource};
        return false;
      }
    }
    const routed=originalApply.call(this,hold,...args);
    if(!event)return routed;
    const direct=DIRECT.has(event);
    const expectedSource=`HOLD_${hold.type}`;
    const checks={
      routed:routed===true,
      successMarked:this.wantedChanceResult==='SUCCESS_ROUTE',
      sourceOnce:this.transitionSource===expectedSource,
      holdsClosed:this.holdQueue==null&&this.holdCapacity==null,
      directMode:!direct||this.mode===event,
      directPendingClear:!direct||this.pendingReward==null||(event==='SEVEN_ZONE'&&this.pendingReward?.type==='GOLDEN_TIME'),
      reservedPending:direct||this.pendingReward?.type===event,
      rewardSource:direct||this.pendingReward?.source===expectedSource,
      notRepeated:!(before.mode===this.mode&&before.pending===this.pendingReward&&before.transitionSource===this.transitionSource)
    };
    const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
    this.lastChangedHoldRouteIntegrity={status:failed.length?'ERROR_CHANGED_HOLD_ROUTE_INTEGRITY':'OK',holdType:hold.type,reservedEvent:event,direct,checks,failed,modeAfter:this.mode,pendingReward:this.pendingReward?{...this.pendingReward}:null,transitionSource:this.transitionSource};
    return routed;
  };
  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastChangedHoldRouteIntegrity:this.lastChangedHoldRouteIntegrity?{...this.lastChangedHoldRouteIntegrity}:null};};
  NormalSystem.prototype.__step6zChangedHoldRouteIntegrityPatched=true;
}
