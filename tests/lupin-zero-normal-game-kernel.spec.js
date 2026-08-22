import { test, expect } from '@playwright/test';

test('normal game kernel emits a full physical-machine event cycle without inventing role lottery', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { NormalGameKernel, NORMAL_GAME_KERNEL_POLICY } = await import('/test_lupin_zero/src/normal-game-kernel.js');
    const kernel = new NormalGameKernel({ credit: 50, maxBet: 3 });
    const bet = kernel.betMax();
    const lever = kernel.leverOn();
    const role = kernel.resolveKnownRole('NINE_COIN');
    const stop1 = kernel.stop(2);
    const stop2 = kernel.stop(0);
    const stop3 = kernel.stop(1);
    return {
      bet, lever, role, stop1, stop2, stop3,
      state: kernel.snapshot(),
      trace: kernel.getTrace().map(({ type, detail }) => ({ type, detail })),
      policy: NORMAL_GAME_KERNEL_POLICY
    };
  });

  expect(result.bet).toBe(true);
  expect(result.lever).toBe(true);
  expect(result.role).toBe(true);
  expect(result.stop1 && result.stop2 && result.stop3).toBe(true);
  expect(result.state.credit).toBe(56);
  expect(result.state.game).toBe(1);
  expect(result.state.phase).toBe('IDLE');
  expect(result.policy.internalRoleLotteryImplemented).toBe(false);
  expect(result.policy.unresolvedRoleLottery).toBe('UNRESOLVED');

  const types = result.trace.map(event => event.type);
  expect(types).toEqual([
    'machine:bet-accepted',
    'machine:lever-on',
    'machine:reels-spin-start',
    'machine:role-resolved',
    'machine:stop-button-armed',
    'machine:stop-button-pressed',
    'machine:reel-stopped',
    'machine:stop-button-pressed',
    'machine:reel-stopped',
    'machine:stop-button-pressed',
    'machine:reel-stopped',
    'machine:payout-committed',
    'machine:game-committed'
  ]);

  const reelStops = result.trace.filter(event => event.type === 'machine:reel-stopped');
  expect(reelStops.map(event => event.detail.index)).toEqual([2, 0, 1]);
});
