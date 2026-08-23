import { ReuseEvidenceStatus } from './reuse-registry.js';

export const LUPIN_BONUS_BATTLE_SPEC = Object.freeze({
  games: 5,
  opponent: 'ZENIGATA',
  successDestination: 'GOLDEN_TIME',
  overallArtExpectationPercent: 50,
  exactPerRoleLotteryKnown: false,
  exactPerGameWinRateKnown: false,
  earlyVictoryRouteVerified: false,
  verifiedBattleStructure: 'ZENIGATA_ATTACK_POINTS_AND_AVOIDANCE',
  exactAttackPatternSelectionKnown: false,
  exactAvoidanceRatePerPointKnown: false,
  intermediateAvoidanceDoesNotChangeHiddenOutcome: true,
  resultSource: 'PREDETERMINED_LUPIN_BONUS_OUTCOME',
  evidenceStatus: ReuseEvidenceStatus.PUBLISHED_ANALYSIS
});

export function createLupinBonusBattleState(hiddenOutcome) {
  if (!hiddenOutcome || typeof hiddenOutcome.artHit !== 'boolean') throw new TypeError('hiddenOutcome is required');
  return Object.freeze({
    totalGames: LUPIN_BONUS_BATTLE_SPEC.games,
    gamesRemaining: LUPIN_BONUS_BATTLE_SPEC.games,
    step: 0,
    artHit: hiddenOutcome.artHit,
    revealed: false,
    phase: 'ZENIGATA_ATTACK_POINT',
    evidenceStatus: LUPIN_BONUS_BATTLE_SPEC.evidenceStatus
  });
}

export function advanceLupinBonusBattle(state) {
  if (!state || !Number.isInteger(state.gamesRemaining) || state.gamesRemaining <= 0) throw new RangeError('active battle state required');
  const gamesRemaining = state.gamesRemaining - 1;
  const step = state.step + 1;
  const revealed = gamesRemaining === 0;
  return Object.freeze({
    ...state,
    gamesRemaining,
    step,
    revealed,
    phase: revealed ? 'FINAL_RESULT' : 'ZENIGATA_ATTACK_POINT',
    presentationCue: revealed ? (state.artHit ? 'ZENIGATA_BATTLE_WIN' : 'ZENIGATA_BATTLE_LOSE') : 'ZENIGATA_ATTACK_AVOIDANCE_CHANCE',
    avoidanceResolved: revealed ? state.artHit : null,
    result: revealed ? (state.artHit ? 'WIN' : 'LOSE') : null,
    destination: revealed && state.artHit ? LUPIN_BONUS_BATTLE_SPEC.successDestination : null
  });
}
