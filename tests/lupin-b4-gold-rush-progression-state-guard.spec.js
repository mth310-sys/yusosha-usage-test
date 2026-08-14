import { test, expect } from '@playwright/test';

test('GOLD RUSH progression only advances from GOLD_RUSH_ACTIVE', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      goldRushGameCount: gt.goldRushGameCount,
      goldRushStocks: gt.goldRushStocks,
      goldRushResult: gt.goldRushResult,
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      pendingGoldRush: gt.pendingGoldRush,
      extraRemainingGames: gt.extraRemainingGames,
      lastEvent: gt.lastEvent
    });

    const make = (state) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = state;
      gt.goldRushGameCount = 0;
      gt.goldRushStocks = 0;
      gt.goldRushResult = 'ACTIVE';
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = 2;
      gt.pendingGoldRush = true;
      gt.extraRemainingGames = 7;
      gt.lastEvent = 'BEFORE';
      gt.rng = { next: () => 0.999999 };
      return gt;
    };

    const invalidStates = ['IDLE', 'ACTIVE_SET', 'EXTRA_BONUS_ACTIVE', 'BATTLE_ACTIVE'];
    const invalid = invalidStates.map((state) => {
      const gt = make(state);
      const before = capture(gt);
      const out = gt.completeGoldRushGame();
      return { state, before, after: capture(gt), out };
    });

    const valid = make('GOLD_RUSH_ACTIVE');
    const validBefore = capture(valid);
    const validOut = valid.completeGoldRushGame();

    return {
      invalid,
      valid: { before: validBefore, after: capture(valid), out: validOut }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBeNull();
    expect(item.after).toEqual(item.before);
  }

  expect(result.valid.after.goldRushGameCount).toBe(result.valid.before.goldRushGameCount + 1);
  expect(result.valid.after.goldRushStocks).toBe(result.valid.before.goldRushStocks + 1);
  expect(result.valid.after.guaranteedStocks).toBe(result.valid.before.guaranteedStocks + 1);
  expect(result.valid.after.stockAddedTotal).toBe(result.valid.before.stockAddedTotal + 1);
});
