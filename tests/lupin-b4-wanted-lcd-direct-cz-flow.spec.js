import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED LCD verified direct destinations enter FUJIKO/DOROBO CZ once', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ao-wanted-lcd-direct-cz1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const run = (destinationRoll) => {
      const core = new GameCore({ setting:1, seed:12345 });
      const seq = [
        0.0,                         // game 1 role: REPLAY
        0.0,0.0,destinationRoll,     // weak blue, win, verified destination
        0.0,                         // game 2 role: REPLAY
        0.5,0.5                      // verified CZ length + scenario table draws
      ];
      let draws=0;
      core.rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
      core.normal.startWantedChance();

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
      return {draws,first,second,snapshot:core.snapshot()};
    };

    return {
      fujiko:run(0.60),
      dorobo:run(0.90)
    };
  });

  const expected = [
    ['fujiko','FUJIKO_ZONE'],
    ['dorobo','DOROBO_ZONE']
  ];

  for(const [key,zone] of expected){
    const branch=result[key];
    expect(branch.first.lever.role).toBe('REPLAY');
    expect(branch.first.result.mode).toBe('WANTED_CHANCE');
    expect(branch.first.result.lcdChance.totalHits).toBe(1);
    expect(branch.first.result.lcdChance.wantedHits).toBe(1);
    expect(branch.first.result.lcdChance.last).toMatchObject({
      key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:zone
    });
    expect(branch.first.result.holdQueue[0]).toMatchObject({
      type:`CHANCE_BLUE__${zone}`,
      source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
      reservedEvent:zone
    });

    expect(branch.second.lever.role).toBe('REPLAY');
    expect(branch.second.result.consumedHold).toMatchObject({
      type:`CHANCE_BLUE__${zone}`,
      source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
      reservedEvent:zone
    });
    expect(branch.second.result.wantedChanceResult).toBe('SUCCESS_ROUTE');
    expect(branch.second.result.mode).toBe(zone);
    expect(branch.second.result.event).toBe(`ENTER_${zone}`);
    expect(branch.second.result.cz).toMatchObject({
      type:zone,
      state:'ACTIVE',
      result:'UNRESOLVED',
      successModel:'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
      transitionSource:'HOLD_CHANCE_BLUE'
    });
    expect(branch.second.result.pendingReward).toBeNull();
    expect(branch.second.result.lcdChance.totalHits).toBe(1);
    expect(branch.second.result.lcdChance.wantedHits).toBe(1);

    // 1 role + 3 LCD + 1 role + 2 verified CZ table draws. No extra WANTED LCD draw after CZ entry.
    expect(branch.draws).toBe(7);
    expect(branch.snapshot.normal.mode).toBe(zone);
  }
});
