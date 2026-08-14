import { test, expect } from '@playwright/test';

test('Treasure Battle entry rejects corrupted stock state before mutation', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      guaranteedStocks: gt.guaranteedStocks,
      stockExpiredOnBattle: gt.stockExpiredOnBattle,
      lastStockEvent: gt.lastStockEvent,
      treasurePoints: gt.treasurePoints,
      battleContinuationPct: gt.battleContinuationPct,
      battleResult: gt.battleResult,
      battleSource: gt.battleSource,
      battleGameCount: gt.battleGameCount,
      battlePhase: gt.battlePhase,
      battleOpponent: gt.battleOpponent,
      battleHiddenOutcome: gt.battleHiddenOutcome,
      lastEvent: gt.lastEvent
    });

    const make = (stocks) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.start({ guaranteedStocks:0, source:'TREASURE_BATTLE_STOCK_GUARD_TEST' });
      gt.state = 'ACTIVE_SET';
      gt.treasurePoints = 1000000;
      gt.battleContinuationPct = 100;
      gt.guaranteedStocks = stocks;
      return gt;
    };

    const runInvalid = (stocks) => {
      const gt = make(stocks);
      const before = capture(gt);
      const out = gt.startTreasureBattle();
      return { before, after:capture(gt), out };
    };

    const zero = make(0);
    const zeroOut = zero.startTreasureBattle();

    const two = make(2);
    const twoOut = two.startTreasureBattle();

    return {
      decimal: runInvalid(2.5),
      text: runInvalid('3'),
      negative: runInvalid(-1),
      infinity: runInvalid(Infinity),
      zero: { out:zeroOut, after:capture(zero) },
      two: { out:twoOut, after:capture(two) }
    };
  });

  for (const invalid of [result.decimal, result.text, result.negative, result.infinity]) {
    expect(invalid.out).toBeNull();
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.zero.out.state).toBe('BATTLE_ACTIVE');
  expect(result.zero.after.state).toBe('BATTLE_ACTIVE');
  expect(result.zero.after.guaranteedStocks).toBe(0);
  expect(result.zero.after.stockExpiredOnBattle).toBe(0);
  expect(result.zero.after.lastStockEvent).toBe('BATTLE_ENTRY_NO_STOCK');
  expect(result.zero.after.battleResult).toBe('HIDDEN');

  expect(result.two.out.state).toBe('BATTLE_ACTIVE');
  expect(result.two.after.state).toBe('BATTLE_ACTIVE');
  expect(result.two.after.guaranteedStocks).toBe(0);
  expect(result.two.after.stockExpiredOnBattle).toBe(2);
  expect(result.two.after.lastStockEvent).toBe('EXPIRE_2_BATTLE_ENTRY');
  expect(result.two.after.battleResult).toBe('HIDDEN');
});
