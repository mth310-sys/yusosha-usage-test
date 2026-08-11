// Step 6F: verified ART treasure award facts.
// Exact normal T-alignment award distribution is not available in text, so only the verified minimum is modeled as a floor.
export const TREASURE_AWARD_PROFILE = Object.freeze({
  normalTAlignment: Object.freeze({
    minimumPoints: 100000,
    maximumObservedPoints: 1000000,
    distribution: 'UNVERIFIED_IMAGE_TABLE_NOT_TRANSCRIBED',
    source: 'VERIFIED_MIN_100K_AND_UP_TO_1M'
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
