import { test, expect } from '@playwright/test';
import { SequenceRandomSource } from '../test_lupin_zero/src/random-source.js';
import {
  GOLDEN_TIME_TREASURE_SPEC,
  resolveGoldenTimeTreasureAcquisition,
  applyGoldenTimeTreasure
} from '../test_lupin_zero/src/golden-time-treasure-resolver.js';
import { getGoldenTimeContinuationPercent } from '../test_lupin_zero/src/golden-time-resolver.js';

test('GT treasure production preserves published average 1/10 while keeping exact state table unresolved', () => {
  expect(GOLDEN_TIME_TREASURE_SPEC.lotteryBasis).toBe('ALL_ROLES');
  expect(GOLDEN_TIME_TREASURE_SPEC.publishedDenominatorRange).toEqual([3, 18]);
  expect(GOLDEN_TIME_TREASURE_SPEC.publishedAverageDenominator).toBe(10);
  expect(GOLDEN_TIME_TREASURE_SPEC.productionDenominator).toBe(10);
  expect(GOLDEN_TIME_TREASURE_SPEC.exactStateTransitionRatesKnown).toBe(false);
  expect(GOLDEN_TIME_TREASURE_SPEC.exactAwardDistributionKnown).toBe(false);
});

test('GT treasure hit adds replaceable 50,000T production step', () => {
  const hit = resolveGoldenTimeTreasureAcquisition(new SequenceRandomSource([0.099]));
  expect(hit.hit).toBe(true);
  expect(hit.treasure).toBe(50000);
  expect(hit.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  const applied = applyGoldenTimeTreasure(350000, hit);
  expect(applied.to).toBe(400000);
  expect(getGoldenTimeContinuationPercent(applied.to)).toBe(74.4);
});

test('GT treasure miss adds nothing', () => {
  const miss = resolveGoldenTimeTreasureAcquisition(new SequenceRandomSource([0.1]));
  expect(miss.hit).toBe(false);
  expect(miss.treasure).toBe(0);
});

test('GT treasure caps at one million and exposes Extra Bonus boundary', () => {
  const hit = resolveGoldenTimeTreasureAcquisition(new SequenceRandomSource([0]));
  const applied = applyGoldenTimeTreasure(980000, hit);
  expect(applied.to).toBe(1000000);
  expect(applied.added).toBe(20000);
  expect(applied.extraBonusReached).toBe(true);
  expect(getGoldenTimeContinuationPercent(applied.to)).toBe(100);
});
