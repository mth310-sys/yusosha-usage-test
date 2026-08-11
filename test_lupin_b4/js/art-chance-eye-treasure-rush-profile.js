// Step 6Z: ART chance-eye -> Treasure RUSH precursor profile.
// Cross-source published descriptions confirm that ART chance eyes act as a precursor
// to Treasure RUSH through continuous-performance / Treasure Hunt style routing.
// The exact weak/middle/strong hit-rate table is image-only in the currently verified
// sources, so no numeric automatic lottery is synthesized here.
export const ART_CHANCE_EYE_TREASURE_RUSH_PROFILE = Object.freeze({
  chanceEyes: Object.freeze({
    WEAK_BLUE: Object.freeze({ display:'BLUE EVEN', relativeExpectation:'LOW', exactRushExpectationPct:null }),
    MIDDLE_RED: Object.freeze({ display:'RED ODD', relativeExpectation:'MEDIUM_OR_HIGH', exactRushExpectationPct:null }),
    STRONG_7: Object.freeze({ display:'7', relativeExpectation:'HIGH', exactRushExpectationPct:null })
  }),
  route: 'CHANCE_EYE_TO_CONTINUOUS_PERFORMANCE_TO_TREASURE_HUNT_SUCCESS_OR_TREASURE_RUSH',
  publishedNotes: Object.freeze({
    middleOrHigherDescribedAsMeaningfullyHot:true,
    weakAppearsMoreFrequently:true,
    exactTableKnownToExistButImageValuesNotReliablyExtracted:true
  }),
  sourceLevel:'CROSS_SOURCE_PUBLISHED_DESCRIPTION_WITH_IMAGE_ONLY_NUMERIC_TABLE',
  policy:'NO_AUTO_TREASURE_RUSH_LOTTERY_UNTIL_EXACT_NUMERIC_TABLE_IS_TEXTUALLY_VERIFIED'
});

export function getArtChanceEyeTreasureRushRow(key){
  return ART_CHANCE_EYE_TREASURE_RUSH_PROFILE.chanceEyes[key] ?? null;
}
