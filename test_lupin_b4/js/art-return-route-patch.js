// Step 6Z: wire the published Treasure-loss LB return lottery into the actual GT end boundary.
// Notification presentation itself remains unresolved, so a hit is held as a pending notification route.
import { GameCore } from './game-core.js?v=step6w';
import { rollArtReturn } from './art-return-profile.js?v=step6z-art-return';

if(!GameCore.prototype.__step6zArtReturnRoutePatched){
  const originalStop=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function(index){
    const out=originalStop.call(this,index);
    if(!out?.complete||!out.result)return out;
    if(out.result.event!=='TREASURE_BATTLE_LOSE_REVENGE_ENTRY_PENDING_NEXT_HIT_REDRAWN')return out;

    const treasurePoints=Number(out.result?.goldenTime?.treasurePoints ?? this.goldenTime?.treasurePoints ?? 0);
    const lottery=rollArtReturn(treasurePoints,this.rng);
    this.lastArtReturnLottery={...lottery,gameNo:this.gameNo,sourceEvent:out.result.event};
    out.result.artReturnLottery={...this.lastArtReturnLottery};
    if(!lottery.resolved||!lottery.hit)return out;

    const preservedNextInitialHit=this.nextInitialHit?{...this.nextInitialHit}:null;
    this.__artReturnPendingNotification={
      reward:'LUPIN_BONUS_RETURN',
      status:'PENDING_NOTIFICATION_ROUTE_UNRESOLVED',
      treasurePoints,
      pct:lottery.pct,
      confidence:lottery.confidence,
      preservedNextInitialHit,
      source:'TREASURE_BATTLE_LOSS_ART_RETURN_LOTTERY'
    };
    this.goldenTime.reset();
    this.revenge.reset();
    out.result.goldenTime=this.goldenTime.snapshot();
    out.result.revenge=this.revenge.snapshot();
    out.result.mode='ART_RETURN_PENDING_NOTIFICATION';
    out.result.event='ART_RETURN_HIT_LUPIN_BONUS_GUARANTEED_NOTIFICATION_ROUTE_UNRESOLVED';
    out.result.artReturnPendingNotification={...this.__artReturnPendingNotification};
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function(...args){
    return {...originalSnapshot.apply(this,args),lastArtReturnLottery:this.lastArtReturnLottery?{...this.lastArtReturnLottery}:null,artReturnPendingNotification:this.__artReturnPendingNotification?{...this.__artReturnPendingNotification}:null};
  };
  GameCore.prototype.__step6zArtReturnRoutePatched=true;
}
