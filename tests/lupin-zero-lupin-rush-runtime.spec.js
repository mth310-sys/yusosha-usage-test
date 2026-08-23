import { test, expect } from '@playwright/test';

test('LUPIN RUSH uses published pattern selection and does not invent per-pattern treasure', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const rush = await import('/test_lupin_zero/src/lupin-rush-resolver.js');
    const makeRandom = (value) => ({ nextFloat: () => value });
    return {
      walther: rush.resolveLupinRushPattern(makeRandom(0)),
      silhouette: rush.resolveLupinRushPattern(makeRandom(0.63)),
      revolver: rush.resolveLupinRushPattern(makeRandom(0.94)),
      attack: rush.resolveLupinRushPattern(makeRandom(0.999)),
      profile: rush.createLupinRushProfile(makeRandom(0)),
      policy: rush.LUPIN_RUSH_POLICY
    };
  });
  expect(result.walther.pattern).toBe('WALTHER');
  expect(result.silhouette.pattern).toBe('SILHOUETTE');
  expect(result.revolver.pattern).toBe('REVOLVER_VISION');
  expect(result.attack.pattern).toBe('ATTACK_VISION');
  expect(result.profile.games).toBe(4);
  expect(result.profile.publishedAverageTreasure).toBe(342000);
  expect(result.profile.productionTreasureFallback).toBe(350000);
  expect(result.profile.exactPatternAwardDistributionKnown).toBe(false);
  expect(result.profile.relationToGoldenTimeSet).toBe('FIRST_4_GAMES_OF_EXISTING_40G_WORKING_MODEL');
  expect(result.policy.patternRates).toEqual({ WALTHER:63, SILHOUETTE:31, REVOLVER_VISION:5, ATTACK_VISION:1 });
  expect(result.policy.addExtraGamesOutsideGoldenTimeSet).toBe(false);
  expect(result.policy.synthesizePerPatternAwards).toBe(false);
});

test('LUPIN RUSH runtime arms immediately when GOLDEN TIME begins', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const state = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.enterGoldenTime();
    return { rush: app.getLupinRushState?.(), gt: app.core.snapshot() };
  });
  expect(state.gt.mode).toBe('GOLDEN_TIME');
  expect(state.rush.active).toBe(true);
  expect(state.rush.remaining).toBe(4);
  expect(['WALTHER','SILHOUETTE','REVOLVER_VISION','ATTACK_VISION']).toContain(state.rush.pattern);
});
