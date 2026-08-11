// Step 6H: EXTRA BONUS / GOLD RUSH verified analysis values.
export const EXTRA_BONUS_PROFILE = Object.freeze({
  averageAddedGames:18.2,
  averageGames:29.6,
  artStockHitDenominator:4924.3,
  goldRushHitDenominator:4924.3,
  stockLottery:'EXTRA_BONUS_DURING_PLAY',
  sevenAlignmentDestination:'GOLD_RUSH',
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
