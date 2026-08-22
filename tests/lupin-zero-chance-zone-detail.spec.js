import { test, expect } from '@playwright/test';

test('chance-zone published precision and unresolved scenario behavior stay exact', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const spec = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/chance-zone-detail-spec.js');
    return {
      spec: mod.CHANCE_ZONE_DETAIL_SPEC,
      duration3: mod.getChanceZoneDurationSelection(3),
      duration6: mod.getChanceZoneDurationSelection(6),
      scenario1: mod.getChanceZoneScenarioSelection(1),
      scenario6: mod.getChanceZoneScenarioSelection(6)
    };
  });

  expect(spec.duration3).toEqual({ tenGamesPercent: 60.94, twentyGamesPercent: 39.06 });
  expect(spec.duration6).toEqual({ tenGamesPercent: 47.66, twentyGamesPercent: 52.34 });
  expect(spec.scenario1).toEqual({ A: 71.88, B: 23.44, C: 3.13, D: 1.56 });
  expect(spec.scenario6).toEqual({ A: 51.56, B: 39.06, C: 6.25, D: 3.13 });
  expect(spec.spec.zones.ODOROBO_ZONE.expectationPercent).toEqual({ min: 39.6, max: 43.2 });
  expect(spec.spec.zones.FUJIKO_ZONE.expectationPercent).toEqual({ min: 58.8, max: 63.2 });
  expect(spec.spec.stageScenarioDetail.status).toBe('UNRESOLVED');
  expect(spec.spec.evidence.durationSelection).toBe('PUBLISHED_ANALYSIS');
  expect(spec.spec.policy.inferStageScenarioBehavior).toBe(false);
  expect(spec.spec.policy.roundPublishedPercentagesForRuntime).toBe(false);
  expect(spec.spec.policy.derivePerGameSuccessProbabilityFromZoneExpectation).toBe(false);
});
