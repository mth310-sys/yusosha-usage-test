export const MAX_DISPLAY_TREASURE=1000000;

function freshThresholdState(){return {pendingCarryoverPoints:0,lastAppliedCarryoverPoints:0,extraChainPending:false,lastSource:null};}

export function installTreasureThresholdCarryoverHooks(gt){
  if(!gt||gt.__treasureThresholdCarryoverInstalled)return false;
  gt.__treasureThresholdCarryoverInstalled=true;
  gt.__treasureThresholdState=freshThresholdState();

  const originalSnapshot=gt.snapshot.bind(gt);
  gt.snapshot=()=>({...originalSnapshot(),treasureThreshold:{...gt.__treasureThresholdState,maxDisplayTreasure:MAX_DISPLAY_TREASURE}});

  const originalReset=gt.reset.bind(gt);
  gt.reset=(...args)=>{const out=originalReset(...args);gt.__treasureThresholdState=freshThresholdState();return out;};

  const originalFinishExtra=gt.finishExtraToGuaranteedNextSet?.bind(gt);
  if(originalFinishExtra){
    gt.finishExtraToGuaranteedNextSet=(...args)=>{
      const pending=Math.max(0,Number(gt.__treasureThresholdState?.pendingCarryoverPoints)||0);
      const out=originalFinishExtra(...args);
      const x=gt.__treasureThresholdState;
      if(pending<=0){x.lastAppliedCarryoverPoints=0;x.extraChainPending=false;return gt.snapshot();}
      gt.treasurePoints=Math.min(MAX_DISPLAY_TREASURE,pending);
      x.lastAppliedCarryoverPoints=pending;
      x.pendingCarryoverPoints=Math.max(0,pending-MAX_DISPLAY_TREASURE);
      x.extraChainPending=pending>=MAX_DISPLAY_TREASURE;
      gt.lastEvent=x.extraChainPending
        ?`TREASURE_CARRYOVER_${pending}_NEXT_SET_1M_CHAIN_PENDING`
        :`TREASURE_CARRYOVER_${pending}_APPLIED_NEXT_SET`;
      return gt.snapshot();
    };
  }

  gt.triggerTreasureCarryoverExtraChainForTest=()=>{
    const x=gt.__treasureThresholdState;
    if(gt.state!=='ACTIVE_SET'||!x?.extraChainPending||(Number(gt.treasurePoints)||0)<MAX_DISPLAY_TREASURE)return false;
    gt.goldChanceBaseRemainingGames=gt.remainingGames;
    gt.state='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION';
    x.extraChainPending=false;
    gt.lastEvent=`TREASURE_CARRYOVER_1M_CHAIN_GOLD_CHANCE_PENDING_REMAINING_${gt.remainingGames}`;
    return gt.snapshot();
  };
  return true;
}

export function applyTreasureAwardToGoldChanceThreshold(gt,awardPoints,{eventPrefix='TREASURE',enterGoldChance=true}={}){
  const award=Number(awardPoints);
  if(!gt||!Number.isFinite(award)||award<0)return false;
  const base=Math.max(0,Number(gt.treasurePoints)||0);
  const rawTotal=base+award;
  const displayedTreasurePoints=Math.min(MAX_DISPLAY_TREASURE,rawTotal);
  const carryoverPoints=Math.max(0,rawTotal-MAX_DISPLAY_TREASURE);
  gt.treasurePoints=displayedTreasurePoints;
  if(gt.__treasureThresholdState){
    gt.__treasureThresholdState.pendingCarryoverPoints=carryoverPoints;
    gt.__treasureThresholdState.lastSource=eventPrefix;
  }
  if(rawTotal>=MAX_DISPLAY_TREASURE&&enterGoldChance){
    gt.goldChanceBaseRemainingGames=gt.remainingGames;
    gt.state='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION';
    gt.lastEvent=`${eventPrefix}_1M_CARRYOVER_${carryoverPoints}_GOLD_CHANCE_PENDING`;
  }
  return {baseTreasurePoints:base,awardPoints:award,rawTotal,displayedTreasurePoints,carryoverPoints,reachedOneMillion:rawTotal>=MAX_DISPLAY_TREASURE};
}
