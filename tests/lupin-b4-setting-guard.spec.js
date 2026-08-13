import { test, expect } from '@playwright/test';

test('Setting profile rejects unsupported settings instead of silently using setting 1', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/setting-profile.js');
    return {
      setting0: profile.getSettingProfile(0),
      setting7: profile.getSettingProfile(7),
      setting1: profile.getSettingProfile(1),
      setting6: profile.getSettingProfile(6)
    };
  });

  expect(result.setting0).toBeNull();
  expect(result.setting7).toBeNull();
  expect(result.setting1.setting).toBe(1);
  expect(result.setting1.roles.coin9).toBe(25.28);
  expect(result.setting1.roles.coin10).toBe(26.27);
  expect(result.setting6.setting).toBe(6);
  expect(result.setting6.roles.coin9).toBe(26.11);
  expect(result.setting6.roles.coin10).toBe(21.94);
});
