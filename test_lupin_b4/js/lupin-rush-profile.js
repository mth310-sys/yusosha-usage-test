// Step 6Z: LUPIN RUSH aggregate values with source-confidence notes.
// Published primary/major analysis pages confirm 4G duration, four RUSH presentations,
// their average awards, and an initial-hit overall average of 34.2万 Treasure.
// A secondary machine-analysis page additionally publishes a 63/31/5/1 RUSH split.
// Because that split has not yet been recovered from a second independent table and its
// weighted mean does not directly reproduce the published 34.2万 aggregate using rounded
// per-type averages, keep it as reference evidence only and do not auto-draw from it yet.
export const LUPIN_RUSH_PROFILE = Object.freeze({
  games: 4,
  initialOverallAverageTreasure: 342000,
  selectionDistribution: 'SECONDARY_SINGLE_SOURCE_REFERENCE_ONLY',
  selectionDistributionAutoUse: false,
  secondaryPublishedSelectionPct: Object.freeze({
    WALSER: 63,
    SILHOUETTE: 31,
    REVOLVER_VISION: 5,
    ATTACK_VISION: 1
  }),
  selectionDistributionSourceLevel: 'SECONDARY_PUBLISHED_MACHINE_ANALYSIS_SINGLE_SOURCE',
  selectionDistributionValidationNote: 'DO_NOT_AUTO_USE_UNTIL_SECOND_SOURCE_OR_ORIGINAL_TABLE_RECOVERED',
  perGameAwardDistribution: 'UNVERIFIED',
  types: Object.freeze({
    WALSER: Object.freeze({label:'WALSER RUSH', averageTreasure:240000}),
    SILHOUETTE: Object.freeze({label:'SILHOUETTE RUSH', averageTreasure:400000}),
    REVOLVER_VISION: Object.freeze({label:'REVOLVER VISION RUSH', averageTreasure:640000}),
    ATTACK_VISION: Object.freeze({label:'ATTACK VISION', averageTreasure:1000000})
  })
});

export function getLupinRushType(type){
  return LUPIN_RUSH_PROFILE.types[type] ?? null;
}
