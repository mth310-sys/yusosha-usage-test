import { test, expect } from '@playwright/test';

const MODULE_URL = '/test_lupin_zero/src/gt-set-length-observation-spec.js';

test('published observed play data forbids treating GT as a fixed 40G or fixed 30+10 runtime', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async (url) => {
    const mod = await import(url);
    return {
      spec: mod.GT_SET_LENGTH_OBSERVATION_SPEC,
      summary: mod.summarizeGtSetLengthObservations()
    };
  }, MODULE_URL);

  expect(result.spec.publishedNominalSetGames).toBe(40);
  expect(result.spec.publishedNominalSetGamesMeaning).toBe('APPROXIMATE');
  expect(result.spec.fixedFortyGameRuntimeModelAllowed).toBe(false);
  expect(result.spec.fixedThirtyPlusTenRuntimeModelAllowed).toBe(false);
  expect(result.spec.exactContinuationBattleEntryGame).toBeNull();
  expect(result.spec.exactContinuationBattleEntryGameEvidenceStatus).toBe('UNRESOLVED');
  expect(result.spec.productionEffect).toBe('CONSTRAINT_ONLY_DO_NOT_SYNTHESIZE_UNKNOWN_BATTLE_TIMING');

  expect(result.summary.count).toBeGreaterThanOrEqual(10);
  expect(result.summary.hasNonFortyInterval).toBe(true);
  expect(result.summary.min).toBeLessThan(40);
  expect(result.summary.max).toBeGreaterThan(40);
  expect(result.summary.exactContinuationBattleEntryGame).toBeNull();
});
