export const GT_SYSTEM_SPEC = Object.freeze({
  treasure: Object.freeze({
    maxPoints: 1000000,
    maxEffect: 'SET_CONTINUE_AND_EXTRA_BONUS',
    overflowCarryToNextSet: true,
    acquisitionTriggers: Object.freeze(['T_SYMBOL_ALIGNED', 'CHANCE_EYE']),
    tSymbols: Object.freeze(['SILVER', 'GOLD']),
    continuationExpectationByPoints: Object.freeze({
      100000: 69.7,
      150000: 70.5,
      200000: 71.3,
      250000: 72.0,
      300000: 72.8,
      350000: 73.6,
      400000: 74.4,
      450000: 75.2,
      500000: 76.3,
      550000: 77.5,
      600000: 78.7,
      650000: 79.8,
      700000: 81.0,
      750000: 82.2,
      800000: 85.9,
      850000: 89.7,
      900000: 93.4,
      950000: 97.2,
      1000000: 100.0
    })
  }),
  stages: Object.freeze({
    japan: Object.freeze({ treasureHitDenominator: 16.9 }),
    switzerland: Object.freeze({ treasureHitDenominator: 12.6 }),
    caribbean: Object.freeze({ treasureHitDenominator: 7.5 }),
    undergroundCity: Object.freeze({ treasureHitDenominator: 3.0 }),
    alternateSpace: Object.freeze({ games: 10, averageTreasurePoints: 702000 })
  }),
  lupinRush: Object.freeze({
    timing: 'SET_START',
    games: 4,
    patterns: Object.freeze(['WALTHER', 'SILHOUETTE', 'REVOLVER_VISION', 'ATTACK_VISION']),
    averageTreasurePoints: 342000
  }),
  treasureRush: Object.freeze({
    trigger: 'TREASURE_HUNT_SUCCESS',
    games: Object.freeze({ min: 4, max: 9 }),
    averageTreasurePoints: 499000
  }),
  extraBonus: Object.freeze({
    triggerPoints: 1000000,
    gamesRule: '15_PLUS_REMAINING_ART_GAMES',
    averageGames: 29.6,
    oddSymbolSetStockDenominator: 202.6,
    goldRushDenominator: 4924.3,
    goldRushTrigger: 'GOLD_7_ALIGNED'
  }),
  goldRush: Object.freeze({
    trigger: 'EXTRA_BONUS_GOLD_7_ALIGNED',
    baseGames: 1,
    continuationPercent: 52.6,
    averageGames: 2.1,
    continuationEffect: 'ART_SET_STOCK'
  }),
  continuationBattle: Object.freeze({
    trigger: 'SET_GAMES_EXHAUSTED_WITHOUT_STOCK',
    lotteryBasis: 'HELD_TREASURE_POINTS',
    successEffect: 'NEXT_SET',
    note: 'Treasure points are not a direct percentage conversion; published continuation expectations are used.'
  }),
  evidence: Object.freeze({
    treasureMaxAndExtraBonusRoute: 'MULTI_SOURCE_MATCH',
    treasureContinuationTable: 'MULTI_SOURCE_MATCH',
    stageTreasureHitRates: 'MULTI_SOURCE_MATCH',
    lupinRushProfile: 'PUBLISHED_ANALYSIS',
    treasureRushProfile: 'MULTI_SOURCE_MATCH',
    extraBonusCoreRoute: 'MULTI_SOURCE_MATCH',
    extraBonusExactRates: 'PUBLISHED_ANALYSIS',
    goldRushCoreRoute: 'MULTI_SOURCE_MATCH',
    goldRushExactContinuation: 'PUBLISHED_ANALYSIS',
    continuationBattleCore: 'MULTI_SOURCE_MATCH'
  }),
  policy: Object.freeze({
    inferTreasurePointAwardAmounts: false,
    inferStageTransitionRates: false,
    inferRushPatternSelectionRates: false,
    interpolateUnlistedContinuationPoints: false
  })
});

export function getTreasureContinuationExpectation(points) {
  if (!Number.isInteger(points)) return null;
  return GT_SYSTEM_SPEC.treasure.continuationExpectationByPoints[points] ?? null;
}
