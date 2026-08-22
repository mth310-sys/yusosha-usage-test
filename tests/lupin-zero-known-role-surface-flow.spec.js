import { test, expect } from '@playwright/test';

test('known normal-role draw flows through machine events into physical surface state', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { SequenceRandomSource } = await import('/test_lupin_zero/src/random-source.js');
    const { NormalGameKernel } = await import('/test_lupin_zero/src/normal-game-kernel.js');
    const { MachineSurfaceState } = await import('/test_lupin_zero/src/machine-surface-state.js');

    const kernel = new NormalGameKernel({ credit: 50, maxBet: 3, setting: 1 });
    const surface = new MachineSurfaceState();

    kernel.betMax();
    kernel.leverOn();
    const resolution = kernel.resolveRoleFromRandom(new SequenceRandomSource([0]));
    kernel.stop(0);
    kernel.stop(1);
    kernel.stop(2);

    for (const event of kernel.getTrace()) surface.apply(event);

    return {
      resolution,
      kernel: kernel.snapshot(),
      surface: surface.snapshot(),
      eventTypes: kernel.getTrace().map((event) => event.type)
    };
  });

  expect(result.resolution.accepted).toBe(true);
  expect(result.resolution.result.role).toBe('PREMIUM');
  expect(result.kernel.game).toBe(1);
  expect(result.kernel.phase).toBe('IDLE');
  expect(result.surface.reelsSpinning).toBe(false);
  expect(result.surface.stopButtonsArmed).toBe(false);
  expect(result.surface.stopButtonsPressed).toEqual([true, true, true]);
  expect(result.eventTypes).toContain('machine:role-resolved');
  expect(result.eventTypes).toContain('machine:game-committed');
});
