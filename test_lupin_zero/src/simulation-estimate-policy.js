export const SIMULATION_ESTIMATE_POLICY = Object.freeze({
  allowedEvidenceStatus: 'SIMULATED_HIGH_CONFIDENCE',
  productionUseAllowedWhen: Object.freeze([
    'ALL_PUBLISHED_BOUNDARIES_SATISFIED',
    'SENSITIVITY_ACROSS_REASONABLE_MODELS_IS_SMALL',
    'NO_CONFLICT_WITH_PRIOR_B4_OR_OBSERVED_PLAY_DATA'
  ]),
  productionUseForbiddenWhen: Object.freeze([
    'MODEL_FAMILY_CHANGES_RESULT_MATERIALLY',
    'SOURCE_CONFLICT_CANNOT_BE_RESOLVED_BY_AVAILABLE_OBSERVATIONS',
    'AVERAGE_ONLY_REQUIRES_ARBITRARY_DISTRIBUTION_SHAPE'
  ]),
  preserveSourceValuesSeparately: true,
  neverRelabelPublishedAsSimulated: true,
  neverRelabelSimulatedAsPublished: true
});

export const EXTRA_BONUS_DURATION_SENSITIVITY = Object.freeze({
  publishedMinimumAddedGames: 15,
  publishedAverageAddedGames: 18.2,
  meanExcessAboveMinimum: 3.2,
  modelA: Object.freeze({
    key: 'MAX_ENTROPY_INTEGER_GAMES',
    assumption: 'Any integer added-game count >=15 is possible; only the mean is constrained.',
    pMinimum15: 0.2380952381,
    pAtMost20: 0.8043841111,
    pAtLeast25: 0.0659184337,
    medianAddedGames: 17,
    p90AddedGames: 23
  }),
  modelB: Object.freeze({
    key: 'MAX_ENTROPY_FIVE_GAME_STEPS',
    assumption: 'Added games occur only in 5G steps from 15G; only the mean is constrained.',
    pMinimum15: 0.6097560976,
    pAtMost20: 0.8477096966,
    pAtLeast25: 0.1522903034,
    medianAddedGames: 15,
    p90AddedGames: 25
  }),
  sensitivityAssessment: 'MATERIAL_MODEL_DEPENDENCE',
  productionDurationDistributionUseAllowed: false,
  evidenceStatus: 'SIMULATED_LOW_CONFIDENCE_REFERENCE_ONLY',
  note: 'Both neutral maximum-entropy models satisfy minimum 15G and average 18.2G, but their 15G probability and upper-tail behavior differ materially. More support constraints or observed samples are required before automatic production use.'
});
