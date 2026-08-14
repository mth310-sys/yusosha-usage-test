import { test, expect } from '@playwright/test';

test('Lupin B4 setting change resets Raiun counter to 0 only when setting change succeeds', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    const core = new GameCore({ setting:1, seed:0x6ae });

    core.normal.raiun.points=87;
    core.normal.raiun.lastPointAdd=5;
    core.normal.raiun.pointAddEvents=9;
    core.normal.raiun.state='COUNTING';
    const changed=core.setSetting(4);
    const afterSuccess={
      setting:core.setting,
      points:core.normal.raiun.points,
      lastPointAdd:core.normal.raiun.lastPointAdd,
      pointAddEvents:core.normal.raiun.pointAddEvents,
      state:core.normal.raiun.state,
      resultSource:core.normal.raiun.resultSource,
      lastEvent:core.normal.lastEvent
    };

    core.normal.raiun.points=61;
    core.bet();
    core.lever();
    const rejected=core.setSetting(6);
    const afterRejected={setting:core.setting,points:core.normal.raiun.points,phase:core.phase};

    return {changed,rejected,afterSuccess,afterRejected};
  });

  expect(result.changed).toBe(true);
  expect(result.afterSuccess).toMatchObject({
    setting:4,
    points:0,
    lastPointAdd:0,
    pointAddEvents:0,
    state:'COUNTING',
    resultSource:'SETTING_CHANGE_VERIFIED_COUNTER_RESET',
    lastEvent:'SETTING_CHANGE_RAIUN_COUNTER_RESET_0PT'
  });

  expect(result.rejected).toBe(false);
  expect(result.afterRejected).toMatchObject({setting:4,points:61,phase:'SPINNING'});
});
