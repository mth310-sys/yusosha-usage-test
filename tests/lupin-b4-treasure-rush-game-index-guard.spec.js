import { test, expect } from '@playwright/test';

test('Treasure Rush award bounds reject invalid game indexes without collapsing them into later-game rules', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/treasure-rush-profile.js');
    return {
      zeroBounds: profile.getTreasureRushAwardBounds(0),
      negativeBounds: profile.getTreasureRushAwardBounds(-1),
      textBounds: profile.getTreasureRushAwardBounds('UNKNOWN'),
      firstBounds: profile.getTreasureRushAwardBounds(1),
      secondBounds: profile.getTreasureRushAwardBounds(2),
      invalidManual: profile.validateTreasureRushManualAward(50000, 0),
      firstOverOneMillion: profile.validateTreasureRushManualAward(1200000, 1),
      secondOverOneMillion: profile.validateTreasureRushManualAward(1200000, 2)
    };
  });

  expect(result.zeroBounds).toBeNull();
  expect(result.negativeBounds).toBeNull();
  expect(result.textBounds).toBeNull();
  expect(result.invalidManual).toBeNull();

  expect(result.firstBounds.minimumPoints).toBe(50000);
  expect(result.firstBounds.maximumPoints).toBeNull();
  expect(result.firstBounds.maximumResolved).toBe(false);
  expect(result.secondBounds.minimumPoints).toBe(50000);
  expect(result.secondBounds.maximumPoints).toBe(1000000);
  expect(result.secondBounds.maximumResolved).toBe(true);

  expect(result.firstOverOneMillion).toBe(true);
  expect(result.secondOverOneMillion).toBe(false);
});
