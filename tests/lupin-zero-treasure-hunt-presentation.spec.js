import { test, expect } from '@playwright/test';

test('Treasure Hunt keeps presentation selection visual-only', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/treasure-hunt-resolver.js');
    return {
      scenarios: [0,1,2,3].map((i) => mod.getTreasureHuntPresentationByIndex(i)),
      policy: mod.TREASURE_HUNT_SPEC.presentationPolicy,
      unresolved: mod.TREASURE_HUNT_SPEC.unresolved
    };
  });
  expect(result.scenarios.map((x) => x.key)).toEqual(['BRIDGE_JUMP','CUT_THROUGH_WARSHIP','SHOOT_DOWN_COMBAT_HELICOPTER','IMMORTAL_BOND']);
  expect(result.scenarios.every((x) => x.affectsOutcome === false)).toBe(true);
  expect(result.policy.scenarioSelectionAffectsOutcome).toBe(false);
  expect(result.unresolved.scenarioSelectionDistribution).toBe(true);
  expect(result.unresolved.specialHoldNaturalOccurrenceRates).toBe(true);
});

test('Treasure Hunt special holds preserve published minimum guarantees', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/treasure-hunt-resolver.js');
    return ['FLAME_LUPIN','FUJIKO','TAMACHAN'].map((key) => mod.resolveGuaranteedTreasureHunt(key));
  });
  expect(result.map((x) => x.minimumTreasure)).toEqual([200000,300000,1000000]);
  expect(result.every((x) => x.success === true)).toBe(true);
});
