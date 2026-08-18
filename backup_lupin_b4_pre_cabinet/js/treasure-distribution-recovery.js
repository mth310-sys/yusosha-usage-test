// Step 6Z: recovery status for Treasure award image tables.
// Purpose: keep verified text-level constraints separate from unrecovered image-cell distributions.
// No automatic award distribution may be synthesized from averages or qualitative descriptions.

export const TREASURE_DISTRIBUTION_RECOVERY = Object.freeze({
  normalTAlignment:Object.freeze({
    tableLocated:true,
    exactCellsRecovered:false,
    minimumPoints:100000,
    maximumPoints:1000000,
    averagePointsApprox:120000,
    qualitative:null,
    blocker:'PUBLISHED_TABLE_IS_IMAGE_ONLY_EXACT_PERCENT_CELLS_NOT_RECOVERED',
    automaticDrawAllowed:false
  }),
  treasureRushPerGame:Object.freeze({
    tableLocated:true,
    exactCellsRecovered:false,
    minimumPoints:50000,
    normalMaximumPoints:1000000,
    firstGameCanExceedNormalMaximum:true,
    averageTotalPointsApprox:500000,
    alternateAverageTotalPoints:499000,
    qualitative:'ABOUT_90_PERCENT_OF_PER_GAME_AWARDS_ARE_50K_OR_100K',
    blocker:'PUBLISHED_TABLE_IS_IMAGE_ONLY_EXACT_PERCENT_CELLS_NOT_RECOVERED',
    automaticDrawAllowed:false
  }),
  ikukanPerGame:Object.freeze({
    tableLocated:true,
    exactCellsRecovered:false,
    durationGames:10,
    minimumPointsPerGame:50000,
    averageTotalPointsApprox:700000,
    alternateAverageTotalPoints:702000,
    qualitative:'50K_SHARE_IS_HIGHER_THAN_TREASURE_RUSH',
    blocker:'PUBLISHED_TABLE_IS_IMAGE_ONLY_EXACT_PERCENT_CELLS_NOT_RECOVERED',
    automaticDrawAllowed:false
  })
});

export function isTreasureDistributionReady(key){
  const row=TREASURE_DISTRIBUTION_RECOVERY[key];
  return Boolean(row?.tableLocated&&row?.exactCellsRecovered&&row?.automaticDrawAllowed);
}

export function treasureDistributionRecoverySnapshot(){
  return Object.fromEntries(Object.entries(TREASURE_DISTRIBUTION_RECOVERY).map(([key,row])=>[key,{...row}]));
}
