import { test, expect } from '@playwright/test';

test('GOLDEN TIME treasure system keeps verified continuation structure exact', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const gt = await import('/test_lupin_zero/src/gt-system-spec.js');
    return {
      spec: gt.GT_SYSTEM_SPEC,
      continuation10: gt.getTreasureContinuationExpectation(100000),
      continuation50: gt.getTreasureContinuationExpectation(500000),
      continuation95: gt.getTreasureContinuationExpectation(950000),
      continuation100: gt.getTreasureContinuationExpectation(1000000),
      unlisted: gt.getTreasureContinuationExpectation(125000)
    };
  });

  expect(result.continuation10).toBe(69.7);
  expect(result.continuation50).toBe(76.3);
  expect(result.continuation95).toBe(97.2);
  expect(result.continuation100).toBe(100);
  expect(result.unlisted).toBeNull();

  expect(result.spec.stages.japan.treasureHitDenominator).toBe(16.9);
  expect(result.spec.stages.switzerland.treasureHitDenominator).toBe(12.6);
  expect(result.spec.stages.caribbean.treasureHitDenominator).toBe(7.5);
  expect(result.spec.stages.undergroundCity.treasureHitDenominator).toBe(3.0);
  expect(result.spec.stages.alternateSpace).toEqual({ games: 10, averageTreasurePoints: 702000 });

  expect(result.spec.lupinRush.games).toBe(4);
  expect(result.spec.lupinRush.averageTreasurePoints).toBe(342000);
  expect(result.spec.treasureRush.games).toEqual({ min: 4, max: 9 });
  expect(result.spec.treasureRush.averageTreasurePoints).toBe(499000);

  expect(result.spec.extraBonus.triggerPoints).toBe(1000000);
  expect(result.spec.extraBonus.gamesRule).toBe('15_PLUS_REMAINING_ART_GAMES');
  expect(result.spec.extraBonus.oddSymbolSetStockDenominator).toBe(202.6);
  expect(result.spec.extraBonus.goldRushDenominator).toBe(4924.3);

  expect(result.spec.goldRush.baseGames).toBe(1);
  expect(result.spec.goldRush.continuationPercent).toBe(52.6);
  expect(result.spec.goldRush.averageGames).toBe(2.1);

  expect(result.spec.continuationBattle.trigger).toBe('SET_GAMES_EXHAUSTED_WITHOUT_STOCK');
  expect(result.spec.policy.inferTreasurePointAwardAmounts).toBe(false);
  expect(result.spec.policy.inferStageTransitionRates).toBe(false);
  expect(result.spec.policy.inferRushPatternSelectionRates).toBe(false);
  expect(result.spec.policy.interpolateUnlistedContinuationPoints).toBe(false);
});
