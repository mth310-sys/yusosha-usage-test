// Step 6Z: LUPIN RUSH aggregate values with source-confidence notes.
// Major published analysis confirms 4G duration, four RUSH presentations, their average
// awards, and an ART-initial-hit overall average of 34.2万 Treasure.
// A secondary analysis page publishes an unqualified 63/31/5/1 RUSH split. Pachigabu's
// published description separately states that initial ART has a LOWER Walser selection
// rate than continuation play, so the unqualified split must not be treated as the initial
// ART distribution. Using the rounded per-type averages, 63/31/5/1 gives about 31.72万,
// also below the published initial 34.2万 average. Keep the split as context-unresolved
// reference evidence until the original initial/continuation table is recovered.
export const LUPIN_RUSH_PROFILE = Object.freeze({
  games: 4,
  initialOverallAverageTreasure: 342000,
  selectionDistribution: 'CONTEXT_UNRESOLVED_SECONDARY_REFERENCE_ONLY',
  selectionDistributionAutoUse: false,
  secondaryPublishedSelectionPct: Object.freeze({
    WALSER: 63,
    SILHOUETTE: 31,
    REVOLVER_VISION: 5,
    ATTACK_VISION: 1
  }),
  secondarySplitWeightedAverageFromRoundedTypeMeans: 317200,
  initialVsContinuationDifferenceVerified: true,
  initialWalserRateLowerThanContinuation: true,
  secondarySplitContextResolved: false,
  possibleContexts: Object.freeze(['CONTINUATION','OVERALL','OTHER_UNSPECIFIED']),
  selectionDistributionSourceLevel: 'SECONDARY_PUBLISHED_MACHINE_ANALYSIS_SINGLE_SOURCE_PLUS_PRIMARY_CONTEXT_CONSTRAINT',
  selectionDistributionValidationNote: 'DO_NOT_AUTO_USE; NOT VALID AS INITIAL DISTRIBUTION; RECOVER ORIGINAL INITIAL/CONTINUATION TABLE',
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
