import { ReuseEvidenceStatus } from './reuse-registry.js';

export const LUPIN_BONUS_SPEC = Object.freeze({
  totalGames: 35,
  bodyGames: 30,
  finalBattleGames: 5,
  betCoinsPerGame: 3,
  payoutCoinsPerGame: 5,
  pureIncreaseCoinsPerGame: 2,
  artExpectationPercent: 50,
  episodeCount: 11,
  finalBattleOpponent: 'ZENIGATA',
  successDestination: 'GOLDEN_TIME',
  failureMayRouteToRevengeChance: true,
  failureRevengeEntryRate: null,
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

function requireRandomSource(randomSource) {
  if (!randomSource || typeof randomSource.nextFloat !== 'function') throw new TypeError('randomSource.nextFloat() is required');
}

export function createLupinBonusProfile() {
  return Object.freeze({ ...LUPIN_BONUS_SPEC });
}

export function resolveLupinBonusOutcome(randomSource) {
  requireRandomSource(randomSource);
  const draw = randomSource.nextFloat();
  const artHit = draw < (LUPIN_BONUS_SPEC.artExpectationPercent / 100);
  return Object.freeze({
    draw,
    artHit,
    artExpectationPercent: LUPIN_BONUS_SPEC.artExpectationPercent,
    revealTiming: 'FINAL_ZENIGATA_BATTLE_UNLESS_VERIFIED_EARLY_WIN_ROUTE',
    successDestination: artHit ? LUPIN_BONUS_SPEC.successDestination : null,
    evidenceStatus: 'CALIBRATED_TO_PUBLISHED_50_PERCENT',
    exactPerRoleLotteryStatus: 'UNRESOLVED'
  });
}
