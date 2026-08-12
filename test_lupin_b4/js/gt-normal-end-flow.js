// Step 6Z: shared normal (<1,000,000T) set-end route.
// 30G body end -> consume one guaranteed stock if present -> continuation LUPIN RUSH.
// Otherwise -> Treasure Battle -> WIN continuation / LOSE ART end pending verified return lottery.

export function installNormalGtEndFlow(gt){
  if(!gt||gt.__normalGtEndFlowInstalled)return false;
  gt.__normalGtEndFlowInstalled=true;
  gt.__normalGtEndFlow={last:null};

  const originalStartBattle=gt.startTreasureBattle.bind(gt);
  gt.startTreasureBattle=(...args)=>{
    const beforeStocks=gt.guaranteedStocks;
    const out=originalStartBattle(...args);
    if(!out)return false;
    gt.__normalGtEndFlow.last={phase:'TREASURE_BATTLE',setNo:gt.setNo,treasurePoints:gt.treasurePoints,stocksBeforeBattle:beforeStocks,stocksAfterBattleEntry:gt.guaranteedStocks,battleContinuationPct:gt.battleContinuationPct,battleState:gt.state};
    return gt.snapshot();
  };

  const originalCompleteBattle=gt.completeBattleGame.bind(gt);
  gt.completeBattleGame=(...args)=>{
    const out=originalCompleteBattle(...args);
    if(!out)return false;
    const flow=gt.__normalGtEndFlow.last;
    if(flow&&gt.battleGameCount>=4){
      flow.battleResult=gt.battleResult;
      flow.phase=gt.battleResult==='WIN'?'BATTLE_WIN_TO_LUPIN_RUSH':'BATTLE_LOSE_ART_END';
      flow.nextState=gt.state;
      flow.nextSetNo=gt.setNo;
    }
    return gt.snapshot();
  };

  gt.resolveNormalSetEnd=()=>{
    if(gt.state!=='ACTIVE_SET'||Number(gt.remainingGames)!==0)return false;
    if(Number(gt.treasurePoints)>=1000000)return false;
    const beforeStocks=gt.guaranteedStocks;
    if(beforeStocks>0){
      if(!gt.consumeStock('NORMAL_SET_END_GUARANTEED_CONTINUATION'))return false;
      const afterStocks=gt.guaranteedStocks;
      gt.startContinuationLupinRush('STOCK_GUARANTEED_CONTINUATION');
      gt.__normalGtEndFlow.last={phase:'STOCK_TO_LUPIN_RUSH',priorSetNo:Math.max(0,gt.setNo-1),nextSetNo:gt.setNo,treasurePointsAtSetEnd:gt.treasurePoints,stocksBefore:beforeStocks,stocksAfterConsume:afterStocks,stocksAtRushEntry:gt.guaranteedStocks,exactlyOneConsumed:afterStocks===beforeStocks-1,nextState:gt.state};
      gt.lastEvent=`NORMAL_SET_END_STOCK_${beforeStocks}_TO_${afterStocks}_LUPIN_RUSH_SET_${gt.setNo}`;
      return gt.snapshot();
    }
    gt.__normalGtEndFlow.last={phase:'NO_STOCK_TO_BATTLE',setNo:gt.setNo,treasurePointsAtSetEnd:gt.treasurePoints,stocksBefore:0};
    return gt.startTreasureBattle();
  };

  const originalSnapshot=gt.snapshot.bind(gt);
  gt.snapshot=()=>({...originalSnapshot(),normalGtEndFlow:gt.__normalGtEndFlow.last?{...gt.__normalGtEndFlow.last}:null});
  const originalReset=gt.reset.bind(gt);
  gt.reset=(...args)=>{const out=originalReset(...args);gt.__normalGtEndFlow={last:null};return out;};
  return true;
}
