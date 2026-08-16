import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED two miss holds extend full countdown to game 12', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ay-wanted-two-miss-extension1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,                    // game 1 role: REPLAY
      0.0,0.999999,           // weak-blue LCD appearance + expectation miss
      0.0,                    // game 2 role: REPLAY; consumes first miss hold
      0.0,0.999999,           // second weak-blue LCD appearance + expectation miss
      0.0,0.999999            // game 3 role; consumes second miss hold + no new LCD
    ];

    // Games 4-11: normal holds decrement the countdown from 9 to 1.
    for(let game=4;game<=11;game+=1){
      seq.push(0.0);
      seq.push(0.999999);
    }

    // Game 12: final normal hold decrements 1 -> 0, then verified post-WC target draw.
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
    for(let game=1;game<=12;game+=1)games.push(playOne());
    return {draws,games};
  });

  expect(result.games[0].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[0].result.wantedChanceRemaining).toBe(9);
  expect(result.games[0].result.wantedChanceFrozen).toBe(false);
  expect(result.games[0].result.lcdChance.last).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:false,destination:null
  });

  expect(result.games[1].result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:null
  });
  expect(result.games[1].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[1].result.wantedChanceRemaining).toBe(9);
  expect(result.games[1].result.wantedChanceFrozen).toBe(true);
  expect(result.games[1].result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.games[1].result.event).toBe('WANTED_CHANCE_COUNTDOWN_FROZEN_CHANGED_HOLD_PENDING');
  expect(result.games[1].result.lcdChance.totalHits).toBe(2);
  expect(result.games[1].result.holdQueue[0]).toMatchObject({
    type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:null
  });

  expect(result.games[2].result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:null
  });
  expect(result.games[2].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[2].result.wantedChanceRemaining).toBe(9);
  expect(result.games[2].result.wantedChanceFrozen).toBe(true);
  expect(result.games[2].result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.games[2].result.event).toBe('WANTED_CHANCE_COUNTDOWN_FROZEN_CHANGED_HOLD_PENDING');
  expect(result.games[2].result.lcdChance.totalHits).toBe(2);

  // Two changed miss holds must add exactly two games to the base 10G countdown.
  expect(result.games[10].result.mode).toBe('WANTED_CHANCE');
  expect(result.games[10].result.wantedChanceRemaining).toBe(1);
  expect(result.games[10].result.wantedChanceFrozen).toBe(false);
  expect(result.games[10].result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.games[10].result.event).toBe('WANTED_CHANCE_GAME_COUNTDOWN_MINUS_1');

  expect(result.games[11].result.mode).toBe('NORMAL');
  expect(result.games[11].result.wantedChanceRemaining).toBeNull();
  expect(result.games[11].result.wantedChanceFrozen).toBe(false);
  expect(result.games[11].result.wantedChanceResult).toBe('FAIL');
  expect(result.games[11].result.wantedState).toBe('COUNTING');
  expect(result.games[11].result.wantedCycle).toBe('POST_WC_FAILURE');
  expect(result.games[11].result.wantedEntrySource).toBe('WANTED_CHANCE_10G_FAIL');
  expect(result.games[11].result.transitionSource).toBe('POST_WC_VERIFIED_SETTING_TABLE');
  expect(result.games[11].result.event).toBe('WANTED_CHANCE_FAIL_NEXT_CYCLE_DRAWN_SETTING_TABLE');
  expect(result.games[11].result.holdCapacity).toBeNull();
  expect(result.games[11].result.holdQueue).toEqual([]);
  expect(result.games[11].result.pendingReward).toBeNull();
  expect(result.games[11].result.wantedTargetZone).toMatchObject({min:1,max:32});
  expect(result.games[11].result.wantedTargetGame).toBe(1);
  expect(result.games[11].result.wantedTargetDistribution).toBe('VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND');

  // G1: role + appearance + miss = 3
  // G2: role + second appearance + miss = 3
  // G3: role + no-LCD = 2
  // G4-G11: role + no-LCD = 16
  // G12: role + two post-WC target draws = 3
  expect(result.draws).toBe(27);
});
