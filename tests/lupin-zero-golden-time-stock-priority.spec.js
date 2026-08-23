import { test, expect } from '@playwright/test';
import { resolveGoldenTimeContinuationPriority } from '../test_lupin_zero/src/golden-time-stock-resolver.js';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('GT stock is consumed before treasure continuation battle', () => {
  const result = resolveGoldenTimeContinuationPriority({
    mode: GameMode.GOLDEN_TIME,
    modeResult: 'PENDING_GT_CONTINUATION',
    goldenTimeStockCount: 2
  });
  expect(result.accepted).toBe(true);
  expect(result.route).toBe('STOCK');
  expect(result.stockBefore).toBe(2);
  expect(result.stockAfter).toBe(1);
  expect(result.continuationGuaranteed).toBe(true);
});

test('treasure battle is used only after stocks are exhausted', () => {
  const result = resolveGoldenTimeContinuationPriority({
    mode: GameMode.GOLDEN_TIME,
    modeResult: 'PENDING_GT_CONTINUATION',
    goldenTimeStockCount: 0
  });
  expect(result.accepted).toBe(true);
  expect(result.route).toBe('TREASURE_BATTLE');
  expect(result.continuationGuaranteed).toBe(false);
});

test('stock priority does not fire outside the GT continuation boundary', () => {
  const result = resolveGoldenTimeContinuationPriority({
    mode: GameMode.GOLDEN_TIME,
    modeResult: null,
    goldenTimeStockCount: 3
  });
  expect(result.accepted).toBe(false);
  expect(result.route).toBe('NONE');
  expect(result.stockCount).toBe(3);
});
