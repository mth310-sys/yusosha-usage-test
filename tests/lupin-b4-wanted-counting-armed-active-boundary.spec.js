import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED initial state moves COUNTING -> ARMED at zone min and ACTIVE exactly at target game', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const { NormalSystem } = await import('/test_lupin_b4/js/normal.js?v=step6bi-wanted-counting-armed-active-boundary1');

    const seq=[
      0.0,      // initial WANTED zone -> 1-32G
      0.999999, // uniform in-band target -> game 32
      0.999999, // initial Raiun points -> top end of verified initial range
      ...Array(32).fill(0.999999) // no Raiun point add through G32
    ];
    let draws=0;
    const rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
    const normal=new NormalSystem(rng,1);

    const snap=()=>({
      mode:normal.mode,
      wantedCount:normal.wantedCount,
      wantedTargetZone:{...normal.wantedTargetZone},
      wantedTargetGame:normal.wantedTargetGame,
      wantedState:normal.wantedState,
      wantedEntrySource:normal.wantedEntrySource,
      wantedChanceRemaining:normal.wantedChanceRemaining,
      holdCapacity:normal.holdCapacity,
      event:normal.lastEvent
    });

    const before=snap();
    normal.completeGame();
    const atZoneMin=snap();

    for(let game=2;game<=31;game+=1) normal.completeGame();
    const beforeTarget=snap();

    normal.completeGame();
    const atTarget=snap();

    return {draws,before,atZoneMin,beforeTarget,atTarget,holdQueue:normal.holdQueue?.snapshot() ?? []};
  });

  expect(result.before).toMatchObject({
    mode:'NORMAL',
    wantedCount:0,
    wantedTargetZone:{min:1,max:32,weight:6.3},
    wantedTargetGame:32,
    wantedState:'COUNTING',
    wantedEntrySource:null,
    wantedChanceRemaining:null,
    holdCapacity:null
  });

  expect(result.atZoneMin).toMatchObject({
    mode:'NORMAL',
    wantedCount:1,
    wantedTargetGame:32,
    wantedState:'ARMED',
    wantedEntrySource:null,
    wantedChanceRemaining:null,
    holdCapacity:null
  });

  expect(result.beforeTarget).toMatchObject({
    mode:'NORMAL',
    wantedCount:31,
    wantedTargetGame:32,
    wantedState:'ARMED',
    wantedEntrySource:null,
    wantedChanceRemaining:null,
    holdCapacity:null
  });

  expect(result.atTarget).toMatchObject({
    mode:'WANTED_CHANCE',
    wantedCount:32,
    wantedTargetGame:32,
    wantedState:'ACTIVE',
    wantedEntrySource:'VERIFIED_UNIFORM_TARGET_GAME_WITHIN_SELECTED_32G_BAND',
    wantedChanceRemaining:10,
    holdCapacity:8,
    event:'WANTED_CHANCE_START_VERIFIED_TARGET_GAME'
  });
  expect(result.holdQueue).toHaveLength(8);
  expect(result.holdQueue.every(hold=>hold.type==='NORMAL')).toBe(true);

  // 2 initial WANTED target draws + 1 initial Raiun draw + 32 normal-game Raiun add rolls.
  expect(result.draws).toBe(35);
});
