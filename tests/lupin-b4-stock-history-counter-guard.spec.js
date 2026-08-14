import { test, expect } from '@playwright/test';

test('GT stock history counters reject corrupt values without mutation', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      stockConsumedTotal: gt.stockConsumedTotal,
      stockExpiredOnBattle: gt.stockExpiredOnBattle,
      stockSourceCounts: { ...gt.stockSourceCounts },
      lastStockEvent: gt.lastStockEvent
    });

    const badValues = ['1', 1.5, -1, Infinity];

    const addInvalid = badValues.map((value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = value;
      gt.stockConsumedTotal = 0;
      gt.stockExpiredOnBattle = 0;
      gt.stockSourceCounts = {};
      gt.lastStockEvent = 'BEFORE';
      const before = capture(gt);
      const out = gt.recordStockAdd(1, 'TEST');
      return { value: String(value), before, after: capture(gt), out };
    });

    const consumeInvalid = badValues.map((value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = 2;
      gt.stockConsumedTotal = value;
      gt.stockExpiredOnBattle = 0;
      gt.lastStockEvent = 'BEFORE';
      const before = capture(gt);
      const out = gt.consumeStock('TEST');
      return { value: String(value), before, after: capture(gt), out };
    });

    const expireInvalid = badValues.map((value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.guaranteedStocks = 2;
      gt.stockAddedTotal = 2;
      gt.stockConsumedTotal = 0;
      gt.stockExpiredOnBattle = value;
      gt.lastStockEvent = 'BEFORE';
      const before = capture(gt);
      const out = gt.expireStocksAtBattle();
      return { value: String(value), before, after: capture(gt), out };
    });

    const validAdd = new GoldenTimeSystem(new RNG(1), 1);
    validAdd.guaranteedStocks = 2;
    validAdd.stockAddedTotal = 2;
    validAdd.stockSourceCounts = {};
    const validAddOut = validAdd.recordStockAdd(1, 'TEST');

    const validConsume = new GoldenTimeSystem(new RNG(1), 1);
    validConsume.guaranteedStocks = 2;
    validConsume.stockAddedTotal = 2;
    validConsume.stockConsumedTotal = 0;
    const validConsumeOut = validConsume.consumeStock('TEST');

    const validExpire = new GoldenTimeSystem(new RNG(1), 1);
    validExpire.guaranteedStocks = 2;
    validExpire.stockAddedTotal = 2;
    validExpire.stockExpiredOnBattle = 0;
    const validExpireOut = validExpire.expireStocksAtBattle();

    return {
      addInvalid,
      consumeInvalid,
      expireInvalid,
      validAdd: { out: validAddOut, after: capture(validAdd) },
      validConsume: { out: validConsumeOut, after: capture(validConsume) },
      validExpire: { out: validExpireOut, after: capture(validExpire) }
    };
  });

  for (const item of result.addInvalid) {
    expect(item.out).toBe(0);
    expect(item.after).toEqual(item.before);
  }
  for (const item of result.consumeInvalid) {
    expect(item.out).toBe(false);
    expect(item.after).toEqual(item.before);
  }
  for (const item of result.expireInvalid) {
    expect(item.out).toBe(0);
    expect(item.after).toEqual(item.before);
  }

  expect(result.validAdd.out).toBe(1);
  expect(result.validAdd.after.guaranteedStocks).toBe(3);
  expect(result.validAdd.after.stockAddedTotal).toBe(3);
  expect(result.validAdd.after.stockSourceCounts.TEST).toBe(1);

  expect(result.validConsume.out).toBe(true);
  expect(result.validConsume.after.guaranteedStocks).toBe(1);
  expect(result.validConsume.after.stockConsumedTotal).toBe(1);

  expect(result.validExpire.out).toBe(2);
  expect(result.validExpire.after.guaranteedStocks).toBe(0);
  expect(result.validExpire.after.stockExpiredOnBattle).toBe(2);
});
