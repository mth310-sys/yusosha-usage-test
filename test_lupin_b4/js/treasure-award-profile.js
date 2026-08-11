// Step 6Z: verified ART treasure award facts.
// Cross-checking published analysis confirms normal T-alignment awards start at 10万T,
// can reach 100万T, and average about 12万T when an award occurs. The exact point-by-point
// distribution still lives in an image table that has not been reliably transcribed, so
// the average is informational only and must not be used to synthesize a fake distribution.
export const TREASURE_AWARD_PROFILE = Object.freeze({
  normalTAlignment: Object.freeze({
    minimumPoints: 100000,
    maximumPoints: 1000000,
    averagePointsApprox: 120000,
    averagePointsSourceLevel: 'PUBLISHED_ANALYSIS_TEXT',
    distribution: 'UNVERIFIED_IMAGE_TABLE_NOT_TRANSCRIBED',
    automaticDistributionPolicy: 'DO_NOT_SYNTHESIZE_FROM_AVERAGE_120K',
    source: 'VERIFIED_MIN_100K_MAX_1M_AVG_APPROX_120K'
  }),
  oreNoNaWaLupinRush: Object.freeze({
    denominator: 554.6,
    awardPoints: 1000000,
    source: 'VERIFIED_1_OVER_554_6_AND_1M_AWARD'
  })
});

export function rollOreNoNaWaLupinRush(rng){
  return rng.next() < 1 / TREASURE_AWARD_PROFILE.oreNoNaWaLupinRush.denominator;
}
