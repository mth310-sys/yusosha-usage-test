export const MAX_DISPLAY_TREASURE=1000000;

export function applyTreasureAwardToGoldChanceThreshold(gt,awardPoints,{eventPrefix='TREASURE',enterGoldChance=true}={}){
  const award=Number(awardPoints);
  if(!gt||!Number.isFinite(award)||award<0)return false;
  const base=Math.max(0,Number(gt.treasurePoints)||0);
  const rawTotal=base+award;
  const displayedTreasurePoints=Math.min(MAX_DISPLAY_TREASURE,rawTotal);
  const carryoverPoints=Math.max(0,rawTotal-MAX_DISPLAY_TREASURE);
  gt.treasurePoints=displayedTreasurePoints;
  if(rawTotal>=MAX_DISPLAY_TREASURE&&enterGoldChance){
    gt.goldChanceBaseRemainingGames=gt.remainingGames;
    gt.state='GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION';
    gt.lastEvent=`${eventPrefix}_1M_CARRYOVER_${carryoverPoints}_GOLD_CHANCE_PENDING`;
  }
  return {baseTreasurePoints:base,awardPoints:award,rawTotal,displayedTreasurePoints,carryoverPoints,reachedOneMillion:rawTotal>=MAX_DISPLAY_TREASURE};
}
