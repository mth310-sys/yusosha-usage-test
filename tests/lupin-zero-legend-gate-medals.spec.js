import { test, expect } from '@playwright/test';

test('Legend Gate medal model preserves published rewards and inferred boundary', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const resolver = await import('/test_lupin_zero/src/legend-gate-medal-resolver.js');
    const spec = await import('/test_lupin_zero/src/legend-gate-spec.js');

    const source = (values) => ({
      values: [...values],
      nextFloat() { return this.values.shift() ?? 0.99; }
    });

    const allThree = resolver.resolveLegendGateMedals(source([0.1, 0.2, 0.3]));
    const two = resolver.resolveLegendGateMedals(source([0.1, 0.2, 0.9]));
    const zeroFallback = resolver.resolveLegendGateMedals(source([0.9, 0.9, 0.9, 0.5]));

    return {
      model: resolver.LEGEND_GATE_MEDAL_MODEL,
      story: resolver.LEGEND_GATE_STORY_STEPS,
      allThree,
      two,
      zeroFallback,
      stock1: spec.getLegendGateMinimumStocks(1),
      stock2: spec.getLegendGateMinimumStocks(2),
      stock3: spec.getLegendGateMinimumStocks(3),
      specialMovie: spec.LEGEND_GATE_SPEC.sevenMedal.specialMovieGamesOnAllThree
    };
  });

  expect(result.story.map((x) => x.character)).toEqual(['次元', '五ェ門', 'ルパン']);
  expect(result.story.map((x) => x.label)).toEqual(['セブンサファイア', 'セブンエメラルド', 'セブンルビー']);
  expect(result.stock1).toBe(2);
  expect(result.stock2).toBe(5);
  expect(result.stock3).toBe(6);
  expect(result.specialMovie).toBe(70);

  expect(result.allThree.medalCount).toBe(3);
  expect(result.allThree.minimumStocks).toBe(6);
  expect(result.allThree.specialMovieGames).toBe(70);
  expect(result.two.medalCount).toBe(2);
  expect(result.two.minimumStocks).toBe(5);

  expect(result.zeroFallback.medalCount).toBe(1);
  expect(result.zeroFallback.minimumStocks).toBe(2);
  expect(result.zeroFallback.exactDistributionKnown).toBe(false);
  expect(result.model.evidenceStatus).toBe('INFERRED_HIGH_CONFIDENCE');
  expect(result.model.replaceWhenExactDistributionKnown).toBe(true);
});
