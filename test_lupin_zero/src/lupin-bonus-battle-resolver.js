import { ReuseEvidenceStatus } from './reuse-registry.js';

export const LUPIN_BONUS_BATTLE_SPEC = Object.freeze({
  games: 5,
  opponent: 'ZENIGATA',
  successDestination: 'GOLDEN_TIME',
  overallArtExpectationPercent: 50,
  exactPerRoleLotteryKnown: false,
  exactPerGameWinRateKnown: false,
  earlyVictoryRouteVerified: false,
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
    result: revealed ? (state.artHit ? 'WIN' : 'LOSE') : null,
    destination: revealed && state.artHit ? LUPIN_BONUS_BATTLE_SPEC.successDestination : null
  });
}
