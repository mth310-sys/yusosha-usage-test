import { test, expect } from '@playwright/test';

test('pending GOLDEN_TIME_STOCKS rejects invalid minimum stock counts before GT start', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/normal-reward-route-patch.js?v=step6z-normal-reward-route1');

    const capture = (core) => ({
      normalMode: core.normal.mode,
      pendingReward: core.normal.pendingReward ? { ...core.normal.pendingReward } : null,
      transitionSource: core.normal.transitionSource,
      lastEvent: core.normal.lastEvent,
      goldenTime: core.goldenTime.snapshot()
    });

    const runInvalid = (minStocks) => {
      const core = new GameCore({ setting: 1, seed: 1 });
      core.normal.pendingReward = {
        type: 'GOLDEN_TIME_STOCKS',
        source: 'TEST_PENDING_GT_STOCKS',
        guarantee: 'GT_STOCKS_TEST',
        minStocks,
        status: 'PENDING_GOLDEN_TIME_STOCK_ENGINE'
      };
      const before = capture(core);
      let out = null;
      let error = null;
      try { out = core.startGoldenTimeFromPending(); }
      catch (caught) { error = String(caught?.message ?? caught); }
      return { before, after: capture(core), out, error };
    };

    const valid = new GameCore({ setting: 1, seed: 1 });
    valid.normal.pendingReward = {
      type: 'GOLDEN_TIME_STOCKS',
      source: 'TEST_PENDING_GT_STOCKS',
      guarantee: 'GT_STOCKS_2_OR_MORE',
      minStocks: 2,
      status: 'PENDING_GOLDEN_TIME_STOCK_ENGINE'
    };
    const validOut = valid.startGoldenTimeFromPending();
    const validAfter = capture(valid);

    return {
      unknown: runInvalid('UNKNOWN'),
      zero: runInvalid(0),
      decimal: runInvalid(2.9),
      valid: { out: validOut, after: validAfter }
    };
  });

  for (const invalid of [result.unknown, result.zero, result.decimal]) {
    expect(invalid.error).toBeNull();
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.goldenTime.state).toBe('IDLE');
    expect(invalid.after.pendingReward?.type).toBe('GOLDEN_TIME_STOCKS');
  }

  expect(result.valid.out).toBeTruthy();
  expect(result.valid.after.normalMode).toBe('NORMAL');
  expect(result.valid.after.pendingReward).toBeNull();
  expect(result.valid.after.goldenTime.state).not.toBe('IDLE');
  expect(result.valid.after.goldenTime.stock).toBe(2);
});
