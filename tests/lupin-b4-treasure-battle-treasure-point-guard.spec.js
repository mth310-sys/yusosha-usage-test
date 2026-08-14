import { test, expect } from '@playwright/test';

test('Treasure Battle rejects corrupted treasure points and preserves unresolved numeric boundary', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      treasurePoints: gt.treasurePoints,
      guaranteedStocks: gt.guaranteedStocks,
      stockExpiredOnBattle: gt.stockExpiredOnBattle,
      lastStockEvent: gt.lastStockEvent,
      battleContinuationPct: gt.battleContinuationPct,
      battleResult: gt.battleResult,
      battleSource: gt.battleSource,
      battleGameCount: gt.battleGameCount,
      battlePhase: gt.battlePhase,
      battleHiddenOutcome: gt.battleHiddenOutcome,
      lastEvent: gt.lastEvent
    });

    const makeActive = (points) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'ACTIVE_SET';
      gt.treasurePoints = points;
      gt.guaranteedStocks = 0;
      gt.lastStockEvent = 'BEFORE_STOCK';
      gt.lastEvent = 'BEFORE';
      return gt;
    };

    const runInvalid = (points) => {
      const gt = makeActive(points);
      const before = capture(gt);
      const out = gt.startTreasureBattle();
      return { before, after: capture(gt), out };
    };

    const known = makeActive(100000);
    const knownOut = known.startTreasureBattle();

    const unresolved = makeActive(125000);
    const unresolvedOut = unresolved.startTreasureBattle();

    return {
      invalid: [
        runInvalid('100000'),
        runInvalid(-1),
        runInvalid(100000.5),
        runInvalid(Infinity),
        runInvalid(NaN)
      ],
      known: { out: knownOut, after: capture(known) },
      unresolved: { out: unresolvedOut, after: capture(unresolved) }
    };
  });

  for (const invalid of result.invalid) {
    expect(invalid.out).toBeNull();
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.known.after.state).toBe('BATTLE_ACTIVE');
  expect(result.known.after.battleContinuationPct).toBe(69.7);
  expect(result.known.after.battleResult).toBe('HIDDEN');
  expect(['WIN', 'LOSE']).toContain(result.known.after.battleHiddenOutcome);
  expect(result.known.after.battleGameCount).toBe(0);
  expect(result.known.after.battlePhase).toBe('ENTRY');

  expect(result.unresolved.after.state).toBe('BATTLE_PENDING_UNVERIFIED_TREASURE_POINT');
  expect(result.unresolved.after.battleContinuationPct).toBeNull();
  expect(result.unresolved.after.battleResult).toBe('UNRESOLVED');
  expect(result.unresolved.after.battleSource).toBe('NO_INTERPOLATION');
  expect(result.unresolved.after.lastEvent).toBe('GT_BATTLE_PENDING_EXACT_TREASURE_VALUE');
});
