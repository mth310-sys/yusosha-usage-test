import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED final countdown waits for changed miss hold before failure', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6as-wanted-final-miss-hold1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,
      0.0,0.999999,
      0.0,
      0.999999,
      0.0,
      0.0,0.0
    ];
    let draws=0;
    const fixedRng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    core.rng=fixedRng;
    core.normal.rng=fixedRng;
    core.normal.startWantedChance();
    core.normal.wantedChanceRemaining=2;

    const playOne = () => {
      if(!core.bet())throw new Error('bet failed');
      const lever=core.lever();
      core.stopReel(0);
      core.stopReel(1);
      const done=core.stopReel(2);
      return {lever,result:done?.result??null};
    };

    const first=playOne();
    const second=playOne();
    const third=playOne();
    return {draws,first,second,third};
  });

  expect(result.first.lever.role).toBe('REPLAY');
  expect(result.first.result.mode).toBe('WANTED_CHANCE');
  expect(result.first.result.wantedChanceRemaining).toBe(1);
  expect(result.first.result.wantedChanceFrozen).toBe(false);
  expect(result.first.result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.first.result.holdQueue[0]).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:null
  });
  expect(result.first.result.lcdChance.last).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:false,destination:null
  });

  expect(result.second.lever.role).toBe('REPLAY');
  expect(result.second.result.mode).toBe('WANTED_CHANCE');
  expect(result.second.result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:null
  });
  expect(result.second.result.wantedChanceRemaining).toBe(1);
  expect(result.second.result.wantedChanceFrozen).toBe(true);
  expect(result.second.result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.second.result.event).toBe('WANTED_CHANCE_COUNTDOWN_FROZEN_CHANGED_HOLD_PENDING');
  expect(result.second.result.pendingReward).toBeNull();

  expect(result.third.lever.role).toBe('REPLAY');
  // resetAfterWantedFailure() intentionally clears the last-consumed audit field
  // after the final NORMAL hold advances the countdown to zero.
  expect(result.third.result.consumedHold).toBeNull();
  expect(result.third.result.mode).toBe('NORMAL');
  expect(result.third.result.wantedChanceRemaining).toBeNull();
  expect(result.third.result.wantedChanceFrozen).toBe(false);
  expect(result.third.result.wantedChanceResult).toBe('FAIL');
  expect(result.third.result.wantedState).toBe('COUNTING');
  expect(result.third.result.wantedCycle).toBe('POST_WC_FAILURE');
  expect(result.third.result.wantedEntrySource).toBe('WANTED_CHANCE_10G_FAIL');
  expect(result.third.result.transitionSource).toBe('POST_WC_VERIFIED_SETTING_TABLE');
  expect(result.third.result.event).toBe('WANTED_CHANCE_FAIL_NEXT_CYCLE_DRAWN_SETTING_TABLE');
  expect(result.third.result.holdCapacity).toBeNull();
  expect(result.third.result.holdQueue).toEqual([]);
  expect(result.third.result.pendingReward).toBeNull();

  expect(result.draws).toBe(8);
});
