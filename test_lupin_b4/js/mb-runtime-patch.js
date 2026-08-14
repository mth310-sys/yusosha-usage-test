// Verified B4 MB behavior: after an MB stop, the next two games are 10-coin roles.
// This patch only models the two-game MB continuation; exact non-MB reel control remains provisional.
import './raiun-setting-reset-patch.js?v=step6ae-raiun-reset1';
import './raiun-red-counter-patch.js?v=step6af-red1';
import { GameCore } from './game-core.js?v=step6w';

const MB_CONTINUATION_GAMES=2;
const MB_FORCED_ROLE=Object.freeze({name:'10COIN',payout:10,replay:false,source:'VERIFIED_MB_2G_CONTINUATION'});

if(!GameCore.prototype.__mbTwoGameContinuationPatched){
  const originalLever=GameCore.prototype.lever;
  GameCore.prototype.lever=function leverWithMbContinuation(...args){
    const forceMbContinuation=this.phase==='WAIT_LEVER'&&Number(this.__mbRemainingGames)>0;
    const out=originalLever.apply(this,args);
    if(!out||!forceMbContinuation)return out;

    this.pendingRole={...MB_FORCED_ROLE};
    this.lastRole=this.pendingRole;
    this.reels.start(this.pendingRole);
    this.__mbRemainingGames=Math.max(0,Number(this.__mbRemainingGames)-1);
    this.__mbForcedThisGame=true;
    return {role:'10COIN',mbContinuation:true,mbRemainingGames:this.__mbRemainingGames};
  };

  const originalStopReel=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithMbContinuation(index){
    const wasForced=Boolean(this.__mbForcedThisGame);
    const out=originalStopReel.call(this,index);
    if(!out?.complete||!out.result)return out;

    if(out.result.role==='MB'){
      this.__mbRemainingGames=MB_CONTINUATION_GAMES;
      out.result.mb={state:'ACTIVE',remainingGames:this.__mbRemainingGames,source:'VERIFIED_MB_NEXT_2G_10COIN'};
    }else if(wasForced){
      out.result.mb={state:this.__mbRemainingGames>0?'ACTIVE':'COMPLETE',remainingGames:this.__mbRemainingGames,source:'VERIFIED_MB_NEXT_2G_10COIN'};
    }else{
      out.result.mb={state:this.__mbRemainingGames>0?'ACTIVE':'IDLE',remainingGames:Number(this.__mbRemainingGames)||0,source:'VERIFIED_MB_NEXT_2G_10COIN'};
    }
    this.__mbForcedThisGame=false;
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function snapshotWithMbContinuation(...args){
    const snap=originalSnapshot.apply(this,args);
    return {...snap,mb:{state:Number(this.__mbRemainingGames)>0?'ACTIVE':'IDLE',remainingGames:Number(this.__mbRemainingGames)||0,forcedThisGame:Boolean(this.__mbForcedThisGame),source:'VERIFIED_MB_NEXT_2G_10COIN'}};
  };

  GameCore.prototype.__mbTwoGameContinuationPatched=true;
}
