import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { selectCeilingGame, resolveCeilingArrival } from '../test_lupin_zero/src/ceiling-resolver.js';
import { CEILING_SPEC } from '../test_lupin_zero/src/ceiling-spec.js';

test('setting 1 preserves published 499G and 999G split', () => {
  const shallow = selectCeilingGame(new SequenceRandomSource([0.0079]), 1);
  const deep = selectCeilingGame(new SequenceRandomSource([0.0081]), 1);
  expect(shallow.selectedGame).toBe(499);
  expect(deep.selectedGame).toBe(999);
  expect(shallow.distribution[499]).toBe(0.8);
  expect(shallow.distribution[999]).toBe(99.2);
});

test('all published setting distributions stay exact', () => {
  expect(CEILING_SPEC.selectionBySetting[2][499]).toBe(1.6);
  expect(CEILING_SPEC.selectionBySetting[3][499]).toBe(3.1);
  expect(CEILING_SPEC.selectionBySetting[4][499]).toBe(4.7);
  expect(CEILING_SPEC.selectionBySetting[5][499]).toBe(9.4);
  expect(CEILING_SPEC.selectionBySetting[6][499]).toBe(12.5);
});

test('normal ceiling arrives exactly at selected game and routes to Lupin Bonus', () => {
  expect(resolveCeilingArrival({ gamesSinceReset: 498, selectedGame: 499, currentMode: 'NORMAL' }).reached).toBe(false);
  const arrival = resolveCeilingArrival({ gamesSinceReset: 499, selectedGame: 499, currentMode: 'NORMAL' });
  expect(arrival.reached).toBe(true);
  expect(arrival.route).toBe('LUPIN_BONUS');
  expect(arrival.goldenTimeGuaranteed).toBe(false);
});

test('ceiling during Raiun Mode changes to Shin Raiun route with guaranteed Golden Time', () => {
  const arrival = resolveCeilingArrival({ gamesSinceReset: 999, selectedGame: 999, currentMode: 'RAIUN_MODE' });
  expect(arrival.reached).toBe(true);
  expect(arrival.route).toBe('SHIN_RAIUN_MODE');
  expect(arrival.goldenTimeGuaranteed).toBe(true);
});

test('Raiun Mode is explicitly not a ceiling reset condition', () => {
  expect(CEILING_SPEC.counter.resetByRaiunMode).toBe(false);
  expect(CEILING_SPEC.counter.resetConditions).toEqual(['LUPIN_BONUS_END', 'GOLDEN_TIME_END']);
});
