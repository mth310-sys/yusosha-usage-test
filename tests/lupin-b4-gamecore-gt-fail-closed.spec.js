import { test, expect } from '@playwright/test';

test('GameCore final reel stop fails closed instead of dereferencing invalid GT completion', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/next-initial-hit-integrity-patch.js?v=step6z-next-hit-integrity1');

    const prepareSpin = (core) => {
      core.rng.next = () => 0.999999;
      const bet = core.bet();
      const lever = core.lever();
      const first = core.stopReel(0);
      const second = core.stopReel(1);
      return { bet, lever, first, second };
    };

    const capture = (core) => ({
      phase: core.phase,
      stopped: [...core.reels.stopped],
      spinning: [...core.reels.spinning],
      stopOrder: [...core.reels.stopOrder],
      result: [...core.reels.result],
      credit: core.creditSystem.snapshot().credit,
      gtState: core.goldenTime.state,
      gameInSet: core.goldenTime.gameInSet,
      remainingGames: core.goldenTime.remainingGames
    });

    const invalid = new GameCore({ setting: 1, seed: 1 });
    invalid.goldenTime.state = 'ACTIVE_SET';
    invalid.goldenTime.gameInSet = 5;
    invalid.goldenTime.remainingGames = 20;
    invalid.goldenTime.stage = 'JAPAN';
    invalid.goldenTime.internalStage = 'JAPAN_A';
    invalid.goldenTime.internalStageIndex = 0;
    const invalidPrep = prepareSpin(invalid);
    const invalidBeforeFinal = capture(invalid);
    const invalidFinal = invalid.stopReel(2);
    const invalidAfterFinal = capture(invalid);

    const valid = new GameCore({ setting: 1, seed: 1 });
    valid.goldenTime.state = 'ACTIVE_SET';
    valid.goldenTime.gameInSet = 5;
    valid.goldenTime.remainingGames = 25;
    valid.goldenTime.stage = 'JAPAN';
    valid.goldenTime.internalStage = 'JAPAN_A';
    valid.goldenTime.internalStageIndex = 0;
    const validPrep = prepareSpin(valid);
    const validFinal = valid.stopReel(2);
    const validAfterFinal = capture(valid);

    return {
      invalid: { prep: invalidPrep, beforeFinal: invalidBeforeFinal, final: invalidFinal, afterFinal: invalidAfterFinal },
      valid: { prep: validPrep, final: validFinal, afterFinal: validAfterFinal }
    };
  });

  expect(result.invalid.prep.bet).toBe(true);
  expect(result.invalid.prep.lever).not.toBeNull();
  expect(result.invalid.final).toBeNull();
  expect(result.invalid.afterFinal).toEqual(result.invalid.beforeFinal);
  expect(result.invalid.afterFinal.phase).toBe('SPINNING');
  expect(result.invalid.afterFinal.stopped).toEqual([true, true, false]);

  expect(result.valid.prep.bet).toBe(true);
  expect(result.valid.prep.lever).not.toBeNull();
  expect(result.valid.final?.complete).toBe(true);
  expect(result.valid.afterFinal.phase).toBe('WAIT_BET');
  expect(result.valid.afterFinal.stopped).toEqual([true, true, true]);
  expect(result.valid.afterFinal.gameInSet).toBe(6);
  expect(result.valid.afterFinal.remainingGames).toBe(24);
});
