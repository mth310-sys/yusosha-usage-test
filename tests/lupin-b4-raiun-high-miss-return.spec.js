import { test, expect } from '@playwright/test';

test('Lupin B4 Raiun high miss returns to NORMAL and starts the next 100pt cycle without inventing RED promotion', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/normal-failure-return-patch.js?v=step6z-raiun-high-return1');
    await import('/test_lupin_b4/js/raiun-red-counter-patch.js?v=step6af-red1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const playOne = (core) => {
      core.bet();
      core.lever();
      core.stopReel(0); core.stopReel(1); return core.stopReel(2).result;
    };

    const blue = new GameCore({ setting:1, seed:0x6b100 });
    blue.rng.next=()=>0.999999;
    blue.seekRaiun100ForTest('LOW');
    for(let i=0;i<7;i++) playOne(blue);
    const bluePending=blue.normal.snapshot();
    const blueReturn=playOne(blue);

    const red = new GameCore({ setting:1, seed:0x6b101 });
    red.setRaiunCounterRedForTest();
    red.rng.next=()=>0.999999;
    red.seekRaiun100ForTest('HIGH');
    for(let i=0;i<7;i++) playOne(red);
    const redPending=red.normal.snapshot();
    const redReturn=playOne(red);

    return {
      bluePending:{mode:bluePending.mode,state:bluePending.raiun.state,points:bluePending.raiun.points,counterColor:bluePending.raiun.counterColor},
      blueReturn:{mode:blueReturn.mode,state:blue.normal.raiun.state,points:blue.normal.raiun.points,counterColor:blue.normal.raiun.counterColor,source:blue.normal.raiun.counterColorSource,transitionSource:blue.normal.transitionSource},
      redPending:{mode:redPending.mode,state:redPending.raiun.state,points:redPending.raiun.points,counterColor:redPending.raiun.counterColor},
      redReturn:{mode:redReturn.mode,state:red.normal.raiun.state,points:red.normal.raiun.points,counterColor:red.normal.raiun.counterColor,source:red.normal.raiun.counterColorSource,transitionSource:red.normal.transitionSource}
    };
  });

  expect(result.bluePending).toEqual({mode:'RAIUN_HIGH',state:'HIGH_MISS_PENDING_RETURN',points:100,counterColor:'BLUE'});
  expect(result.blueReturn.mode).toBe('NORMAL');
  expect(result.blueReturn.state).toBe('COUNTING');
  expect(result.blueReturn.points).toBeLessThan(100);
  expect(result.blueReturn.counterColor).toBe('BLUE');
  expect(result.blueReturn.source).toBe('BLUE_TO_RED_NATURAL_PROMOTION_RATE_UNVERIFIED_DISABLED');
  expect(result.blueReturn.transitionSource).toBe('RAIUN_HIGH_FAILURE_RETURN_CONSUMED_ON_NEXT_GAME');

  expect(result.redPending).toEqual({mode:'RAIUN_HIGH',state:'HIGH_MISS_PENDING_RETURN',points:100,counterColor:'RED'});
  expect(result.redReturn.mode).toBe('NORMAL');
  expect(result.redReturn.state).toBe('COUNTING');
  expect(result.redReturn.points).toBeLessThan(100);
  expect(result.redReturn.counterColor).toBe('RED');
  expect(result.redReturn.source).toBe('VERIFIED_RED_COUNTER_PERSISTS_UNTIL_ART');
  expect(result.redReturn.transitionSource).toBe('RAIUN_HIGH_FAILURE_RETURN_CONSUMED_ON_NEXT_GAME');
});
