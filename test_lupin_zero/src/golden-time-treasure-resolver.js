import { ReuseEvidenceStatus } from './reuse-registry.js';

export const GOLDEN_TIME_TREASURE_SPEC = Object.freeze({
  lotteryBasis: 'ALL_ROLES',
  publishedDenominatorRange: Object.freeze([3, 16.9]),
  publishedAverageDenominator: 10,
  productionDenominator: 10,
  productionAwardTreasure: 50000,
  treasureCap: 1000000,
  extraBonusTriggerTreasure: 1000000,
  productionEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  stageHitRatesEvidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
  exactStateTransitionRatesKnown: true,
  exactAwardDistributionKnown: false,
  replaceable: true
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function resolveGoldenTimeTreasureAcquisition(randomSource, denominator = GOLDEN_TIME_TREASURE_SPEC.productionDenominator) {
  requireRandomSource(randomSource);
  if (!Number.isFinite(denominator) || denominator <= 0) throw new RangeError('denominator must be positive');
  const draw = randomSource.nextFloat();
  const hit = draw < 1 / denominator;
  return Object.freeze({
    hit,
    draw,
    denominator,
    treasure: hit ? GOLDEN_TIME_TREASURE_SPEC.productionAwardTreasure : 0,
    lotteryBasis: GOLDEN_TIME_TREASURE_SPEC.lotteryBasis,
    hitRateEvidenceStatus: denominator === GOLDEN_TIME_TREASURE_SPEC.productionDenominator
      ? ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE
      : ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    evidenceStatus: GOLDEN_TIME_TREASURE_SPEC.productionEvidenceStatus,
    inference: 'Treasure hit probability may use the published GT stage denominator. The exact award table remains unresolved, so a replaceable 50,000T award step is still used after a hit.',
    replaceable: true
  });
}

export function applyGoldenTimeTreasure(currentTreasure, acquisition) {
  if (!Number.isInteger(currentTreasure) || currentTreasure < 0) throw new RangeError('currentTreasure must be a non-negative integer');
  if (!acquisition || !Number.isInteger(acquisition.treasure) || acquisition.treasure < 0) throw new TypeError('valid acquisition is required');
  const nextTreasure = Math.min(GOLDEN_TIME_TREASURE_SPEC.treasureCap, currentTreasure + acquisition.treasure);
  return Object.freeze({
    from: currentTreasure,
    added: nextTreasure - currentTreasure,
    to: nextTreasure,
    extraBonusReached: nextTreasure >= GOLDEN_TIME_TREASURE_SPEC.extraBonusTriggerTreasure,
    evidenceStatus: acquisition.evidenceStatus,
    replaceable: true
  });
}
