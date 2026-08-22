import { test, expect } from '@playwright/test';
import { createMachineState, reduceMachine, ModeResult } from '../test_lupin_zero/src/machine-kernel.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('odd alignment is rejected outside a supported chance zone', () => {
  const state = createMachineState();
  const result = reduceMachine(state, { type: 'CHANCE_ZONE_ODD_ALIGNED' });
  expect(result.accepted).toBe(false);
  expect(result.state.mode).toBe(GameMode.NORMAL);
  expect(result.state.modeResult).toBeNull();
});

test('Odorobo odd alignment records success without inventing LB/GT split', () => {
  let state = createMachineState();
  state = reduceMachine(state, {
    type: 'ENTER_MODE',
    mode: GameMode.ODOROBO_ZONE,
    games: 10,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  }).state;

  const result = reduceMachine(state, { type: 'CHANCE_ZONE_ODD_ALIGNED' });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.ODOROBO_ZONE);
  expect(result.state.modeGamesRemaining).toBe(0);
  expect(result.state.modeResult).toBe(ModeResult.PENDING_BONUS_OR_ART);
  expect(result.state.modeResultEvidenceStatus).toBe('MULTI_SOURCE_MATCH');
  expect(result.events[0]).toMatchObject({
    type: 'CHANCE_ZONE_SUCCESS',
    successPresentation: 'ODD_LCD_SYMBOL_ALIGNED',
    pendingDestination: ModeResult.PENDING_BONUS_OR_ART,
    destinationSplitStatus: 'UNRESOLVED'
  });
});

test('Fujiko odd alignment records the same unresolved destination boundary', () => {
  let state = createMachineState();
  state = reduceMachine(state, {
    type: 'ENTER_MODE',
    mode: GameMode.FUJIKO_ZONE,
    games: 20,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  }).state;

  const result = reduceMachine(state, { type: 'CHANCE_ZONE_ODD_ALIGNED' });
  expect(result.accepted).toBe(true);
  expect(result.state.mode).toBe(GameMode.FUJIKO_ZONE);
  expect(result.state.modeGamesRemaining).toBe(0);
  expect(result.state.modeResult).toBe(ModeResult.PENDING_BONUS_OR_ART);
  expect(result.events[0].mode).toBe(GameMode.FUJIKO_ZONE);
});

test('successful chance zone cannot consume more games before destination is resolved', () => {
  let state = createMachineState();
  state = reduceMachine(state, {
    type: 'ENTER_MODE',
    mode: GameMode.ODOROBO_ZONE,
    games: 10,
    evidenceStatus: 'PUBLISHED_ANALYSIS'
  }).state;
  state = reduceMachine(state, { type: 'CHANCE_ZONE_ODD_ALIGNED' }).state;

  const advanced = reduceMachine(state, { type: 'ADVANCE_MODE_GAME' });
  expect(advanced.accepted).toBe(false);
  expect(advanced.state.modeResult).toBe(ModeResult.PENDING_BONUS_OR_ART);
});
