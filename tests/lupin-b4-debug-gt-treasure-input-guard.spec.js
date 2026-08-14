import { test, expect } from '@playwright/test';

test('Golden Time DEBUG Treasure setter rejects coercible numeric inputs without changing no-interpolation policy', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');
    await import('/test_lupin_b4/js/debug-gt-start-integrity-patch.js?v=step6z-debug-gt-start1');

    const prepare = () => {
      const core = new GameCore({ setting: 1, seed: 1 });
      core.startGoldenTimeForTest(0);
      return core;
    };
    const capture = (core) => ({
      state: core.goldenTime.state,
      treasurePoints: core.goldenTime.treasurePoints,
      battleContinuationPct: core.goldenTime.battleContinuationPct,
      lastEvent: core.goldenTime.lastEvent
    });

    const invalidValues = ['100000', 100000.5, -1, Infinity, NaN];
    const invalid = invalidValues.map((value) => {
      const core = prepare();
      const before = capture(core);
      const out = core.setGoldenTimeTreasureForTest(value);
      return { value: String(value), before, after: capture(core), out };
    });

    const known = prepare();
    const knownOut = known.setGoldenTimeTreasureForTest(100000);

    const unresolved = prepare();
    const unresolvedBefore = capture(unresolved);
    const unresolvedOut = unresolved.setGoldenTimeTreasureForTest(125000);

    return {
      invalid,
      known: { out: knownOut, after: capture(known) },
      unresolved: { out: unresolvedOut, before: unresolvedBefore, after: capture(unresolved) }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBe(false);
    expect(item.after).toEqual(item.before);
  }

  expect(result.known.out).toBe(true);
  expect(result.known.after.treasurePoints).toBe(100000);
  expect(result.known.after.battleContinuationPct).toBe(69.7);

  expect(result.unresolved.out).toBe(false);
  expect(result.unresolved.after).toEqual(result.unresolved.before);
});
