import { test, expect } from '@playwright/test';

test('Golden Time start rejects unsupported settings and invalid stock counts without mutation', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const capture = (gt) => ({
      state: gt.state,
      setNo: gt.setNo,
      guaranteedStocks: gt.guaranteedStocks,
      stockAddedTotal: gt.stockAddedTotal,
      entrySource: gt.entrySource,
      lastEvent: gt.lastEvent,
      rushRemainingGames: gt.rushRemainingGames,
      rushResultSource: gt.rushResultSource,
      stageScenario: gt.stageScenario,
      stageScenarioSource: gt.stageScenarioSource
    });

    const run = (setting, guaranteedStocks) => {
      const gt = new GoldenTimeSystem(new RNG(1), setting);
      const before = capture(gt);
      const out = gt.start({ guaranteedStocks, source:'GT_START_GUARD_TEST' });
      return { before, after:capture(gt), out };
    };

    return {
      setting0: run(0, 0),
      setting7: run(7, 2),
      negative: run(1, -1),
      decimal: run(1, 2.9),
      text: run(1, 'UNKNOWN'),
      infinity: run(1, Infinity),
      zero: run(1, 0),
      two: run(1, 2)
    };
  });

  for (const invalid of [result.setting0, result.setting7, result.negative, result.decimal, result.text, result.infinity]) {
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.state).toBe('IDLE');
  }

  expect(result.zero.out).toBe(true);
  expect(result.zero.after.state).toBe('LUPIN_RUSH_ACTIVE');
  expect(result.zero.after.setNo).toBe(1);
  expect(result.zero.after.guaranteedStocks).toBe(0);
  expect(result.zero.after.stockAddedTotal).toBe(0);
  expect(result.zero.after.entrySource).toBe('GT_START_GUARD_TEST');
  expect(result.zero.after.stageScenario).not.toBeNull();

  expect(result.two.out).toBe(true);
  expect(result.two.after.state).toBe('LUPIN_RUSH_ACTIVE');
  expect(result.two.after.guaranteedStocks).toBe(2);
  expect(result.two.after.stockAddedTotal).toBe(2);
  expect(result.two.after.entrySource).toBe('GT_START_GUARD_TEST');
  expect(result.two.after.stageScenario).not.toBeNull();
});
