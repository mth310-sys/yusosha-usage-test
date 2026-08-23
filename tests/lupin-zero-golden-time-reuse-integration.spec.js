import { test, expect } from '@playwright/test';
import { GameMode } from '../test_lupin_zero/src/game-flow-spec.js';

test('GT continuation battle reuses existing stock priority and revenge pipeline', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    return {
      phasePolicy: app.goldenTimeSetPhasePolicy,
      hasStockPriorityResolver: typeof app.resolveGoldenTimeContinuationPriority === 'function',
      hasRevengePullbackResolver: typeof app.resolveRevengePullback === 'function',
      hasRevengeEntryRuntime: typeof app.tryEnterBonusEndRevengeChance === 'function'
    };
  });

  expect(result.phasePolicy.continuationResolutionPipeline).toBe('REUSE_EXISTING_STOCK_TREASURE_BATTLE_REVENGE_PIPELINE');
  expect(result.phasePolicy.stockPriorityResolverReused).toBe(true);
  expect(result.phasePolicy.revengeChanceRuntimeReused).toBe(true);
  expect(result.phasePolicy.duplicateContinuationResolverImplemented).toBe(false);
  expect(result.hasStockPriorityResolver).toBe(true);
  expect(result.hasRevengePullbackResolver).toBe(true);
  expect(result.hasRevengeEntryRuntime).toBe(true);
});

test('existing GT stock priority still bypasses treasure battle at continuation resolution boundary', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    const resolved = app.resolveGoldenTimeContinuationPriority({
      mode: 'GOLDEN_TIME',
      modeResult: 'PENDING_GT_CONTINUATION',
      goldenTimeStockCount: 2
    });
    const noStock = app.resolveGoldenTimeContinuationPriority({
      mode: 'GOLDEN_TIME',
      modeResult: 'PENDING_GT_CONTINUATION',
      goldenTimeStockCount: 0
    });
    return { resolved, noStock };
  });

  expect(result.resolved.route).toBe('STOCK');
  expect(result.resolved.stockBefore).toBe(2);
  expect(result.resolved.stockAfter).toBe(1);
  expect(result.resolved.continuationGuaranteed).toBe(true);
  expect(result.noStock.route).toBe('TREASURE_BATTLE');
  expect(result.noStock.continuationGuaranteed).toBe(false);
});
