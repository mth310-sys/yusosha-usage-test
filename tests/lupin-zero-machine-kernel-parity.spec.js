import { test, expect } from '@playwright/test';

test('MachineCore preserves current browser-facing behavior over pure kernel', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { MachineCore } = await import('/test_lupin_zero/src/machine-core.js');
    const core = new MachineCore({ credit: 5, maxBet: 3 });
    const events = [];
    for (const type of ['change', 'spin-start', 'reel-stop', 'spin-end']) {
      core.addEventListener(type, (event) => events.push({ type, detail: event.detail }));
    }

    const max = core.maxBetNow();
    const afterBet = core.snapshot();
    const start = core.start();
    const afterStart = core.snapshot();
    const stop0 = core.stop(0);
    const stop1 = core.stop(1);
    const stop2 = core.stop(2);
    const afterEnd = core.snapshot();

    return { max, start, stop0, stop1, stop2, afterBet, afterStart, afterEnd, events };
  });

  expect(result.max).toBe(true);
  expect(result.afterBet).toMatchObject({ credit: 2, bet: 3, state: 'READY' });
  expect(result.start).toBe(true);
  expect(result.afterStart).toMatchObject({ state: 'SPINNING', spinId: 1, stopped: [false, false, false] });
  expect([result.stop0, result.stop1, result.stop2]).toEqual([true, true, true]);
  expect(result.afterEnd).toMatchObject({ credit: 2, bet: 0, state: 'IDLE', stopped: [true, true, true], spinId: 1 });
  expect(result.events.map((event) => event.type)).toEqual([
    'change',
    'spin-start',
    'reel-stop',
    'reel-stop',
    'reel-stop',
    'spin-end'
  ]);
});
