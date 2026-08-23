import { test, expect } from '@playwright/test';

test('GT stage simulation reconciles published residence ratios over the recovered 30G stage window', async ({ page }) => {
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
  expect(results.diagnosticPolicy.blocksPerStageResidenceWindow).toBe(3);
  expect(results.diagnosticPolicy.stageResidenceWindowGames).toBe(30);
  expect(results.diagnosticPolicy.stageResidenceWindowEvidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(results.diagnosticPolicy.internalABRanksMapDirectlyToSameVisibleStage).toBe(true);
  expect(results.diagnosticPolicy.visibleStageLagRequiredByPublishedSources).toBe(false);
  expect(results.diagnosticPolicy.autoCalibrateInternalRatesToVisibleReference).toBe(false);
  expect(results.diagnosticPolicy.runtimeGtSetLengthChangedByThisDiagnostic).toBe(false);

  expect(results.stagePolicy.visibleStageLagRuleRequired).toBe(false);
  expect(results.stagePolicy.publishedVisibleResidenceReconcilesWithThreeTenGameStageBlocks).toBe(true);
  expect(results.stagePolicy.stageResidenceWindowGames).toBe(30);
  expect(results.stagePolicy.runtimeGtSetLengthChangedByResidenceInference).toBe(false);

  for (const run of results.runs) {
    expect(run.iterations).toBe(20000);
    expect(run.diagnosis).toBe('PUBLISHED_TABLES_RECONCILED_OVER_30G_STAGE_WINDOW');
    expect(run.maxAbsoluteErrorPct).toBeLessThanOrEqual(2);
    expect(run.ikukanPctOfAllGames).toBeGreaterThan(0);
    expect(run.publishedReference).not.toBeNull();
  }

  const setting1 = results.runs[0];
  expect(setting1.publishedReference).toEqual({ JAPAN:38.9, SWITZERLAND:40.1, CARIBBEAN:14.8, UNDERGROUND_CITY:6.1 });
  expect(setting1.simulatedNormalResidencePct.JAPAN).toBeGreaterThan(36);
  expect(setting1.simulatedNormalResidencePct.JAPAN).toBeLessThan(41);
  expect(setting1.simulatedNormalResidencePct.CARIBBEAN).toBeGreaterThan(13);
  expect(setting1.simulatedNormalResidencePct.CARIBBEAN).toBeLessThan(17);
});
