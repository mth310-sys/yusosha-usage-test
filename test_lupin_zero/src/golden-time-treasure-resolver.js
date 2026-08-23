import { ReuseEvidenceStatus } from './reuse-registry.js';

export const GOLDEN_TIME_TREASURE_SPEC = Object.freeze({
  lotteryBasis: 'ALL_ROLES',
  publishedDenominatorRange: Object.freeze([3, 18]),
  publishedAverageDenominator: 10,
  productionDenominator: 10,
  productionAwardTreasure: 50000,
  treasureCap: 1000000,
  extraBonusTriggerTreasure: 1000000,
  productionEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
  exactStateTransitionRatesKnown: false,
  exactAwardDistributionKnown: false,
  replaceable: true
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function resolveGoldenTimeTreasureAcquisition(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const hit = draw < 1 / GOLDEN_TIME_TREASURE_SPEC.productionDenominator;
  return Object.freeze({
    hit,
    draw,
    denominator: GOLDEN_TIME_TREASURE_SPEC.productionDenominator,
    treasure: hit ? GOLDEN_TIME_TREASURE_SPEC.productionAwardTreasure : 0,
    lotteryBasis: GOLDEN_TIME_TREASURE_SPEC.lotteryBasis,
    evidenceStatus: GOLDEN_TIME_TREASURE_SPEC.productionEvidenceStatus,
    inference: 'Published analysis gives an internal-state range of about 1/3 to 1/18 and an overall average near 1/10, but not the exact state transition or award table. Production therefore uses the published average 1/10 and a replaceable 50,000T award step.',
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
