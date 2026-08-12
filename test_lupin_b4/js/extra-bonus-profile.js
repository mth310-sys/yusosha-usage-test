// Step 6Z: GOLD CHANCE / EXTRA BONUS / GOLD RUSH verified analysis values.
// GOLD CHANCE exact added-game distribution remains in image-form analysis and is not
// reconstructed from the 18.2G mean. EXTRA total duration is the ART remainder at 100万T
// plus the GOLD CHANCE added games. EXTRA then performs ART-stock and GOLD RUSH lotteries.
export const GOLD_CHANCE_PROFILE = Object.freeze({
  triggerTreasurePoints:1000000,
  averageAddedGames:18.2,
  addedGameDistribution:'UNVERIFIED_IMAGE_TABLE_NOT_TRANSCRIBED',
  automaticDistributionPolicy:'DO_NOT_SYNTHESIZE_FROM_AVERAGE_18_2G',
  extraDurationFormula:'ART_REMAINING_GAMES_AT_1M + GOLD_CHANCE_ADDED_GAMES',
  source:'VERIFIED_PUBLISHED_ANALYSIS_TEXT_PLUS_DMM_STRUCTURE'
});

export const EXTRA_BONUS_PROFILE = Object.freeze({
  averageAddedGames:18.2,
  averageGames:29.6,
  durationFormula:'ART_REMAINING_GAMES_AT_1M + GOLD_CHANCE_ADDED_GAMES',
  artStockHitDenominator:4924.3,
  goldRushHitDenominator:4924.3,
  stockLottery:'EXTRA_BONUS_DURING_PLAY',
  stockHitMinimum:1,
  sevenAlignmentDestination:'GOLD_RUSH',
  jackpotOrKiaiStockExpectationPct:25,
  source:'VERIFIED_ANALYSIS_VALUES'
});

export const GOLD_RUSH_PROFILE = Object.freeze({
  initialGames:1,
  averageGames:2.1,
  nextGameContinuationPct:52.6,
  stockPerGameAverage:1.01,
  redAlignmentMinimumStocks:1,
  absoluteBreakthroughMinimumStocks:1,
  limitBreakthroughMinimumStocks:2,
  source:'VERIFIED_ANALYSIS_VALUES'
});

export function rollOneIn(denominator,rng){return rng.next()<1/denominator;}
export function rollGoldRushContinuation(rng){return rng.next()<GOLD_RUSH_PROFILE.nextGameContinuationPct/100;}
