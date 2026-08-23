import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { prepareTreasureBattleResolution } from '../test_lupin_zero/src/treasure-battle-resolution-adapter.js';
import {
  TREASURE_BATTLE_PRESENTATION_SESSION_POLICY,
  createTreasureBattlePresentationSession
} from '../test_lupin_zero/src/treasure-battle-presentation-session.js';

test('Treasure Battle presentation advances only one reused phase per confirmed battle game', () => {
  const prepared = prepareTreasureBattleResolution(new SequenceRandomSource([0]), 350000);
  const session = createTreasureBattlePresentationSession(prepared);

  expect(session.accepted).toBe(true);
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.autoAdvanceByTimer).toBe(false);
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.autoStartFromApproximateSetEnd).toBe(false);
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.phaseMeaningReusedWithoutChanceUpLottery).toBe(true);
  expect(session.snapshot().nextPhase).toBe('FIRST_ATTACK');
  expect(session.snapshot().nextPhaseNote).toContain('ルパン先制');
  expect(session.snapshot().hiddenOutcome).toBe('HIDDEN');
  expect(session.snapshot().revealedOutcome).toBeNull();

  const g1 = session.advanceConfirmedBattleGame();
  expect(g1.justCompletedPhase).toBe('FIRST_ATTACK');
  expect(g1.justCompletedPhaseNote).toContain('勝利確定');
  expect(g1.outcomeRevealedNow).toBe(false);
  expect(g1.revealedOutcome).toBeNull();

  const g2 = session.advanceConfirmedBattleGame();
  expect(g2.justCompletedPhase).toBe('CHANCE_DISPLAY');
  expect(g2.justCompletedPhaseNote).toContain('CHANCE表示');
  expect(g2.outcomeRevealedNow).toBe(false);

  const g3 = session.advanceConfirmedBattleGame();
  expect(g3.justCompletedPhase).toBe('CUT_IN');
  expect(g3.justCompletedPhaseNote).toContain('青＜緑＜赤');
  expect(g3.outcomeRevealedNow).toBe(false);

  const g4 = session.advanceConfirmedBattleGame();
  expect(g4.justCompletedPhase).toBe('STAND_UP');
  expect(g4.justCompletedPhaseNote).toContain('勝敗を開示');
  expect(g4.completed).toBe(true);
  expect(g4.outcomeRevealedNow).toBe(true);
  expect(g4.revealedOutcome).toBe('WIN');
  expect(g4.continuation.continued).toBe(true);
});

test('unresolved Treasure Battle result cannot create a presentation session', () => {
  const prepared = prepareTreasureBattleResolution(new SequenceRandomSource([]), 425000);
  expect(prepared.eligible).toBe(false);
  const session = createTreasureBattlePresentationSession(prepared);
  expect(session.accepted).toBe(false);
  expect(session.reason).toBe('BATTLE_OUTCOME_NOT_RESOLVED');
});

test('presentation session does not invent battle entry timing or timer pacing', () => {
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.exactBattleEntryTimingRequiredFromCaller).toBe(true);
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.phaseAdvanceUnit).toBe('ONE_CONFIRMED_BATTLE_GAME');
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.consumesNormalGtStageGame).toBe(false);
  expect(TREASURE_BATTLE_PRESENTATION_SESSION_POLICY.resolvesOutcomeBeforeFinalPhase).toBe(false);
});
