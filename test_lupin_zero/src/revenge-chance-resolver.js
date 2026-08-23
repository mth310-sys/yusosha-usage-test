import { ReuseEvidenceStatus } from './reuse-registry.js';

export const REVENGE_CHANCE_SPEC = Object.freeze({
  games: 10,
  averagePullbackPercent: 5.6,
  gtBattlePullbackLotteryTiming: 'TREASURE_BATTLE_LOSS',
  gtBattleRevengeChanceRole: 'PULLBACK_WIN_PRESENTATION_AFTER_LOTTERY_HIT',
  rerollGtBattlePullbackInsideRevengeChance: false,
  successDestinations: Object.freeze(['LUPIN_BONUS', 'GOLDEN_TIME']),
  successDestinationSplit: null,
  automaticSuccessDestination: null,
  bonusEndEntryDenominator: 25,
  bonusEndHitExpectationPercent: 39,
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

export function resolveBonusEndRevengeEntry(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const hit = draw < 1 / REVENGE_CHANCE_SPEC.bonusEndEntryDenominator;
  return Object.freeze({
    hit,
    draw,
    denominator: REVENGE_CHANCE_SPEC.bonusEndEntryDenominator,
    games: REVENGE_CHANCE_SPEC.games,
    source: 'LUPIN_BONUS_END',
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
  });
}

export function resolveBonusEndRevengeOutcome(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const hit = draw < REVENGE_CHANCE_SPEC.bonusEndHitExpectationPercent / 100;
  return Object.freeze({
    hit,
    draw,
    percent: REVENGE_CHANCE_SPEC.bonusEndHitExpectationPercent,
    destination: null,
    destinationCandidates: hit ? REVENGE_CHANCE_SPEC.successDestinations : Object.freeze([]),
    destinationSplit: REVENGE_CHANCE_SPEC.successDestinationSplit,
    source: 'LUPIN_BONUS_END',
    evidenceStatus: hit ? ReuseEvidenceStatus.UNRESOLVED : ReuseEvidenceStatus.PUBLISHED_ANALYSIS
  });
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
      destinationCandidates: Object.freeze([]),
      games: REVENGE_CHANCE_SPEC.games,
      evidenceStatus: ReuseEvidenceStatus.UNRESOLVED,
      method: 'NO_SUPPORTED_RATE_FOR_TREASURE'
    });
  }
  const draw = randomSource.nextFloat();
  const hit = draw < rate.percent / 100;
  return Object.freeze({
    eligible: true,
    hit,
    draw,
    treasure,
    percent: rate.percent,
    destination: null,
    destinationCandidates: hit ? REVENGE_CHANCE_SPEC.successDestinations : Object.freeze([]),
    destinationSplit: REVENGE_CHANCE_SPEC.successDestinationSplit,
    games: REVENGE_CHANCE_SPEC.games,
    evidenceStatus: hit ? ReuseEvidenceStatus.UNRESOLVED : rate.evidenceStatus,
    method: rate.method
  });
}
