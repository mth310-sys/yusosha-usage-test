// Step 6Z: audit one-shot NORMAL -> LB / GOLDEN TIME boundary after destination starts.
import { GameCore } from './game-core.js?v=step6w';

function auditConsumedNormalReward(core,destination,before=null){
  const normal=core?.normal;
  if(!normal)return {status:'NO_NORMAL_SYSTEM'};
  const pendingCleared=normal.pendingReward==null;
  const modeNormalized=normal.mode==='NORMAL';
  const transientCleared=normal.cz==null&&normal.rize==null&&normal.legendGate==null;
  const wantedNotActive=!['ACTIVE','SUSPENDED'].includes(normal.wantedState);
  const holdsClosed=normal.holdQueue==null||normal.holdQueue?.length===0;
  const wantedFreezeCleared=normal.wantedChanceFrozen===false&&normal.wantedChanceRemaining==null;
  const lbActive=core.lupinBonus?.state==='ACTIVE';
  const gtActive=core.goldenTime?.state!=='IDLE';
  const destinationActive=destination==='LUPIN_BONUS'?lbActive:destination==='GOLDEN_TIME'?gtActive:true;
  const mutuallyExclusive=destination==='LUPIN_BONUS'?!gtActive:destination==='GOLDEN_TIME'?!lbActive:true;
  const sourceMarked=String(normal.transitionSource??'').includes('CONSUMED_ONCE');
  const hadPending=before?before.pendingReward!=null:true;
  const destinationMatched=before?.pendingReward?.type==='GOLDEN_TIME'?destination==='GOLDEN_TIME':before?.pendingReward?.type==='LUPIN_BONUS'?destination==='LUPIN_BONUS':true;
  const checks={hadPending,pendingCleared,modeNormalized,transientCleared,wantedNotActive,holdsClosed,wantedFreezeCleared,destinationActive,mutuallyExclusive,sourceMarked,destinationMatched};
  const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  return {status:failed.length?'ERROR_NORMAL_DESTINATION_BOUNDARY':'OK',destination,sourceReward:before?.pendingReward?.type??null,checks,failed,lbState:core.lupinBonus?.state??null,gtState:core.goldenTime?.state??null,transitionSource:normal.transitionSource??null,wantedState:normal.wantedState};
}

if(!GameCore.prototype.__step6zNormalTransitionIntegrityPatched){
  const originalResolve=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function(...args){
    const before={pendingReward:this.normal?.pendingReward?{...this.normal.pendingReward}:null};
    const out=originalResolve.apply(this,args);
    if(out?.destination){
      const destination=out.destination==='LUPIN_BONUS'?'LUPIN_BONUS':out.destination==='GOLDEN_TIME'?'GOLDEN_TIME':out.destination;
      this.lastNormalTransitionIntegrity=auditConsumedNormalReward(this,destination,before);
      out.normalTransitionIntegrity=this.lastNormalTransitionIntegrity;
    }
    return out;
  };
  const originalGtPending=GameCore.prototype.startGoldenTimeFromPending;
  GameCore.prototype.startGoldenTimeFromPending=function(...args){
    const before={pendingReward:this.normal?.pendingReward?{...this.normal.pendingReward}:null};
    const ok=originalGtPending.apply(this,args);
    if(ok)this.lastNormalTransitionIntegrity=auditConsumedNormalReward(this,'GOLDEN_TIME',before);
    return ok;
  };
  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastNormalTransitionIntegrity:this.lastNormalTransitionIntegrity?{...this.lastNormalTransitionIntegrity}:null};};
  GameCore.prototype.__step6zNormalTransitionIntegrityPatched=true;
}
