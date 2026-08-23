import { ART_RETURN_PROFILE as PREVIOUS_B4_ART_RETURN_PROFILE } from '../../test_lupin_b4/js/art-return-profile.js';
import { ReuseEvidenceStatus } from './reuse-registry.js';

const PUBLISHED_PULLBACK_RATES = Object.freeze({
  // 5万 row is retained from the current published 1geki-side analysis.
  // 10万 and later exact rows are reused from the prior B4 HAZUSE profile.
  50000: 2.3,
  ...PREVIOUS_B4_ART_RETURN_PROFILE.rates
});

export const REVENGE_CHANCE_SPEC = Object.freeze({
  games: 10,
  averagePullbackPercent: 5.6,
  gtBattlePullbackLotteryTiming: 'TREASURE_BATTLE_LOSS',
  gtBattleRevengeChanceRole: 'PULLBACK_WIN_PRESENTATION_AFTER_LOTTERY_HIT',
  rerollGtBattlePullbackInsideRevengeChance: false,
  successDestinations: Object.freeze(['LUPIN_BONUS', 'GOLDEN_TIME']),
  successDestinationSplit: null,
  automaticSuccessDestination: null,
  characterCollectionDestination: 'LUPIN_BONUS',
  characterCollectionDestinationEvidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
  directGoldenTimeRouteExists: true,
  directGoldenTimeRouteTrigger: null,
  directGoldenTimeRoutePercent: null,
  directGoldenTimeRouteEvidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
  bonusEndEntryDenominator: 25,
  bonusEndHitExpectationPercent: 39,
  publishedRatesByTreasure: PUBLISHED_PULLBACK_RATES,
  pullbackRateSources: Object.freeze({
    50000: 'ICHIGEKI_PUBLISHED_ROW',
    priorB4ExactTable: PREVIOUS_B4_ART_RETURN_PROFILE.source,
    conflictPolicy: PREVIOUS_B4_ART_RETURN_PROFILE.sourceNotes.conflictPolicy,
    unsupportedPolicy: PREVIOUS_B4_ART_RETURN_PROFILE.unsupportedPolicy
  }),
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

export function resolveKnownRevengeDestination(mechanism) {
  if (mechanism === 'COLLECT_FOUR_CHARACTERS') {
    return Object.freeze({
      resolved: true,
      destination: REVENGE_CHANCE_SPEC.characterCollectionDestination,
      mechanism,
      evidenceStatus: REVENGE_CHANCE_SPEC.characterCollectionDestinationEvidenceStatus
    });
  }
  if (mechanism === 'DIRECT_GOLDEN_TIME') {
    return Object.freeze({
      resolved: true,
      destination: 'GOLDEN_TIME',
      mechanism,
      evidenceStatus: REVENGE_CHANCE_SPEC.directGoldenTimeRouteEvidenceStatus
    });
  }
  return Object.freeze({
    resolved: false,
    destination: null,
    mechanism: mechanism ?? null,
    destinationCandidates: REVENGE_CHANCE_SPEC.successDestinations,
    evidenceStatus: ReuseEvidenceStatus.UNRESOLVED
  });
}

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
  if (direct == null) return null;
  return Object.freeze({
    percent: direct,
    evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS,
    method: 'DIRECT_PUBLISHED_TABLE',
    source: treasure === 50000 ? REVENGE_CHANCE_SPEC.pullbackRateSources[50000] : REVENGE_CHANCE_SPEC.pullbackRateSources.priorB4ExactTable
  });
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
    method: rate.method,
    rateSource: rate.source
  });
}
