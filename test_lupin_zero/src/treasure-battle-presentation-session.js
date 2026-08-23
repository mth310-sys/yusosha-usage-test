import {
  TREASURE_BATTLE_REUSE_POLICY,
  getReusableTreasureBattlePresentationProfile,
  getReusableTreasureBattlePhase
} from './treasure-battle-reuse-adapter.js';

export const TREASURE_BATTLE_PRESENTATION_SESSION_POLICY = Object.freeze({
  sourceProfile: TREASURE_BATTLE_REUSE_POLICY.sourceModule,
  totalPhaseGamesCandidate: getReusableTreasureBattlePresentationProfile().totalGames,
  phaseAdvanceUnit: 'ONE_CONFIRMED_BATTLE_GAME',
  autoAdvanceByTimer: false,
  autoStartFromApproximateSetEnd: false,
  consumesNormalGtStageGame: false,
  resolvesOutcomeBeforeFinalPhase: false,
  exactBattleEntryTimingRequiredFromCaller: true,
  phaseMeaningReusedWithoutChanceUpLottery: true,
  evidenceStatus: TREASURE_BATTLE_REUSE_POLICY.presentationStructureStatus
});

export function createTreasureBattlePresentationSession(preparedResolution) {
  if (!preparedResolution || preparedResolution.eligible !== true || !['WIN', 'LOSE'].includes(preparedResolution.hiddenOutcome)) {
    return Object.freeze({
      accepted: false,
      reason: 'BATTLE_OUTCOME_NOT_RESOLVED',
      evidenceStatus: preparedResolution?.evidenceStatus ?? 'UNRESOLVED'
    });
  }

  let completedGames = 0;
  let completed = false;

  function snapshot() {
    const nextGame = completed ? null : completedGames + 1;
    const phase = nextGame == null ? null : getReusableTreasureBattlePhase(nextGame);
    return Object.freeze({
      accepted: true,
      active: !completed,
      completed,
      completedGames,
      nextGame,
      nextPhase: phase?.key ?? null,
      nextPhaseNote: phase?.note ?? null,
      hiddenOutcome: completed ? null : 'HIDDEN',
      revealedOutcome: completed ? preparedResolution.hiddenOutcome : null,
      continuation: completed ? preparedResolution.continuation : null,
      totalGamesCandidate: TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.totalPhaseGamesCandidate,
      evidenceStatus: TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.evidenceStatus
    });
  }

  function advanceConfirmedBattleGame() {
    if (completed) return snapshot();
    const game = completedGames + 1;
    const phase = getReusableTreasureBattlePhase(game);
    if (!phase) {
      return Object.freeze({
        ...snapshot(),
        accepted: false,
        reason: 'NO_REUSABLE_PRESENTATION_PHASE_FOR_GAME'
      });
    }

    completedGames = game;
    if (completedGames >= TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.totalPhaseGamesCandidate) completed = true;

    const state = snapshot();
    return Object.freeze({
      ...state,
      justCompletedGame: game,
      justCompletedPhase: phase.key,
      justCompletedPhaseNote: phase.note ?? null,
      outcomeRevealedNow: completed,
      revealedOutcome: completed ? preparedResolution.hiddenOutcome : null,
      continuation: completed ? preparedResolution.continuation : null
    });
  }

  return Object.freeze({
    accepted: true,
    snapshot,
    advanceConfirmedBattleGame
  });
}
