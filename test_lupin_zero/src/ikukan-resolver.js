import { ReuseEvidenceStatus } from './reuse-registry.js';

export const IKUKAN_SPEC = Object.freeze({
  games: 10,
  treasureHitDenominator: 1.0,
  publishedAverageTreasure: 702000,
  roundedPublishedAverageTreasure: 700000,
  minimumTreasurePerGame: 50000,
  exactAwardDistributionKnown: false,
  productionModel: Object.freeze({
    fiftyThousandPercent: 59.6,
    oneHundredThousandPercent: 40.4,
    averagePerGame: 70200,
    expectedTenGameTotal: 702000,
    evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    replaceable: true
  })
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function resolveIkukanAward(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const treasure = draw < IKUKAN_SPEC.productionModel.fiftyThousandPercent / 100 ? 50000 : 100000;
  return Object.freeze({
    hit: true,
    draw,
    denominator: 1.0,
    treasure,
    evidenceStatus: IKUKAN_SPEC.productionModel.evidenceStatus,
    inference: 'Published analysis confirms 10G, treasure every game and about 702,000T average, but the exact per-game table is unresolved. Production uses a replaceable 50k/100k two-point mix calibrated to 70.2k per game.',
    replaceable: true
  });
}
