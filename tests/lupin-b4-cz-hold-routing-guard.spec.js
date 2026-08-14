import { test, expect } from '@playwright/test';

test('CZ hold routing fails closed before WANTED state mutation on unsupported settings', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const prepare = (setting) => {
      const normal = new NormalSystem(new RNG(1), setting);
      normal.mode = 'WANTED_CHANCE';
      normal.wantedState = 'ACTIVE';
      normal.wantedChanceResult = 'UNRESOLVED';
      normal.holdCapacity = 8;
      normal.pendingReward = { type:'SENTINEL', source:'BEFORE_TEST' };
      normal.transitionSource = 'BEFORE_TEST';
      normal.lastEvent = 'BEFORE_TEST';
      return normal;
    };

    const capture = (normal) => ({
      mode: normal.mode,
      wantedState: normal.wantedState,
      wantedChanceResult: normal.wantedChanceResult,
      holdCapacity: normal.holdCapacity,
      pendingReward: normal.pendingReward ? { ...normal.pendingReward } : null,
      transitionSource: normal.transitionSource,
      lastEvent: normal.lastEvent,
      cz: normal.cz ? { ...normal.cz } : null
    });

    const runInvalid = (setting, reservedEvent) => {
      const normal = prepare(setting);
      const before = capture(normal);
      const out = normal.applyConsumedHold({
        type:'TEST_HOLD',
        reservedEvent,
        guarantee:'TEST_CZ'
      });
      return { before, after:capture(normal), out };
    };

    const valid = prepare(1);
    const validOut = valid.applyConsumedHold({
      type:'TEST_HOLD',
      reservedEvent:'DOROBO_ZONE',
      guarantee:'TEST_CZ'
    });

    return {
      setting0Dorobo: runInvalid(0, 'DOROBO_ZONE'),
      setting7Fujiko: runInvalid(7, 'FUJIKO_ZONE'),
      valid: { out:validOut, after:capture(valid) }
    };
  });

  for (const invalid of [result.setting0Dorobo, result.setting7Fujiko]) {
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
  }

  expect(result.valid.out).toBe(true);
  expect(result.valid.after.mode).toBe('DOROBO_ZONE');
  expect(result.valid.after.wantedState).toBe('SUSPENDED');
  expect(result.valid.after.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.valid.after.holdCapacity).toBeNull();
  expect(result.valid.after.pendingReward).toBeNull();
  expect(result.valid.after.transitionSource).toBe('HOLD_TEST_HOLD');
  expect(result.valid.after.lastEvent).toBe('ENTER_DOROBO_ZONE');
  expect(result.valid.after.cz?.state).toBe('ACTIVE');
  expect(result.valid.after.cz?.type).toBe('DOROBO_ZONE');
});
