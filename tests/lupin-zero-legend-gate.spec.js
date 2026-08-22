import { test, expect } from '@playwright/test';

test('Legend Gate keeps published entry and Seven Medal stock structure exact', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const legend = await import('/test_lupin_zero/src/legend-gate-spec.js');
    return {
      spec: legend.LEGEND_GATE_SPEC,
      setting1: legend.getLegendGateEntryDenominator(1),
      setting5: legend.getLegendGateEntryDenominator(5),
      setting6: legend.getLegendGateEntryDenominator(6),
      shin: legend.getLegendGateEntryDenominator(1, { shinRaiun: true }),
      stocks1: legend.getLegendGateMinimumStocks(1),
      stocks2: legend.getLegendGateMinimumStocks(2),
      stocks3: legend.getLegendGateMinimumStocks(3),
      stocks4: legend.getLegendGateMinimumStocks(4),
      range1: legend.getLegendGateExpectedSetRange(1),
      range3: legend.getLegendGateExpectedSetRange(3)
    };
  });

  expect(result.setting1).toBe(27127.0);
  expect(result.setting5).toBe(14840.9);
  expect(result.setting6).toBe(12100.7);
  expect(result.shin).toBe(88.9);

  expect(result.stocks1).toBe(2);
  expect(result.stocks2).toBe(5);
  expect(result.stocks3).toBe(6);
  expect(result.stocks4).toBeNull();

  expect(result.range1).toEqual({ min: 10.7, max: 12.1 });
  expect(result.range3).toEqual({ min: 16.7, max: 18.4 });

  expect(result.spec.entry.trigger).toBe('LONG_FREEZE');
  expect(result.spec.entry.shinRaiunRelationshipStatus).toBe('CONFLICT');
  expect(result.spec.story.exactSuccessMechanics).toBeNull();
  expect(result.spec.sevenMedal.exactAdditionalStockDistribution).toBeNull();
  expect(result.spec.sevenMedal.medalAcquisitionDistribution).toBeNull();

  expect(result.spec.evidence.minimumStocksByMedalCount).toBe('MULTI_SOURCE_MATCH');
  expect(result.spec.evidence.outsideShinRaiunEntryDenominators).toBe('PUBLISHED_ANALYSIS');
  expect(result.spec.evidence.shinRaiunRelationship).toBe('CONFLICT');
  expect(result.spec.evidence.expectedSetsByMedalCount).toBe('PUBLISHED_ANALYSIS');
  expect(result.spec.evidence.exactSuccessMechanics).toBe('UNRESOLVED');

  expect(result.spec.policy.inferAdditionalStocksAboveMinimum).toBe(false);
  expect(result.spec.policy.inferMedalAcquisitionDistribution).toBe(false);
  expect(result.spec.policy.inferStorySuccessProbability).toBe(false);
  expect(result.spec.policy.resolveShinRaiunConflictByGuessing).toBe(false);
});
