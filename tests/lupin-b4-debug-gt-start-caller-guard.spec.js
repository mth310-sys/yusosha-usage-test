import { test, expect } from '@playwright/test';

test('GameCore debug GT start rejects coercible and invalid stock inputs', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');
    await import('/test_lupin_b4/js/debug-gt-start-integrity-patch.js?v=step6z-debug-gt-start1');

    const capture = (core) => ({
      gtState: core.goldenTime.state,
      guaranteedStocks: core.goldenTime.guaranteedStocks,
      stockAddedTotal: core.goldenTime.stockAddedTotal,
      phase: core.phase
    });

    const invalidValues = ['2', 'UNKNOWN', 2.5, -1, Infinity, NaN];
    const invalid = invalidValues.map((value) => {
      const core = new GameCore({ setting: 1, seed: 1 });
      const before = capture(core);
      const out = core.startGoldenTimeForTest(value);
      return { value: String(value), before, after: capture(core), out };
    });

    const zero = new GameCore({ setting: 1, seed: 1 });
    const zeroOut = zero.startGoldenTimeForTest(0);

    const two = new GameCore({ setting: 1, seed: 1 });
    const twoOut = two.startGoldenTimeForTest(2);

    return {
      invalid,
      zero: { out: zeroOut, after: capture(zero) },
      two: { out: twoOut, after: capture(two) }
    };
  });

  for (const item of result.invalid) {
    expect(item.out).toBe(false);
    expect(item.after).toEqual(item.before);
    expect(item.after.gtState).toBe('IDLE');
  }

  expect(result.zero.out).toBe(true);
  expect(result.zero.after.gtState).not.toBe('IDLE');
  expect(result.zero.after.guaranteedStocks).toBe(0);

  expect(result.two.out).toBe(true);
  expect(result.two.after.gtState).not.toBe('IDLE');
  expect(result.two.after.guaranteedStocks).toBe(2);
  expect(result.two.after.stockAddedTotal).toBe(2);
});
