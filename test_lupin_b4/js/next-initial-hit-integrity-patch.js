// Step 6Z: the verified next initial-hit type is selected at BONUS / ART end.
// Never silently redraw at the later initial-hit moment; missing reservation is an integrity error.
import { GameCore } from './game-core.js?v=step6w';

if(!GameCore.prototype.__step6zNextInitialHitIntegrityPatched){
  GameCore.prototype.consumeNextInitialHit=function consumeNextInitialHitFailClosed(source){
    if(!this.nextInitialHit){
      this.lastInitialHitResolution={type:null,consumedBy:source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};
      return null;
    }
    const reservation={...this.nextInitialHit};
    this.nextInitialHit=null;
    this.nextInitialHitConsumed+=1;
    this.lastInitialHitResolution={...reservation,consumedBy:source,consumedNo:this.nextInitialHitConsumed};
    return this.lastInitialHitResolution;
  };

  const originalResolve=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function resolveNormalInitialHitWithIntegrity(...args){
    const pending=this.normal?.pendingReward;
    if(pending?.type==='LB_OR_GT'&&!this.nextInitialHit){
      pending.status='ERROR_MISSING_NEXT_INITIAL_HIT_RESERVATION';
      this.lastInitialHitResolution={type:null,consumedBy:pending.source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};
      return null;
    }
    return originalResolve.apply(this,args);
  };

  GameCore.prototype.__step6zNextInitialHitIntegrityPatched=true;
}
