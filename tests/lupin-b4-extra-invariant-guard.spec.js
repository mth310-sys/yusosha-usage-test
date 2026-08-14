import { test, expect } from '@playwright/test';

test('EXTRA bonus progression rejects inconsistent counters', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      extraGameCount: gt.extraGameCount,
      extraRemainingGames: gt.extraRemainingGames,
      extraTargetGames: gt.extraTargetGames,
      extraStockLotteryEvents: gt.extraStockLotteryEvents,
      extraStockHits: gt.extraStockHits,
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      pendingGoldRush: gt.pendingGoldRush,
      lastEvent: gt.lastEvent
    });

    const make = () => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'EXTRA_BONUS_ACTIVE';
      gt.extraGameCount = 3;
      gt.extraRemainingGames = 7;
      gt.extraTargetGames = 10;
      gt.extraStockLotteryEvents = 3;
      gt.extraStockHits = 1;
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = 2;
      gt.pendingGoldRush = false;
      gt.lastEvent = 'BEFORE';
      gt.rng = { next: () => 0.999999 };
      return gt;
    };

    const corrupt = [
      { field: 'extraTargetGames', value: '10' },
      { field: 'extraTargetGames', value: 10.5 },
      { field: 'extraTargetGames', value: 0 },
      { field: 'extraTargetGames', value: Infinity },
      { field: 'extraRemainingGames', value: 0 },
      { field: 'extraRemainingGames', value: 8 },
      { field: 'extraGameCount', value: 4 },
      { field: 'extraStockLotteryEvents', value: 2 },
      { field: 'extraStockLotteryEvents', value: 4 },
      { field: 'extraStockHits', value: 4 }
    ];

    const invalid = corrupt.map(({ field, value }) => {
      const gt = make();
      gt[field] = value;
      const before = capture(gt);
      const out = gt.completeExtraGame();
      return { field, value: String(value), before, after: capture(gt), out };
    });

    const valid = make();
    const validBefore = capture(valid);
    const validOut = valid.completeExtraGame();

    return { invalid, valid: { before: validBefore, after: capture(valid), out: validOut } };
  });

  for (const item of result.invalid) {
    expect(item.out).toBeNull();
    expect(item.after).toEqual(item.before);
  }

  expect(result.valid.after.state).toBe('EXTRA_BONUS_ACTIVE');
  expect(result.valid.after.extraGameCount).toBe(4);
  expect(result.valid.after.extraRemainingGames).toBe(6);
  expect(result.valid.after.extraTargetGames).toBe(10);
  expect(result.valid.after.extraStockLotteryEvents).toBe(4);
  expect(result.valid.after.extraStockHits).toBe(1);
  expect(result.valid.after.guaranteedStocks).toBe(result.valid.before.guaranteedStocks);
  expect(result.valid.after.stockAddedTotal).toBe(result.valid.before.stockAddedTotal);
});
