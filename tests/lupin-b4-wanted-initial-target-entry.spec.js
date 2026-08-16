import { test, expect } from '@playwright/test';

test('Lupin B4 enters WANTED CHANCE exactly when the verified initial target game is reached', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6bg-wanted-initial-target-entry1');

    const seq=[
      0.0,      // initial WANTED zone -> 1-32G
      0.0,      // uniform in-band target -> game 1
      0.999999, // initial Raiun points -> top end of verified initial range
      0.999999  // game 1 Raiun point-add roll -> no add
    ];
    let draws=0;
    const rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    const normal=new NormalSystem(rng,1);

    const before={
      mode:normal.mode,
      wantedCount:normal.wantedCount,
      wantedCycle:normal.wantedCycle,
      wantedTargetZone:{...normal.wantedTargetZone},
      wantedTargetGame:normal.wantedTargetGame,
      wantedTargetDistribution:normal.wantedTargetDistribution,
      wantedState:normal.wantedState,
      wantedEntrySource:normal.wantedEntrySource,
      wantedChanceRemaining:normal.wantedChanceRemaining,
      holdCapacity:normal.holdCapacity,
      holdQueue:normal.holdQueue
    };

    normal.completeGame();

    return {
      draws,
      before,
      after:{
        mode:normal.mode,
        wantedCount:normal.wantedCount,
        wantedCycle:normal.wantedCycle,
        wantedTargetZone:{...normal.wantedTargetZone},
        wantedTargetGame:normal.wantedTargetGame,
        wantedTargetDistribution:normal.wantedTargetDistribution,
        wantedState:normal.wantedState,
        wantedEntrySource:normal.wantedEntrySource,
        wantedChanceGameCount:normal.wantedChanceGameCount,
        wantedChanceRemaining:normal.wantedChanceRemaining,
        wantedChanceFrozen:normal.wantedChanceFrozen,
        wantedChanceResult:normal.wantedChanceResult,
        holdCapacity:normal.holdCapacity,
        holdQueue:normal.holdQueue?.snapshot() ?? [],
        event:normal.lastEvent
      }
    };
  });

  expect(result.before).toMatchObject({
    mode:'NORMAL',
    wantedCount:0,
    wantedCycle:'INITIAL',
    wantedTargetZone:{min:1,max:32,weight:6.3},
    wantedTargetGame:1,
    wantedTargetDistribution:'VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND',
    wantedState:'COUNTING',
    wantedEntrySource:null,
    wantedChanceRemaining:null,
    holdCapacity:null,
    holdQueue:null
  });

  expect(result.after).toMatchObject({
    mode:'WANTED_CHANCE',
    wantedCount:1,
    wantedCycle:'INITIAL',
    wantedTargetZone:{min:1,max:32,weight:6.3},
    wantedTargetGame:1,
    wantedTargetDistribution:'VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND',
    wantedState:'ACTIVE',
    wantedEntrySource:'VERIFIED_UNIFORM_TARGET_GAME_WITHIN_SELECTED_32G_BAND',
    wantedChanceGameCount:0,
    wantedChanceRemaining:10,
    wantedChanceFrozen:false,
    wantedChanceResult:'UNRESOLVED',
    holdCapacity:8,
    event:'WANTED_CHANCE_START_VERIFIED_TARGET_GAME'
  });
  expect(result.after.holdQueue).toHaveLength(8);
  expect(result.after.holdQueue.every(hold=>hold.type==='NORMAL')).toBe(true);

  // 2 initial WANTED target draws + 1 initial Raiun draw + 1 game-1 Raiun add roll.
  expect(result.draws).toBe(4);
});
