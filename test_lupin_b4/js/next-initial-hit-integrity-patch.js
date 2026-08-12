// Step 6Z: verified next initial-hit type is selected at BONUS / ART end.
// Never silently redraw later; expose reservation accounting so double-draw / loss is visible.
import { GameCore } from './game-core.js?v=step6w';

if(!GameCore.prototype.__step6zNextInitialHitIntegrityPatched){
  GameCore.prototype.consumeNextInitialHit=function consumeNextInitialHitFailClosed(source){
    if(!this.nextInitialHit){this.lastInitialHitResolution={type:null,consumedBy:source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};return null;}
    const reservation={...this.nextInitialHit};this.nextInitialHit=null;this.nextInitialHitConsumed+=1;this.lastInitialHitResolution={...reservation,consumedBy:source,consumedNo:this.nextInitialHitConsumed};return this.lastInitialHitResolution;
  };

  const originalResolve=GameCore.prototype.resolveNormalInitialHitPending;
  GameCore.prototype.resolveNormalInitialHitPending=function resolveNormalInitialHitWithIntegrity(...args){const pending=this.normal?.pendingReward;if(pending?.type==='LB_OR_GT'&&!this.nextInitialHit){pending.status='ERROR_MISSING_NEXT_INITIAL_HIT_RESERVATION';this.lastInitialHitResolution={type:null,consumedBy:pending.source,consumedNo:this.nextInitialHitConsumed,error:'MISSING_NEXT_INITIAL_HIT_RESERVATION',policy:'FAIL_CLOSED_NO_LATE_REDRAW'};return null;}return originalResolve.apply(this,args);};

  GameCore.prototype.nextInitialHitIntegritySnapshot=function nextInitialHitIntegritySnapshot(){
    const draws=Number(this.nextInitialHitDraws)||0,consumed=Number(this.nextInitialHitConsumed)||0,outstanding=draws-consumed,hasReservation=!!this.nextInitialHit;
    const expectedOutstanding=hasReservation?1:0;
    const accountingOk=outstanding===expectedOutstanding;
    const missingReservation=!hasReservation&&outstanding===0&&this.normal?.pendingReward?.type==='LB_OR_GT';
    const doubleOrStaleReservation=outstanding>1;
    const overConsumed=outstanding<0;
    const status=missingReservation?'ERROR_MISSING_RESERVATION':doubleOrStaleReservation?'ERROR_MULTIPLE_OUTSTANDING_RESERVATIONS':overConsumed?'ERROR_CONSUMED_MORE_THAN_DRAWN':accountingOk?'OK':'ERROR_ACCOUNTING_MISMATCH';
    return {status,draws,consumed,outstanding,expectedOutstanding,hasReservation,accountingOk,missingReservation,doubleOrStaleReservation,overConsumed,lastResolution:this.lastInitialHitResolution?{...this.lastInitialHitResolution}:null};
  };

  const originalNextSnapshot=GameCore.prototype.nextInitialHitSnapshot;
  GameCore.prototype.nextInitialHitSnapshot=function nextInitialHitSnapshotWithIntegrity(...args){return {...originalNextSnapshot.apply(this,args),integrity:this.nextInitialHitIntegritySnapshot()};};

  GameCore.prototype.__step6zNextInitialHitIntegrityPatched=true;
}
