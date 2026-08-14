import { test, expect } from '@playwright/test';

test('Golden Time start requires strict numeric guaranteedStocks', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      stockConsumedTotal: gt.stockConsumedTotal,
      stockExpiredOnBattle: gt.stockExpiredOnBattle,
      lastEvent: gt.lastEvent
    });

    const invalidValues = ['2', 2.5, -1, Infinity, NaN];
    const invalid = invalidValues.map((value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      const before = capture(gt);
      const out = gt.start({ guaranteedStocks: value, source: 'TEST' });
      return { value: String(value), before, after: capture(gt), out };
    });

    const zero = new GoldenTimeSystem(new RNG(1), 1);
    const zeroOut = zero.start({ guaranteedStocks: 0, source: 'TEST_ZERO' });

    const two = new GoldenTimeSystem(new RNG(1), 1);
    const twoOut = two.start({ guaranteedStocks: 2, source: 'TEST_TWO' });

    return {
      invalid,
      zero: { out: zeroOut, after: capture(zero) },
      two: { out: twoOut, after: capture(two) }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBe(false);
    expect(item.after).toEqual(item.before);
  }

  expect(result.zero.out).toBe(true);
  expect(result.zero.after.guaranteedStocks).toBe(0);

  expect(result.two.out).toBe(true);
  expect(result.two.after.guaranteedStocks).toBe(2);
  expect(result.two.after.stockAddedTotal).toBe(2);
});
