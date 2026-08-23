import { test, expect } from '@playwright/test';

test('GT 30G boundary is stage-residence only and does not assert continuation battle entry', async ({ page }) => {
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

  expect(result.p0).toBe('MAIN_STAGE_WINDOW');
  expect(result.p29).toBe('MAIN_STAGE_WINDOW');
  expect(result.p30).toBe('POST_STAGE_WINDOW_UNRESOLVED');
  expect(result.p39).toBe('POST_STAGE_WINDOW_UNRESOLVED');
  expect(result.p40).toBe('COMPLETE');
  expect(result.policy.stageResidenceWindowGames).toBe(30);
  expect(result.policy.totalApproxGames).toBe(40);
  expect(result.policy.stageResidenceWindowEvidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(result.policy.continuationBattleExactEntryGame).toBeNull();
  expect(result.policy.continuationBattleExactEntryGameEvidenceStatus).toBe('UNRESOLVED');
  expect(result.policy.thirtyGameResidenceMustNotImplyBattleEntry).toBe(true);
  expect(result.policy.previousB4BattlePresentationGamesCandidate).toBe(4);
  expect(result.policy.previousB4BattlePresentationEvidenceStatus).toBe('REUSED_PREVIOUS_VERIFIED_PARTIAL_REQUIRES_ZERO_RECONFIRMATION');
  expect(result.policy.continuationBattlePerGameMechanics).toBe('UNRESOLVED');
  expect(result.policy.syntheticBattleLotteryImplemented).toBe(false);
  expect(result.policy.continuationResolutionPipeline).toBe('REUSE_EXISTING_STOCK_TREASURE_BATTLE_REVENGE_PIPELINE');
  expect(result.policy.stockPriorityResolverReused).toBe(true);
  expect(result.policy.revengeChanceRuntimeReused).toBe(true);
  expect(result.policy.duplicateContinuationResolverImplemented).toBe(false);
});

test('GT production profile keeps approximate 40G total while battle timing remains unresolved', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const gt = await import('/test_lupin_zero/src/golden-time-resolver.js');
    return { profile: gt.createGoldenTimeSetProfile(), policy: gt.GOLDEN_TIME_PRODUCTION_POLICY };
  });

  expect(result.profile.games).toBe(40);
  expect(result.profile.stageResidenceValidationGames).toBe(30);
  expect(result.profile.continuationBattleEntryGame).toBeNull();
  expect(result.profile.continuationBattlePresentationGames).toBeNull();
  expect(result.profile.setCompositionEvidenceStatus).toBe('UNRESOLVED');
  expect(result.profile.previousB4BattlePresentationGamesCandidate).toBe(4);
  expect(result.policy.stageResidenceValidationGames).toBe(30);
  expect(result.policy.stageResidenceValidationMustNotDefineBattleEntry).toBe(true);
  expect(result.policy.continuationBattleExactEntryGame).toBeNull();
  expect(result.policy.continuationBattleExactPresentationGames).toBeNull();
  expect(result.policy.continuationBattleTimingEvidenceStatus).toBe('UNRESOLVED');
  expect(result.policy.continuationBattlePerGameMechanics).toBe('UNRESOLVED');
});

test('GT set phase runtime exposes unresolved post-stage boundary without fake battle label', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const runtime = await page.evaluate(() => ({
    hasGetter: typeof window.__LUPIN_ZERO__?.getGoldenTimeSetPhaseState === 'function',
    policy: window.__LUPIN_ZERO__?.goldenTimeSetPhasePolicy ?? null,
    state: window.__LUPIN_ZERO__?.getGoldenTimeSetPhaseState?.() ?? null
  }));

  expect(runtime.hasGetter).toBe(true);
  expect(runtime.policy.stageResidenceWindowGames).toBe(30);
  expect(runtime.policy.continuationBattleExactEntryGame).toBeNull();
  expect(runtime.policy.continuationBattlePerGameMechanics).toBe('UNRESOLVED');
  expect(runtime.policy.continuationResolutionPipeline).toBe('REUSE_EXISTING_STOCK_TREASURE_BATTLE_REVENGE_PIPELINE');
  expect(runtime.state.phase).toBe('MAIN_STAGE_WINDOW');
});
