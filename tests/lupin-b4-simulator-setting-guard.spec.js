import { test, expect } from '@playwright/test';

test('Fast simulator rejects unsupported settings instead of throwing after profile guard', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const simulator = await import('/test_lupin_b4/js/simulator.js');
    return {
      setting0: simulator.runFastSimulation({ setting:0, games:10, seed:1 }),
      setting7: simulator.runFastSimulation({ setting:7, games:10, seed:1 }),
      setting1: simulator.runFastSimulation({ setting:1, games:10, seed:1 })
    };
  });

  expect(result.setting0).toBeNull();
  expect(result.setting7).toBeNull();
  expect(result.setting1.setting).toBe(1);
  expect(result.setting1.games).toBe(10);
  expect(Object.values(result.setting1.counts).reduce((sum, count) => sum + count, 0)).toBe(10);
});
