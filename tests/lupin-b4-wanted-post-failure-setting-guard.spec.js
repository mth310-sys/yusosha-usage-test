import { test, expect } from '@playwright/test';

test('WANTED post-failure reset rejects unsupported settings without mutating the cycle', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');
    await import('/test_lupin_b4/js/wanted-cycle-integrity-patch.js?v=step6z-wanted-cycle-integrity1');

    const makeRng = () => ({ next: () => 0 });
    const capture = (normal) => ({
      mode: normal.mode,
      wantedCount: normal.wantedCount,
      wantedCycle: normal.wantedCycle,
      wantedTargetGame: normal.wantedTargetGame,
      wantedTargetZone: { ...normal.wantedTargetZone },
      wantedState: normal.wantedState,
      transitionSource: normal.transitionSource
    });
    const runUnsupported = (setting) => {
      const normal = new NormalSystem(makeRng(), setting);
      const before = capture(normal);
      let out = 'NOT_RUN';
      let error = null;
      try { out = normal.resetAfterWantedFailure(); }
      catch (caught) { error = String(caught?.message ?? caught); }
      return { out, error, before, after: capture(normal) };
    };

    const known = new NormalSystem(makeRng(), 1);
    let knownError = null;
    try { known.resetAfterWantedFailure(); }
    catch (caught) { knownError = String(caught?.message ?? caught); }

    return {
      setting0: runUnsupported(0),
      setting7: runUnsupported(7),
      known: { error: knownError, state: capture(known), audit: known.lastWantedCycleIntegrity }
    };
  });

  for (const invalid of [result.setting0, result.setting7]) {
    expect(invalid.error).toBeNull();
    expect(invalid.out).toBeNull();
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.known.error).toBeNull();
  expect(result.known.state.wantedCycle).toBe('POST_WC_FAILURE');
  expect(result.known.state.wantedCount).toBe(0);
  expect(result.known.state.wantedState).toBe('COUNTING');
  expect(result.known.state.transitionSource).toBe('POST_WC_VERIFIED_SETTING_TABLE');
  expect(result.known.state.wantedTargetGame).toBeGreaterThanOrEqual(result.known.state.wantedTargetZone.min);
  expect(result.known.state.wantedTargetGame).toBeLessThanOrEqual(result.known.state.wantedTargetZone.max);
  expect(result.known.audit?.status).toBe('OK');
});
