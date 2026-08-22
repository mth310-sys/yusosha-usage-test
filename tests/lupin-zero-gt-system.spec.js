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

  expect(result.spec.treasure.acquisitionLottery.eligibleRoles).toBe('ALL_ROLES');
  expect(result.spec.treasure.acquisitionLottery.stageDependent).toBe(true);
  expect(result.spec.treasure.publishedMinimumAwards).toEqual({
    goldTSymbol: 300000,
    goldClassPresentation: 500000,
    flameLupinHold: 200000,
    fujikoHold: 300000,
    tamaChanHold: 1000000
  });

  expect(result.spec.stages.japan.treasureHitDenominator).toBe(16.9);
  expect(result.spec.stages.switzerland.treasureHitDenominator).toBe(12.6);
  expect(result.spec.stages.caribbean.treasureHitDenominator).toBe(7.5);
  expect(result.spec.stages.undergroundCity.treasureHitDenominator).toBe(3.0);
  expect(result.spec.stages.alternateSpace).toEqual({ games: 10, averageTreasurePoints: 702000 });

  expect(result.spec.lupinRush.games).toBe(4);
  expect(result.spec.lupinRush.averageTreasurePoints).toBe(342000);
  expect(result.spec.lupinRush.expectationOrder).toEqual([
    'WALTHER','SILHOUETTE','REVOLVER_VISION','ATTACK_VISION'
  ]);
  expect(result.spec.lupinRush.patternSelectionRates).toEqual({
    WALTHER: 63,
    SILHOUETTE: 31,
    REVOLVER_VISION: 5,
    ATTACK_VISION: 1
  });
  expect(result.spec.lupinRush.perPatternAwardDistribution).toBeNull();

  expect(result.spec.treasureHunt.exactOccurrenceTrigger).toBeNull();
  expect(result.spec.treasureHunt.successProbability).toBeNull();
  expect(result.spec.treasureHunt.guaranteedSuccessPresentations).toEqual({
    FLAME_LUPIN_HOLD: { minTreasurePoints: 200000 },
    FUJIKO_HOLD: { minTreasurePoints: 300000 },
    TAMA_CHAN_HOLD: { minTreasurePoints: 1000000 }
  });
  expect(result.spec.treasureHunt.treasureRushRelationship.status).toBe('CONFLICT');
  expect(result.spec.treasureHunt.treasureRushRelationship.publishedClaims).toEqual([
    'SUCCESS_ENTERS_TREASURE_RUSH',
    'SUCCESS_GIVES_TREASURE_RUSH_CHANCE'
  ]);
  expect(result.spec.treasureHunt.treasureRushRelationship.directEntryOnSuccess).toBeNull();
  expect(result.spec.treasureHunt.treasureRushRelationship.entryProbabilityAfterSuccess).toBeNull();

  expect(result.spec.treasureRush.triggerRelation).toBe('TREASURE_HUNT_SUCCESS_RELATED');
  expect(result.spec.treasureRush.games).toEqual({ min: 4, max: 9 });
  expect(result.spec.treasureRush.averageTreasurePoints).toBe(499000);
  expect(result.spec.treasureRush.perGameAwardTable).toBeNull();

  expect(result.spec.extraBonus.triggerPoints).toBe(1000000);
  expect(result.spec.extraBonus.gamesRule).toBe('15_PLUS_REMAINING_ART_GAMES');
  expect(result.spec.extraBonus.oddSymbolSetStockDenominator).toBe(202.6);
  expect(result.spec.extraBonus.goldRushDenominator).toBe(4924.3);

  expect(result.spec.goldRush.baseGames).toBe(1);
  expect(result.spec.goldRush.continuationPercent).toBe(52.6);
  expect(result.spec.goldRush.averageGames).toBe(2.1);

  expect(result.spec.continuationBattle.trigger).toBe('SET_GAMES_EXHAUSTED_WITHOUT_STOCK');
  expect(result.spec.evidence.exactTreasureAwardTable).toBe('UNRESOLVED');
  expect(result.spec.evidence.lupinRushPatternExpectationOrder).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.lupinRushPatternSelectionRates).toBe('PUBLISHED_ANALYSIS');
  expect(result.spec.evidence.lupinRushPerPatternAwardDistribution).toBe('UNRESOLVED');
  expect(result.spec.evidence.treasureHuntGuaranteedSuccessPresentations).toBe('PUBLISHED_ANALYSIS');
  expect(result.spec.evidence.treasureHuntOccurrenceTrigger).toBe('UNRESOLVED');
  expect(result.spec.evidence.treasureHuntSuccessProbability).toBe('UNRESOLVED');
  expect(result.spec.evidence.treasureHuntToTreasureRushRoute).toBe('CONFLICT');
  expect(result.spec.policy.inferTreasurePointAwardAmounts).toBe(false);
  expect(result.spec.policy.inferTreasureHuntOccurrenceTrigger).toBe(false);
  expect(result.spec.policy.inferTreasureHuntSuccessProbability).toBe(false);
  expect(result.spec.policy.inferTreasureRushEntryOnHuntSuccess).toBe(false);
  expect(result.spec.policy.inferStageTransitionRates).toBe(false);
  expect(result.spec.policy.inferRushPatternSelectionRates).toBe(false);
  expect(result.spec.policy.inferRushPerPatternAwardsFromOverallAverage).toBe(false);
  expect(result.spec.policy.interpolateUnlistedContinuationPoints).toBe(false);
});

test('GOLDEN TIME stage scenarios stay exact across setting, initial stage and 10G upgrades', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const scenario = await page.evaluate(async () => {
    const { GT_SYSTEM_SPEC } = await import('/test_lupin_zero/src/gt-system-spec.js');
    return GT_SYSTEM_SPEC.stageScenario;
  });

  expect(scenario.selectionBySetting[1]).toEqual({ A:71.9, B:23.4, C:3.1, D:1.6 });
  expect(scenario.selectionBySetting[6]).toEqual({ A:51.6, B:39.1, C:6.3, D:3.1 });
  expect(scenario.internalStages).toEqual([
    'JAPAN_A','JAPAN_B','SWITZERLAND_A','SWITZERLAND_B',
    'CARIBBEAN_A','CARIBBEAN_B','UNDERGROUND_CITY_A','UNDERGROUND_CITY_B'
  ]);
  expect(scenario.initialStageByScenario.A).toEqual([62.5,12.5,12.5,6.3,1.6,1.6,1.6,1.6]);
  expect(scenario.initialStageByScenario.D).toEqual([12.5,18.8,18.8,18.8,18.8,9.4,1.6,1.6]);
  expect(scenario.upgradeEveryGames).toBe(10);
  expect(scenario.upgradeStepByScenario.A).toEqual({ oneStep:75, twoSteps:25 });
  expect(scenario.upgradeStepByScenario.D).toEqual({ oneStep:25, twoSteps:75 });
  expect(scenario.visibleStageMayLagInternalStage).toBe(true);
});
