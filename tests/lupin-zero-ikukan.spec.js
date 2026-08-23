import { test, expect } from '@playwright/test';

test('Ikukan is the published final GT progression rank and keeps 10G average model explicit', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(async () => {
    const stage = await import('/test_lupin_zero/src/golden-time-stage-resolver.js');
    const ikukan = await import('/test_lupin_zero/src/ikukan-resolver.js');
    const random = (value) => ({ nextFloat: () => value });
    return {
      fromUndergroundB: stage.resolveGoldenTimeStageUpgrade(random(0), 'A', 7),
      denominator: stage.getGoldenTimeTreasureDenominatorForStage('IKUKAN'),
      lowAward: ikukan.resolveIkukanAward(random(0)),
      highAward: ikukan.resolveIkukanAward(random(0.999)),
      spec: ikukan.IKUKAN_SPEC,
      policy: stage.GOLDEN_TIME_STAGE_POLICY
    };
  });

  expect(result.fromUndergroundB.stage).toBe('IKUKAN');
  expect(result.denominator).toBe(1);
  expect(result.lowAward.treasure).toBe(50000);
  expect(result.highAward.treasure).toBe(100000);
  expect(result.spec.games).toBe(10);
  expect(result.spec.publishedAverageTreasure).toBe(702000);
  expect(result.spec.productionModel.averagePerGame).toBe(70200);
  expect(result.spec.productionModel.expectedTenGameTotal).toBe(702000);
  expect(result.spec.exactAwardDistributionKnown).toBe(false);
  expect(result.spec.productionModel.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(result.policy.ikukanEarliestNaturalEntryGame).toBe(30);
  expect(result.policy.ikukanGamesWithinFortyGameSet).toBe(10);
});

test('Ikukan runtime is loaded without exposing a research control', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');
  const result = await page.evaluate(() => ({
    loaded: Boolean(window.__LUPIN_ZERO__?.ikukanSpec),
    games: window.__LUPIN_ZERO__?.ikukanSpec?.games,
    researchButtons: [...document.querySelectorAll('button')].filter((button) => /research|debug|異空間/i.test(button.textContent || '')).length
  }));
  expect(result.loaded).toBe(true);
  expect(result.games).toBe(10);
  expect(result.researchButtons).toBe(0);
});
