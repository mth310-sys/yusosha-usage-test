import { test, expect } from '@playwright/test';

test('Lupin B4 ceiling uses verified 499/999 setting split and only auto-resolves plain NORMAL', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result = await page.evaluate(async () => {
    const { drawCeilingGame } = await import('/test_lupin_b4/js/ceiling-profile.js?v=step6ab-ceiling1');
    await import('/test_lupin_b4/js/ceiling-runtime-patch.js?v=step6ab-ceiling1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const draw = (setting, roll) => drawCeilingGame(setting, { next: () => roll });

    const playOne = (core) => {
      if (!core.bet()) return { error:'BET_FAILED' };
      if (!core.lever()) return { error:'LEVER_FAILED' };
      let out = null;
      for (const index of [0,1,2]) out = core.stopReel(index);
      return out?.result ?? { error:'NO_RESULT' };
    };

    const normal = new GameCore({ setting:1, seed:0x12345678 });
    normal.ceiling.counter = 498;
    normal.ceiling.targetGame = 499;
    normal.ceiling.reached = false;
    normal.ceiling.resolution = 'COUNTING';
    const normalResult = playOne(normal);

    const special = new GameCore({ setting:1, seed:0x24681357 });
    special.startRizeForTest('RIZE');
    special.ceiling.counter = 498;
    special.ceiling.targetGame = 499;
    special.ceiling.reached = false;
    special.ceiling.resolution = 'COUNTING';
    const specialResult = playOne(special);

    const reset = new GameCore({ setting:6, seed:0x13572468 });
    reset.ceiling.counter = 321;
    const beforeTarget = reset.ceiling.targetGame;
    reset.drawNextInitialHitReservation('ART_END_VERIFIED_TIMING');

    return {
      thresholds: {
        s1Low:draw(1,0.007),
        s1High:draw(1,0.008),
        s6Low:draw(6,0.124),
        s6High:draw(6,0.125)
      },
      normal: {
        result:normalResult,
        ceiling:normal.snapshot().ceiling,
        lbState:normal.lupinBonus.state
      },
      special: {
        result:specialResult,
        ceiling:special.snapshot().ceiling,
        mode:special.normal.mode,
        lbState:special.lupinBonus.state
      },
      reset: {
        beforeTarget,
        counter:reset.ceiling.counter,
        targetGame:reset.ceiling.targetGame,
        drawSource:reset.ceiling.drawSource,
        resolution:reset.ceiling.resolution
      }
    };
  });

  expect(result.thresholds).toEqual({ s1Low:499, s1High:999, s6Low:499, s6High:999 });

  expect(result.normal.result.error).toBeUndefined();
  expect(result.normal.result.mode).toBe('LUPIN_BONUS');
  expect(result.normal.result.event).toBe('CEILING_LUPIN_BONUS_AUTO');
  expect(result.normal.ceiling.counter).toBe(499);
  expect(result.normal.ceiling.reached).toBe(true);
  expect(result.normal.ceiling.reachedMode).toBe('NORMAL');
  expect(result.normal.ceiling.resolution).toBe('LUPIN_BONUS');
  expect(result.normal.lbState).toBe('ACTIVE');

  expect(result.special.result.error).toBeUndefined();
  expect(result.special.ceiling.counter).toBe(499);
  expect(result.special.ceiling.reached).toBe(true);
  expect(result.special.ceiling.reachedMode).toBe('RIZE_ZONE');
  expect(result.special.ceiling.resolution).toBe('SPECIAL_CONTEXT_PENDING');
  expect(result.special.result.ceilingSpecialContextPending).toBe(true);
  expect(result.special.mode).toBe('RIZE_ZONE');
  expect(result.special.lbState).toBe('IDLE');

  expect([499,999]).toContain(result.reset.beforeTarget);
  expect(result.reset.counter).toBe(0);
  expect([499,999]).toContain(result.reset.targetGame);
  expect(result.reset.drawSource).toBe('ART_END_VERIFIED_TIMING');
  expect(result.reset.resolution).toBe('COUNTING');
});
