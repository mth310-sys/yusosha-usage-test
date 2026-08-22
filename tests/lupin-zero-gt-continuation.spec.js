import { test, expect } from '@playwright/test';

test('GOLDEN TIME continuation battle and revenge flow preserve published boundaries', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/gt-continuation-spec.js');
    return {
      spec: mod.GT_CONTINUATION_SPEC,
      p5: mod.getRevengePullbackPercent(50000),
      p75: mod.getRevengePullbackPercent(750000),
      p95: mod.getRevengePullbackPercent(950000),
      unlisted: mod.getRevengePullbackPercent(100000)
    };
  });

  expect(result.spec.battle.opponentCount).toBe(5);
  expect(result.spec.battle.opponentsByExpectation).toEqual([
    'ZENIGATA',
    'ZENIGATA_ROBOT',
    'GANG_SUPPRESSION_ROBOT',
    'MASS_PRODUCED_ZENIGATA_ROBOT',
    'FUJIKO'
  ]);
  expect(result.spec.battle.weakestPublishedOpponent).toBe('ZENIGATA');
  expect(result.spec.battle.strongestPublishedOpponent).toBe('FUJIKO');
  expect(result.spec.battle.winEffect).toBe('NEXT_SET_AND_LUPIN_RUSH');
  expect(result.spec.battle.exactOpponentSelectionRates).toBeNull();
  expect(result.spec.battle.exactOpponentWinRates).toBeNull();

  expect(result.spec.revengeChance.publishedGames).toBe(10);
  expect(result.spec.revengeChance.objective).toBe('GATHER_ALL_ALLIES');
  expect(result.spec.revengeChance.successEffect).toBe('LUPIN_BONUS_PULLBACK');
  expect(result.spec.revengeChance.pullbackLotteryBasis).toBe('TREASURE_POINTS_AT_BATTLE_LOSS');
  expect(result.spec.revengeChance.averagePullbackPercent).toBe(5.6);
  expect(result.p5).toBe(2.3);
  expect(result.p75).toBe(12.5);
  expect(result.p95).toBe(50);
  expect(result.unlisted).toBeNull();

  expect(result.spec.evidence.exactOpponentExpectationOrder).toBe('PUBLISHED_ANALYSIS');
  expect(result.spec.evidence.exactOpponentSelectionRates).toBe('UNRESOLVED');
  expect(result.spec.evidence.exactOpponentWinRates).toBe('UNRESOLVED');
  expect(result.spec.evidence.pullbackPercentTable).toBe('PUBLISHED_ANALYSIS');
  expect(result.spec.policy.inferOpponentSelectionRates).toBe(false);
  expect(result.spec.policy.inferOpponentWinRates).toBe(false);
  expect(result.spec.policy.interpolateUnlistedPullbackRates).toBe(false);
});
