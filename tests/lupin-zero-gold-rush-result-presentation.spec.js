import { test, expect } from '@playwright/test';

test('GOLD RUSH result presentation keeps logic and visuals separated', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForFunction(() => window.__LUPIN_ZERO__?.goldRushRedAlignmentPresentationPolicy);
  const policy = await page.evaluate(() => window.__LUPIN_ZERO__.goldRushRedAlignmentPresentationPolicy);
  expect(policy.presentationOnly).toBe(true);
  expect(policy.automaticRankSelection).toBe(false);
  expect(policy.changesStockAward).toBe(false);
  expect(policy.normalCue).toBe('RED');
  expect(policy.absoluteBreakthroughCue).toBe('GOLD_WHITE');
  expect(policy.limitBreakthroughCue).toBe('RAINBOW');
});
