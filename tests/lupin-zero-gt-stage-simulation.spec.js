import { test, expect } from '@playwright/test';

test('GT stage simulation detects visible-residence mismatch without recalibrating internal published tables', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const results = await page.evaluate(async () => {
    const diagnostic = await import('/test_lupin_zero/src/gt-stage-simulation-diagnostic.js');
    const stage = await import('/test_lupin_zero/src/golden-time-stage-resolver.js');
    return {
      runs: [1,2,3,4,5,6].map((setting) => diagnostic.simulateGtStageResidence(setting, 20000, 0x20160830)),
      diagnosticPolicy: diagnostic.GT_STAGE_SIMULATION_DIAGNOSTIC_POLICY,
      stagePolicy: stage.GOLDEN_TIME_STAGE_POLICY
    };
  });

  expect(results.diagnosticPolicy.publishedReferenceIsVisibleStageResidence).toBe(true);
  expect(results.diagnosticPolicy.currentModelTracksInternalStageDirectly).toBe(true);
  expect(results.diagnosticPolicy.visibleStageLagRuleRecovered).toBe(false);
  expect(results.diagnosticPolicy.autoCalibrateInternalRatesToVisibleReference).toBe(false);
  expect(results.stagePolicy.visibleStageLagImplemented).toBe(false);
  expect(results.stagePolicy.autoCalibrateInternalStageRatesToVisibleResidence).toBe(false);
  expect(results.stagePolicy.publishedVisibleResidenceValidationStatus).toBe('MISMATCH_EXPECTED_UNTIL_VISIBLE_STAGE_LAG_RULE_RECOVERED');

  for (const run of results.runs) {
    expect(run.iterations).toBe(20000);
    expect(run.diagnosis).toBe('VISIBLE_STAGE_MAPPING_MISMATCH_REQUIRES_LAG_RULE_RECOVERY');
    expect(run.maxAbsoluteErrorPct).toBeGreaterThan(5);
    expect(run.ikukanPctOfAllGames).toBeGreaterThan(0);
    expect(run.publishedReference).not.toBeNull();
  }

  const setting1 = results.runs[0];
  expect(setting1.publishedReference).toEqual({ JAPAN:38.9, SWITZERLAND:40.1, CARIBBEAN:14.8, UNDERGROUND_CITY:6.1 });
  expect(setting1.simulatedNormalResidencePct.JAPAN).toBeLessThan(33);
  expect(setting1.simulatedNormalResidencePct.CARIBBEAN).toBeGreaterThan(20);
});
