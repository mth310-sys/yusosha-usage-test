import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  resolveChanceEyeOutcome,
  CHANCE_EYE_CONTEXT,
  CHANCE_EYE_DESTINATION
} from '../test_lupin_zero/src/chance-eye-outcome-resolver.js';

test('weak normal chance eye can miss using published 3.6% hit rate', () => {
  const random = new SequenceRandomSource([0.5]);
  const result = resolveChanceEyeOutcome(random, 'weak', CHANCE_EYE_CONTEXT.NORMAL);
  expect(result.hit).toBe(false);
  expect(result.destination).toBe(CHANCE_EYE_DESTINATION.MISS);
  expect(result.totalHitPercent).toBe(3.6);
});

test('weak normal hit can resolve to bonus-or-art without inventing its inner split', () => {
  const random = new SequenceRandomSource([0.01, 0.1]);
  const result = resolveChanceEyeOutcome(random, 'weak', CHANCE_EYE_CONTEXT.NORMAL);
  expect(result.hit).toBe(true);
  expect(result.destination).toBe(CHANCE_EYE_DESTINATION.BONUS_OR_ART_UNRESOLVED);
  expect(result.bonusVsArtSplitStatus).toBe('UNRESOLVED');
});

test('weak normal hit can resolve to Fujiko zone', () => {
  const random = new SequenceRandomSource([0.01, 0.75]);
  const result = resolveChanceEyeOutcome(random, 'weak', CHANCE_EYE_CONTEXT.NORMAL);
  expect(result.hit).toBe(true);
  expect(result.destination).toBe(CHANCE_EYE_DESTINATION.FUJIKO_ZONE);
});

test('weak normal hit can resolve to Odorobo zone', () => {
  const random = new SequenceRandomSource([0.01, 0.95]);
  const result = resolveChanceEyeOutcome(random, 'weak', CHANCE_EYE_CONTEXT.NORMAL);
  expect(result.hit).toBe(true);
  expect(result.destination).toBe(CHANCE_EYE_DESTINATION.ODOROBO_ZONE);
});

test('wanted chance uses its own published hit rate', () => {
  const random = new SequenceRandomSource([0.04, 0.2]);
  const result = resolveChanceEyeOutcome(random, 'weak', CHANCE_EYE_CONTEXT.WANTED_CHANCE);
  expect(result.hit).toBe(true);
  expect(result.totalHitPercent).toBe(5.1);
});
