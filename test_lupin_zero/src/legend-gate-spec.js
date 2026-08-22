export const LEGEND_GATE_SPEC = Object.freeze({
  mode: 'LEGEND_GATE',
  role: 'PREMIUM_ART_SET_STOCK_ZONE',
  entry: Object.freeze({
    trigger: 'LONG_FREEZE',
    outsideShinRaiunDenominatorBySetting: Object.freeze({
      1: 27127.0,
      2: 27127.0,
      3: 27127.0,
      4: 27127.0,
      5: 14840.9,
      6: 12100.7
    }),
    shinRaiunPublishedDenominator: 88.9,
    shinRaiunRelationshipStatus: 'CONFLICT',
    shinRaiunPublishedClaims: Object.freeze([
      'LEGEND_GATE_ENTRY_RATE_1_IN_88_9_DURING_SHIN_RAIUN',
      'SHIN_RAIUN_ENTRY_GUARANTEES_LEGEND_GATE'
    ])
  }),
  story: Object.freeze({
    format: 'PACHISLOT_ORIGINAL_STORY',
    successReward: 'SEVEN_MEDAL',
    exactSuccessMechanics: null
  }),
  sevenMedal: Object.freeze({
    maxPublishedCount: 3,
    minimumGoldenTimeStocksByCount: Object.freeze({
      1: 2,
      2: 5,
      3: 6
    }),
    publishedExpectedGoldenTimeSetsByCount: Object.freeze({
      1: Object.freeze({ min: 10.7, max: 12.1 }),
      2: Object.freeze({ min: 15.3, max: 16.8 }),
      3: Object.freeze({ min: 16.7, max: 18.4 })
    }),
    exactAdditionalStockDistribution: null,
    medalAcquisitionDistribution: null
  }),
  evidence: Object.freeze({
    coreRoleAndFreezeEntry: 'MULTI_SOURCE_MATCH',
    minimumStocksByMedalCount: 'MULTI_SOURCE_MATCH',
    outsideShinRaiunEntryDenominators: 'PUBLISHED_ANALYSIS',
    shinRaiunEntryDenominator: 'PUBLISHED_ANALYSIS',
    shinRaiunRelationship: 'CONFLICT',
    expectedSetsByMedalCount: 'PUBLISHED_ANALYSIS',
    exactSuccessMechanics: 'UNRESOLVED',
    exactAdditionalStockDistribution: 'UNRESOLVED',
    medalAcquisitionDistribution: 'UNRESOLVED'
  }),
  policy: Object.freeze({
    inferAdditionalStocksAboveMinimum: false,
    inferMedalAcquisitionDistribution: false,
    inferStorySuccessProbability: false,
    resolveShinRaiunConflictByGuessing: false
  })
});

export function getLegendGateEntryDenominator(setting, { shinRaiun = false } = {}) {
  if (shinRaiun) return LEGEND_GATE_SPEC.entry.shinRaiunPublishedDenominator;
  return LEGEND_GATE_SPEC.entry.outsideShinRaiunDenominatorBySetting[setting] ?? null;
}

export function getLegendGateMinimumStocks(sevenMedals) {
  return LEGEND_GATE_SPEC.sevenMedal.minimumGoldenTimeStocksByCount[sevenMedals] ?? null;
}

export function getLegendGateExpectedSetRange(sevenMedals) {
  return LEGEND_GATE_SPEC.sevenMedal.publishedExpectedGoldenTimeSetsByCount[sevenMedals] ?? null;
}
