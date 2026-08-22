import { test, expect } from '@playwright/test';

test('Raiun and Shin Raiun keep verified structure and unresolved boundaries exact', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const spec = await page.evaluate(async () => {
    const { RAIUN_MODE_SPEC } = await import('/test_lupin_zero/src/raiun-mode-spec.js');
    return RAIUN_MODE_SPEC;
  });

  expect(spec.raiunHigh.entryTrigger).toBe('RAIUN_COUNTER_REACHES_100');
  expect(spec.raiunHigh.games).toBe(7);
  expect(spec.raiunHigh.states.LOW).toEqual({ raiunModeHitDenominator: 30.5, expectationPercent: 20 });
  expect(spec.raiunHigh.states.HIGH).toEqual({ raiunModeHitDenominator: 13.3, expectationPercent: 40 });

  expect(spec.raiunMode.games).toBe(20);
  expect(spec.raiunMode.netIncreasePerGame).toBe(2.0);
  expect(spec.raiunMode.artExpectationPercent).toBe(23.0);
  expect(spec.raiunMode.artSuccessPresentation).toBe('LCD_7_ALIGNED');
  expect(spec.raiunMode.exactPerRoleArtLottery).toBeNull();
  expect(spec.raiunMode.gameCeilingCounterResetsOnEntry).toBe(false);

  expect(spec.shinRaiunMode.entryRoutes).toEqual([
    { trigger: 'RAIUN_MODE_SELECTED', selectionPercent: 0.8 },
    { trigger: 'GAME_CEILING_REACHED_DURING_RAIUN_MODE', selectionPercent: 100 }
  ]);
  expect(spec.shinRaiunMode.durationRule).toBe('CONTINUES_UNTIL_ART_HIT');
  expect(spec.shinRaiunMode.artGuaranteedEventually).toBe(true);
  expect(spec.shinRaiunMode.legendGateRelationship.status).toBe('CONFLICT');
  expect(spec.shinRaiunMode.legendGateRelationship.publishedClaims).toEqual([
    'LEGEND_GATE_GUARANTEED_ON_SHIN_RAIUN_ENTRY',
    'LEGEND_GATE_ENTRY_RATE_DURING_SHIN_RAIUN_IS_1_OVER_88_9'
  ]);
  expect(spec.shinRaiunMode.legendGateRelationship.guaranteedOnEntry).toBeNull();
  expect(spec.shinRaiunMode.legendGateRelationship.duringModeHitDenominator).toBe(88.9);
  expect(spec.shinRaiunMode.exactArtLotteryPerGame).toBeNull();

  expect(spec.evidence.shinRaiunLegendGateRelationship).toBe('CONFLICT');
  expect(spec.policy.inferRaiunPerRoleArtLotteryFromOverallExpectation).toBe(false);
  expect(spec.policy.inferShinRaiunArtLotteryFromLegendGateRate).toBe(false);
  expect(spec.policy.resolveLegendGateConflictByGuessing).toBe(false);
});
