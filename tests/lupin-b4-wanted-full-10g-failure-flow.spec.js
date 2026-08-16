import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED full 10G no-LCD flow fails exactly after game 10', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6aw-wanted-full-10g-fail1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [];
    for(let game=1;game<=9;game+=1){
      seq.push(0.0);
      seq.push(0.999999);
    }
    seq.push(0.0);
    seq.push(0.0,0.0);

    let draws=0;
    const fixedRng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    core.rng=fixedRng;
    core.normal.rng=fixedRng;
    core.normal.startWantedChance();

    const playOne = () => {
      if(!core.bet())throw new Error('bet failed');
      const lever=core.lever();
      core.stopReel(0);
      core.stopReel(1);
      const done=core.stopReel(2);
      return {lever,result:done?.result??null};
    };

    const games=[];
    for(let game=1;game<=10;game+=1)games.push(playOne());
    return {draws,games};
  });

  expect(result.games[0].lever.role).toBe('REPLAY');
  expect(result.games[0].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[0].result.wantedChanceRemaining).toBe(9);
  expect(result.games[0].result.wantedChanceFrozen).toBe(false);
  expect(result.games[0].result.event).toBe('WANTED_CHANCE_GAME_COUNTDOWN_MINUS_1');

  expect(result.games[8].lever.role).toBe('REPLAY');
  expect(result.games[8].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[8].result.wantedChanceRemaining).toBe(1);
  expect(result.games[8].result.wantedChanceFrozen).toBe(false);
  expect(result.games[8].result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.games[8].result.event).toBe('WANTED_CHANCE_GAME_COUNTDOWN_MINUS_1');

  expect(result.games[9].lever.role).toBe('REPLAY');
  expect(result.games[9].result.mode).toBe('NORMAL');
  expect(result.games[9].result.wantedChanceRemaining).toBeNull();
  expect(result.games[9].result.wantedChanceFrozen).toBe(false);
  expect(result.games[9].result.wantedChanceResult).toBe('FAIL');
  expect(result.games[9].result.wantedState).toBe('COUNTING');
  expect(result.games[9].result.wantedCycle).toBe('POST_WC_FAILURE');
  expect(result.games[9].result.wantedEntrySource).toBe('WANTED_CHANCE_10G_FAIL');
  expect(result.games[9].result.transitionSource).toBe('POST_WC_VERIFIED_SETTING_TABLE');
  expect(result.games[9].result.event).toBe('WANTED_CHANCE_FAIL_NEXT_CYCLE_DRAWN_SETTING_TABLE');
  expect(result.games[9].result.holdCapacity).toBeNull();
  expect(result.games[9].result.holdQueue).toEqual([]);
  expect(result.games[9].result.pendingReward).toBeNull();
  expect(result.games[9].result.wantedTargetZone).toMatchObject({min:1,max:32});
  expect(result.games[9].result.wantedTargetGame).toBe(1);
  expect(result.games[9].result.wantedTargetDistribution).toBe('VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND');
  expect(result.games[9].result.wantedHardMaxGame).toBe(480);

  expect(result.draws).toBe(21);
});
