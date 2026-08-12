// Step 6Z: verified next initial-hit type is selected at BONUS / ART end.
// Never silently redraw later; audit the single currently outstanding reservation correctly.
import { GameCore } from './game-core.js?v=step6w';

if(!GameCore.prototype.__step6zNextInitialHitIntegrityPatched){
  GameCore.prototype.consumeNextInitialHit=function consumeNextInitialHitFailClosed(source){
    if(!this.nextInitialHit){this.lastInitialHitResolution={type:null,consumedBy:source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};return null;}
    const reservation={...this.nextInitialHit};this.nextInitialHit=null;this.nextInitialHitConsumed+=1;this.lastInitialHitResolution={...reservation,consumedBy:source,consumedNo:this.nextInitialHitConsumed};return this.lastInitialHitResolution;
  };

  const originalResolve=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function resolveNormalInitialHitWithIntegrity(...args){const pending=this.normal?.pendingReward;if(pending?.type==='LB_OR_GT'&&!this.nextInitialHit){pending.status='ERROR_MISSING_NEXT_INITIAL_HIT_RESERVATION';this.lastInitialHitResolution={type:null,consumedBy:pending.source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};return null;}return originalResolve.apply(this,args);};

  GameCore.prototype.nextInitialHitIntegritySnapshot=function nextInitialHitIntegritySnapshot(){
    const draws=Number(this.nextInitialHitDraws)||0,consumed=Number(this.nextInitialHitConsumed)||0,hasReservation=!!this.nextInitialHit;
    // draws is historical and includes legitimate replacement redraws at setting change / BONUS / ART end.
    // Therefore draws-consumed is not an outstanding-reservation count. Audit the live reservation itself.
    const currentDrawNo=hasReservation?Number(this.nextInitialHit.drawNo)||null:null;
    const currentDrawValid=!hasReservation||(Number.isInteger(currentDrawNo)&&currentDrawNo>=1&&currentDrawNo<=draws);
    const missingReservation=!hasReservation&&this.normal?.pendingReward?.type==='LB_OR_GT';
    const consumeAheadOfDraw=consumed>draws;
    const lastConsumedNo=Number(this.lastInitialHitResolution?.consumedNo)||0;
    const consumptionSequenceValid=lastConsumedNo===consumed;
    const status=missingReservation?'ERROR_MISSING_RESERVATION':consumeAheadOfDraw?'ERROR_CONSUMED_MORE_THAN_DRAWN':!currentDrawValid?'ERROR_INVALID_LIVE_RESERVATION_DRAW_NO':!consumptionSequenceValid?'ERROR_CONSUMPTION_SEQUENCE':'OK';
    return {status,draws,consumed,hasReservation,currentDrawNo,currentDrawValid,missingReservation,consumeAheadOfDraw,consumptionSequenceValid,replacementRedrawsPossible:true,lastResolution:this.lastInitialHitResolution?{...this.lastInitialHitResolution}:null};
  };

  const originalNextSnapshot=GameCore.prototype.nextInitialHitSnapshot;
  GameCore.prototype.nextInitialHitSnapshot=function nextInitialHitSnapshotWithIntegrity(...args){return {...originalNextSnapshot.apply(this,args),integrity:this.nextInitialHitIntegritySnapshot()};};

  GameCore.prototype.__step6zNextInitialHitIntegrityPatched=true;
}
