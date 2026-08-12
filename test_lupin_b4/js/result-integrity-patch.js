// Step 6Z: completed-game audit across role attributes, reel result, credit flow and replay-funded next BET.
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

  const originalBet=GameCore.prototype.bet;
  GameCore.prototype.bet=function betWithReplayBoundaryAudit(...args){
    const before=this.creditSystem?.snapshot?.()??null;
    const replayFunded=Boolean(before?.replayReady);
    const creditBefore=Number(before?.credit);
    const out=originalBet.apply(this,args);
    if(!out)return out;
    const after=this.creditSystem?.snapshot?.()??null;
    const creditAfter=Number(after?.credit);
    const replayConsumed=!after?.replayReady;
    const betIsFull=Number(after?.bet)===Number(this.creditSystem?.betPerGame);
    const freeReplayBetValid=!replayFunded||(creditAfter===creditBefore&&replayConsumed&&betIsFull);
    const paidBetValid=replayFunded||(creditAfter===creditBefore-Number(this.creditSystem?.betPerGame)&&betIsFull);
    this.currentBetIntegrity={status:freeReplayBetValid&&paidBetValid?'OK':'ERROR_BET_INTEGRITY',replayFunded,creditBefore,creditAfter,replayConsumed,betIsFull,freeReplayBetValid,paidBetValid};
    return out;
  };

  const originalStop=GameCore.prototype.stopReel;
  GameCore.prototype.stopReel=function stopReelWithResultIntegrity(...args){
    const out=originalStop.apply(this,args);
    if(out?.complete&&out.result){
      const resultAudit=this.resultIntegritySnapshot(out.result);
      const betAudit=this.currentBetIntegrity?{...this.currentBetIntegrity}:null;
      const crossGameStatus=resultAudit.status==='OK'&&(!betAudit||betAudit.status==='OK')?'OK':'ERROR_GAME_BOUNDARY_INTEGRITY';
      out.result.resultIntegrity=resultAudit;
      out.result.betIntegrity=betAudit;
      out.result.gameBoundaryIntegrity={status:crossGameStatus,bet:betAudit,result:resultAudit};
      this.lastResultIntegrity=resultAudit;
      this.lastBetIntegrity=betAudit;
      this.lastGameBoundaryIntegrity=out.result.gameBoundaryIntegrity;
      this.currentBetIntegrity=null;
    }
    return out;
  };

  const originalSnapshot=GameCore.prototype.snapshot;
  GameCore.prototype.snapshot=function snapshotWithResultIntegrity(...args){
    return {...originalSnapshot.apply(this,args),lastResultIntegrity:this.lastResultIntegrity?{...this.lastResultIntegrity}:null,lastBetIntegrity:this.lastBetIntegrity?{...this.lastBetIntegrity}:null,lastGameBoundaryIntegrity:this.lastGameBoundaryIntegrity?{...this.lastGameBoundaryIntegrity}:null};
  };

  GameCore.prototype.__step6zResultIntegrityPatched=true;
}
