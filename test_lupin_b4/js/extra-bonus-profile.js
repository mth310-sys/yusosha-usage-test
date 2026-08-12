// Step 6Z: GOLD CHANCE / EXTRA BONUS / GOLD RUSH verified analysis values.
export const GOLD_CHANCE_PROFILE = Object.freeze({
  triggerTreasurePoints:1000000,
  averageAddedGames:18.2,
  addedGameDistribution:null,
  addedGameDistributionStatus:'UNRESOLVED_IMAGE_TABLE_DO_NOT_SYNTHESIZE_FROM_AVERAGE',
  extraTotalGamesFormula:'ART_REMAINING_GAMES_AT_1M_PLUS_GOLD_CHANCE_ADDED_GAMES',
  autoRollEnabled:false,
  source:'VERIFIED_ANALYSIS_AVERAGE_AND_FLOW'
});

export const EXTRA_BONUS_PROFILE = Object.freeze({
  averageAddedGames:GOLD_CHANCE_PROFILE.averageAddedGames,
  averageGames:29.6,
  artStockHitDenominator:4924.3,
  goldRushHitDenominator:4924.3,
  stockLottery:'EXTRA_BONUS_DURING_PLAY',
  sevenAlignmentDestination:'GOLD_RUSH',
  jackpotOrKiaiStockExpectationPct:25,
  jackpotOrKiaiMeaning:'ART_STOCK_EXPECTATION',
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
  continuationModel:'INITIAL_1G_THEN_52_6_PERCENT_NEXT_GAME_CONTINUATION',
  source:'VERIFIED_ANALYSIS_VALUES'
});

export function isVerifiedGoldChanceAddedGames(games){
  const n=Number(games);
  return Number.isInteger(n)&&n>=0;
}

export function rollOneIn(denominator,rng){return rng.next()<1/denominator;}
export function rollGoldRushContinuation(rng){return rng.next()<GOLD_RUSH_PROFILE.nextGameContinuationPct/100;}
