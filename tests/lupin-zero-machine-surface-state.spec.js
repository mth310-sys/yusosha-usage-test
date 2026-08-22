import { test, expect } from '@playwright/test';

test('real-machine surface state follows kernel events but does not invent LED or mechanism cues', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(async () => {
    const { NormalGameKernel } = await import('/test_lupin_zero/src/normal-game-kernel.js');
    const { MachineSurfaceState, MACHINE_SURFACE_POLICY } = await import('/test_lupin_zero/src/machine-surface-state.js');
    const kernel = new NormalGameKernel({ credit: 50 });
    const surface = new MachineSurfaceState();

    kernel.betMax();
    kernel.leverOn();
    kernel.resolveKnownRole('REPLAY');
    kernel.stop(0);
    kernel.stop(1);
    kernel.stop(2);

    const snapshots = kernel.getTrace().map(event => surface.apply(event));
    return {
      finalSurface: surface.snapshot(),
      snapshots,
      policy: MACHINE_SURFACE_POLICY
    };
  });

  expect(result.finalSurface.reelsSpinning).toBe(false);
  expect(result.finalSurface.stopButtonsArmed).toBe(false);
  expect(result.finalSurface.stopButtonsPressed).toEqual([true, true, true]);
  expect(result.finalSurface.leftFrameLed).toBe('IDLE');
  expect(result.finalSurface.rightFrameLed).toBe('IDLE');
  expect(result.finalSurface.topMechanism).toBe('CLOSED');
  expect(result.policy.automaticUnverifiedCuesEnabled).toBe(false);
});
