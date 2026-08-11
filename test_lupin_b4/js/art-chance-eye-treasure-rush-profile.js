// Step 6Z: ART chance-eye -> Treasure RUSH precursor profile.
// Primary published analysis pages confirm an ART chance-eye Treasure RUSH expectation table exists.
// DMM also exposes a dedicated 2016-08-20 analysis item titled "Treasure RUSH lottery".
// The numeric cells remain image-only in the currently retrievable sources, so no values are guessed.
export const ART_CHANCE_EYE_TREASURE_RUSH_PROFILE = Object.freeze({
  chanceEyes: Object.freeze({
    WEAK_BLUE: Object.freeze({ display:'BLUE EVEN', relativeExpectation:'LOWER', exactRushExpectationPct:null }),
    MIDDLE_RED: Object.freeze({ display:'RED ODD', relativeExpectation:'MEANINGFULLY_HOT', exactRushExpectationPct:null }),
    STRONG_7: Object.freeze({ display:'7', relativeExpectation:'MEANINGFULLY_HOT_OR_HIGHER', exactRushExpectationPct:null })
  }),
  route: 'ART_CHANCE_EYE_TO_TREASURE_RUSH_PRECURSOR_PRESENTATION',
  publishedNotes: Object.freeze({
    pachigabuArtChanceEyeExpectationTableConfirmed:true,
    pachigabuTextSaysMiddleOrHigherMeaningfullyHot:true,
    dmmDedicatedTreasureRushLotteryAnalysisConfirmed:true,
    dmmAnalysisPublishedDate:'2016-08-20',
    exactNumericCellsRemainImageOnly:true
  }),
  evidence: Object.freeze({
    primarySources:Object.freeze(['PACHIGABU_MACHINE_4259','DMM_MACHINE_2539']),
    secondaryCrossChecks:Object.freeze(['1GEKI_ART_OVERVIEW','P_WORLD_MACHINE_8067']),
    numericStatus:'UNRESOLVED_IMAGE_TABLE'
  }),
  sourceLevel:'PRIMARY_PUBLISHED_ANALYSIS_TABLE_EXISTENCE_CONFIRMED_NUMERIC_VALUES_UNRESOLVED',
  policy:'NO_AUTO_TREASURE_RUSH_LOTTERY_UNTIL_EXACT_NUMERIC_TABLE_IS_VERIFIED'
});

export function getArtChanceEyeTreasureRushRow(key){
  return ART_CHANCE_EYE_TREASURE_RUSH_PROFILE.chanceEyes[key] ?? null;
}
