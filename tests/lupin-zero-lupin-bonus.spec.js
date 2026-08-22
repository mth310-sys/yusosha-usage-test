import { test, expect } from '@playwright/test';

test('LUPIN BONUS keeps verified GT route and unresolved lottery tables separate', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const spec = await page.evaluate(async () => {
    const { LUPIN_BONUS_SPEC } = await import('/test_lupin_zero/src/lupin-bonus-spec.js');
    return LUPIN_BONUS_SPEC;
  });

  expect(spec.category).toBe('PSEUDO_BONUS_ART');
  expect(spec.entryTrigger).toBe('ODD_SYMBOL_ALIGNED');
  expect(spec.pureIncreaseCoinsPerGame).toBe(2.0);
  expect(spec.gamesApprox).toBe(35);
  expect(spec.episodeCount).toBe(11);
  expect(spec.goldenTimeExpectedRatePercentApprox).toBe(50);

  expect(spec.progression.finalBattle).toEqual({
    opponent: 'ZENIGATA',
    games: 5,
    winEffect: 'GOLDEN_TIME_ENTRY',
    loseEffect: 'BONUS_END_OR_POST_BONUS_FLOW'
  });

  expect(spec.goldenTimeLottery.occursDuringBonus).toBe(true);
  expect(spec.goldenTimeLottery.finalBattleIsMainResultPresentation).toBe(true);
  expect(spec.goldenTimeLottery.exactPerRoleHitTable).toBeNull();
  expect(spec.goldenTimeLottery.exactInternalStateTable).toBeNull();
  expect(spec.goldenTimeLottery.exactBattleBranchRates).toBeNull();

  expect(spec.evidence.baseProfile).toBe('MULTI_SOURCE_MATCH');
  expect(spec.evidence.finalFiveGameBattle).toBe('MULTI_SOURCE_MATCH');
  expect(spec.evidence.exactPerRoleHitTable).toBe('UNRESOLVED');
  expect(spec.evidence.exactInternalStateTable).toBe('UNRESOLVED');
  expect(spec.evidence.exactBattleBranchRates).toBe('UNRESOLVED');

  expect(spec.policy.inferPerRoleHitRates).toBe(false);
  expect(spec.policy.inferInternalStateRates).toBe(false);
  expect(spec.policy.inferBattleBranchRates).toBe(false);
  expect(spec.policy.convertApproxExpectationToExactProbability).toBe(false);
});
