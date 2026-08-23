export const GT_SYSTEM_SPEC = Object.freeze({
  treasure: Object.freeze({
    maxPoints: 1000000,
    maxEffect: 'SET_CONTINUE_AND_EXTRA_BONUS',
    overflowCarryToNextSet: true,
    acquisitionLottery: Object.freeze({
      eligibleRoles: 'ALL_ROLES',
      stageDependent: true,
      publishedOverallHitRangeDenominator: Object.freeze({ min: 3.0, max: 16.9 }),
      note: 'Published analyses agree that all roles can participate in treasure acquisition; exact per-role award tables remain unresolved.'
    }),
    directAcquisitionTriggers: Object.freeze(['T_SYMBOL_ALIGNED', 'CHANCE_EYE']),
    tSymbols: Object.freeze(['SILVER', 'GOLD']),
    publishedMinimumAwards: Object.freeze({
      goldTSymbol: 300000,
      goldClassPresentation: 500000,
      flameLupinHold: 200000,
      fujikoHold: 300000,
      tamaChanHold: 1000000
    }),
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
  stageScenario: Object.freeze({
    selectionBySetting: Object.freeze({
      1: Object.freeze({ A:71.9, B:23.4, C:3.1, D:1.6 }),
      2: Object.freeze({ A:79.7, B:15.6, C:3.1, D:1.6 }),
      3: Object.freeze({ A:69.9, B:25.4, C:3.1, D:1.6 }),
      4: Object.freeze({ A:64.5, B:29.3, C:3.1, D:3.1 }),
      5: Object.freeze({ A:53.5, B:37.1, C:6.3, D:3.1 }),
      6: Object.freeze({ A:51.6, B:39.1, C:6.3, D:3.1 })
    }),
    internalStages: Object.freeze([
      'JAPAN_A','JAPAN_B','SWITZERLAND_A','SWITZERLAND_B',
      'CARIBBEAN_A','CARIBBEAN_B','UNDERGROUND_CITY_A','UNDERGROUND_CITY_B'
    ]),
    initialStageByScenario: Object.freeze({
      A: Object.freeze([62.5,12.5,12.5,6.3,1.6,1.6,1.6,1.6]),
      B: Object.freeze([46.9,18.8,18.8,9.4,1.6,1.6,1.6,1.6]),
      C: Object.freeze([29.7,18.8,18.8,18.8,9.4,1.6,1.6,1.6]),
      D: Object.freeze([12.5,18.8,18.8,18.8,18.8,9.4,1.6,1.6])
    }),
    upgradeEveryGames: 10,
    upgradeStepByScenario: Object.freeze({
      A: Object.freeze({ oneStep:75.0, twoSteps:25.0 }),
      B: Object.freeze({ oneStep:62.5, twoSteps:37.5 }),
      C: Object.freeze({ oneStep:50.0, twoSteps:50.0 }),
      D: Object.freeze({ oneStep:25.0, twoSteps:75.0 })
    }),
    stageResidenceWindowGames: 30,
    stageResidenceWindowEvidenceStatus: 'INFERRED_HIGH_CONFIDENCE',
    normalStageUpgradeCheckpoints: Object.freeze([10, 20]),
    finalStageCheckpointGame: 30,
    finalStageCheckpointTransition: 'IKUKAN_ONLY_IF_REACHED',
    finalStageCheckpointEvidenceStatus: 'PUBLISHED_ANALYSIS',
    visibleStageLagRuleRequired: false
  }),
  lupinRush: Object.freeze({
    timing: 'SET_START_AND_SOME_CONTINUATIONS',
    games: 4,
    patterns: Object.freeze(['WALTHER', 'SILHOUETTE', 'REVOLVER_VISION', 'ATTACK_VISION']),
    expectationOrder: Object.freeze(['WALTHER', 'SILHOUETTE', 'REVOLVER_VISION', 'ATTACK_VISION']),
    averageTreasurePoints: 342000,
    patternSelectionRates: Object.freeze({
      WALTHER: 63.0,
      SILHOUETTE: 31.0,
      REVOLVER_VISION: 5.0,
      ATTACK_VISION: 1.0
    }),
    attackVisionPublishedEffect: '1000000_TREASURE_EXPECTED_OR_CONFIRMED_BY_PRESENTATION_GUIDE',
    perPatternAwardDistribution: null
  }),
  treasureHunt: Object.freeze({
    exactOccurrenceTrigger: null,
    successProbability: null,
    guaranteedSuccessPresentations: Object.freeze({
      FLAME_LUPIN_HOLD: Object.freeze({ minTreasurePoints: 200000 }),
      FUJIKO_HOLD: Object.freeze({ minTreasurePoints: 300000 }),
      TAMA_CHAN_HOLD: Object.freeze({ minTreasurePoints: 1000000 })
    }),
    treasureRushRelationship: Object.freeze({
      status: 'CONFLICT',
      publishedClaims: Object.freeze([
        'SUCCESS_ENTERS_TREASURE_RUSH',
        'SUCCESS_GIVES_TREASURE_RUSH_CHANCE'
      ]),
      directEntryOnSuccess: null,
      entryProbabilityAfterSuccess: null
    })
  }),
  treasureRush: Object.freeze({
    triggerRelation: 'TREASURE_HUNT_SUCCESS_RELATED',
    games: Object.freeze({ min: 4, max: 9 }),
    averageTreasurePoints: 499000,
    perGameAwardTable: null
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
    trigger: 'SET_END_WITHOUT_STOCK',
    triggerEvidenceStatus: 'MULTI_SOURCE_MATCH',
    exactEntryGameNumber: null,
    exactEntryGameNumberStatus: 'UNRESOLVED',
    lotteryBasis: 'HELD_TREASURE_POINTS',
    successEffect: 'NEXT_SET_AND_LUPIN_RUSH',
    opponents: Object.freeze([
      'ZENIGATA',
      'ZENIGATA_ROBO',
      'LUPIN_GANG_ROBO',
      'MASS_PRODUCED_ZENIGATA_ROBO',
      'FUJIKO'
    ]),
    opponentExpectationOrder: Object.freeze([
      'ZENIGATA',
      'ZENIGATA_ROBO',
      'LUPIN_GANG_ROBO',
      'MASS_PRODUCED_ZENIGATA_ROBO',
      'FUJIKO'
    ]),
    opponentListEvidenceStatus: 'MULTI_SOURCE_MATCH',
    opponentDistribution: null,
    previousB4PresentationGamesCandidate: 4,
    previousB4PresentationStructureStatus: 'REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION',
    exactPerGameBattleFlow: null,
    note: 'Published analyses verify battle after set end when no stock remains, treasure-based continuation, the five-opponent expectation order, and LUPIN RUSH after victory. The exact entry game number, opponent distribution, and per-game battle sequence remain unresolved. The prior B4 4G presentation profile is retained as a same-machine reuse candidate only.'
  }),
  evidence: Object.freeze({
    treasureMaxAndExtraBonusRoute: 'MULTI_SOURCE_MATCH',
    treasureContinuationTable: 'MULTI_SOURCE_MATCH',
    treasureAllRoleLottery: 'MULTI_SOURCE_MATCH',
    treasurePublishedMinimumAwards: 'PUBLISHED_ANALYSIS',
    exactTreasureAwardTable: 'UNRESOLVED',
    stageTreasureHitRates: 'MULTI_SOURCE_MATCH',
    stageScenarioSelection: 'MULTI_SOURCE_MATCH',
    stageScenarioInitialStages: 'MULTI_SOURCE_MATCH',
    stageScenarioUpgradeRates: 'MULTI_SOURCE_MATCH',
    stageResidenceWindow: 'INFERRED_HIGH_CONFIDENCE',
    visibleStageLagRule: 'NOT_REQUIRED_BY_PUBLISHED_RESIDENCE_RECONCILIATION',
    stageThirtyGameCheckpoint: 'PUBLISHED_ANALYSIS',
    lupinRushProfile: 'MULTI_SOURCE_MATCH',
    lupinRushPatternExpectationOrder: 'MULTI_SOURCE_MATCH',
    lupinRushPatternSelectionRates: 'PUBLISHED_ANALYSIS',
    lupinRushPerPatternAwardDistribution: 'UNRESOLVED',
    treasureHuntGuaranteedSuccessPresentations: 'PUBLISHED_ANALYSIS',
    treasureHuntOccurrenceTrigger: 'UNRESOLVED',
    treasureHuntSuccessProbability: 'UNRESOLVED',
    treasureHuntToTreasureRushRoute: 'CONFLICT',
    treasureRushProfile: 'MULTI_SOURCE_MATCH',
    treasureRushPerGameAwardTable: 'UNRESOLVED',
    extraBonusCoreRoute: 'MULTI_SOURCE_MATCH',
    extraBonusExactRates: 'PUBLISHED_ANALYSIS',
    goldRushCoreRoute: 'MULTI_SOURCE_MATCH',
    goldRushExactContinuation: 'PUBLISHED_ANALYSIS',
    continuationBattleCore: 'MULTI_SOURCE_MATCH',
    continuationBattleSetEndTrigger: 'MULTI_SOURCE_MATCH',
    continuationBattleExactEntryGameNumber: 'UNRESOLVED',
    continuationBattleOpponentList: 'MULTI_SOURCE_MATCH',
    continuationBattleOpponentDistribution: 'UNRESOLVED',
    continuationBattlePreviousB4FourGamePresentation: 'REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION',
    continuationBattlePerGameFlow: 'UNRESOLVED'
  }),
  policy: Object.freeze({
    inferTreasurePointAwardAmounts: false,
    inferTreasureHuntOccurrenceTrigger: false,
    inferTreasureHuntSuccessProbability: false,
    inferTreasureRushEntryOnHuntSuccess: false,
    inferStageTransitionRates: false,
    inferRushPatternSelectionRates: false,
    inferRushPerPatternAwardsFromOverallAverage: false,
    inferContinuationBattlePerGameFlow: false,
    inferContinuationBattleEntryGameNumber: false,
    inferContinuationBattleOpponentDistribution: false,
    interpolateUnlistedContinuationPoints: false
  })
});

export function getTreasureContinuationExpectation(points) {
  if (!Number.isInteger(points)) return null;
  return GT_SYSTEM_SPEC.treasure.continuationExpectationByPoints[points] ?? null;
}
