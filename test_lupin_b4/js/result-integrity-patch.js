// Step 6Z: completed-game audit across role attributes, reel result and credit flow.
import { GameCore } from './game-core.js?v=step6w';

const EXPECTED_ROLE_ATTRS=Object.freeze({
  REPLAY:{payout:0,replay:true},
  MB:{payout:0,replay:false},
  '3COIN':{payout:3,replay:false},
  '9COIN':{payout:9,replay:false},
  '10COIN':{payout:10,replay:false},
  MISS:{payout:0,replay:false}
});

if(!GameCore.prototype.__step6zResultIntegrityPatched){
  GameCore.prototype.resultIntegritySnapshot=function resultIntegritySnapshot(result){
    if(!result)return {status:'NO_RESULT'};
    const expected=EXPECTED_ROLE_ATTRS[result.role]??null;
    const roleKnown=!!expected;
    const payoutValid=roleKnown&&Number(result.payout)===expected.payout;
    const replayValid=roleKnown&&Boolean(result.replay)===expected.replay;
    const reelAudit=this.reels?.integritySnapshot?.()??null;
    const reelValid=reelAudit?.status==='OK';
    const completed=reelAudit?.stoppedCount===3&&this.reels?.allStopped===true;
    const resultReelsMatch=Array.isArray(result.reelResult)&&Array.isArray(this.reels?.result)&&result.reelResult.join('|')===this.reels.result.join('|');

    // creditBefore is captured after BET at lever time, so settlement must be
    // exactly creditBefore + payout. This also works for replay-funded BETs.
    const creditBefore=Number(result.creditBefore);
    const creditAfter=Number(result.creditAfter);
    const expectedCreditAfter=creditBefore+Number(result.payout);
    const creditNumbersValid=Number.isFinite(creditBefore)&&Number.isFinite(creditAfter)&&Number.isFinite(expectedCreditAfter);
    const creditSettlementValid=creditNumbersValid&&creditAfter===expectedCreditAfter;
    const creditState=this.creditSystem?.snapshot?.()??null;
    const postBetCleared=creditState?.bet===0;
    const postPayoutMatches=Number(creditState?.payout)===Number(result.payout);
    const replayCarryValid=Boolean(creditState?.replayReady)===Boolean(result.replay);
    const creditValid=creditSettlementValid&&postBetCleared&&postPayoutMatches&&replayCarryValid;

    const status=roleKnown&&payoutValid&&replayValid&&reelValid&&completed&&resultReelsMatch&&creditValid?'OK':'ERROR_RESULT_INTEGRITY';
    return {status,role:result.role,roleKnown,payoutValid,replayValid,reelValid,completed,resultReelsMatch,creditValid,creditSettlementValid,postBetCleared,postPayoutMatches,replayCarryValid,creditBefore,creditAfter,expectedCreditAfter,expected,reelAudit};
  };

  const originalStop=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithResultIntegrity(...args){
    const out=originalStop.apply(this,args);
    if(out?.complete&&out.result){
      const audit=this.resultIntegritySnapshot(out.result);
      out.result.resultIntegrity=audit;
      this.lastResultIntegrity=audit;
    }
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function snapshotWithResultIntegrity(...args){
    return {...originalSnapshot.apply(this,args),lastResultIntegrity:this.lastResultIntegrity?{...this.lastResultIntegrity}:null};
  };

  GameCore.prototype.__step6zResultIntegrityPatched=true;
}
