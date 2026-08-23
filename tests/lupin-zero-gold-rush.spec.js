import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import { GOLD_RUSH_SPEC, resolveGoldRushGame } from '../test_lupin_zero/src/gold-rush-resolver.js';

test('Gold Rush published continuation profile is preserved', () => {
  expect(GOLD_RUSH_SPEC.entryTrigger).toBe('EXTRA_BONUS_GOLD_7_ALIGNED');
  expect(GOLD_RUSH_SPEC.continuationPercent).toBe(52.6);
  expect(GOLD_RUSH_SPEC.averageGames).toBe(2.1);
  expect(GOLD_RUSH_SPEC.returnDestination).toBe('EXTRA_BONUS');
});

test('continued Gold Rush game awards at least one GT stock', () => {
  const result = resolveGoldRushGame(new SequenceRandomSource([0.525]));
  expect(result.continued).toBe(true);
  expect(result.stockAward).toBe(1);
});

test('Gold Rush ends when 52.6 percent continuation fails', () => {
  const result = resolveGoldRushGame(new SequenceRandomSource([0.526]));
  expect(result.continued).toBe(false);
  expect(result.stockAward).toBe(0);
});
