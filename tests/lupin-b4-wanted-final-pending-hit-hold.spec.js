import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED remaining 1G consumes pending verified hit hold before failure', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6av-wanted-final-pending-hit1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const core = new GameCore({ setting:1, seed:12345 });
    const seq = [
      0.0,      // role: REPLAY
      0.5,0.5   // verified CZ length + scenario draws
    ];
    let draws=0;
    const fixedRng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    core.rng=fixedRng;
    core.normal.rng=fixedRng;
    core.normal.startWantedChance();
    core.normal.wantedChanceRemaining=1;
    core.normal.holdQueue.injectNext(
      'CHANCE_BLUE__DOROBO_ZONE',
      'TEST_VERIFIED_PENDING_HIT_HOLD'
    );

    if(!core.bet())throw new Error('bet failed');
    const lever=core.lever();
    core.stopReel(0);
    core.stopReel(1);
    const done=core.stopReel(2);
    return {draws,lever,result:done?.result??null};
  });

  expect(result.lever.role).toBe('REPLAY');
  expect(result.result.consumedHold).toMatchObject({
    type:'CHANCE_BLUE',
    source:'TEST_VERIFIED_PENDING_HIT_HOLD',
    reservedEvent:'DOROBO_ZONE'
  });
  expect(result.result.mode).toBe('DOROBO_ZONE');
  expect(result.result.wantedState).toBe('SUSPENDED');
  expect(result.result.wantedChanceRemaining).toBe(1);
  expect(result.result.wantedChanceFrozen).toBe(true);
  expect(result.result.wantedChanceResult).toBe('SUCCESS_ROUTE');
  expect(result.result.transitionSource).toBe('HOLD_CHANCE_BLUE');
  expect(result.result.event).toBe('ENTER_DOROBO_ZONE');
  expect(result.result.holdCapacity).toBeNull();
  expect(result.result.holdQueue).toBeNull();
  expect(result.result.pendingReward).toBeNull();
  expect(result.result.cz).toMatchObject({
    type:'DOROBO_ZONE',
    state:'ACTIVE',
    result:'UNRESOLVED',
    successModel:'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
    transitionSource:'HOLD_CHANCE_BLUE'
  });

  // Role + verified CZ table draws only. Remaining 1G must not trigger
  // post-WC failure target draws before the pending hit hold resolves.
  expect(result.draws).toBe(3);
});
