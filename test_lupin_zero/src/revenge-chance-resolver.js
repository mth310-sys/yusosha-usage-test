import { ReuseEvidenceStatus } from './reuse-registry.js';

export const REVENGE_CHANCE_SPEC = Object.freeze({
  games: 10,
  averagePullbackPercent: 5.6,
  destination: 'LUPIN_BONUS',
  publishedRatesByTreasure: Object.freeze({
    50000: 2.3,
    150000: 0.8,
    250000: 1.2,
    350000: 1.6,
    450000: 2.0,
    550000: 2.3,
    650000: 4.7,
    750000: 12.5,
    850000: 25.0,
    950000: 50.0
  }),
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') {
    throw new TypeError('randomSource.nextFloat() is required');
  }
}

export function getRevengePullbackPercent(treasure) {
  if (!Number.isInteger(treasure) || treasure < 0 || treasure >= 1000000) return null;
  const direct = REVENGE_CHANCE_SPEC.publishedRatesByTreasure[treasure];
  if (direct != null) {
    return Object.freeze({
      percent: direct,
      evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
      method: 'DIRECT_PUBLISHED_TABLE'
    });
  }

  // The published table exposes 100k-T-spaced points at 50k offsets.
  // ZERO's current replaceable GT treasure model can land on the midpoint
  // between those published points. Use straight midpoint interpolation only
  // for those exact 50k midpoints; never present it as a published value.
  const lower = Math.floor((treasure - 50000) / 100000) * 100000 + 50000;
  const upper = lower + 100000;
  const lowerRate = REVENGE_CHANCE_SPEC.publishedRatesByTreasure[lower];
  const upperRate = REVENGE_CHANCE_SPEC.publishedRatesByTreasure[upper];
  if (treasure === lower + 50000 && lowerRate != null && upperRate != null) {
    return Object.freeze({
      percent: (lowerRate + upperRate) / 2,
      evidenceStatus: ReuseEvidenceStatus.INFERRED_HIGH_CONFIDENCE,
      method: 'MIDPOINT_BETWEEN_ADJACENT_PUBLISHED_TREASURE_POINTS'
    });
  }
  return null;
}

export function resolveRevengePullback(randomSource, treasure) {
  requireRandomSource(randomSource);
  const rate = getRevengePullbackPercent(treasure);
  if (!rate) {
    return Object.freeze({
      eligible: false,
      hit: false,
      treasure,
      percent: null,
      destination: null,
      games: REVENGE_CHANCE_SPEC.games,
      evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
      method: 'NO_SUPPORTED_RATE_FOR_TREASURE'
    });
  }
  const draw = randomSource.nextFloat();
  return Object.freeze({
    eligible: true,
    hit: draw < rate.percent / 100,
    draw,
    treasure,
    percent: rate.percent,
    destination: rate.percent > 0 ? REVENGE_CHANCE_SPEC.destination : null,
    games: REVENGE_CHANCE_SPEC.games,
    evidenceStatus: rate.evidenceStatus,
    method: rate.method
  });
}
