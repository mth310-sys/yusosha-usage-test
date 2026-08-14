import { test, expect } from '@playwright/test';

test('Lupin B4 red Raiun counter uses HIGH at 100pt, survives LB, and clears on GT', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const highCore = new GameCore({ setting:1, seed:0x6af });
    const redSet = highCore.setRaiunCounterRedForTest();
    highCore.normal.raiun.points=100;
    highCore.normal.raiun.state='100PT_READY_HIGH_LEVEL_UNVERIFIED';
    const high = highCore.normal.completeGame();

    const persistCore = new GameCore({ setting:1, seed:0x6b0 });
    persistCore.setRaiunCounterRedForTest();
    const beforeLb = persistCore.normal.raiun.counterColor;
    const lbStarted = persistCore.lupinBonus.start('DEBUG_RED_COUNTER_PERSISTENCE');
    const duringLb = persistCore.normal.raiun.counterColor;
    persistCore.lupinBonus.reset();
    const afterLb = persistCore.normal.raiun.counterColor;

    const gtStarted = persistCore.startGoldenTimeForTest(0);
    const afterGt = persistCore.normal.raiun.counterColor;
    const clearSource = persistCore.normal.raiun.counterColorSource;

    return {
      redSet,
      highMode:high.mode,
      highLevel:high.raiun.highLevel,
      highDenominator:high.raiun.highEntryDenominator,
      highExpectation:high.raiun.highExpectation,
      highEntrySource:high.raiun.entrySource,
      highColor:high.raiun.counterColor,
      beforeLb,
      lbStarted,
      duringLb,
      afterLb,
      gtStarted,
      afterGt,
      clearSource
    };
  });

  expect(result.redSet).toBe(true);
  expect(result.highMode).toBe('RAIUN_HIGH');
  expect(result.highLevel).toBe('HIGH');
  expect(result.highDenominator).toBe(13.3);
  expect(result.highExpectation).toBe(40);
  expect(result.highEntrySource).toBe('VERIFIED_RED_COUNTER_100PT_HIGH');
  expect(result.highColor).toBe('RED');

  expect(result.beforeLb).toBe('RED');
  expect(result.lbStarted).toBe(true);
  expect(result.duringLb).toBe('RED');
  expect(result.afterLb).toBe('RED');

  expect(result.gtStarted).toBe(true);
  expect(result.afterGt).toBe('BLUE');
  expect(result.clearSource).toBe('DEBUG_GOLDEN_TIME_START_VERIFIED_ART_CLEAR');
});
