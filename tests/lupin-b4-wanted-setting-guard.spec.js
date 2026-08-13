import { test, expect } from '@playwright/test';

test('WANTED post-WC target rejects unsupported settings instead of clamping to 1-6', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/wanted-profile.js');
    const rng = { next: () => 0 };
    return {
      setting0: profile.drawWantedPostWcTarget(0, rng),
      setting7: profile.drawWantedPostWcTarget(7, rng),
      invalidText: profile.drawWantedPostWcTarget('UNKNOWN', rng),
      setting1: profile.drawWantedPostWcTarget(1, rng),
      setting6: profile.drawWantedPostWcTarget(6, rng)
    };
  });

  expect(result.setting0).toBeNull();
  expect(result.setting7).toBeNull();
  expect(result.invalidText).toBeNull();
  expect(result.setting1.game).toBeGreaterThanOrEqual(result.setting1.zone.min);
  expect(result.setting1.game).toBeLessThanOrEqual(result.setting1.zone.max);
  expect(result.setting1.cycle).toBe('POST_WC_FAILURE');
  expect(result.setting6.game).toBeGreaterThanOrEqual(result.setting6.zone.min);
  expect(result.setting6.game).toBeLessThanOrEqual(result.setting6.zone.max);
  expect(result.setting6.cycle).toBe('POST_WC_FAILURE');
});
