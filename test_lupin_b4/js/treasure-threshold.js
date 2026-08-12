export const MAX_DISPLAY_TREASURE=1000000;

function freshThresholdState(){return {pendingCarryoverPoints:0,lastAppliedCarryoverPoints:0,extraChainPending:false,lastSource:null,lastProjection:null,invariantStatus:'NOT_RUN'};}

export function projectTreasureCarryover(carryoverPoints){
  const total=Math.max(0,Number(carryoverPoints)||0);
  const fullMillionChunks=Math.floor(total/MAX_DISPLAY_TREASURE);
  const remainderPoints=total%MAX_DISPLAY_TREASURE;
  return Object.freeze({
    carryoverPoints:total,
    fullMillionChunks,
    remainderPoints,
    requiredExtraChains:fullMillionChunks,
    nextSetInitialTreasure:Math.min(MAX_DISPLAY_TREASURE,total),
    terminatesWithTreasure:remainderPoints,
    invariant:`${total}=${fullMillionChunks}*${MAX_DISPLAY_TREASURE}+${remainderPoints}`
  });
}

export const TREASURE_CARRYOVER_BOUNDARY_CASES=Object.freeze([
  Object.freeze({key:'NO_CARRYOVER',carryoverPoints:0,expectedChains:0,expectedRemainder:0}),
  Object.freeze({key:'SMALL_CARRYOVER',carryoverPoints:100000,expectedChains:0,expectedRemainder:100000}),
  Object.freeze({key:'ONE_MILLION_CARRYOVER',carryoverPoints:1000000,expectedChains:1,expectedRemainder:0}),
  Object.freeze({key:'TWO_MILLION_CARRYOVER',carryoverPoints:2000000,expectedChains:2,expectedRemainder:0}),
  Object.freeze({key:'TWO_MILLION_PLUS_REMAINDER',carryoverPoints:2300000,expectedChains:2,expectedRemainder:300000})
]);

export function validateTreasureCarryoverBoundaryCases(){
  const rows=TREASURE_CARRYOVER_BOUNDARY_CASES.map(row=>{
    const projected=projectTreasureCarryover(row.carryoverPoints);
    const pass=projected.requiredExtraChains===row.expectedChains&&projected.remainderPoints===row.expectedRemainder;
    return Object.freeze({...row,projected,pass});
  });
  return Object.freeze({pass:rows.every(row=>row.pass),rows:Object.freeze(rows)});
}

function clearPriorSetTransientState(gt,{preserveThresholdState=false}={}){
  gt.ikukanGameCount=0;
  gt.ikukanRemainingGames=null;
  gt.ikukanGuaranteedMinimumAccrued=0;
  gt.ikukanEntryGame=null;
  gt.goldChanceBaseRemainingGames=null;
  gt.goldChanceAddedGames=null;
  gt.goldChanceSource=null;
  gt.extraGameCount=0;
  gt.extraTargetGames=null;
  gt.extraRemainingGames=null;
  gt.extraStockLotteryEvents=0;
  gt.extraStockHits=0;
  gt.extraResult='UNRESOLVED';
  gt.extraSource=null;
  gt.pendingGoldRush=false;
  gt.goldRushGameCount=0;
  gt.goldRushStocks=0;
  gt.goldRushResult='UNRESOLVED';
  if(!preserveThresholdState&&gt.__treasureThresholdState)gt.__treasureThresholdState=freshThresholdState();
}

export function installTreasureThresholdCarryoverHooks(gt){
  if(!gt||gt.__treasureThresholdCarryoverInstalled)return false;
  gt.__treasureThresholdCarryoverInstalled=true;
  gt.__treasureThresholdState=freshThresholdState();

  const originalSnapshot=gt.snapshot.bind(gt);
  gt.snapshot=()=>({...originalSnapshot(),treasureThreshold:{...gt.__treasureThresholdState,maxDisplayTreasure:MAX_DISPLAY_TREASURE,boundaryValidation:validateTreasureCarryoverBoundaryCases()}});

  const originalReset=gt.reset.bind(gt);
  gt.reset=(...args)=>{const out=originalReset(...args);gt.__treasureThresholdState=freshThresholdState();return out;};

  const originalBeginNextSet=gt.beginNextSet?.bind(gt);
  if(originalBeginNextSet){
    gt.beginNextSet=(source,...rest)=>{
      const preserveThresholdState=source==='INFERRED_1M_TREASURE_GUARANTEED_CONTINUATION_AFTER_EXTRA';
      const out=originalBeginNextSet(source,...rest);
      clearPriorSetTransientState(gt,{preserveThresholdState});
      return out;
    };
  }

  const originalContinuationRush=gt.startContinuationLupinRush?.bind(gt);
  if(originalContinuationRush){
    gt.startContinuationLupinRush=(...args)=>{
      const out=originalContinuationRush(...args);
      clearPriorSetTransientState(gt);
      gt.lastEvent='TREASURE_BATTLE_WIN_LUPIN_RUSH_START_PRIOR_SET_TRANSIENTS_CLEARED';
      return gt.snapshot();
    };
  }

  const originalFinishExtra=gt.finishExtraToGuaranteedNextSet?.bind(gt);
  if(originalFinishExtra){
    gt.finishExtraToGuaranteedNextSet=(...args)=>{
      const pending=Math.max(0,Number(gt.__treasureThresholdState?.pendingCarryoverPoints)||0);
      const source=gt.__treasureThresholdState?.lastSource??null;
      const projectionBeforeApply=projectTreasureCarryover(pending);
      const out=originalFinishExtra(...args);
      const x=gt.__treasureThresholdState;
      x.lastSource=source;
      x.lastProjection=projectionBeforeApply;
      if(pending<=0){x.pendingCarryoverPoints=0;x.lastAppliedCarryoverPoints=0;x.extraChainPending=false;x.invariantStatus='PASS_NO_CARRYOVER';return gt.snapshot();}
      gt.treasurePoints=Math.min(MAX_DISPLAY_TREASURE,pending);
      x.lastAppliedCarryoverPoints=pending;
      x.pendingCarryoverPoints=Math.max(0,pending-MAX_DISPLAY_TREASURE);
      x.extraChainPending=pending>=MAX_DISPLAY_TREASURE;
      const recomposed=(x.extraChainPending?MAX_DISPLAY_TREASURE:gt.treasurePoints)+x.pendingCarryoverPoints;
      x.invariantStatus=recomposed===pending?'PASS':'MISMATCH';
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
    gt.__treasureThresholdState.lastProjection=projectTreasureCarryover(carryoverPoints);
    gt.__treasureThresholdState.invariantStatus=gt.__treasureThresholdState.lastProjection.carryoverPoints===carryoverPoints?'PASS':'MISMATCH';
  }
  if(rawTotal>=MAX_DISPLAY_TREASURE&&enterGoldChance){
    gt.goldChanceBaseRemainingGames=gt.remainingGames;
    gt.state='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION';
    gt.lastEvent=`${eventPrefix}_1M_CARRYOVER_${carryoverPoints}_GOLD_CHANCE_PENDING`;
  }
  return {baseTreasurePoints:base,awardPoints:award,rawTotal,displayedTreasurePoints,carryoverPoints,reachedOneMillion:rawTotal>=MAX_DISPLAY_TREASURE,carryoverProjection:projectTreasureCarryover(carryoverPoints)};
}
