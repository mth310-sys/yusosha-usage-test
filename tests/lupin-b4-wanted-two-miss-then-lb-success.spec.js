import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED resolves LB success after two consecutive miss-hold freezes', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6az-wanted-two-miss-then-lb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,                    // game 1 role: REPLAY
      0.0,0.999999,           // weak-blue LCD appearance + miss
      0.0,                    // game 2 role: REPLAY; consumes first miss hold
      0.0,0.999999,           // second weak-blue LCD appearance + miss
      0.0,                    // game 3 role: REPLAY; consumes second miss hold
      0.0,0.0,0.0,            // third weak-blue LCD appearance + win + LB_OR_GT
      0.0                     // game 4 role: REPLAY; consumes winning hold
    ];

    let draws=0;
    const fixedRng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    core.rng=fixedRng;
    core.normal.rng=fixedRng;
    core.normal.startWantedChance();
    core.nextInitialHit={
      type:'LUPIN_BONUS',
      setting:1,
      source:'TEST_VERIFIED_NEXT_INITIAL_HIT_RESERVATION',
      reservationSource:'TEST_FIXED_EXISTING_VERIFIED_RESERVATION',
      drawNo:core.nextInitialHitDraws
    };

    const playOne = () => {
      if(!core.bet())throw new Error('bet failed');
      const lever=core.lever();
      core.stopReel(0);
      core.stopReel(1);
      const done=core.stopReel(2);
      return {lever,result:done?.result??null};
    };

    const games=[playOne(),playOne(),playOne(),playOne()];
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
  expect(result.games[2].result.lcdChance.totalHits).toBe(3);
  expect(result.games[2].result.lcdChance.last).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:'LB_OR_GT'
  });
  expect(result.games[2].result.holdQueue[0]).toMatchObject({
    type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:'LB_OR_GT'
  });

  expect(result.games[3].lever.role).toBe('REPLAY');
  expect(result.games[3].result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:'LB_OR_GT'
  });
  expect(result.games[3].result.mode).toBe('LUPIN_BONUS');
  expect(result.games[3].result.wantedChanceRemaining).toBeNull();
  expect(result.games[3].result.wantedChanceFrozen).toBe(false);
  expect(result.games[3].result.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.games[3].result.transitionSource).toBe('HOLD_CHANCE_BLUE_CONSUMED_ONCE_LUPIN_BONUS');
  expect(result.games[3].result.event).toBe('NEXT_INITIAL_HIT_LUPIN_BONUS_AUTO');
  expect(result.games[3].result.nextInitialHit.integrity.consumed).toBe(1);
  expect(result.games[3].result.nextInitialHit.integrity.lastResolution.type).toBe('LUPIN_BONUS');
  expect(result.games[3].result.pendingReward).toBeNull();

  // G1: role + appearance + miss = 3
  // G2: role + appearance + miss = 3
  // G3: role + appearance + win + destination = 4
  // G4: role only = 1. Success guard prevents any extra WANTED LCD lottery.
  expect(result.draws).toBe(11);
});
