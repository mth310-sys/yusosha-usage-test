import { test, expect } from '@playwright/test';

test('GT stock source counters reject corrupt values without mutation', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      stockSourceCounts: Array.isArray(gt.stockSourceCounts)
        ? [...gt.stockSourceCounts]
        : gt.stockSourceCounts && typeof gt.stockSourceCounts === 'object'
          ? { ...gt.stockSourceCounts }
          : gt.stockSourceCounts,
      lastStockEvent: gt.lastStockEvent
    });

    const make = () => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = 2;
      gt.stockSourceCounts = { TEST: 2 };
      gt.lastStockEvent = 'BEFORE';
      return gt;
    };

    const invalid = [];

    for (const value of [null, []]) {
      const gt = make();
      gt.stockSourceCounts = value;
      const before = capture(gt);
      const out = gt.recordStockAdd(1, 'TEST');
      invalid.push({ kind: 'container', value: String(value), before, after: capture(gt), out });
    }

    for (const value of ['2', 2.5, -1, Infinity]) {
      const gt = make();
      gt.stockSourceCounts.TEST = value;
      const before = capture(gt);
      const out = gt.recordStockAdd(1, 'TEST');
      invalid.push({ kind: 'source', value: String(value), before, after: capture(gt), out });
    }

    const validExisting = make();
    const validExistingOut = validExisting.recordStockAdd(1, 'TEST');

    const validNew = make();
    const validNewOut = validNew.recordStockAdd(1, 'NEW_SOURCE');

    return {
      invalid,
      validExisting: { out: validExistingOut, after: capture(validExisting) },
      validNew: { out: validNewOut, after: capture(validNew) }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBe(0);
    expect(item.after).toEqual(item.before);
  }

  expect(result.validExisting.out).toBe(1);
  expect(result.validExisting.after.guaranteedStocks).toBe(3);
  expect(result.validExisting.after.stockAddedTotal).toBe(3);
  expect(result.validExisting.after.stockSourceCounts.TEST).toBe(3);

  expect(result.validNew.out).toBe(1);
  expect(result.validNew.after.guaranteedStocks).toBe(3);
  expect(result.validNew.after.stockAddedTotal).toBe(3);
  expect(result.validNew.after.stockSourceCounts.TEST).toBe(2);
  expect(result.validNew.after.stockSourceCounts.NEW_SOURCE).toBe(1);
});
