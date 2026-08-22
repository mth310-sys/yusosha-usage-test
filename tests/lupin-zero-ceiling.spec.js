import { test, expect } from '@playwright/test';

test('normal ceiling selection stays exact by setting', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const mod = await import('/test_lupin_zero/src/ceiling-spec.js');
    return {
      spec: mod.CEILING_SPEC,
      s1: mod.getCeilingSelection(1),
      s6: mod.getCeilingSelection(6),
      invalid: mod.getCeilingSelection(7)
    };
  });

  expect(result.spec.counter.selectableGames).toEqual([499, 999]);
  expect(result.spec.counter.resetByRaiunMode).toBe(false);
  expect(result.s1).toEqual({ 499: 0.8, 999: 99.2 });
  expect(result.s6).toEqual({ 499: 12.5, 999: 87.5 });
  expect(result.invalid).toBeNull();

  expect(result.spec.normalArrival.destination).toBe('LUPIN_BONUS');
  expect(result.spec.normalArrival.directGoldenTimeFromCeiling).toBeNull();
  expect(result.spec.normalArrival.directGoldenTimeProbability).toBeNull();

  expect(result.spec.evidence.ceilingSelectionBySetting).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.normalCeilingDestination).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.policy.inferUnlistedCeilingGames).toBe(false);
  expect(result.spec.policy.inferDirectGoldenTimeFromCeiling).toBe(false);
});

test('Raiun ceiling arrival uses Shin Raiun override without resolving Legend Gate conflict', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const spec = await page.evaluate(async () => {
    const { CEILING_SPEC } = await import('/test_lupin_zero/src/ceiling-spec.js');
    return CEILING_SPEC;
  });

  expect(spec.raiunArrivalOverride.condition).toBe('CEILING_REACHED_WHILE_RAIUN_MODE_ACTIVE');
  expect(spec.raiunArrivalOverride.destination).toBe('SHIN_RAIUN_MODE');
  expect(spec.raiunArrivalOverride.goldenTimeGuaranteed).toBe(true);
  expect(spec.raiunArrivalOverride.legendGateRelationshipStatus).toBe('CONFLICT');
  expect(spec.evidence.raiunCeilingOverride).toBe('MULTI_SOURCE_MATCH');
  expect(spec.evidence.shinRaiunLegendGateRelationship).toBe('CONFLICT');
  expect(spec.policy.inferLegendGateGuaranteeFromShinRaiun).toBe(false);
  expect(spec.policy.reinterpretRaiunAsCeilingReset).toBe(false);
});
