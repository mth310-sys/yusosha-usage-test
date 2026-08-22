export const RAIUN_MODE_SPEC = Object.freeze({
  raiunHigh: Object.freeze({
    entryTrigger: 'RAIUN_COUNTER_REACHES_100',
    games: 7,
    states: Object.freeze({
      LOW: Object.freeze({ raiunModeHitDenominator: 30.5, expectationPercent: 20.0 }),
      HIGH: Object.freeze({ raiunModeHitDenominator: 13.3, expectationPercent: 40.0 })
    }),
    successPresentation: 'EVEN_LCD_SYMBOL_ALIGNED'
  }),
  raiunMode: Object.freeze({
    role: 'PSEUDO_REG_BONUS',
    entryPresentation: 'EVEN_LCD_SYMBOL_ALIGNED',
    games: 20,
    netIncreasePerGame: 2.0,
    artExpectationPercent: 23.0,
    artSuccessPresentation: 'LCD_7_ALIGNED',
    exactPerRoleArtLottery: null,
    gameCeilingCounterResetsOnEntry: false
  }),
  shinRaiunMode: Object.freeze({
    entryRoutes: Object.freeze([
      Object.freeze({
        trigger: 'RAIUN_MODE_SELECTED',
        selectionPercent: 0.8
      }),
      Object.freeze({
        trigger: 'GAME_CEILING_REACHED_DURING_RAIUN_MODE',
        selectionPercent: 100.0
      })
    ]),
    durationRule: 'CONTINUES_UNTIL_ART_HIT',
    artGuaranteedEventually: true,
    legendGateRelationship: Object.freeze({
      status: 'CONFLICT',
      publishedClaims: Object.freeze([
        'LEGEND_GATE_GUARANTEED_ON_SHIN_RAIUN_ENTRY',
        'LEGEND_GATE_ENTRY_RATE_DURING_SHIN_RAIUN_IS_1_OVER_88_9'
      ]),
      guaranteedOnEntry: null,
      duringModeHitDenominator: 88.9
    }),
    exactArtLotteryPerGame: null
  }),
  evidence: Object.freeze({
    raiunHighCore: 'MULTI_SOURCE_MATCH',
    raiunHighExactRates: 'MULTI_SOURCE_MATCH',
    raiunModeCore: 'MULTI_SOURCE_MATCH',
    raiunModeArtExpectation: 'MULTI_SOURCE_MATCH',
    raiunModeExactPerRoleArtLottery: 'UNRESOLVED',
    raiunModeCeilingCounterPersistence: 'MULTI_SOURCE_MATCH',
    shinRaiunEntryRoutes: 'MULTI_SOURCE_MATCH',
    shinRaiunSelectionPercent: 'MULTI_SOURCE_MATCH',
    shinRaiunDurationRule: 'MULTI_SOURCE_MATCH',
    shinRaiunLegendGateRelationship: 'CONFLICT',
    shinRaiunExactArtLotteryPerGame: 'UNRESOLVED'
  }),
  policy: Object.freeze({
    inferRaiunPerRoleArtLotteryFromOverallExpectation: false,
    inferShinRaiunArtLotteryFromLegendGateRate: false,
    resolveLegendGateConflictByGuessing: false
  })
});
