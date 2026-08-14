import { test, expect } from '@playwright/test';

test('Golden Time stock consume and battle expiry fail closed on corrupted stock state', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      guaranteedStocks: gt.guaranteedStocks,
      stockConsumedTotal: gt.stockConsumedTotal,
      stockExpiredOnBattle: gt.stockExpiredOnBattle,
      lastStockEvent: gt.lastStockEvent
    });

    const runConsume = (value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.guaranteedStocks = value;
      const before = capture(gt);
      const out = gt.consumeStock('GUARD_TEST');
      return { before, after:capture(gt), out };
    };

    const runExpire = (value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.guaranteedStocks = value;
      const before = capture(gt);
      const out = gt.expireStocksAtBattle();
      return { before, after:capture(gt), out };
    };

    return {
      consumeDecimal: runConsume(2.5),
      consumeText: runConsume('3'),
      consumeNegative: runConsume(-1),
      consumeInfinity: runConsume(Infinity),
      consumeZero: runConsume(0),
      consumeTwo: runConsume(2),
      expireDecimal: runExpire(2.5),
      expireText: runExpire('3'),
      expireNegative: runExpire(-1),
      expireInfinity: runExpire(Infinity),
      expireZero: runExpire(0),
      expireTwo: runExpire(2)
    };
  });

  for (const invalid of [
    result.consumeDecimal,
    result.consumeText,
    result.consumeNegative,
    result.consumeInfinity
  ]) {
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.consumeZero.out).toBe(false);
  expect(result.consumeZero.after).toEqual(result.consumeZero.before);

  expect(result.consumeTwo.out).toBe(true);
  expect(result.consumeTwo.after.guaranteedStocks).toBe(1);
  expect(result.consumeTwo.after.stockConsumedTotal).toBe(1);
  expect(result.consumeTwo.after.lastStockEvent).toBe('CONSUME_1_GUARD_TEST');

  for (const invalid of [
    result.expireDecimal,
    result.expireText,
    result.expireNegative,
    result.expireInfinity
  ]) {
    expect(invalid.out).toBe(0);
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.expireZero.out).toBe(0);
  expect(result.expireZero.after.guaranteedStocks).toBe(0);
  expect(result.expireZero.after.stockExpiredOnBattle).toBe(0);
  expect(result.expireZero.after.lastStockEvent).toBe('BATTLE_ENTRY_NO_STOCK');

  expect(result.expireTwo.out).toBe(2);
  expect(result.expireTwo.after.guaranteedStocks).toBe(0);
  expect(result.expireTwo.after.stockExpiredOnBattle).toBe(2);
  expect(result.expireTwo.after.lastStockEvent).toBe('EXPIRE_2_BATTLE_ENTRY');
});
