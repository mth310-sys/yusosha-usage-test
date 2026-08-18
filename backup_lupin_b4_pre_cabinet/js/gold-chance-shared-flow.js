// Step 6Z: one shared 1,000,000T flow from GOLD CHANCE through EXTRA to next set.
// Unknown award/add-game distributions remain manual; confirmed state transitions are shared.

export function installSharedGoldChanceFlow(gt){
  if(!gt||gt.__sharedGoldChanceFlowInstalled)return false;
  gt.__sharedGoldChanceFlowInstalled=true;
  gt.__sharedGoldChanceFlow={last:null};

  const originalSetGoldChanceAddedGamesForTest=gt.setGoldChanceAddedGamesForTest.bind(gt);
  gt.setGoldChanceAddedGamesForTest=(games,...rest)=>{
    if(gt.state!=='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION')return false;
    const threshold=gt.__treasureThresholdState;
    const route=threshold?.lastRoute?{...threshold.lastRoute}:null;
    const source=route?.source??threshold?.lastSource??'UNKNOWN_TREASURE_SOURCE';
    const baseRemaining=gt.goldChanceBaseRemainingGames;
    const out=originalSetGoldChanceAddedGamesForTest(games,...rest);
    if(!out)return false;
    gt.__sharedGoldChanceFlow.last={source,route,baseRemainingGames:baseRemaining,addedGames:Number(games),extraTargetGames:gt.extraTargetGames,carryoverPoints:Math.max(0,Number(threshold?.pendingCarryoverPoints)||0),phase:'EXTRA_READY'};
    gt.lastEvent=`SHARED_GOLD_CHANCE_${source}_${baseRemaining}+${Number(games)}=${gt.extraTargetGames}_EXTRA_READY`;
    return gt.snapshot();
  };

  const originalStartExtraBonus=gt.startExtraBonus.bind(gt);
  gt.startExtraBonus=(source=null,...rest)=>{
    if(gt.state!=='EXTRA_BONUS_READY')return false;
    const flow=gt.__sharedGoldChanceFlow.last;
    const resolvedSource=source??(flow?`SHARED_GOLD_CHANCE_${flow.source}`:'VERIFIED_1M_TREASURE');
    const out=originalStartExtraBonus(resolvedSource,...rest);
    if(!out)return false;
    if(flow){flow.phase='EXTRA_ACTIVE';flow.extraSource=resolvedSource;flow.extraTargetGames=gt.extraTargetGames;flow.extraRemainingGames=gt.extraRemainingGames;}
    gt.lastEvent=`SHARED_GOLD_CHANCE_EXTRA_START_${resolvedSource}_${gt.extraTargetGames}G`;
    return gt.snapshot();
  };

  const originalFinishExtra=gt.finishExtraToGuaranteedNextSet.bind(gt);
  gt.finishExtraToGuaranteedNextSet=(...args)=>{
    const flow=gt.__sharedGoldChanceFlow.last;
    const before={state:gt.state,setNo:gt.setNo,stocks:gt.guaranteedStocks,carryoverPoints:Math.max(0,Number(gt.__treasureThresholdState?.pendingCarryoverPoints)||0)};
    const out=originalFinishExtra(...args);
    if(!out)return false;
    if(flow){flow.phase='POST_EXTRA_LUPIN_RUSH';flow.extraFinishedState=before.state;flow.nextSetNo=gt.setNo;flow.nextSetState=gt.state;flow.stocksAtExtraEnd=before.stocks;flow.stocksAtNextSetEntry=gt.guaranteedStocks;flow.carryoverAtExtraEnd=before.carryoverPoints;flow.continuationSource=gt.battleSource??'VERIFIED_POST_EXTRA_TO_LUPIN_RUSH';}
    gt.lastEvent=`SHARED_1M_${flow?.source??'TREASURE'}_EXTRA_END_TO_LUPIN_RUSH_SET_${gt.setNo}`;
    return gt.snapshot();
  };

  const originalApplyRush=gt.applyLupinRushAverageForTest.bind(gt);
  gt.applyLupinRushAverageForTest=(type,...rest)=>{
    const flow=gt.__sharedGoldChanceFlow.last;
    const isSharedPostExtra=flow?.phase==='POST_EXTRA_LUPIN_RUSH'&&gt.battleSource==='VERIFIED_POST_EXTRA_TO_LUPIN_RUSH';
    const out=originalApplyRush(type,...rest);
    if(!out)return false;
    if(isSharedPostExtra){flow.phase=gt.state==='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION'?'CARRYOVER_GOLD_CHANCE_CHAIN':'NEXT_SET_ACTIVE';flow.nextSetState=gt.state;flow.nextSetTreasure=gt.treasurePoints;flow.nextSetRemainingGames=gt.remainingGames;flow.carryoverAfterRush=Math.max(0,Number(gt.__treasureThresholdState?.pendingCarryoverPoints)||0);}
    gt.lastEvent=isSharedPostExtra?`SHARED_1M_${flow.source}_POST_EXTRA_RUSH_${flow.phase}`:gt.lastEvent;
    return gt.snapshot();
  };

  const originalSnapshot=gt.snapshot.bind(gt);
  gt.snapshot=()=>({...originalSnapshot(),sharedGoldChanceFlow:gt.__sharedGoldChanceFlow.last?{...gt.__sharedGoldChanceFlow.last,route:gt.__sharedGoldChanceFlow.last.route?{...gt.__sharedGoldChanceFlow.last.route}:null}:null});
  const originalReset=gt.reset.bind(gt);
  gt.reset=(...args)=>{const out=originalReset(...args);gt.__sharedGoldChanceFlow={last:null};return out;};
  return true;
}
