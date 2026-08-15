import { test, expect } from '@playwright/test';

test('Lupin B4 LCD setting hints use verified setting-specific rates and normal-only runtime', async ({ page }) => {
  await page.goto('/test_lupin_b4/');

  const result = await page.evaluate(async () => {
    const profile = await import('/test_lupin_b4/js/setting-hint-profile.js?v=step6ag-hint1');
    await import('/test_lupin_b4/js/mb-runtime-patch.js?v=step6ad-mb1');
    const { GameCore } = await import('/test_lupin_b4/js/game-core.js?v=step6w');

    const fake = value => ({ next: () => value });
    const direct = {
      s1: profile.drawLcdSettingHint(1, fake(0)),
      s2: profile.drawLcdSettingHint(2, fake(0)),
      s3: profile.drawLcdSettingHint(3, fake(0)),
      s4first: profile.drawLcdSettingHint(4, fake(0)),
      s4second: profile.drawLcdSettingHint(4, fake((1 / 31957) + 1e-8)),
      s5first: profile.drawLcdSettingHint(5, fake(0)),
      s5second: profile.drawLcdSettingHint(5, fake((1 / 34052) + 1e-8)),
      s6first: profile.drawLcdSettingHint(6, fake(0)),
      s6second: profile.drawLcdSettingHint(6, fake((1 / 28262) + 1e-8)),
      s6third: profile.drawLcdSettingHint(6, fake((2 / 28262) + 1e-8)),
      s2miss: profile.drawLcdSettingHint(2, fake((1 / 41597) + 1e-8))
    };

    const normalCore = new GameCore({ setting:2, seed:0x6b1 });
    normalCore.__lcdSettingHintRng = { next: () => 0 };
    normalCore.bet();
    normalCore.lever();
    normalCore.stopReel(0);
    normalCore.stopReel(1);
    const normalGame = normalCore.stopReel(2).result;

    const bonusCore = new GameCore({ setting:2, seed:0x6b2 });
    bonusCore.__lcdSettingHintRng = { next: () => 0 };
    bonusCore.lupinBonus.start('DEBUG_SETTING_HINT_EXCLUSION');
    bonusCore.bet();
    bonusCore.lever();
    bonusCore.stopReel(0);
    bonusCore.stopReel(1);
    const bonusGame = bonusCore.stopReel(2).result;

    return {
      entries4: profile.getLcdSettingHintEntries(4),
      entries6: profile.getLcdSettingHintEntries(6),
      direct,
      normalHint: normalGame.settingHint,
      bonusHint: bonusGame.settingHint,
      snapshot: normalCore.snapshot().lcdSettingHint
    };
  });

  expect(result.entries4).toEqual([
    { digits:'634', meaning:'SETTING_3_OR_4_OR_6_CONFIRMED', denominator:31957 },
    { digits:'456', meaning:'SETTING_4_OR_5_OR_6_CONFIRMED', denominator:42610 }
  ]);
  expect(result.entries6).toEqual([
    { digits:'526', meaning:'SETTING_2_OR_5_OR_6_CONFIRMED', denominator:28262 },
    { digits:'634', meaning:'SETTING_3_OR_4_OR_6_CONFIRMED', denominator:28262 },
    { digits:'456', meaning:'SETTING_4_OR_5_OR_6_CONFIRMED', denominator:47103 }
  ]);

  expect(result.direct.s1).toBeNull();
  expect(result.direct.s2.digits).toBe('526');
  expect(result.direct.s3.digits).toBe('634');
  expect(result.direct.s4first.digits).toBe('634');
  expect(result.direct.s4second.digits).toBe('456');
  expect(result.direct.s5first.digits).toBe('526');
  expect(result.direct.s5second.digits).toBe('456');
  expect(result.direct.s6first.digits).toBe('526');
  expect(result.direct.s6second.digits).toBe('634');
  expect(result.direct.s6third.digits).toBe('456');
  expect(result.direct.s2miss).toBeNull();

  expect(result.normalHint).toMatchObject({
    digits:'526',
    meaning:'SETTING_2_OR_5_OR_6_CONFIRMED',
    denominator:41597,
    source:'CROSS_SOURCE_PUBLISHED_LCD_SETTING_HINT_RATES'
  });
  expect(result.bonusHint).toBeNull();
  expect(result.snapshot.last.digits).toBe('526');
});
