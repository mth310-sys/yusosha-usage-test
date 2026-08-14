import { test, expect } from '@playwright/test';

test('Raiun-mode ceiling promotes to Shin Raiun + LEGEND GATE while other special contexts remain pending', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result=await page.evaluate(async()=>{
    const { GameCore }=await import('/test_lupin_b4/js/game-core.js?v=step6w');
    await import('/test_lupin_b4/js/ceiling-runtime-patch.js?v=step6ab-ceiling1');

    const finishOneGame=(core)=>{
      core.creditSystem.credit=1000;
      core.bet();core.lever();
      core.stopReel(0);core.stopReel(1);return core.stopReel(2).result;
    };

    const raiun=new GameCore({setting:1,seed:0x12345678});
    raiun.startRaiunModeForTest('RAIUN');
    raiun.ceiling={counter:498,targetGame:499,drawSource:'TEST',reached:false,reachedMode:null,resolution:'COUNTING',profile:null};
    const raiunResult=finishOneGame(raiun);

    const rize=new GameCore({setting:1,seed:0x87654321});
    rize.startRizeForTest('RIZE');
    rize.ceiling={counter:498,targetGame:499,drawSource:'TEST',reached:false,reachedMode:null,resolution:'COUNTING',profile:null};
    const rizeResult=finishOneGame(rize);

    return {
      raiun:{
        mode:raiunResult.mode,
        event:raiunResult.event,
        ceiling:raiunResult.ceiling,
        benefit:raiunResult.ceilingRaiunBenefit,
        normalMode:raiun.normal.mode,
        raiunVariant:raiun.normal.raiun.variant,
        raiunState:raiun.normal.raiun.state,
        legendGate:raiun.normal.legendGate,
        pending:raiunResult.ceilingSpecialContextPending??false
      },
      rize:{
        mode:rizeResult.mode,
        ceiling:rizeResult.ceiling,
        pending:rizeResult.ceilingSpecialContextPending??false,
        normalMode:rize.normal.mode
      }
    };
  });

  expect(result.raiun.mode).toBe('LEGEND_GATE');
  expect(result.raiun.event).toBe('CEILING_RAIUN_TO_SHIN_RAIUN_LEGEND_GATE_AUTO');
  expect(result.raiun.ceiling.reached).toBe(true);
  expect(result.raiun.ceiling.reachedMode).toBe('RAIUN_MODE');
  expect(result.raiun.ceiling.resolution).toBe('SHIN_RAIUN_LEGEND_GATE');
  expect(result.raiun.benefit.promotedVariant).toBe('SHIN_RAIUN');
  expect(result.raiun.benefit.legendGateGuaranteed).toBe(true);
  expect(result.raiun.normalMode).toBe('LEGEND_GATE');
  expect(result.raiun.raiunVariant).toBe('SHIN_RAIUN');
  expect(result.raiun.raiunState).toBe('LEGEND_GATE_ENTERED');
  expect(result.raiun.legendGate.state).toBe('ACTIVE_STOCK_ZONE');
  expect(result.raiun.pending).toBe(false);

  expect(result.rize.ceiling.reached).toBe(true);
  expect(result.rize.ceiling.resolution).toBe('SPECIAL_CONTEXT_PENDING');
  expect(result.rize.pending).toBe(true);
  expect(result.rize.normalMode).toBe('RIZE_ZONE');
});
