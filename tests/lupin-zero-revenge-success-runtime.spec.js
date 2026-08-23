import { test, expect } from '@playwright/test';

test('Revenge success holds on success mechanism rather than legacy destination state', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const state = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.kernelState = Object.freeze({
      ...app.core.kernelState,
      mode: 'REVENGE_CHANCE',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_REVENGE_SUCCESS_MECHANISM',
      modeResultEvidenceStatus: 'UNRESOLVED'
    });
    return {
      snapshot: app.core.snapshot(),
      spec: app.revengeSuccessMechanismSpec,
      hasResolver: typeof app.applyRevengeSuccessMechanism === 'function'
    };
  });

  expect(state.snapshot.modeResult).toBe('PENDING_REVENGE_SUCCESS_MECHANISM');
  expect(state.spec.pendingState).toBe('PENDING_REVENGE_SUCCESS_MECHANISM');
  expect(state.hasResolver).toBe(true);
});

test('unknown Revenge success mechanism does not invent a destination', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.kernelState = Object.freeze({
      ...app.core.kernelState,
      mode: 'REVENGE_CHANCE',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_REVENGE_SUCCESS_MECHANISM',
      modeResultEvidenceStatus: 'UNRESOLVED'
    });
    const resolution = app.applyRevengeSuccessMechanism(null);
    return { resolution, snapshot: app.core.snapshot() };
  });

  expect(result.resolution.applied).toBe(false);
  expect(result.resolution.reason).toBe('UNRESOLVED_SUCCESS_MECHANISM');
  expect(result.resolution.resolution.destination).toBeNull();
  expect(result.resolution.resolution.destinationCandidates).toEqual(['LUPIN_BONUS', 'GOLDEN_TIME']);
  expect(result.snapshot.mode).toBe('REVENGE_CHANCE');
  expect(result.snapshot.modeResult).toBe('PENDING_REVENGE_SUCCESS_MECHANISM');
});

test('four-character collection routes through existing LUPIN BONUS runtime', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.kernelState = Object.freeze({
      ...app.core.kernelState,
      mode: 'REVENGE_CHANCE',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_REVENGE_SUCCESS_MECHANISM',
      modeResultEvidenceStatus: 'UNRESOLVED'
    });
    const resolution = app.applyRevengeSuccessMechanism('COLLECT_FOUR_CHARACTERS');
    return { resolution, snapshot: app.core.snapshot() };
  });

  expect(result.resolution.applied).toBe(true);
  expect(result.resolution.resolution.destination).toBe('LUPIN_BONUS');
  expect(result.snapshot.mode).toBe('LUPIN_BONUS');
  expect(result.snapshot.modeResult).toBeNull();
});

test('direct GT success mechanism routes through existing GOLDEN TIME runtime', async ({ page }) => {
  await page.goto('/test_lupin_zero/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const app = window.__LUPIN_ZERO__;
    app.core.kernelState = Object.freeze({
      ...app.core.kernelState,
      mode: 'REVENGE_CHANCE',
      modeGamesRemaining: 0,
      modeResult: 'PENDING_REVENGE_SUCCESS_MECHANISM',
      modeResultEvidenceStatus: 'UNRESOLVED'
    });
    const resolution = app.applyRevengeSuccessMechanism('DIRECT_GOLDEN_TIME');
    return { resolution, snapshot: app.core.snapshot() };
  });

  expect(result.resolution.applied).toBe(true);
  expect(result.resolution.resolution.destination).toBe('GOLDEN_TIME');
  expect(result.snapshot.mode).toBe('GOLDEN_TIME');
  expect(result.snapshot.modeResult).toBeNull();
});
