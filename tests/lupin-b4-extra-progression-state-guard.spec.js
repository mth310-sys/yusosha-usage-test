import { test, expect } from '@playwright/test';

test('EXTRA bonus progression only advances from EXTRA_BONUS_ACTIVE', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      extraGameCount: gt.extraGameCount,
      extraRemainingGames: gt.extraRemainingGames,
      extraStockLotteryEvents: gt.extraStockLotteryEvents,
      extraStockHits: gt.extraStockHits,
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      pendingGoldRush: gt.pendingGoldRush,
      goldRushGameCount: gt.goldRushGameCount,
      goldRushStocks: gt.goldRushStocks,
      lastEvent: gt.lastEvent
    });

    const make = (state) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = state;
      gt.extraGameCount = 3;
      gt.extraRemainingGames = 7;
      gt.extraTargetGames = 10;
      gt.extraStockLotteryEvents = 3;
      gt.extraStockHits = 1;
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = 2;
      gt.pendingGoldRush = false;
      gt.goldRushGameCount = 0;
      gt.goldRushStocks = 0;
      gt.lastEvent = 'BEFORE';
      gt.rng = { next: () => 0.999999 };
      return gt;
    };

    const invalidStates = ['IDLE', 'ACTIVE_SET', 'BATTLE_ACTIVE', 'GOLD_RUSH_ACTIVE'];
    const invalid = invalidStates.map((state) => {
      const gt = make(state);
      const before = capture(gt);
      const out = gt.completeExtraGame();
      return { state, before, after: capture(gt), out };
    });

    const valid = make('EXTRA_BONUS_ACTIVE');
    const validBefore = capture(valid);
    const validOut = valid.completeExtraGame();

    return {
      invalid,
      valid: { before: validBefore, after: capture(valid), out: validOut }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBeNull();
    expect(item.after).toEqual(item.before);
  }

  expect(result.valid.after.state).toBe('EXTRA_BONUS_ACTIVE');
  expect(result.valid.after.extraGameCount).toBe(result.valid.before.extraGameCount + 1);
  expect(result.valid.after.extraRemainingGames).toBe(result.valid.before.extraRemainingGames - 1);
  expect(result.valid.after.extraStockLotteryEvents).toBe(result.valid.before.extraStockLotteryEvents + 1);
  expect(result.valid.after.extraStockHits).toBe(result.valid.before.extraStockHits);
  expect(result.valid.after.guaranteedStocks).toBe(result.valid.before.guaranteedStocks);
  expect(result.valid.after.pendingGoldRush).toBe(false);
  expect(result.valid.after.lastEvent).toBe('EXTRA_BONUS_GAME');
});
