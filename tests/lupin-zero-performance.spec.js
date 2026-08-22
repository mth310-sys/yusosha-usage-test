import { test, expect } from '@playwright/test';

test('Lupin ZERO performance table preserves published values and semantic conflict', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/performance-spec.js');
    return {
      spec: mod.PERFORMANCE_SPEC,
      initial1: mod.getPublishedInitialHitDenominator(1),
      initial6: mod.getPublishedInitialHitDenominator(6),
      payout1: mod.getPublishedPayoutPercent(1),
      payout6: mod.getPublishedPayoutPercent(6),
      invalid: mod.getPublishedInitialHitDenominator(7)
    };
  });

  expect(result.spec.publishedInitialHitDenominatorBySetting).toEqual({
    1: 350.6,
    2: 335.4,
    3: 347.9,
    4: 304.2,
    5: 330.0,
    6: 282.0
  });
  expect(result.spec.payoutPercentBySetting).toEqual({
    1: 96.6,
    2: 97.6,
    3: 100.4,
    4: 102.4,
    5: 105.4,
    6: 110.8
  });

  expect(result.initial1).toBe(350.6);
  expect(result.initial6).toBe(282.0);
  expect(result.payout1).toBe(96.6);
  expect(result.payout6).toBe(110.8);
  expect(result.invalid).toBeNull();

  expect(result.spec.initialHitSemantic.status).toBe('CONFLICT');
  expect(result.spec.initialHitSemantic.publishedClaims).toEqual([
    'GOLDEN_TIME_INITIAL_HIT',
    'ART_LUPIN_BONUS_RAIUN_COMBINED_INITIAL_HIT'
  ]);
  expect(result.spec.initialHitSemantic.canonicalRouteProbabilityMeaning).toBeNull();

  expect(result.spec.consistencyAudit.initialHitDistributionSumsTo100BySetting).toBe(true);
  expect(result.spec.consistencyAudit.ceilingDistributionSumsTo100BySetting).toBe(true);
  expect(result.spec.consistencyAudit.payoutTableStrictlyIncreasesWithSetting).toBe(true);
  expect(result.spec.consistencyAudit.initialHitDenominatorMonotonicBySetting).toBe(false);
  expect(result.spec.consistencyAudit.routeFrequencyDerivationAllowed).toBe(false);

  expect(result.spec.evidence.initialHitDenominatorValues).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.payoutPercentages).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.initialHitSemantic).toBe('CONFLICT');

  expect(result.spec.policy.deriveRouteFrequenciesFromInitialHitDenominator).toBe(false);
  expect(result.spec.policy.normalizeConflictingInitialHitLabels).toBe(false);
  expect(result.spec.policy.inferMissingInternalLotteriesFromPayout).toBe(false);
  expect(result.spec.policy.tuneUnresolvedProbabilitiesToMatchMachinePayout).toBe(false);
});
