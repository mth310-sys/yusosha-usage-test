import { test, expect } from '@playwright/test';

test('DOROBO/FUJIKO CZ resolve only at the final game using verified aggregate setting rates', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { RNG } = await import('/test_lupin_b4/js/rng.js');
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6w');
    const profile = await import('/test_lupin_b4/js/cz-profile.js?v=step6aa-cz1');
    await import('/test_lupin_b4/js/cz-aggregate-outcome-patch.js?v=step6aa-cz1');

    const prepare = (type, setting, totalGames, gameCount, roll) => {
      const normal = new NormalSystem(new RNG(1), setting);
      normal.mode = type;
      normal.pendingReward = null;
      normal.cz = {
        type,
        state: 'ACTIVE',
        result: 'UNRESOLVED',
        resultSource: null,
        gameCount,
        totalGames,
        remainingGames: totalGames - gameCount,
        scenario: 'A',
        lengthSource: 'VERIFIED_SETTING_TABLE',
        scenarioSource: 'VERIFIED_SETTING_TABLE',
        successModel: 'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
        transitionSource: 'TEST'
      };
      normal.rng = { next: () => roll };
      return normal;
    };

    const capture = (normal) => ({
      mode: normal.mode,
      state: normal.cz?.state,
      result: normal.cz?.result,
      resultSource: normal.cz?.resultSource,
      gameCount: normal.cz?.gameCount,
      remainingGames: normal.cz?.remainingGames,
      pendingReward: normal.pendingReward ? { ...normal.pendingReward } : null,
      lastEvent: normal.lastEvent
    });

    const preFinal = prepare('DOROBO_ZONE', 1, 10, 8, 0.0);
    preFinal.completeGame();

    const doroboSuccess = prepare('DOROBO_ZONE', 1, 10, 9, 0.398);
    doroboSuccess.completeGame();
    const doroboFail = prepare('DOROBO_ZONE', 1, 10, 9, 0.400);
    doroboFail.completeGame();

    const fujikoSuccess = prepare('FUJIKO_ZONE', 6, 20, 19, 0.631);
    fujikoSuccess.completeGame();
    const fujikoFail = prepare('FUJIKO_ZONE', 6, 20, 19, 0.632);
    fujikoFail.completeGame();

    return {
      table: {
        d1: profile.getCzAggregateSuccessPct('DOROBO_ZONE', 1),
        d6: profile.getCzAggregateSuccessPct('DOROBO_ZONE', 6),
        f1: profile.getCzAggregateSuccessPct('FUJIKO_ZONE', 1),
        f6: profile.getCzAggregateSuccessPct('FUJIKO_ZONE', 6)
      },
      preFinal: capture(preFinal),
      doroboSuccess: capture(doroboSuccess),
      doroboFail: capture(doroboFail),
      fujikoSuccess: capture(fujikoSuccess),
      fujikoFail: capture(fujikoFail)
    };
  });

  expect(result.table).toEqual({ d1: 39.9, d6: 43.2, f1: 58.8, f6: 63.2 });

  expect(result.preFinal.state).toBe('ACTIVE');
  expect(result.preFinal.gameCount).toBe(9);
  expect(result.preFinal.remainingGames).toBe(1);
  expect(result.preFinal.result).toBe('UNRESOLVED');
  expect(result.preFinal.pendingReward).toBeNull();

  for (const success of [result.doroboSuccess, result.fujikoSuccess]) {
    expect(success.state).toBe('SUCCESS_PENDING_DESTINATION');
    expect(success.result).toBe('SUCCESS');
    expect(success.resultSource).toBe('VERIFIED_SETTING_AGGREGATE_EXPECTATION_END_BOUNDARY');
    expect(success.remainingGames).toBe(0);
    expect(success.pendingReward?.type).toBe('LB_OR_GT');
    expect(success.pendingReward?.status).toBe('PENDING_DESTINATION_UNRESOLVED');
  }

  for (const fail of [result.doroboFail, result.fujikoFail]) {
    expect(fail.state).toBe('FAIL_PENDING_RETURN');
    expect(fail.result).toBe('FAIL');
    expect(fail.resultSource).toBe('VERIFIED_SETTING_AGGREGATE_EXPECTATION_END_BOUNDARY');
    expect(fail.remainingGames).toBe(0);
    expect(fail.pendingReward).toBeNull();
  }
});
