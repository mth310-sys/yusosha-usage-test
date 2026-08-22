import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { resolveChanceZoneDuration } from '../test_lupin_zero/src/chance-zone-duration-resolver.js';
import { createMachineState, reduceMachine } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('setting 1 published duration split selects 10G below 62.5%', () => {
  const duration = resolveChanceZoneDuration(new SequenceRandomSource([0.624]), 1, GameMode.ODOROBO_ZONE);
  expect(duration.games).toBe(10);
  expect(duration.publishedPercent.tenGames).toBe(62.5);
  expect(duration.publishedPercent.twentyGames).toBe(37.5);
});

test('setting 1 published duration split selects 20G at or above 62.5%', () => {
  const duration = resolveChanceZoneDuration(new SequenceRandomSource([0.625]), 1, GameMode.FUJIKO_ZONE);
  expect(duration.games).toBe(20);
});

test('kernel enters Odorobo zone with published duration evidence', () => {
  const initial = createMachineState();
  const result = reduceMachine(initial, {
    type: 'ENTER_MODE',
    mode: GameMode.ODOROBO_ZONE,
    games: 10,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.ODOROBO_ZONE);
  expect(result.state.modeGamesRemaining).toBe(10);
  expect(result.events[0].type).toBe('MODE_ENTER');
});

test('kernel enters Fujiko zone with 20G duration', () => {
  const initial = createMachineState();
  const result = reduceMachine(initial, {
    type: 'ENTER_MODE',
    mode: GameMode.FUJIKO_ZONE,
    games: 20,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.FUJIKO_ZONE);
  expect(result.state.modeGamesRemaining).toBe(20);
});

test('chance-zone countdown reaches zero without inventing the next mode', () => {
  let state = reduceMachine(createMachineState(), {
    type: 'ENTER_MODE',
    mode: GameMode.ODOROBO_ZONE,
    games: 10,
    evidenceStatus: 'MULTI_SOURCE_MATCH'
  }).state;

  let last;
  for (let i = 0; i < 10; i += 1) {
    last = reduceMachine(state, { type: 'ADVANCE_MODE_GAME' });
    state = last.state;
  }

  expect(state.mode).toBe(GameMode.ODOROBO_ZONE);
  expect(state.modeGamesRemaining).toBe(0);
  expect(last.events.map((event) => event.type)).toEqual(['MODE_GAME_ADVANCED', 'MODE_WINDOW_EXHAUSTED']);
});
