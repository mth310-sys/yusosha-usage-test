import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED one miss hold extends full countdown to game 11', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ax-wanted-full-miss-extension1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,                    // game 1 role: REPLAY
      0.0,0.999999,           // weak-blue LCD appearance + expectation miss
      0.0,0.999999            // game 2 role + no new LCD after consuming miss hold
    ];

    // Games 3-10: normal holds decrement the countdown from 9 to 1.
    for(let game=3;game<=10;game+=1){
      seq.push(0.0);
      seq.push(0.999999);
    }

    // Game 11: final normal hold decrements 1 -> 0, then verified post-WC target draw.
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
    for(let game=1;game<=11;game+=1)games.push(playOne());
    return {draws,games};
  });

  expect(result.games[0].lever.role).toBe('REPLAY');
  expect(result.games[0].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[0].result.wantedChanceRemaining).toBe(9);
  expect(result.games[0].result.wantedChanceFrozen).toBe(false);
  expect(result.games[0].result.lcdChance.last).toMatchObject({
    key:'WEAK_BLUE',
    mode:'WANTED_CHANCE',
    won:false,
    destination:null
  });
  expect(result.games[0].result.holdQueue[0]).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:null
  });

  expect(result.games[1].lever.role).toBe('REPLAY');
  expect(result.games[1].result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:null
  });
  expect(result.games[1].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[1].result.wantedChanceRemaining).toBe(9);
  expect(result.games[1].result.wantedChanceFrozen).toBe(true);
  expect(result.games[1].result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.games[1].result.event).toBe('WANTED_CHANCE_COUNTDOWN_FROZEN_CHANGED_HOLD_PENDING');

  // The single changed miss hold must add exactly one game to the base 10G countdown.
  expect(result.games[9].lever.role).toBe('REPLAY');
  expect(result.games[9].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[9].result.wantedChanceRemaining).toBe(1);
  expect(result.games[9].result.wantedChanceFrozen).toBe(false);
  expect(result.games[9].result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.games[9].result.event).toBe('WANTED_CHANCE_GAME_COUNTDOWN_MINUS_1');

  expect(result.games[10].lever.role).toBe('REPLAY');
  expect(result.games[10].result.mode).toBe('NORMAL');
  expect(result.games[10].result.wantedChanceRemaining).toBeNull();
  expect(result.games[10].result.wantedChanceFrozen).toBe(false);
  expect(result.games[10].result.wantedChanceResult).toBe('FAIL');
  expect(result.games[10].result.wantedState).toBe('COUNTING');
  expect(result.games[10].result.wantedCycle).toBe('POST_WC_FAILURE');
  expect(result.games[10].result.wantedEntrySource).toBe('WANTED_CHANCE_10G_FAIL');
  expect(result.games[10].result.transitionSource).toBe('POST_WC_VERIFIED_SETTING_TABLE');
  expect(result.games[10].result.event).toBe('WANTED_CHANCE_FAIL_NEXT_CYCLE_DRAWN_SETTING_TABLE');
  expect(result.games[10].result.holdCapacity).toBeNull();
  expect(result.games[10].result.holdQueue).toEqual([]);
  expect(result.games[10].result.pendingReward).toBeNull();
  expect(result.games[10].result.wantedTargetZone).toMatchObject({min:1,max:32});
  expect(result.games[10].result.wantedTargetGame).toBe(1);
  expect(result.games[10].result.wantedTargetDistribution).toBe('VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND');

  // G1: role + appearance + miss = 3
  // G2-G10: role + no-LCD = 18
  // G11: role + two post-WC target draws = 3
  expect(result.draws).toBe(24);
});
