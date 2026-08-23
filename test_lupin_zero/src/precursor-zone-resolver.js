import { ReuseEvidenceStatus } from './reuse-registry.js';

export const PRECURSOR_ZONE_SPEC = Object.freeze({
  rize: Object.freeze({
    label: 'RIZE ZONE',
    category: 'BONUS_OR_ART_PRECURSOR',
    expectationPercent: 45,
    stepUpIncreasesExpectation: true,
    trueRizeExists: true,
    trueRizeExactExpectationPercent: null,
    exactDurationGames: null,
    automaticEntryProbability: null,
    successDestination: 'LUPIN_BONUS_OR_GOLDEN_TIME',
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
  }),
  seven: Object.freeze({
    label: 'SEVEN ZONE',
    category: 'CONFIRMED_ART_PRECURSOR',
    expectationPercent: 100,
    confirmedDestination: 'GOLDEN_TIME',
    exactDurationGames: null,
    automaticEntryProbability: null,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
  })
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function resolveRizeZoneOutcome(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const hit = draw < PRECURSOR_ZONE_SPEC.rize.expectationPercent / 100;
  return Object.freeze({
    zone: 'RIZE_ZONE',
    draw,
    hit,
    expectationPercent: PRECURSOR_ZONE_SPEC.rize.expectationPercent,
    destination: hit ? PRECURSOR_ZONE_SPEC.rize.successDestination : null,
    evidenceStatus: PRECURSOR_ZONE_SPEC.rize.evidenceStatus,
    exactBonusVsArtSplitStatus: hit ? 'UNRESOLVED' : null
  });
}

export function resolveSevenZoneOutcome() {
  return Object.freeze({
    zone: 'SEVEN_ZONE',
    hit: true,
    expectationPercent: 100,
    destination: PRECURSOR_ZONE_SPEC.seven.confirmedDestination,
    evidenceStatus: PRECURSOR_ZONE_SPEC.seven.evidenceStatus
  });
}

export const PRECURSOR_ZONE_POLICY = Object.freeze({
  naturalEntryImplemented: false,
  rizeDurationInvented: false,
  trueRizeExpectationInvented: false,
  sevenDestinationVerified: true,
  noSyntheticEntryProbability: true
});
