import { test, expect } from '@playwright/test';

test('Golden Time DEBUG GOLD CHANCE setter rejects coercible numeric inputs', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/debug-gt-start-integrity-patch.js?v=step6z-debug-gt-start1');

    const prepare = () => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      gt.state = 'GOLD_CHANCE_PENDING_UNVERIFIED_DISTRIBUTION';
      gt.goldChanceBaseRemainingGames = 10;
      gt.goldChanceAddedGames = null;
      gt.extraTargetGames = null;
      gt.extraRemainingGames = null;
      gt.extraGameCount = 0;
      gt.extraResult = 'UNRESOLVED';
      gt.lastEvent = 'TEST_GOLD_CHANCE_PENDING';
      return gt;
    };
    const capture = (gt) => ({
      state: gt.state,
      goldChanceBaseRemainingGames: gt.goldChanceBaseRemainingGames,
      goldChanceAddedGames: gt.goldChanceAddedGames,
      extraTargetGames: gt.extraTargetGames,
      extraRemainingGames: gt.extraRemainingGames,
      extraGameCount: gt.extraGameCount,
      extraResult: gt.extraResult,
      lastEvent: gt.lastEvent
    });

    const invalidStrings = ['15', '18'].map((value) => {
      const gt = prepare();
      const before = capture(gt);
      const out = gt.setGoldChanceAddedGamesForTest(value);
      return { value, before, after: capture(gt), out };
    });

    const belowMinimum = prepare();
    const belowBefore = capture(belowMinimum);
    const belowOut = belowMinimum.setGoldChanceAddedGamesForTest(14);

    const valid = prepare();
    const validOut = valid.setGoldChanceAddedGamesForTest(15);

    return {
      invalidStrings,
      belowMinimum: { out: belowOut, before: belowBefore, after: capture(belowMinimum) },
      valid: { out: validOut, after: capture(valid) }
    };
  });

  for (const item of result.invalidStrings) {
    expect(item.out).toBe(false);
    expect(item.after).toEqual(item.before);
  }

  expect(result.belowMinimum.out).toBe(false);
  expect(result.belowMinimum.after).toEqual(result.belowMinimum.before);

  expect(result.valid.out).toBe(true);
  expect(result.valid.after.state).toBe('EXTRA_BONUS_READY');
  expect(result.valid.after.goldChanceAddedGames).toBe(15);
  expect(result.valid.after.extraTargetGames).toBe(25);
  expect(result.valid.after.extraRemainingGames).toBe(25);
});
