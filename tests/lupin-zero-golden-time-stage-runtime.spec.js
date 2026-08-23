import { test, expect } from '@playwright/test';

test('GT stage resolver uses published scenario, stage and upgrade tables', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const stage = await import('/test_lupin_zero/src/golden-time-stage-resolver.js');
    const makeRandom = (value) => ({ nextFloat: () => value });
    return {
      scenarioA: stage.resolveGoldenTimeScenario(makeRandom(0), 1),
      scenarioD: stage.resolveGoldenTimeScenario(makeRandom(0.999), 1),
      initialA: stage.resolveGoldenTimeInitialStage(makeRandom(0), 'A'),
      upgradeA1: stage.resolveGoldenTimeStageUpgrade(makeRandom(0), 'A', 0),
      upgradeA2: stage.resolveGoldenTimeStageUpgrade(makeRandom(0.99), 'A', 0),
      denominators: ['JAPAN_A','SWITZERLAND_A','CARIBBEAN_A','UNDERGROUND_CITY_A'].map(stage.getGoldenTimeTreasureDenominatorForStage),
      policy: stage.GOLDEN_TIME_STAGE_POLICY
    };
  });
  expect(result.scenarioA.scenario).toBe('A');
  expect(result.scenarioD.scenario).toBe('D');
  expect(result.initialA.stage).toBe('JAPAN_A');
  expect(result.upgradeA1.steps).toBe(1);
  expect(result.upgradeA2.steps).toBe(2);
  expect(result.denominators).toEqual([16.9, 12.6, 7.5, 3]);
  expect(result.policy.scenarioSelectionTiming).toBe('ART_INITIAL_HIT');
  expect(result.policy.scenarioLifetime).toBe('ART_INITIAL_HIT_TO_ART_END');
  expect(result.policy.initialStageSelectionTiming).toBe('EACH_SET_START');
  expect(result.policy.upgradeEveryGames).toBe(10);
  expect(result.policy.noSyntheticStageRates).toBe(true);
});

test('GT treasure hit resolver accepts published stage denominator but keeps award amount inferred', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const treasure = await import('/test_lupin_zero/src/golden-time-treasure-resolver.js');
    const hit = treasure.resolveGoldenTimeTreasureAcquisition({ nextFloat: () => 0 }, 16.9);
    const miss = treasure.resolveGoldenTimeTreasureAcquisition({ nextFloat: () => 0.99 }, 3.0);
    return { hit, miss, spec: treasure.GOLDEN_TIME_TREASURE_SPEC };
  });
  expect(result.hit.hit).toBe(true);
  expect(result.hit.denominator).toBe(16.9);
  expect(result.hit.treasure).toBe(50000);
  expect(result.miss.hit).toBe(false);
  expect(result.spec.exactStateTransitionRatesKnown).toBe(true);
  expect(result.spec.exactAwardDistributionKnown).toBe(false);
});
