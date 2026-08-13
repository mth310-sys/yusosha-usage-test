import { test, expect } from '@playwright/test';

test('Legend Gate stock rewards reject invalid counts and keep verified integer count', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('./js/game-core.js?v=test-legend-stock-guard');
    await import('./js/normal-reward-route-patch.js?v=test-legend-stock-guard');

    const makeCore = () => new GameCore();
    const run = (minStocks) => {
      const core = makeCore();
      core.normal.pendingReward = { type:'GOLDEN_TIME_STOCKS', minStocks, source:'LEGEND_GATE_TEST' };
      const out = core.resolveNormalInitialHitPending();
      return {
        out,
        pendingReward: core.normal.pendingReward,
        gtState: core.goldenTime.state,
        guaranteedStocks: core.goldenTime.guaranteedStocks ?? null
      };
    };

    return {
      decimal: run(2.9),
      zero: run(0),
      negative: run(-1),
      text: run('UNKNOWN'),
      infinity: run(Infinity),
      verifiedTwo: run(2)
    };
  });

  for (const key of ['decimal','zero','negative','text','infinity']) {
    expect(result[key].out).toBeNull();
    expect(result[key].pendingReward).not.toBeNull();
    expect(result[key].gtState).toBe('IDLE');
  }

  expect(result.verifiedTwo.out?.destination).toBe('GOLDEN_TIME');
  expect(result.verifiedTwo.out?.guaranteedStocks).toBe(2);
  expect(result.verifiedTwo.pendingReward).toBeNull();
  expect(result.verifiedTwo.gtState).not.toBe('IDLE');
});
