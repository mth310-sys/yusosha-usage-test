import { test, expect } from '@playwright/test';

test('Golden Time setting changes reject unsupported settings and preserve active-state lock', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { GoldenTimeSystem } = await import('/test_lupin_b4/js/golden-time.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const runInvalid = (value) => {
      const gt = new GoldenTimeSystem(new RNG(1), 1);
      const before = { setting:gt.setting, state:gt.state };
      const out = gt.setSetting(value);
      return { before, after:{ setting:gt.setting, state:gt.state }, out };
    };

    const valid = new GoldenTimeSystem(new RNG(1), 1);
    const validOut = valid.setSetting(6);
    const validAfter = { setting:valid.setting, state:valid.state };

    const active = new GoldenTimeSystem(new RNG(1), 1);
    active.start({ guaranteedStocks:0, source:'GT_SETTING_GUARD_TEST' });
    const activeBefore = { setting:active.setting, state:active.state };
    const activeOut = active.setSetting(6);
    const activeAfter = { setting:active.setting, state:active.state };

    return {
      setting0: runInvalid(0),
      setting7: runInvalid(7),
      text: runInvalid('UNKNOWN'),
      valid: { out:validOut, after:validAfter },
      active: { out:activeOut, before:activeBefore, after:activeAfter }
    };
  });

  for (const invalid of [result.setting0, result.setting7, result.text]) {
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.setting).toBe(1);
    expect(invalid.after.state).toBe('IDLE');
  }

  expect(result.valid.out).toBe(true);
  expect(result.valid.after.setting).toBe(6);
  expect(result.valid.after.state).toBe('IDLE');

  expect(result.active.out).toBe(false);
  expect(result.active.after).toEqual(result.active.before);
  expect(result.active.after.setting).toBe(1);
  expect(result.active.after.state).toBe('LUPIN_RUSH_ACTIVE');
});
