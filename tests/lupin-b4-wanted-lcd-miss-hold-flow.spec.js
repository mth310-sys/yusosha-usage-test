import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED LCD miss holds freeze countdown once and resume on following normal hold', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ar-wanted-lcd-miss-resume1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const run = (appearanceRoll) => {
      const core = new GameCore({ setting:1, seed:12345 });
      const seq = [
        0.0,                    // game 1 role: REPLAY
        appearanceRoll,0.999999,// verified LCD appearance + expectation miss
        0.0,                    // game 2 role: REPLAY
        0.999999,               // post-game-2 LCD appearance: none
        0.0,                    // game 3 role: REPLAY
        0.999999                // post-game-3 LCD appearance: none
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

      const first=playOne();
      const second=playOne();
      const third=playOne();
      return {draws,first,second,third};
    };

    return {
      blue:run(0.00),
      red:run(0.10),
      seven:run(0.22)
    };
  });

  const cases = [
    ['blue','WEAK_BLUE','CHANCE_BLUE',13.9,5.1],
    ['red','MIDDLE_RED','CHANCE_RED',7.3,13.9],
    ['seven','STRONG_7','CHANCE_7',45.7,46.1]
  ];

  for(const [branchKey,lcdKey,holdType,denominator,expectationPct] of cases){
    const branch=result[branchKey];

    expect(branch.first.lever.role).toBe('REPLAY');
    expect(branch.first.result.mode).toBe('WANTED_CHANCE');
    expect(branch.first.result.wantedChanceRemaining).toBe(9);
    expect(branch.first.result.wantedChanceFrozen).toBe(false);
    expect(branch.first.result.wantedChanceResult).toBe('UNRESOLVED');
    expect(branch.first.result.lcdChance.totalHits).toBe(1);
    expect(branch.first.result.lcdChance.last).toMatchObject({
      key:lcdKey,
      mode:'WANTED_CHANCE',
      won:false,
      destination:null,
      denominator,
      expectationPct
    });
    expect(branch.first.result.holdQueue[0]).toMatchObject({
      type:holdType,
      source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
      reservedEvent:null
    });

    expect(branch.second.lever.role).toBe('REPLAY');
    expect(branch.second.result.consumedHold).toMatchObject({
      type:holdType,
      source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
      reservedEvent:null
    });
    expect(branch.second.result.mode).toBe('WANTED_CHANCE');
    expect(branch.second.result.wantedChanceRemaining).toBe(9);
    expect(branch.second.result.wantedChanceFrozen).toBe(true);
    expect(branch.second.result.wantedChanceResult).toBe('UNRESOLVED');
    expect(branch.second.result.pendingReward).toBeNull();
    expect(branch.second.result.event).toBe('WANTED_CHANCE_COUNTDOWN_FROZEN_CHANGED_HOLD_PENDING');
    expect(branch.second.result.lcdChance.totalHits).toBe(1);
    expect(branch.second.result.lcdChance.wantedHits).toBe(1);

    expect(branch.third.lever.role).toBe('REPLAY');
    expect(branch.third.result.consumedHold).toMatchObject({
      type:'NORMAL',
      source:'BASE',
      reservedEvent:null
    });
    expect(branch.third.result.mode).toBe('WANTED_CHANCE');
    expect(branch.third.result.wantedChanceRemaining).toBe(8);
    expect(branch.third.result.wantedChanceFrozen).toBe(false);
    expect(branch.third.result.wantedChanceResult).toBe('UNRESOLVED');
    expect(branch.third.result.pendingReward).toBeNull();
    expect(branch.third.result.event).toBe('WANTED_CHANCE_GAME_COUNTDOWN_MINUS_1');
    expect(branch.third.result.lcdChance.totalHits).toBe(1);
    expect(branch.third.result.lcdChance.wantedHits).toBe(1);

    // game1 role + LCD appearance/expectation miss + game2 role/no-LCD + game3 role/no-LCD.
    expect(branch.draws).toBe(7);
  }
});
