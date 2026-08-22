export const PERFORMANCE_SPEC = Object.freeze({
  publishedInitialHitDenominatorBySetting: Object.freeze({
    1: 350.6,
    2: 335.4,
    3: 347.9,
    4: 304.2,
    5: 330.0,
    6: 282.0
  }),
  payoutPercentBySetting: Object.freeze({
    1: 96.6,
    2: 97.6,
    3: 100.4,
    4: 102.4,
    5: 105.4,
    6: 110.8
  }),
  initialHitSemantic: Object.freeze({
    status: 'CONFLICT',
    publishedClaims: Object.freeze([
      'GOLDEN_TIME_INITIAL_HIT',
      'ART_LUPIN_BONUS_RAIUN_COMBINED_INITIAL_HIT'
    ]),
    canonicalRouteProbabilityMeaning: null,
    note: 'The denominator table itself matches across published guides, but the label/denominator semantics conflict. Do not derive individual route frequencies from this table.'
  }),
  consistencyAudit: Object.freeze({
    initialHitDistributionSumsTo100BySetting: true,
    ceilingDistributionSumsTo100BySetting: true,
    payoutTableStrictlyIncreasesWithSetting: true,
    initialHitDenominatorMonotonicBySetting: false,
    routeFrequencyDerivationAllowed: false,
    reasons: Object.freeze([
      'Initial-hit denominator semantics conflict across published sources.',
      'WANTED CHANCE, Raiun Mode, LUPIN BONUS and direct GOLDEN TIME routes overlap in published high-level descriptions.',
      'Several internal per-role and per-state lotteries remain unresolved.'
    ])
  }),
  evidence: Object.freeze({
    initialHitDenominatorValues: 'MULTI_SOURCE_MATCH',
    payoutPercentages: 'MULTI_SOURCE_MATCH',
    initialHitSemantic: 'CONFLICT'
  }),
  policy: Object.freeze({
    deriveRouteFrequenciesFromInitialHitDenominator: false,
    normalizeConflictingInitialHitLabels: false,
    inferMissingInternalLotteriesFromPayout: false,
    tuneUnresolvedProbabilitiesToMatchMachinePayout: false
  })
});

export function getPublishedInitialHitDenominator(setting) {
  return PERFORMANCE_SPEC.publishedInitialHitDenominatorBySetting[setting] ?? null;
}

export function getPublishedPayoutPercent(setting) {
  return PERFORMANCE_SPEC.payoutPercentBySetting[setting] ?? null;
}
