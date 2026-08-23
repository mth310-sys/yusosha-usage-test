import { ReuseEvidenceStatus } from './reuse-registry.js';
import { VERIFIED_SPEC } from './verified-spec.js';

export const GT_CONTINUATION_BY_TREASURE = Object.freeze({
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
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function createGoldenTimeSetProfile() {
  return Object.freeze({
    games: VERIFIED_SPEC.modeProfiles.goldenTime.setGamesApprox,
    pureIncreaseCoinsPerGame: VERIFIED_SPEC.modeProfiles.goldenTime.pureIncreaseCoinsPerGame,
    betCoinsPerGame: 3,
    payoutCoinsPerGame: 5,
    initialTreasure: 350000,
    publishedInitialRushAverageTreasure: 342000,
    initialTreasureEvidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
    initialTreasureInference: 'LUPIN RUSH average is about 342,000T. Until the exact four-pattern award table is reconstructed, production starts at the nearest published battle-table step, 350,000T.',
    exactTreasureAcquisitionDuringSetImplemented: false,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    replaceable: true
  });
}

export function getGoldenTimeContinuationPercent(treasure) {
  if (!Number.isInteger(treasure) || treasure < 0) return null;
  if (treasure >= 1000000) return 100.0;
  const capped = Math.max(100000, Math.min(950000, treasure));
  const step = Math.floor(capped / 50000) * 50000;
  return GT_CONTINUATION_BY_TREASURE[step] ?? null;
}

export function resolveGoldenTimeContinuation(randomSource, treasure) {
  requireRandomSource(randomSource);
  const continuationPercent = getGoldenTimeContinuationPercent(treasure);
  if (continuationPercent == null) throw new RangeError('Unsupported treasure value');
  const draw = randomSource.nextFloat();
  const continued = continuationPercent >= 100 || draw < continuationPercent / 100;
  return Object.freeze({
    treasure,
    continuationPercent,
    draw,
    continued,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    sourceRelation: 'TREASURE_CONTINUATION_TABLE'
  });
}

export const GOLDEN_TIME_PRODUCTION_POLICY = Object.freeze({
  setGamesApproxUsedAs40Games: true,
  pureIncreaseModel: '3_BET_5_PAY',
  initialLupinRushExactAwardTableKnown: false,
  initialTreasureFallback: 350000,
  exactTreasureAcquisitionDuringSetImplemented: false,
  continuationTableUsedDirectly: true,
  oneMillionTreasureContinuationGuaranteed: true,
  extraBonusAtOneMillionImplemented: true,
  extraBonusOddAlignmentStockImplemented: true,
  goldRushEntryBoundaryImplemented: true,
  goldRushRuntimeImplemented: false,
  treasureRushAutomaticEntryImplemented: false
});
