import { test, expect } from '@playwright/test';

test('seeded random source replays the same draw stream', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { SeededRandomSource, SequenceRandomSource, drawPercent } = await import('/test_lupin_zero/src/random-source.js');
    const a = new SeededRandomSource(20160801);
    const b = new SeededRandomSource(20160801);
    const streamA = Array.from({ length: 8 }, () => a.nextFloat());
    const streamB = Array.from({ length: 8 }, () => b.nextFloat());
    const fixed = new SequenceRandomSource([0, 0.499, 0.5, 0.999]);
    return {
      streamA,
      streamB,
      snapshotA: a.snapshot(),
      fixedResults: [
        drawPercent(fixed, 50),
        drawPercent(fixed, 50),
        drawPercent(fixed, 50),
        drawPercent(fixed, 100)
      ]
    };
  });

  expect(result.streamA).toEqual(result.streamB);
  expect(result.snapshotA.initialSeed).toBe(20160801);
  expect(result.snapshotA.drawCount).toBe(8);
  expect(result.fixedResults).toEqual([true, true, false, true]);
});
