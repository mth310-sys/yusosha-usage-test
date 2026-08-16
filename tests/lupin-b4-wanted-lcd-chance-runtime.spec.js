import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED CHANCE uses one verified LCD lottery without future-hold preroll', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6am-wanted-lcd-unified1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const run = (seq) => {
      const core = new GameCore({ setting:1, seed:12345 });
      let draws=0;
      core.rng={next:()=>{draws+=1;return seq.shift() ?? 0.999999;}};
      core.normal.startWantedChance();
      const before=core.normal.holdQueue.snapshot();
      const hit=core.processWantedLcdChance();
      const after=core.normal.holdQueue.snapshot();
      return {
        draws,
        hit,
        before,
        after,
        lcd:core.lcdChanceSnapshot(),
        source:core.normal.wantedLcdChanceSource,
        visualPolicy:core.normal.wantedLcdVisualPolicy
      };
    };

    return {
      win:run([0.0,0.0,0.0]),
      miss:run([0.0,0.999999])
    };
  });

  expect(result.win.draws).toBe(3);
  expect(result.win.before).toHaveLength(8);
  expect(result.win.before.every(h=>h.type==='NORMAL')).toBe(true);
  expect(result.win.after).toHaveLength(8);
  expect(result.win.after[0].type).toBe('CHANCE_BLUE');
  expect(result.win.after[0].source).toBe('VERIFIED_WANTED_LCD_CHANCE_AUTO');
  expect(result.win.after[0].reservedEvent).toBe('LB_OR_GT');
  expect(result.win.after[0].lcdChance).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:'LB_OR_GT',denominator:13.9,expectationPct:5.1
  });
  expect(result.win.hit).toMatchObject({key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:true,destination:'LB_OR_GT'});

  expect(result.miss.draws).toBe(2);
  expect(result.miss.before.every(h=>h.type==='NORMAL')).toBe(true);
  expect(result.miss.after[0].type).toBe('CHANCE_BLUE');
  expect(result.miss.after[0].reservedEvent).toBeNull();
  expect(result.miss.after[0].lcdChance).toMatchObject({
    key:'WEAK_BLUE',mode:'WANTED_CHANCE',won:false,destination:null,denominator:13.9,expectationPct:5.1
  });

  for(const branch of [result.win,result.miss]){
    expect(branch.source).toBe('VERIFIED_WANTED_LCD_CHANCE_APPEARANCE_EXPECTATION_DESTINATION_TABLE');
    expect(branch.visualPolicy).toBe('VISUAL_STEPUP_DISTRIBUTION_UNVERIFIED');
    expect(branch.lcd.wantedSource).toBe('VERIFIED_WANTED_LCD_CHANCE_APPEARANCE_EXPECTATION_DESTINATION_TABLE');
    expect(branch.lcd.wantedVisualPolicy).toBe('VISUAL_STEPUP_DISTRIBUTION_UNVERIFIED');
    expect(branch.lcd.wantedRuntimeModel).toBe('ONE_VERIFIED_LOTTERY_PER_GAME_NO_FUTURE_HOLD_PREROLL');
  }
});
