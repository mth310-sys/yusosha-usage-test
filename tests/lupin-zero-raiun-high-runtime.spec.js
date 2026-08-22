import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { resolveRaiunHighGame, RAIUN_HIGH_RANK, RAIUN_HIGH_POLICY } from '../test_lupin_zero/src/raiun-high-resolver.js';
import { createMachineState, reduceMachine, KernelPhase } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

function enterRaiunHigh(rank = RAIUN_HIGH_RANK.LOW) {
  let state = createMachineState();
  if (rank === RAIUN_HIGH_RANK.HIGH) {
    state = reduceMachine(state, { type: 'SET_RAIUN_HIGH_RANK', rank, evidenceStatus: 'PUBLISHED_ANALYSIS' }).state;
  }
  return reduceMachine(state, { type: 'SET_RAIUN_POINTS', points: 100, evidenceStatus: 'PUBLISHED_ANALYSIS' }).state;
}

test('LOW and HIGH use published per-game Raiun-mode denominators directly', () => {
  const lowHit = resolveRaiunHighGame(new SequenceRandomSource([0.01]), RAIUN_HIGH_RANK.LOW);
  const lowMiss = resolveRaiunHighGame(new SequenceRandomSource([0.1]), RAIUN_HIGH_RANK.LOW);
  const highHit = resolveRaiunHighGame(new SequenceRandomSource([0.05]), RAIUN_HIGH_RANK.HIGH);
  const highMiss = resolveRaiunHighGame(new SequenceRandomSource([0.1]), RAIUN_HIGH_RANK.HIGH);

  expect(lowHit.hitDenominator).toBe(30.5);
  expect(lowHit.hit).toBe(true);
  expect(lowMiss.hit).toBe(false);
  expect(highHit.hitDenominator).toBe(13.3);
  expect(highHit.hit).toBe(true);
  expect(highMiss.hit).toBe(false);
  expect(RAIUN_HIGH_POLICY.exactRatesInvented).toBe(false);
});

test('seven LOW misses exhaust Raiun high without inventing a red-counter upgrade', () => {
  let state = enterRaiunHigh(RAIUN_HIGH_RANK.LOW);
  expect(state.raiunHighGamesRemaining).toBe(7);

  for (let i = 0; i < 7; i++) {
    const resolution = resolveRaiunHighGame(new SequenceRandomSource([0.5]), RAIUN_HIGH_RANK.LOW);
    const result = reduceMachine(state, { type: 'RESOLVE_RAIUN_HIGH_GAME', resolution });
    expect(result.accepted).toBe(true);
    state = result.state;
  }

  expect(state.mode).toBe(GameMode.NORMAL);
  expect(state.raiunHighGamesRemaining).toBe(0);
  expect(state.raiunHighRank).toBe(RAIUN_HIGH_RANK.LOW);
  expect(RAIUN_HIGH_POLICY.failedLowToHighUpgradeImplemented).toBe(false);
});

test('Raiun high hit enters the published 20-game Raiun mode', () => {
  const state = enterRaiunHigh(RAIUN_HIGH_RANK.LOW);
  const resolution = resolveRaiunHighGame(new SequenceRandomSource([0.01]), RAIUN_HIGH_RANK.LOW);
  const result = reduceMachine(state, { type: 'RESOLVE_RAIUN_HIGH_GAME', resolution });

  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.RAIUN_MODE);
  expect(result.state.modeGamesRemaining).toBe(20);
  expect(result.state.raiunHighGamesRemaining).toBe(0);
  expect(result.events.some((event) => event.type === 'MODE_ENTER' && event.mode === GameMode.RAIUN_MODE)).toBe(true);
});

test('post-game Raiun resolution remains legal after replay has prepared the next bet', () => {
  let state = enterRaiunHigh(RAIUN_HIGH_RANK.LOW);
  state = { ...state, phase: KernelPhase.IDLE };
  const replaySettlement = reduceMachine(state, {
    type: 'SETTLE_NORMAL_ROLE',
    role: 'REPLAY',
    creditDelta: 0,
    replayAutoBet: 3,
    mbFollowupGames: 0,
    evidenceStatus: 'INFERRED_HIGH_CONFIDENCE'
  });
  expect(replaySettlement.state.phase).toBe(KernelPhase.READY);

  const resolution = resolveRaiunHighGame(new SequenceRandomSource([0.5]), RAIUN_HIGH_RANK.LOW);
  const afterHigh = reduceMachine(replaySettlement.state, { type: 'RESOLVE_RAIUN_HIGH_GAME', resolution });
  expect(afterHigh.accepted).toBe(true);
  expect(afterHigh.state.raiunHighGamesRemaining).toBe(6);
  expect(afterHigh.state.bet).toBe(3);
});
