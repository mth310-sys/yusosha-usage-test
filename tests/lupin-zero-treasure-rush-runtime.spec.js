import { test, expect } from '@playwright/test';

test('GT Treasure Hunt production route keeps empirical calibration explicit', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const route = await import('/test_lupin_zero/src/gt-treasure-hunt-route-resolver.js');
    const hit = route.resolveGtTreasureHuntRoute({ nextFloat: () => 0 });
    const miss = route.resolveGtTreasureHuntRoute({ nextFloat: () => 0.99 });
    return { spec: route.GT_TREASURE_HUNT_ROUTE_SPEC, hit, miss };
  });
  expect(result.spec.productionEntryDenominator).toBe(175);
  expect(result.spec.observedTreasureRushCount).toBe(10);
  expect(result.spec.observedEligibleArtGames).toBe(1750);
  expect(result.spec.exactRoleByRoleLotteryResolved).toBe(false);
  expect(result.spec.exactTreasureHuntNaturalEntryRateResolved).toBe(false);
  expect(result.spec.replaceable).toBe(true);
  expect(result.hit.hit).toBe(true);
  expect(result.hit.chanceEyePresentation).toBe('GREEN_CHANCE_EYE');
  expect(result.hit.treasureHuntSuccess).toBe(true);
  expect(result.hit.treasureRush).toBe(true);
  expect(result.miss.hit).toBe(false);
});

test('Treasure RUSH freezes GT remaining games and returns after its own five-game model', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const app = window.__LUPIN_ZERO__;
    app.enterGoldenTime();
    const before = app.core.snapshot();
    const entered = app.enterTreasureRushFromGoldenTime();
    const rushStart = app.core.snapshot();
    for (let game = 0; game < 5; game += 1) {
      app.core.maxBetNow();
      app.core.start();
      app.core.stop(0); app.core.stop(1); app.core.stop(2);
    }
    const after = app.core.snapshot();
    return { before, entered, rushStart, after };
  });
  expect(result.entered).toBe(true);
  expect(result.rushStart.mode).toBe('TREASURE_RUSH');
  expect(result.rushStart.modeGamesRemaining).toBe(5);
  expect(result.after.mode).toBe('GOLDEN_TIME');
  expect(result.after.modeGamesRemaining).toBe(result.before.modeGamesRemaining);
  expect(result.after.goldenTimeTreasure).toBeGreaterThan(result.before.goldenTimeTreasure);
});
