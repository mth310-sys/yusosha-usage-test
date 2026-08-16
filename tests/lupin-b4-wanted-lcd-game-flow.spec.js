import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED LCD hold is generated, consumed next game, and routes once', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6an-wanted-lcd-flow1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,             // game 1 role: REPLAY
      0.0,0.0,0.0,     // WANTED LCD: weak blue, win, LB_OR_GT
      0.0              // game 2 role: REPLAY
    ];
    let draws=0;
    core.rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};

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
      const s1=core.stopReel(0);
      const s2=core.stopReel(1);
      const s3=core.stopReel(2);
      return {lever,s1,s2,s3,result:s3?.result??null};
    };

    const first=playOne();
    const afterFirst=core.snapshot();
    const second=playOne();
    const afterSecond=core.snapshot();

    return {draws,first,second,afterFirst,afterSecond};
  });

  expect(result.first.lever.role).toBe('REPLAY');
  expect(result.first.result.mode).toBe('WANTED_CHANCE');
  expect(result.first.result.lcdChance.totalHits).toBe(1);
  expect(result.first.result.lcdChance.wantedHits).toBe(1);
  expect(result.first.result.lcdChance.last).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:'LB_OR_GT'
  });
  expect(result.first.result.holdQueue[0]).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:'LB_OR_GT'
  });

  expect(result.second.lever.role).toBe('REPLAY');
  expect(result.second.result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',
    source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
    reservedEvent:'LB_OR_GT'
  });
  expect(result.second.result.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.second.result.mode).toBe('LUPIN_BONUS');
  expect(result.second.result.event).toBe('NEXT_INITIAL_HIT_LUPIN_BONUS_AUTO');
  expect(result.second.result.lcdChance.totalHits).toBe(1);
  expect(result.second.result.lcdChance.wantedHits).toBe(1);
  expect(result.second.result.nextInitialHit.consumed).toBe(1);
  expect(result.second.result.nextInitialHit.lastResolution.type).toBe('LUPIN_BONUS');

  // 1 role draw + 3 LCD draws + 1 role draw. No extra WANTED LCD draw after success-route consumption.
  expect(result.draws).toBe(5);
  expect(result.afterSecond.lupinBonus.state).not.toBe('IDLE');
});
