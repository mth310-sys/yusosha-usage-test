import { test, expect } from '@playwright/test';

test('Lupin B4 WANTED post-failure activation games expose verified setting hints only on eligible cycles', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/wanted-setting-hint-profile.js?v=step6aj-wanted-hint1');
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');
    const { GameLogger } = await import('/test_lupin_b4/js/logger.js?v=step6ak-wanted-hint-log1');

    const direct = {
      initial353: profile.getWantedSettingHintForTarget(353,'INITIAL'),
      post352: profile.getWantedSettingHintForTarget(352,'POST_WC_FAILURE'),
      post353: profile.getWantedSettingHintForTarget(353,'POST_WC_FAILURE'),
      post384: profile.getWantedSettingHintForTarget(384,'POST_WC_FAILURE'),
      post449: profile.getWantedSettingHintForTarget(449,'POST_WC_FAILURE'),
      post480: profile.getWantedSettingHintForTarget(480,'POST_WC_FAILURE')
    };

    const core2 = new GameCore({ setting:2, seed:0x6e1 });
    const s2Values=[0.78,0];
    core2.normal.rng={next:()=>s2Values.shift() ?? 0};
    core2.normal.resetAfterWantedFailure();
    const s2Snap=core2.normal.snapshot();
    core2.bet();
    core2.lever();
    core2.stopReel(0);
    core2.stopReel(1);
    const s2Game=core2.stopReel(2).result;
    const logger=new GameLogger();
    logger.push(s2Game);

    const core4 = new GameCore({ setting:4, seed:0x6e2 });
    const s4Values=[0.995,0];
    core4.normal.rng={next:()=>s4Values.shift() ?? 0};
    core4.normal.resetAfterWantedFailure();
    const s4Snap=core4.normal.snapshot();

    const initialCore = new GameCore({ setting:6, seed:0x6e3 });
    initialCore.normal.wantedTargetGame=449;
    initialCore.normal.wantedCycle='INITIAL';
    const initialSnap=initialCore.normal.snapshot();

    return { direct, s2Snap, s2Game, log:logger.toText(), s4Snap, initialSnap };
  });

  expect(result.direct.initial353).toBeNull();
  expect(result.direct.post352).toBeNull();
  expect(result.direct.post353).toMatchObject({min:353,max:384,targetGame:353,meaning:'SETTING_2_OR_HIGHER_CONFIRMED'});
  expect(result.direct.post384).toMatchObject({meaning:'SETTING_2_OR_HIGHER_CONFIRMED'});
  expect(result.direct.post449).toMatchObject({min:449,max:480,targetGame:449,meaning:'SETTING_4_OR_HIGHER_CONFIRMED'});
  expect(result.direct.post480).toMatchObject({meaning:'SETTING_4_OR_HIGHER_CONFIRMED'});

  expect(result.s2Snap.wantedCycle).toBe('POST_WC_FAILURE');
  expect(result.s2Snap.wantedTargetGame).toBe(353);
  expect(result.s2Snap.wantedTargetSettingHint).toMatchObject({
    targetGame:353,
    meaning:'SETTING_2_OR_HIGHER_CONFIRMED',
    source:'CROSS_SOURCE_PUBLISHED_POST_WC_ACTIVATION_GAME_HINTS'
  });
  expect(result.s2Game.wantedTargetSettingHint).toMatchObject({targetGame:353,meaning:'SETTING_2_OR_HIGHER_CONFIRMED'});
  expect(result.log).toContain('HINT_WANTED G353 / SETTING_2_OR_HIGHER_CONFIRMED');

  expect(result.s4Snap.wantedTargetGame).toBe(449);
  expect(result.s4Snap.wantedTargetSettingHint).toMatchObject({targetGame:449,meaning:'SETTING_4_OR_HIGHER_CONFIRMED'});
  expect(result.initialSnap.wantedTargetSettingHint).toBeNull();
});
