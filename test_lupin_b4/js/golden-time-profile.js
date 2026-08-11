// Step 6A: GOLDEN TIME verified aggregate profile.
// The continuation expectation is informational here; it is NOT used as a flat continuation lottery.
// Actual continuation depends on Treasure and stock, so that model is implemented separately.
export const GOLDEN_TIME_PROFILE = Object.freeze({
  setGamesApprox: 40,
  pureIncreaseApprox: 2.0,
  continuationExpectationRange: [80.4, 83.3],
  continuationCountExpectationRange: [5.1, 6.0],
  continuationSystem: 'SET_STOCK_PLUS_TREASURE_BATTLE',
  setGamesSource: 'VERIFIED_APPROX_40G',
  pureIncreaseSource: 'VERIFIED_APPROX_2_0_PER_G',
  continuationModelStatus: 'TREASURE_MODEL_PENDING'
});
