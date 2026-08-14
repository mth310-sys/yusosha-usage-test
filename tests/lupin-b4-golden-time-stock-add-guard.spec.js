import { test, expect } from '@playwright/test';

test('Golden Time stock additions reject non-positive, non-integer, and non-number counts without mutation', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      lastStockEvent: gt.lastStockEvent,
      stockSourceCounts: { ...gt.stockSourceCounts },
      lastEvent: gt.lastEvent
    });

    const run = (count) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.start({ guaranteedStocks:0, source:'STOCK_ADD_GUARD_TEST_START' });
      const before = capture(gt);
      const out = gt.addStocks(count, 'STOCK_ADD_GUARD_TEST');
      return { before, after:capture(gt), out };
    };

    return {
      decimal: run(2.9),
      text: run('3'),
      zero: run(0),
      negative: run(-1),
      infinity: run(Infinity),
      valid: run(2)
    };
  });

  for (const invalid of [result.decimal, result.text, result.zero, result.negative, result.infinity]) {
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.guaranteedStocks).toBe(0);
    expect(invalid.after.stockAddedTotal).toBe(0);
  }

  expect(result.valid.out).toBe(true);
  expect(result.valid.after.guaranteedStocks).toBe(2);
  expect(result.valid.after.stockAddedTotal).toBe(2);
  expect(result.valid.after.lastStockEvent).toBe('ADD_2_STOCK_ADD_GUARD_TEST');
  expect(result.valid.after.stockSourceCounts.STOCK_ADD_GUARD_TEST).toBe(2);
  expect(result.valid.after.lastEvent).toBe('GT_STOCK_PLUS_2_STOCK_ADD_GUARD_TEST');
});
