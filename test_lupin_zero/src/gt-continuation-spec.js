export const GT_CONTINUATION_SPEC = Object.freeze({
  battle: Object.freeze({
    trigger: 'SET_GAMES_EXHAUSTED_WITHOUT_STOCK',
    opponentCount: 5,
    opponentsByExpectation: Object.freeze([
      'ZENIGATA',
      'ZENIGATA_ROBOT',
      'GANG_SUPPRESSION_ROBOT',
      'MASS_PRODUCED_ZENIGATA_ROBOT',
      'FUJIKO'
    ]),
    strongestPublishedOpponent: 'FUJIKO',
    weakestPublishedOpponent: 'ZENIGATA',
    winEffect: 'NEXT_SET_AND_LUPIN_RUSH',
    lossEffect: 'LEAVE_ART_OR_REVENGE_CHANCE',
    exactOpponentSelectionRates: null,
    exactOpponentWinRates: null,
    note: 'Published slot guides agree on five opponents and on Zenigata being the danger pattern while Fujiko is the premium pattern. Exact slot-specific opponent percentages remain unresolved.'
  }),
  revengeChance: Object.freeze({
    primaryTrigger: 'CONTINUATION_BATTLE_LOSS_PULLBACK_WIN',
    secondaryPublishedTrigger: 'SOME_LUPIN_BONUS_FAILURES',
    publishedGames: 10,
    objective: 'GATHER_ALL_ALLIES',
    successEffect: 'LUPIN_BONUS_PULLBACK',
    pullbackLotteryBasis: 'TREASURE_POINTS_AT_BATTLE_LOSS',
    averagePullbackPercent: 5.6,
    publishedPullbackPercentByTreasure: Object.freeze({
      50000: 2.3,
      150000: 0.8,
      250000: 1.2,
      350000: 1.6,
      450000: 2.0,
      550000: 2.3,
      650000: 4.7,
      750000: 12.5,
      850000: 25.0,
      950000: 50.0
    }),
    unlistedTreasurePullbackPercent: null
  }),
  evidence: Object.freeze({
    battleCore: 'MULTI_SOURCE_MATCH',
    opponentCountAndExtremes: 'MULTI_SOURCE_MATCH',
    exactOpponentExpectationOrder: 'PUBLISHED_ANALYSIS',
    exactOpponentSelectionRates: 'UNRESOLVED',
    exactOpponentWinRates: 'UNRESOLVED',
    revengeChanceCore: 'MULTI_SOURCE_MATCH',
    revengeChanceGames: 'PUBLISHED_ANALYSIS',
    revengeChanceObjective: 'MULTI_SOURCE_MATCH',
    pullbackLotteryBasis: 'PUBLISHED_ANALYSIS',
    pullbackPercentTable: 'PUBLISHED_ANALYSIS'
  }),
  policy: Object.freeze({
    inferOpponentSelectionRates: false,
    inferOpponentWinRates: false,
    interpolateUnlistedPullbackRates: false
  })
});

export function getRevengePullbackPercent(treasurePoints) {
  if (!Number.isInteger(treasurePoints)) return null;
  return GT_CONTINUATION_SPEC.revengeChance.publishedPullbackPercentByTreasure[treasurePoints] ?? null;
}
