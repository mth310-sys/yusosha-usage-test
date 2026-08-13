import { test, expect } from '@playwright/test';

test('unsupported settings do not fabricate next initial-hit reservations or route to GT', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const invalid = new GameCore({ setting: 0, seed: 1 });
    const invalidInitial = invalid.nextInitialHit;
    const invalidDraws = invalid.nextInitialHitDraws;
    invalid.normal.pendingReward = {
      type: 'LB_OR_GT',
      source: 'TEST_UNSUPPORTED_SETTING',
      guarantee: 'NORMAL_INITIAL_HIT',
      status: 'PENDING'
    };
    const invalidResolved = invalid.resolveNormalInitialHitPending();

    const known = new GameCore({ setting: 1, seed: 1 });
    const knownInitial = known.nextInitialHit ? { ...known.nextInitialHit } : null;
    const knownDraws = known.nextInitialHitDraws;

    return {
      invalid: {
        initial: invalidInitial,
        draws: invalidDraws,
        resolved: invalidResolved,
        pendingStatus: invalid.normal.pendingReward?.status ?? null,
        lbState: invalid.lupinBonus.state,
        gtState: invalid.goldenTime.state,
        lastResolution: invalid.lastInitialHitResolution
      },
      known: {
        initial: knownInitial,
        draws: knownDraws
      }
    };
  });

  expect(result.invalid.initial).toBeNull();
  expect(result.invalid.draws).toBe(0);
  expect(result.invalid.resolved).toBeNull();
  expect(result.invalid.pendingStatus).toBe('ERROR_MISSING_NEXT_INITIAL_HIT_RESERVATION');
  expect(result.invalid.lbState).toBe('IDLE');
  expect(result.invalid.gtState).toBe('IDLE');
  expect(result.invalid.lastResolution?.type).toBeNull();
  expect(result.invalid.lastResolution?.policy).toBe('FAIL_CLOSED_NO_LATE_REDRAW');

  expect(result.known.initial?.setting).toBe(1);
  expect(['LUPIN_BONUS', 'GOLDEN_TIME']).toContain(result.known.initial?.type);
  expect(result.known.initial?.drawNo).toBe(1);
  expect(result.known.draws).toBe(1);
});
