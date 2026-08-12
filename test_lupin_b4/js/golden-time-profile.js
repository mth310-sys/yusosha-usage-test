// Step 6Z: GOLDEN TIME verified aggregate profile.
// Cross-source reconciliation:
// - P-GABU explicitly describes GOLDEN TIME as 30G + battle.
// - Other published overviews describe one ART set as about 40G.
// These are not treated as competing active-play counts: the ~40G figure is retained as
// a full-set aggregate/overview, while the Treasure-acquisition ACTIVE_SET is 30G.
// LUPIN RUSH and the continuation battle are modeled separately by the core.
export const GOLDEN_TIME_PROFILE = Object.freeze({
  activeSetGames: 30,
  // Core-compatible key: remainingGames must represent only ACTIVE_SET games.
  setGames: 30,
  setGamesApprox: 30,
  fullSetGamesApprox: 40,
  pureIncreaseApprox: 2.0,
  continuationExpectationRange: [80.4, 83.3],
  continuationCountExpectationRange: [5.1, 6.0],
  continuationSystem: 'LUPIN_RUSH_THEN_30G_ACTIVE_SET_THEN_TREASURE_BATTLE',
  treasureAcquisitionLottery: 'ALL_ROLES_PUBLISHED_DESCRIPTION',
  activeSetGamesSource: 'P_GABU_EXPLICIT_30G_PLUS_BATTLE',
  fullSetGamesApproxSource: 'CROSS_SOURCE_ART_OVERVIEW_APPROX_40G',
  setLengthReconciliationStatus: 'RESOLVED_AS_ACTIVE_30G_VS_FULL_SET_APPROX_40G',
  pureIncreaseSource: 'PUBLISHED_APPROX_2_0_PER_G',
  continuationModelStatus: 'TREASURE_TABLE_ACTIVE_WITH_UNRESOLVED_AWARD_DISTRIBUTIONS'
});
