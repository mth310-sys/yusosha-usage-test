// Step 6Z: GOLDEN TIME verified aggregate profile.
// Cross-check: published 1geki analysis explicitly states 1 set is about 40G, pure increase about 2.0/G,
// and continuation expectation 80.4-83.3% (about 5.1-6.0 continuations expected).
// Continuation is NOT modeled as one flat percentage: Treasure amount / stock / battle flow remain separate.
export const GOLDEN_TIME_PROFILE = Object.freeze({
  setGames: 40,
  // Legacy alias retained because the current core already consumes this key.
  setGamesApprox: 40,
  pureIncreaseApprox: 2.0,
  continuationExpectationRange: [80.4, 83.3],
  continuationCountExpectationRange: [5.1, 6.0],
  continuationSystem: 'SET_STOCK_PLUS_TREASURE_BATTLE',
  treasureAcquisitionLottery: 'ALL_ROLES_PUBLISHED_DESCRIPTION',
  setGamesSource: 'CROSS_SOURCE_PUBLISHED_ART_OVERVIEW_40G',
  pureIncreaseSource: 'PUBLISHED_APPROX_2_0_PER_G',
  continuationModelStatus: 'TREASURE_TABLE_ACTIVE_WITH_UNRESOLVED_AWARD_DISTRIBUTIONS'
});
