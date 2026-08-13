import { test, expect } from '@playwright/test';

test('CZ helpers reject unsupported settings without falling back to setting 1', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/cz-profile.js');
    const low = { next: () => 0 };
    const high = { next: () => 0.999999 };
    return {
      invalidLength0: profile.drawCzLength(0, low),
      invalidLength7: profile.drawCzLength(7, low),
      invalidScenario0: profile.drawCzScenario(0, low),
      invalidScenario7: profile.drawCzScenario(7, low),
      setting1LengthLow: profile.drawCzLength(1, low),
      setting1LengthHigh: profile.drawCzLength(1, high),
      setting6ScenarioLow: profile.drawCzScenario(6, low),
      setting6ScenarioHigh: profile.drawCzScenario(6, high)
    };
  });

  expect(result.invalidLength0).toBeNull();
  expect(result.invalidLength7).toBeNull();
  expect(result.invalidScenario0).toBeNull();
  expect(result.invalidScenario7).toBeNull();
  expect(result.setting1LengthLow).toBe(10);
  expect(result.setting1LengthHigh).toBe(20);
  expect(result.setting6ScenarioLow).toBe('A');
  expect(result.setting6ScenarioHigh).toBe('D');
});
