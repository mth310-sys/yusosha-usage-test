// Step 6Z: GOLD CHANCE / EXTRA BONUS / GOLD RUSH analysis values.
export const GOLD_CHANCE_PROFILE = Object.freeze({
  triggerTreasurePoints:1000000,
  minimumAddedGamesSupported:15,
  averageAddedGames:18.2,
  addedGameDistribution:null,
  addedGameDistributionStatus:'UNRESOLVED_IMAGE_TABLE_DO_NOT_SYNTHESIZE_FROM_AVERAGE',
  extraTotalGamesFormula:'ART_REMAINING_GAMES_AT_1M_PLUS_GOLD_CHANCE_ADDED_GAMES',
  minimumSourceNote:'1geki explicitly describes EXTRA as 15G + ART remaining games; this is consistent with the published 18.2G average GOLD CHANCE add.',
  autoRollEnabled:false,
  source:'CROSS_SOURCE_ANALYSIS_AVERAGE_FLOW_AND_15G_MINIMUM'
});

export const EXTRA_BONUS_PROFILE = Object.freeze({
  averageAddedGames:GOLD_CHANCE_PROFILE.averageAddedGames,
  averageGames:29.6,
  artStockHitDenominator:202.6,
  artStockHitDenominatorPreferredSource:'1GEKI_EXPLICIT_ODD_ALIGNMENT_STOCK_RATE',
  artStockHitDenominatorConflictingSecondaryValue:4924.3,
  artStockRateConflictStatus:'SOURCE_CONFLICT_RECORDED_PREFER_EXPLICIT_ODD_ALIGNMENT_RATE',
  artStockRateConflictNote:'1geki lists odd-symbol ART stock at 1/202.6 and GOLD RUSH at 1/4924.3. P-GABU lists both ART stock and GOLD RUSH as 1/4924.3. Because P-GABU also describes normal EXTRA stock as not especially rare while GOLD RUSH is exceptionally rare, 1/202.6 is the more internally consistent working model.',
  goldRushHitDenominator:4924.3,
  stockLottery:'EXTRA_BONUS_DURING_PLAY_ODD_ALIGNMENT',
  sevenAlignmentDestination:'GOLD_RUSH',
  jackpotOrKiaiStockExpectationPct:25,
  jackpotOrKiaiMeaning:'ART_STOCK_EXPECTATION',
  source:'CROSS_SOURCE_ANALYSIS_WITH_RECORDED_RATE_CONFLICT'
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
  return Number.isInteger(n)&&n>=GOLD_CHANCE_PROFILE.minimumAddedGamesSupported;
}

export function rollOneIn(denominator,rng){return rng.next()<1/denominator;}
export function rollGoldRushContinuation(rng){return rng.next()<GOLD_RUSH_PROFILE.nextGameContinuationPct/100;}
