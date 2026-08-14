import { test, expect } from '@playwright/test';

test('changed WANTED hold does not report successful CZ routing for unsupported settings', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');
    await import('/test_lupin_b4/js/changed-hold-route-integrity-patch.js?v=step6z-changed-hold-route-integrity1');

    const rng = { next: () => 0 };
    const hold = { type:'RED', reservedEvent:'DOROBO_ZONE', guarantee:'CZ' };
    const capture = (normal) => ({
      mode: normal.mode,
      pendingReward: normal.pendingReward,
      transitionSource: normal.transitionSource,
      wantedChanceResult: normal.wantedChanceResult,
      holdCapacity: normal.holdCapacity,
      holdQueue: normal.holdQueue,
      cz: normal.cz
    });

    const runInvalid = (setting) => {
      const normal = new NormalSystem(rng, setting);
      normal.startWantedChance();
      const before = capture(normal);
      const out = normal.applyConsumedHold(hold);
      const after = capture(normal);
      return { before, after, out, audit: normal.lastChangedHoldRouteIntegrity };
    };

    const known = new NormalSystem(rng, 1);
    known.startWantedChance();
    const knownOut = known.applyConsumedHold(hold);
    const knownAfter = capture(known);

    return {
      setting0: runInvalid(0),
      setting7: runInvalid(7),
      known: { out: knownOut, after: knownAfter, audit: known.lastChangedHoldRouteIntegrity }
    };
  });

  for (const invalid of [result.setting0, result.setting7]) {
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.mode).toBe('WANTED_CHANCE');
    expect(invalid.after.cz).toBeNull();
    expect(invalid.audit?.status).toBe('ERROR_UNSUPPORTED_CZ_SETTING_FAIL_CLOSED');
    expect(invalid.audit?.checks?.routed).toBe(false);
  }

  expect(result.known.out).toBe(true);
  expect(result.known.after.mode).toBe('DOROBO_ZONE');
  expect(result.known.after.cz?.state).toBe('ACTIVE');
  expect(result.known.after.transitionSource).toBe('HOLD_RED');
  expect(result.known.after.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.known.after.holdCapacity).toBeNull();
  expect(result.known.after.holdQueue).toBeNull();
  expect(result.known.audit?.status).toBe('OK');
});
