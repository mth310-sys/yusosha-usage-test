// Step 6Z: verified ART treasure award facts.
// Published analysis confirms normal T-alignment awards start at 10万T and can reach 100万T.
// P-GABU exposes the exact point-by-point split only as an image labelled
// "T揃い時の上乗せポイント振り分け"; its indexed text confirms the floor/max behavior
// but does not expose the numeric cells. Do not OCR, infer, or synthesize those cells.
// 1geki's ART presentation table gives exact floor rules for special visual cues: gold T is
// 30万T+, generic gold in ART is 50万T+ (or another strong benefit), and rainbow / Attack
// Vision can imply 100万T+ or continuation-level benefits.
export const TREASURE_AWARD_PROFILE = Object.freeze({
  normalTAlignment: Object.freeze({
    minimumPoints: 100000,
    maximumPoints: 1000000,
    averagePointsApprox: 120000,
    averagePointsSourceLevel: 'PUBLISHED_ANALYSIS_TEXT',
    distribution: null,
    distributionStatus: 'SOURCE_IMAGE_TABLE_IDENTIFIED_NUMERIC_CELLS_NOT_RECOVERED',
    distributionTableLabel: 'T揃い時の上乗せポイント振り分け',
    distributionTableHost: 'P_GABU',
    recoveryPolicy: 'REQUIRE_DIRECT_TABLE_VALUES_OR_CLEAR_SOURCE_IMAGE_DO_NOT_OCR_OR_INFER',
    automaticDistributionPolicy: 'DO_NOT_SYNTHESIZE_FROM_AVERAGE_120K',
    source: 'VERIFIED_MIN_100K_MAX_1M_AVG_APPROX_120K'
  }),
  presentationFloors: Object.freeze({
    GOLD_T_SYMBOL: Object.freeze({ minimumTreasurePoints:300000, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' }),
    GOLD_GENERIC_ART_CUE: Object.freeze({ minimumTreasurePoints:500000, alternateBenefitPossible:true, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' }),
    RAINBOW_ART_CUE: Object.freeze({ minimumTreasurePoints:1000000, alternateBenefitPossible:true, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' }),
    ATTACK_VISION_ART_CUE: Object.freeze({ minimumTreasurePoints:1000000, continuationBenefitPossible:true, sourceLevel:'1GEKI_PUBLISHED_ANALYSIS' })
  }),
  oreNoNaWaLupinRush: Object.freeze({
    denominator: 554.6,
    awardPoints: 1000000,
    source: 'VERIFIED_1_OVER_554_6_AND_1M_AWARD'
  })
});

export function getTreasurePresentationFloor(key){
  return TREASURE_AWARD_PROFILE.presentationFloors[key] ?? null;
}

export function hasVerifiedNormalTAwardDistribution(){
  return Array.isArray(TREASURE_AWARD_PROFILE.normalTAlignment.distribution);
}

export function rollOreNoNaWaLupinRush(rng){
  return rng.next() < 1 / TREASURE_AWARD_PROFILE.oreNoNaWaLupinRush.denominator;
}
