import { test, expect } from '@playwright/test';

test('verified normal-stage table is used only after RIZE premonition failure return', async ({ page }) => {
  await page.goto('/test_lupin_b4/');
  const result=await page.evaluate(async()=>{
    const { drawNormalStageAfterPremonition }=await import('/test_lupin_b4/js/normal-stage-profile.js?v=step6ad-stage1');
    const { NormalSystem }=await import('/test_lupin_b4/js/normal.js?v=step6w');
    await import('/test_lupin_b4/js/normal-stage-runtime-patch.js?v=step6ad-normal-stage1');

    const stub=(value)=>({next:()=>value});
    const boundaries={
      s1Lupin:drawNormalStageAfterPremonition(1,stub(0)),
      s1Jigen:drawNormalStageAfterPremonition(1,stub(0.34)),
      s1Goemon:drawNormalStageAfterPremonition(1,stub(0.68)),
      s6Lupin:drawNormalStageAfterPremonition(6,stub(0)),
      s6Jigen:drawNormalStageAfterPremonition(6,stub(0.42)),
      s6Goemon:drawNormalStageAfterPremonition(6,stub(0.68))
    };

    const rize=new NormalSystem({next:()=>0.99},6);
    rize.startRizeZone('RIZE','TEST_PREMONITION');
    rize.resolveRizeForTest('FAIL');
    const seq=[0.42,0.99,0.99,0.99];let i=0;
    rize.rng.next=()=>seq[i++]??0.99;
    const rizeAfter=rize.completeGame();

    const cz=new NormalSystem({next:()=>0.99},6);
    cz.startCz('DOROBO_ZONE','TEST_CZ');
    cz.resolveCzForTest('FAIL');
    cz.rng.next=()=>0.99;
    const czAfter=cz.completeGame();

    return {boundaries,rizeAfter,czAfter};
  });

  expect(result.boundaries).toEqual({
    s1Lupin:'LUPIN',s1Jigen:'JIGEN',s1Goemon:'GOEMON',
    s6Lupin:'LUPIN',s6Jigen:'JIGEN',s6Goemon:'GOEMON'
  });

  expect(result.rizeAfter.mode).toBe('NORMAL');
  expect(result.rizeAfter.rize).toBeNull();
  expect(result.rizeAfter.normalStage).toBe('JIGEN');
  expect(result.rizeAfter.normalStageSource).toBe('VERIFIED_PREMONITION_END_SETTING_TABLE_RIZE_FAILURE');
  expect(result.rizeAfter.lastEvent).toBe('RIZE_FAILURE_RETURN_JIGEN_STAGE');

  expect(result.czAfter.mode).toBe('NORMAL');
  expect(result.czAfter.normalStage).toBeNull();
  expect(result.czAfter.normalStageSource).toBeNull();
});
