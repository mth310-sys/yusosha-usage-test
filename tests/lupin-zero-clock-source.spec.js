import { test, expect } from '@playwright/test';

test('manual clock advances deterministically and kernel policy forbids wall-clock coupling', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { ManualClockSource, CLOCK_POLICY } = await import('/test_lupin_zero/src/clock-source.js');
    const clock = new ManualClockSource(1000);
    const a = clock.now();
    const b = clock.advance(250);
    const c = clock.advance(750);
    return { a, b, c, snapshot: clock.snapshot(), policy: CLOCK_POLICY };
  });

  expect(result).toMatchObject({
    a: 1000,
    b: 1250,
    c: 2000,
    snapshot: { nowMs: 2000 },
    policy: {
      kernelUsesWallClockDirectly: false,
      deterministicTestsUseManualClock: true
    }
  });
});
