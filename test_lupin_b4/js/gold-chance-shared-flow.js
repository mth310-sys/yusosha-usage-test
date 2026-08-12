// Step 6Z: one shared GOLD CHANCE -> EXTRA BONUS flow for every Treasure source.
// Award amount distributions remain unresolved where noted elsewhere; this module only
// normalizes the confirmed state transition after 1,000,000T has already been reached.

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
    gt.__sharedGoldChanceFlow.last={
      source,
      route,
      baseRemainingGames:baseRemaining,
      addedGames:Number(games),
      extraTargetGames:gt.extraTargetGames,
      carryoverPoints:Math.max(0,Number(threshold?.pendingCarryoverPoints)||0),
      phase:'EXTRA_READY'
    };
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
    if(flow){
      flow.phase='EXTRA_ACTIVE';
      flow.extraSource=resolvedSource;
      flow.extraTargetGames=gt.extraTargetGames;
      flow.extraRemainingGames=gt.extraRemainingGames;
    }
    gt.lastEvent=`SHARED_GOLD_CHANCE_EXTRA_START_${resolvedSource}_${gt.extraTargetGames}G`;
    return gt.snapshot();
  };

  const originalSnapshot=gt.snapshot.bind(gt);
  gt.snapshot=()=>({
    ...originalSnapshot(),
    sharedGoldChanceFlow:gt.__sharedGoldChanceFlow.last?{...gt.__sharedGoldChanceFlow.last,route:gt.__sharedGoldChanceFlow.last.route?{...gt.__sharedGoldChanceFlow.last.route}:null}:null
  });

  const originalReset=gt.reset.bind(gt);
  gt.reset=(...args)=>{
    const out=originalReset(...args);
    gt.__sharedGoldChanceFlow={last:null};
    return out;
  };
  return true;
}
