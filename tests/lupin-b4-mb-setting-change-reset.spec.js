import { test, expect } from '@playwright/test';

async function forceMb(core){
  core.bet();
  core.lever();
  core.pendingRole={name:'MB',payout:0,replay:false};
  core.lastRole=core.pendingRole;
  core.reels.start(core.pendingRole);
  core.stopReel(0);
  core.stopReel(1);
  return core.stopReel(2).result;
}

function completeGame(core){
  core.bet();
  const lever=core.lever();
  core.stopReel(0);
  core.stopReel(1);
  const result=core.stopReel(2).result;
  return {lever,result};
}

test('Lupin B4 setting change clears pending MB continuation only when the change succeeds', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const resetCore=new GameCore({setting:1,seed:0x6b01});
    const resetMb=await (async()=>{
      resetCore.bet();
      resetCore.lever();
      resetCore.pendingRole={name:'MB',payout:0,replay:false};
      resetCore.lastRole=resetCore.pendingRole;
      resetCore.reels.start(resetCore.pendingRole);
      resetCore.stopReel(0); resetCore.stopReel(1);
      return resetCore.stopReel(2).result;
    })();
    const beforeReset=resetCore.snapshot().mb;
    const settingChanged=resetCore.setSetting(2);
    const afterReset=resetCore.snapshot().mb;
    resetCore.rng.next=()=>0.999999;
    resetCore.bet();
    const resetLever=resetCore.lever();
    resetCore.stopReel(0); resetCore.stopReel(1);
    const resetNext=resetCore.stopReel(2).result;

    const failedCore=new GameCore({setting:1,seed:0x6b02});
    failedCore.bet();
    failedCore.lever();
    failedCore.pendingRole={name:'MB',payout:0,replay:false};
    failedCore.lastRole=failedCore.pendingRole;
    failedCore.reels.start(failedCore.pendingRole);
    failedCore.stopReel(0); failedCore.stopReel(1); failedCore.stopReel(2);
    failedCore.bet();
    const settingRejected=failedCore.setSetting(2);
    const beforeForcedLever=failedCore.snapshot().mb;
    const forcedLever=failedCore.lever();
    failedCore.stopReel(0); failedCore.stopReel(1);
    const forcedNext=failedCore.stopReel(2).result;

    return {
      resetMb:resetMb.mb,
      beforeReset,
      settingChanged,
      afterReset,
      resetLever,
      resetNext:{role:resetNext.role,mb:resetNext.mb},
      settingRejected,
      beforeForcedLever,
      forcedLever,
      forcedNext:{role:forcedNext.role,mb:forcedNext.mb}
    };
  });

  expect(result.resetMb).toMatchObject({state:'ACTIVE',remainingGames:2});
  expect(result.beforeReset).toMatchObject({state:'ACTIVE',remainingGames:2});
  expect(result.settingChanged).toBe(true);
  expect(result.afterReset).toMatchObject({state:'IDLE',remainingGames:0});
  expect(result.resetLever.role).toBe('MISS');
  expect(result.resetNext.role).toBe('MISS');
  expect(result.resetNext.mb).toMatchObject({state:'IDLE',remainingGames:0});

  expect(result.settingRejected).toBe(false);
  expect(result.beforeForcedLever).toMatchObject({state:'ACTIVE',remainingGames:2});
  expect(result.forcedLever).toMatchObject({role:'10COIN',mbContinuation:true,mbRemainingGames:1});
  expect(result.forcedNext.role).toBe('10COIN');
  expect(result.forcedNext.mb).toMatchObject({state:'ACTIVE',remainingGames:1});
});
