import { test, expect } from '@playwright/test';

test('next initial hit draw rejects unsupported settings without falling back to setting 1', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/next-initial-hit-profile.js');
    const lowRng = { next: () => 0 };
    const highRng = { next: () => 0.999999 };
    return {
      setting0: profile.drawNextInitialHit(0, lowRng),
      setting7: profile.drawNextInitialHit(7, lowRng),
      invalidText: profile.drawNextInitialHit('UNKNOWN', lowRng),
      setting1Low: profile.drawNextInitialHit(1, lowRng),
      setting1High: profile.drawNextInitialHit(1, highRng),
      setting6Low: profile.drawNextInitialHit(6, lowRng),
      setting6High: profile.drawNextInitialHit(6, highRng)
    };
  });

  expect(result.setting0).toBeNull();
  expect(result.setting7).toBeNull();
  expect(result.invalidText).toBeNull();

  expect(result.setting1Low.type).toBe('GOLDEN_TIME');
  expect(result.setting1Low.artPct).toBe(1.6);
  expect(result.setting1Low.bonusPct).toBe(98.4);
  expect(result.setting1High.type).toBe('LUPIN_BONUS');

  expect(result.setting6Low.type).toBe('GOLDEN_TIME');
  expect(result.setting6Low.artPct).toBe(4.7);
  expect(result.setting6Low.bonusPct).toBe(95.3);
  expect(result.setting6High.type).toBe('LUPIN_BONUS');
});
