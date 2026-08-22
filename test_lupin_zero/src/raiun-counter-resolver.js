import { ReuseEvidenceStatus } from './reuse-registry.js';
import { RAIUN_MODE_SPEC } from './raiun-mode-spec.js';

const HIT_DENOMINATOR = (RAIUN_MODE_SPEC.raiunCounter.acquisition.publishedHitDenominatorRange[0]
  + RAIUN_MODE_SPEC.raiunCounter.acquisition.publishedHitDenominatorRange[1]) / 2;

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function resolveInitialRaiunPoints(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const points = draw < 0.4 ? 22 : 23;
  return Object.freeze({
    points,
    draw,
    publishedAverage: RAIUN_MODE_SPEC.raiunCounter.initialPoints.average,
    evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    inference: 'Exact initial distribution is unpublished. 22pt at 40% and 23pt at 60% is the minimum two-value integer model whose mean is exactly the published 22.6pt.',
    replaceable: true
  });
}

export function resolveRaiunPointAcquisition(randomSource) {
  requireRandomSource(randomSource);
  const hitDraw = randomSource.nextFloat();
  const hit = hitDraw < 1 / HIT_DENOMINATOR;
  if (!hit) {
    return Object.freeze({
      hit: false,
      points: 0,
      hitDraw,
      hitDenominator: HIT_DENOMINATOR,
      publishedHitDenominatorRange: RAIUN_MODE_SPEC.raiunCounter.acquisition.publishedHitDenominatorRange,
      evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
      replaceable: true
    });
  }

  const awardDraw = randomSource.nextFloat();
  const points = awardDraw < 0.7 ? 3 : 4;
  return Object.freeze({
    hit: true,
    points,
    hitDraw,
    awardDraw,
    hitDenominator: HIT_DENOMINATOR,
    publishedAveragePointsOnHit: RAIUN_MODE_SPEC.raiunCounter.acquisition.averagePointsOnHit,
    evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    inference: 'The midpoint 1/7.05 preserves the published 1/7.0–1/7.1 range. Exact award table is unpublished; 3pt at 70% and 4pt at 30% is the minimum two-value integer model whose mean is exactly 3.3pt.',
    replaceable: true
  });
}

export const RAIUN_COUNTER_PRODUCTION_POLICY = Object.freeze({
  targetPoints: RAIUN_MODE_SPEC.raiunCounter.maxPoints,
  publishedInitialAverageUsed: RAIUN_MODE_SPEC.raiunCounter.initialPoints.average,
  inferredInitialDistribution: Object.freeze({ 22: 40, 23: 60 }),
  publishedHitDenominatorRangeUsed: RAIUN_MODE_SPEC.raiunCounter.acquisition.publishedHitDenominatorRange,
  inferredHitDenominator: HIT_DENOMINATOR,
  publishedAveragePointsOnHitUsed: RAIUN_MODE_SPEC.raiunCounter.acquisition.averagePointsOnHit,
  inferredAwardDistribution: Object.freeze({ 3: 70, 4: 30 }),
  evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  mayPromoteToVerifiedAutomatically: false,
  replaceable: true
});
