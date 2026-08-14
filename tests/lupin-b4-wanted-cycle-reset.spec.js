import { test, expect } from '@playwright/test';

test('WANTED cycle resets to the verified INITIAL table after LB/ART end and setting change without touching Raiun state', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result=await page.evaluate(async()=>{
    const { GameCore }=await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/ceiling-runtime-patch.js?v=step6ab-ceiling1');
    await import('/test_lupin_b4/js/wanted-cycle-reset-patch.js?v=step6ac-wanted-reset1');

    const prep=(core)=>{
      core.normal.wantedCount=317;
      core.normal.wantedCycle='POST_WC_FAILURE';
      core.normal.wantedTargetZone={min:417,max:448,weight:19.5};
      core.normal.wantedTargetGame=441;
      core.normal.wantedTargetDistribution='VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND';
      core.normal.wantedHardMaxGame=480;
      core.normal.wantedState='ARMED';
      core.normal.wantedChanceResult='FAIL';
      core.normal.raiun.points=73;
      core.normal.raiun.state='COUNTING';
    };
    const capture=(core)=>({
      wantedCount:core.normal.wantedCount,
      wantedCycle:core.normal.wantedCycle,
      targetGame:core.normal.wantedTargetGame,
      zoneMin:core.normal.wantedTargetZone?.min,
      zoneMax:core.normal.wantedTargetZone?.max,
      distribution:core.normal.wantedTargetDistribution,
      hardMax:core.normal.wantedHardMaxGame,
      wantedState:core.normal.wantedState,
      wantedResult:core.normal.wantedChanceResult,
      entrySource:core.normal.wantedEntrySource,
      raiunPoints:core.normal.raiun.points,
      raiunState:core.normal.raiun.state
    });

    const lb=new GameCore({setting:1,seed:123});prep(lb);lb.drawNextInitialHitReservation('LUPIN_BONUS_END_VERIFIED_TIMING');
    const art=new GameCore({setting:6,seed:456});prep(art);art.drawNextInitialHitReservation('ART_END_VERIFIED_TIMING');
    const setting=new GameCore({setting:4,seed:789});prep(setting);setting.drawNextInitialHitReservation('SETTING_CHANGE_DEBUG_REDRAW');

    return {lb:capture(lb),art:capture(art),setting:capture(setting)};
  });

  for(const x of [result.lb,result.art,result.setting]){
    expect(x.wantedCount).toBe(0);
    expect(x.wantedCycle).toBe('INITIAL');
    expect(x.targetGame).toBeGreaterThanOrEqual(1);
    expect(x.targetGame).toBeLessThanOrEqual(480);
    expect(x.zoneMin).toBeGreaterThanOrEqual(1);
    expect(x.zoneMax).toBeLessThanOrEqual(480);
    expect(x.targetGame).toBeGreaterThanOrEqual(x.zoneMin);
    expect(x.targetGame).toBeLessThanOrEqual(x.zoneMax);
    expect(x.distribution).toBe('VERIFIED_UNIFORM_WITHIN_SELECTED_32G_BAND');
    expect(x.hardMax).toBe(480);
    expect(x.wantedState).toBe('COUNTING');
    expect(x.wantedResult).toBe('UNRESOLVED');
    expect(x.raiunPoints).toBe(73);
    expect(x.raiunState).toBe('COUNTING');
  }
  expect(result.lb.entrySource).toContain('LUPIN_BONUS_END_VERIFIED_TIMING');
  expect(result.art.entrySource).toContain('ART_END_VERIFIED_TIMING');
  expect(result.setting.entrySource).toContain('SETTING_CHANGE_DEBUG_REDRAW');
});
