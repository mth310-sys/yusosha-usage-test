import { test, expect } from '@playwright/test';

test('ART stage treasure hit rejects unknown stages instead of treating them as misses', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/art-stage-profile.js');
    const hitRng = { next: () => 0 };
    const missRng = { next: () => 0.999999 };
    return {
      unknown: profile.rollStageTreasureHit('UNKNOWN', hitRng),
      japanHit: profile.rollStageTreasureHit('JAPAN', hitRng),
      japanMiss: profile.rollStageTreasureHit('JAPAN', missRng),
      ikukanHit: profile.rollStageTreasureHit('IKUKAN', missRng)
    };
  });

  expect(result.unknown).toBeNull();
  expect(result.japanHit).toBe(true);
  expect(result.japanMiss).toBe(false);
  expect(result.ikukanHit).toBe(true);
});
