import { test, expect } from '@playwright/test';

test('initial-hit destination selection stays exact by setting and keeps override semantics explicit', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/initial-hit-spec.js');
    return {
      spec: mod.INITIAL_HIT_SPEC,
      setting1: mod.getInitialHitDistribution(1),
      setting3: mod.getInitialHitDistribution(3),
      setting4: mod.getInitialHitDistribution(4),
      setting6: mod.getInitialHitDistribution(6),
      invalid: mod.getInitialHitDistribution(7),
      sevenAttack: mod.isNextInitialHitArtGuaranteed('SEVEN_ATTACK_FAILED'),
      sevenReach: mod.isNextInitialHitArtGuaranteed('SEVEN_SYMBOL_REACH_DEVELOPMENT_FAILED'),
      unknown: mod.isNextInitialHitArtGuaranteed('UNKNOWN')
    };
  });

  expect(result.setting1).toEqual({ lupinBonusPercent:98.4, goldenTimePercent:1.6 });
  expect(result.setting3).toEqual({ lupinBonusPercent:95.3, goldenTimePercent:4.7 });
  expect(result.setting4).toEqual({ lupinBonusPercent:96.9, goldenTimePercent:3.1 });
  expect(result.setting6).toEqual({ lupinBonusPercent:95.3, goldenTimePercent:4.7 });
  expect(result.invalid).toBeNull();

  expect(result.spec.selectionTiming.point).toBe('PREVIOUS_LUPIN_BONUS_OR_ART_END');
  expect(result.spec.bypasses.artCertainTriggersIgnoreStoredSelection).toBe(true);
  expect(result.spec.presentationCaveat.directArtMayPassThroughLupinBonusPreparation).toBe(true);

  expect(result.sevenAttack).toBe(true);
  expect(result.sevenReach).toBe(true);
  expect(result.unknown).toBe(false);

  expect(result.spec.evidence.selectionBySetting).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.sevenAttackFailureNextArt).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.sevenReachFailureNextArt).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.policy.inferOtherInitialHitDestinations).toBe(false);
  expect(result.spec.policy.inferHiddenPromotionRates).toBe(false);
  expect(result.spec.policy.inferVisualClassificationFromPreparationFlow).toBe(false);
});
