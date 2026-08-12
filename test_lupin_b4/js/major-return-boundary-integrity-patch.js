// Step 6Z: audit major return boundaries after all LB/GT/return-route patches have run.
import { GameCore } from './game-core.js?v=step6w';

function finish(core,type,checks,event){
  const failed=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  core.lastMajorReturnBoundaryIntegrity={status:failed.length?'ERROR_MAJOR_RETURN_BOUNDARY':'OK',type,event,checks,failed,lbState:core.lupinBonus?.state??null,gtState:core.goldenTime?.state??null,revengeState:core.revenge?.state??null,normalMode:core.normal?.mode??null,nextInitialHit:core.nextInitialHit?.type??null};
}

if(!GameCore.prototype.__step6zMajorReturnBoundaryPatched){
  const originalStop=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function(index){
    const out=originalStop.call(this,index);
    if(!out?.complete||!out.result)return out;
    const event=String(out.result.event??'');

    if(event.startsWith('LUPIN_BONUS_WIN_GOLDEN_TIME_AUTO_START')){
      finish(this,'LB_WIN_TO_GT',{
        lbClosed:this.lupinBonus?.state==='IDLE',
        gtActive:this.goldenTime?.state!=='IDLE',
        revengeIdle:this.revenge?.state==='IDLE',
        resultMode:out.result.mode==='GOLDEN_TIME'
      },event);
    }else if(event.includes('LUPIN_BONUS')&&event.includes('REVENGE_PENDING')){
      finish(this,'LB_FAIL_TO_REVENGE_PENDING',{
        lbClosed:this.lupinBonus?.state==='IDLE',
        revengeOffered:this.revenge?.state==='ENTRY_PENDING_UNVERIFIED_RATE',
        nextHitReserved:!!this.nextInitialHit,
        resultMode:out.result.mode==='REVENGE_CHANCE_PENDING'
      },event);
    }else if(event==='TREASURE_BATTLE_LOSE_REVENGE_ENTRY_PENDING_NEXT_HIT_REDRAWN'){
      finish(this,'GT_LOSS_TO_REVENGE_PENDING',{
        revengeOffered:this.revenge?.state==='ENTRY_PENDING_UNVERIFIED_RATE',
        nextHitReserved:!!this.nextInitialHit,
        lbIdle:this.lupinBonus?.state==='IDLE',
        resultMode:out.result.mode==='REVENGE_CHANCE_PENDING'
      },event);
    }else if(event==='ART_RETURN_HIT_LUPIN_BONUS_GUARANTEED_NOTIFICATION_ROUTE_UNRESOLVED'){
      finish(this,'GT_RETURN_HIT_PENDING_NOTIFICATION',{
        gtClosed:this.goldenTime?.state==='IDLE',
        revengeIdle:this.revenge?.state==='IDLE',
        pendingReturn:!!this.__artReturnPendingNotification,
        nextHitPreserved:!!this.__artReturnPendingNotification?.preservedNextInitialHit,
        resultMode:out.result.mode==='ART_RETURN_PENDING_NOTIFICATION'
      },event);
    }else if(event==='REVENGE_CHANCE_FAIL_RETURN_NORMAL'){
      finish(this,'REVENGE_FAIL_TO_NORMAL',{
        revengeIdle:this.revenge?.state==='IDLE',
        gtIdle:this.goldenTime?.state==='IDLE',
        lbIdle:this.lupinBonus?.state==='IDLE',
        normalMode:this.normal?.mode==='NORMAL',
        resultMode:out.result.mode==='NORMAL'
      },event);
    }
    if(this.lastMajorReturnBoundaryIntegrity)out.result.majorReturnBoundaryIntegrity={...this.lastMajorReturnBoundaryIntegrity};
    return out;
  };
  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function(...args){return {...originalSnapshot.apply(this,args),lastMajorReturnBoundaryIntegrity:this.lastMajorReturnBoundaryIntegrity?{...this.lastMajorReturnBoundaryIntegrity}:null};};
  GameCore.prototype.__step6zMajorReturnBoundaryPatched=true;
}
