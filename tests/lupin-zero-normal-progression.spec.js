import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { selectWantedWindow, WANTED_RESET_CONTEXT, RAIUN_COUNTER_SPEC } from '../test_lupin_zero/src/normal-progression.js';
import { resolveInitialRaiunPoints, resolveRaiunPointAcquisition, RAIUN_COUNTER_PRODUCTION_POLICY } from '../test_lupin_zero/src/raiun-counter-resolver.js';
import { createMachineState, reduceMachine } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('reset profile selects a published WANTED 32G window without inventing a range', () => {
  const selection = selectWantedWindow(new SequenceRandomSource([0.2]), 1, WANTED_RESET_CONTEXT.AFTER_BONUS_ART_OR_RESET);
  expect(selection.window.label).toBe('97-128');
  expect(selection.productionTriggerGame).toBe(128);
  expect(selection.exactGameWithinWindowKnown).toBe(false);
  expect(selection.productionTriggerEvidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
});

test('normal progression enters WANTED at the published window end fallback', () => {
  let state = createMachineState();
  let result = reduceMachine(state, {
    type: 'CONFIGURE_WANTED_WINDOW',
    window: { index: 0, label: '1-32', start: 1, end: 32 },
    triggerGame: 32,
    context: WANTED_RESET_CONTEXT.AFTER_BONUS_ART_OR_RESET,
    evidenceStatus: 'INFERRED_HIGH_CONFIDENCE'
  });
  state = result.state;

  for (let game = 1; game <= 31; game++) {
    result = reduceMachine(state, { type: 'ADVANCE_NORMAL_PROGRESSION' });
    expect(result.accepted).toBe(true);
    state = result.state;
    expect(state.mode).toBe(GameMode.NORMAL);
  }

  result = reduceMachine(state, { type: 'ADVANCE_NORMAL_PROGRESSION' });
  expect(result.state.mode).toBe(GameMode.WANTED_CHANCE);
  expect(result.state.modeGamesRemaining).toBe(10);
  expect(result.events.some((event) => event.type === 'MODE_ENTER')).toBe(true);
});

test('WANTED lasts ten counted games and returns through explicit exit boundary', () => {
  let state = createMachineState();
  let result = reduceMachine(state, { type: 'ENTER_MODE', mode: GameMode.WANTED_CHANCE, games: 10, evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' });
  state = result.state;

  for (let game = 1; game <= 10; game++) {
    result = reduceMachine(state, { type: 'ADVANCE_MODE_GAME' });
    expect(result.accepted).toBe(true);
    state = result.state;
  }

  expect(state.mode).toBe(GameMode.WANTED_CHANCE);
  expect(state.modeGamesRemaining).toBe(0);
  result = reduceMachine(state, { type: 'EXIT_WANTED_CHANCE' });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.NORMAL);
  expect(result.state.wantedWindow).toBeNull();
});

test('Raiun counter 100pt opens the published seven-game high boundary', () => {
  const initial = createMachineState();
  const result = reduceMachine(initial, { type: 'SET_RAIUN_POINTS', points: 100, evidenceStatus: 'PUBLISHED_ANALYSIS' });
  expect(result.accepted).toBe(true);
  expect(result.state.raiunPoints).toBe(RAIUN_COUNTER_SPEC.targetPoints);
  expect(result.state.raiunHighGamesRemaining).toBe(RAIUN_COUNTER_SPEC.highGames);
  expect(result.events.some((event) => event.type === 'RAIUN_HIGH_ENTER')).toBe(true);
});

test('Raiun production initial model preserves published 22.6pt mean exactly', () => {
  expect(resolveInitialRaiunPoints(new SequenceRandomSource([0.39])).points).toBe(22);
  expect(resolveInitialRaiunPoints(new SequenceRandomSource([0.40])).points).toBe(23);
  const mean = 22 * 0.4 + 23 * 0.6;
  expect(mean).toBe(22.6);
  expect(RAIUN_COUNTER_PRODUCTION_POLICY.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(RAIUN_COUNTER_PRODUCTION_POLICY.mayPromoteToVerifiedAutomatically).toBe(false);
});

test('Raiun production acquisition uses published range and exact 3.3pt inferred mean', () => {
  const miss = resolveRaiunPointAcquisition(new SequenceRandomSource([0.20]));
  expect(miss.hit).toBe(false);

  const three = resolveRaiunPointAcquisition(new SequenceRandomSource([0.10, 0.69]));
  const four = resolveRaiunPointAcquisition(new SequenceRandomSource([0.10, 0.70]));
  expect(three.points).toBe(3);
  expect(four.points).toBe(4);
  expect(3 * 0.7 + 4 * 0.3).toBe(3.3);
  expect(three.hitDenominator).toBe(7.05);
});

test('automatic Raiun addition caps at 100 and opens seven-game high', () => {
  let state = createMachineState();
  state = reduceMachine(state, { type: 'SET_RAIUN_POINTS', points: 99, evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' }).state;
  const result = reduceMachine(state, { type: 'ADD_RAIUN_POINTS', points: 4, evidenceStatus: 'INFERRED_HIGH_CONFIDENCE' });
  expect(result.accepted).toBe(true);
  expect(result.state.raiunPoints).toBe(100);
  expect(result.state.raiunHighGamesRemaining).toBe(7);
  expect(result.events.find((event) => event.type === 'RAIUN_POINTS_ADDED')?.points).toBe(1);
  expect(result.events.some((event) => event.type === 'RAIUN_HIGH_ENTER')).toBe(true);
});

test('exact Raiun distributions remain unresolved while production inference is enabled', () => {
  expect(RAIUN_COUNTER_SPEC.exactInitialPointDistributionKnown).toBe(false);
  expect(RAIUN_COUNTER_SPEC.exactIncrementDistributionKnown).toBe(false);
  expect(RAIUN_COUNTER_SPEC.automaticPointGenerationImplemented).toBe(true);
  expect(RAIUN_COUNTER_SPEC.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
});
