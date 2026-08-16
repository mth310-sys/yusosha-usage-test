import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED final countdown resolves verified LB route before failure', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6au-wanted-final-lb-route1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [0.0,0.0,0.0,0.0,0.0];
    let draws=0;
    const fixedRng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    core.rng=fixedRng;
    core.normal.rng=fixedRng;
    core.normal.startWantedChance();
    core.normal.wantedChanceRemaining=2;
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
  expect(result.second.result.mode).toBe('LUPIN_BONUS');
  expect(result.second.result.wantedChanceRemaining).toBeNull();
  expect(result.second.result.wantedChanceFrozen).toBe(false);
  expect(result.second.result.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.second.result.transitionSource).toBe('HOLD_CHANCE_BLUE_CONSUMED_ONCE_LUPIN_BONUS');
  expect(result.second.result.event).toBe('NEXT_INITIAL_HIT_LUPIN_BONUS_AUTO');
  expect(result.second.result.nextInitialHit.integrity.consumed).toBe(1);
  expect(result.second.result.nextInitialHit.integrity.lastResolution.type).toBe('LUPIN_BONUS');
  expect(result.second.result.pendingReward).toBeNull();

  expect(result.draws).toBe(5);
});
