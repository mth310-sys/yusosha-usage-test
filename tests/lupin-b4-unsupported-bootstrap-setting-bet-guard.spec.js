import { test, expect } from '@playwright/test';

test('unsupported bootstrap settings cannot start a base game or mutate bet state', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');
    await import('/test_lupin_b4/js/result-integrity-patch.js?v=step6z-result-integrity1');

    const capture = (core) => ({
      phase: core.phase,
      gameNo: core.gameNo,
      profile: core.profile,
      credit: core.creditSystem.snapshot(),
      pendingRole: core.pendingRole,
      nextInitialHit: core.nextInitialHit
    });

    const runInvalid = (setting) => {
      const core = new GameCore({ setting, seed: 1 });
      const before = capture(core);
      let betOut = null;
      let leverOut = 'NOT_RUN';
      let error = null;
      try {
        betOut = core.bet();
        if (betOut) leverOut = core.lever();
      } catch (caught) {
        error = String(caught?.message ?? caught);
      }
      return { before, after: capture(core), betOut, leverOut, error, invalidAudit: core.lastInvalidOperationIntegrity };
    };

    const known = new GameCore({ setting: 1, seed: 1 });
    const knownBefore = capture(known);
    const knownBet = known.bet();
    const knownLever = known.lever();
    const knownAfter = capture(known);

    return {
      setting0: runInvalid(0),
      setting7: runInvalid(7),
      known: { before: knownBefore, betOut: knownBet, leverOut: knownLever, after: knownAfter }
    };
  });

  for (const invalid of [result.setting0, result.setting7]) {
    expect(invalid.error).toBeNull();
    expect(invalid.betOut).toBe(false);
    expect(invalid.leverOut).toBe('NOT_RUN');
    expect(invalid.after).toEqual(invalid.before);
    expect(invalid.after.profile).toBeNull();
    expect(invalid.invalidAudit?.status).toBe('OK');
    expect(invalid.invalidAudit?.operation).toBe('BET');
  }

  expect(result.known.betOut).toBe(true);
  expect(result.known.leverOut?.role).toBeTruthy();
  expect(result.known.after.phase).toBe('SPINNING');
  expect(result.known.after.gameNo).toBe(result.known.before.gameNo + 1);
});
