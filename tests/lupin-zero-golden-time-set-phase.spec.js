import { test, expect } from '@playwright/test';

test('GT set phase stays main through 29 settled games and enters battle after 30', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const phase = await import('/test_lupin_zero/src/golden-time-set-phase.js');
    return {
      p0: phase.getGoldenTimeSetPhase(0, 40),
      p29: phase.getGoldenTimeSetPhase(29, 40),
      p30: phase.getGoldenTimeSetPhase(30, 40),
      p39: phase.getGoldenTimeSetPhase(39, 40),
      p40: phase.getGoldenTimeSetPhase(40, 40),
      policy: phase.GOLDEN_TIME_SET_PHASE_POLICY
    };
  });

  expect(result.p0).toBe('MAIN');
  expect(result.p29).toBe('MAIN');
  expect(result.p30).toBe('CONTINUATION_BATTLE');
  expect(result.p39).toBe('CONTINUATION_BATTLE');
  expect(result.p40).toBe('COMPLETE');
  expect(result.policy.mainGames).toBe(30);
  expect(result.policy.totalApproxGames).toBe(40);
  expect(result.policy.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(result.policy.continuationBattlePerGameMechanics).toBe('UNRESOLVED');
  expect(result.policy.normalStageResidenceDuringBattle).toBe(false);
  expect(result.policy.syntheticBattleLotteryImplemented).toBe(false);
});

test('GT production profile separates 30G main from unresolved battle window without changing total length', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const gt = await import('/test_lupin_zero/src/golden-time-resolver.js');
    return { profile: gt.createGoldenTimeSetProfile(), policy: gt.GOLDEN_TIME_PRODUCTION_POLICY };
  });

  expect(result.profile.games).toBe(40);
  expect(result.profile.mainGames).toBe(30);
  expect(result.profile.continuationBattleGames).toBe(10);
  expect(result.profile.setCompositionEvidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(result.policy.setComposition).toBe('30G_MAIN_PLUS_REMAINING_CONTINUATION_BATTLE_WINDOW');
  expect(result.policy.continuationBattlePerGameMechanics).toBe('UNRESOLVED');
  expect(result.policy.continuationBattleDoesNotCreateFourthNormalStageResidenceBlock).toBe(true);
});
