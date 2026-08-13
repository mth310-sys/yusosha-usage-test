import { test, expect } from '@playwright/test';

test('CZ start rejects unsupported settings without creating malformed CZ state', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const rng = () => ({ next: () => 0 });
    const capture = (normal) => ({
      setting: normal.setting,
      mode: normal.mode,
      cz: normal.cz ? { ...normal.cz } : null,
      rize: normal.rize ? { ...normal.rize } : null,
      legendGate: normal.legendGate ? { ...normal.legendGate } : null,
      transitionSource: normal.transitionSource,
      lastEvent: normal.lastEvent
    });

    const runInvalid = (setting) => {
      const normal = new NormalSystem(rng(), setting);
      const before = capture(normal);
      let out = null;
      let error = null;
      try { out = normal.startCz('DOROBO_ZONE', 'TEST_UNSUPPORTED_SETTING'); }
      catch (caught) { error = String(caught?.message ?? caught); }
      return { before, after: capture(normal), out, error };
    };

    const known = new NormalSystem(rng(), 1);
    const knownOut = known.startCz('DOROBO_ZONE', 'TEST_KNOWN_SETTING');
    const knownState = capture(known);

    return { setting0: runInvalid(0), setting7: runInvalid(7), known: { out: knownOut, state: knownState } };
  });

  for (const invalid of [result.setting0, result.setting7]) {
    expect(invalid.error).toBeNull();
    expect(invalid.out).toBe(false);
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.cz).toBeNull();
  }

  expect(result.known.out).toBe(true);
  expect(result.known.state.mode).toBe('DOROBO_ZONE');
  expect(result.known.state.cz?.type).toBe('DOROBO_ZONE');
  expect(result.known.state.cz?.state).toBe('ACTIVE');
  expect(result.known.state.cz?.totalGames).toBe(10);
  expect(result.known.state.cz?.remainingGames).toBe(10);
  expect(result.known.state.cz?.scenario).toBe('A');
  expect(result.known.state.cz?.transitionSource).toBe('TEST_KNOWN_SETTING');
});
