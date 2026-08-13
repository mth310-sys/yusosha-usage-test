// Step 6Z: audit the verified WANTED failure -> next-cycle draw -> re-entry loop.
import { NormalSystem } from './normal.js?v=step6w';
import { WANTED_POST_WC_ZONES } from './wanted-profile.js?v=step6s';

function store(normal,stage,checks,extra={}){
  const failed=Object.entries(checks).filter(([,v])=>v!==true).map(([k])=>k);
  normal.lastWantedCycleIntegrity={status:failed.length?'ERROR_WANTED_CYCLE_INTEGRITY':'OK',stage,checks,failed,...extra};
}

if(!NormalSystem.prototype.__step6zWantedCycleIntegrityPatched){
  const originalReset=NormalSystem.prototype.resetAfterWantedFailure;
  NormalSystem.prototype.resetAfterWantedFailure=function(...args){
    if(!WANTED_POST_WC_ZONES[Number(this.setting)])return null;
    const previousTarget=this.wantedTargetGame;
    const out=originalReset.apply(this,args);
    const target=Number(this.wantedTargetGame),zone=this.wantedTargetZone;
    store(this,'POST_WC_FAILURE_NEXT_CYCLE_DRAW',{mode:this.mode==='NORMAL',cycle:this.wantedCycle==='POST_WC_FAILURE',countReset:this.wantedCount===0,stateCounting:this.wantedState==='COUNTING',targetFinite:Number.isFinite(target)&&target>0,zoneValid:!!zone&&Number.isFinite(Number(zone.min))&&Number.isFinite(Number(zone.max)),targetInsideZone:!!zone&&target>=Number(zone.min)&&target<=Number(zone.max),remainingCleared:this.wantedChanceRemaining==null,holdsClosed:this.holdQueue==null&&this.holdCapacity==null,pendingCleared:this.pendingReward==null,sourceMarked:this.transitionSource==='POST_WC_VERIFIED_SETTING_TABLE'},{previousTarget,nextTarget:target,zone:zone?{min:zone.min,max:zone.max}:null});
    return out;
  };

  const originalStart=NormalSystem.prototype.startWantedChance;
  NormalSystem.prototype.startWantedChance=function(...args){
    const cycleBefore=this.wantedCycle,countBefore=this.wantedCount,targetBefore=this.wantedTargetGame;
    const out=originalStart.apply(this,args);
    if(cycleBefore==='POST_WC_FAILURE'){
      store(this,'POST_WC_FAILURE_REENTRY',{mode:this.mode==='WANTED_CHANCE',active:this.wantedState==='ACTIVE',targetReached:Number(countBefore)>=Number(targetBefore),remainingPositive:Number(this.wantedChanceRemaining)>0,holdsReady:!!this.holdQueue&&this.holdCapacity>0,resultReset:this.wantedChanceResult==='UNRESOLVED',notFrozen:this.wantedChanceFrozen===false},{cycle:cycleBefore,countAtEntry:countBefore,targetAtEntry:targetBefore});
    }
    return out;
  };

  const originalSnapshot=NormalSystem.prototype.snapshot;
  NormalSystem.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastWantedCycleIntegrity:this.lastWantedCycleIntegrity?{...this.lastWantedCycleIntegrity}:null};};
  NormalSystem.prototype.__step6zWantedCycleIntegrityPatched=true;
}
