import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED final countdown routes verified hit hold before failure', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6at-wanted-final-hit-hold1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,             // game 1 role: REPLAY
      0.0,0.0,0.60,   // weak-blue LCD appearance + win + FUJIKO_ZONE
      0.0,             // game 2 role: REPLAY
      0.5,0.5          // verified CZ length + scenario draws
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
    return {draws,first,second};
  });

  expect(result.first.lever.role).toBe('REPLAY');
  expect(result.first.result.mode).toBe('WANTED_CHANCE');
  expect(result.first.result.wantedChanceRemaining).toBe(1);
  expect(result.first.result.wantedChanceFrozen).toBe(false);
  expect(result.first.result.wantedChanceResult).toBe('UNRESOLVED');
  expect(result.first.result.lcdChance.last).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:'FUJIKO_ZONE'
  });
  expect(result.first.result.holdQueue[0]).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:'FUJIKO_ZONE'
  });

  expect(result.second.lever.role).toBe('REPLAY');
  expect(result.second.result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:'FUJIKO_ZONE'
  });
  expect(result.second.result.mode).toBe('FUJIKO_ZONE');
  expect(result.second.result.wantedState).toBe('SUSPENDED');
  expect(result.second.result.wantedChanceRemaining).toBe(1);
  expect(result.second.result.wantedChanceFrozen).toBe(true);
  expect(result.second.result.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.second.result.transitionSource).toBe('HOLD_CHANCE_BLUE');
  expect(result.second.result.event).toBe('ENTER_FUJIKO_ZONE');
  expect(result.second.result.holdCapacity).toBeNull();
  expect(result.second.result.holdQueue).toBeNull();
  expect(result.second.result.pendingReward).toBeNull();
  expect(result.second.result.cz).toMatchObject({
    type:'FUJIKO_ZONE',
    state:'ACTIVE',
    result:'UNRESOLVED',
    successModel:'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
    transitionSource:'HOLD_CHANCE_BLUE'
  });

  // game1 role + LCD appearance/win/destination + game2 role + verified CZ table draws.
  // No post-WC failure target draw is allowed after the success hold is consumed.
  expect(result.draws).toBe(7);
});
