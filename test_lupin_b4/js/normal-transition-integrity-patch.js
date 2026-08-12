// Step 6Z: audit one-shot normal reward transitions after destination starts.
import { GameCore } from './game-core.js?v=step6w';

function auditConsumedNormalReward(core,destination){
  const normal=core?.normal;
  if(!normal)return {status:'NO_NORMAL_SYSTEM'};
  const pendingCleared=normal.pendingReward==null;
  const modeNormalized=normal.mode==='NORMAL';
  const transientCleared=normal.cz==null&&normal.rize==null&&normal.legendGate==null;
  const wantedNotActive=!['ACTIVE','SUSPENDED'].includes(normal.wantedState);
  const holdsClosed=normal.holdQueue?.length===0;
  const wantedFreezeCleared=normal.wantedChanceFrozen===false&&normal.wantedChanceRemaining==null;
  const destinationActive=destination==='LUPIN_BONUS'
    ? core.lupinBonus?.state==='ACTIVE'
    : destination==='GOLDEN_TIME'
      ? core.goldenTime?.state!=='IDLE'
      : true;
  const sourceMarked=String(normal.transitionSource??'').includes('CONSUMED_ONCE');
  const status=pendingCleared&&modeNormalized&&transientCleared&&wantedNotActive&&holdsClosed&&wantedFreezeCleared&&destinationActive&&sourceMarked?'OK':'ERROR_NORMAL_TRANSITION_INTEGRITY';
  return {status,destination,pendingCleared,modeNormalized,transientCleared,wantedNotActive,holdsClosed,wantedFreezeCleared,destinationActive,sourceMarked,transitionSource:normal.transitionSource??null,wantedState:normal.wantedState};
}

if(!GameCore.prototype.__step6zNormalTransitionIntegrityPatched){
  const originalResolve=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function(...args){
    const out=originalResolve.apply(this,args);
    if(out?.destination){
      const destination=out.destination==='LUPIN_BONUS'?'LUPIN_BONUS':out.destination==='GOLDEN_TIME'?'GOLDEN_TIME':out.destination;
      this.lastNormalTransitionIntegrity=auditConsumedNormalReward(this,destination);
      out.normalTransitionIntegrity=this.lastNormalTransitionIntegrity;
    }
    return out;
  };
  const originalGtPending=GameCore.prototype.startGoldenTimeFromPending;
  GameCore.prototype.startGoldenTimeFromPending=function(...args){
    const ok=originalGtPending.apply(this,args);
    if(ok)this.lastNormalTransitionIntegrity=auditConsumedNormalReward(this,'GOLDEN_TIME');
    return ok;
  };
  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastNormalTransitionIntegrity:this.lastNormalTransitionIntegrity?{...this.lastNormalTransitionIntegrity}:null};};
  GameCore.prototype.__step6zNormalTransitionIntegrityPatched=true;
}
