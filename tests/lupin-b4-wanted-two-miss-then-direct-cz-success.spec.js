import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED resolves direct CZ success after two consecutive miss-hold freezes', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ba-wanted-two-miss-then-cz1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const run = (destinationRoll) => {
      const core = new GameCore({ setting:1, seed:12345 });
      const seq = [
        0.0,                    // game 1 role: REPLAY
        0.0,0.999999,           // weak-blue LCD appearance + miss
        0.0,                    // game 2 role: REPLAY; consumes first miss hold
        0.0,0.999999,           // second weak-blue LCD appearance + miss
        0.0,                    // game 3 role: REPLAY; consumes second miss hold
        0.0,0.0,destinationRoll,// third weak-blue LCD appearance + win + direct CZ destination
        0.0,                    // game 4 role: REPLAY; consumes winning hold
        0.5,0.5                 // verified CZ length + scenario table draws
      ];

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

      const games=[playOne(),playOne(),playOne(),playOne()];
      return {draws,games};
    };

    return {
      fujiko:run(0.60),
      dorobo:run(0.90)
    };
  });

  for(const [key,zone] of [['fujiko','FUJIKO_ZONE'],['dorobo','DOROBO_ZONE']]){
    const branch=result[key];

    expect(branch.games[0].result.mode).toBe('WANTED_CHANCE');
    expect(branch.games[0].result.wantedChanceRemaining).toBe(9);
    expect(branch.games[0].result.wantedChanceFrozen).toBe(false);

    expect(branch.games[1].result.consumedHold).toMatchObject({
      type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:null
    });
    expect(branch.games[1].result.wantedChanceRemaining).toBe(9);
    expect(branch.games[1].result.wantedChanceFrozen).toBe(true);

    expect(branch.games[2].result.consumedHold).toMatchObject({
      type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:null
    });
    expect(branch.games[2].result.wantedChanceRemaining).toBe(9);
    expect(branch.games[2].result.wantedChanceFrozen).toBe(true);
    expect(branch.games[2].result.lcdChance.totalHits).toBe(3);
    expect(branch.games[2].result.lcdChance.last).toMatchObject({
      key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:zone
    });
    expect(branch.games[2].result.holdQueue[0]).toMatchObject({
      type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:zone
    });

    expect(branch.games[3].lever.role).toBe('REPLAY');
    expect(branch.games[3].result.consumedHold).toMatchObject({
      type:'CHANCE_BLUE',source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',reservedEvent:zone
    });
    expect(branch.games[3].result.mode).toBe(zone);
    expect(branch.games[3].result.wantedChanceResult).toBe('SUCCESS_ROUTE');
    expect(branch.games[3].result.event).toBe(`ENTER_${zone}`);
    expect(branch.games[3].result.cz).toMatchObject({
      type:zone,
      state:'ACTIVE',
      result:'UNRESOLVED',
      successModel:'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
      transitionSource:'HOLD_CHANCE_BLUE'
    });
    expect(branch.games[3].result.pendingReward).toBeNull();
    expect(branch.games[3].result.lcdChance.totalHits).toBe(3);

    // G1: role + appearance + miss = 3
    // G2: role + appearance + miss = 3
    // G3: role + appearance + win + destination = 4
    // G4: role + two verified CZ table draws = 3. No extra WANTED LCD draw after CZ entry.
    expect(branch.draws).toBe(13);
  }
});
