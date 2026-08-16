import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED LCD red/seven verified destinations route through real two-game flow', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ap-wanted-lcd-red-seven1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const playBranch = ({ appearanceRoll, destinationRoll }) => {
      const core = new GameCore({ setting:1, seed:12345 });
      const seq = [
        0.0,                         // game 1 role: REPLAY
        appearanceRoll,0.0,destinationRoll,
        0.0,                         // game 2 role: REPLAY
        0.5,0.5                      // used only if direct CZ starts
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

      const first=playOne();
      const second=playOne();
      return {draws,first,second};
    };

    return {
      redLb:playBranch({appearanceRoll:0.10,destinationRoll:0.00}),
      redFujiko:playBranch({appearanceRoll:0.10,destinationRoll:0.80}),
      redDorobo:playBranch({appearanceRoll:0.10,destinationRoll:0.95}),
      sevenLb:playBranch({appearanceRoll:0.22,destinationRoll:0.00}),
      sevenFujiko:playBranch({appearanceRoll:0.22,destinationRoll:0.92}),
      sevenDorobo:playBranch({appearanceRoll:0.22,destinationRoll:0.98})
    };
  });

  const cases = [
    ['redLb','MIDDLE_RED','CHANCE_RED','LB_OR_GT'],
    ['redFujiko','MIDDLE_RED','CHANCE_RED','FUJIKO_ZONE'],
    ['redDorobo','MIDDLE_RED','CHANCE_RED','DOROBO_ZONE'],
    ['sevenLb','STRONG_7','CHANCE_7','LB_OR_GT'],
    ['sevenFujiko','STRONG_7','CHANCE_7','FUJIKO_ZONE'],
    ['sevenDorobo','STRONG_7','CHANCE_7','DOROBO_ZONE']
  ];

  for(const [branchKey,lcdKey,holdType,destination] of cases){
    const branch=result[branchKey];
    expect(branch.first.lever.role).toBe('REPLAY');
    expect(branch.first.result.mode).toBe('WANTED_CHANCE');
    expect(branch.first.result.lcdChance.totalHits).toBe(1);
    expect(branch.first.result.lcdChance.wantedHits).toBe(1);
    expect(branch.first.result.lcdChance.last).toMatchObject({
      key:lcdKey,mode:'WANTED_CHANCE',won:true,destination
    });
    expect(branch.first.result.holdQueue[0]).toMatchObject({
      type:holdType,
      source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
      reservedEvent:destination
    });

    expect(branch.second.lever.role).toBe('REPLAY');
    expect(branch.second.result.consumedHold).toMatchObject({
      type:holdType,
      source:'VERIFIED_WANTED_LCD_CHANCE_AUTO',
      reservedEvent:destination
    });
    expect(branch.second.result.wantedChanceResult).toBe('SUCCESS_ROUTE');
    expect(branch.second.result.lcdChance.totalHits).toBe(1);
    expect(branch.second.result.lcdChance.wantedHits).toBe(1);

    if(destination==='LB_OR_GT'){
      expect(branch.second.result.mode).toBe('LUPIN_BONUS');
      expect(branch.second.result.event).toBe('NEXT_INITIAL_HIT_LUPIN_BONUS_AUTO');
      expect(branch.second.result.nextInitialHit.consumed).toBe(1);
      expect(branch.second.result.nextInitialHit.lastResolution.type).toBe('LUPIN_BONUS');
      expect(branch.draws).toBe(5);
    }else{
      expect(branch.second.result.mode).toBe(destination);
      expect(branch.second.result.event).toBe(`ENTER_${destination}`);
      expect(branch.second.result.cz).toMatchObject({
        type:destination,
        state:'ACTIVE',
        result:'UNRESOLVED',
        successModel:'UNIMPLEMENTED_PER_GAME_RATE_UNKNOWN',
        transitionSource:`HOLD_${holdType}`
      });
      expect(branch.second.result.pendingReward).toBeNull();
      expect(branch.draws).toBe(7);
    }
  }
});
